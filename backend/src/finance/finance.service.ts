import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  private money(value: unknown) {
    return Number(value || 0);
  }

  private dateOrUndefined(value?: string) {
    return value ? new Date(value) : undefined;
  }

  async getSummary(filters: { startDate?: string; endDate?: string }) {
    const matchDate =
      filters.startDate || filters.endDate
        ? {
            ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
            ...(filters.endDate
              ? { lte: new Date(`${filters.endDate}T23:59:59.999`) }
              : {}),
          }
        : undefined;

    const entries = await this.prisma.financialEntry.findMany({
      where: matchDate ? { match: { matchDate } } : undefined,
      select: {
        direction: true,
        status: true,
        amount: true,
        settledAmount: true,
      },
    });

    const totals = {
      receivable: 0,
      received: 0,
      payable: 0,
      paid: 0,
      pendingPayable: 0,
      pendingReceivable: 0,
    };

    for (const entry of entries) {
      const amount = this.money(entry.amount);
      const settled = this.money(entry.settledAmount);

      if (entry.direction === 'RECEIVABLE') {
        totals.receivable += amount;
        totals.received += settled;
        totals.pendingReceivable += Math.max(amount - settled, 0);
      } else {
        totals.payable += amount;
        totals.paid += settled;
        totals.pendingPayable += Math.max(amount - settled, 0);
      }
    }

    return {
      ...totals,
      operationalBalance: totals.received - totals.paid,
      projectedBalance: totals.receivable - totals.payable,
    };
  }

  listEntries(filters: {
    direction?: 'PAYABLE' | 'RECEIVABLE';
    status?: string;
    matchId?: string;
  }) {
    return this.prisma.financialEntry.findMany({
      where: {
        ...(filters.direction ? { direction: filters.direction } : {}),
        ...(filters.status ? { status: filters.status as any } : {}),
        ...(filters.matchId ? { matchId: filters.matchId } : {}),
      },
      include: {
        match: {
          include: {
            stadium: true,
            championship: true,
          },
        },
        official: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        attachments: true,
        batchItem: {
          include: {
            batch: true,
          },
        },
      },
      orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }],
    });
  }


