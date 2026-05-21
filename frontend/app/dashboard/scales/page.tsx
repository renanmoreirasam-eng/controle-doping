'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';
import { getUser } from '../../../services/auth';

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  championship: { name: string };
  stadium: { name: string; city: string; state: string };
};

type Official = {
  id: string;
  active: boolean;
  user: {
    id?: string;
    name: string;
    email: string;
  };
};

type Scale = {
  id: string;
  matchId: string;
  officialId: string;
  role: 'DCO' | 'ASSISTANT';
  confirmed: boolean | null;
  match: Match;
  official: Official;
};

type ScaleGroup = {
  match: Match;
  dco?: Scale;
  assistant?: Scale;
};

export default function ScalesPage() {
  const [scales, setScales] = useState<Scale[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [scaleStatusFilter, setScaleStatusFilter] = useState('');

  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState('');
  const [dcoOfficialId, setDcoOfficialId] = useState('');
  const [assistantOfficialId, setAssistantOfficialId] = useState('');

  const user = getUser();

  const userRole = String(
    user?.role || user?.user?.role || '',
  ).toUpperCase();

  const loggedUserId =
    user?.id ||
    user?.sub ||
    user?.userId ||
    user?.user?.id;

  const loggedUserEmail =
    user?.email ||
    user?.user?.email;

  const isAdmin = userRole === 'ADMIN';

  async function loadScales() {
    const response = await api.get('/match-officials');
    setScales(response.data);
  }

  async function loadMatches() {
    const response = await api.get('/matches');
    setMatches(response.data);
  }

  async function loadOfficials() {
    const response = await api.get('/officials');
    setOfficials(
      response.data.filter((item: Official) => item.active),
    );
  }

  useEffect(() => {
    loadScales();
    loadMatches();
    loadOfficials();
  }, []);

  function canConfirmScale(scale?: Scale) {
    if (!scale) return false;

    return (
      scale.official?.user?.id === loggedUserId ||
      scale.official?.user?.email === loggedUserEmail
    );
  }

  const groupedScales = useMemo(() => {
    const map = new Map<string, ScaleGroup>();

    for (const scale of scales) {
      if (!map.has(scale.matchId)) {
        map.set(scale.matchId, {
          match: scale.match,
        });
      }

      const group = map.get(scale.matchId)!;

      if (scale.role === 'DCO') {
        group.dco = scale;
      }

      if (scale.role === 'ASSISTANT') {
        group.assistant = scale;
      }
    }

    const groups = Array.from(map.values());

    if (isAdmin) {
      return groups;
    }

    return groups.filter(
      (group) =>
        canConfirmScale(group.dco) ||
        canConfirmScale(group.assistant),
    );
  }, [scales, isAdmin, loggedUserId, loggedUserEmail]);

  const filteredGroups = groupedScales.filter((group) => {
  const value = `
    ${group.match.homeTeam}
    ${group.match.awayTeam}
    ${group.match.championship.name}
    ${group.match.stadium.name}
    ${group.match.stadium.city}
    ${group.dco?.official.user.name || ''}
    ${group.assistant?.official.user.name || ''}
  `.toLowerCase();

  const matchesSearch = value.includes(search.toLowerCase());

  const matchDate = new Date(group.match.matchDate);

  const matchesStartDate = startDate
    ? matchDate >= new Date(`${startDate}T00:00:00`)
    : true;

  const matchesEndDate = endDate
    ? matchDate <= new Date(`${endDate}T23:59:59`)
    : true;

  const scaleStatuses = [
    group.dco?.confirmed,
    group.assistant?.confirmed,
  ];

  const matchesScaleStatus =
    !scaleStatusFilter ||
    scaleStatuses.some((confirmed) => {
      if (scaleStatusFilter === 'PENDING') {
        return confirmed === null || confirmed === undefined;
      }

      if (scaleStatusFilter === 'CONFIRMED') {
        return confirmed === true;
      }

      if (scaleStatusFilter === 'REFUSED') {
        return confirmed === false;
      }

      return true;
    });

  return (
    matchesSearch &&
    matchesStartDate &&
    matchesEndDate &&
    matchesScaleStatus
  );
});

  const availableMatches = useMemo(() => {
    return matches.filter((match) => {
      const group = groupedScales.find(
        (item) => item.match.id === match.id,
      );

      if (editingMatchId === match.id) {
        return true;
      }

      if (!group) {
        return true;
      }

      return !group.dco || !group.assistant;
    });
  }, [matches, groupedScales, editingMatchId]);

  const completeScales = groupedScales.filter(
    (group) => group.dco && group.assistant,
  ).length;

  const partialScales = groupedScales.filter(
    (group) => !group.dco || !group.assistant,
  ).length;

  const confirmedOfficials = scales.filter(
    (scale) => scale.confirmed === true,
  ).length;

  function clearForm() {
    setEditingMatchId(null);
    setMatchId('');
    setDcoOfficialId('');
    setAssistantOfficialId('');
  }

  function startEdit(group: ScaleGroup) {
    setEditingMatchId(group.match.id);
    setMatchId(group.match.id);
    setDcoOfficialId(group.dco?.officialId || '');
    setAssistantOfficialId(group.assistant?.officialId || '');
  }

  function getStatus(scale?: Scale) {
    if (!scale) return 'Não escalado';
    if (scale.confirmed === true) return 'Confirmado';
    if (scale.confirmed === false) return 'Recusado';
    return 'Pendente';
  }

  function getStatusClass(scale?: Scale) {
    if (!scale) return 'bg-slate-100 text-slate-600';
    if (scale.confirmed === true) return 'bg-green-100 text-green-700';
    if (scale.confirmed === false) return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  }

  async function createScale(role: 'DCO' | 'ASSISTANT', officialId: string) {
    await api.post('/match-officials', {
      matchId,
      officialId,
      role,
    });
  }

  async function saveScales() {
    if (!isAdmin) {
      alert('Você não tem permissão para editar escalas.');
      return;
    }

    if (!matchId) {
      alert('Selecione um jogo');
      return;
    }

    if (!dcoOfficialId && !assistantOfficialId) {
      alert('Selecione pelo menos um oficial');
      return;
    }

    if (
      dcoOfficialId &&
      assistantOfficialId &&
      dcoOfficialId === assistantOfficialId
    ) {
      alert('O DCO e o Assistente não podem ser o mesmo oficial');
      return;
    }

    try {
      const group = groupedScales.find(
        (item) => item.match.id === matchId,
      );

      if (group?.dco && group.dco.officialId !== dcoOfficialId) {
        await api.delete(`/match-officials/${group.dco.id}`);
      }

      if (
        group?.assistant &&
        group.assistant.officialId !== assistantOfficialId
      ) {
        await api.delete(`/match-officials/${group.assistant.id}`);
      }

      if (dcoOfficialId && group?.dco?.officialId !== dcoOfficialId) {
        await createScale('DCO', dcoOfficialId);
      }

      if (
        assistantOfficialId &&
        group?.assistant?.officialId !== assistantOfficialId
      ) {
        await createScale('ASSISTANT', assistantOfficialId);
      }

      clearForm();
      await loadScales();

      alert('Escala salva com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao salvar escala',
      );
    }
  }

  async function confirmScale(id: string) {
    await api.patch(`/match-officials/${id}/confirm`);
    await loadScales();
  }

  async function refuseScale(id: string) {
    await api.patch(`/match-officials/${id}/refuse`);
    await loadScales();
  }

  async function deleteScale(id: string) {
    if (!isAdmin) {
      alert('Você não tem permissão para remover escala.');
      return;
    }

    if (!confirm('Deseja remover este oficial da escala?')) return;

    await api.delete(`/match-officials/${id}`);
    await loadScales();
  }

  async function deleteFullScale(group: ScaleGroup) {
    if (!isAdmin) {
      alert('Você não tem permissão para excluir escala.');
      return;
    }

    if (!confirm('Deseja remover a escala completa deste jogo?')) return;

    if (group.dco) {
      await api.delete(`/match-officials/${group.dco.id}`);
    }

    if (group.assistant) {
      await api.delete(`/match-officials/${group.assistant.id}`);
    }

    await loadScales();
  }

  return (
    <main className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Gestão operacional
              </p>

              <h1 className="text-4xl font-black mt-1">
                Escalas
              </h1>
            </div>

            <div className="bg-slate-950 text-white px-5 py-3 rounded-2xl font-semibold">
              {groupedScales.length} jogos escalados
            </div>
          </div>
        </header>

        <section className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm">Escalas criadas</p>
              <h2 className="text-4xl font-black mt-2">
                {groupedScales.length}
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm">Completas</p>
              <h2 className="text-4xl font-black mt-2 text-green-600">
                {completeScales}
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm">Incompletas</p>
              <h2 className="text-4xl font-black mt-2 text-yellow-600">
                {partialScales}
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm">Confirmações</p>
              <h2 className="text-4xl font-black mt-2 text-blue-600">
                {confirmedOfficials}
              </h2>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black">
                    {editingMatchId ? 'Editar escala' : 'Nova escala'}
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Selecione o jogo e cadastre DCO e Assistente.
                  </p>
                </div>

                {editingMatchId && (
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-2xl text-sm font-semibold">
                    Modo edição
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                <select
                  className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-100"
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  disabled={!!editingMatchId}
                >
                  <option value="">Selecione o jogo</option>

                  {availableMatches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.homeTeam} x {match.awayTeam} —{' '}
                      {new Date(match.matchDate).toLocaleString('pt-BR')}
                    </option>
                  ))}
                </select>

                <select
                  className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                  value={dcoOfficialId}
                  onChange={(e) => setDcoOfficialId(e.target.value)}
                >
                  <option value="">DCO opcional</option>

                  {officials.map((official) => (
                    <option key={official.id} value={official.id}>
                      {official.user.name}
                    </option>
                  ))}
                </select>

                <select
                  className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                  value={assistantOfficialId}
                  onChange={(e) =>
                    setAssistantOfficialId(e.target.value)
                  }
                >
                  <option value="">Assistente opcional</option>

                  {officials.map((official) => (
                    <option key={official.id} value={official.id}>
                      {official.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={saveScales}
                  className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition"
                >
                  {editingMatchId ? 'Salvar edição' : 'Cadastrar escala'}
                </button>

                {editingMatchId && (
                  <button
                    onClick={clearForm}
                    className="bg-slate-100 text-slate-800 px-6 py-3 rounded-2xl font-semibold hover:bg-slate-200 transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black">
                  Escalas cadastradas
                </h2>

                <p className="text-slate-500 mt-1">
                  Visualização operacional por jogo.
                </p>
              </div>

     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
  <div>
    <label className="block text-sm font-semibold text-slate-600 mb-2">
      Data início
    </label>

    <input
      type="date"
      className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
  </div>

  <div>
    <label className="block text-sm font-semibold text-slate-600 mb-2">
      Data fim
    </label>

    <input
      type="date"
      className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>

  <div>
    <label className="block text-sm font-semibold text-slate-600 mb-2">
      Status da escala
    </label>

    <select
      className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
      value={scaleStatusFilter}
      onChange={(e) => setScaleStatusFilter(e.target.value)}
    >
      <option value="">Todos os status</option>
      <option value="PENDING">Pendente</option>
      <option value="CONFIRMED">Confirmado</option>
      <option value="REFUSED">Recusado</option>
    </select>
  </div>

  <div className="xl:col-span-2">
    <label className="block text-sm font-semibold text-slate-600 mb-2">
      Buscar
    </label>

    <input
      className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
      placeholder="Buscar por jogo, campeonato, estádio ou oficial..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {(startDate || endDate || search || scaleStatusFilter) && (
    <div className="xl:col-span-5">
      <button
        onClick={() => {
          setStartDate('');
          setEndDate('');
          setSearch('');
          setScaleStatusFilter('');
        }}
        className="bg-slate-100 text-slate-800 px-5 py-3 rounded-2xl font-semibold hover:bg-slate-200 transition"
      >
        Limpar filtros
      </button>
    </div>
  )}
</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-slate-200 text-sm text-slate-500">
                    <th className="py-4 pr-4">Jogo</th>
                    <th className="py-4 pr-4">Campeonato</th>
                    <th className="py-4 pr-4">Estádio</th>
                    <th className="py-4 pr-4">DCO</th>
                    <th className="py-4 pr-4">Status DCO</th>
                    <th className="py-4 pr-4">Assistente</th>
                    <th className="py-4 pr-4">Status Assistente</th>
                    <th className="py-4 pr-4">Data</th>
                    <th className="py-4 pr-4">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredGroups.map((group) => (
                    <tr
                      key={group.match.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="py-5 pr-4">
                        <div className="font-black text-slate-900">
                          {group.match.homeTeam} x {group.match.awayTeam}
                        </div>

                        <div className="text-sm text-slate-500 mt-1">
                          {group.match.stadium.city}/
                          {group.match.stadium.state}
                        </div>
                      </td>

                      <td className="py-5 pr-4 text-slate-700">
                        {group.match.championship.name}
                      </td>

                      <td className="py-5 pr-4 text-slate-700">
                        🏟️ {group.match.stadium.name}
                      </td>

                      <td className="py-5 pr-4">
                        {group.dco ? (
                          <div>
                            <div className="font-semibold">
                              {group.dco.official.user.name}
                            </div>

                            <div className="text-sm text-slate-500">
                              {group.dco.official.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">
                            Não escalado
                          </span>
                        )}
                      </td>

                      <td className="py-5 pr-4">
                        <span
                          className={`${getStatusClass(
                            group.dco,
                          )} px-3 py-1 rounded-full text-sm font-semibold`}
                        >
                          {getStatus(group.dco)}
                        </span>
                      </td>

                      <td className="py-5 pr-4">
                        {group.assistant ? (
                          <div>
                            <div className="font-semibold">
                              {group.assistant.official.user.name}
                            </div>

                            <div className="text-sm text-slate-500">
                              {group.assistant.official.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">
                            Não escalado
                          </span>
                        )}
                      </td>

                      <td className="py-5 pr-4">
                        <span
                          className={`${getStatusClass(
                            group.assistant,
                          )} px-3 py-1 rounded-full text-sm font-semibold`}
                        >
                          {getStatus(group.assistant)}
                        </span>
                      </td>

                      <td className="py-5 pr-4 text-sm text-slate-600 whitespace-nowrap">
                        {new Date(group.match.matchDate).toLocaleString('pt-BR')}
                      </td>

                      <td className="py-5 pr-4">
  <div className="flex flex-col gap-3 min-w-[220px]">
    {(canConfirmScale(group.dco) || canConfirmScale(group.assistant)) && (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
          Minha confirmação
        </p>

        <div className="flex flex-col gap-2">
          {canConfirmScale(group.dco) && (
            <div className="flex gap-2">
              <button
                onClick={() => confirmScale(group.dco!.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition"
              >
                Confirmar DCO
              </button>

              <button
                onClick={() => refuseScale(group.dco!.id)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition"
              >
                Recusar
              </button>
            </div>
          )}

          {canConfirmScale(group.assistant) && (
            <div className="flex gap-2">
              <button
                onClick={() => confirmScale(group.assistant!.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition"
              >
                Confirmar Assist.
              </button>

              <button
                onClick={() => refuseScale(group.assistant!.id)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition"
              >
                Recusar
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    {isAdmin && (
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
          Administração
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => startEdit(group)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition"
          >
            Editar
          </button>

          <button
            onClick={() => deleteFullScale(group)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition"
          >
            Excluir
          </button>
        </div>
      </div>
    )}

    {!isAdmin &&
      !canConfirmScale(group.dco) &&
      !canConfirmScale(group.assistant) && (
        <span className="bg-slate-100 text-slate-400 px-3 py-2 rounded-xl text-sm text-center">
          Sem ação disponível
        </span>
      )}
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredGroups.length === 0 && (
              <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center mt-6">
                <div className="text-6xl mb-4">📋</div>

                <h3 className="text-xl font-bold">
                  Nenhuma escala encontrada
                </h3>

                <p className="text-slate-500 mt-2">
                  Cadastre uma escala ou ajuste sua busca.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}