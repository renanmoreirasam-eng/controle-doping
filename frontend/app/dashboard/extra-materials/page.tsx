'use client';

import { useEffect, useMemo, useState } from 'react';

import { Sidebar } from '../../../components/Sidebar';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { api } from '../../../services/api';
import { getUser } from '../../../services/auth';

type ExtraMaterialItem = {
  id: string;
  name: string;
  active: boolean;
};

type Official = {
  id: string;
  active?: boolean;
  operationalRole?: string | null;
  user?: {
    name: string;
    email: string;
  };
};

type StockSummaryItem = {
  itemId: string;
  name: string;
  quantity: number;
};

type DcoStockSummary = {
  officialId: string;
  name: string;
  email?: string | null;
  totalQuantity: number;
  items: StockSummaryItem[];
};

type ExtraMaterialSummary = {
  centralStock: StockSummaryItem[];
  byDco: DcoStockSummary[];
  usedByGame: StockSummaryItem[];
  totalCentral: number;
  totalWithDco: number;
  totalUsedInGames: number;
};

type Movement = {
  id: string;
  type: string;
  quantity: number;
  notes?: string | null;
  createdAt: string;
  item?: ExtraMaterialItem;
  fromOfficial?: { user?: { name: string; email: string } } | null;
  toOfficial?: { user?: { name: string; email: string } } | null;
  match?: {
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
  } | null;
};

type UsageReportRow = {
  id: string;
  quantity: number;
  createdAt: string;
  item?: { name: string } | null;
  official?: {
    user?: { name: string; email: string } | null;
  } | null;
  match?: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    matchNumber?: string | null;
    roundOrPhase?: string | null;
    missionCode?: string | null;
    matchDate: string;
    championship?: { name: string } | null;
    stadium?: { name: string; city: string; state: string } | null;
  } | null;
};

type MaterialTab = 'COLLECTOR' | 'TAPE';
type ModalVariant = 'danger' | 'success' | 'warning' | 'default';

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: ModalVariant;
  confirmText: string;
  cancelText?: string;
};

const initialSummary: ExtraMaterialSummary = {
  centralStock: [],
  byDco: [],
  usedByGame: [],
  totalCentral: 0,
  totalWithDco: 0,
  totalUsedInGames: 0,
};

const initialModal: ModalState = {
  open: false,
  title: '',
  message: '',
  variant: 'default',
  confirmText: 'Fechar',
};

function normalizeName(value?: string | null) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isCollectorName(value?: string | null) {
  return normalizeName(value) === 'copo coletor';
}

