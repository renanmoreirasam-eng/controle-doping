import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Controle@123';

function parseDateBR(value: string): Date | null {
  const clean = value.trim();

  if (!clean) return null;

  const [day, month, year] = clean.split('/').map(Number);

  if (!day || !month || !year) return null;

  return new Date(Date.UTC(year, month - 1, day));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeOperationalRole(value: string) {
  const clean = value.trim().toUpperCase();

  if (clean === 'DCO') return 'DCO';
  if (clean === 'ESCOLTA') return 'ESCOLTA';

  return clean || null;
}

async function main() {
  const filePath = path.resolve(process.cwd(), 'import-officials.tsv');

  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');

  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error('Arquivo import-officials.tsv está vazio.');
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const result = await prisma.$transaction(async (tx) => {
    const nonAdminUsers = await tx.user.findMany({
      where: {
        role: {
          not: UserRole.ADMIN,
        },
      },
      select: {
        id: true,
        official: {
          select: {
            id: true,
          },
        },
      },
    });

    const nonAdminUserIds = nonAdminUsers.map((user) => user.id);
    const officialIds = nonAdminUsers
      .map((user) => user.official?.id)
      .filter(Boolean) as string[];

    if (nonAdminUserIds.length > 0) {
      await tx.pushSubscription.deleteMany({
        where: {
          userId: {
            in: nonAdminUserIds,
          },
        },
      });
    }

    if (officialIds.length > 0) {
      await tx.matchKit.deleteMany({
        where: {
          officialId: {
            in: officialIds,
          },
        },
      });

      await tx.matchOfficial.deleteMany({
        where: {
          officialId: {
            in: officialIds,
          },
        },
      });

      await tx.kit.updateMany({
        where: {
          currentOfficialId: {
            in: officialIds,
          },
        },
        data: {
          currentOfficialId: null,
          status: 'DISPONIVEL',
        },
      });

      await tx.kitMovement.updateMany({
        where: {
          fromOfficialId: {
            in: officialIds,
          },
        },
        data: {
          fromOfficialId: null,
        },
      });

      await tx.kitMovement.updateMany({
        where: {
          toOfficialId: {
            in: officialIds,
          },
        },
        data: {
          toOfficialId: null,
        },
      });

      await tx.official.deleteMany({
        where: {
          id: {
            in: officialIds,
          },
        },
      });
    }

    if (nonAdminUserIds.length > 0) {
      await tx.user.deleteMany({
        where: {
          id: {
            in: nonAdminUserIds,
          },
        },
      });
    }

    let created = 0;
    const errors: string[] = [];

    for (const line of lines) {
      const columns = line.split('\t').map((item) => item.trim());

      if (columns.length < 10) {
        errors.push(`Linha ignorada por ter menos de 10 colunas: ${line}`);
        continue;
      }

      const [
        name,
        documentType,
        documentNumber,
        cpf,
        birthDate,
        phone,
        email,
        address,
        shirtSize,
        operationalRole,
      ] = columns;

      const normalizedEmail = normalizeEmail(email);

      if (!name || !normalizedEmail) {
        errors.push(`Linha ignorada por nome/e-mail inválido: ${line}`);
        continue;
      }

      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: passwordHash,
          role: UserRole.OFFICIAL,
        },
      });

      await tx.official.create({
        data: {
          userId: user.id,
          phone: phone || null,
          pixKey: null,
          documentType: documentType || null,
          documentNumber: documentNumber || null,
          cpf: cpf || null,
          birthDate: parseDateBR(birthDate),
          address: address || null,
          shirtSize: shirtSize || null,
          operationalRole: normalizeOperationalRole(operationalRole),
          personalDataUpdatedAt: new Date(),
          active: true,
        },
      });

      created += 1;
    }

    return {
      removedUsers: nonAdminUserIds.length,
      removedOfficials: officialIds.length,
      created,
      errors,
    };
  });

  console.log('Carga finalizada com sucesso.');
  console.log(`Usuários não ADMIN removidos: ${result.removedUsers}`);
  console.log(`Oficiais antigos removidos: ${result.removedOfficials}`);
  console.log(`Novos oficiais criados: ${result.created}`);
  console.log(`Senha inicial padrão: ${DEFAULT_PASSWORD}`);

  if (result.errors.length > 0) {
    console.log('Ocorrências:');
    for (const error of result.errors) {
      console.log(`- ${error}`);
    }
  }
}

main()
  .catch((error) => {
    console.error('Erro na carga:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });