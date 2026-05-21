import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type MatchStatus =
  | 'SCHEDULED'
  | 'SCALE_ACCEPTED'
  | 'IN_PROGRESS'
  | 'CONTROL_DONE'
  | 'CANCELED';

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
  ) {
    return this.prisma.match.update({
      where: { id },

      data: {
        status,
      },

      include: this.includeRelations,
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

      include: {
        championship: true,
        stadium: true,
      },
    });
  }

  async findAll(user?: any) {
  console.log('USUARIO NO MATCHES FINDALL:', user);

  const userRole = String(
    user?.role || '',
  )
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
    console.log('SEM USER ID NO TOKEN');
    return [];
  }

  const official = await this.prisma.official.findFirst({
    where: {
      userId,
      active: true,
    },
  });

  console.log('OFICIAL ENCONTRADO:', official);

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

  console.log('ESCALAS CONFIRMADAS:', scales);

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