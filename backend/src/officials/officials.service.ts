import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OfficialsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    phone?: string;
    pixKey?: string;
  }) {
    return this.prisma.official.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async createFull(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    pixKey?: string;
    role?: string;
  }) {
    const hashedPassword = await bcrypt.hash(
      data.password,
      10,
    );

    return this.prisma.official.create({
      data: {
        phone: data.phone,
        pixKey: data.pixKey,

        user: {
          create: {
            name: data.name,
            email: data.email,
            password: hashedPassword,

            role: (data.role as UserRole) || UserRole.OFFICIAL,
          },
        },
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      pixKey?: string;
      active?: boolean;
      role?: string;
    },
  ) {
    const official =
      await this.prisma.official.findUnique({
        where: { id },
      });

    if (!official) {
      throw new Error(
        'Oficial não encontrado',
      );
    }

    return this.prisma.official.update({
      where: { id },

      data: {
        phone: data.phone,
        pixKey: data.pixKey,
        active: data.active,

        user: {
          update: {
            name: data.name,
            email: data.email,
            role: data.role ? (data.role as UserRole) : undefined,
          },
        },
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.official.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}