listRates(filters: { stadiumId?: string; active?: boolean } = {}) {
    return this.prisma.paymentRate.findMany({
      where: {
        ...(filters.stadiumId ? { stadiumId: filters.stadiumId } : {}),
        ...(filters.active !== undefined ? { active: filters.active } : {}),
      },
      include: { stadium: true },
      orderBy: [{ active: 'desc' }, { validFrom: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async updateRate(
    id: string,
    body: {
      stadiumId?: string;
      validFrom?: string;
      validUntil?: string | null;
      dcoFee?: number;
      assistantFee?: number;
      travelExpense?: number;
      notes?: string | null;
      active?: boolean;
    },
  ) {
    const current = await this.prisma.paymentRate.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Tabela de valores nÃ£o encontrada.');

    const values = [body.dcoFee, body.assistantFee, body.travelExpense]
      .filter((value) => value !== undefined);

    if (values.some((value) => Number(value) < 0)) {
      throw new BadRequestException('Os valores nÃ£o podem ser negativos.');
    }

    return this.prisma.paymentRate.update({
      where: { id },
      data: {
        ...(body.stadiumId !== undefined ? { stadiumId: body.stadiumId } : {}),
        ...(body.validFrom !== undefined ? { validFrom: new Date(body.validFrom) } : {}),
        ...(body.validUntil !== undefined
          ? { validUntil: body.validUntil ? new Date(body.validUntil) : null }
          : {}),
        ...(body.dcoFee !== undefined ? { dcoFee: body.dcoFee } : {}),
        ...(body.assistantFee !== undefined ? { assistantFee: body.assistantFee } : {}),
        ...(body.travelExpense !== undefined ? { travelExpense: body.travelExpense } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
      },
      include: { stadium: true },
    });
  }

  async toggleRate(id: string) {
    const current = await this.prisma.paymentRate.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Tabela de valores nÃ£o encontrada.');

    return this.prisma.paymentRate.update({
      where: { id },
      data: { active: !current.active },
      include: { stadium: true },
    });
  }


  createRate(body: {
    stadiumId: string;
    validFrom: string;
    validUntil?: string;
    dcoFee: number;
    assistantFee: number;
    travelExpense: number;
    notes?: string;
  }) {
    if (
      body.dcoFee < 0 ||
      body.assistantFee < 0 ||
      body.travelExpense < 0
    ) {
      throw new BadRequestException('Os valores nÃ£o podem ser negativos.');
    }

    return this.prisma.paymentRate.create({
      data: {
        stadiumId: body.stadiumId,
        validFrom: new Date(body.validFrom),
        validUntil: this.dateOrUndefined(body.validUntil),
        dcoFee: body.dcoFee,
        assistantFee: body.assistantFee,
        travelExpense: body.travelExpense,
        notes: body.notes,
      },
      include: { stadium: true },
    });
  }

  async generateForAcceptedScale(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        stadium: true,
        officials: {
          where: { confirmed: true },
          include: {
            official: { include: { user: true } },
          },
        },
      },
    });

    if (!match) throw new NotFoundException('Jogo nÃ£o encontrado.');
    if (!match.officials.length) {
      throw new BadRequestException(
        'O jogo ainda nÃ£o possui escala aceita.',
      );
    }

    const rate = await this.prisma.paymentRate.findFirst({
      where: {
        stadiumId: match.stadiumId,
        active: true,
        validFrom: { lte: match.matchDate },
        OR: [{ validUntil: null }, { validUntil: { gte: match.matchDate } }],
      },
      orderBy: { validFrom: 'desc' },
    });

    if (!rate) {
      throw new BadRequestException(
        'Nenhuma tabela de valores vigente foi encontrada para o estÃ¡dio.',
      );
    }

    const dueDate = new Date(match.matchDate);
    dueDate.setHours(0, 0, 0, 0);

    const created: Awaited<
      ReturnType<typeof this.prisma.financialEntry.create>
    >[] = [];

    for (const scale of match.officials) {
      const isDco = scale.role === 'DCO';

      const feeAmount = isDco
        ? this.money(rate.dcoFee)
        : this.money(rate.assistantFee);

      const fee = await this.prisma.financialEntry.upsert({
        where: {
          matchId_officialId_type: {
            matchId,
            officialId: scale.officialId,
            type: isDco ? 'DCO_FEE' : 'ASSISTANT_FEE',
          },
        },
        update: {},
        create: {
          matchId,
          officialId: scale.officialId,
          direction: 'PAYABLE',
          type: isDco ? 'DCO_FEE' : 'ASSISTANT_FEE',
          description: isDco ? 'Taxa DCO' : 'Taxa Oficial',
          amount: feeAmount,
          status: 'SCHEDULED',
          dueDate,
          rateSnapshot: {
            rateId: rate.id,
            stadiumId: match.stadiumId,
            validFrom: rate.validFrom,
            dcoFee: this.money(rate.dcoFee),
            assistantFee: this.money(rate.assistantFee),
            travelExpense: this.money(rate.travelExpense),
          },
        },
      });

      created.push(fee);

      if (isDco && this.money(rate.travelExpense) > 0) {
        const travel = await this.prisma.financialEntry.upsert({
          where: {
            matchId_officialId_type: {
              matchId,
              officialId: scale.officialId,
              type: 'TRAVEL_EXPENSE',
            },
          },
          update: {},
          create: {
            matchId,
            officialId: scale.officialId,
            direction: 'PAYABLE',
            type: 'TRAVEL_EXPENSE',
            description: 'Despesas de deslocamento',
            amount: this.money(rate.travelExpense),
            status: 'SCHEDULED',
            dueDate,
            rateSnapshot: {
              rateId: rate.id,
              stadiumId: match.stadiumId,
              validFrom: rate.validFrom,
              travelExpense: this.money(rate.travelExpense),
            },
          },
        });

        created.push(travel);
      }
    }

    return created;
  }

  async createCbfReceivable(
    matchId: string,
    body: { amount: number; dueDate?: string; notes?: string },
  ) {
    if (body.amount <= 0) {
      throw new BadRequestException('Informe um valor maior que zero.');
    }

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) throw new NotFoundException('Jogo nÃ£o encontrado.');

    const existing = await this.prisma.financialEntry.findFirst({
      where: {
        matchId,
        officialId: null,
        type: 'CBF_RECEIVABLE',
      },
    });

    if (existing) {
      return this.prisma.financialEntry.update({
        where: { id: existing.id },
        data: {
          amount: body.amount,
          dueDate: this.dateOrUndefined(body.dueDate),
          notes: body.notes,
        },
      });
    }

    return this.prisma.financialEntry.create({
      data: {
        matchId,
        officialId: null,
        direction: 'RECEIVABLE',
        type: 'CBF_RECEIVABLE',
        description: 'Recebimento da CBF',
        amount: body.amount,
        status: 'PENDING',
        dueDate: this.dateOrUndefined(body.dueDate),
        notes: body.notes,
      },
    });
  }

  async payEntry(
    id: string,
    body: {
      paidAmount?: number;
      paidAt?: string;
      paymentMethod?: string;
      transactionReference?: string;
      pixKeyUsed?: string;
      notes?: string;
      receiptFileName?: string;
      receiptMimeType?: string;
      receiptDataUrl?: string;
    },
  ) {
    const entry = await this.prisma.financialEntry.findUnique({
      where: { id },
    });

    if (!entry) throw new NotFoundException('LanÃ§amento nÃ£o encontrado.');
    if (entry.direction !== 'PAYABLE') {
      throw new BadRequestException('O lanÃ§amento nÃ£o Ã© uma conta a pagar.');
    }

    const paidAmount = body.paidAmount ?? this.money(entry.amount);
    const status =
      paidAmount >= this.money(entry.amount) ? 'PAID' : 'PARTIALLY_PAID';

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.financialEntry.update({
        where: { id },
        data: {
          settledAmount: paidAmount,
          settledAt: this.dateOrUndefined(body.paidAt) ?? new Date(),
          status,
          paymentMethod: body.paymentMethod ?? 'PIX',
          transactionReference: body.transactionReference,
          pixKeyUsed: body.pixKeyUsed,
          notes: body.notes ?? entry.notes,
        },
      });

      if (body.receiptDataUrl && body.receiptFileName) {
        await tx.financialAttachment.create({
          data: {
            financialEntryId: id,
            fileName: body.receiptFileName,
            mimeType: body.receiptMimeType ?? 'application/octet-stream',
            dataUrl: body.receiptDataUrl,
          },
        });
      }

      return updated;
    });
  }

  async receiveEntry(
    id: string,
    body: {
      receivedAmount?: number;
      receivedAt?: string;
      transactionReference?: string;
      notes?: string;
      receiptFileName?: string;
      receiptMimeType?: string;
      receiptDataUrl?: string;
    },
  ) {
    const entry = await this.prisma.financialEntry.findUnique({
      where: { id },
    });

    if (!entry) throw new NotFoundException('LanÃ§amento nÃ£o encontrado.');
    if (entry.direction !== 'RECEIVABLE') {
      throw new BadRequestException('O lanÃ§amento nÃ£o Ã© uma conta a receber.');
    }

    const amount = body.receivedAmount ?? this.money(entry.amount);
    const status =
      amount >= this.money(entry.amount) ? 'RECEIVED' : 'PARTIALLY_RECEIVED';

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.financialEntry.update({
        where: { id },
        data: {
          settledAmount: amount,
          settledAt: this.dateOrUndefined(body.receivedAt) ?? new Date(),
          status,
          transactionReference: body.transactionReference,
          notes: body.notes ?? entry.notes,
        },
      });

      if (body.receiptDataUrl && body.receiptFileName) {
        await tx.financialAttachment.create({
          data: {
            financialEntryId: id,
            fileName: body.receiptFileName,
            mimeType: body.receiptMimeType ?? 'application/octet-stream',
            dataUrl: body.receiptDataUrl,
          },
        });
      }

      return updated;
    });
  }

  async createPaymentBatch(body: {
    entryIds: string[];
    paidAt?: string;
    paymentMethod?: string;
    transactionReference?: string;
    pixKeyUsed?: string;
    notes?: string;
    receiptFileName?: string;
    receiptMimeType?: string;
    receiptDataUrl?: string;
  }) {
    if (!body.entryIds?.length) {
      throw new BadRequestException('Selecione ao menos um lanÃ§amento.');
    }

    const entries = await this.prisma.financialEntry.findMany({
      where: {
        id: { in: body.entryIds },
        direction: 'PAYABLE',
        status: { notIn: ['PAID', 'CANCELED'] },
      },
    });

    if (entries.length !== body.entryIds.length) {
      throw new BadRequestException(
        'HÃ¡ lanÃ§amentos invÃ¡lidos, cancelados ou jÃ¡ pagos.',
      );
    }

    const officialIds = new Set(entries.map((item) => item.officialId));
    if (officialIds.size !== 1 || officialIds.has(null)) {
      throw new BadRequestException(
        'Um lote deve conter lanÃ§amentos do mesmo beneficiÃ¡rio.',
      );
    }

    const totalAmount = entries.reduce(
      (total, entry) => total + this.money(entry.amount),
      0,
    );

    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.paymentBatch.create({
        data: {
          officialId: entries[0].officialId!,
          totalAmount,
          paidAt: this.dateOrUndefined(body.paidAt) ?? new Date(),
          paymentMethod: body.paymentMethod ?? 'PIX',
          transactionReference: body.transactionReference,
          pixKeyUsed: body.pixKeyUsed,
          notes: body.notes,
          items: {
            create: entries.map((entry) => ({
              financialEntryId: entry.id,
              amount: entry.amount,
            })),
          },
        },
        include: { items: true },
      });

      await tx.financialEntry.updateMany({
        where: { id: { in: body.entryIds } },
        data: {
          status: 'PAID',
          settledAt: batch.paidAt,
          settledAmount: 0,
          paymentMethod: batch.paymentMethod,
          transactionReference: batch.transactionReference,
          pixKeyUsed: batch.pixKeyUsed,
        },
      });

      for (const entry of entries) {
        await tx.financialEntry.update({
          where: { id: entry.id },
          data: { settledAmount: entry.amount },
        });
      }

      if (body.receiptDataUrl && body.receiptFileName) {
        await tx.financialAttachment.create({
          data: {
            paymentBatchId: batch.id,
            fileName: body.receiptFileName,
            mimeType: body.receiptMimeType ?? 'application/octet-stream',
            dataUrl: body.receiptDataUrl,
          },
        });
      }

      return batch;
    });
  }
}

