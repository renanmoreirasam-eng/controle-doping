import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DrawsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    matchId: string;
    players: {
      team: string;
      name: string;
      nickname?: string;
      number: string;
      type: 'EXAME' | 'RESERVA';
    }[];
  }) {
    return this.prisma.draw.create({
      data: {
        matchId: data.matchId,
        players: {
          create: data.players,
        },
      },
      include: {
        players: true,
        match: true,
      },
    });
  }

  async findAll() {
    return this.prisma.draw.findMany({
      include: {
        players: true,
        match: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findSelectedAthletesByTeam(teamName: string) {
    const normalizedTeamName = teamName.trim();

    const draws = await this.prisma.draw.findMany({
      where: {
        match: {
          OR: [
            {
              homeTeam: normalizedTeamName,
            },
            {
              awayTeam: normalizedTeamName,
            },
          ],
        },
      },
      include: {
        players: {
          where: {
            type: 'EXAME',
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
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

    return draws.flatMap((draw) => {
      const match = draw.match;
      const selectedSide =
        match.homeTeam === normalizedTeamName
          ? 'HOME'
          : match.awayTeam === normalizedTeamName
            ? 'AWAY'
            : null;

      if (!selectedSide) {
        return [];
      }

      return draw.players
        .filter((player) => player.team === selectedSide)
        .map((player) => ({
          id: player.id,
          drawId: draw.id,
          matchId: match.id,
          teamName: normalizedTeamName,
          teamSide: selectedSide,
          number: player.number,
          name: player.name,
          nickname: player.nickname,
          type: player.type,
          matchDate: match.matchDate,
          matchLabel: `${match.homeTeam} x ${match.awayTeam}`,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          championshipName: match.championship?.name || null,
          stadiumName: match.stadium?.name || null,
          createdAt: draw.createdAt,
        }));
    });
  }
}
