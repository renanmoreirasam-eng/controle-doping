'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';
import { getUser } from '../../../services/auth';

type Championship = {
  id: string;
  name: string;
};

type Stadium = {
  id: string;
  name: string;
  city: string;
  state: string;
};

type Team = {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  state: string;
  isActive: boolean;
};

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  status: string;
  missionCode?: string;
  championshipId?: string;
  stadiumId?: string;

  championship: {
    id?: string;
    name: string;
  };

  stadium: {
    id?: string;
    name: string;
    city: string;
    state: string;
  };

  officials?: {
    id: string;
    role: string;
    confirmed: boolean | null;
  }[];
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'DONE'>('ACTIVE');

  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [search, setSearch] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);

  const [championshipId, setChampionshipId] = useState('');
  const [championshipName, setChampionshipName] = useState('');

  const [stadiumId, setStadiumId] = useState('');
  const [stadiumName, setStadiumName] = useState('');

  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');

  const [status, setStatus] = useState('SCHEDULED');

  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [missionCode, setMissionCode] = useState('');

  const user = getUser();

  const userRole = String(
    user?.role || user?.user?.role || '',
  ).toUpperCase();

  const isAdmin = userRole === 'ADMIN';

  const formRef = useRef<HTMLDivElement | null>(null);

  async function loadMatches() {
    const response = await api.get('/matches');
    setMatches(response.data);
  }

  async function loadChampionships() {
    const response = await api.get('/championships');
    setChampionships(response.data);
  }

  async function loadStadiums() {
    const response = await api.get('/stadiums');
    setStadiums(response.data);
  }

  async function loadTeams() {
    const response = await api.get('/teams');

    const activeTeams = response.data.filter(
      (team: Team) => team.isActive,
    );

    setTeams(activeTeams);
  }

  useEffect(() => {
    loadMatches();
    loadChampionships();
    loadStadiums();
    loadTeams();
  }, []);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const value = `
        ${match.missionCode || ''}
        ${match.homeTeam}
        ${match.awayTeam}
        ${match.championship.name}
        ${match.stadium.name}
        ${match.stadium.city}
      `.toLowerCase();

      const matchesSearch = value.includes(search.toLowerCase());

      const matchesTab =
        activeTab === 'DONE'
          ? match.status === 'CONTROL_DONE'
          : match.status !== 'CONTROL_DONE';

      return matchesSearch && matchesTab;
    });
  }, [matches, search, activeTab]);

  const scheduledMatches = matches.filter(
    (match) => match.status === 'SCHEDULED',
  ).length;

  const progressMatches = matches.filter(
    (match) => match.status === 'IN_PROGRESS',
  ).length;

  const completedMatches = matches.filter(
    (match) => match.status === 'CONTROL_DONE',
  ).length;

  const activeMatches = matches.filter(
    (match) => match.status !== 'CONTROL_DONE',
  ).length;

  const doneMatches = matches.filter(
    (match) => match.status === 'CONTROL_DONE',
  ).length;

  function clearForm() {
    setEditingId(null);
    setChampionshipId('');
    setChampionshipName('');
    setStadiumId('');
    setStadiumName('');
    setHomeTeam('');
    setAwayTeam('');
    setMatchDate('');
    setMatchTime('');
    setMissionCode('');
    setStatus('SCHEDULED');
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString('pt-BR');
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDateOnly(date: string) {
    return new Date(date).toISOString().slice(0, 10);
  }

  function formatTimeOnly(date: string) {
    return new Date(date).toTimeString().slice(0, 5);
  }

  function teamLabel(team: Team) {
    return `${team.name} — ${team.city}/${team.state}`;
  }

  function stadiumLabel(stadium: Stadium) {
    return `${stadium.name} — ${stadium.city}/${stadium.state}`;
  }

  function teamExists(teamName: string) {
    return teams.some(
      (team) =>
        team.name.trim().toLowerCase() ===
        teamName.trim().toLowerCase(),
    );
  }

  function findChampionshipByName(name: string) {
    return championships.find(
      (championship) =>
        championship.name.trim().toLowerCase() ===
        name.trim().toLowerCase(),
    );
  }

  function findStadiumByLabel(label: string) {
    return stadiums.find(
      (stadium) =>
        stadiumLabel(stadium).trim().toLowerCase() ===
        label.trim().toLowerCase(),
    );
  }

  function findStadiumByMatch(match: Match) {
    return stadiums.find((stadium) => {
      if (match.stadiumId && stadium.id === match.stadiumId) {
        return true;
      }

      return (
        stadium.name === match.stadium.name &&
        stadium.city === match.stadium.city &&
        stadium.state === match.stadium.state
      );
    });
  }

  function startEdit(match: Match) {
    setEditingId(match.id);

    const currentChampionship = championships.find(
      (championship) =>
        championship.id === match.championshipId ||
        championship.id === match.championship.id ||
        championship.name === match.championship.name,
    );

    setChampionshipId(
      match.championshipId ||
        match.championship.id ||
        currentChampionship?.id ||
        '',
    );

    setChampionshipName(
      currentChampionship?.name ||
        match.championship.name ||
        '',
    );

    const currentStadium = findStadiumByMatch(match);

    setStadiumId(
      match.stadiumId ||
        match.stadium.id ||
        currentStadium?.id ||
        '',
    );

    setStadiumName(
      currentStadium
        ? stadiumLabel(currentStadium)
        : `${match.stadium.name} — ${match.stadium.city}/${match.stadium.state}`,
    );

    setHomeTeam(match.homeTeam);
    setAwayTeam(match.awayTeam);

    setMissionCode(match.missionCode || '');
    setMatchDate(formatDateOnly(match.matchDate));
    setMatchTime(formatTimeOnly(match.matchDate));

    setStatus(match.status);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }

  async function createMatch() {
    if (!matchDate || !matchTime) {
      alert('Informe a data e o horário do jogo');
      return;
    }

    try {
      const fullMatchDate = `${matchDate}T${matchTime}:00`;

      await api.post('/matches', {
        championshipId,
        stadiumId,
        homeTeam,
        awayTeam,
        missionCode,
        matchDate: fullMatchDate,
      });

      clearForm();
      await loadMatches();

      alert('Jogo cadastrado com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao cadastrar jogo',
      );
    }
  }

  async function updateMatch() {
    if (!editingId) return;

    if (!matchDate || !matchTime) {
      alert('Informe a data e o horário do jogo');
      return;
    }

    try {
      const fullMatchDate = `${matchDate}T${matchTime}:00`;

      await api.patch(`/matches/${editingId}`, {
        championshipId,
        stadiumId,
        homeTeam,
        awayTeam,
        missionCode,
        matchDate: fullMatchDate,
        status,
      });

      clearForm();
      await loadMatches();

      alert('Jogo atualizado com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao atualizar jogo',
      );
    }
  }

  async function deleteMatch(id: string) {
    const confirmDelete = confirm(
      'Deseja realmente excluir este jogo?',
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/matches/${id}`);

      await loadMatches();

      alert('Jogo excluído com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao excluir jogo',
      );
    }
  }

  async function handleSubmit() {
    if (
      !championshipName.trim() ||
      !stadiumName.trim() ||
      !homeTeam.trim() ||
      !awayTeam.trim() ||
      !matchDate ||
      !matchTime
    ) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const selectedChampionship =
      findChampionshipByName(championshipName);

    if (!selectedChampionship) {
      alert('Selecione um campeonato válido da lista');
      return;
    }

    const selectedStadium = findStadiumByLabel(stadiumName);

    if (!selectedStadium) {
      alert('Selecione um estádio válido da lista');
      return;
    }

    if (!teamExists(homeTeam)) {
      alert('Selecione um time mandante válido da lista');
      return;
    }

    if (!teamExists(awayTeam)) {
      alert('Selecione um time visitante válido da lista');
      return;
    }

    if (
      homeTeam.trim().toLowerCase() ===
      awayTeam.trim().toLowerCase()
    ) {
      alert(
        'Mandante e visitante não podem ser o mesmo time',
      );
      return;
    }

    setChampionshipId(selectedChampionship.id);
    setStadiumId(selectedStadium.id);

    if (editingId) {
      await updateMatchWithIds(
        selectedChampionship.id,
        selectedStadium.id,
      );
      return;
    }

    await createMatchWithIds(
      selectedChampionship.id,
      selectedStadium.id,
    );
  }

  async function createMatchWithIds(
    selectedChampionshipId: string,
    selectedStadiumId: string,
  ) {
    if (!matchDate || !matchTime) {
      alert('Informe a data e o horário do jogo');
      return;
    }

    try {
      const fullMatchDate = `${matchDate}T${matchTime}:00`;

      await api.post('/matches', {
        championshipId: selectedChampionshipId,
        stadiumId: selectedStadiumId,
        homeTeam,
        awayTeam,
        missionCode,
        matchDate: fullMatchDate,
      });

      clearForm();
      await loadMatches();

      alert('Jogo cadastrado com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao cadastrar jogo',
      );
    }
  }

  async function updateMatchWithIds(
    selectedChampionshipId: string,
    selectedStadiumId: string,
  ) {
    if (!editingId) return;

    if (!matchDate || !matchTime) {
      alert('Informe a data e o horário do jogo');
      return;
    }

    try {
      const fullMatchDate = `${matchDate}T${matchTime}:00`;

      await api.patch(`/matches/${editingId}`, {
        championshipId: selectedChampionshipId,
        stadiumId: selectedStadiumId,
        homeTeam,
        awayTeam,
        missionCode,
        matchDate: fullMatchDate,
        status,
      });

      clearForm();
      await loadMatches();

      alert('Jogo atualizado com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao atualizar jogo',
      );
    }
  }

  function getStatusLabel(match: Match) {
    if (match.status === 'IN_PROGRESS') {
      return 'Em andamento';
    }

    if (match.status === 'CONTROL_DONE') {
      return 'Controle realizado';
    }

    if (match.status === 'CANCELED') {
      return 'Cancelado';
    }

    const confirmedCount =
      match.officials?.filter(
        (official) => official.confirmed === true,
      ).length || 0;

    if (confirmedCount === 1) {
      return 'Escala aceita 1 DCO';
    }

    if (confirmedCount >= 2) {
      return 'Escala aceita 2 DCO';
    }

    return 'Agendado';
  }

  function getStatusClass(match: Match) {
    if (match.status === 'IN_PROGRESS') {
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    }

    if (match.status === 'CONTROL_DONE') {
      return 'bg-emerald-50 text-[var(--cdb-green)] border border-emerald-100';
    }

    if (match.status === 'CANCELED') {
      return 'bg-red-50 text-red-700 border border-red-100';
    }

    const confirmedCount =
      match.officials?.filter(
        (official) => official.confirmed === true,
      ).length || 0;

    if (confirmedCount === 1) {
      return 'bg-blue-50 text-[var(--cdb-blue)] border border-slate-200';
    }

    if (confirmedCount >= 2) {
      return 'bg-emerald-50 text-[var(--cdb-green)] border border-emerald-100';
    }

    return 'bg-slate-100 text-slate-700 border border-slate-200';
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                ⚽ Gestão operacional
              </div>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Jogos
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Cadastre, acompanhe e opere as partidas do controle de doping.
              </p>
            </div>

            <div className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold shadow-lg w-fit">
              {matches.length} jogos cadastrados
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-8">
            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Jogos cadastrados
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-dark)]">
                    {matches.length}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] flex items-center justify-center text-3xl">
                  🏟️
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Jogos agendados
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-blue)]">
                    {scheduledMatches}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] flex items-center justify-center text-3xl">
                  📅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Em andamento
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[#9A7600]">
                    {progressMatches}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-yellow-soft)] text-[#9A7600] flex items-center justify-center text-3xl">
                  🔴
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Controles realizados
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-green)]">
                    {completedMatches}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-green-soft)] text-[var(--cdb-green)] flex items-center justify-center text-3xl">
                  ✅
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div ref={formRef} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 lg:p-6 mb-6 lg:mb-8 scroll-mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                    {editingId
                      ? 'Editar jogo'
                      : 'Cadastrar jogo'}
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Digite e selecione os dados das listas para cadastrar a partida.
                  </p>
                </div>

                {editingId && (
                  <span className="bg-blue-50 text-[var(--cdb-blue)] border border-slate-200 px-4 py-2 rounded-2xl text-sm font-black">
                    Modo edição
                  </span>
                )}
              </div>

              <datalist id="championships-list">
                {championships.map((championship) => (
                  <option
                    key={championship.id}
                    value={championship.name}
                  />
                ))}
              </datalist>

              <datalist id="stadiums-list">
                {stadiums.map((stadium) => (
                  <option
                    key={stadium.id}
                    value={stadiumLabel(stadium)}
                  />
                ))}
              </datalist>

              <datalist id="teams-list">
                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.name}
                    label={teamLabel(team)}
                  />
                ))}
              </datalist>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3">
                <div className="xl:col-span-2">
                  <input
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    placeholder="Código da missão"
                    value={missionCode}
                    onChange={(e) => setMissionCode(e.target.value)}
                  />

                  <p className="mt-2 px-2 text-xs font-bold text-slate-700">
                    Código da missão
                  </p>
                </div>

                <div className="xl:col-span-5">
                  <input
                    list="championships-list"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    placeholder="Digite o campeonato"
                    value={championshipName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setChampionshipName(value);

                      const selected =
                        findChampionshipByName(value);

                      setChampionshipId(selected?.id || '');
                    }}
                  />

                  <p className="mt-2 px-2 text-xs font-bold text-slate-700">
                    Campeonato *
                  </p>
                </div>

                <div className="xl:col-span-5">
                  <input
                    list="stadiums-list"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    placeholder="Digite o estádio"
                    value={stadiumName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStadiumName(value);

                      const selected = findStadiumByLabel(value);

                      setStadiumId(selected?.id || '');
                    }}
                  />

                  <p className="mt-2 px-2 text-xs font-bold text-slate-700">
                    Estádio *
                  </p>
                </div>

                <div className="xl:col-span-3">
                  <input
                    list="teams-list"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    placeholder="Digite o mandante"
                    value={homeTeam}
                    onChange={(e) =>
                      setHomeTeam(e.target.value)
                    }
                  />

                  <p className="mt-2 px-2 text-xs font-bold text-slate-700">
                    Time mandante *
                  </p>
                </div>

                <div className="xl:col-span-3">
                  <input
                    list="teams-list"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    placeholder="Digite o visitante"
                    value={awayTeam}
                    onChange={(e) =>
                      setAwayTeam(e.target.value)
                    }
                  />

                  <p className="mt-2 px-2 text-xs font-bold text-slate-700">
                    Time visitante *
                  </p>
                </div>

                <div className="xl:col-span-3">
                  <input
                    type="date"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                  />

                  <p className="mt-2 px-2 text-xs font-bold text-slate-700">
                    Data do jogo *
                  </p>
                </div>

                <div className="xl:col-span-3">
                  <input
                    type="time"
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                  />

                  <p className="mt-2 px-2 text-xs font-bold text-slate-700">
                    Horário do jogo *
                  </p>
                </div>
              </div>

              {editingId && (
                <div className="mt-4">
                  <select
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)]"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                  >
                    <option value="SCHEDULED">
                      Agendado
                    </option>

                    <option value="SCALE_ACCEPTED">
                      Escala aceita
                    </option>

                    <option value="IN_PROGRESS">
                      Em andamento
                    </option>

                    <option value="CONTROL_DONE">
                      Controle realizado
                    </option>

                    <option value="CANCELED">
                      Cancelado
                    </option>
                  </select>

                  <p className="mt-2 px-2 text-xs font-bold text-slate-700">
                    Status *
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  onClick={handleSubmit}
                  className="bg-[var(--cdb-blue)] text-white px-6 py-3 rounded-2xl font-black hover:brightness-90 transition text-center shadow-sm"
                >
                  {editingId
                    ? 'Salvar edição'
                    : 'Cadastrar jogo'}
                </button>

                {editingId && (
                  <button
                    onClick={clearForm}
                    className="bg-slate-100 text-slate-800 px-6 py-3 rounded-2xl font-semibold text-center hover:bg-slate-200 transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 lg:p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-[var(--cdb-dark)]">Jogos cadastrados</h2>
                <p className="text-slate-500 mt-1">
                  Controle operacional das partidas.
                </p>
              </div>

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]/30 focus:border-[var(--cdb-blue)] w-full xl:w-[420px]"
                placeholder="Buscar por missão, jogo, estádio ou campeonato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setActiveTab('ACTIVE')}
                className={`px-5 py-3 rounded-2xl font-semibold transition ${
                  activeTab === 'ACTIVE'
                    ? 'bg-[var(--cdb-blue)] text-white shadow-sm'
                    : 'bg-white text-[var(--cdb-blue)] border border-slate-200 hover:bg-[var(--cdb-blue-soft)]'
                }`}
              >
                Jogos ativos ({activeMatches})
              </button>

              <button
                onClick={() => setActiveTab('DONE')}
                className={`px-5 py-3 rounded-2xl font-semibold transition ${
                  activeTab === 'DONE'
                    ? 'bg-[var(--cdb-green)] text-white shadow-sm'
                    : 'bg-white text-[var(--cdb-blue)] border border-slate-200 hover:bg-[var(--cdb-blue-soft)]'
                }`}
              >
                Jogos concluídos ({doneMatches})
              </button>
            </div>

            <div className="lg:hidden space-y-4">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">
                          {match.missionCode || 'Sem missão'}
                        </p>

                        <h3 className="text-xl font-black text-[var(--cdb-dark)] mt-1 leading-tight">
                          {match.homeTeam} x {match.awayTeam}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {match.championship.name}
                        </p>
                      </div>

                      <span
                        className={`${getStatusClass(
                          match,
                        )} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}
                      >
                        {getStatusLabel(match)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-2xl p-3">
                      <p className="text-slate-500">Estádio</p>
                      <strong>🏟️ {match.stadium.name}</strong>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3">
                      <p className="text-slate-500">Cidade</p>
                      <strong>
                        {match.stadium.city}/{match.stadium.state}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-2xl p-3">
                        <p className="text-slate-500">Data</p>
                        <strong>{formatDate(match.matchDate)}</strong>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3">
                        <p className="text-slate-500">Horário</p>
                        <strong>{formatTime(match.matchDate)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-5">
                    <Link
                      href={`/dashboard/matches/${match.id}`}
                      className="bg-[var(--cdb-blue)] text-white text-center px-4 py-3 rounded-2xl text-sm font-semibold"
                    >
                      Abrir operação
                    </Link>

                    {isAdmin && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => startEdit(match)}
                          className="bg-[var(--cdb-blue)] text-white px-4 py-3 rounded-2xl text-sm font-semibold"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => deleteMatch(match.id)}
                          className="bg-red-600 text-white px-4 py-3 rounded-2xl text-sm font-semibold"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                    <th className="py-4 pr-4">
                      Jogo
                    </th>

                    <th className="py-4 pr-4">
                      Campeonato
                    </th>

                    <th className="py-4 pr-4">
                      Estádio
                    </th>

                    <th className="py-4 pr-4">
                      Data
                    </th>

                    <th className="py-4 pr-4">
                      Status
                    </th>

                    <th className="py-4 pr-4">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMatches.map((match) => (
                    <tr
                      key={match.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="py-5 pr-4">
                        <div className="font-black text-[var(--cdb-dark)]">
                          {match.homeTeam} x{' '}
                          {match.awayTeam}
                        </div>

                        <div className="text-sm text-slate-500 mt-1">
                          {match.stadium.city}/
                          {match.stadium.state}
                        </div>
                      </td>

                      <td className="py-5 pr-4 text-slate-700">
                        {match.championship.name}
                      </td>

                      <td className="py-5 pr-4 text-slate-700">
                        🏟️ {match.stadium.name}
                      </td>

                      <td className="py-5 pr-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatDate(match.matchDate)}
                      </td>

                      <td className="py-5 pr-4">
                        <span
                          className={`${getStatusClass(
                            match,
                          )} px-3 py-1 rounded-full text-sm font-semibold`}
                        >
                          {getStatusLabel(match)}
                        </span>
                      </td>

                      <td className="py-5 pr-4">
                        <div className="flex gap-2 flex-wrap">
                          <Link
                            href={`/dashboard/matches/${match.id}`}
                            className="bg-[var(--cdb-blue)] text-white px-4 py-2 rounded-xl text-sm font-semibold"
                          >
                            Operação
                          </Link>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => startEdit(match)}
                                className="bg-[var(--cdb-blue)] text-white px-4 py-2 rounded-xl text-sm font-semibold"
                              >
                                Editar
                              </button>

                              <button
                                onClick={() => deleteMatch(match.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                              >
                                Excluir
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMatches.length === 0 && (
              <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center mt-6">
                <div className="text-6xl mb-4">
                  ⚽
                </div>

                <h3 className="text-xl font-bold">
                  Nenhum jogo encontrado
                </h3>

                <p className="text-slate-500 mt-2">
                  Cadastre um jogo ou ajuste sua busca.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
