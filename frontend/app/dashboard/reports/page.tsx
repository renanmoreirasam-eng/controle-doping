'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';
import { getUser } from '../../../services/auth';

type FilterOption = {
  id: string;
  name: string;
  email?: string;
  city?: string;
  state?: string;
};

type ReportsResponse = {
  filters: {
    championships: FilterOption[];
    stadiums: FilterOption[];
    officials: FilterOption[];
  };
  summary: {
    totalMatches: number;
    scheduledMatches: number;
    scaleAcceptedMatches: number;
    inProgressMatches: number;
    controlDoneMatches: number;
    canceledMatches: number;
    totalScales: number;
    confirmedScales: number;
    pendingScales: number;
    refusedScales: number;
    pendingMatches: number;
    documentsComplete: number;
  };
  statusBreakdown: {
    status: string;
    label: string;
    total: number;
  }[];
  pendingSummary: {
    noMissionOrder: number;
    noAthleteList: number;
    noFinalDocument: number;
    noDraw: number;
    noKit: number;
    noRoomInspection: number;
    scalePending: number;
    scaleRefused: number;
  };
  byOfficial: {
    officialId: string;
    name: string;
    email: string;
    role: string;
    totalScales: number;
    totalMatches: number;
    asDco: number;
    asAssistant: number;
    confirmed: number;
    pending: number;
    refused: number;
    controlDoneMatches: number;
  }[];
  byChampionship: {
    championshipId: string;
    name: string;
    totalMatches: number;
    scheduled: number;
    scaleAccepted: number;
    inProgress: number;
    controlDone: number;
    canceled: number;
  }[];
  byStadium: {
    stadiumId: string;
    name: string;
    city: string;
    state: string;
    totalMatches: number;
    controlDone: number;
    pendingDocuments: number;
  }[];
  pendingMatches: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    status: string;
    statusLabel: string;
    championship: string;
    stadium: string;
    issues: string[];
  }[];
  documents: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    status: string;
    statusLabel: string;
    championship: string;
    missionOrderSent: boolean;
    athleteListSent: boolean;
    finalDocumentSent: boolean;
    missionOrderFileName?: string | null;
    athleteListFileName?: string | null;
    finalDocumentFileName?: string | null;
  }[];
};

type ActiveTab = 'SUMMARY' | 'OFFICIALS' | 'PENDING' | 'DOCUMENTS';

const emptyReports: ReportsResponse = {
  filters: {
    championships: [],
    stadiums: [],
    officials: [],
  },
  summary: {
    totalMatches: 0,
    scheduledMatches: 0,
    scaleAcceptedMatches: 0,
    inProgressMatches: 0,
    controlDoneMatches: 0,
    canceledMatches: 0,
    totalScales: 0,
    confirmedScales: 0,
    pendingScales: 0,
    refusedScales: 0,
    pendingMatches: 0,
    documentsComplete: 0,
  },
  statusBreakdown: [],
  pendingSummary: {
    noMissionOrder: 0,
    noAthleteList: 0,
    noFinalDocument: 0,
    noDraw: 0,
    noKit: 0,
    noRoomInspection: 0,
    scalePending: 0,
    scaleRefused: 0,
  },
  byOfficial: [],
  byChampionship: [],
  byStadium: [],
  pendingMatches: [],
  documents: [],
};

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'SCALE_ACCEPTED', label: 'Escala aceita' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'CONTROL_DONE', label: 'Controle realizado' },
  { value: 'CANCELED', label: 'Cancelado' },
];

function getDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getYearStartDate() {
  const now = new Date();
  return getDateInputValue(new Date(now.getFullYear(), 0, 1));
}

