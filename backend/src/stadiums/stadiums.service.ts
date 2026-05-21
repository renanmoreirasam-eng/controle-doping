import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StadiumsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    city: string;
    state: string;
    address?: string;
    cep?: string;
  }) {
    const exists = await this.prisma.stadium.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
        city: {
          equals: data.city,
          mode: 'insensitive',
        },
        state: data.state,
      },
    });

    if (exists) {
      throw new BadRequestException('Estádio já cadastrado nesta cidade.');
    }

    return this.prisma.stadium.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      city?: string;
      state?: string;
      address?: string;
      cep?: string;
    },
  ) {
    return this.prisma.stadium.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const matches = await this.prisma.match.count({
      where: {
        stadiumId: id,
      },
    });

    if (matches > 0) {
      throw new BadRequestException(
        'Não é possível excluir estádio com jogos vinculados.',
      );
    }

    return this.prisma.stadium.delete({
      where: { id },
    });
  }

  async findOne(id: string) {
    return this.prisma.stadium.findUnique({
      where: { id },
    });
  }

  async findAll() {
    return this.prisma.stadium.findMany({
      orderBy: [
        { state: 'asc' },
        { city: 'asc' },
        { name: 'asc' },
      ],
    });
  }
}