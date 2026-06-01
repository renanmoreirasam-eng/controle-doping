import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';

@Injectable()
export class MatchOfficialsService {
  constructor(
    private prisma: PrismaService,
    private pushService: PushService,
  ) {}

  private includeRelations = {
    match: {
      include: {
        championship: true,
        stadium: true,
      },
    },
    official: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    },
  };

  private async updateMatchStatusIfScaleAccepted(matchId: string) {
    const officials = await this.prisma.matchOfficial.findMany({
      where: {
        matchId,
      },
    });

    const hasDcoConfirmed = officials.some(
      (official) =>
        official.role === 'DCO' &&
        official.confirmed === true,
    );

    const hasAssistant = officials.some(
      (official) => official.role === 'ASSISTANT',
    );

    const hasAssistantConfirmed = officials.some(
      (official) =>
        official.role === 'ASSISTANT' &&
        official.confirmed === true,
    );

    const canAcceptScale =
      hasDcoConfirmed && (!hasAssistant || hasAssistantConfirmed);

    if (!canAcceptScale) {
      return;
    }

    await this.prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        status: 'SCALE_ACCEPTED',
      },
    });
  }

  async create(data: {
    matchId: string;
    officialId: string;
    role: 'DCO' | 'ASSISTANT';
  }) {
    const sameOfficial =
      await this.prisma.matchOfficial.findFirst({
        where: {
          matchId: data.matchId,
          officialId: data.officialId,
        },
      });

    if (sameOfficial) {
      throw new BadRequestException(
        'Este oficial já está escalado para este jogo.',
      );
    }

    const sameRole =
      await this.prisma.matchOfficial.findFirst({
        where: {
          matchId: data.matchId,
          role: data.role,
        },
      });

    if (sameRole) {
      throw new BadRequestException(
        `Este jogo já possui oficial na função ${data.role}.`,
      );
    }

    const created = await this.prisma.matchOfficial.create({
      data,
      include: this.includeRelations,
    });

    const userId = created.official?.user?.id;

    if (userId) {
      const homeTeam = created.match.homeTeam;
      const awayTeam = created.match.awayTeam;
      const matchDate = created.match.matchDate
        ? new Date(created.match.matchDate).toLocaleDateString('pt-BR')
        : '';

      this.pushService
        .sendToUser(userId, {
          title: 'Nova escala pendente',
          body: `Você foi escalado para ${homeTeam} x ${awayTeam}${matchDate ? ` em ${matchDate}` : ''}. Toque para visualizar.`,
          url: `/dashboard/matches/${created.matchId}`,
        })
        .catch((error) => {
          console.error(
            'Erro ao enviar push de nova escala:',
            error,
          );
        });
    }

    return created;
  }

  async confirm(id: string) {
    const updated = await this.prisma.matchOfficial.update({
      where: {
        id,
      },
      data: {
        confirmed: true,
      },
      include: this.includeRelations,
    });

    await this.updateMatchStatusIfScaleAccepted(
      updated.matchId,
    );

    return updated;
  }

  async refuse(id: string) {
    return this.prisma.matchOfficial.update({
      where: {
        id,
      },
      data: {
        confirmed: false,
      },
      include: this.includeRelations,
    });
  }

  async remove(id: string) {
    return this.prisma.matchOfficial.delete({
      where: {
        id,
      },
    });
  }

  async findAll() {
    return this.prisma.matchOfficial.findMany({
      include: this.includeRelations,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
