"use client";

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../../components/Sidebar";
import { api } from "../../../services/api";

type Official = {
  id: string;
  phone: string;
  pixKey: string;
  active: boolean;
  user: {
    name: string;
    email: string;
    role: string;
  };
};

function getStoredUserRole() {
  if (typeof window === "undefined") return null;

  const possibleKeys = ["user", "authUser", "currentUser"];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (!value) continue;

    try {
      const parsed = JSON.parse(value);

      if (parsed?.role) return parsed.role;
      if (parsed?.user?.role) return parsed.user.role;
    } catch {
      // Ignora valores que não estão em JSON.
    }
  }

  return null;
}

export default function OfficialsPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [role, setRole] = useState("OFFICIAL");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [active, setActive] = useState(true);

  const isAdmin = currentUserRole === "ADMIN";

  async function loadCurrentUserRole() {
    const storedRole = getStoredUserRole();

    if (storedRole) {
      setCurrentUserRole(storedRole);
    }

    try {
      const response = await api.get("/auth/me");
      const apiRole = response.data?.role || response.data?.user?.role;

      if (apiRole) {
        setCurrentUserRole(apiRole);
      }
    } catch {
      // Se não conseguir buscar /auth/me, mantém o perfil encontrado no localStorage.
    }
  }

  async function loadOfficials() {
    const response = await api.get("/officials");
    setOfficials(response.data);
  }

  useEffect(() => {
    loadCurrentUserRole();
    loadOfficials();
  }, []);

  const activeOfficials = officials.filter(
    (official) => official.active,
  ).length;

  const inactiveOfficials = officials.filter(
    (official) => !official.active,
  ).length;

  const filteredOfficials = officials.filter((official) => {
    const value = `
      ${official.user.name}
      ${official.user.email}
      ${official.phone}
      ${official.pixKey}
    `.toLowerCase();

    return value.includes(search.toLowerCase());
  });

  function clearForm() {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setPixKey("");
    setActive(true);
    setRole("OFFICIAL");
  }

  function startEdit(official: Official) {
    if (!isAdmin) return;

    setEditingId(official.id);
    setName(official.user.name);
    setEmail(official.user.email);
    setPassword("");
    setPhone(official.phone || "");
    setPixKey(official.pixKey || "");
    setActive(official.active);
    setRole(official.user.role || "OFFICIAL");

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  async function createOfficial() {
    try {
      await api.post("/officials/full", {
        name,
        email,
        password,
        phone,
        pixKey,
        role,
      });

      clearForm();
      await loadOfficials();

      alert("Oficial cadastrado com sucesso!");
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Erro ao cadastrar oficial",
      );
    }
  }

  async function updateOfficial() {
    if (!editingId) return;

    try {
      await api.patch(`/officials/${editingId}`, {
        name,
        email,
        phone,
        pixKey,
        active,
        role,
      });

      clearForm();
      await loadOfficials();

      alert("Oficial atualizado com sucesso!");
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Erro ao atualizar oficial",
      );
    }
  }

  async function handleSubmit() {
    if (!isAdmin) {
      alert("Apenas administradores podem cadastrar ou editar oficiais.");
      return;
    }

    if (!name || !email || !phone) {
      alert("Preencha nome, e-mail e telefone");
      return;
    }

    if (!editingId && !password) {
      alert("Informe a senha do oficial");
      return;
    }

    if (editingId) {
      await updateOfficial();
      return;
    }

    await createOfficial();
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] inline-flex items-center gap-2">
                👥 Gestão operacional
              </p>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Oficiais
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Gerencie os oficiais, perfis de acesso e dados de contato.
              </p>
            </div>

            <div className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold shadow-lg w-fit">
              {officials.length} cadastrados
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 mb-8">
            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Total de oficiais
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-dark)]">
                    {officials.length}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] flex items-center justify-center text-3xl">
                  👥
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-bold">
                    Ativos
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-green)]">
                    {activeOfficials}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-green-soft)] text-[var(--cdb-green)] flex items-center justify-center text-3xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Inativos
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-red-600">
                    {inactiveOfficials}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-3xl">
                  ⛔
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div
              ref={formRef}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-5 lg:p-6 mb-8 scroll-mt-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[var(--cdb-blue)]">
                    {editingId
                      ? "Editar oficial"
                      : "Cadastrar oficial"}
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Mantenha os dados operacionais e financeiros atualizados.
                  </p>
                </div>

                {editingId && (
                  <span className="bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-2xl text-sm font-bold border border-slate-200">
                    Modo edição
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                <div>
                  <input
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                    Nome completo <span className="text-red-600">*</span>
                  </label>
                </div>

                <div>
                  <input
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                    E-mail <span className="text-red-600">*</span>
                  </label>
                </div>

                {!editingId && (
                  <div>
                    <input
                      type="password"
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                      Senha <span className="text-red-600">*</span>
                    </label>
                  </div>
                )}

                <div>
                  <select
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="COORDINATOR">Coordenador</option>
                    <option value="OFFICIAL">Oficial</option>
                  </select>
                  <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                    Perfil <span className="text-red-600">*</span>
                  </label>
                </div>

                <div>
                  <input
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    placeholder="Telefone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                    Telefone <span className="text-red-600">*</span>
                  </label>
                </div>

                <div>
                  <input
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    placeholder="Chave PIX"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                  />
                  <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                    Chave PIX
                  </label>
                </div>

                {editingId && (
                  <div>
                    <select
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                      value={active ? "true" : "false"}
                      onChange={(e) =>
                        setActive(e.target.value === "true")
                      }
                    >
                      <option value="true">
                        Ativo
                      </option>

                      <option value="false">
                        Inativo
                      </option>
                    </select>
                    <label className="mt-2 block text-xs font-bold text-[var(--cdb-dark)]">
                      Situação <span className="text-red-600">*</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleSubmit}
                  className="bg-[var(--cdb-blue)] text-white px-6 py-3 rounded-2xl font-bold hover:brightness-90 transition shadow-sm"
                >
                  {editingId
                    ? "Salvar edição"
                    : "Cadastrar oficial"}
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
                  Lista de oficiais
                </h2>

                <p className="text-slate-500 mt-1">
                  Consulte, filtre e edite a base de oficiais.
                </p>
              </div>

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 w-full xl:w-[380px] focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                placeholder="Buscar por nome, e-mail, telefone ou PIX..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredOfficials.map((official) => (
                <div
                  key={official.id}
                  className="border border-slate-200 rounded-3xl p-5 hover:border-[var(--cdb-blue)] transition bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-dark)] flex items-center justify-center text-2xl font-black text-[var(--cdb-blue)]">
                        {official.user.name
                          ?.slice(0, 1)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-[var(--cdb-dark)]">
                          {official.user.name}
                        </h3>

                        <p className="text-slate-500">
                          {official.user.email}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                            📱 {official.phone || "Sem telefone"}
                          </span>

                          <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                            🔑 PIX: {official.pixKey || "Não informado"}
                          </span>

                          <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm border border-slate-200">
                            Perfil:{" "}
                            {official.user.role === "ADMIN"
                              ? "Administrador"
                              : official.user.role === "COORDINATOR"
                                ? "Coordenador"
                                : official.user.role === "OFFICIAL"
                                  ? "Oficial"
                                  : official.user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-2xl text-sm font-bold ${
                        official.active
                          ? "bg-[var(--cdb-green-soft)] text-[var(--cdb-green)]"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {official.active
                        ? "Ativo"
                        : "Inativo"}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => startEdit(official)}
                        className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold hover:brightness-90 transition shadow-sm"
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {filteredOfficials.length === 0 && (
                <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center xl:col-span-2 bg-slate-50">
                  <div className="text-6xl mb-4">
                    👥
                  </div>

                  <h3 className="text-xl font-bold text-[var(--cdb-dark)]">
                    Nenhum oficial encontrado
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Ajuste sua busca ou cadastre um novo oficial.
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
