import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
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
      select: {
        id: true,
        championshipId: true,
        stadiumId: true,
        homeTeam: true,
        awayTeam: true,
        missionCode: true,
        matchNumber: true,
        roundOrPhase: true,
        missionOrderFileName: true,
        missionOrderFileType: true,
        athleteListFileName: true,
        athleteListFileType: true,
        finalDocumentFileName: true,
        finalDocumentFileType: true,
        matchDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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

  async resendPendingNotification(id: string, user: any) {
    const userRole = this.getUserRole(user);

    if (userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Somente administradores podem reenviar notificações de escala.',
      );
    }

    const scale = await this.prisma.matchOfficial.findUnique({
      where: {
        id,
      },
      include: this.includeRelations,
    });

    if (!scale) {
      throw new NotFoundException('Escala não encontrada.');
    }

    if (scale.confirmed !== null) {
      throw new BadRequestException(
        'A notificação só pode ser reenviada para escalas pendentes.',
      );
    }

    const targetUserId = scale.official?.user?.id;

    if (!targetUserId) {
      throw new BadRequestException(
        'Não foi possível identificar o usuário vinculado ao oficial.',
      );
    }

    const homeTeam = scale.match.homeTeam;
    const awayTeam = scale.match.awayTeam;
    const matchDate = scale.match.matchDate
      ? new Date(scale.match.matchDate).toLocaleDateString('pt-BR')
      : '';
    const roleLabel = scale.role === 'DCO' ? 'DCO' : 'Assistente';

    await this.pushService.sendToUser(targetUserId, {
      title: 'Escala pendente de confirmação',
      body: `Você possui uma escala pendente como ${roleLabel} para ${homeTeam} x ${awayTeam}${matchDate ? ` em ${matchDate}` : ''}. Toque para visualizar.`,
      url: `/dashboard/scales?status=PENDING`,
    });

    return {
      message: 'Notificação reenviada com sucesso.',
      scaleId: scale.id,
      userId: targetUserId,
    };
  }

  async remove(id: string) {
    return this.prisma.matchOfficial.delete({
      where: {
        id,
      },
    });
  }


  private getUserRole(user: any) {
    return String(user?.role || user?.user?.role || '').toUpperCase();
  }

  private getUserId(user: any) {
    return user?.id || user?.sub || user?.userId || user?.user?.id || null;
  }

  private getUserEmail(user: any) {
    return user?.email || user?.user?.email || null;
  }

  private groupScales(scales: any[]) {
    const map = new Map<string, any>();

    for (const scale of scales) {
      if (!map.has(scale.matchId)) {
        map.set(scale.matchId, {
          match: scale.match,
          dco: undefined,
          assistant: undefined,
        });
      }

      const group = map.get(scale.matchId);

      if (scale.role === 'DCO') {
        group.dco = scale;
      }

      if (scale.role === 'ASSISTANT') {
        group.assistant = scale;
      }
    }

    return Array.from(map.values());
  }

  private hasMissionOrder(match: any) {
    return Boolean(
      match?.missionOrderFileData ||
        match?.missionOrderFileName ||
        match?.missionOrderFileType,
    );
  }

  async findGroups(filters: {
    tab?: 'ACTIVE' | 'DONE';
    status?: 'PENDING' | 'CONFIRMED' | 'REFUSED';
    search?: string;
    championship?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
    limit?: string;
    user?: any;
  }) {

    const userRole = this.getUserRole(filters.user);
    const isAdmin = userRole === 'ADMIN';

    const userId = this.getUserId(filters.user);
    const userEmail = this.getUserEmail(filters.user);

    const ownScaleOr = [
      ...(userId
        ? [
            {
              official: {
                userId,
              },
            },
          ]
        : []),
      ...(userEmail
        ? [
            {
              official: {
                user: {
                  email: userEmail,
                },
              },
            },
          ]
        : []),
    ];

    const emptyWhere = {
      id: '__NO_SCALE__',
    };

    const matchWhere: any = {};

    if (filters.tab === 'DONE') {
      matchWhere.status = 'CONTROL_DONE';
    } else {
      matchWhere.status = {
        not: 'CONTROL_DONE',
      };
    }

    if (filters.championship) {
      matchWhere.championship = {
        name: filters.championship,
      };
    }

    if (filters.startDate || filters.endDate) {
      matchWhere.matchDate = {};

      if (filters.startDate) {
        matchWhere.matchDate.gte = new Date(`${filters.startDate}T00:00:00`);
      }

      if (filters.endDate) {
        matchWhere.matchDate.lte = new Date(`${filters.endDate}T23:59:59`);
      }
    }

    const filteredScaleWhere: any = {
      match: matchWhere,
    };

    if (!isAdmin) {
      filteredScaleWhere.OR =
        ownScaleOr.length > 0 ? ownScaleOr : [emptyWhere];
    }

    if (filters.status === 'PENDING') {
      filteredScaleWhere.confirmed = null;
    }

    if (filters.status === 'CONFIRMED') {
      filteredScaleWhere.confirmed = true;
    }

    if (filters.status === 'REFUSED') {
      filteredScaleWhere.confirmed = false;
    }

    const matchingScales = await this.prisma.matchOfficial.findMany({
      where: filteredScaleWhere,
      select: {
        matchId: true,
      },
      orderBy: {
        match: {
          matchDate: filters.tab === 'DONE' ? 'desc' : 'asc',
        },
      },
    });

    const matchingMatchIds = Array.from(
      new Set(matchingScales.map((scale) => scale.matchId)),
    );

    let fullScales: any[] = [];

    if (matchingMatchIds.length > 0) {
      fullScales = await this.prisma.matchOfficial.findMany({
        where: {
          matchId: {
            in: matchingMatchIds,
          },
        },
        include: this.includeRelations,
        orderBy: {
          match: {
            matchDate: filters.tab === 'DONE' ? 'desc' : 'asc',
          },
        },
      });
    }

    let allGroups = this.groupScales(fullScales);

    const search = String(filters.search || '').trim().toLowerCase();

    if (search) {
      allGroups = allGroups.filter((group: any) => {
        const value = `
          ${group.match?.homeTeam || ''}
          ${group.match?.awayTeam || ''}
          ${group.match?.championship?.name || ''}
          ${group.match?.stadium?.name || ''}
          ${group.match?.stadium?.city || ''}
          ${group.dco?.official?.user?.name || ''}
          ${group.dco?.official?.user?.email || ''}
          ${group.assistant?.official?.user?.name || ''}
          ${group.assistant?.official?.user?.email || ''}
        `.toLowerCase();

        return value.includes(search);
      });
    }

    allGroups.sort((a: any, b: any) => {
      const dateA = a.match?.matchDate
        ? new Date(a.match.matchDate).getTime()
        : 0;
      const dateB = b.match?.matchDate
        ? new Date(b.match.matchDate).getTime()
        : 0;

      return filters.tab === 'DONE' ? dateB - dateA : dateA - dateB;
    });

    const groups = allGroups;
    const total = allGroups.length;

    const summaryScaleWhere: any = {};

    if (!isAdmin) {
      summaryScaleWhere.OR =
        ownScaleOr.length > 0 ? ownScaleOr : [emptyWhere];
    }

    const summaryScales = await this.prisma.matchOfficial.findMany({
      where: summaryScaleWhere,
      include: this.includeRelations,
      orderBy: {
        match: {
          matchDate: 'asc',
        },
      },
    });

    const summaryMatchIds = Array.from(
      new Set(summaryScales.map((scale: any) => scale.matchId)),
    );

    const summaryFullScales =
      !isAdmin && summaryMatchIds.length > 0
        ? await this.prisma.matchOfficial.findMany({
            where: {
              matchId: {
                in: summaryMatchIds,
              },
            },
            include: this.includeRelations,
            orderBy: {
              match: {
                matchDate: 'asc',
              },
            },
          })
        : summaryScales;

    const summaryGroups = this.groupScales(summaryFullScales);

    const visibleScales = isAdmin
      ? summaryScales
      : summaryScales.filter((scale: any) => {
          return (
            scale.official?.user?.id === userId ||
            scale.official?.user?.email === userEmail
          );
        });

    const activeScaleGroups = summaryGroups.filter(
      (group: any) => group.match.status !== 'CONTROL_DONE',
    ).length;

    const doneScaleGroups = summaryGroups.filter(
      (group: any) => group.match.status === 'CONTROL_DONE',
    ).length;

    const pendingScales = visibleScales.filter(
      (scale: any) => scale.confirmed === null || scale.confirmed === undefined,
    ).length;

    const refusedScales = isAdmin
      ? summaryScales.filter((scale: any) => scale.confirmed === false).length
      : 0;

    const confirmedScales = visibleScales.filter(
      (scale: any) => scale.confirmed === true,
    ).length;

    const confirmedActiveScales = visibleScales.filter((scale: any) => {
      return scale.confirmed === true && scale.match?.status !== 'CONTROL_DONE';
    }).length;

    const confirmedDoneScales = visibleScales.filter((scale: any) => {
      return scale.confirmed === true && scale.match?.status === 'CONTROL_DONE';
    }).length;

    const scalesWithoutMissionOrderMap = new Map<string, any>();

    if (isAdmin) {
      for (const scale of summaryScales) {
        const match = scale.match;

        if (!match?.id) continue;
        if (match.status === 'CONTROL_DONE') continue;
        if (match.status === 'CANCELED') continue;
        if (this.hasMissionOrder(match)) continue;

        scalesWithoutMissionOrderMap.set(match.id, match);
      }
    }

    return {
      data: groups,
      pagination: {
        page: 1,
        limit: total,
        total,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
      summary: {
        activeScaleGroups,
        doneScaleGroups,
        pendingScales,
        refusedScales,
        confirmedScales,
        confirmedActiveScales,
        confirmedDoneScales,
        scalesWithoutMissionOrder: scalesWithoutMissionOrderMap.size,
      },
    };
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
