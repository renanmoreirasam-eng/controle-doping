import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubstitutionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    matchId: string;
    team: string;
    playerOutName: string;
    playerOutNumber: string;
    playerInName: string;
    playerInNumber: string;
    minute?: number;
    period?: string;
    notes?: string;
  }) {
    return this.prisma.substitution.create({
      data,
      include: {
        match: {
          include: {
            championship: true,
            stadium: true,
          },
        },
      },
    });
  }

  async findAll(matchId?: string) {
    return this.prisma.substitution.findMany({
      where: matchId ? { matchId } : undefined,
      include: {
        match: {
          include: {
            championship: true,
            stadium: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(id: string) {
    return this.prisma.substitution.delete({
      where: {
        id,
      },
    });
  }
}
