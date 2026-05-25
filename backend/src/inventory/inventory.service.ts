import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  role: 'ADMIN' | 'COORDINATOR' | 'OFFICIAL';
};

type CreateKitEntryDto = {
  quantity: number;
  initialNumber: string;
  finalNumber: string;
  notes?: string;
};

type TransferKitsDto = {
  officialId: string;
  initialNumber: string;
  finalNumber: string;
  notes?: string;
};

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureAdmin(user: AuthUser) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem realizar esta ação.',
      );
    }
  }

  private generateNumbers(initialNumber: string, finalNumber: string) {
    const start = Number(initialNumber);
    const end = Number(finalNumber);

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new BadRequestException(
        'Número inicial e final devem ser numéricos.',
      );
    }

    if (end < start) {
      throw new BadRequestException(
        'Número final deve ser maior ou igual ao inicial.',
      );
    }

    const paddingSize = Math.max(initialNumber.length, finalNumber.length);
    const numbers: string[] = [];

    for (let current = start; current <= end; current += 1) {
      numbers.push(String(current).padStart(paddingSize, '0'));
    }

    return numbers;
  }

  async getSummary() {
    const [
      total,
      disponivel,
      comDco,
      vinculadoJogo,
      utilizado,
      cancelado,
      byDco,
    ] = await Promise.all([
      this.prisma.kit.count(),
      this.prisma.kit.count({ where: { status: 'DISPONIVEL' } }),
      this.prisma.kit.count({ where: { status: 'COM_DCO' } }),
      this.prisma.kit.count({ where: { status: 'VINCULADO_JOGO' } }),
      this.prisma.kit.count({ where: { status: 'UTILIZADO' } }),
      this.prisma.kit.count({ where: { status: 'CANCELADO' } }),
      this.prisma.official.findMany({
        where: {
          kits: {
            some: {
              status: {
                in: ['COM_DCO', 'VINCULADO_JOGO'],
              },
            },
          },
        },
        select: {
          id: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          kits: {
            where: {
              status: {
                in: ['COM_DCO', 'VINCULADO_JOGO'],
              },
            },
            select: {
              id: true,
              number: true,
              status: true,
            },
            orderBy: {
              number: 'asc',
            },
          },
        },
        orderBy: {
          user: {
            name: 'asc',
          },
        },
      }),
    ]);

    return {
      total,
      disponivel,
      comDco,
      vinculadoJogo,
      utilizado,
      cancelado,
      byDco: byDco.map((official) => ({
        officialId: official.id,
        name: official.user.name,
        email: official.user.email,
        total: official.kits.length,
        kits: official.kits,
      })),
    };
  }

  async listKits(query: {
    status?: string;
    officialId?: string;
    number?: string;
  }) {
    return this.prisma.kit.findMany({
      where: {
        ...(query.status ? { status: query.status as any } : {}),
        ...(query.officialId ? { currentOfficialId: query.officialId } : {}),
        ...(query.number
          ? {
              number: {
                contains: query.number,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      include: {
        currentOfficial: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        matchKits: {
          include: {
            match: {
              select: {
                id: true,
                homeTeam: true,
                awayTeam: true,
                matchDate: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        number: 'asc',
      },
    });
  }

  async createEntry(user: AuthUser, data: CreateKitEntryDto) {
    this.ensureAdmin(user);

    const quantity = Number(data.quantity);
    const numbers = this.generateNumbers(data.initialNumber, data.finalNumber);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero.');
    }

    if (numbers.length !== quantity) {
      throw new BadRequestException(
        `Quantidade informada não bate com a sequência. Sequência possui ${numbers.length} kit(s).`,
      );
    }

    const existingKits = await this.prisma.kit.findMany({
      where: {
        number: {
          in: numbers,
        },
      },
      select: {
        number: true,
      },
    });

    if (existingKits.length > 0) {
      throw new BadRequestException(
        `Já existem kits cadastrados nesta sequência: ${existingKits
          .map((kit) => kit.number)
          .join(', ')}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.kit.createMany({
        data: numbers.map((number) => ({
          number,
          status: 'DISPONIVEL',
        })),
      });

      const createdKits = await tx.kit.findMany({
        where: {
          number: {
            in: numbers,
          },
        },
        select: {
          id: true,
          number: true,
        },
      });

      await tx.kitMovement.createMany({
        data: createdKits.map((kit) => ({
          kitId: kit.id,
          type: 'ENTRADA_ESTOQUE',
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          notes:
            data.notes ||
            `Entrada de estoque: ${data.initialNumber} até ${data.finalNumber}`,
        })),
      });

      return {
        message: 'Entrada de kits cadastrada com sucesso.',
        quantity: createdKits.length,
        initialNumber: data.initialNumber,
        finalNumber: data.finalNumber,
        kits: createdKits.sort((a, b) => a.number.localeCompare(b.number)),
      };
    });
  }

  async transferToDco(user: AuthUser, data: TransferKitsDto) {
    this.ensureAdmin(user);

    const numbers = this.generateNumbers(data.initialNumber, data.finalNumber);

    const official = await this.prisma.official.findUnique({
      where: {
        id: data.officialId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!official) {
      throw new NotFoundException('DCO não encontrado.');
    }

    if (!official.active) {
      throw new BadRequestException(
        'Não é possível repassar kits para um DCO inativo.',
      );
    }

    const kits = await this.prisma.kit.findMany({
      where: {
        number: {
          in: numbers,
        },
      },
      select: {
        id: true,
        number: true,
        status: true,
        currentOfficialId: true,
      },
    });

    if (kits.length !== numbers.length) {
      const foundNumbers = kits.map((kit) => kit.number);
      const missingNumbers = numbers.filter(
        (number) => !foundNumbers.includes(number),
      );

      throw new BadRequestException(
        `Alguns kits não existem no estoque: ${missingNumbers.join(', ')}`,
      );
    }

    const unavailableKits = kits.filter((kit) => kit.status !== 'DISPONIVEL');

    if (unavailableKits.length > 0) {
      throw new BadRequestException(
        `Alguns kits não estão disponíveis: ${unavailableKits
          .map((kit) => `${kit.number} (${kit.status})`)
          .join(', ')}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.kit.updateMany({
        where: {
          id: {
            in: kits.map((kit) => kit.id),
          },
        },
        data: {
          status: 'COM_DCO',
          currentOfficialId: data.officialId,
        },
      });

      await tx.kitMovement.createMany({
        data: kits.map((kit) => ({
          kitId: kit.id,
          type: 'REPASSE_DCO',
          toOfficialId: data.officialId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          notes:
            data.notes ||
            `Repasse para DCO ${official.user.name}: ${data.initialNumber} até ${data.finalNumber}`,
        })),
      });

      return {
        message: 'Kits repassados para o DCO com sucesso.',
        official: {
          id: official.id,
          name: official.user.name,
          email: official.user.email,
        },
        quantity: kits.length,
        kits: kits
          .map((kit) => ({
            id: kit.id,
            number: kit.number,
          }))
          .sort((a, b) => a.number.localeCompare(b.number)),
      };
    });
  }

  async listMyKits(user: AuthUser) {
    const official = await this.prisma.official.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!official) {
      return [];
    }

    return this.prisma.kit.findMany({
      where: {
        currentOfficialId: official.id,
        status: {
          in: ['COM_DCO', 'VINCULADO_JOGO'],
        },
      },
      orderBy: {
        number: 'asc',
      },
    });
  }

  async listKitsByOfficial(officialId: string) {
    return this.prisma.kit.findMany({
      where: {
        currentOfficialId: officialId,
      },
      include: {
        currentOfficial: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        number: 'asc',
      },
    });
  }

  async listMovements(kitId?: string) {
    return this.prisma.kitMovement.findMany({
      where: {
        ...(kitId ? { kitId } : {}),
      },
      include: {
        kit: true,
        fromOfficial: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        toOfficial: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        match: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
            matchDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}