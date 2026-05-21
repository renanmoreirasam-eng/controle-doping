import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DrawsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    matchId: string;
    players: {
      team: string;
      name: string;
      nickname?: string;
      number: string;
      type: 'EXAME' | 'RESERVA';
    }[];
  }) {
    return this.prisma.draw.create({
      data: {
        matchId: data.matchId,
        players: {
          create: data.players,
        },
      },
      include: {
        players: true,
        match: true,
      },
    });
  }

  async findAll() {
    return this.prisma.draw.findMany({
      include: {
        players: true,
        match: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}