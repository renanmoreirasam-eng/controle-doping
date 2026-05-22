import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type SubstitutionPayload = {
  team: string;
  playerOutName?: string;
  playerOutNumber: string;
  playerInName?: string;
  playerInNumber: string;
  minute?: number;
  period?: string;
  notes?: string;
};

@Injectable()
export class SubstitutionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    matchId: string;
    team: string;
    playerOutName: string;
    playerOutNumber: string;
    playerInName: string;
    playerInNumber: string;
    minute?: number;
    period?: string;
    notes?: string;
  }) {
    return this.prisma.substitution.create({
      data,
      include: {
        match: {
          include: {
            championship: true,
            stadium: true,
          },
        },
      },
    });
  }

  async replaceForMatch(
    matchId: string,
    substitutions: SubstitutionPayload[],
  ) {
    if (!matchId) {
      throw new BadRequestException('Informe o jogo.');
    }

    const validSubstitutions = substitutions
      .map((item) => ({
        team: String(item.team || '').trim(),
        playerOutName: String(item.playerOutName || '').trim(),
        playerOutNumber: String(item.playerOutNumber || '').trim(),
        playerInName: String(item.playerInName || '').trim(),
        playerInNumber: String(item.playerInNumber || '').trim(),
        minute: item.minute,
        period: item.period || 'JOGO',
        notes: item.notes,
      }))
      .filter(
        (item) =>
          item.team &&
          item.playerOutNumber &&
          item.playerInNumber,
      );

    for (const item of validSubstitutions) {
      if (!item.playerOutNumber || !item.playerInNumber) {
        throw new BadRequestException(
          'Preencha Nº saiu e Nº entrou para cada substituição informada.',
        );
      }
    }

    await this.prisma.$transaction([
      this.prisma.substitution.deleteMany({
        where: {
          matchId,
        },
      }),

      ...validSubstitutions.map((item) =>
        this.prisma.substitution.create({
          data: {
            matchId,
            team: item.team,
            playerOutName: item.playerOutName || '-',
            playerOutNumber: item.playerOutNumber,
            playerInName: item.playerInName || '-',
            playerInNumber: item.playerInNumber,
            minute: item.minute,
            period: item.period,
            notes: item.notes,
          },
        }),
      ),
    ]);

    return this.findAll(matchId);
  }

  async findAll(matchId?: string) {
    return this.prisma.substitution.findMany({
      where: matchId ? { matchId } : undefined,
      include: {
        match: {
          include: {
            championship: true,
            stadium: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(id: string) {
    return this.prisma.substitution.delete({
      where: {
        id,
      },
    });
  }
}
