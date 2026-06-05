'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EnableNotificationsButton from '@/components/EnableNotificationsButton';

import { api } from '../../services/api';
import { getUser } from '../../services/auth';
import { Sidebar } from '../../components/Sidebar';

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  status: string;
  missionOrderFileName?: string | null;
  missionOrderFileType?: string | null;
  missionOrderFileData?: string | null;

  championship: {
    name: string;
  };

  stadium: {
    name: string;
    city: string;
    state: string;
  };
};

type DashboardSummary = {
  isAdmin: boolean;
  pendingScalesCount: number;
  refusedScalesCount: number;
  scalesWithoutMissionOrderCount: number;
  completedMatchesCount: number;
  recentCompletedMatches: Match[];
  nextPendingScale?: {
    id: string;
    matchId?: string;
    matchLabel?: string | null;
    match?: Match;
  } | null;
};

const emptySummary: DashboardSummary = {
  isAdmin: false,
  pendingScalesCount: 0,
  refusedScalesCount: 0,
  scalesWithoutMissionOrderCount: 0,
  completedMatchesCount: 0,
  recentCompletedMatches: [],
  nextPendingScale: null,
};

export default function Dashboard() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [loading, setLoading] = useState(true);

  async function loadDashboardData() {
    try {
      setLoading(true);

      const response = await api.get('/dashboard/summary');

      setSummary(response.data || emptySummary);
      setIsAdmin(Boolean(response.data?.isAdmin));
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setSummary(emptySummary);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const user = getUser();
    const userRole = String(
      user?.role || user?.user?.role || '',
    ).toUpperCase();

    setIsAdmin(userRole === 'ADMIN');
    setHasHydrated(true);

    loadDashboardData();
  }, []);

  function getStatusLabel(status: string) {
    if (status === 'SCHEDULED') return 'Agendado';
    if (status === 'SCALE_ACCEPTED') return 'Escala aceita';
    if (status === 'IN_PROGRESS') return 'Em andamento';
    if (status === 'CONTROL_DONE') return 'Controle realizado';
    if (status === 'CANCELED') return 'Cancelado';

    return status;
  }

  function getStatusClass(status: string) {
    if (status === 'SCHEDULED') {
      return 'bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] border border-blue-100';
    }

    if (status === 'SCALE_ACCEPTED') {
      return 'bg-[var(--cdb-green-soft)] text-[var(--cdb-green)] border border-emerald-100';
    }

    if (status === 'IN_PROGRESS') {
      return 'bg-[var(--cdb-yellow-soft)] text-[#9A7600] border border-yellow-200';
    }

    if (status === 'CONTROL_DONE') {
      return 'bg-[var(--cdb-green-soft)] text-[var(--cdb-green)] border border-emerald-100';
    }

    if (status === 'CANCELED') {
      return 'bg-red-50 text-red-700 border border-red-100';
    }

    return 'bg-slate-100 text-slate-700 border border-slate-200';
  }

  if (!hasHydrated) {
    return (
      <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
        <Sidebar />

        <div className="flex-1 p-4 lg:p-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
            Carregando dashboard...
          </div>
        </div>
      </main>
    );
  }

  const pendingScalesCount = summary.pendingScalesCount || 0;
  const refusedScalesCount = summary.refusedScalesCount || 0;
  const scalesWithoutMissionOrderCount =
    summary.scalesWithoutMissionOrderCount || 0;
  const completedMatchesCount = summary.completedMatchesCount || 0;
  const recentCompletedMatches = summary.recentCompletedMatches || [];
  const nextPendingScale = summary.nextPendingScale;

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                📊 Painel operacional
              </div>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Dashboard
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Acompanhe pendências de escala, recusas, ordens de missão e jogos realizados.
              </p>
            </div>

            <div className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold shadow-lg w-fit">
              {isAdmin ? 'Visão geral' : 'Minha visão'}
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 mb-8 ${
            isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-2'
          }`}>
            <Link
              href="/dashboard/scales?status=PENDING"
              className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:shadow-md ${
                pendingScalesCount > 0
                  ? 'bg-[var(--cdb-yellow-soft)] border-yellow-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      pendingScalesCount > 0
                        ? 'text-[#9A7600]'
                        : 'text-slate-500'
                    }`}
                  >
                    Escalas pendentes
                  </p>

                  <h2
                    className={`text-3xl lg:text-4xl font-black mt-2 ${
                      pendingScalesCount > 0
                        ? 'text-[#9A7600]'
                        : 'text-slate-700'
                    }`}
                  >
                    {loading ? '-' : pendingScalesCount}
                  </h2>

                  <p className="text-xs text-slate-500 mt-2">
                    {isAdmin
                      ? 'Todas pendentes de confirmação'
                      : 'Minhas pendentes de confirmação'}
                  </p>
                </div>

                <div
                  className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                    pendingScalesCount > 0
                      ? 'bg-yellow-100 text-[#9A7600]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📋
                </div>
              </div>
            </Link>

            {isAdmin && (
              <Link
                href="/dashboard/scales?status=REFUSED"
                className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:shadow-md ${
                  refusedScalesCount > 0
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        refusedScalesCount > 0
                          ? 'text-red-700'
                          : 'text-slate-500'
                      }`}
                    >
                      Escalas recusadas
                    </p>

                    <h2
                      className={`text-3xl lg:text-4xl font-black mt-2 ${
                        refusedScalesCount > 0
                          ? 'text-red-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {loading ? '-' : refusedScalesCount}
                    </h2>

                    <p className="text-xs text-slate-500 mt-2">
                      Clique para ver recusadas
                    </p>
                  </div>

                  <div
                    className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                      refusedScalesCount > 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    ⚠️
                  </div>
                </div>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/dashboard/matches?filter=MISSION_ORDER"
                className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:shadow-md ${
                  scalesWithoutMissionOrderCount > 0
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        scalesWithoutMissionOrderCount > 0
                          ? 'text-purple-700'
                          : 'text-slate-500'
                      }`}
                    >
                      Sem ordem de missão
                    </p>

                    <h2
                      className={`text-3xl lg:text-4xl font-black mt-2 ${
                        scalesWithoutMissionOrderCount > 0
                          ? 'text-purple-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {loading ? '-' : scalesWithoutMissionOrderCount}
                    </h2>

                    <p className="text-xs text-slate-500 mt-2">
                      Escalas com ordem não anexada
                    </p>
                  </div>

                  <div
                    className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                      scalesWithoutMissionOrderCount > 0
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    📄
                  </div>
                </div>
              </Link>
            )}

            <Link
              href="/dashboard/matches?status=CONTROL_DONE"
              className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Jogos realizados
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-green)]">
                    {loading ? '-' : completedMatchesCount}
                  </h2>

                  <p className="text-xs text-slate-500 mt-2">
                    {isAdmin ? 'Todos concluídos' : 'Meus jogos concluídos'}
                  </p>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-green-soft)] text-[var(--cdb-green)] flex items-center justify-center text-3xl">
                  ✅
                </div>
              </div>
            </Link>
          </div>

          {pendingScalesCount > 0 && (
            <Link
              href="/dashboard/scales?status=PENDING"
              className="block mb-8 bg-[var(--cdb-yellow-soft)] border border-yellow-200 rounded-3xl p-5 lg:p-6 hover:bg-yellow-100 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9A7600] font-black">
                    Ação necessária
                  </p>

                  <h2 className="text-xl lg:text-2xl font-black text-[var(--cdb-dark)] mt-2">
                    {isAdmin
                      ? `Existem ${pendingScalesCount} escala(s) pendente(s) de confirmação`
                      : `Você possui ${pendingScalesCount} escala(s) pendente(s) de confirmação`}
                  </h2>

                  {nextPendingScale?.match && (
                    <p className="text-slate-600 mt-2">
                      Próxima escala: {nextPendingScale.match.homeTeam} x{' '}
                      {nextPendingScale.match.awayTeam}
                    </p>
                  )}
                </div>

                <span className="bg-[var(--cdb-yellow)] text-slate-950 px-5 py-3 rounded-2xl text-sm font-black text-center">
                  Ver escalas pendentes
                </span>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                    Jogos realizados recentes
                  </h2>

                  <p className="text-slate-500 mt-1">
                    {isAdmin
                      ? 'Últimos controles realizados no sistema'
                      : 'Últimos controles realizados em que você esteve escalado'}
                  </p>
                </div>

                <div className="bg-[var(--cdb-green-soft)] text-[var(--cdb-green)] px-4 py-2 rounded-2xl text-sm font-black w-fit">
                  {completedMatchesCount} realizado(s)
                </div>
              </div>

              <div className="space-y-4">
                {recentCompletedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="border border-slate-200 rounded-3xl p-4 lg:p-5 hover:border-emerald-200 hover:bg-emerald-50/40 transition"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                      <div>
                        <h3 className="text-xl lg:text-2xl font-black text-[var(--cdb-dark)]">
                          {match.homeTeam} x {match.awayTeam}
                        </h3>

                        <p className="text-slate-500 mt-1">
                          {match.championship.name}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <div className="bg-slate-100 px-3 py-2 rounded-xl text-sm text-slate-700">
                            🏟️ {match.stadium.name}
                          </div>

                          <div className="bg-slate-100 px-3 py-2 rounded-xl text-sm text-slate-700">
                            📍 {match.stadium.city}/{match.stadium.state}
                          </div>

                          <div className="bg-slate-100 px-3 py-2 rounded-xl text-sm text-slate-700">
                            🕒{' '}
                            {new Date(match.matchDate).toLocaleString(
                              'pt-BR',
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`${getStatusClass(
                            match.status,
                          )} inline-flex whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-black`}
                        >
                          {getStatusLabel(match.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {recentCompletedMatches.length === 0 && (
                  <div className="border border-dashed border-slate-300 rounded-3xl p-8 text-center bg-slate-50">
                    <div className="text-5xl mb-4">✅</div>

                    <h3 className="text-xl font-black text-[var(--cdb-dark)]">
                      Nenhum jogo realizado encontrado
                    </h3>

                    <p className="text-slate-500 mt-2">
                      Os controles finalizados aparecerão aqui.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-6">
                <h2 className="text-2xl font-black mb-4 text-[var(--cdb-dark)]">
                  Resumo operacional
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-4">
                    <span className="text-slate-500 font-semibold">
                      Escalas pendentes
                    </span>

                    <strong
                      className={
                        pendingScalesCount > 0
                          ? 'text-[#9A7600]'
                          : 'text-slate-700'
                      }
                    >
                      {pendingScalesCount}
                    </strong>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-4">
                      <span className="text-slate-500 font-semibold">
                        Escalas recusadas
                      </span>

                      <strong
                        className={
                          refusedScalesCount > 0
                            ? 'text-red-700'
                            : 'text-slate-700'
                        }
                      >
                        {refusedScalesCount}
                      </strong>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-4">
                      <span className="text-slate-500 font-semibold">
                        Sem ordem de missão
                      </span>

                      <strong
                        className={
                          scalesWithoutMissionOrderCount > 0
                            ? 'text-purple-700'
                            : 'text-slate-700'
                        }
                      >
                        {scalesWithoutMissionOrderCount}
                      </strong>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500 font-semibold">
                      Jogos realizados
                    </span>

                    <strong className="text-[var(--cdb-green)]">
                      {completedMatchesCount}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-[var(--cdb-blue)] text-white rounded-3xl p-5 lg:p-6 shadow-sm">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-[var(--cdb-green)] rounded-full opacity-30" />
                <div className="absolute -right-4 bottom-4 w-20 h-20 bg-[var(--cdb-yellow)] rounded-full opacity-30" />

                <div className="relative">
                  <h2 className="text-2xl font-black mb-3">
                    Controle de Doping Brasil
                  </h2>

                  <p className="text-blue-100">
                    Acompanhe escalas, confirmações e controles realizados.
                  </p>

                  <Link
                    href="/dashboard/scales"
                    className="block mt-6 bg-white text-[var(--cdb-blue)] text-center py-3 rounded-2xl font-black hover:bg-slate-50 transition"
                  >
                    Ver escalas
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-6">
                <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                  Notificações
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Ative para receber avisos quando houver escala pendente.
                </p>

                <div className="mt-4">
                  <EnableNotificationsButton />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
