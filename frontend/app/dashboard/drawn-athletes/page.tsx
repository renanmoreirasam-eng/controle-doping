'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';

type Team = {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  state: string;
  isActive: boolean;
};

type SelectedAthlete = {
  id: string;
  drawId: string;
  matchId: string;
  teamName: string;
  teamSide: 'HOME' | 'AWAY';
  number: string;
  name: string;
  nickname?: string | null;
  type: 'EXAME';
  matchDate: string;
  matchLabel: string;
  homeTeam: string;
  awayTeam: string;
  championshipName?: string | null;
  stadiumName?: string | null;
  createdAt: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-BR');
}

function teamLabel(team: Team) {
  return `${team.name} — ${team.city}/${team.state}`;
}

export default function DrawnAthletesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [athletes, setAthletes] = useState<SelectedAthlete[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingAthletes, setLoadingAthletes] = useState(false);
  const [search, setSearch] = useState('');

  async function loadTeams() {
    try {
      setLoadingTeams(true);
      const response = await api.get('/teams');

      const activeTeams = response.data
        .filter((team: Team) => team.isActive)
        .sort((a: Team, b: Team) => a.name.localeCompare(b.name, 'pt-BR'));

      setTeams(activeTeams);
    } finally {
      setLoadingTeams(false);
    }
  }

  async function loadSelectedAthletes(teamName: string) {
    if (!teamName) {
      setAthletes([]);
      return;
    }

    try {
      setLoadingAthletes(true);
      const response = await api.get('/draws/selected-athletes', {
        params: {
          teamName,
        },
      });

      setAthletes(response.data);
    } finally {
      setLoadingAthletes(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    loadSelectedAthletes(selectedTeamName);
  }, [selectedTeamName]);

  const filteredAthletes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return athletes;
    }

    return athletes.filter((athlete) => {
      const value = `
        ${athlete.number}
        ${athlete.name}
        ${athlete.nickname || ''}
        ${athlete.matchLabel}
        ${athlete.championshipName || ''}
        ${athlete.stadiumName || ''}
      `.toLowerCase();

      return value.includes(normalizedSearch);
    });
  }, [athletes, search]);

  const athleteFrequency = useMemo(() => {
    const map = new Map<string, {
      key: string;
      number: string;
      name: string;
      count: number;
      dates: string[];
    }>();

    for (const athlete of athletes) {
      const key = `${athlete.number.trim().toLowerCase()}|${athlete.name.trim().toLowerCase()}`;
      const current = map.get(key);

      if (current) {
        current.count += 1;
        current.dates.push(athlete.matchDate);
        continue;
      }

      map.set(key, {
        key,
        number: athlete.number,
        name: athlete.name,
        count: 1,
        dates: [athlete.matchDate],
      });
    }

    return Array.from(map.values())
      .filter((item) => item.count > 1)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'));
  }, [athletes]);

  const lastDrawDate = useMemo(() => {
    if (athletes.length === 0) return null;

    return athletes
      .map((athlete) => new Date(athlete.matchDate))
      .sort((a, b) => b.getTime() - a.getTime())[0];
  }, [athletes]);

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--cdb-light)] lg:flex-row">
      <Sidebar />

      <div className="min-w-0 flex-1 overflow-x-hidden">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                🎲 Consulta operacional
              </div>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Atletas sorteados
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Consulte os atletas principais sorteados para exame por equipe. Reservas não são listados nesta visão.
              </p>
            </div>

            <div className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold shadow-lg w-fit">
              {selectedTeamName || 'Selecione uma equipe'}
            </div>
          </div>
        </header>

        <section className="w-full max-w-full overflow-x-hidden p-4 lg:p-8">
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                  value={selectedTeamName}
                  onChange={(event) => {
                    setSelectedTeamName(event.target.value);
                    setSearch('');
                  }}
                  disabled={loadingTeams}
                >
                  <option value="">
                    {loadingTeams ? 'Carregando equipes...' : 'Selecione uma equipe'}
                  </option>

                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {teamLabel(team)}
                    </option>
                  ))}
                </select>

                <label className="mt-2 block text-sm font-bold text-slate-700">
                  Equipe
                </label>
              </div>

              <div className="lg:col-span-5">
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  placeholder="Buscar por atleta, número, jogo ou campeonato..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  disabled={!selectedTeamName || athletes.length === 0}
                />

                <label className="mt-2 block text-sm font-bold text-slate-700">
                  Buscar
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Sorteios encontrados
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-[var(--cdb-blue)] lg:text-4xl">
                    {athletes.length}
                  </h2>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cdb-blue-soft)] text-3xl text-[var(--cdb-blue)] lg:h-16 lg:w-16">
                  🎲
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Atletas únicos
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-[var(--cdb-dark)] lg:text-4xl">
                    {new Set(athletes.map((athlete) => `${athlete.number}|${athlete.name}`)).size}
                  </h2>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl text-slate-600 lg:h-16 lg:w-16">
                  👥
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Repetidos
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-[#9A7600] lg:text-4xl">
                    {athleteFrequency.length}
                  </h2>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cdb-yellow-soft)] text-3xl text-[#9A7600] lg:h-16 lg:w-16">
                  🔁
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Último sorteio
                  </p>

                  <h2 className="mt-2 text-lg font-black text-[var(--cdb-green)] lg:text-xl">
                    {lastDrawDate ? lastDrawDate.toLocaleDateString('pt-BR') : '-'}
                  </h2>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cdb-green-soft)] text-3xl text-[var(--cdb-green)] lg:h-16 lg:w-16">
                  ✅
                </div>
              </div>
            </div>
          </div>

          {athleteFrequency.length > 0 && (
            <div className="mb-6 rounded-3xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm lg:p-6">
              <div className="mb-4">
                <span className="text-xs font-black uppercase tracking-[0.22em] text-[#9A7600]">
                  Atenção
                </span>

                <h2 className="mt-2 text-2xl font-black text-[#9A7600]">
                  Atletas sorteados mais de uma vez
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Esta lista considera número e nome do atleta dentro da equipe selecionada.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {athleteFrequency.map((athlete) => (
                  <div key={athlete.key} className="rounded-2xl border border-yellow-200 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Nº {athlete.number}
                    </p>

                    <h3 className="mt-1 text-lg font-black text-slate-900">
                      {athlete.name}
                    </h3>

                    <p className="mt-2 text-sm font-bold text-[#9A7600]">
                      Sorteado {athlete.count} vezes
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.22em] text-[var(--cdb-blue)]">
                  Resultado
                </span>

                <h2 className="mt-2 text-2xl font-black text-[var(--cdb-dark)]">
                  Histórico de atletas sorteados
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Exibindo somente atletas principais sorteados para exame.
                </p>
              </div>

              {loadingAthletes && (
                <span className="w-fit rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-[var(--cdb-blue)] ring-1 ring-blue-100">
                  Carregando...
                </span>
              )}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-[960px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                    <th className="py-4 pr-4 font-black">Número</th>
                    <th className="py-4 pr-4 font-black">Atleta</th>
                    <th className="py-4 pr-4 font-black">Jogo</th>
                    <th className="py-4 pr-4 font-black">Campeonato</th>
                    <th className="py-4 pr-4 font-black">Data</th>
                    <th className="py-4 pr-4 font-black">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAthletes.map((athlete) => (
                    <tr key={athlete.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="py-5 pr-4">
                        <span className="inline-flex min-w-12 items-center justify-center rounded-2xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-800">
                          {athlete.number}
                        </span>
                      </td>

                      <td className="py-5 pr-4">
                        <div className="font-black text-[var(--cdb-dark)]">
                          {athlete.name}
                        </div>

                        {athlete.nickname && (
                          <div className="mt-1 text-sm text-slate-500">
                            {athlete.nickname}
                          </div>
                        )}
                      </td>

                      <td className="py-5 pr-4">
                        <div className="font-bold text-slate-800">
                          {athlete.matchLabel}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {athlete.teamSide === 'HOME' ? 'Mandante' : 'Visitante'}
                        </div>
                      </td>

                      <td className="py-5 pr-4 text-slate-700">
                        {athlete.championshipName || '-'}
                      </td>

                      <td className="whitespace-nowrap py-5 pr-4 text-sm text-slate-600">
                        {formatDate(athlete.matchDate)}
                      </td>

                      <td className="py-5 pr-4">
                        <Link
                          href={`/dashboard/matches/${athlete.matchId}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          🧪 Ver operação
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 lg:hidden">
              {filteredAthletes.map((athlete) => (
                <div key={athlete.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--cdb-blue)]">
                        Nº {athlete.number}
                      </p>

                      <h3 className="mt-1 text-xl font-black text-[var(--cdb-dark)]">
                        {athlete.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {athlete.matchLabel}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                      Exame
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <p className="text-slate-500">Campeonato</p>
                      <strong>{athlete.championshipName || '-'}</strong>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <p className="text-slate-500">Data</p>
                      <strong>{formatDate(athlete.matchDate)}</strong>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/matches/${athlete.matchId}`}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    🧪 Ver operação
                  </Link>
                </div>
              ))}
            </div>

            {!selectedTeamName && (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-10 text-center">
                <div className="mb-4 text-6xl">🎲</div>

                <h3 className="text-xl font-bold text-[var(--cdb-dark)]">
                  Selecione uma equipe
                </h3>

                <p className="mt-2 text-slate-500">
                  Escolha uma equipe para consultar os atletas sorteados.
                </p>
              </div>
            )}

            {selectedTeamName && !loadingAthletes && filteredAthletes.length === 0 && (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-10 text-center">
                <div className="mb-4 text-6xl">🔎</div>

                <h3 className="text-xl font-bold text-[var(--cdb-dark)]">
                  Nenhum atleta sorteado encontrado
                </h3>

                <p className="mt-2 text-slate-500">
                  Não encontramos atletas principais sorteados para a equipe selecionada.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
