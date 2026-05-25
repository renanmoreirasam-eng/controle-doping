'use client';

import { useEffect, useRef, useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';

type Stadium = {
  id: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  cep?: string;
};

type CurrentUser = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN';

  async function loadCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      setCurrentUser(response.data);
    } catch {
      setCurrentUser(null);
    }
  }

  async function loadStadiums() {
    const response = await api.get('/stadiums');
    setStadiums(response.data);
  }

  useEffect(() => {
    loadCurrentUser();
    loadStadiums();
  }, []);

  const filteredStadiums = stadiums.filter((stadium) => {
    const value = `${stadium.name} ${stadium.city} ${stadium.state} ${stadium.address || ''} ${stadium.cep || ''}`.toLowerCase();
    return value.includes(search.toLowerCase());
  });

  const statesCount = new Set(stadiums.map((stadium) => stadium.state)).size;

  function clearForm() {
    setEditingId(null);
    setName('');
    setCep('');
    setAddress('');
    setCity('');
    setState('');
  }

  function scrollToForm() {
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  function startEdit(stadium: Stadium) {
    if (!isAdmin) return;

    setEditingId(stadium.id);
    setName(stadium.name);
    setCep(stadium.cep || '');
    setAddress(stadium.address || '');
    setCity(stadium.city);
    setState(stadium.state);
    scrollToForm();
  }

  async function createStadium() {
    try {
      await api.post('/stadiums', {
        name,
        cep,
        address,
        city,
        state,
      });

      clearForm();
      await loadStadiums();

      alert('Estádio cadastrado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao cadastrar estádio');
    }
  }

  async function updateStadium() {
    if (!editingId) return;

    try {
      await api.patch(`/stadiums/${editingId}`, {
        name,
        cep,
        address,
        city,
        state,
      });

      clearForm();
      await loadStadiums();

      alert('Estádio atualizado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao atualizar estádio');
    }
  }

  async function deleteStadium(id: string) {
    if (!isAdmin) return;
    if (!confirm('Deseja realmente excluir este estádio?')) return;

    try {
      await api.delete(`/stadiums/${id}`);
      await loadStadiums();

      alert('Estádio excluído com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao excluir estádio');
    }
  }

  async function handleSubmit() {
    if (!isAdmin) return;

    if (!name || !city || !state) {
      alert('Preencha nome, cidade e UF');
      return;
    }

    if (editingId) {
      await updateStadium();
      return;
    }

    await createStadium();
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Base operacional
              </p>

              <h1 className="text-4xl font-black mt-1">
                Estádios
              </h1>
            </div>

            <div className="bg-slate-950 text-white px-5 py-3 rounded-2xl font-semibold">
              {stadiums.length} cadastrados
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    Total de estádios
                  </p>

                  <h2 className="text-4xl font-black mt-2">
                    {stadiums.length}
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
                    Estados atendidos
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

            <div className="bg-gradient-to-br from-slate-950 to-slate-800 text-white rounded-3xl p-6">
              <div className="text-4xl mb-4">
                🧭
              </div>

              <h2 className="text-xl font-black">
                Pronto para logística
              </h2>

              <p className="text-slate-300 mt-2 text-sm leading-relaxed">
                Base preparada para histórico, inspeção,
                deslocamento e cálculo operacional.
              </p>
            </div>
          </div>

          {isAdmin && (
            <div
              ref={formRef}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8 scroll-mt-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black">
                    {editingId ? 'Editar estádio' : 'Cadastrar estádio'}
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Mantenha a base de estádios padronizada para os jogos.
                  </p>
                </div>

                {editingId && (
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-2xl text-sm font-semibold">
                    Modo edição
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                <div>
                  <input
                    id="stadium-name"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="Nome do estádio"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <label htmlFor="stadium-name" className="mt-2 block text-xs font-bold text-slate-700">
                    Nome do estádio <span className="text-red-600">*</span>
                  </label>
                </div>

                <div>
                  <input
                    id="stadium-cep"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="CEP"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                  />
                  <label htmlFor="stadium-cep" className="mt-2 block text-xs font-bold text-slate-700">
                    CEP
                  </label>
                </div>

                <div>
                  <input
                    id="stadium-address"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="Endereço"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <label htmlFor="stadium-address" className="mt-2 block text-xs font-bold text-slate-700">
                    Endereço
                  </label>
                </div>

                <div>
                  <input
                    id="stadium-city"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="Cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <label htmlFor="stadium-city" className="mt-2 block text-xs font-bold text-slate-700">
                    Cidade <span className="text-red-600">*</span>
                  </label>
                </div>

                <div>
                  <input
                    id="stadium-state"
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder="UF"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                  />
                  <label htmlFor="stadium-state" className="mt-2 block text-xs font-bold text-slate-700">
                    UF <span className="text-red-600">*</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleSubmit}
                  className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition"
                >
                  {editingId ? 'Salvar edição' : 'Cadastrar estádio'}
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
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black">
                  Lista de estádios
                </h2>

                <p className="text-slate-500 mt-1">
                  {isAdmin
                    ? 'Consulte, filtre e edite a base de locais.'
                    : 'Consulte e filtre a base de locais.'}
                </p>
              </div>

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 min-w-[320px] focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Buscar por estádio, cidade, UF, endereço ou CEP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredStadiums.map((stadium) => (
                <div
                  key={stadium.id}
                  className="border border-slate-200 rounded-3xl p-5 hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                        🏟️
                      </div>

                      <div>
                        <h3 className="text-2xl font-black">
                          {stadium.name}
                        </h3>

                        <p className="text-slate-500">
                          {stadium.city}/{stadium.state}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            📍 {stadium.address || 'Endereço não informado'}
                          </span>

                          <span className="bg-slate-100 px-3 py-2 rounded-xl text-sm">
                            CEP: {stadium.cep || 'Não informado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-2xl text-sm font-semibold">
                      {stadium.state}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => startEdit(stadium)}
                        className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => deleteStadium(stadium.id)}
                        className="bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-red-700 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {filteredStadiums.length === 0 && (
                <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center xl:col-span-2">
                  <div className="text-6xl mb-4">
                    🏟️
                  </div>

                  <h3 className="text-xl font-bold">
                    Nenhum estádio encontrado
                  </h3>

                  <p className="text-slate-500 mt-2">
                    {isAdmin
                      ? 'Ajuste sua busca ou cadastre um novo estádio.'
                      : 'Ajuste sua busca para encontrar um estádio cadastrado.'}
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