function getTodayDate() {
  return getDateInputValue(new Date());
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPercent(value: number, total: number) {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function getStatusClass(status: string) {
  if (status === 'SCHEDULED') return 'border-slate-200 bg-slate-50 text-slate-700';
  if (status === 'SCALE_ACCEPTED') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (status === 'IN_PROGRESS') return 'border-yellow-200 bg-yellow-50 text-yellow-700';
  if (status === 'CONTROL_DONE') return 'border-green-200 bg-green-50 text-green-700';
  if (status === 'CANCELED') return 'border-red-200 bg-red-50 text-red-700';

  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function getDocumentBadge(sent: boolean) {
  return sent ? (
    <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-black text-green-700">
      Enviado
    </span>
  ) : (
    <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
      Pendente
    </span>
  );
}

function SummaryCard({
  label,
  value,
  description,
  tone = 'blue',
}: {
  label: string;
  value: number | string;
  description: string;
  tone?: 'blue' | 'green' | 'yellow' | 'red' | 'slate';
}) {
  const toneClass = {
    blue: 'border-blue-100 bg-blue-50 text-[var(--cdb-blue)]',
    green: 'border-green-100 bg-green-50 text-green-700',
    yellow: 'border-yellow-100 bg-yellow-50 text-yellow-700',
    red: 'border-red-100 bg-red-50 text-red-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  }[tone];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-2xl border px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${toneClass}`}>
        {label}
      </div>

      <p className="mt-4 text-3xl font-black text-[var(--cdb-dark)]">
        {value}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function OperationalReportsPage() {
  const user = getUser();
  const userRole = String(user?.role || user?.user?.role || '').toUpperCase();
  const isAdmin = userRole === 'ADMIN';

  const [reports, setReports] = useState<ReportsResponse>(emptyReports);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('SUMMARY');

  const [startDate, setStartDate] = useState(getYearStartDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [championshipId, setChampionshipId] = useState('');
  const [stadiumId, setStadiumId] = useState('');
  const [officialId, setOfficialId] = useState('');
  const [status, setStatus] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (championshipId) params.set('championshipId', championshipId);
    if (stadiumId) params.set('stadiumId', stadiumId);
    if (officialId) params.set('officialId', officialId);
    if (status) params.set('status', status);

    return params.toString();
  }, [championshipId, endDate, officialId, stadiumId, startDate, status]);

  async function loadReports() {
    if (!isAdmin) return;

    try {
      setLoading(true);

      const response = await api.get<ReportsResponse>(`/reports/operational?${queryString}`);

      setReports(response.data || emptyReports);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [queryString, isAdmin]);

  function resetFilters() {
    setStartDate(getYearStartDate());
    setEndDate(getTodayDate());
    setChampionshipId('');
    setStadiumId('');
    setOfficialId('');
    setStatus('');
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
        <Sidebar />

        <div className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm lg:p-8">
            <span className="inline-flex w-fit items-center rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-700">
              Acesso bloqueado
            </span>

            <h1 className="mt-4 text-2xl font-black text-[var(--cdb-dark)] lg:text-4xl">
              Relatórios indisponíveis
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 lg:text-base">
              Esta área é exclusiva para administradores.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative p-6 lg:p-8">
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                    Relatórios Operacionais
                  </span>

                  <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--cdb-dark)] lg:text-5xl">
                    Visão gerencial da operação
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 lg:text-base">
                    Acompanhe jogos, oficiais, documentos e pendências operacionais com filtros por período, campeonato, estádio, oficial e status.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-black text-[var(--cdb-dark)]">
                    Período do relatório
                  </p>

                  <p className="mt-1 font-semibold">
                    {startDate || 'Início'} até {endDate || 'hoje'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="px-4 pb-8 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Filtros
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Ajuste os filtros para recalcular todas as visões da página.
                </p>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex w-fit items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Limpar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Data inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Data final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Campeonato
                </label>
                <select
                  value={championshipId}
                  onChange={(event) => setChampionshipId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Todos</option>
                  {reports.filters.championships.map((championship) => (
                    <option key={championship.id} value={championship.id}>
                      {championship.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Estádio
                </label>
                <select
                  value={stadiumId}
                  onChange={(event) => setStadiumId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Todos</option>
                  {reports.filters.stadiums.map((stadium) => (
                    <option key={stadium.id} value={stadium.id}>
                      {stadium.name} · {stadium.city}/{stadium.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Oficial
                </label>
                <select
                  value={officialId}
                  onChange={(event) => setOfficialId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Todos</option>
                  {reports.filters.officials.map((official) => (
                    <option key={official.id} value={official.id}>
                      {official.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
              Carregando relatórios...
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label="Jogos"
                  value={reports.summary.totalMatches}
                  description="Total de jogos no período filtrado"
                />
                <SummaryCard
                  label="Realizados"
                  value={reports.summary.controlDoneMatches}
                  description={`${formatPercent(reports.summary.controlDoneMatches, reports.summary.totalMatches)} dos jogos filtrados`}
                  tone="green"
                />
                <SummaryCard
                  label="Escalas"
                  value={reports.summary.totalScales}
                  description={`${reports.summary.confirmedScales} confirmada(s), ${reports.summary.pendingScales} pendente(s)`}
                  tone="yellow"
                />
                <SummaryCard
                  label="Pendências"
                  value={reports.summary.pendingMatches}
                  description="Jogos com algum ponto de atenção"
                  tone={reports.summary.pendingMatches > 0 ? 'red' : 'green'}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
                {[
                  { id: 'SUMMARY', label: 'Resumo geral' },
                  { id: 'OFFICIALS', label: 'Por oficial' },
                  { id: 'PENDING', label: 'Pendências' },
                  { id: 'DOCUMENTS', label: 'Documentos' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                      activeTab === tab.id
                        ? 'bg-[var(--cdb-blue)] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[var(--cdb-blue)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'SUMMARY' && (
                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                        Status dos jogos
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Distribuição dos jogos por situação operacional.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {reports.statusBreakdown.map((item) => (
                        <div key={item.status} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-black text-slate-700">
                              {item.label}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                              {item.total}
                            </span>
                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                            <div
                              className="h-full rounded-full bg-[var(--cdb-blue)]"
                              style={{ width: formatPercent(item.total, reports.summary.totalMatches) }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                        Ranking por campeonato
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Campeonatos com maior volume de jogos no período.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[680px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs uppercase tracking-[0.14em] text-slate-400">
                            <th className="py-3 pr-4">Campeonato</th>
                            <th className="py-3 pr-4">Jogos</th>
                            <th className="py-3 pr-4">Realizados</th>
                            <th className="py-3 pr-4">Em andamento</th>
                            <th className="py-3 pr-4">Cancelados</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reports.byChampionship.slice(0, 10).map((row) => (
                            <tr key={row.championshipId} className="hover:bg-slate-50">
                              <td className="py-3 pr-4 font-black text-slate-800">{row.name}</td>
                              <td className="py-3 pr-4 font-bold text-slate-700">{row.totalMatches}</td>
                              <td className="py-3 pr-4 font-bold text-green-700">{row.controlDone}</td>
                              <td className="py-3 pr-4 font-bold text-yellow-700">{row.inProgress}</td>
                              <td className="py-3 pr-4 font-bold text-red-700">{row.canceled}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                        Ranking por estádio
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Locais com maior volume de jogos e pendências documentais.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs uppercase tracking-[0.14em] text-slate-400">
                            <th className="py-3 pr-4">Estádio</th>
                            <th className="py-3 pr-4">Localidade</th>
                            <th className="py-3 pr-4">Jogos</th>
                            <th className="py-3 pr-4">Realizados</th>
                            <th className="py-3 pr-4">Pend. documentos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reports.byStadium.slice(0, 12).map((row) => (
                            <tr key={row.stadiumId} className="hover:bg-slate-50">
                              <td className="py-3 pr-4 font-black text-slate-800">{row.name}</td>
                              <td className="py-3 pr-4 font-semibold text-slate-500">{row.city}/{row.state}</td>
                              <td className="py-3 pr-4 font-bold text-slate-700">{row.totalMatches}</td>
                              <td className="py-3 pr-4 font-bold text-green-700">{row.controlDone}</td>
                              <td className="py-3 pr-4 font-bold text-red-700">{row.pendingDocuments}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'OFFICIALS' && (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                      Jogos por oficial
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Quantidade de jogos, função exercida e status das confirmações.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-[0.14em] text-slate-400">
                          <th className="py-3 pr-4">Oficial</th>
                          <th className="py-3 pr-4">Jogos</th>
                          <th className="py-3 pr-4">DCO</th>
                          <th className="py-3 pr-4">Assistente</th>
                          <th className="py-3 pr-4">Confirmadas</th>
                          <th className="py-3 pr-4">Pendentes</th>
                          <th className="py-3 pr-4">Recusadas</th>
                          <th className="py-3 pr-4">Controles realizados</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.byOfficial.map((row) => (
                          <tr key={row.officialId} className="hover:bg-slate-50">
                            <td className="py-3 pr-4">
                              <p className="font-black text-slate-800">{row.name}</p>
                              <p className="text-xs font-semibold text-slate-500">{row.email}</p>
                            </td>
                            <td className="py-3 pr-4 font-bold text-slate-700">{row.totalMatches}</td>
                            <td className="py-3 pr-4 font-bold text-[var(--cdb-blue)]">{row.asDco}</td>
                            <td className="py-3 pr-4 font-bold text-slate-700">{row.asAssistant}</td>
                            <td className="py-3 pr-4 font-bold text-green-700">{row.confirmed}</td>
                            <td className="py-3 pr-4 font-bold text-yellow-700">{row.pending}</td>
                            <td className="py-3 pr-4 font-bold text-red-700">{row.refused}</td>
                            <td className="py-3 pr-4 font-bold text-green-700">{row.controlDoneMatches}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {reports.byOfficial.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
                      Nenhum oficial encontrado para os filtros selecionados.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'PENDING' && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard label="Sem ordem" value={reports.pendingSummary.noMissionOrder} description="Jogos sem ordem de missão" tone="red" />
                    <SummaryCard label="Sem relação" value={reports.pendingSummary.noAthleteList} description="Jogos sem relação de atletas" tone="red" />
                    <SummaryCard label="Sem documento final" value={reports.pendingSummary.noFinalDocument} description="Finalizados sem documento final" tone="red" />
                    <SummaryCard label="Escala pendente" value={reports.pendingSummary.scalePending} description="Jogos com confirmação pendente" tone="yellow" />
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                        Jogos com pendências
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Lista limitada aos 100 registros mais recentes com algum ponto de atenção.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {reports.pendingMatches.map((match) => (
                        <div key={match.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusClass(match.status)}`}>
                                  {match.statusLabel}
                                </span>
                                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
                                  {formatDateTime(match.matchDate)}
                                </span>
                              </div>

                              <h3 className="mt-3 text-lg font-black text-[var(--cdb-dark)]">
                                {match.homeTeam} x {match.awayTeam}
                              </h3>

                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                {match.championship} · {match.stadium}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {match.issues.map((issue) => (
                                  <span key={issue} className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                                    {issue}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <Link
                              href={`/dashboard/matches/${match.id}`}
                              className="inline-flex w-fit items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
                            >
                              Abrir jogo
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    {reports.pendingMatches.length === 0 && (
                      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-sm font-semibold text-green-700">
                        Nenhuma pendência encontrada para os filtros selecionados.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'DOCUMENTS' && (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                      Documentos dos jogos
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Acompanhe ordem de missão, relação de atletas e documento final. Lista limitada aos 150 jogos mais recentes.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-[0.14em] text-slate-400">
                          <th className="py-3 pr-4">Jogo</th>
                          <th className="py-3 pr-4">Data</th>
                          <th className="py-3 pr-4">Status</th>
                          <th className="py-3 pr-4">Ordem</th>
                          <th className="py-3 pr-4">Relação atletas</th>
                          <th className="py-3 pr-4">Documento final</th>
                          <th className="py-3 pr-4">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.documents.map((document) => (
                          <tr key={document.id} className="hover:bg-slate-50">
                            <td className="py-3 pr-4">
                              <p className="font-black text-slate-800">
                                {document.homeTeam} x {document.awayTeam}
                              </p>
                              <p className="text-xs font-semibold text-slate-500">
                                {document.championship}
                              </p>
                            </td>
                            <td className="py-3 pr-4 font-semibold text-slate-600">{formatDateTime(document.matchDate)}</td>
                            <td className="py-3 pr-4">
                              <span className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusClass(document.status)}`}>
                                {document.statusLabel}
                              </span>
                            </td>
                            <td className="py-3 pr-4">{getDocumentBadge(document.missionOrderSent)}</td>
                            <td className="py-3 pr-4">{getDocumentBadge(document.athleteListSent)}</td>
                            <td className="py-3 pr-4">{getDocumentBadge(document.finalDocumentSent)}</td>
                            <td className="py-3 pr-4">
                              <Link
                                href={`/dashboard/matches/${document.id}`}
                                className="inline-flex items-center justify-center rounded-xl bg-[var(--cdb-blue)] px-3 py-2 text-xs font-bold text-white transition hover:brightness-95"
                              >
                                Abrir
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {reports.documents.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
                      Nenhum jogo encontrado para os filtros selecionados.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
