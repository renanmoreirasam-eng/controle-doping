import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type AuthUser = {
  sub?: string;
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
};

type CreateAdminTaskData = {
  title: string;
  description?: string | null;
  dueDate: string;
  remindAt?: string | null;
};

type UpdateAdminTaskData = {
  title?: string;
  description?: string | null;
  dueDate?: string;
  remindAt?: string | null;
  done?: boolean;
};

@Injectable()
export class AdminTasksService {
  constructor(private prisma: PrismaService) {}

  private getUserId(user?: AuthUser) {
    return user?.sub || user?.id || user?.userId || user?.user?.id || null;
  }

  private getUserName(user?: AuthUser) {
    return user?.name || user?.user?.name || null;
  }

  private getUserEmail(user?: AuthUser) {
    return user?.email || user?.user?.email || null;
  }

  private parseDate(value: string | null | undefined, fieldLabel: string) {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldLabel} inválida.`);
    }

    return date;
  }

  async create(data: CreateAdminTaskData, user?: AuthUser) {
    const title = data.title?.trim();

    if (!title) {
      throw new BadRequestException('Informe o título da atividade.');
    }

    const dueDate = this.parseDate(data.dueDate, 'Data da atividade');

    if (!dueDate) {
      throw new BadRequestException('Informe a data da atividade.');
    }

    const remindAt = this.parseDate(data.remindAt, 'Data do lembrete');

    return this.prisma.adminTask.create({
      data: {
        title,
        description: data.description?.trim() || null,
        dueDate,
        remindAt,
        done: false,
        doneAt: null,
        createdByUserId: this.getUserId(user),
        createdByName: this.getUserName(user),
        createdByEmail: this.getUserEmail(user),
      },
    });
  }

  async findAll() {
    return this.prisma.adminTask.findMany({
      orderBy: [
        {
          done: 'asc',
        },
        {
          dueDate: 'asc',
        },
      ],
    });
  }

  async update(id: string, data: UpdateAdminTaskData) {
    const current = await this.prisma.adminTask.findUnique({
      where: {
        id,
      },
    });

    if (!current) {
      throw new NotFoundException('Atividade não encontrada.');
    }

    const updateData: any = {};

    if (data.title !== undefined) {
      const title = data.title.trim();

      if (!title) {
        throw new BadRequestException('Informe o título da atividade.');
      }

      updateData.title = title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }

    if (data.dueDate !== undefined) {
      const dueDate = this.parseDate(data.dueDate, 'Data da atividade');

      if (!dueDate) {
        throw new BadRequestException('Informe a data da atividade.');
      }

      updateData.dueDate = dueDate;
    }

    if (data.remindAt !== undefined) {
      updateData.remindAt = this.parseDate(data.remindAt, 'Data do lembrete');
    }

    if (data.done !== undefined) {
      updateData.done = Boolean(data.done);
      updateData.doneAt = data.done ? current.doneAt || new Date() : null;
    }

    return this.prisma.adminTask.update({
      where: {
        id,
      },
      data: updateData,
    });
  }

  async toggleDone(id: string, done?: boolean) {
    const current = await this.prisma.adminTask.findUnique({
      where: {
        id,
      },
    });

    if (!current) {
      throw new NotFoundException('Atividade não encontrada.');
    }

    const nextDone = done === undefined ? !current.done : Boolean(done);

    return this.prisma.adminTask.update({
      where: {
        id,
      },
      data: {
        done: nextDone,
        doneAt: nextDone ? current.doneAt || new Date() : null,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.adminTask.delete({
      where: {
        id,
      },
    });
  }
}
