'use client';

import { useEffect, useState } from 'react';
import { api } from '../../services/api';
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

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);

  async function loadMatches() {
    const response = await api.get('/matches');
    setMatches(response.data);
  }

  useEffect(() => {
    loadMatches();
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

  return (
    <main className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Painel operacional
              </p>

              <h1 className="text-4xl font-black mt-1">
                Dashboard
              </h1>
            </div>

            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl font-semibold">
              Sistema online
            </div>
          </div>
        </header>

        <section className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Jogos cadastrados
                  </p>

                  <h2 className="text-4xl font-black mt-2">
                    {matches.length}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                  🏟️
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Em andamento
                  </p>

                  <h2 className="text-4xl font-black mt-2 text-yellow-600">
                    {inProgress}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center text-3xl">
                  🔴
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Controles realizados
                  </p>

                  <h2 className="text-4xl font-black mt-2 text-green-600">
                    {finished}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-3xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Jogos agendados
                  </p>

                  <h2 className="text-4xl font-black mt-2 text-blue-600">
                    {scheduled}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl">
                  📅
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
            <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black">
                    Operações recentes
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Últimos jogos cadastrados no sistema
                  </p>
                </div>

                <div className="bg-slate-100 px-4 py-2 rounded-2xl text-sm font-semibold">
                  {matches.length} jogos
                </div>
              </div>

              <div className="space-y-4">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="border border-slate-200 rounded-3xl p-5 hover:border-slate-300 transition"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold">
                          {match.homeTeam} x{' '}
                          {match.awayTeam}
                        </h3>

                        <p className="text-slate-500 mt-1">
                          {match.championship.name}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <div className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            🏟️ {match.stadium.name}
                          </div>

                          <div className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            📍 {match.stadium.city}/
                            {match.stadium.state}
                          </div>

                          <div className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            🕒{' '}
                            {new Date(
                              match.matchDate,
                            ).toLocaleString(
                              'pt-BR',
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`${getStatusClass(
                            match.status,
                          )} px-4 py-2 rounded-2xl text-sm font-semibold`}
                        >
                          {getStatusLabel(
                            match.status,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {matches.length === 0 && (
                  <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center">
                    <div className="text-6xl mb-4">
                      🏟️
                    </div>

                    <h3 className="text-xl font-bold">
                      Nenhum jogo cadastrado
                    </h3>

                    <p className="text-slate-500 mt-2">
                      Cadastre partidas para iniciar a operação.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-black mb-5">
                  Status operacional
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Operações</span>
                      <span>76%</span>
                    </div>

                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-green-500 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Checklists</span>
                      <span>58%</span>
                    </div>

                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-2/4 bg-blue-500 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Controle concluído</span>
                      <span>41%</span>
                    </div>

                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-yellow-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-950 to-slate-800 text-white rounded-3xl p-6">
                <div className="text-5xl mb-4">
                  ⚽
                </div>

                <h2 className="text-2xl font-black">
                  Controle operacional
                </h2>

                <p className="text-slate-300 mt-3 leading-relaxed">
                  Plataforma preparada para operação
                  em tempo real durante partidas e
                  auditoria completa do processo
                  antidoping.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}