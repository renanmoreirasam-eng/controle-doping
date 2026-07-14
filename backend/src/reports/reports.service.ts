import { Injectable } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type OperationalReportsQuery = {
  startDate?: string;
  endDate?: string;
  championshipId?: string;
  stadiumId?: string;
  officialId?: string;
  status?: string;
};

const MATCH_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  SCALE_ACCEPTED: 'Escala aceita',
  IN_PROGRESS: 'Em andamento',
  CONTROL_DONE: 'Controle realizado',
  CANCELED: 'Cancelado',
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildDateRange(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return undefined;

    const range: Prisma.DateTimeFilter = {};

    if (startDate) {
      range.gte = new Date(`${startDate}T00:00:00.000`);
    }

    if (endDate) {
      range.lte = new Date(`${endDate}T23:59:59.999`);
    }

    return range;
  }

  private buildMatchWhere(query: OperationalReportsQuery) {
    const where: Prisma.MatchWhereInput = {};

    const matchDateRange = this.buildDateRange(query.startDate, query.endDate);

    if (matchDateRange) {
      where.matchDate = matchDateRange;
    }

    if (query.championshipId) {
      where.championshipId = query.championshipId;
    }

    if (query.stadiumId) {
      where.stadiumId = query.stadiumId;
    }

    if (query.status) {
      where.status = query.status as MatchStatus;
    }

    if (query.officialId) {
      where.officials = {
        some: {
          officialId: query.officialId,
        },
      };
    }

    return where;
  }

  private getStatusLabel(status: string) {
    return MATCH_STATUS_LABELS[status] || status;
  }

  private getIssueLabels(issue: {
    noMissionOrder: boolean;
    noAthleteList: boolean;
    noFinalDocument: boolean;
    noDraw: boolean;
    noKit: boolean;
    noRoomInspection: boolean;
    scalePending: boolean;
    scaleRefused: boolean;
  }) {
    const labels: string[] = [];

    if (issue.noMissionOrder) labels.push('Sem ordem de missão');
    if (issue.noAthleteList) labels.push('Sem relação de atletas');
    if (issue.noFinalDocument) labels.push('Sem documento final');
    if (issue.noDraw) labels.push('Sem sorteio');
    if (issue.noKit) labels.push('Sem kit registrado');
    if (issue.noRoomInspection) labels.push('Sem inspeção da sala');
    if (issue.scalePending) labels.push('Escala pendente');
    if (issue.scaleRefused) labels.push('Escala recusada');

    return labels;
  }

  async getOperationalReports(query: OperationalReportsQuery) {
    const where = this.buildMatchWhere(query);

    const [matches, championships, stadiums, officials] = await this.prisma.$transaction([
      this.prisma.match.findMany({
        where,
        select: {
          id: true,
          homeTeam: true,
          awayTeam: true,
          matchDate: true,
          status: true,
          missionOrderFileName: true,
          athleteListFileName: true,
          finalDocumentFileName: true,
          championship: {
            select: {
              id: true,
              name: true,
            },
          },
          stadium: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
          officials: {
            select: {
              id: true,
              officialId: true,
              role: true,
              confirmed: true,
              official: {
                select: {
                  id: true,
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
          draws: {
            select: {
              id: true,
            },
          },
          kits: {
            select: {
              id: true,
            },
          },
          roomInspections: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: {
          matchDate: 'desc',
        },
      }),
      this.prisma.championship.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.stadium.findMany({
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
        },
        orderBy: [
          { state: 'asc' },
          { city: 'asc' },
          { name: 'asc' },
        ],
      }),
      this.prisma.official.findMany({
        where: {
          active: true,
        },
        select: {
          id: true,
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const statusCounts = matches.reduce<Record<string, number>>((acc, match) => {
      acc[match.status] = (acc[match.status] || 0) + 1;
      return acc;
    }, {});

    const scaleRows = matches.flatMap((match) =>
      match.officials.map((scale) => ({
        ...scale,
        matchId: match.id,
        matchStatus: match.status,
      })),
    );

    const confirmedScales = scaleRows.filter((scale) => scale.confirmed === true).length;
    const pendingScales = scaleRows.filter((scale) => scale.confirmed === null).length;
    const refusedScales = scaleRows.filter((scale) => scale.confirmed === false).length;

    const byOfficialMap = new Map<
      string,
      {
        officialId: string;
        name: string;
        email: string;
        role: string;
        totalScales: number;
        totalMatches: Set<string>;
        asDco: number;
        asAssistant: number;
        confirmed: number;
        pending: number;
        refused: number;
        controlDoneMatches: Set<string>;
      }
    >();

    for (const scale of scaleRows) {
      const officialId = scale.officialId;
      const user = scale.official?.user;

      if (!officialId || !user) continue;

      if (!byOfficialMap.has(officialId)) {
        byOfficialMap.set(officialId, {
          officialId,
          name: user.name,
          email: user.email,
          role: user.role,
          totalScales: 0,
          totalMatches: new Set<string>(),
          asDco: 0,
          asAssistant: 0,
          confirmed: 0,
          pending: 0,
          refused: 0,
          controlDoneMatches: new Set<string>(),
        });
      }

      const row = byOfficialMap.get(officialId)!;

      row.totalScales += 1;
      row.totalMatches.add(scale.matchId);

      if (scale.role === 'DCO') row.asDco += 1;
      if (scale.role === 'ASSISTANT') row.asAssistant += 1;
      if (scale.confirmed === true) row.confirmed += 1;
      if (scale.confirmed === null) row.pending += 1;
      if (scale.confirmed === false) row.refused += 1;
      if (scale.matchStatus === 'CONTROL_DONE') row.controlDoneMatches.add(scale.matchId);
    }

    const byOfficial = Array.from(byOfficialMap.values())
      .map((row) => ({
        officialId: row.officialId,
        name: row.name,
        email: row.email,
        role: row.role,
        totalScales: row.totalScales,
        totalMatches: row.totalMatches.size,
        asDco: row.asDco,
        asAssistant: row.asAssistant,
        confirmed: row.confirmed,
        pending: row.pending,
        refused: row.refused,
        controlDoneMatches: row.controlDoneMatches.size,
      }))
      .sort((a, b) => b.totalMatches - a.totalMatches || a.name.localeCompare(b.name));

    const byChampionshipMap = new Map<
      string,
      {
        championshipId: string;
        name: string;
        totalMatches: number;
        scheduled: number;
        scaleAccepted: number;
        inProgress: number;
        controlDone: number;
        canceled: number;
      }
    >();

    const byStadiumMap = new Map<
      string,
      {
        stadiumId: string;
        name: string;
        city: string;
        state: string;
        totalMatches: number;
        controlDone: number;
        pendingDocuments: number;
      }
    >();

    for (const match of matches) {
      const championshipId = match.championship.id;

      if (!byChampionshipMap.has(championshipId)) {
        byChampionshipMap.set(championshipId, {
          championshipId,
          name: match.championship.name,
          totalMatches: 0,
          scheduled: 0,
          scaleAccepted: 0,
          inProgress: 0,
          controlDone: 0,
          canceled: 0,
        });
      }

      const championshipRow = byChampionshipMap.get(championshipId)!;
      championshipRow.totalMatches += 1;
      if (match.status === 'SCHEDULED') championshipRow.scheduled += 1;
      if (match.status === 'SCALE_ACCEPTED') championshipRow.scaleAccepted += 1;
      if (match.status === 'IN_PROGRESS') championshipRow.inProgress += 1;
      if (match.status === 'CONTROL_DONE') championshipRow.controlDone += 1;
      if (match.status === 'CANCELED') championshipRow.canceled += 1;

      const stadiumId = match.stadium.id;

      if (!byStadiumMap.has(stadiumId)) {
        byStadiumMap.set(stadiumId, {
          stadiumId,
          name: match.stadium.name,
          city: match.stadium.city,
          state: match.stadium.state,
          totalMatches: 0,
          controlDone: 0,
          pendingDocuments: 0,
        });
      }

      const stadiumRow = byStadiumMap.get(stadiumId)!;
      stadiumRow.totalMatches += 1;
      if (match.status === 'CONTROL_DONE') stadiumRow.controlDone += 1;
      if (!match.missionOrderFileName || !match.athleteListFileName || (match.status === 'CONTROL_DONE' && !match.finalDocumentFileName)) {
        stadiumRow.pendingDocuments += 1;
      }
    }

    const byChampionship = Array.from(byChampionshipMap.values()).sort(
      (a, b) => b.totalMatches - a.totalMatches || a.name.localeCompare(b.name),
    );

    const byStadium = Array.from(byStadiumMap.values()).sort(
      (a, b) => b.totalMatches - a.totalMatches || a.name.localeCompare(b.name),
    );

    const pendingMatches = matches
      .map((match) => {
        const shouldHaveOperationalData = ['IN_PROGRESS', 'CONTROL_DONE'].includes(match.status);
        const issue = {
          noMissionOrder: !match.missionOrderFileName,
          noAthleteList: !match.athleteListFileName,
          noFinalDocument: match.status === 'CONTROL_DONE' && !match.finalDocumentFileName,
          noDraw: shouldHaveOperationalData && match.draws.length === 0,
          noKit: shouldHaveOperationalData && match.kits.length === 0,
          noRoomInspection: shouldHaveOperationalData && match.roomInspections.length === 0,
          scalePending: match.officials.some((scale) => scale.confirmed === null),
          scaleRefused: match.officials.some((scale) => scale.confirmed === false),
        };

        const issues = this.getIssueLabels(issue);

        return {
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          matchDate: match.matchDate,
          status: match.status,
          statusLabel: this.getStatusLabel(match.status),
          championship: match.championship.name,
          stadium: `${match.stadium.name} · ${match.stadium.city}/${match.stadium.state}`,
          issues,
          ...issue,
        };
      })
      .filter((match) => match.issues.length > 0)
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());

    const documents = matches.map((match) => ({
      id: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      matchDate: match.matchDate,
      status: match.status,
      statusLabel: this.getStatusLabel(match.status),
      championship: match.championship.name,
      missionOrderSent: Boolean(match.missionOrderFileName),
      athleteListSent: Boolean(match.athleteListFileName),
      finalDocumentSent: Boolean(match.finalDocumentFileName),
      missionOrderFileName: match.missionOrderFileName,
      athleteListFileName: match.athleteListFileName,
      finalDocumentFileName: match.finalDocumentFileName,
    }));

    const pendingSummary = pendingMatches.reduce(
      (acc, match) => {
        if (match.noMissionOrder) acc.noMissionOrder += 1;
        if (match.noAthleteList) acc.noAthleteList += 1;
        if (match.noFinalDocument) acc.noFinalDocument += 1;
        if (match.noDraw) acc.noDraw += 1;
        if (match.noKit) acc.noKit += 1;
        if (match.noRoomInspection) acc.noRoomInspection += 1;
        if (match.scalePending) acc.scalePending += 1;
        if (match.scaleRefused) acc.scaleRefused += 1;
        return acc;
      },
      {
        noMissionOrder: 0,
        noAthleteList: 0,
        noFinalDocument: 0,
        noDraw: 0,
        noKit: 0,
        noRoomInspection: 0,
        scalePending: 0,
        scaleRefused: 0,
      },
    );

    const sortedOfficials = officials
      .map((official) => ({
        id: official.id,
        name: official.user.name,
        email: official.user.email,
        role: official.user.role,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      filters: {
        championships,
        stadiums,
        officials: sortedOfficials,
      },
      summary: {
        totalMatches: matches.length,
        scheduledMatches: statusCounts.SCHEDULED || 0,
        scaleAcceptedMatches: statusCounts.SCALE_ACCEPTED || 0,
        inProgressMatches: statusCounts.IN_PROGRESS || 0,
        controlDoneMatches: statusCounts.CONTROL_DONE || 0,
        canceledMatches: statusCounts.CANCELED || 0,
        totalScales: scaleRows.length,
        confirmedScales,
        pendingScales,
        refusedScales,
        pendingMatches: pendingMatches.length,
        documentsComplete: documents.filter(
          (document) => document.missionOrderSent && document.athleteListSent && document.finalDocumentSent,
        ).length,
      },
      statusBreakdown: Object.entries(MATCH_STATUS_LABELS).map(([status, label]) => ({
        status,
        label,
        total: statusCounts[status] || 0,
      })),
      pendingSummary,
      byOfficial,
      byChampionship,
      byStadium,
      pendingMatches: pendingMatches.slice(0, 100),
      documents: documents.slice(0, 150),
    };
  }
}
