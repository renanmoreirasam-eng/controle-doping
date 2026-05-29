import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AnnouncementTargetRole,
  UserRole,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type AuthUser = {
  sub?: string;
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  role?: UserRole | string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole | string;
  };
};

type CreateAnnouncementData = {
  title: string;
  message: string;
  targetRole: AnnouncementTargetRole;
};

type UpdateAnnouncementData = {
  title?: string;
  message?: string;
  targetRole?: AnnouncementTargetRole;
  active?: boolean;
};

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  private getUserId(user?: AuthUser) {
    return user?.sub || user?.id || user?.userId || user?.user?.id || null;
  }

  private getUserRole(user?: AuthUser) {
    return String(user?.role || user?.user?.role || '')
      .trim()
      .toUpperCase();
  }

  private getUserName(user?: AuthUser) {
    return user?.name || user?.user?.name || null;
  }

  private getUserEmail(user?: AuthUser) {
    return user?.email || user?.user?.email || null;
  }

  private normalizeTargetRole(value?: string) {
    const role = String(value || AnnouncementTargetRole.ALL)
      .trim()
      .toUpperCase();

    if (
      role !== AnnouncementTargetRole.ALL &&
      role !== AnnouncementTargetRole.COORDINATOR &&
      role !== AnnouncementTargetRole.OFFICIAL
    ) {
      throw new BadRequestException('Público-alvo do comunicado inválido.');
    }

    return role as AnnouncementTargetRole;
  }

  async create(data: CreateAnnouncementData, user?: AuthUser) {
    const title = data.title?.trim();
    const message = data.message?.trim();

    if (!title) {
      throw new BadRequestException('Informe o título do comunicado.');
    }

    if (!message) {
      throw new BadRequestException('Informe a mensagem do comunicado.');
    }

    return this.prisma.announcement.create({
      data: {
        title,
        message,
        targetRole: this.normalizeTargetRole(data.targetRole),
        active: true,
        createdByUserId: this.getUserId(user),
        createdByName: this.getUserName(user),
        createdByEmail: this.getUserEmail(user),
      },
      include: {
        _count: {
          select: {
            acknowledgements: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            acknowledgements: true,
          },
        },
      },
    });
  }

  async findPendingForMe(user?: AuthUser) {
    const userId = this.getUserId(user);

    if (!userId) {
      return [];
    }

    const role = this.getUserRole(user);

    const targetRoles: AnnouncementTargetRole[] = [
      AnnouncementTargetRole.ALL,
    ];

    if (role === 'COORDINATOR') {
      targetRoles.push(AnnouncementTargetRole.COORDINATOR);
    }

    if (role === 'OFFICIAL') {
      targetRoles.push(AnnouncementTargetRole.OFFICIAL);
    }

    return this.prisma.announcement.findMany({
      where: {
        active: true,
        targetRole: {
          in: targetRoles,
        },
        acknowledgements: {
          none: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async acknowledge(id: string, user?: AuthUser) {
    const userId = this.getUserId(user);

    if (!userId) {
      throw new BadRequestException('Usuário não identificado.');
    }

    const announcement = await this.prisma.announcement.findUnique({
      where: {
        id,
      },
    });

    if (!announcement || !announcement.active) {
      throw new NotFoundException('Comunicado não encontrado.');
    }

    return this.prisma.announcementAcknowledgement.upsert({
      where: {
        announcementId_userId: {
          announcementId: id,
          userId,
        },
      },
      update: {
        acknowledgedAt: new Date(),
      },
      create: {
        announcementId: id,
        userId,
      },
    });
  }

  async update(id: string, data: UpdateAnnouncementData) {
    const updateData: UpdateAnnouncementData = {};

    if (data.title !== undefined) {
      const title = data.title.trim();

      if (!title) {
        throw new BadRequestException('Informe o título do comunicado.');
      }

      updateData.title = title;
    }

    if (data.message !== undefined) {
      const message = data.message.trim();

      if (!message) {
        throw new BadRequestException('Informe a mensagem do comunicado.');
      }

      updateData.message = message;
    }

    if (data.targetRole !== undefined) {
      updateData.targetRole = this.normalizeTargetRole(data.targetRole);
    }

    if (data.active !== undefined) {
      updateData.active = Boolean(data.active);
    }

    return this.prisma.announcement.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        _count: {
          select: {
            acknowledgements: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.announcement.delete({
      where: {
        id,
      },
    });
  }
}
