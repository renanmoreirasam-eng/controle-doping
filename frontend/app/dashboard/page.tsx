'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { api } from '../../services/api';
import { getUser } from '../../services/auth';
import { Sidebar } from '../../components/Sidebar';

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  status: string;

  championship: {
    name: string;
  };

  stadium: {
    name: string;
    city: string;
    state: string;
  };
};

type Scale = {
  id: string;
  officialId: string;
  confirmed: boolean | null;

  official?: {
    id?: string;
    user?: {
      id?: string;
      name?: string;
      email?: string;
    };
  };

  match?: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    championship?: {
      name: string;
    };
  };
};

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [pendingScales, setPendingScales] = useState<Scale[]>([]);
  const [loadingPendingScales, setLoadingPendingScales] = useState(true);

  async function loadMatches() {
    const response = await api.get('/matches');
    setMatches(response.data);
  }

  async function loadPendingScales() {
    try {
      const loggedUser = getUser();

      const loggedUserId =
        loggedUser?.id ||
        loggedUser?.sub ||
        loggedUser?.userId ||
        loggedUser?.user?.id;

      const loggedUserEmail =
        loggedUser?.email ||
        loggedUser?.user?.email;

      const response = await api.get('/match-officials');

      const scales = response.data.filter((scale: Scale) => {
        const isPending =
          scale.confirmed === null ||
          scale.confirmed === undefined;

        const belongsToLoggedUser =
          scale.official?.user?.id === loggedUserId ||
          scale.official?.user?.email === loggedUserEmail;

        return isPending && belongsToLoggedUser;
      });

      setPendingScales(scales);
    } catch (error) {
      setPendingScales([]);
    } finally {
      setLoadingPendingScales(false);
    }
  }

  useEffect(() => {
    loadMatches();
    loadPendingScales();
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
      return 'bg-slate-100 text-slate-700';
    }

    if (status === 'SCALE_ACCEPTED') {
      return 'bg-blue-100 text-blue-700';
    }

    if (status === 'IN_PROGRESS') {
      return 'bg-yellow-100 text-yellow-700';
    }

    if (status === 'CONTROL_DONE') {
      return 'bg-green-100 text-green-700';
    }

    if (status === 'CANCELED') {
      return 'bg-red-100 text-red-700';
    }

    return 'bg-slate-100 text-slate-700';
  }

  const inProgress = matches.filter(
    (match) => match.status === 'IN_PROGRESS',
  ).length;

  const finished = matches.filter(
    (match) => match.status === 'CONTROL_DONE',
  ).length;

  const scheduled = matches.filter(
    (match) => match.status === 'SCHEDULED',
  ).length;

  const recentMatches = matches.slice(0, 5);

  const nextPendingScale = pendingScales
    .slice()
    .sort((a, b) => {
      const dateA = a.match?.matchDate
        ? new Date(a.match.matchDate).getTime()
        : 0;

      const dateB = b.match?.matchDate
        ? new Date(b.match.matchDate).getTime()
        : 0;

      return dateA - dateB;
    })[0];

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Painel operacional
              </p>

              <h1 className="text-3xl lg:text-4xl font-black mt-1">
                Dashboard
              </h1>
            </div>

            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl font-semibold w-fit">
              Sistema online
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 lg:gap-5">
            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm">
                    Jogos cadastrados
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2">
                    {matches.length}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                  🏟️
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm">
                    Em andamento
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-yellow-600">
                    {inProgress}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-yellow-100 flex items-center justify-center text-3xl">
                  🔴
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm">
                    Controles realizados
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-green-600">
                    {finished}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-green-100 flex items-center justify-center text-3xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm">
                    Jogos agendados
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-blue-600">
                    {scheduled}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl">
                  📅
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/scales?status=PENDING"
              className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:-translate-y-0.5 hover:shadow-md ${
                pendingScales.length > 0
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`text-sm ${
                      pendingScales.length > 0
                        ? 'text-orange-700'
                        : 'text-slate-500'
                    }`}
                  >
                    Escalas pendentes
                  </p>

                  <h2
                    className={`text-3xl lg:text-4xl font-black mt-2 ${
                      pendingScales.length > 0
                        ? 'text-orange-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {loadingPendingScales ? '-' : pendingScales.length}
                  </h2>

                  <p className="text-xs text-slate-500 mt-2">
                    Clique para confirmar
                  </p>
                </div>

                <div
                  className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                    pendingScales.length > 0
                      ? 'bg-orange-100'
                      : 'bg-slate-100'
                  }`}
                >
                  📋
                </div>
              </div>
            </Link>
          </div>

          {pendingScales.length > 0 && (
            <Link
              href="/dashboard/scales?status=PENDING"
              className="block mt-6 bg-orange-50 border border-orange-200 rounded-3xl p-5 lg:p-6 hover:bg-orange-100 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-black">
                    Ação necessária
                  </p>

                  <h2 className="text-xl lg:text-2xl font-black text-slate-900 mt-2">
                    Você possui {pendingScales.length} escala(s) pendente(s) de aprovação
                  </h2>

                  {nextPendingScale?.match && (
                    <p className="text-slate-600 mt-2">
                      Próxima escala: {nextPendingScale.match.homeTeam} x{' '}
                      {nextPendingScale.match.awayTeam}
                    </p>
                  )}
                </div>

                <span className="bg-orange-600 text-white px-5 py-3 rounded-2xl text-sm font-bold text-center">
                  Ver escalas pendentes
                </span>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
            <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-4 lg:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black">
                    Operações recentes
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Últimos jogos cadastrados no sistema
                  </p>
                </div>

                <div className="bg-slate-100 px-4 py-2 rounded-2xl text-sm font-semibold w-fit">
                  {matches.length} jogos
                </div>
              </div>

              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="border border-slate-200 rounded-3xl p-4 lg:p-5 hover:border-slate-300 transition"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold">
                          {match.homeTeam} x {match.awayTeam}
                        </h3>

                        <p className="text-slate-500 mt-1">
                          {match.championship.name}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <div className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            🏟️ {match.stadium.name}
                          </div>

                          <div className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            📍 {match.stadium.city}/{match.stadium.state}
                          </div>

                          <div className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
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
                          )} inline-flex whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-semibold`}
                        >
                          {getStatusLabel(match.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {matches.length === 0 && (
                  <div className="border border-dashed border-slate-300 rounded-3xl p-8 text-center">
                    <div className="text-5xl mb-4">⚽</div>

                    <h3 className="text-xl font-bold">
                      Nenhuma operação encontrada
                    </h3>

                    <p className="text-slate-500 mt-2">
                      Cadastre jogos para visualizar o painel operacional.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 lg:p-6">
                <h2 className="text-2xl font-black mb-4">
                  Resumo operacional
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-slate-500">
                      Jogos cadastrados
                    </span>

                    <strong>{matches.length}</strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-slate-500">
                      Em andamento
                    </span>

                    <strong className="text-yellow-600">
                      {inProgress}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-slate-500">
                      Finalizados
                    </span>

                    <strong className="text-green-600">
                      {finished}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Minhas pendências
                    </span>

                    <strong
                      className={
                        pendingScales.length > 0
                          ? 'text-orange-600'
                          : 'text-slate-700'
                      }
                    >
                      {pendingScales.length}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 text-white rounded-3xl p-4 lg:p-6">
                <h2 className="text-2xl font-black mb-3">
                  Controle Doping
                </h2>

                <p className="text-slate-400">
                  Acompanhe partidas, escalas, sorteios e controles realizados.
                </p>

                <Link
                  href="/dashboard/matches"
                  className="block mt-6 bg-white text-slate-950 text-center py-3 rounded-2xl font-bold"
                >
                  Ver jogos
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
