import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchOfficialsService {
  constructor(private prisma: PrismaService) {}

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

    const hasAssistantConfirmed = officials.some(
      (official) =>
        official.role === 'ASSISTANT' &&
        official.confirmed === true,
    );

    if (hasDcoConfirmed && hasAssistantConfirmed) {
      await this.prisma.match.update({
        where: {
          id: matchId,
        },
        data: {
          status: 'SCALE_ACCEPTED',
        },
      });
    }
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

    return this.prisma.matchOfficial.create({
      data,
      include: this.includeRelations,
    });
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