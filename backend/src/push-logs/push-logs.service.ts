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
}