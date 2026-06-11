import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushLogsService {
  constructor(private readonly prisma: PrismaService) {}

  private parsePositiveInteger(value: string | undefined, fallback: number) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return Math.floor(parsed);
  }

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

  async findAll(query: {
    search?: string;
    status?: string;
    module?: string;
    userRole?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
    limit?: string;
  }) {
    const page = this.parsePositiveInteger(query.page, 1);
    const limit = Math.min(this.parsePositiveInteger(query.limit, 20), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.PushNotificationLogWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.module) {
      where.module = query.module;
    }

    if (query.userRole) {
      where.userRole = query.userRole;
    }

    const sentAtRange = this.buildDateRange(query.startDate, query.endDate);

    if (sentAtRange) {
      where.sentAt = sentAtRange;
    }

    const search = query.search?.trim();

    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { module: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } },
      ];
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [data, total, totalSent, totalFailed, totalPartial, totalNoSubscription, sentToday] =
      await this.prisma.$transaction([
        this.prisma.pushNotificationLog.findMany({
          where,
          orderBy: {
            sentAt: 'desc',
          },
          skip,
          take: limit,
        }),
        this.prisma.pushNotificationLog.count({ where }),
        this.prisma.pushNotificationLog.count({ where: { status: 'SENT' } }),
        this.prisma.pushNotificationLog.count({ where: { status: 'FAILED' } }),
        this.prisma.pushNotificationLog.count({ where: { status: 'PARTIAL' } }),
        this.prisma.pushNotificationLog.count({ where: { status: 'NO_SUBSCRIPTION' } }),
        this.prisma.pushNotificationLog.count({
          where: {
            sentAt: {
              gte: todayStart,
            },
          },
        }),
      ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
      summary: {
        totalSent,
        totalFailed,
        totalPartial,
        totalNoSubscription,
        sentToday,
      },
    };
  }

  private buildUserSubscriptionWhere(query: {
    search?: string;
    userRole?: string;
  }) {
    const where: Prisma.UserWhereInput = {};

    if (query.userRole) {
      where.role = query.userRole as any;
    }

    const search = query.search?.trim();

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findSubscriptionUsers(query: {
    search?: string;
    userRole?: string;
    status?: 'ALL' | 'ENABLED' | 'DISABLED';
    page?: string;
    limit?: string;
  }) {
    const page = this.parsePositiveInteger(query.page, 1);
    const limit = Math.min(this.parsePositiveInteger(query.limit, 20), 100);
    const skip = (page - 1) * limit;
    const status = query.status || 'ALL';

    const baseWhere = this.buildUserSubscriptionWhere(query);
    const where: Prisma.UserWhereInput = { ...baseWhere };

    if (status === 'ENABLED') {
      where.pushSubscriptions = {
        some: {},
      };
    }

    if (status === 'DISABLED') {
      where.pushSubscriptions = {
        none: {},
      };
    }

    const [users, total, enabledUsers, disabledUsers, totalUsers] =
      await this.prisma.$transaction([
        this.prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            pushSubscriptions: {
              select: {
                id: true,
                endpoint: true,
                userAgent: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: {
                updatedAt: 'desc',
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
          skip,
          take: limit,
        }),
        this.prisma.user.count({ where }),
        this.prisma.user.count({
          where: {
            ...baseWhere,
            pushSubscriptions: {
              some: {},
            },
          },
        }),
        this.prisma.user.count({
          where: {
            ...baseWhere,
            pushSubscriptions: {
              none: {},
            },
          },
        }),
        this.prisma.user.count({ where: baseWhere }),
      ]);

    const data = users.map((user) => {
      const lastSubscription = user.pushSubscriptions[0];

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        pushEnabled: user.pushSubscriptions.length > 0,
        subscriptionCount: user.pushSubscriptions.length,
        lastSubscriptionAt: lastSubscription?.updatedAt || null,
        createdAt: user.createdAt,
        subscriptions: user.pushSubscriptions.map((subscription) => ({
          id: subscription.id,
          userAgent: subscription.userAgent,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
        })),
      };
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
      summary: {
        totalUsers,
        enabledUsers,
        disabledUsers,
      },
    };
  }
}
