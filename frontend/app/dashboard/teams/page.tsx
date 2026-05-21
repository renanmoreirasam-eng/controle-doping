'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';

type Team = {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  state: string;
  category?: string;
  isActive: boolean;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);

  async function loadTeams() {
    const response = await api.get('/teams');
    setTeams(response.data);
  }

  useEffect(() => {
    loadTeams();
  }, []);

  const activeTeams = teams.filter((team) => team.isActive).length;
  const inactiveTeams = teams.filter((team) => !team.isActive).length;
  const statesCount = new Set(teams.map((team) => team.state)).size;

  const filteredTeams = teams.filter((team) => {
    const value = `${team.name} ${team.shortName || ''} ${team.city} ${team.state} ${
      team.category || ''
    }`.toLowerCase();

    return value.includes(search.toLowerCase());
  });

  function clearForm() {
    setEditingId(null);
    setName('');
    setShortName('');
    setCity('');
    setState('');
    setCategory('');
    setIsActive(true);
  }

  function startEdit(team: Team) {
    setEditingId(team.id);
    setName(team.name);
    setShortName(team.shortName || '');
    setCity(team.city);
    setState(team.state);
    setCategory(team.category || '');
    setIsActive(team.isActive);
  }

  async function createTeam() {
    try {
      await api.post('/teams', {
        name,
        shortName,
        city,
        state,
        category,
        isActive,
      });

      clearForm();
      await loadTeams();

      alert('Time cadastrado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao cadastrar time');
    }
  }

  async function updateTeam() {
    if (!editingId) return;

    try {
      await api.patch(`/teams/${editingId}`, {
        name,
        shortName,
        city,
        state,
        category,
        isActive,
      });

      clearForm();
      await loadTeams();

      alert('Time atualizado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao atualizar time');
    }
  }

  async function deleteTeam(id: string) {
    if (!confirm('Deseja realmente excluir este time?')) return;

    try {
      await api.delete(`/teams/${id}`);
      await loadTeams();

      alert('Time excluído com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao excluir time');
    }
  }

  async function handleSubmit() {
    if (!name || !city || !state) {
      alert('Preencha nome, cidade e UF');
      return;
    }

    if (editingId) {
      await updateTeam();
      return;
    }

    await createTeam();
  }

  return (
    <main className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Base esportiva
              </p>

              <h1 className="text-4xl font-black mt-1">
                Times
              </h1>
            </div>

            <div className="bg-slate-950 text-white px-5 py-3 rounded-2xl font-semibold">
              {teams.length} cadastrados
            </div>
          </div>
        </header>

        <section className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Total de times
                  </p>

                  <h2 className="text-4xl font-black mt-2">
                    {teams.length}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                  ⚽
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Ativos
                  </p>

                  <h2 className="text-4xl font-black mt-2 text-green-600">
                    {activeTeams}
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
                    Inativos
                  </p>

                  <h2 className="text-4xl font-black mt-2 text-red-600">
                    {inactiveTeams}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-3xl">
                  ⛔
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Estados
                  </p>

                  <h2 className="text-4xl font-black mt-2 text-blue-600">
                    {statesCount}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl">
                  📍
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black">
                  {editingId ? 'Editar time' : 'Cadastrar time'}
                </h2>

                <p className="text-slate-500 mt-1">
                  Mantenha a base de equipes padronizada para os jogos.
                </p>
              </div>

              {editingId && (
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-2xl text-sm font-semibold">
                  Modo edição
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Nome do time"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Nome curto"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
              />

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="UF"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
              />

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Categoria"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

              <select
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSubmit}
                className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition"
              >
                {editingId ? 'Salvar edição' : 'Cadastrar time'}
              </button>

              {editingId && (
                <button
                  onClick={clearForm}
                  className="bg-slate-100 text-slate-800 px-6 py-3 rounded-2xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black">
                  Lista de times
                </h2>

                <p className="text-slate-500 mt-1">
                  Consulte, filtre e edite a base de equipes.
                </p>
              </div>

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 min-w-[320px] focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Buscar por time, cidade, UF ou categoria..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="border border-slate-200 rounded-3xl p-5 hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                        ⚽
                      </div>

                      <div>
                        <h3 className="text-2xl font-black">
                          {team.name}
                        </h3>

                        <p className="text-slate-500">
                          {team.city}/{team.state}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            Nome curto: {team.shortName || 'Não informado'}
                          </span>

                          <span className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            Categoria: {team.category || 'Não informado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-2xl text-sm font-semibold h-fit ${
                        team.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {team.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => startEdit(team)}
                      className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-red-700 transition"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}

              {filteredTeams.length === 0 && (
                <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center xl:col-span-2">
                  <div className="text-6xl mb-4">⚽</div>

                  <h3 className="text-xl font-bold">
                    Nenhum time encontrado
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Ajuste sua busca ou cadastre um novo time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}