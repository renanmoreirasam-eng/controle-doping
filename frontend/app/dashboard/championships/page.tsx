'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';

type Championship = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export default function ChampionshipsPage() {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [search, setSearch] = useState('');

  async function loadChampionships() {
    const response = await api.get('/championships');
    setChampionships(response.data);
  }

  useEffect(() => {
    loadChampionships();
  }, []);

  const filteredChampionships = championships.filter(
    (championship) =>
      championship.name
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  function clearForm() {
    setEditingId(null);
    setName('');
  }

  function startEdit(championship: Championship) {
    setEditingId(championship.id);
    setName(championship.name);
  }

  async function createChampionship() {
    try {
      await api.post('/championships', {
        name,
      });

      clearForm();

      await loadChampionships();

      alert('Campeonato cadastrado com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao cadastrar campeonato',
      );
    }
  }

  async function updateChampionship() {
    if (!editingId) return;

    try {
      await api.patch(
        `/championships/${editingId}`,
        {
          name,
        },
      );

      clearForm();

      await loadChampionships();

      alert('Campeonato atualizado com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao atualizar campeonato',
      );
    }
  }

  async function deleteChampionship(id: string) {
    const confirmDelete = confirm(
      'Deseja realmente excluir este campeonato?',
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/championships/${id}`);

      await loadChampionships();

      alert('Campeonato excluído com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao excluir campeonato',
      );
    }
  }

  async function handleSubmit() {
    if (!name.trim()) {
      alert('Informe o nome do campeonato');
      return;
    }

    if (editingId) {
      await updateChampionship();
      return;
    }

    await createChampionship();
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Gestão esportiva
              </p>

              <h1 className="text-4xl font-black mt-1">
                Campeonatos
              </h1>
            </div>

            <div className="bg-slate-950 text-white px-5 py-3 rounded-2xl font-semibold">
              {championships.length} campeonatos
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Total cadastrados
                  </p>

                  <h2 className="text-4xl font-black mt-2">
                    {championships.length}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                  🏆
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Última atualização
                  </p>

                  <h2 className="text-lg font-black mt-2">
                    {championships.length > 0
                      ? new Date(
                          championships[0].updatedAt,
                        ).toLocaleDateString(
                          'pt-BR',
                        )
                      : '--'}
                  </h2>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl">
                  📅
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-950 to-slate-800 text-white rounded-3xl p-6">
              <div className="text-4xl mb-4">
                ⚽
              </div>

              <h2 className="text-xl font-black">
                Gestão centralizada
              </h2>

              <p className="text-slate-300 mt-2 text-sm leading-relaxed">
                Controle os campeonatos utilizados
                nas operações antidoping.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black">
                  {editingId
                    ? 'Editar campeonato'
                    : 'Cadastrar campeonato'}
                </h2>

                <p className="text-slate-500 mt-1">
                  Cadastre e organize os campeonatos operacionais.
                </p>
              </div>

              {editingId && (
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-2xl text-sm font-semibold">
                  Modo edição
                </span>
              )}
            </div>

            <div className="flex flex-col xl:flex-row gap-3">
              <input
                className="flex-1 border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Nome do campeonato"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

              <button
                onClick={handleSubmit}
                className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition"
              >
                {editingId
                  ? 'Salvar edição'
                  : 'Cadastrar'}
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
                  Lista de campeonatos
                </h2>

                <p className="text-slate-500 mt-1">
                  Consulte e gerencie os campeonatos cadastrados.
                </p>
              </div>

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 min-w-[320px] focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Buscar campeonato..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredChampionships.map(
                (championship) => (
                  <div
                    key={championship.id}
                    className="border border-slate-200 rounded-3xl p-5 hover:border-slate-300 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                          🏆
                        </div>

                        <div>
                          <h3 className="text-2xl font-black">
                            {championship.name}
                          </h3>

                          <div className="flex flex-wrap gap-2 mt-4">
                            <span className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                              Criado em:{' '}
                              {new Date(
                                championship.createdAt,
                              ).toLocaleDateString(
                                'pt-BR',
                              )}
                            </span>

                            <span className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                              Atualizado:{' '}
                              {new Date(
                                championship.updatedAt,
                              ).toLocaleDateString(
                                'pt-BR',
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() =>
                          startEdit(championship)
                        }
                        className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() =>
                          deleteChampionship(
                            championship.id,
                          )
                        }
                        className="bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-red-700 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ),
              )}

              {filteredChampionships.length ===
                0 && (
                <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center xl:col-span-2">
                  <div className="text-6xl mb-4">
                    🏆
                  </div>

                  <h3 className="text-xl font-bold">
                    Nenhum campeonato encontrado
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Cadastre um campeonato para iniciar.
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