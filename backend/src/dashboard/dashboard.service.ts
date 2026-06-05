import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type AuthUser = {
  id?: string;
  sub?: string;
  userId?: string;
  email?: string;
  role?: string;
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private getUserId(user: AuthUser) {
    return user?.id || user?.sub || user?.userId || user?.user?.id || null;
  }

  private getUserEmail(user: AuthUser) {
    return user?.email || user?.user?.email || null;
  }

  private getUserRole(user: AuthUser) {
    return String(user?.role || user?.user?.role || '').toUpperCase();
  }

  private getOwnScaleWhere(user: AuthUser) {
    const userId = this.getUserId(user);
    const userEmail = this.getUserEmail(user);

    return {
      OR: [
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
      ],
    };
  }

  private emptyScaleWhere() {
    return {
      id: '__NO_SCALE__',
    };
  }

  private matchSelect() {
    return {
      id: true,
      homeTeam: true,
      awayTeam: true,
      matchDate: true,
      status: true,
      missionOrderFileName: true,
      missionOrderFileType: true,
      missionOrderFileData: true,
      championship: {
        select: {
          name: true,
        },
      },
      stadium: {
        select: {
          name: true,
          city: true,
          state: true,
        },
      },
    };
  }

  private scaleSelect() {
    return {
      id: true,
      matchId: true,
      officialId: true,
      confirmed: true,
      official: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      match: {
        select: this.matchSelect(),
      },
    };
  }

  private hasMissionOrder(match: {
    missionOrderFileData?: string | null;
    missionOrderFileName?: string | null;
    missionOrderFileType?: string | null;
  }) {
    return Boolean(
      match.missionOrderFileData ||
        match.missionOrderFileName ||
        match.missionOrderFileType,
    );
  }

  private buildMatchLabel(match?: {
    homeTeam?: string | null;
    awayTeam?: string | null;
  } | null) {
    if (!match) return null;

    return `${match.homeTeam || ''} x ${match.awayTeam || ''}`.trim();
  }

  async getSummary(user: AuthUser) {
    const isAdmin = this.getUserRole(user) === 'ADMIN';
    const ownScaleWhere = this.getOwnScaleWhere(user);
    const hasUserFilter = ownScaleWhere.OR.length > 0;

    const scaleBaseWhere = isAdmin
      ? {}
      : hasUserFilter
        ? ownScaleWhere
        : this.emptyScaleWhere();

    const completedMatchWhere = isAdmin
      ? {
          status: 'CONTROL_DONE' as const,
        }
      : {
          status: 'CONTROL_DONE' as const,
          officials: {
            some: hasUserFilter ? ownScaleWhere : this.emptyScaleWhere(),
          },
        };

    const [
      pendingScalesCount,
      refusedScalesCount,
      completedMatchesCount,
      recentCompletedMatches,
      nextPendingScaleCandidates,
      scalesWithoutMissionOrderCandidates,
    ] = await Promise.all([
      this.prisma.matchOfficial.count({
        where: {
          ...scaleBaseWhere,
          confirmed: null,
        },
      }),
      isAdmin
        ? this.prisma.matchOfficial.count({
            where: {
              confirmed: false,
            },
          })
        : Promise.resolve(0),
      this.prisma.match.count({
        where: completedMatchWhere,
      }),
      this.prisma.match.findMany({
        where: completedMatchWhere,
        select: this.matchSelect(),
        orderBy: {
          matchDate: 'desc',
        },
        take: 5,
      }),
      this.prisma.matchOfficial.findMany({
        where: {
          ...scaleBaseWhere,
          confirmed: null,
        },
        select: this.scaleSelect(),
        take: 20,
      }),
      isAdmin
        ? this.prisma.matchOfficial.findMany({
            where: {
              match: {
                status: {
                  notIn: ['CONTROL_DONE', 'CANCELED'],
                },
              },
            },
            select: {
              match: {
                select: this.matchSelect(),
              },
            },
          })
        : Promise.resolve([]),
    ]);

    const nextPendingScale =
      nextPendingScaleCandidates
        .filter((scale) => scale.match)
        .sort((a, b) => {
          const dateA = a.match?.matchDate
            ? new Date(a.match.matchDate).getTime()
            : 0;
          const dateB = b.match?.matchDate
            ? new Date(b.match.matchDate).getTime()
            : 0;

          return dateA - dateB;
        })[0] || null;

    const scalesWithoutMissionOrderMap = new Map<string, any>();

    if (isAdmin) {
      for (const item of scalesWithoutMissionOrderCandidates as any[]) {
        const match = item.match;

        if (!match?.id) continue;
        if (this.hasMissionOrder(match)) continue;

        scalesWithoutMissionOrderMap.set(match.id, match);
      }
    }

    return {
      isAdmin,
      pendingScalesCount,
      refusedScalesCount,
      scalesWithoutMissionOrderCount: scalesWithoutMissionOrderMap.size,
      completedMatchesCount,
      recentCompletedMatches,
      nextPendingScale: nextPendingScale
        ? {
            id: nextPendingScale.id,
            confirmed: nextPendingScale.confirmed,
            matchId: nextPendingScale.matchId,
            matchLabel: this.buildMatchLabel(nextPendingScale.match),
            match: nextPendingScale.match,
            official: nextPendingScale.official,
          }
        : null,
    };
  }
}