function isPartialTapeName(value?: string | null) {
  return normalizeName(value) === 'fita parcial';
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateOnly(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('pt-BR');
}

function getMovementLabel(type: string) {
  if (type === 'ENTRADA_ESTOQUE') return 'Entrada';
  if (type === 'REPASSE_DCO') return 'Repasse';
  if (type === 'USO_JOGO') return 'Uso em jogo';
  if (type === 'DEVOLUCAO_ESTOQUE') return 'Devolução';
  if (type === 'AJUSTE') return 'Ajuste';
  return type;
}

function getMovementClass(type: string) {
  if (type === 'ENTRADA_ESTOQUE') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (type === 'REPASSE_DCO') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (type === 'USO_JOGO') return 'border-purple-200 bg-purple-50 text-purple-700';
  if (type === 'DEVOLUCAO_ESTOQUE') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function getErrorMessage(error: any, fallback: string) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(' ') : String(message);
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildUsageReportExcel(rows: UsageReportRow[]) {
  const bodyRows = rows
    .map((usage) => {
      const match = usage.match;
      const stadium = match?.stadium;
      const officialName = usage.official?.user?.name || '-';

      return `
        <tr>
          <td>${escapeHtml(match?.championship?.name || '-')}</td>
          <td>${escapeHtml(match?.roundOrPhase || '-')}</td>
          <td>${escapeHtml(match?.matchNumber || '-')}</td>
          <td>${escapeHtml(formatDateOnly(match?.matchDate))}</td>
          <td>${escapeHtml(match ? `${match.homeTeam} x ${match.awayTeam}` : '-')}</td>
          <td>${escapeHtml(stadium?.name || '-')}</td>
          <td>${escapeHtml(stadium ? `${stadium.city}/${stadium.state}` : '-')}</td>
          <td>${escapeHtml(match?.missionCode || '-')}</td>
          <td>${escapeHtml(officialName)}</td>
          <td>${escapeHtml(usage.item?.name || '-')}</td>
          <td>${usage.quantity}</td>
          <td>${escapeHtml(formatDate(usage.createdAt))}</td>
        </tr>`;
    })
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 11px; }
          th { background: #dbeafe; color: #1e3a8a; font-weight: 800; }
        </style>
      </head>
      <body>
        <table>
          <tr><th colspan="12">RELATÓRIO DE MATERIAL EXTRA UTILIZADO</th></tr>
          <tr>
            <th>Campeonato</th><th>Rodada/Fase</th><th>Nº jogo</th><th>Data</th>
            <th>Partida</th><th>Estádio</th><th>Cidade/UF</th><th>Missão</th>
            <th>DCO</th><th>Material</th><th>Qtd.</th><th>Registro</th>
          </tr>
          ${bodyRows}
        </table>
      </body>
    </html>`;
}

function downloadExcel(rows: UsageReportRow[]) {
  const html = buildUsageReportExcel(rows);
  const blob = new Blob(['\ufeff', html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-material-extra-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ExtraMaterialsPage() {
  const user = getUser();
  const userRole = String(user?.role || user?.user?.role || '').trim().toUpperCase();
  const isAdmin = userRole === 'ADMIN';
  const [activeTab, setActiveTab] = useState<MaterialTab>('COLLECTOR');
  const [items, setItems] = useState<ExtraMaterialItem[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [summary, setSummary] = useState<ExtraMaterialSummary>(initialSummary);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingEntry, setSavingEntry] = useState(false);
  const [savingTransfer, setSavingTransfer] = useState(false);
  const [savingReturnKey, setSavingReturnKey] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [modal, setModal] = useState<ModalState>(initialModal);

  const [entryQuantity, setEntryQuantity] = useState('');
  const [entryNotes, setEntryNotes] = useState('');
  const [transferOfficialId, setTransferOfficialId] = useState('');
  const [transferQuantity, setTransferQuantity] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [returnQuantities, setReturnQuantities] = useState<Record<string, string>>({});
  const [usageReportStartDate, setUsageReportStartDate] = useState('');
  const [usageReportEndDate, setUsageReportEndDate] = useState('');

  const activeItem = useMemo(() => {
    if (activeTab === 'COLLECTOR') {
      return items.find((item) => item.active && isCollectorName(item.name)) || null;
    }

    return items.find((item) => item.active && isPartialTapeName(item.name)) || null;
  }, [activeTab, items]);

  const dcoOptions = useMemo(
    () =>
      officials
        .filter(
          (official) =>
            official.active !== false &&
            String(official.operationalRole || '').toUpperCase() === 'DCO',
        )
        .sort((a, b) =>
          String(a.user?.name || '').localeCompare(String(b.user?.name || ''), 'pt-BR'),
        ),
    [officials],
  );

  const activeItemSummary = useMemo(() => {
    if (!activeItem) {
      return {
        available: 0,
        withDco: 0,
        used: 0,
        total: 0,
        dcoCount: 0,
      };
    }

    const available =
      summary.centralStock.find((stock) => stock.itemId === activeItem.id)?.quantity || 0;

    const withDco = summary.byDco.reduce((total, dco) => {
      const stock = dco.items.find((item) => item.itemId === activeItem.id);
      return total + Number(stock?.quantity || 0);
    }, 0);

    const used =
      summary.usedByGame.find((item) => item.itemId === activeItem.id)?.quantity || 0;

    const dcoCount = summary.byDco.filter((dco) =>
      dco.items.some(
        (item) => item.itemId === activeItem.id && Number(item.quantity) > 0,
      ),
    ).length;

    return {
      available,
      withDco,
      used,
      total: available + withDco + used,
      dcoCount,
    };
  }, [activeItem, summary]);

  const dcoStocksForActiveItem = useMemo(() => {
    if (!activeItem) return [];

    return summary.byDco
      .map((dco) => {
        const stock = dco.items.find((item) => item.itemId === activeItem.id);

        return {
          officialId: dco.officialId,
          name: dco.name,
          email: dco.email,
          quantity: Number(stock?.quantity || 0),
        };
      })
      .filter((dco) => dco.quantity > 0)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [activeItem, summary.byDco]);

  const activeItemMovements = useMemo(() => {
    if (!activeItem) return [];

    return movements.filter((movement) => movement.item?.id === activeItem.id);
  }, [activeItem, movements]);

  async function loadData() {
    try {
      setLoading(true);

      const [itemsResponse, summaryResponse, officialsResponse, movementsResponse] =
        await Promise.all([
          api.get('/extra-materials/items'),
          api.get('/extra-materials/summary'),
          isAdmin ? api.get('/officials') : Promise.resolve({ data: [] }),
          api.get('/extra-materials/movements'),
        ]);

      setItems(itemsResponse.data || []);
      setSummary(summaryResponse.data || initialSummary);
      setOfficials(officialsResponse.data || []);
      setMovements(movementsResponse.data || []);
    } catch (error: any) {
      openModal(
        'danger',
        'Erro ao carregar materiais',
        getErrorMessage(error, 'Não foi possível carregar os dados de material extra.'),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openModal(variant: ModalVariant, title: string, message: string) {
    setModal({
      open: true,
      title,
      message,
      variant,
      confirmText: 'Fechar',
    });
  }

  function closeModal() {
    setModal(initialModal);
  }

  function changeTab(tab: MaterialTab) {
    setActiveTab(tab);
    setEntryQuantity('');
    setEntryNotes('');
    setTransferQuantity('');
    setTransferNotes('');
    setTransferOfficialId('');
  }

  async function handleCreateEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeItem) {
      openModal('warning', 'Material não encontrado', 'O material da aba não está cadastrado ou está inativo.');
      return;
    }

    const quantity = Number(entryQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      openModal('warning', 'Quantidade inválida', 'Informe uma quantidade maior que zero.');
      return;
    }

    try {
      setSavingEntry(true);

      await api.post('/extra-materials/entries', {
        itemId: activeItem.id,
        quantity,
        notes: entryNotes.trim() || undefined,
      });

      setEntryQuantity('');
      setEntryNotes('');
      await loadData();

      openModal('success', 'Entrada cadastrada', `${quantity} unidade(s) adicionada(s) em ${activeItem.name}.`);
    } catch (error: any) {
      openModal('danger', 'Erro ao cadastrar entrada', getErrorMessage(error, 'Não foi possível cadastrar a entrada.'));
    } finally {
      setSavingEntry(false);
    }
  }

  async function handleTransfer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeItem) {
      openModal('warning', 'Material não encontrado', 'O material da aba não está cadastrado ou está inativo.');
      return;
    }

    const quantity = Number(transferQuantity);

    if (!transferOfficialId || !Number.isInteger(quantity) || quantity <= 0) {
      openModal('warning', 'Campos obrigatórios', 'Selecione o DCO e informe uma quantidade maior que zero.');
      return;
    }

    if (quantity > activeItemSummary.available) {
      openModal('warning', 'Saldo insuficiente', `Existem somente ${activeItemSummary.available} unidade(s) disponíveis.`);
      return;
    }

    try {
      setSavingTransfer(true);

      await api.post('/extra-materials/transfers', {
        officialId: transferOfficialId,
        items: [{ itemId: activeItem.id, quantity }],
        notes: transferNotes.trim() || undefined,
      });

      setTransferOfficialId('');
      setTransferQuantity('');
      setTransferNotes('');
      await loadData();

      openModal('success', 'Repasse realizado', `${quantity} unidade(s) repassada(s) para o DCO.`);
    } catch (error: any) {
      openModal('danger', 'Erro ao realizar repasse', getErrorMessage(error, 'Não foi possível realizar o repasse.'));
    } finally {
      setSavingTransfer(false);
    }
  }

  async function handleReturnFromDco(dco: {
    officialId: string;
    name: string;
    quantity: number;
  }) {
    if (!activeItem) return;

    const key = `${dco.officialId}-${activeItem.id}`;
    const quantity = Number(returnQuantities[key]);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      openModal('warning', 'Quantidade inválida', 'Informe uma quantidade maior que zero para devolução.');
      return;
    }

    if (quantity > dco.quantity) {
      openModal('warning', 'Quantidade indisponível', `${dco.name} possui somente ${dco.quantity} unidade(s).`);
      return;
    }

    try {
      setSavingReturnKey(key);

      await api.post('/extra-materials/returns', {
        officialId: dco.officialId,
        itemId: activeItem.id,
        quantity,
        notes: `Devolução de ${activeItem.name} para disponível.`,
      });

      setReturnQuantities((current) => ({ ...current, [key]: '' }));
      await loadData();

      openModal('success', 'Devolução registrada', `${quantity} unidade(s) voltaram para disponível.`);
    } catch (error: any) {
      openModal('danger', 'Erro ao registrar devolução', getErrorMessage(error, 'Não foi possível registrar a devolução.'));
    } finally {
      setSavingReturnKey('');
    }
  }

  async function generateUsageReport() {
    try {
      setGeneratingReport(true);

      const response = await api.get('/extra-materials/reports/usages', {
        params: {
          startDate: usageReportStartDate || undefined,
          endDate: usageReportEndDate || undefined,
        },
      });

      const rows: UsageReportRow[] = response.data || [];

      if (rows.length === 0) {
        openModal('warning', 'Sem registros', 'Nenhum material utilizado foi encontrado para o período.');
        return;
      }

      downloadExcel(rows);
      openModal('success', 'Relatório gerado', `Excel gerado com ${rows.length} registro(s).`);
    } catch (error: any) {
      openModal('danger', 'Erro ao gerar relatório', getErrorMessage(error, 'Não foi possível gerar o relatório.'));
    } finally {
      setGeneratingReport(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="border-b border-slate-200 bg-white px-4 py-5 lg:px-8 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--cdb-blue-soft)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                📦 Gestão de estoque
              </div>

              <h1 className="mt-3 text-3xl font-black text-[var(--cdb-dark)] lg:text-4xl">
                Material Extra
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 lg:text-base">
                Gerencie entradas, repasses para DCOs e acompanhe os materiais disponíveis e utilizados nos jogos.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="w-fit rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 font-bold text-white shadow-lg transition hover:brightness-95 disabled:opacity-60"
            >
              {loading ? 'Atualizando...' : `${activeItemSummary.total} unidade(s)`}
            </button>
          </div>
        </header>

        <section className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                  Relatório de materiais utilizados
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Inclui copos, fita e formulários registrados nos jogos.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <FieldWithLabel label="Data inicial">
                  <input
                    type="date"
                    value={usageReportStartDate}
                    onChange={(event) => setUsageReportStartDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                  />
                </FieldWithLabel>

                <FieldWithLabel label="Data final">
                  <input
                    type="date"
                    value={usageReportEndDate}
                    onChange={(event) => setUsageReportEndDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                  />
                </FieldWithLabel>

                <button
                  type="button"
                  onClick={generateUsageReport}
                  disabled={generatingReport}
                  className="self-start rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60 sm:self-auto"
                >
                  {generatingReport ? 'Gerando...' : '📊 Gerar Excel'}
                </button>
              </div>
            </div>
          </section>


          <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => changeTab('COLLECTOR')}
                className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                  activeTab === 'COLLECTOR'
                    ? 'bg-[var(--cdb-blue)] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[var(--cdb-blue)]'
                }`}
              >
                🥤 Copo coletor
              </button>

              <button
                type="button"
                onClick={() => changeTab('TAPE')}
                className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                  activeTab === 'TAPE'
                    ? 'bg-[var(--cdb-blue)] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[var(--cdb-blue)]'
                }`}
              >
                🎗️ Fita parcial
              </button>
            </div>
          </div>

          {!activeItem && !loading ? (
            <section className="rounded-3xl border border-dashed border-red-200 bg-red-50 p-8 text-center">
              <h2 className="font-black text-red-700">Material não encontrado</h2>
              <p className="mt-2 text-sm text-red-600">
                Cadastre e ative o item correspondente à aba para utilizar o controle de estoque.
              </p>
            </section>
          ) : (
            <>
              {isAdmin ? (
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard title="Disponível" value={activeItemSummary.available} icon="✅" />
                  <SummaryCard title="Com DCO" value={activeItemSummary.withDco} icon="👤" />
                  <SummaryCard title="Utilizados em jogos" value={activeItemSummary.used} icon="🧪" />
                  <SummaryCard title="DCOs com material" value={activeItemSummary.dcoCount} icon="📋" />
                </section>
              ) : (
                <section className="grid gap-4 sm:grid-cols-2">
                  <SummaryCard title="Comigo para uso" value={activeItemSummary.withDco} icon="👤" />
                  <SummaryCard title="Utilizados em jogos" value={activeItemSummary.used} icon="🧪" />
                </section>
              )}

              {isAdmin && (
              <section className="grid gap-6 xl:grid-cols-2">
                <form
                  onSubmit={handleCreateEntry}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5">
                    <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                      Entrada de {activeItem?.name || 'material'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Adicione a quantidade recebida ao saldo disponível.
                    </p>
                  </div>

                  <FieldWithLabel label="Quantidade recebida *">
                    <input
                      type="number"
                      min="1"
                      value={entryQuantity}
                      onChange={(event) => setEntryQuantity(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                      placeholder="Ex.: 100"
                    />
                  </FieldWithLabel>

                  <div className="mt-4">
                    <FieldWithLabel label="Observação">
                      <textarea
                        value={entryNotes}
                        onChange={(event) => setEntryNotes(event.target.value)}
                        className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                        placeholder="Ex.: Material recebido na remessa do mês"
                      />
                    </FieldWithLabel>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingEntry || !activeItem}
                      className="rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingEntry ? 'Cadastrando...' : 'Cadastrar entrada'}
                    </button>
                  </div>
                </form>

                <form
                  onSubmit={handleTransfer}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5">
                    <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                      Repasse para DCO
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      O material sai de disponível e passa para responsabilidade do DCO.
                    </p>
                  </div>

                  <FieldWithLabel label="DCO *">
                    <select
                      value={transferOfficialId}
                      onChange={(event) => setTransferOfficialId(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Selecione</option>
                      {dcoOptions.map((official) => (
                        <option key={official.id} value={official.id}>
                          {official.user?.name}
                        </option>
                      ))}
                    </select>
                  </FieldWithLabel>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <FieldWithLabel label="Quantidade *">
                      <input
                        type="number"
                        min="1"
                        max={activeItemSummary.available || undefined}
                        value={transferQuantity}
                        onChange={(event) => setTransferQuantity(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                        placeholder="Ex.: 20"
                      />
                    </FieldWithLabel>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--cdb-blue)]">
                        Saldo disponível
                      </p>
                      <p className="mt-1 text-2xl font-black text-[var(--cdb-dark)]">
                        {activeItemSummary.available}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <FieldWithLabel label="Observação">
                      <textarea
                        value={transferNotes}
                        onChange={(event) => setTransferNotes(event.target.value)}
                        className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                        placeholder="Ex.: Repasse para os jogos do fim de semana"
                      />
                    </FieldWithLabel>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingTransfer || !activeItem}
                      className="rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingTransfer ? 'Repassando...' : 'Repassar material'}
                    </button>
                  </div>
                </form>
              </section>
              )}

              {isAdmin && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                    {activeItem?.name} por DCO
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Veja a quantidade sob responsabilidade de cada DCO e faça devoluções para disponível.
                  </p>
                </div>

                {dcoStocksForActiveItem.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                    Nenhum DCO possui este material no momento.
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {dcoStocksForActiveItem.map((dco) => {
                      const returnKey = `${dco.officialId}-${activeItem?.id || ''}`;

                      return (
                        <div
                          key={dco.officialId}
                          className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-black text-slate-900">{dco.name}</h3>
                              {dco.email && (
                                <p className="text-sm text-slate-500">{dco.email}</p>
                              )}
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[var(--cdb-blue)]">
                              {dco.quantity} unidade(s)
                            </span>
                          </div>

                          <div className="mt-4">
                            <span className="mb-2 block text-sm font-bold text-slate-700">
                              Quantidade para devolver
                            </span>

                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input
                                type="number"
                                min="1"
                                max={dco.quantity}
                                value={returnQuantities[returnKey] || ''}
                                onChange={(event) =>
                                  setReturnQuantities((current) => ({
                                    ...current,
                                    [returnKey]: event.target.value,
                                  }))
                                }
                                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                                placeholder="Ex.: 10"
                              />

                              <button
                              type="button"
                              onClick={() => handleReturnFromDco(dco)}
                              disabled={savingReturnKey === returnKey}
                              className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                            >
                              {savingReturnKey === returnKey ? 'Devolvendo...' : '↩️ Disponível'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
              )}

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                    {isAdmin ? `Movimentações de ${activeItem?.name}` : `Minhas movimentações de ${activeItem?.name}`}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {isAdmin
                      ? 'Histórico de entradas, repasses, devoluções e utilização em jogos.'
                      : 'Acompanhe os materiais recebidos e utilizados por você nos jogos.'}
                  </p>
                </div>

                {loading ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                    Carregando movimentações...
                  </div>
                ) : activeItemMovements.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                    Nenhuma movimentação encontrada para este material.
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 lg:hidden">
                      {activeItemMovements.map((movement) => (
                        <article
                          key={movement.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getMovementClass(movement.type)}`}>
                              {getMovementLabel(movement.type)}
                            </span>
                            <span className="text-sm font-black text-slate-900">
                              {movement.quantity} un.
                            </span>
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            {movement.toOfficial?.user?.name ||
                              movement.fromOfficial?.user?.name ||
                              (movement.match
                                ? `${movement.match.homeTeam} x ${movement.match.awayTeam}`
                                : '-')}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(movement.createdAt)}
                          </p>
                        </article>
                      ))}
                    </div>

                    <div className="hidden overflow-hidden rounded-3xl border border-slate-200 lg:block">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-5 py-4 font-black text-slate-700">Data</th>
                            <th className="px-5 py-4 font-black text-slate-700">Tipo</th>
                            <th className="px-5 py-4 font-black text-slate-700">Quantidade</th>
                            <th className="px-5 py-4 font-black text-slate-700">DCO/Jogo</th>
                            <th className="px-5 py-4 font-black text-slate-700">Observação</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                          {activeItemMovements.map((movement) => (
                            <tr key={movement.id} className="hover:bg-slate-50">
                              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                {formatDate(movement.createdAt)}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getMovementClass(movement.type)}`}>
                                  {getMovementLabel(movement.type)}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-black text-slate-900">
                                {movement.quantity}
                              </td>
                              <td className="px-5 py-4 text-slate-600">
                                {movement.toOfficial?.user?.name ||
                                  movement.fromOfficial?.user?.name ||
                                  (movement.match
                                    ? `${movement.match.homeTeam} x ${movement.match.awayTeam}`
                                    : '-')}
                              </td>
                              <td className="max-w-sm px-5 py-4 text-slate-500">
                                {movement.notes || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            </>
          )}

        </section>

        <ConfirmModal
          open={modal.open}
          title={modal.title}
          message={modal.message}
          variant={modal.variant}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
          onCancel={closeModal}
          onConfirm={closeModal}
        />
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black text-[var(--cdb-dark)]">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function FieldWithLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
