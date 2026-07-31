import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type AuthUser = {
  id: string;
  sub?: string;
  userId?: string;
  name?: string;
  email?: string;
  role: 'ADMIN' | 'COORDINATOR' | 'OFFICIAL';
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
};

type MaterialQuantityInput = {
  itemId: string;
  quantity: number;
};

const CENTRAL_STOCK_KEY = 'ESTOQUE';

const DEFAULT_EXTRA_MATERIAL_ITEMS = [
  'Copo coletor',
  'Fita parcial',
  'Formulário de Controle de dopagem',
  'Formulário de Cadeia de custodia',
  'Formulário de Relatório do oficial de controle de dopagem',
];

const REQUIRED_COLLECTOR_ITEM_NAME = 'Copo coletor';
const REQUIRED_COLLECTOR_USAGE_QUANTITY = 2;

@Injectable()
export class ExtraMaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  private getUserId(user: AuthUser) {
    return user?.sub || user?.id || user?.userId || null;
  }

  private getUserName(user: AuthUser) {
    return user?.name || user?.user?.name || null;
  }

  private getUserEmail(user: AuthUser) {
    return user?.email || user?.user?.email || null;
  }

  private ensureAdmin(user: AuthUser) {
    if (String(user?.role || user?.user?.role || '').toUpperCase() !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem realizar esta ação.',
      );
    }
  }

  private normalizeQuantity(value: unknown) {
    const quantity = Number(value);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero.');
    }

    return quantity;
  }

  private normalizeItems(items: MaterialQuantityInput[]) {
    const grouped = new Map<string, number>();

    for (const item of items || []) {
      const itemId = String(item?.itemId || '').trim();
      const rawQuantity = Number(item?.quantity || 0);

      if (!itemId || !Number.isInteger(rawQuantity) || rawQuantity <= 0) {
        continue;
      }

      grouped.set(itemId, (grouped.get(itemId) || 0) + rawQuantity);
    }

    return Array.from(grouped.entries()).map(([itemId, quantity]) => ({
      itemId,
      quantity,
    }));
  }

  private normalizeMaterialName(value?: string | null) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isCollectorMaterialName(value?: string | null) {
    return (
      this.normalizeMaterialName(value) ===
      this.normalizeMaterialName(REQUIRED_COLLECTOR_ITEM_NAME)
    );
  }

  private isFormMaterialName(value?: string | null) {
    return this.normalizeMaterialName(value).startsWith('formulario');
  }

  private buildUsedByGameSummary(
    usageTotals: { itemId: string; _sum: { quantity: number | null } }[],
    materialItems: { id: string; name: string }[],
  ) {
    const itemNameMap = new Map(
      materialItems.map((item) => [item.id, item.name]),
    );

    return usageTotals
      .map((usage) => ({
        itemId: usage.itemId,
        name: itemNameMap.get(usage.itemId) || 'Material não identificado',
        quantity: Number(usage._sum.quantity || 0),
      }))
      .filter((usage) => usage.quantity > 0)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'));
  }

  private parseDateFilter(value?: string, endOfDay = false) {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) return null;

    const [year, month, day] = normalizedValue.split('-').map(Number);

    if (!year || !month || !day) return null;

    return new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        endOfDay ? 23 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 999 : 0,
      ),
    );
  }

  private async ensureDefaultItems() {
    await Promise.all(
      DEFAULT_EXTRA_MATERIAL_ITEMS.map((name) =>
        this.prisma.extraMaterialItem.upsert({
          where: {
            name,
          },
          update: {},
          create: {
            name,
            active: true,
          },
        }),
      ),
    );
  }

  private async findCurrentOfficial(user: AuthUser) {
    const userId = this.getUserId(user);

    if (!userId) return null;

    return this.prisma.official.findFirst({
      where: {
        userId,
        active: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  private async getOrCreateStock(
    tx: any,
    data: {
      itemId: string;
      holderKey: string;
      holderType: 'ESTOQUE' | 'DCO';
      officialId?: string | null;
    },
  ) {
    const currentStock = await tx.extraMaterialStock.findUnique({
      where: {
        itemId_holderKey: {
          itemId: data.itemId,
          holderKey: data.holderKey,
        },
      },
    });

    if (currentStock) return currentStock;

    return tx.extraMaterialStock.create({
      data: {
        itemId: data.itemId,
        holderKey: data.holderKey,
        holderType: data.holderType,
        officialId: data.officialId || null,
        quantity: 0,
      },
    });
  }

  private async incrementStock(
    tx: any,
    data: {
      itemId: string;
      holderKey: string;
      holderType: 'ESTOQUE' | 'DCO';
      officialId?: string | null;
      quantity: number;
    },
  ) {
    await this.getOrCreateStock(tx, data);

    return tx.extraMaterialStock.update({
      where: {
        itemId_holderKey: {
          itemId: data.itemId,
          holderKey: data.holderKey,
        },
      },
      data: {
        quantity: {
          increment: data.quantity,
        },
      },
    });
  }

  private async decrementStock(
    tx: any,
    data: {
      itemId: string;
      holderKey: string;
      quantity: number;
      unavailableMessage: string;
    },
  ) {
    const stock = await tx.extraMaterialStock.findUnique({
      where: {
        itemId_holderKey: {
          itemId: data.itemId,
          holderKey: data.holderKey,
        },
      },
      include: {
        item: true,
      },
    });

    if (!stock || stock.quantity < data.quantity) {
      throw new BadRequestException(data.unavailableMessage);
    }

    return tx.extraMaterialStock.update({
      where: {
        itemId_holderKey: {
          itemId: data.itemId,
          holderKey: data.holderKey,
        },
      },
      data: {
        quantity: {
          decrement: data.quantity,
        },
      },
    });
  }

  private createMovementData(
    user: AuthUser,
    data: {
      itemId: string;
      type: 'ENTRADA_ESTOQUE' | 'REPASSE_DCO' | 'USO_JOGO' | 'DEVOLUCAO_ESTOQUE' | 'AJUSTE';
      quantity: number;
      fromOfficialId?: string | null;
      toOfficialId?: string | null;
      matchId?: string | null;
      notes?: string | null;
    },
  ) {
    return {
      itemId: data.itemId,
      type: data.type,
      quantity: data.quantity,
      fromOfficialId: data.fromOfficialId || null,
      toOfficialId: data.toOfficialId || null,
      matchId: data.matchId || null,
      userId: this.getUserId(user),
      userName: this.getUserName(user),
      userEmail: this.getUserEmail(user),
      notes: data.notes || null,
    };
  }

  async listItems(user: AuthUser) {
    await this.ensureDefaultItems();

    const isAdmin = String(user?.role || user?.user?.role || '').toUpperCase() === 'ADMIN';

    return this.prisma.extraMaterialItem.findMany({
      where: isAdmin ? {} : { active: true },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createItem(user: AuthUser, data: { name?: string }) {
    this.ensureAdmin(user);

    const name = String(data.name || '').trim();

    if (!name) {
      throw new BadRequestException('Informe o nome do material.');
    }

    return this.prisma.extraMaterialItem.create({
      data: {
        name,
        active: true,
      },
    });
  }

  async updateItem(
    user: AuthUser,
    itemId: string,
    data: {
      name?: string;
      active?: boolean;
    },
  ) {
    this.ensureAdmin(user);

    const item = await this.prisma.extraMaterialItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item) {
      throw new NotFoundException('Material não encontrado.');
    }

    return this.prisma.extraMaterialItem.update({
      where: {
        id: itemId,
      },
      data: {
        ...(data.name !== undefined
          ? { name: String(data.name || '').trim() }
          : {}),
        ...(data.active !== undefined ? { active: Boolean(data.active) } : {}),
      },
    });
  }

  async getSummary(user: AuthUser) {
    await this.ensureDefaultItems();

    const isAdmin = String(user?.role || user?.user?.role || '').toUpperCase() === 'ADMIN';

    if (!isAdmin) {
      const official = await this.findCurrentOfficial(user);

      if (!official) {
        return {
          centralStock: [],
          byDco: [],
          usedByGame: [],
          totalCentral: 0,
          totalWithDco: 0,
          totalUsedInGames: 0,
        };
      }

      const [stocks, usageTotals, materialItems] = await Promise.all([
        this.prisma.extraMaterialStock.findMany({
          where: {
            officialId: official.id,
            quantity: {
              gt: 0,
            },
          },
          include: {
            item: true,
          },
          orderBy: {
            item: {
              name: 'asc',
            },
          },
        }),
        this.prisma.extraMaterialUsage.groupBy({
          by: ['itemId'],
          where: {
            officialId: official.id,
          },
          _sum: {
            quantity: true,
          },
        }),
        this.prisma.extraMaterialItem.findMany({
          select: {
            id: true,
            name: true,
          },
        }),
      ]);

      const usedByGame = this.buildUsedByGameSummary(usageTotals, materialItems);

      return {
        centralStock: [],
        byDco: [
          {
            officialId: official.id,
            name: official.user.name,
            email: official.user.email,
            totalQuantity: stocks.reduce((sum, stock) => sum + stock.quantity, 0),
            items: stocks.map((stock) => ({
              itemId: stock.itemId,
              name: stock.item.name,
              quantity: stock.quantity,
            })),
          },
        ],
        usedByGame,
        totalCentral: 0,
        totalWithDco: stocks.reduce((sum, stock) => sum + stock.quantity, 0),
        totalUsedInGames: usedByGame.reduce(
          (sum, usage) => sum + usage.quantity,
          0,
        ),
      };
    }

    const [stocks, usageTotals, materialItems] = await Promise.all([
      this.prisma.extraMaterialStock.findMany({
        where: {
          quantity: {
            gt: 0,
          },
        },
        include: {
          item: true,
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
        },
        orderBy: [
          {
            holderType: 'asc',
          },
          {
            item: {
              name: 'asc',
            },
          },
        ],
      }),
      this.prisma.extraMaterialUsage.groupBy({
        by: ['itemId'],
        _sum: {
          quantity: true,
        },
      }),
      this.prisma.extraMaterialItem.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    const centralStock = stocks
      .filter((stock) => stock.holderType === 'ESTOQUE')
      .map((stock) => ({
        itemId: stock.itemId,
        name: stock.item.name,
        quantity: stock.quantity,
      }));

    const byDcoMap = new Map<string, any>();

    for (const stock of stocks.filter((item) => item.holderType === 'DCO')) {
      const officialId = stock.officialId || stock.holderKey;
      const current = byDcoMap.get(officialId) || {
        officialId,
        name: stock.official?.user?.name || 'DCO não identificado',
        email: stock.official?.user?.email || null,
        totalQuantity: 0,
        items: [],
      };

      current.totalQuantity += stock.quantity;
      current.items.push({
        itemId: stock.itemId,
        name: stock.item.name,
        quantity: stock.quantity,
      });

      byDcoMap.set(officialId, current);
    }

    const byDco = Array.from(byDcoMap.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name), 'pt-BR'),
    );
    const usedByGame = this.buildUsedByGameSummary(usageTotals, materialItems);

    return {
      centralStock,
      byDco,
      usedByGame,
      totalCentral: centralStock.reduce((sum, stock) => sum + stock.quantity, 0),
      totalWithDco: byDco.reduce(
        (sum, official) => sum + official.totalQuantity,
        0,
      ),
      totalUsedInGames: usedByGame.reduce(
        (sum, usage) => sum + usage.quantity,
        0,
      ),
    };
  }

  async listStocks(
    user: AuthUser,
    query: {
      officialId?: string;
      itemId?: string;
    },
  ) {
    this.ensureAdmin(user);
    await this.ensureDefaultItems();

    return this.prisma.extraMaterialStock.findMany({
      where: {
        ...(query.itemId ? { itemId: query.itemId } : {}),
        ...(query.officialId
          ? { officialId: query.officialId }
          : {}),
      },
      include: {
        item: true,
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
      },
      orderBy: [
        {
          holderType: 'asc',
        },
        {
          item: {
            name: 'asc',
          },
        },
      ],
    });
  }

  async listMyStock(user: AuthUser) {
    await this.ensureDefaultItems();

    const official = await this.findCurrentOfficial(user);

    if (!official) return [];

    return this.prisma.extraMaterialStock.findMany({
      where: {
        officialId: official.id,
        quantity: {
          gt: 0,
        },
        item: {
          active: true,
        },
      },
      include: {
        item: true,
      },
      orderBy: {
        item: {
          name: 'asc',
        },
      },
    });
  }

  async listOfficialStockForUsage(user: AuthUser, officialId: string) {
    await this.ensureDefaultItems();

    const isAdmin = String(user?.role || user?.user?.role || '').toUpperCase() === 'ADMIN';
    const currentOfficial = await this.findCurrentOfficial(user);
    const selectedOfficialId = isAdmin
      ? String(officialId || '').trim()
      : currentOfficial?.id;

    if (!selectedOfficialId) {
      throw new BadRequestException('Selecione um DCO para consultar o estoque.');
    }

    if (!isAdmin && selectedOfficialId !== currentOfficial?.id) {
      throw new ForbiddenException('Você só pode consultar o estoque do seu próprio DCO.');
    }

    const official = await this.prisma.official.findUnique({
      where: {
        id: selectedOfficialId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!official) {
      throw new NotFoundException('DCO não encontrado.');
    }

    return this.prisma.extraMaterialItem
      .findMany({
        where: {
          active: true,
        },
        include: {
          stocks: {
            where: {
              officialId: selectedOfficialId,
            },
            take: 1,
          },
        },
        orderBy: {
          name: 'asc',
        },
      })
      .then((items) =>
        items.map((item: any) => {
          const stock = item.stocks?.[0];

          return {
            id: stock?.id || `${item.id}-${selectedOfficialId}`,
            itemId: item.id,
            quantity: Number(stock?.quantity || 0),
            officialId: selectedOfficialId,
            official: {
              id: official.id,
              user: official.user,
            },
            item: {
              id: item.id,
              name: item.name,
              active: item.active,
            },
          };
        }),
      );
  }

  async createStockEntry(
    user: AuthUser,
    data: {
      itemId: string;
      quantity: number;
      notes?: string;
    },
  ) {
    this.ensureAdmin(user);

    const itemId = String(data.itemId || '').trim();
    const quantity = this.normalizeQuantity(data.quantity);

    const item = await this.prisma.extraMaterialItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item) {
      throw new NotFoundException('Material não encontrado.');
    }

    if (this.isFormMaterialName(item.name)) {
      throw new BadRequestException(
        'Formulários não possuem controle de estoque. Registre somente a quantidade utilizada na operação do jogo.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await this.incrementStock(tx, {
        itemId,
        holderKey: CENTRAL_STOCK_KEY,
        holderType: 'ESTOQUE',
        quantity,
      });

      await tx.extraMaterialMovement.create({
        data: this.createMovementData(user, {
          itemId,
          type: 'ENTRADA_ESTOQUE',
          quantity,
          notes:
            data.notes ||
            `Entrada de estoque: ${quantity} unidade(s) de ${item.name}.`,
        }),
      });

      return {
        message: 'Entrada de material cadastrada com sucesso.',
        item,
        quantity,
      };
    });
  }

  async transferToDco(
    user: AuthUser,
    data: {
      officialId: string;
      items: MaterialQuantityInput[];
      notes?: string;
    },
  ) {
    this.ensureAdmin(user);

    const officialId = String(data.officialId || '').trim();
    const items = this.normalizeItems(data.items);

    if (!officialId) {
      throw new BadRequestException('Informe o DCO de destino.');
    }

    if (items.length === 0) {
      throw new BadRequestException('Informe pelo menos um material para repasse.');
    }

    const [official, materials] = await Promise.all([
      this.prisma.official.findUnique({
        where: {
          id: officialId,
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
      this.prisma.extraMaterialItem.findMany({
        where: {
          id: {
            in: items.map((item) => item.itemId),
          },
          active: true,
        },
      }),
    ]);

    if (!official) {
      throw new NotFoundException('DCO não encontrado.');
    }

    if (!official.active) {
      throw new BadRequestException('Não é possível repassar material para DCO inativo.');
    }

    if (materials.length !== items.length) {
      throw new BadRequestException('Um ou mais materiais não foram encontrados ou estão inativos.');
    }

    if (materials.some((item) => this.isFormMaterialName(item.name))) {
      throw new BadRequestException(
        'Formulários não são repassados para DCO, pois não possuem controle de estoque.',
      );
    }

    const materialMap = new Map<string, any>(materials.map((item: any) => [item.id, item]));

    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const material = materialMap.get(item.itemId);

        await this.decrementStock(tx, {
          itemId: item.itemId,
          holderKey: CENTRAL_STOCK_KEY,
          quantity: item.quantity,
          unavailableMessage: `Estoque central insuficiente para ${material?.name || 'material selecionado'}.`,
        });

        await this.incrementStock(tx, {
          itemId: item.itemId,
          holderKey: officialId,
          holderType: 'DCO',
          officialId,
          quantity: item.quantity,
        });

        await tx.extraMaterialMovement.create({
          data: this.createMovementData(user, {
            itemId: item.itemId,
            type: 'REPASSE_DCO',
            quantity: item.quantity,
            toOfficialId: officialId,
            notes:
              data.notes ||
              `Repasse para DCO ${official.user.name}: ${item.quantity} unidade(s) de ${material?.name}.`,
          }),
        });
      }

      return {
        message: 'Materiais repassados para o DCO com sucesso.',
        official: {
          id: official.id,
          name: official.user.name,
          email: official.user.email,
        },
        items,
      };
    });
  }

  async returnFromDco(
    user: AuthUser,
    data: {
      officialId: string;
      itemId: string;
      quantity: number;
      notes?: string;
    },
  ) {
    this.ensureAdmin(user);

    const officialId = String(data.officialId || '').trim();
    const itemId = String(data.itemId || '').trim();
    const quantity = this.normalizeQuantity(data.quantity);

    const [official, item] = await Promise.all([
      this.prisma.official.findUnique({
        where: {
          id: officialId,
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
      this.prisma.extraMaterialItem.findUnique({
        where: {
          id: itemId,
        },
      }),
    ]);

    if (!official) {
      throw new NotFoundException('DCO não encontrado.');
    }

    if (!item) {
      throw new NotFoundException('Material não encontrado.');
    }

    if (this.isFormMaterialName(item.name)) {
      throw new BadRequestException(
        'Formulários não possuem controle de estoque nem devolução.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await this.decrementStock(tx, {
        itemId,
        holderKey: officialId,
        quantity,
        unavailableMessage: `Quantidade insuficiente com o DCO ${official.user.name}.`,
      });

      await this.incrementStock(tx, {
        itemId,
        holderKey: CENTRAL_STOCK_KEY,
        holderType: 'ESTOQUE',
        quantity,
      });

      await tx.extraMaterialMovement.create({
        data: this.createMovementData(user, {
          itemId,
          type: 'DEVOLUCAO_ESTOQUE',
          quantity,
          fromOfficialId: officialId,
          notes:
            data.notes ||
            `Devolução de ${quantity} unidade(s) de ${item.name} do DCO ${official.user.name} para o estoque.`,
        }),
      });

      return {
        message: 'Material devolvido para o estoque com sucesso.',
        quantity,
      };
    });
  }

  async listMovements(
    user: AuthUser,
    query: {
      itemId?: string;
      officialId?: string;
    },
  ) {
    const isAdmin = String(user?.role || user?.user?.role || '').toUpperCase() === 'ADMIN';

    if (!isAdmin) {
      const official = await this.findCurrentOfficial(user);

      if (!official) return [];

      return this.prisma.extraMaterialMovement.findMany({
        where: {
          ...(query.itemId ? { itemId: query.itemId } : {}),
          OR: [
            { fromOfficialId: official.id },
            { toOfficialId: official.id },
          ],
        },
        include: {
          item: true,
          fromOfficial: { include: { user: { select: { name: true, email: true } } } },
          toOfficial: { include: { user: { select: { name: true, email: true } } } },
          match: { select: { id: true, homeTeam: true, awayTeam: true, matchDate: true } },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      });
    }

    return this.prisma.extraMaterialMovement.findMany({
      where: {
        ...(query.itemId ? { itemId: query.itemId } : {}),
        ...(query.officialId
          ? {
              OR: [
                { fromOfficialId: query.officialId },
                { toOfficialId: query.officialId },
              ],
            }
          : {}),
      },
      include: {
        item: true,
        fromOfficial: { include: { user: { select: { name: true, email: true } } } },
        toOfficial: { include: { user: { select: { name: true, email: true } } } },
        match: { select: { id: true, homeTeam: true, awayTeam: true, matchDate: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 150,
    });
  }

  async listUsageReport(
    user: AuthUser,
    query: {
      startDate?: string;
      endDate?: string;
      officialId?: string;
      itemId?: string;
    },
  ) {
    const isAdmin = String(user?.role || user?.user?.role || '').toUpperCase() === 'ADMIN';
    const currentOfficial = await this.findCurrentOfficial(user);

    if (!isAdmin && !currentOfficial) return [];

    const startDate = this.parseDateFilter(query.startDate);
    const endDate = this.parseDateFilter(query.endDate, true);

    return this.prisma.extraMaterialUsage.findMany({
      where: {
        ...(query.itemId ? { itemId: query.itemId } : {}),
        ...(isAdmin && query.officialId
          ? { officialId: query.officialId }
          : {}),
        ...(!isAdmin && currentOfficial
          ? { officialId: currentOfficial.id }
          : {}),
        match: {
          ...(startDate || endDate
            ? {
                matchDate: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              }
            : {}),
        },
      },
      include: {
        item: true,
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
            matchNumber: true,
            roundOrPhase: true,
            missionCode: true,
            matchDate: true,
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
            matchDate: 'asc',
          },
        },
        {
          item: {
            name: 'asc',
          },
        },
      ],
    });
  }

  async listMatchUsages(user: AuthUser, matchId: string) {
    const isAdmin = String(user?.role || user?.user?.role || '').toUpperCase() === 'ADMIN';
    const official = await this.findCurrentOfficial(user);

    return this.prisma.extraMaterialUsage.findMany({
      where: {
        matchId,
        ...(!isAdmin && official ? { officialId: official.id } : {}),
      },
      include: {
        item: true,
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
      },
      orderBy: [
        {
          item: {
            name: 'asc',
          },
        },
      ],
    });
  }

  async registerMatchUsages(
    user: AuthUser,
    matchId: string,
    data: {
      used: boolean;
      officialId?: string;
      notes?: string;
      items: MaterialQuantityInput[];
    },
  ) {
    await this.ensureDefaultItems();

    const isAdmin = String(user?.role || user?.user?.role || '').toUpperCase() === 'ADMIN';
    const currentOfficial = await this.findCurrentOfficial(user);
    const officialId = isAdmin && data.officialId
      ? String(data.officialId || '').trim()
      : currentOfficial?.id;

    if (!officialId) {
      throw new ForbiddenException(
        'Somente DCO vinculado ou administrador informando um DCO pode registrar material utilizado.',
      );
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
      throw new NotFoundException('Jogo não encontrado.');
    }

    if (!['IN_PROGRESS', 'CONTROL_DONE'].includes(match.status)) {
      throw new BadRequestException(
        'O registro de material utilizado só pode ser feito quando o jogo estiver em andamento ou com o controle realizado.',
      );
    }

    const official = await this.prisma.official.findUnique({
      where: {
        id: officialId,
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
      throw new NotFoundException('DCO não encontrado.');
    }

    if (!official.active) {
      throw new BadRequestException('Não é possível registrar material para DCO inativo.');
    }

    if (!isAdmin && match.status !== 'IN_PROGRESS') {
      const alreadyRegistered = await this.prisma.extraMaterialUsage.count({
        where: {
          matchId,
          officialId,
        },
      });

      if (alreadyRegistered > 0) {
        throw new BadRequestException(
          'O material utilizado só pode ser alterado pelo DCO enquanto o jogo estiver em andamento.',
        );
      }
    }

    const activeMaterials = await this.prisma.extraMaterialItem.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    const collectorMaterial = activeMaterials.find((item) =>
      this.isCollectorMaterialName(item.name),
    );

    if (!collectorMaterial) {
      throw new BadRequestException(
        'O item obrigatório "Copo coletor" não está cadastrado ou está inativo.',
      );
    }

    const normalizedInputItems = this.normalizeItems(data.items);
    const collectorInput = normalizedInputItems.find(
      (item) => item.itemId === collectorMaterial.id,
    );
    const collectorQuantity = Math.max(
      REQUIRED_COLLECTOR_USAGE_QUANTITY,
      Number(collectorInput?.quantity || REQUIRED_COLLECTOR_USAGE_QUANTITY),
    );
    const optionalItems = normalizedInputItems.filter(
      (item) => item.itemId !== collectorMaterial.id,
    );
    const items = [
      {
        itemId: collectorMaterial.id,
        quantity: collectorQuantity,
      },
      ...optionalItems,
    ];
    const materialIds = new Set(activeMaterials.map((item) => item.id));

    if (items.some((item) => !materialIds.has(item.itemId))) {
      throw new BadRequestException('Um ou mais materiais não foram encontrados ou estão inativos.');
    }

    const materialMap = new Map<string, any>(activeMaterials.map((item: any) => [item.id, item]));

    return this.prisma.$transaction(async (tx) => {
      const existingUsages = await tx.extraMaterialUsage.findMany({
        where: {
          matchId,
          officialId,
        },
        include: {
          item: true,
        },
      });

      for (const usage of existingUsages) {
        if (!this.isFormMaterialName(usage.item?.name)) {
          await this.incrementStock(tx, {
            itemId: usage.itemId,
            holderKey: officialId,
            holderType: 'DCO',
            officialId,
            quantity: usage.quantity,
          });
        }

        await tx.extraMaterialMovement.create({
          data: this.createMovementData(user, {
            itemId: usage.itemId,
            type: 'DEVOLUCAO_ESTOQUE',
            quantity: usage.quantity,
            toOfficialId: officialId,
            matchId,
            notes: `Registro anterior de material utilizado removido/alterado no jogo ${match.homeTeam} x ${match.awayTeam}.`,
          }),
        });
      }

      if (existingUsages.length > 0) {
        await tx.extraMaterialUsage.deleteMany({
          where: {
            matchId,
            officialId,
          },
        });
      }

      for (const item of items) {
        const material = materialMap.get(item.itemId);
        const isFormMaterial = this.isFormMaterialName(material?.name);

        if (!isFormMaterial) {
          await this.decrementStock(tx, {
            itemId: item.itemId,
            holderKey: officialId,
            quantity: item.quantity,
            unavailableMessage: `Quantidade insuficiente com o DCO para ${material?.name || 'material selecionado'}.`,
          });
        }

        await tx.extraMaterialUsage.create({
          data: {
            matchId,
            itemId: item.itemId,
            officialId,
            quantity: item.quantity,
          },
        });

        await tx.extraMaterialMovement.create({
          data: this.createMovementData(user, {
            itemId: item.itemId,
            type: 'USO_JOGO',
            quantity: item.quantity,
            fromOfficialId: officialId,
            matchId,
            notes:
              data.notes ||
              `${item.quantity} unidade(s) de ${material?.name} utilizada(s) no jogo ${match.homeTeam} x ${match.awayTeam}.`,
          }),
        });
      }

      await tx.match.update({
        where: {
          id: matchId,
        },
        data: {
          extraMaterialUsed: true,
          extraMaterialNotes: String(data.notes || '').trim() || null,
          extraMaterialRegisteredAt: new Date(),
          extraMaterialRegisteredById: this.getUserId(user),
          extraMaterialRegisteredByName: this.getUserName(user),
          extraMaterialRegisteredByEmail: this.getUserEmail(user),
        },
      });

      return {
        message: 'Material utilizado no jogo registrado com sucesso.',
        used: true,
        requiredCollectorQuantity: REQUIRED_COLLECTOR_USAGE_QUANTITY,
        items,
      };
    });
  }

  async deleteMatchUsage(user: AuthUser, matchId: string, usageId: string) {
    const isAdmin = String(user?.role || user?.user?.role || '').toUpperCase() === 'ADMIN';
    const official = await this.findCurrentOfficial(user);

    const usage = await this.prisma.extraMaterialUsage.findFirst({
      where: {
        id: usageId,
        matchId,
      },
      include: {
        item: true,
        match: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    });

    if (!usage) {
      throw new NotFoundException('Registro de material extra não encontrado.');
    }

    if (!isAdmin) {
      throw new ForbiddenException(
        'Material utilizado já registrado. Solicite alteração para um administrador, se necessário.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (!this.isFormMaterialName(usage.item?.name)) {
        await this.incrementStock(tx, {
          itemId: usage.itemId,
          holderKey: usage.officialId,
          holderType: 'DCO',
          officialId: usage.officialId,
          quantity: usage.quantity,
        });
      }

      await tx.extraMaterialUsage.delete({
        where: {
          id: usage.id,
        },
      });

      await tx.extraMaterialMovement.create({
        data: this.createMovementData(user, {
          itemId: usage.itemId,
          type: 'DEVOLUCAO_ESTOQUE',
          quantity: usage.quantity,
          toOfficialId: usage.officialId,
          matchId,
          notes: `Registro de material extra removido do jogo ${usage.match.homeTeam} x ${usage.match.awayTeam}.`,
        }),
      });

      const remainingUsages = await tx.extraMaterialUsage.count({
        where: {
          matchId,
        },
      });

      if (remainingUsages === 0) {
        await tx.match.update({
          where: {
            id: matchId,
          },
          data: {
            extraMaterialUsed: false,
            extraMaterialRegisteredAt: new Date(),
            extraMaterialRegisteredById: this.getUserId(user),
            extraMaterialRegisteredByName: this.getUserName(user),
            extraMaterialRegisteredByEmail: this.getUserEmail(user),
          },
        });
      }

      return {
        message: 'Registro de material extra removido com sucesso.',
      };
    });
  }
}
