import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChampionshipsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string }) {
    const exists = await this.prisma.championship.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
      },
    });

    if (exists) {
      throw new BadRequestException('Campeonato já cadastrado.');
    }

    return this.prisma.championship.create({
      data: {
        name: data.name,
      },
    });
  }

  async update(id: string, data: { name: string }) {
    const exists = await this.prisma.championship.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive',
        },
        NOT: {
          id,
        },
      },
    });

    if (exists) {
      throw new BadRequestException('Já existe outro campeonato com esse nome.');
    }

    return this.prisma.championship.update({
      where: {
        id,
      },
      data: {
        name: data.name,
      },
    });
  }

  async remove(id: string) {
    const matches = await this.prisma.match.count({
      where: {
        championshipId: id,
      },
    });

    if (matches > 0) {
      throw new BadRequestException(
        'Não é possível excluir campeonato com jogos vinculados.',
      );
    }

    return this.prisma.championship.delete({
      where: {
        id,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.championship.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll() {
    return this.prisma.championship.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}