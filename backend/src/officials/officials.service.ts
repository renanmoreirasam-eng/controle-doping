import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

type OfficialPersonalData = {
  name?: string;
  phone?: string;
  pixKey?: string;
  documentType?: string;
  documentNumber?: string;
  cpf?: string;
  birthDate?: string | Date | null;
  address?: string;
  shirtSize?: string;
  operationalRole?: string;
};

@Injectable()
export class OfficialsService {
  constructor(private prisma: PrismaService) {}

  private normalizeOptional(value?: string | null) {
    const normalized = String(value || '').trim();
    return normalized || null;
  }

  private parseBirthDate(value?: string | Date | null) {
    if (!value) return null;

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const text = String(value).trim();

    if (!text) return null;

    const brazilianDateMatch = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (brazilianDateMatch) {
      const [, day, month, year] = brazilianDateMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private buildPersonalData(data: OfficialPersonalData) {
    const personalData: Record<string, any> = {};

    if ('phone' in data) {
      personalData.phone = this.normalizeOptional(data.phone);
    }

    if ('pixKey' in data) {
      personalData.pixKey = this.normalizeOptional(data.pixKey);
    }

    if ('documentType' in data) {
      personalData.documentType = this.normalizeOptional(data.documentType);
    }

    if ('documentNumber' in data) {
      personalData.documentNumber = this.normalizeOptional(data.documentNumber);
    }

    if ('cpf' in data) {
      personalData.cpf = this.normalizeOptional(data.cpf);
    }

    if ('birthDate' in data) {
      personalData.birthDate = this.parseBirthDate(data.birthDate);
    }

    if ('address' in data) {
      personalData.address = this.normalizeOptional(data.address);
    }

    if ('shirtSize' in data) {
      personalData.shirtSize = this.normalizeOptional(data.shirtSize);
    }

    if ('operationalRole' in data) {
      personalData.operationalRole = this.normalizeOptional(data.operationalRole);
    }

    if (Object.keys(personalData).length > 0) {
      personalData.personalDataUpdatedAt = new Date();
    }

    return personalData;
  }

  private userSelect() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  async create(data: {
    userId: string;
    phone?: string;
    pixKey?: string;
    documentType?: string;
    documentNumber?: string;
    cpf?: string;
    birthDate?: string | Date | null;
    address?: string;
    shirtSize?: string;
    operationalRole?: string;
  }) {
    return this.prisma.official.create({
      data: {
        userId: data.userId,
        ...this.buildPersonalData(data),
      },
      include: {
        user: {
          select: this.userSelect(),
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
    documentType?: string;
    documentNumber?: string;
    cpf?: string;
    birthDate?: string | Date | null;
    address?: string;
    shirtSize?: string;
    operationalRole?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.official.create({
      data: {
        ...this.buildPersonalData(data),

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
          select: this.userSelect(),
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
      documentType?: string;
      documentNumber?: string;
      cpf?: string;
      birthDate?: string | Date | null;
      address?: string;
      shirtSize?: string;
      operationalRole?: string;
    },
  ) {
    const official = await this.prisma.official.findUnique({
      where: { id },
    });

    if (!official) {
      throw new Error('Oficial não encontrado');
    }

    return this.prisma.official.update({
      where: { id },

      data: {
        ...this.buildPersonalData(data),
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
          select: this.userSelect(),
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.official.findUnique({
      where: { userId },
      include: {
        user: {
          select: this.userSelect(),
        },
      },
    });
  }

  async updateMe(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      pixKey?: string;
      documentType?: string;
      documentNumber?: string;
      cpf?: string;
      birthDate?: string | Date | null;
      address?: string;
      shirtSize?: string;
    },
  ) {
    const official = await this.prisma.official.findUnique({
      where: { userId },
    });

    if (!official) {
      throw new Error('Oficial não encontrado para este usuário.');
    }

    return this.prisma.official.update({
      where: { id: official.id },
      data: {
        ...this.buildPersonalData({
          phone: data.phone,
          pixKey: data.pixKey,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          cpf: data.cpf,
          birthDate: data.birthDate,
          address: data.address,
          shirtSize: data.shirtSize,
        }),
        user: data.name
          ? {
              update: {
                name: data.name,
              },
            }
          : undefined,
      },
      include: {
        user: {
          select: this.userSelect(),
        },
      },
    });
  }

  async findAll(user?: { role?: string }) {
    if (user?.role !== UserRole.ADMIN) {
      return this.prisma.official.findMany({
        select: {
          id: true,
          phone: true,
          address: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return this.prisma.official.findMany({
      include: {
        user: {
          select: this.userSelect(),
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
