import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  role: "ADMIN" | "COORDINATOR" | "OFFICIAL";
};

type CreateKitEntryDto = {
  quantity: number;
  initialNumber: string;
  finalNumber: string;
  notes?: string;
};

type TransferKitsDto = {
  officialId: string;
  initialNumber?: string;
  finalNumber?: string;
  kitNumbers?: string[];
  notes?: string;
};


type MoveKitDto = {
  officialId: string;
  notes?: string;
};

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureAdmin(user: AuthUser) {
    if (user.role !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem realizar esta ação.",
      );
    }
  }

  private generateNumbers(initialNumber: string, finalNumber: string) {
    const start = Number(initialNumber);
    const end = Number(finalNumber);

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new BadRequestException(
        "Número inicial e final devem ser numéricos.",
      );
    }

    if (end < start) {
      throw new BadRequestException(
        "Número final deve ser maior ou igual ao inicial.",
      );
    }

    const paddingSize = Math.max(initialNumber.length, finalNumber.length);
    const numbers: string[] = [];

    for (let current = start; current <= end; current += 1) {
      numbers.push(String(current).padStart(paddingSize, "0"));
    }

    return numbers;
  }

  async getSummary(user: AuthUser) {
    if (user.role !== "ADMIN") {
      const official = await this.prisma.official.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          kits: {
            where: {
              status: {
                in: ["COM_DCO", "UTILIZADO", "ENVIADO_LABORATORIO"],
              },
            },
            select: {
              id: true,
              number: true,
              status: true,
            },
            orderBy: {
              number: "asc",
            },
          },
        },
      });

      if (!official) {
        return {
          total: 0,
          disponivel: 0,
          comDco: 0,
          vinculadoJogo: 0,
          utilizado: 0,
          enviadoLaboratorio: 0,
          cancelado: 0,
          byDco: [],
        };
      }

      const total = official.kits.length;

      return {
        total,
        disponivel: 0,
        comDco: official.kits.filter((kit) => kit.status === "COM_DCO").length,
        vinculadoJogo: 0,
        utilizado: official.kits.filter((kit) => kit.status === "UTILIZADO")
          .length,
        enviadoLaboratorio: official.kits.filter(
          (kit) => kit.status === "ENVIADO_LABORATORIO",
        ).length,
        cancelado: 0,
        byDco: [
          {
            officialId: official.id,
            name: official.user.name,
            email: official.user.email,
            total,
            kits: official.kits,
          },
        ],
      };
    }

    const [
      total,
      disponivel,
      comDco,
      vinculadoJogo,
      utilizado,
      enviadoLaboratorio,
      cancelado,
      byDco,
    ] = await Promise.all([
      this.prisma.kit.count(),
      this.prisma.kit.count({ where: { status: "DISPONIVEL" } }),
      this.prisma.kit.count({ where: { status: "COM_DCO" } }),
      this.prisma.kit.count({ where: { status: "VINCULADO_JOGO" } }),
      this.prisma.kit.count({ where: { status: "UTILIZADO" } }),
      this.prisma.kit.count({ where: { status: "ENVIADO_LABORATORIO" } }),
      this.prisma.kit.count({ where: { status: "CANCELADO" } }),
      this.prisma.official.findMany({
        where: {
          kits: {
            some: {
              status: "COM_DCO",
            },
          },
        },
        select: {
          id: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          kits: {
            where: {
              status: "COM_DCO",
            },
            select: {
              id: true,
              number: true,
              status: true,
            },
            orderBy: {
              number: "asc",
            },
          },
        },
        orderBy: {
          user: {
            name: "asc",
          },
        },
      }),
    ]);

    return {
      total,
      disponivel,
      comDco,
      vinculadoJogo,
      utilizado,
      enviadoLaboratorio,
      cancelado,
      byDco: byDco.map((official) => ({
        officialId: official.id,
        name: official.user.name,
        email: official.user.email,
        total: official.kits.length,
        kits: official.kits,
      })),
    };
  }

  async listKits(
    user: AuthUser,
    query: {
      status?: string;
      officialId?: string;
      number?: string;
    },
  ) {
    if (user.role !== "ADMIN") {
      return this.listMyKits(user);
    }

    return this.prisma.kit.findMany({
      where: {
        ...(query.status ? { status: query.status as any } : {}),
        ...(query.officialId ? { currentOfficialId: query.officialId } : {}),
        ...(query.number
          ? {
              number: {
                contains: query.number,
                mode: "insensitive",
              },
            }
          : {}),
      },
      include: {
        currentOfficial: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        matchKits: {
          include: {
            match: {
              select: {
                id: true,
                homeTeam: true,
                awayTeam: true,
                matchDate: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        number: "asc",
      },
    });
  }

  async createEntry(user: AuthUser, data: CreateKitEntryDto) {
    this.ensureAdmin(user);

    const quantity = Number(data.quantity);
    const numbers = this.generateNumbers(data.initialNumber, data.finalNumber);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException("Quantidade deve ser maior que zero.");
    }

    if (numbers.length !== quantity) {
      throw new BadRequestException(
        `Quantidade informada não bate com a sequência. Sequência possui ${numbers.length} kit(s).`,
      );
    }

    const existingKits = await this.prisma.kit.findMany({
      where: {
        number: {
          in: numbers,
        },
      },
      select: {
        number: true,
      },
    });

    if (existingKits.length > 0) {
      throw new BadRequestException(
        `Já existem kits cadastrados nesta sequência: ${existingKits
          .map((kit) => kit.number)
          .join(", ")}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.kit.createMany({
        data: numbers.map((number) => ({
          number,
          status: "DISPONIVEL",
        })),
      });

      const createdKits = await tx.kit.findMany({
        where: {
          number: {
            in: numbers,
          },
        },
        select: {
          id: true,
          number: true,
        },
      });

      await tx.kitMovement.createMany({
        data: createdKits.map((kit) => ({
          kitId: kit.id,
          type: "ENTRADA_ESTOQUE",
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          notes:
            data.notes ||
            `Entrada de estoque: ${data.initialNumber} até ${data.finalNumber}`,
        })),
      });

      return {
        message: "Entrada de kits cadastrada com sucesso.",
        quantity: createdKits.length,
        initialNumber: data.initialNumber,
        finalNumber: data.finalNumber,
        kits: createdKits.sort((a, b) => a.number.localeCompare(b.number)),
      };
    });
  }

  async transferToDco(user: AuthUser, data: TransferKitsDto) {
    this.ensureAdmin(user);

    const numbers =
      data.kitNumbers && data.kitNumbers.length > 0
        ? Array.from(
            new Set(
              data.kitNumbers
                .map((number) => String(number || "").trim())
                .filter(Boolean),
            ),
          )
        : this.generateNumbers(
            String(data.initialNumber || ""),
            String(data.finalNumber || ""),
          );

    if (numbers.length === 0) {
      throw new BadRequestException(
        "Selecione pelo menos um kit para repasse.",
      );
    }

    const official = await this.prisma.official.findUnique({
      where: {
        id: data.officialId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!official) {
      throw new NotFoundException("DCO não encontrado.");
    }

    if (!official.active) {
      throw new BadRequestException(
        "Não é possível repassar kits para um DCO inativo.",
      );
    }

    const kits = await this.prisma.kit.findMany({
      where: {
        number: {
          in: numbers,
        },
      },
      select: {
        id: true,
        number: true,
        status: true,
        currentOfficialId: true,
      },
    });

    if (kits.length !== numbers.length) {
      const foundNumbers = kits.map((kit) => kit.number);
      const missingNumbers = numbers.filter(
        (number) => !foundNumbers.includes(number),
      );

      throw new BadRequestException(
        `Alguns kits não existem no estoque: ${missingNumbers.join(", ")}`,
      );
    }

    const unavailableKits = kits.filter((kit) => kit.status !== "DISPONIVEL");

    if (unavailableKits.length > 0) {
      throw new BadRequestException(
        `Alguns kits não estão disponíveis: ${unavailableKits
          .map((kit) => `${kit.number} (${kit.status})`)
          .join(", ")}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.kit.updateMany({
        where: {
          id: {
            in: kits.map((kit) => kit.id),
          },
        },
        data: {
          status: "COM_DCO",
          currentOfficialId: data.officialId,
        },
      });

      await tx.kitMovement.createMany({
        data: kits.map((kit) => ({
          kitId: kit.id,
          type: "REPASSE_DCO",
          toOfficialId: data.officialId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          notes:
            data.notes ||
            `Repasse para DCO ${official.user.name}: ${numbers.join(", ")}`,
        })),
      });

      return {
        message: "Kits repassados para o DCO com sucesso.",
        official: {
          id: official.id,
          name: official.user.name,
          email: official.user.email,
        },
        quantity: kits.length,
        kits: kits
          .map((kit) => ({
            id: kit.id,
            number: kit.number,
          }))
          .sort((a, b) => a.number.localeCompare(b.number)),
      };
    });
  }

  async listMyKits(user: AuthUser) {
    const official = await this.prisma.official.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!official) {
      return [];
    }

    return this.prisma.kit.findMany({
      where: {
        currentOfficialId: official.id,
        status: {
          in: ["COM_DCO", "UTILIZADO", "ENVIADO_LABORATORIO"],
        },
      },
      include: {
        matchKits: {
          include: {
            match: {
              select: {
                id: true,
                homeTeam: true,
                awayTeam: true,
                matchDate: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        number: "asc",
      },
    });
  }

  async listKitsByOfficial(user: AuthUser, officialId: string) {
    if (user.role !== "ADMIN") {
      const official = await this.prisma.official.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      if (!official || official.id !== officialId) {
        throw new ForbiddenException(
          "Você só pode consultar kits associados ao seu próprio cadastro.",
        );
      }
    }

    return this.prisma.kit.findMany({
      where: {
        currentOfficialId: officialId,
      },
      include: {
        currentOfficial: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        number: "asc",
      },
    });
  }

  async listMovements(user: AuthUser, kitId?: string) {
    if (user.role !== "ADMIN") {
      const official = await this.prisma.official.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      if (!official) {
        return [];
      }

      return this.prisma.kitMovement.findMany({
        where: {
          ...(kitId ? { kitId } : {}),
          OR: [
            { fromOfficialId: official.id },
            { toOfficialId: official.id },
            {
              kit: {
                currentOfficialId: official.id,
              },
            },
          ],
        },
        include: {
          kit: true,
          fromOfficial: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          toOfficial: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          match: {
            select: {
              id: true,
              homeTeam: true,
              awayTeam: true,
              matchDate: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return this.prisma.kitMovement.findMany({
      where: {
        ...(kitId ? { kitId } : {}),
      },
      include: {
        kit: true,
        fromOfficial: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        toOfficial: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        match: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
            matchDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }


  async deleteKit(user: AuthUser, kitId: string) {
    this.ensureAdmin(user);

    const kit = await this.prisma.kit.findUnique({
      where: {
        id: kitId,
      },
      include: {
        matchKits: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!kit) {
      throw new NotFoundException("Kit não encontrado.");
    }

    if (kit.status !== "DISPONIVEL") {
      throw new BadRequestException(
        `Somente kits disponíveis podem ser excluídos. Status atual: ${kit.status}.`,
      );
    }

    if (kit.currentOfficialId) {
      throw new BadRequestException(
        "Não é possível excluir um kit que está sob responsabilidade de um DCO.",
      );
    }

    if (kit.matchKits.length > 0) {
      throw new BadRequestException(
        "Não é possível excluir um kit vinculado a uma partida.",
      );
    }

    await this.prisma.kit.delete({
      where: {
        id: kitId,
      },
    });

    return {
      message: "Kit excluído com sucesso.",
    };
  }

  async moveKitToDco(user: AuthUser, kitId: string, data: MoveKitDto) {
    this.ensureAdmin(user);

    if (!data.officialId) {
      throw new BadRequestException("Informe o DCO de destino.");
    }

    const [kit, targetOfficial] = await Promise.all([
      this.prisma.kit.findUnique({
        where: {
          id: kitId,
        },
        include: {
          currentOfficial: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          matchKits: {
            select: {
              id: true,
            },
          },
        },
      }),
      this.prisma.official.findUnique({
        where: {
          id: data.officialId,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    if (!kit) {
      throw new NotFoundException("Kit não encontrado.");
    }

    if (!targetOfficial) {
      throw new NotFoundException("DCO de destino não encontrado.");
    }

    if (!targetOfficial.active) {
      throw new BadRequestException(
        "Não é possível mover kit para um DCO inativo.",
      );
    }

    if (kit.status !== "COM_DCO") {
      throw new BadRequestException(
        `Somente kits com DCO podem ser movidos. Status atual: ${kit.status}.`,
      );
    }

    if (!kit.currentOfficialId) {
      throw new BadRequestException(
        "Este kit não possui DCO responsável atualmente.",
      );
    }

    if (kit.currentOfficialId === data.officialId) {
      throw new BadRequestException("O kit já está com este DCO.");
    }

    if (kit.matchKits.length > 0) {
      throw new BadRequestException(
        "Não é possível mover um kit que já foi vinculado a uma partida.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedKit = await tx.kit.update({
        where: {
          id: kitId,
        },
        data: {
          currentOfficialId: data.officialId,
        },
        include: {
          currentOfficial: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      await tx.kitMovement.create({
        data: {
          kitId,
          type: "REPASSE_DCO",
          fromOfficialId: kit.currentOfficialId,
          toOfficialId: data.officialId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          notes:
            data.notes ||
            `Kit ${kit.number} movido de ${kit.currentOfficial?.user.name || "DCO anterior"} para ${targetOfficial.user.name}.`,
        },
      });

      return {
        message: "Kit movido para outro DCO com sucesso.",
        kit: updatedKit,
      };
    });
  }


  async returnKitToStock(user: AuthUser, kitId: string) {
    this.ensureAdmin(user);

    const kit = await this.prisma.kit.findUnique({
      where: {
        id: kitId,
      },
      include: {
        currentOfficial: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        matchKits: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!kit) {
      throw new NotFoundException("Kit não encontrado.");
    }

    if (kit.status !== "COM_DCO") {
      throw new BadRequestException(
        `Somente kits com DCO podem voltar para disponível. Status atual: ${kit.status}.`,
      );
    }

    if (!kit.currentOfficialId) {
      throw new BadRequestException(
        "Este kit não possui DCO responsável atualmente.",
      );
    }

    if (kit.matchKits.length > 0) {
      throw new BadRequestException(
        "Não é possível voltar para disponível um kit vinculado a uma partida.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedKit = await tx.kit.update({
        where: {
          id: kitId,
        },
        data: {
          status: "DISPONIVEL",
          currentOfficialId: null,
        },
      });

      await tx.kitMovement.create({
        data: {
          kitId,
          type: "DEVOLUCAO_ESTOQUE",
          fromOfficialId: kit.currentOfficialId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          notes: `Kit ${kit.number} voltou para disponível no estoque. DCO anterior: ${kit.currentOfficial?.user.name || "não identificado"}.`,
        },
      });

      return {
        message: "Kit voltou para disponível com sucesso.",
        kit: updatedKit,
      };
    });
  }


async listLbcdShippingKits(user: AuthUser) {
  this.ensureAdmin(user);

  const matchKits = await this.prisma.matchKit.findMany({
    where: {
      match: {
        status: "CONTROL_DONE",
      },
      kit: {
        status: "UTILIZADO",
      },
    },
    include: {
      kit: {
        select: {
          id: true,
          number: true,
          status: true,
        },
      },
      official: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      match: {
        select: {
          id: true,
          homeTeam: true,
          awayTeam: true,
          matchDate: true,
          missionCode: true,
          status: true,
          championship: {
            select: {
              name: true,
            },
          },
          stadium: {
            select: {
              name: true,
              city: true,
              state: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        match: {
          matchDate: "desc",
        },
      },
      {
        kit: {
          number: "asc",
        },
      },
    ],
  });

  const grouped = new Map<string, any>();

  for (const item of matchKits) {
    const current = grouped.get(item.matchId) || {
      matchId: item.matchId,
      missionCode: item.match.missionCode,
      homeTeam: item.match.homeTeam,
      awayTeam: item.match.awayTeam,
      matchDate: item.match.matchDate,
      status: item.match.status,
      championshipName: item.match.championship?.name || null,
      stadiumName: item.match.stadium?.name || null,
      stadiumCity: item.match.stadium?.city || null,
      stadiumState: item.match.stadium?.state || null,
      kits: [],
    };

    current.kits.push({
      matchKitId: item.id,
      kitId: item.kitId,
      number: item.kit.number,
      status: item.kit.status,
      usedAt: item.usedAt,
      officialName: item.official?.user?.name || null,
      officialEmail: item.official?.user?.email || null,
    });

    grouped.set(item.matchId, current);
  }

  return Array.from(grouped.values());
}

async markLbcdShippingKitsAsSent(
  user: AuthUser,
  data: {
    kitIds: string[];
  },
) {
  this.ensureAdmin(user);

  const kitIds = Array.isArray(data.kitIds)
    ? Array.from(new Set(data.kitIds.filter(Boolean)))
    : [];

  if (kitIds.length === 0) {
    throw new BadRequestException("Selecione pelo menos um kit para marcar como enviado.");
  }

  const kits = await this.prisma.kit.findMany({
    where: {
      id: {
        in: kitIds,
      },
    },
    include: {
      matchKits: {
        where: {
          match: {
            status: "CONTROL_DONE",
          },
        },
        include: {
          match: {
            select: {
              id: true,
              homeTeam: true,
              awayTeam: true,
              missionCode: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (kits.length !== kitIds.length) {
    throw new BadRequestException("Um ou mais kits selecionados não foram encontrados.");
  }

  const invalidKits = kits.filter((kit) => {
    return kit.status !== "UTILIZADO" || kit.matchKits.length === 0;
  });

  if (invalidKits.length > 0) {
    throw new BadRequestException(
      `Existem kits que não podem ser enviados ao laboratório: ${invalidKits
        .map((kit) => kit.number)
        .join(", ")}.`,
    );
  }

  return this.prisma.$transaction(async (tx) => {
    await tx.kit.updateMany({
      where: {
        id: {
          in: kitIds,
        },
      },
      data: {
        status: "ENVIADO_LABORATORIO",
      },
    });

    await Promise.all(
      kits.map((kit) => {
        const matchKit = kit.matchKits[0];
        const match = matchKit.match;

        return tx.kitMovement.create({
          data: {
            kitId: kit.id,
            type: "ENVIADO_LABORATORIO",
            matchId: match.id,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            notes: `Kit ${kit.number} marcado como enviado ao laboratório. Jogo: ${match.homeTeam} x ${match.awayTeam}. Missão: ${match.missionCode || "não informada"}.`,
          },
        });
      }),
    );

    return {
      message: "Kits marcados como enviados ao laboratório com sucesso.",
      total: kits.length,
      kits: kits.map((kit) => ({
        id: kit.id,
        number: kit.number,
        status: "ENVIADO_LABORATORIO",
      })),
    };
  });
}

  async listMatchKits(matchId: string) {
    return this.prisma.matchKit.findMany({
      where: {
        matchId,
      },
      include: {
        kit: true,
        official: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        match: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
            matchDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async attachKitsToMatch(
    user: AuthUser,
    matchId: string,
    data: {
      kitIds: string[];
    },
  ) {
    const kitIds = Array.isArray(data.kitIds) ? data.kitIds : [];

    if (kitIds.length === 0) {
      throw new BadRequestException("Selecione pelo menos um kit.");
    }

    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        status: true,
      },
    });

    if (!match) {
      throw new NotFoundException("Jogo não encontrado.");
    }

    if (match.status === "CONTROL_DONE") {
      throw new BadRequestException(
        "Não é possível registrar kits depois que o controle foi concluído.",
      );
    }

    const official = await this.prisma.official.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!official) {
      throw new ForbiddenException(
        "Somente oficiais vinculados podem registrar kits no jogo.",
      );
    }

    const kits = await this.prisma.kit.findMany({
      where: {
        id: {
          in: kitIds,
        },
      },
      select: {
        id: true,
        number: true,
        status: true,
        currentOfficialId: true,
        matchKits: {
          select: {
            matchId: true,
          },
        },
      },
    });

    if (kits.length !== kitIds.length) {
      throw new BadRequestException("Um ou mais kits não foram encontrados.");
    }

    const invalidOwnerKits = kits.filter(
      (kit) => kit.currentOfficialId !== official.id,
    );

    if (invalidOwnerKits.length > 0) {
      throw new BadRequestException(
        `Você só pode associar kits sob sua responsabilidade. Kits inválidos: ${invalidOwnerKits
          .map((kit) => kit.number)
          .join(", ")}`,
      );
    }

    const invalidStatusKits = kits.filter((kit) => kit.status !== "COM_DCO");

    if (invalidStatusKits.length > 0) {
      throw new BadRequestException(
        `Alguns kits não estão disponíveis para uso: ${invalidStatusKits
          .map((kit) => `${kit.number} (${kit.status})`)
          .join(", ")}`,
      );
    }

    const kitsLinkedToOtherMatch = kits.filter((kit) =>
      kit.matchKits.some((matchKit) => matchKit.matchId !== matchId),
    );

    if (kitsLinkedToOtherMatch.length > 0) {
      throw new BadRequestException(
        `Alguns kits já foram utilizados em outro jogo: ${kitsLinkedToOtherMatch
          .map((kit) => kit.number)
          .join(", ")}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const usedAt = new Date();

      await tx.matchKit.createMany({
        data: kits.map((kit) => ({
          matchId,
          kitId: kit.id,
          officialId: official.id,
          usedAt,
        })),
        skipDuplicates: true,
      });

      await tx.kit.updateMany({
        where: {
          id: {
            in: kits.map((kit) => kit.id),
          },
        },
        data: {
          status: "UTILIZADO",
        },
      });

      await tx.kitMovement.createMany({
        data: kits.map((kit) => ({
          kitId: kit.id,
          type: "UTILIZADO",
          toOfficialId: official.id,
          matchId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          notes: `Kit utilizado no controle do jogo ${match.homeTeam} x ${match.awayTeam}.`,
        })),
      });

      return {
        message: "Kits utilizados registrados com sucesso.",
        quantity: kits.length,
      };
    });
  }

  async removeKitFromMatch(user: AuthUser, matchId: string, kitId: string) {
    const official = await this.prisma.official.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!official && user.role !== "ADMIN") {
      throw new ForbiddenException(
        "Somente oficiais vinculados ou administradores podem remover kits do jogo.",
      );
    }

    const matchKit = await this.prisma.matchKit.findFirst({
      where: {
        matchId,
        kitId,
      },
      include: {
        kit: true,
        match: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!matchKit) {
      throw new NotFoundException("Kit não está vinculado a este jogo.");
    }

    if (user.role !== "ADMIN" && matchKit.officialId !== official?.id) {
      throw new ForbiddenException(
        "Você só pode remover kits vinculados por você.",
      );
    }

    if (matchKit.match.status === "CONTROL_DONE") {
      throw new BadRequestException(
        "Não é possível remover kits depois que o controle foi concluído.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.matchKit.delete({
        where: {
          id: matchKit.id,
        },
      });

      const otherLinks = await tx.matchKit.count({
        where: {
          kitId,
        },
      });

      if (otherLinks === 0) {
        await tx.kit.update({
          where: {
            id: kitId,
          },
          data: {
            status: "COM_DCO",
          },
        });
      }

      await tx.kitMovement.create({
        data: {
          kitId,
          type: "DEVOLUCAO_ESTOQUE",
          fromOfficialId: matchKit.officialId,
          matchId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          notes: "Registro de kit utilizado removido antes da finalização.",
        },
      });

      return {
        message: "Kit removido do jogo com sucesso.",
      };
    });
  }
}
