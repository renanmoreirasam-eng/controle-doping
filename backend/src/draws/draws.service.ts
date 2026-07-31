import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';

@Injectable()
export class DrawsService {
  constructor(
    private prisma: PrismaService,
    private pushService: PushService,
  ) {}

  private formatExamAthleteNotificationBody(draw: {
    match: {
      homeTeam: string;
      awayTeam: string;
    };
    players: {
      team: string;
      name: string;
      number: string;
      type: string;
    }[];
  }) {
    const homeExamPlayer = draw.players.find(
      (player) => player.team === 'HOME' && player.type === 'EXAME',
    );

    const awayExamPlayer = draw.players.find(
      (player) => player.team === 'AWAY' && player.type === 'EXAME',
    );

    const homeAthleteText = homeExamPlayer
      ? `${draw.match.homeTeam}: Nº ${homeExamPlayer.number} ${homeExamPlayer.name}`
      : `${draw.match.homeTeam}: atleta principal não informado`;

    const awayAthleteText = awayExamPlayer
      ? `${draw.match.awayTeam}: Nº ${awayExamPlayer.number} ${awayExamPlayer.name}`
      : `${draw.match.awayTeam}: atleta principal não informado`;

    return `${homeAthleteText} | ${awayAthleteText}`;
  }

  private async notifyDrawCreated(draw: {
    matchId: string;
    match: {
      homeTeam: string;
      awayTeam: string;
    };
    players: {
      team: string;
      name: string;
      number: string;
      type: string;
    }[];
  }) {
    const matchOfficials = await this.prisma.matchOfficial.findMany({
      where: {
        matchId: draw.matchId,
        confirmed: true,
      },
      include: {
        official: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const userIds = Array.from(
      new Set(
        matchOfficials
          .map((matchOfficial) => matchOfficial.official?.user?.id)
          .filter((userId): userId is string => Boolean(userId)),
      ),
    );

    if (userIds.length === 0) {
      return;
    }

    const body = this.formatExamAthleteNotificationBody(draw);

    const results = await Promise.allSettled(
      userIds.map((userId) =>
        this.pushService.sendToUser(userId, {
          title: 'Atletas sorteados para o doping',
          body,
          url: `/dashboard/matches/${draw.matchId}`,
        }),
      ),
    );

    const failed = results.filter((result) => result.status === 'rejected');

    if (failed.length > 0) {
      console.error(
        'Erro ao enviar algumas notificações de sorteio:',
        failed,
      );
    }
  }

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
    const match = await this.prisma.match.findUnique({
      where: { id: data.matchId },
      select: { id: true, status: true },
    });

    if (!match) {
      throw new NotFoundException('Jogo não encontrado.');
    }

    if (match.status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'O sorteio só pode ser registrado enquanto o jogo estiver em andamento.',
      );
    }

    const existingDraw = await this.prisma.draw.findFirst({
      where: { matchId: data.matchId },
      select: { id: true },
    });

    if (existingDraw) {
      throw new BadRequestException(
        'Já existe um sorteio para este jogo. Utilize a opção de alteração.',
      );
    }

    const created = await this.prisma.draw.create({
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

    await this.notifyDrawCreated(created).catch((error) => {
      console.error(
        'Erro ao enviar notificação de sorteio realizado:',
        error,
      );
    });

    return created;
  }

  async updateByMatch(
    matchId: string,
    data: {
      players: {
        team: string;
        name: string;
        nickname?: string;
        number: string;
        type: 'EXAME' | 'RESERVA';
      }[];
    },
  ) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        status: true,
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Jogo não encontrado.');
    }

    if (match.status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'O sorteio só pode ser alterado enquanto o jogo estiver em andamento.',
      );
    }

    const existingDraw = await this.prisma.draw.findFirst({
      where: { matchId },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!existingDraw) {
      throw new NotFoundException('Sorteio não encontrado para este jogo.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.drawPlayer.deleteMany({
        where: { drawId: existingDraw.id },
      });

      return tx.draw.update({
        where: { id: existingDraw.id },
        data: {
          players: {
            create: data.players,
          },
        },
        include: {
          players: true,
          match: true,
        },
      });
    });

    await this.notifyDrawCreated(updated).catch((error) => {
      console.error(
        'Erro ao enviar notificação de sorteio alterado:',
        error,
      );
    });

    return updated;
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
