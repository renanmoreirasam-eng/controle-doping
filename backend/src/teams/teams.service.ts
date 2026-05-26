import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    shortName?: string;
    cnpj?: string | null;
    city: string;
    state: string;
    category?: string;
    isActive?: boolean;
  }) {
    const exists = await this.prisma.team.findFirst({
      where: {
        name: { equals: data.name, mode: 'insensitive' },
        state: data.state,
      },
    });

    if (exists) {
      throw new BadRequestException('Time já cadastrado.');
    }

    return this.prisma.team.create({
      data: {
        ...data,
        cnpj: data.cnpj?.trim() || null,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      shortName?: string;
      cnpj?: string | null;
      city?: string;
      state?: string;
      category?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.team.update({
      where: { id },
      data: {
        ...data,
        cnpj:
          data.cnpj === undefined
            ? undefined
            : data.cnpj?.trim() || null,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.team.delete({
      where: { id },
    });
  }

  async findOne(id: string) {
    return this.prisma.team.findUnique({
      where: { id },
    });
  }

  async findAll() {
    return this.prisma.team.findMany({
      orderBy: [
        { state: 'asc' },
        { city: 'asc' },
        { name: 'asc' },
      ],
    });
  }
}