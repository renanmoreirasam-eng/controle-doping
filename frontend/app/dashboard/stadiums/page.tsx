"use client";

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../../components/Sidebar";
import { api } from "../../../services/api";

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
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const isAdmin = currentUser?.role === "ADMIN";

  async function loadCurrentUser() {
    try {
      const response = await api.get("/auth/me");
      setCurrentUser(response.data);
    } catch {
      setCurrentUser(null);
    }
  }

  async function loadStadiums() {
    const response = await api.get("/stadiums");
    setStadiums(response.data);
  }

  useEffect(() => {
    loadCurrentUser();
    loadStadiums();
  }, []);

  const filteredStadiums = stadiums.filter((stadium) => {
    const value = `${stadium.name} ${stadium.city} ${stadium.state} ${
      stadium.address || ""
    } ${stadium.cep || ""}`.toLowerCase();

    return value.includes(search.toLowerCase());
  });

  const statesCount = new Set(
    stadiums.map((stadium) => stadium.state),
  ).size;

  function clearForm() {
    setEditingId(null);
    setName("");
    setCep("");
    setAddress("");
    setCity("");
    setState("");
  }

  function scrollToForm() {
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function startEdit(stadium: Stadium) {
    if (!isAdmin) return;

    setEditingId(stadium.id);
    setName(stadium.name);
    setCep(stadium.cep || "");
    setAddress(stadium.address || "");
    setCity(stadium.city);
    setState(stadium.state);
    scrollToForm();
  }

  async function createStadium() {
    try {
      await api.post("/stadiums", {
        name,
        cep,
        address,
        city,
        state,
      });

      clearForm();
      await loadStadiums();

      alert("Estádio cadastrado com sucesso!");
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Erro ao cadastrar estádio",
      );
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

      alert("Estádio atualizado com sucesso!");
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Erro ao atualizar estádio",
      );
    }
  }

  async function deleteStadium(id: string) {
    if (!isAdmin) return;
    if (!confirm("Deseja realmente excluir este estádio?")) return;

    try {
      await api.delete(`/stadiums/${id}`);
      await loadStadiums();

      alert("Estádio excluído com sucesso!");
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Erro ao excluir estádio",
      );
    }
  }

  async function handleSubmit() {
    if (!isAdmin) return;

    if (!name || !city || !state) {
      alert("Preencha nome, cidade e UF");
      return;
    }

    if (editingId) {
      await updateStadium();
      return;
    }

    await createStadium();
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] inline-flex items-center gap-2">
                🏟️ Base operacional
              </p>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Estádios
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Gerencie os locais de partida, cidade, UF, endereço e CEP.
              </p>
            </div>

            <div className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold shadow-lg w-fit">
              {stadiums.length} cadastrados
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 mb-8">
            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Total de estádios
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-dark)]">
                    {stadiums.length}
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
                  <p className="text-slate-500 text-sm font-bold">
                    Estados atendidos
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-green)]">
                    {statesCount}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-green-soft)] text-[var(--cdb-green)] flex items-center justify-center text-3xl">
                  📍
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Logística
                  </p>

                  <h2 className="text-xl lg:text-2xl font-black mt-2 text-[var(--cdb-dark)]">
                    Pronta para operação
                  </h2>

                  <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                    Base preparada para inspeção, deslocamento e controle operacional.
                  </p>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-yellow-soft)] text-[var(--cdb-yellow)] flex items-center justify-center text-3xl">
                  🧭
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div
              ref={formRef}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-6 mb-8 scroll-mt-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[var(--cdb-blue)]">
                    {editingId
                      ? "Editar estádio"
                      : "Cadastrar estádio"}
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Mantenha a base de estádios padronizada para os jogos.
                  </p>
                </div>

                {editingId && (
                  <span className="bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-2xl text-sm font-bold border border-slate-200">
                    Modo edição
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <div>
                  <input
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    placeholder="Nome do estádio"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                    Nome do estádio <span className="text-red-600">*</span>
                  </label>
                </div>

                <div>
                  <input
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    placeholder="CEP"
                    value={cep}
                    onChange={(event) => setCep(event.target.value)}
                  />
                  <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                    CEP
                  </label>
                </div>

                <div>
                  <input
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    placeholder="Endereço"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                  <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                    Endereço
                  </label>
                </div>

                <div>
                  <input
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    placeholder="Cidade"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  />
                  <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                    Cidade <span className="text-red-600">*</span>
                  </label>
                </div>

                <div>
                  <input
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    placeholder="UF"
                    maxLength={2}
                    value={state}
                    onChange={(event) => setState(event.target.value.toUpperCase())}
                  />
                  <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                    UF <span className="text-red-600">*</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleSubmit}
                  className="bg-[var(--cdb-blue)] text-white px-6 py-3 rounded-2xl font-bold hover:brightness-90 transition shadow-sm"
                >
                  {editingId
                    ? "Salvar edição"
                    : "Cadastrar estádio"}
                </button>

                {editingId && (
                  <button
                    onClick={clearForm}
                    className="bg-slate-100 text-slate-800 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-[var(--cdb-blue)]">
                  Lista de estádios
                </h2>

                <p className="text-slate-500 mt-1">
                  {isAdmin
                    ? "Consulte, filtre e edite a base de locais."
                    : "Consulte e filtre a base de locais."}
                </p>
              </div>

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 w-full xl:w-[420px] focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                placeholder="Buscar por estádio, cidade, UF, endereço ou CEP..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredStadiums.map((stadium) => (
                <div
                  key={stadium.id}
                  className="border border-slate-200 rounded-3xl p-5 hover:border-[var(--cdb-blue)] transition bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] flex items-center justify-center text-2xl font-black">
                        🏟️
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-[var(--cdb-dark)]">
                          {stadium.name}
                        </h3>

                        <p className="text-slate-500">
                          {stadium.city}/{stadium.state}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                            📍 {stadium.address || "Endereço não informado"}
                          </span>

                          <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                            CEP: {stadium.cep || "Não informado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-2xl text-sm font-bold border border-slate-200">
                      {stadium.state}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => startEdit(stadium)}
                        className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold hover:brightness-90 transition shadow-sm"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => deleteStadium(stadium.id)}
                        className="bg-red-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-red-700 transition shadow-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {filteredStadiums.length === 0 && (
                <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center xl:col-span-2 bg-slate-50">
                  <div className="text-6xl mb-4">
                    🏟️
                  </div>

                  <h3 className="text-xl font-bold text-[var(--cdb-dark)]">
                    Nenhum estádio encontrado
                  </h3>

                  <p className="text-slate-500 mt-2">
                    {isAdmin
                      ? "Ajuste sua busca ou cadastre um novo estádio."
                      : "Ajuste sua busca para encontrar um estádio cadastrado."}
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
