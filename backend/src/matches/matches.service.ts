import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';

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
  constructor(
    private prisma: PrismaService,
    private pushService: PushService,
  ) {}

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

  private async notifyFinalDocumentsAvailable(match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
  }) {
    const matchOfficials = await this.prisma.matchOfficial.findMany({
      where: {
        matchId: match.id,
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

    const body = `A documentação de ${match.homeTeam} x ${match.awayTeam} já está disponível no sistema.`;

    const results = await Promise.allSettled(
      userIds.map((userId) =>
        this.pushService.sendToUser(userId, {
          title: 'Documentação do jogo disponível',
          body,
          url: `/dashboard/matches/${match.id}`,
        }),
      ),
    );

    const failed = results.filter((result) => result.status === 'rejected');

    if (failed.length > 0) {
      console.error(
        'Erro ao enviar algumas notificações de documentação do jogo:',
        failed,
      );
    }
  }


  private async notifyMissionOrderAvailableToCoordinators(match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
  }) {
    const coordinators = await this.prisma.user.findMany({
      where: {
        role: 'COORDINATOR',
      },
      select: {
        id: true,
      },
    });

    const userIds = Array.from(
      new Set(
        coordinators
          .map((coordinator) => coordinator.id)
          .filter((userId): userId is string => Boolean(userId)),
      ),
    );

    if (userIds.length === 0) {
      return;
    }

    const body = `A ordem de missão de ${match.homeTeam} x ${match.awayTeam} já está disponível no sistema.`;

    const results = await Promise.allSettled(
      userIds.map((userId) =>
        this.pushService.sendToUser(userId, {
          title: 'Ordem de missão disponível',
          body,
          url: `/dashboard/matches/${match.id}`,
        }),
      ),
    );

    const failed = results.filter((result) => result.status === 'rejected');

    if (failed.length > 0) {
      console.error(
        'Erro ao enviar algumas notificações de ordem de missão:',
        failed,
      );
    }
  }

  async create(data: {
    championshipId: string;
    stadiumId: string;
    homeTeam: string;
    awayTeam: string;
    missionCode?: string;
    matchNumber?: string;
    roundOrPhase?: string;
    missionOrderFileName?: string | null;
    missionOrderFileType?: string | null;
    missionOrderFileData?: string | null;
    athleteListFileName?: string | null;
    athleteListFileType?: string | null;
    athleteListFileData?: string | null;
    finalDocumentFileName?: string | null;
    finalDocumentFileType?: string | null;
    finalDocumentFileData?: string | null;
    matchDate: string;
  }) {
    const parsedMatchDate = new Date(data.matchDate);

    if (Number.isNaN(parsedMatchDate.getTime())) {
      throw new Error('Data/hora da partida inválida.');
    }

    const created = await this.prisma.match.create({
      data: {
        championshipId: data.championshipId,
        stadiumId: data.stadiumId,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        missionCode: data.missionCode?.trim() || null,
        matchNumber: data.matchNumber?.trim() || null,
        roundOrPhase: data.roundOrPhase?.trim() || null,
        missionOrderFileName: data.missionOrderFileName || null,
        missionOrderFileType: data.missionOrderFileType || null,
        missionOrderFileData: data.missionOrderFileData || null,
        athleteListFileName: data.athleteListFileName || null,
        athleteListFileType: data.athleteListFileType || null,
        athleteListFileData: data.athleteListFileData || null,
        finalDocumentFileName: data.finalDocumentFileName || null,
        finalDocumentFileType: data.finalDocumentFileType || null,
        finalDocumentFileData: data.finalDocumentFileData || null,
        matchDate: parsedMatchDate,
        status: 'SCHEDULED',
      },
      include: this.includeRelations,
    });

    const hasMissionOrder =
      Boolean(data.missionOrderFileName) ||
      Boolean(data.missionOrderFileData);

    if (hasMissionOrder) {
      await this.notifyMissionOrderAvailableToCoordinators(created).catch(
        (error) => {
          console.error(
            'Erro ao enviar notificação de ordem de missão:',
            error,
          );
        },
      );
    }

    return created;
  }

  async update(
    id: string,
    data: {
      championshipId?: string;
      stadiumId?: string;
      homeTeam?: string;
      awayTeam?: string;
      missionCode?: string;
      matchNumber?: string;
      roundOrPhase?: string;
      missionOrderFileName?: string | null;
      missionOrderFileType?: string | null;
      missionOrderFileData?: string | null;
      athleteListFileName?: string | null;
      athleteListFileType?: string | null;
      athleteListFileData?: string | null;
      finalDocumentFileName?: string | null;
      finalDocumentFileType?: string | null;
      finalDocumentFileData?: string | null;
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

    const currentMatch = await this.prisma.match.findUnique({
      where: { id },
      select: {
        missionOrderFileName: true,
        missionOrderFileData: true,
      },
    });

    const hasMissionOrderInPayload =
      data.missionOrderFileName !== undefined ||
      data.missionOrderFileData !== undefined;

    const nextMissionOrderFileName =
      data.missionOrderFileName !== undefined
        ? data.missionOrderFileName || null
        : currentMatch?.missionOrderFileName || null;

    const nextMissionOrderFileData =
      data.missionOrderFileData !== undefined
        ? data.missionOrderFileData || null
        : currentMatch?.missionOrderFileData || null;

    const shouldNotifyMissionOrder =
      hasMissionOrderInPayload &&
      Boolean(nextMissionOrderFileName || nextMissionOrderFileData) &&
      (
        nextMissionOrderFileName !== (currentMatch?.missionOrderFileName || null) ||
        nextMissionOrderFileData !== (currentMatch?.missionOrderFileData || null)
      );

    const updated = await this.prisma.match.update({
      where: { id },
      data: {
        championshipId: data.championshipId,
        stadiumId: data.stadiumId,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        missionCode: data.missionCode !== undefined ? data.missionCode?.trim() || null : undefined,
        matchNumber: data.matchNumber !== undefined ? data.matchNumber?.trim() || null : undefined,
        roundOrPhase: data.roundOrPhase !== undefined ? data.roundOrPhase?.trim() || null : undefined,
        missionOrderFileName: data.missionOrderFileName !== undefined ? data.missionOrderFileName || null : undefined,
        missionOrderFileType: data.missionOrderFileType !== undefined ? data.missionOrderFileType || null : undefined,
        missionOrderFileData: data.missionOrderFileData !== undefined ? data.missionOrderFileData || null : undefined,
        athleteListFileName: data.athleteListFileName !== undefined ? data.athleteListFileName || null : undefined,
        athleteListFileType: data.athleteListFileType !== undefined ? data.athleteListFileType || null : undefined,
        athleteListFileData: data.athleteListFileData !== undefined ? data.athleteListFileData || null : undefined,
        finalDocumentFileName: data.finalDocumentFileName !== undefined ? data.finalDocumentFileName || null : undefined,
        finalDocumentFileType: data.finalDocumentFileType !== undefined ? data.finalDocumentFileType || null : undefined,
        finalDocumentFileData: data.finalDocumentFileData !== undefined ? data.finalDocumentFileData || null : undefined,
        matchDate: parsedMatchDate,
        status: data.status,
      },
      include: this.includeRelations,
    });

    if (shouldNotifyMissionOrder) {
      await this.notifyMissionOrderAvailableToCoordinators(updated).catch(
        (error) => {
          console.error(
            'Erro ao enviar notificação de ordem de missão:',
            error,
          );
        },
      );
    }

    return updated;
  }

  async updateMissionCode(id: string, missionCode: string) {
    return this.prisma.match.update({
      where: { id },
      data: {
        missionCode: missionCode?.trim() || null,
      },
      include: this.includeRelations,
    });
  }

  async updateDocuments(
    id: string,
    data: {
      athleteListFileName?: string | null;
      athleteListFileType?: string | null;
      athleteListFileData?: string | null;
      finalDocumentFileName?: string | null;
      finalDocumentFileType?: string | null;
      finalDocumentFileData?: string | null;
    },
  ) {
    const shouldNotifyFinalDocument =
      Boolean(data.finalDocumentFileName) ||
      Boolean(data.finalDocumentFileData);

    const updated = await this.prisma.match.update({
      where: { id },
      data: {
        athleteListFileName: data.athleteListFileName,
        athleteListFileType: data.athleteListFileType,
        athleteListFileData: data.athleteListFileData,
        finalDocumentFileName: data.finalDocumentFileName,
        finalDocumentFileType: data.finalDocumentFileType,
        finalDocumentFileData: data.finalDocumentFileData,
      },
      include: this.includeRelations,
    });

    if (shouldNotifyFinalDocument) {
      await this.notifyFinalDocumentsAvailable(updated).catch((error) => {
        console.error(
          'Erro ao enviar notificação de documentação do jogo:',
          error,
        );
      });
    }

    return updated;
  }

  async updateStatus(
    id: string,
    status: MatchStatus,
    user?: any,
    location?: {
      latitude?: number;
      longitude?: number;
      comment?: string;
    },
  ) {

    const currentMatch = await this.prisma.match.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!currentMatch) {
      throw new BadRequestException('Jogo não encontrado.');
    }

    if (currentMatch.status === 'CONTROL_DONE' && status !== 'CONTROL_DONE') {
      throw new BadRequestException(
        'Controle já realizado. Não é possível alterar esta operação.',
      );
    }

    const stepByStatus: Partial<Record<MatchStatus, OperationalStep>> = {
      SCALE_ACCEPTED: 'CHECKIN_STADIUM',
      IN_PROGRESS: 'MATCH_IN_PROGRESS',
      CONTROL_DONE: 'CONTROL_DONE',
    };

    const nextStep = stepByStatus[status];

    if (nextStep) {
      const existingStepLog = await this.prisma.matchOperationalLog.findFirst({
        where: {
          matchId: id,
          step: nextStep,
        },
      });

      if (existingStepLog) {
        throw new BadRequestException(
          'Esta etapa já foi registrada por outro usuário. Atualize a página para visualizar as informações mais recentes.',
        );
      }
    }

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
      comment?: string;
    },
  ) {
    const comment =
      typeof location?.comment === 'string'
        ? location.comment.trim()
        : '';

    const existingLog = await this.prisma.matchOperationalLog.findFirst({
      where: {
        matchId,
        step,
      },
    });

    if (existingLog) {
      throw new BadRequestException(
        'Esta etapa já foi registrada por outro usuário. Atualize a página para visualizar as informações mais recentes.',
      );
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
        comment: comment || null,
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
