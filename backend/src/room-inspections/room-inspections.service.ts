import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomInspectionsService {
  constructor(private prisma: PrismaService) {}

  private includeRelations = {
    items: true,
    photos: true,
    match: {
      include: {
        championship: true,
        stadium: true,
      },
    },
  };

  async create(data: {
    matchId: string;
    status: string;
    notes?: string;
    items: {
      label: string;
      status: string;
      notes?: string;
    }[];
    photos?: {
      fileName: string;
      dataUrl: string;
    }[];
  }) {
    return this.prisma.roomInspection.create({
      data: {
        matchId: data.matchId,
        status: data.status,
        notes: data.notes,
        items: {
          create: data.items,
        },
        photos: {
          create: data.photos || [],
        },
      },
      include: this.includeRelations,
    });
  }

  async findAll() {
    return this.prisma.roomInspection.findMany({
      include: this.includeRelations,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByMatch(matchId: string) {
    return this.prisma.roomInspection.findMany({
      where: {
        matchId,
      },
      include: this.includeRelations,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByStadium(stadiumId: string) {
    return this.prisma.roomInspection.findMany({
      where: {
        match: {
          stadiumId,
        },
      },
      include: this.includeRelations,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.roomInspectionPhoto.deleteMany({
        where: {
          inspectionId: id,
        },
      });

      await tx.roomInspectionItem.deleteMany({
        where: {
          inspectionId: id,
        },
      });

      return tx.roomInspection.delete({
        where: {
          id,
        },
      });
    });
  }
}
