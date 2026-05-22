import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type MatchStatus =
  | 'SCHEDULED'
  | 'SCALE_ACCEPTED'
  | 'IN_PROGRESS'
  | 'CONTROL_DONE'
  | 'CANCELED';

type OperationalStep =
  | 'CHECKIN_STADIUM'
  | 'MATCH_IN_PROGRESS'
  | 'DRAW_DONE'
  | 'CONTROL_DONE';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  private includeRelations = {
    championship: true,
    stadium: true,
    officials: {
      include: {
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
      },
    },
  };

  private getOperationalStepByStatus(status: MatchStatus): OperationalStep | null {
    if (status === 'SCALE_ACCEPTED') {
      return 'CHECKIN_STADIUM';
    }

    if (status === 'IN_PROGRESS') {
      return 'MATCH_IN_PROGRESS';
    }

    if (status === 'CONTROL_DONE') {
      return 'CONTROL_DONE';
    }

    return null;
  }

  async create(data: {
    championshipId: string;
    stadiumId: string;
    homeTeam: string;
    awayTeam: string;
    missionCode?: string;
    matchDate: string;
  }) {
    const parsedMatchDate = new Date(data.matchDate);

    if (Number.isNaN(parsedMatchDate.getTime())) {
      throw new Error('Data/hora da partida inválida.');
    }

    return this.prisma.match.create({
      data: {
        championshipId: data.championshipId,
        stadiumId: data.stadiumId,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        missionCode: data.missionCode,
        matchDate: parsedMatchDate,
        status: 'SCHEDULED',
      },
      include: this.includeRelations,
    });
  }

  async update(
    id: string,
    data: {
      championshipId?: string;
      stadiumId?: string;
      homeTeam?: string;
      awayTeam?: string;
      missionCode?: string;
      matchDate?: string;
      status?: MatchStatus;
    },
  ) {
    const parsedMatchDate = data.matchDate
      ? new Date(data.matchDate)
      : undefined;

    if (
      data.matchDate &&
      Number.isNaN(parsedMatchDate?.getTime())
    ) {
      throw new Error('Data/hora da partida inválida.');
    }

    return this.prisma.match.update({
      where: { id },
      data: {
        championshipId: data.championshipId,
        stadiumId: data.stadiumId,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        missionCode: data.missionCode,
        matchDate: parsedMatchDate,
        status: data.status,
      },
      include: this.includeRelations,
    });
  }

  async updateStatus(
    id: string,
    status: MatchStatus,
    user?: any,
    location?: {
      latitude?: number;
      longitude?: number;
    },
  ) {
    const match = await this.prisma.match.update({
      where: { id },
      data: { status },
      include: this.includeRelations,
    });

    const step = this.getOperationalStepByStatus(status);

    if (step) {
      await this.createOperationalLog(
        id,
        step,
        user,
        location,
      );
    }

    return match;
  }

  async createOperationalLog(
    matchId: string,
    step: OperationalStep,
    user?: any,
    location?: {
      latitude?: number;
      longitude?: number;
    },
  ) {
    const existingLog = await this.prisma.matchOperationalLog.findFirst({
      where: {
        matchId,
        step,
      },
    });

    if (existingLog) {
      return existingLog;
    }

    return this.prisma.matchOperationalLog.create({
      data: {
        matchId,
        step,
        userId:
          user?.sub ||
          user?.id ||
          user?.userId ||
          null,
        userName:
          user?.name ||
          user?.user?.name ||
          null,
        userEmail:
          user?.email ||
          user?.user?.email ||
          null,
        latitude:
          typeof location?.latitude === 'number'
            ? location.latitude
            : null,
        longitude:
          typeof location?.longitude === 'number'
            ? location.longitude
            : null,
      },
    });
  }

  async findOperationalLogs(matchId: string) {
    return this.prisma.matchOperationalLog.findMany({
      where: { matchId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async remove(id: string) {
    return this.prisma.match.delete({
      where: { id },
    });
  }

  async findOne(id: string) {
    return this.prisma.match.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async findAll(user?: any) {
    const userRole = String(user?.role || '')
      .trim()
      .toUpperCase();

    if (userRole === 'ADMIN') {
      return this.prisma.match.findMany({
        include: this.includeRelations,
        orderBy: {
          matchDate: 'desc',
        },
      });
    }

    const userId =
      user?.sub ||
      user?.id ||
      user?.userId;

    if (!userId) {
      return [];
    }

    const official = await this.prisma.official.findFirst({
      where: {
        userId,
        active: true,
      },
    });

    if (!official) {
      return [];
    }

    const scales = await this.prisma.matchOfficial.findMany({
      where: {
        officialId: official.id,
        confirmed: true,
      },
      select: {
        matchId: true,
      },
    });

    const matchIds = scales.map((scale) => scale.matchId);

    if (matchIds.length === 0) {
      return [];
    }

    return this.prisma.match.findMany({
      where: {
        id: {
          in: matchIds,
        },
      },
      include: this.includeRelations,
      orderBy: {
        matchDate: 'desc',
      },
    });
  }
}
