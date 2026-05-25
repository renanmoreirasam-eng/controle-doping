"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../../components/Sidebar";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { api } from "../../../services/api";

type Team = {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  state: string;
  isActive: boolean;
};

type CurrentUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: "danger" | "success" | "warning" | "default";
  confirmText: string;
  cancelText: string;
  onConfirm?: () => void | Promise<void>;
};

const emptyModal: ModalState = {
  open: false,
  title: "",
  message: "",
  variant: "default",
  confirmText: "Entendi",
  cancelText: "Fechar",
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [modal, setModal] = useState<ModalState>(emptyModal);

  async function loadTeams() {
    const response = await api.get("/teams");
    setTeams(response.data);
  }

  async function loadCurrentUser() {
    try {
      const response = await api.get("/auth/me");
      setCurrentUserRole(response.data?.role || null);
    } catch {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setCurrentUserRole(null);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser) as CurrentUser;
        setCurrentUserRole(parsedUser.role || null);
      } catch {
        setCurrentUserRole(null);
      }
    }
  }

  useEffect(() => {
    loadTeams();
    loadCurrentUser();
  }, []);

  const activeTeams = teams.filter((team) => team.isActive).length;
  const inactiveTeams = teams.filter((team) => !team.isActive).length;
  const statesCount = new Set(teams.map((team) => team.state)).size;

  const filteredTeams = teams.filter((team) => {
    const value =
      `${team.name} ${team.shortName || ""} ${team.city} ${team.state}`.toLowerCase();

    return value.includes(search.toLowerCase());
  });

  const isAdmin = currentUserRole === "ADMIN";

  function closeModal() {
    setModal(emptyModal);
  }

  function showModal({
    title,
    message,
    variant = "default",
    confirmText = "Entendi",
    cancelText = "Fechar",
    onConfirm,
  }: Partial<ModalState> & {
    title: string;
    message: string;
  }) {
    setModal({
      open: true,
      title,
      message,
      variant,
      confirmText,
      cancelText,
      onConfirm,
    });
  }

  function clearForm() {
    setEditingId(null);
    setName("");
    setShortName("");
    setCity("");
    setState("");
    setIsActive(true);
  }

  function startEdit(team: Team) {
    setEditingId(team.id);
    setName(team.name);
    setShortName(team.shortName || "");
    setCity(team.city);
    setState(team.state);
    setIsActive(team.isActive);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function createTeam() {
    try {
      await api.post("/teams", {
        name,
        shortName,
        city,
        state,
        isActive,
      });

      clearForm();
      await loadTeams();

      showModal({
        title: "Time cadastrado",
        message: "O time foi cadastrado com sucesso.",
        variant: "success",
      });
    } catch (error: any) {
      showModal({
        title: "Erro ao cadastrar",
        message: error.response?.data?.message || "Erro ao cadastrar time.",
        variant: "danger",
      });
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
        isActive,
      });

      clearForm();
      await loadTeams();

      showModal({
        title: "Time atualizado",
        message: "As informações do time foram atualizadas com sucesso.",
        variant: "success",
      });
    } catch (error: any) {
      showModal({
        title: "Erro ao atualizar",
        message: error.response?.data?.message || "Erro ao atualizar time.",
        variant: "danger",
      });
    }
  }

  function requestDeleteTeam(team: Team) {
    showModal({
      title: "Excluir time?",
      message: `Deseja realmente excluir o time ${team.name}? Essa ação não poderá ser desfeita.`,
      variant: "danger",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await api.delete(`/teams/${team.id}`);
          await loadTeams();
          closeModal();

          showModal({
            title: "Time excluído",
            message: "O time foi excluído com sucesso.",
            variant: "success",
          });
        } catch (error: any) {
          closeModal();

          showModal({
            title: "Erro ao excluir",
            message: error.response?.data?.message || "Erro ao excluir time.",
            variant: "danger",
          });
        }
      },
    });
  }

  async function handleSubmit() {
    if (!name.trim() || !city.trim() || !state.trim()) {
      showModal({
        title: "Campos obrigatórios",
        message: "Preencha nome, cidade e UF para salvar o time.",
        variant: "warning",
      });
      return;
    }

    if (state.trim().length !== 2) {
      showModal({
        title: "UF inválida",
        message: "Informe a UF com duas letras. Exemplo: SP, RJ, MG.",
        variant: "warning",
      });
      return;
    }

    if (editingId) {
      await updateTeam();
      return;
    }

    await createTeam();
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                ⚽ Base esportiva
              </div>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Times
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Gerencie os times cadastrados para utilização nos jogos e
                operações de controle.
              </p>
            </div>

            <div className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold shadow-lg w-fit">
              {teams.length} cadastrados
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-8">
            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Total de times
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-dark)]">
                    {teams.length}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] flex items-center justify-center text-3xl">
                  ⚽
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">Ativos</p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-green)]">
                    {activeTeams}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-green-soft)] text-[var(--cdb-green)] flex items-center justify-center text-3xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Inativos
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-red-600">
                    {inactiveTeams}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-3xl">
                  ⛔
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Estados
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-blue)]">
                    {statesCount}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-yellow-soft)] text-[#9A7600] flex items-center justify-center text-3xl">
                  📍
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-6 mb-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                    {editingId ? "Editar time" : "Cadastrar time"}
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Mantenha a base de equipes padronizada para os jogos.
                  </p>
                </div>

                {editingId && (
                  <span className="bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-2xl text-sm font-bold w-fit">
                    Modo edição
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <label className="flex flex-col gap-2">
                  <input
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]"
                    placeholder="Ex.: Flamengo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Nome do time <span className="text-red-600">*</span>
                  </span>
                </label>

                <label className="flex flex-col gap-2">
                  <input
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]"
                    placeholder="Ex.: FLA"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Nome curto
                  </span>
                </label>

                <label className="flex flex-col gap-2">
                  <input
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]"
                    placeholder="Ex.: Rio de Janeiro"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Cidade <span className="text-red-600">*</span>
                  </span>
                </label>

                <label className="flex flex-col gap-2">
                  <input
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 uppercase focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]"
                    placeholder="Ex.: RJ"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                  />
                  <span className="text-sm font-bold text-slate-700">
                    UF <span className="text-red-600">*</span>
                  </span>
                </label>

                <label className="flex flex-col gap-2">
                  <select
                    className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]"
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                  <span className="text-sm font-bold text-slate-700">
                    Situação
                  </span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  onClick={handleSubmit}
                  className="bg-[var(--cdb-blue)] text-white px-6 py-3 rounded-2xl font-bold hover:brightness-90 transition shadow-md"
                >
                  {editingId ? "Salvar edição" : "Cadastrar time"}
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
                <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                  Lista de times
                </h2>

                <p className="text-slate-500 mt-1">
                  Consulte, filtre e edite a base de equipes.
                </p>
              </div>

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 w-full xl:w-[380px] focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)]"
                placeholder="Buscar por time, cidade ou UF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="border border-slate-200 rounded-3xl p-5 hover:border-[var(--cdb-blue)] transition bg-white"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] flex items-center justify-center text-2xl shrink-0">
                        ⚽
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xl lg:text-2xl font-black text-[var(--cdb-dark)] break-words">
                          {team.name}
                        </h3>

                        <p className="text-slate-500">
                          {team.city}/{team.state}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="bg-slate-100 px-3 py-2 rounded-xl text-sm text-slate-700">
                            Nome curto: {team.shortName || "Não informado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-2xl text-sm font-bold h-fit w-fit ${
                        team.isActive
                          ? "bg-[var(--cdb-green-soft)] text-[var(--cdb-green)]"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {team.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <button
                        onClick={() => startEdit(team)}
                        className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold hover:brightness-90 transition"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => requestDeleteTeam(team)}
                        className="bg-red-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-red-700 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {filteredTeams.length === 0 && (
                <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center xl:col-span-2">
                  <div className="text-6xl mb-4">⚽</div>

                  <h3 className="text-xl font-bold text-[var(--cdb-dark)]">
                    Nenhum time encontrado
                  </h3>

                  <p className="text-slate-500 mt-2">
                    {isAdmin
                      ? "Ajuste sua busca ou cadastre um novo time."
                      : "Ajuste sua busca para localizar outro time."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        variant={modal.variant}
        onCancel={closeModal}
        onConfirm={async () => {
          if (modal.onConfirm) {
            await modal.onConfirm();
            return;
          }

          closeModal();
        }}
      />
    </main>
  );
}
