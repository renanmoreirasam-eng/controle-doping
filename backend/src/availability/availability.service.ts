import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  private getUserId(user: any) {
    return user?.id || user?.sub || user?.userId || user?.user?.id || null;
  }

  private getRole(user: any) {
    return String(user?.role || user?.user?.role || '').trim().toUpperCase();
  }

  private assertAllowedRole(user: any) {
    if (!['ADMIN', 'COORDINATOR', 'OFFICIAL'].includes(this.getRole(user))) {
      throw new ForbiddenException('Você não possui permissão para gerenciar disponibilidade.');
    }
  }

  private parseDateOnly(value: string) {
    const normalized = String(value || '').trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      throw new BadRequestException('Informe uma data válida no formato AAAA-MM-DD.');
    }

    const date = new Date(`${normalized}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== normalized) {
      throw new BadRequestException('Data inválida.');
    }

    return date;
  }

  private assertDateNotPast(date: Date) {
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    if (date.getTime() < today.getTime()) {
      throw new BadRequestException(
        'Datas anteriores a hoje não podem mais ser alteradas.',
      );
    }
  }

  private getMonthRange(month?: string) {
    const normalized = String(month || '').trim();
    if (!normalized) return null;

    if (!/^\d{4}-\d{2}$/.test(normalized)) {
      throw new BadRequestException('Mês inválido. Use AAAA-MM.');
    }

    const [year, monthNumber] = normalized.split('-').map(Number);

    if (monthNumber < 1 || monthNumber > 12) {
      throw new BadRequestException('Mês inválido.');
    }

    return {
      start: new Date(Date.UTC(year, monthNumber - 1, 1)),
      end: new Date(Date.UTC(year, monthNumber, 1)),
    };
  }

  async listAll(user: any, month?: string) {
    if (this.getRole(user) !== 'ADMIN') {
      throw new ForbiddenException(
        'Somente administradores podem consultar todas as indisponibilidades.',
      );
    }

    const range = this.getMonthRange(month);

    return this.prisma.userUnavailability.findMany({
      where: {
        ...(range ? { date: { gte: range.start, lt: range.end } } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { userId: 'asc' },
        { date: 'asc' },
      ],
    });
  }

  async listMine(user: any, month?: string) {
    this.assertAllowedRole(user);
    const userId = this.getUserId(user);

    if (!userId) throw new ForbiddenException('Usuário não identificado.');

    const range = this.getMonthRange(month);

    return this.prisma.userUnavailability.findMany({
      where: {
        userId,
        ...(range ? { date: { gte: range.start, lt: range.end } } : {}),
      },
      orderBy: { date: 'asc' },
    });
  }

  async create(user: any, data: { date: string; note?: string }) {
    this.assertAllowedRole(user);
    const userId = this.getUserId(user);

    if (!userId) throw new ForbiddenException('Usuário não identificado.');

    const date = this.parseDateOnly(data.date);
    this.assertDateNotPast(date);

    const note = String(data.note || '').trim() || null;

    const existing = await this.prisma.userUnavailability.findUnique({
      where: { userId_date: { userId, date } },
    });

    if (existing) return existing;

    return this.prisma.userUnavailability.create({
      data: { userId, date, note },
    });
  }

  async remove(user: any, id: string) {
    this.assertAllowedRole(user);

    const userId = this.getUserId(user);
    const isAdmin = this.getRole(user) === 'ADMIN';

    if (!userId) throw new ForbiddenException('Usuário não identificado.');

    const item = await this.prisma.userUnavailability.findUnique({ where: { id } });

    if (!item) throw new NotFoundException('Indisponibilidade não encontrada.');

    this.assertDateNotPast(item.date);

    if (!isAdmin && item.userId !== userId) {
      throw new ForbiddenException('Você não pode remover a indisponibilidade de outro usuário.');
    }

    await this.prisma.userUnavailability.delete({ where: { id } });

    return { success: true, id };
  }

  async checkOfficial(user: any, officialId: string, dateValue: string) {
    if (!['ADMIN', 'COORDINATOR'].includes(this.getRole(user))) {
      throw new ForbiddenException('Somente administradores e coordenadores podem consultar disponibilidade de terceiros.');
    }

    const date = this.parseDateOnly(dateValue);

    const official = await this.prisma.official.findUnique({
      where: { id: officialId },
      select: {
        id: true,
        userId: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!official) throw new NotFoundException('Oficial não encontrado.');

    const unavailability = await this.prisma.userUnavailability.findUnique({
      where: { userId_date: { userId: official.userId, date } },
    });

    return {
      officialId: official.id,
      userId: official.userId,
      name: official.user?.name || '',
      date: dateValue,
      unavailable: Boolean(unavailability),
      unavailability,
    };
  }
}
