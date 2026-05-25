"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../../components/Sidebar";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { api } from "../../../services/api";

type Championship = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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

export default function ChampionshipsPage() {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(emptyModal);

  async function loadChampionships() {
    const response = await api.get("/championships");
    setChampionships(response.data);
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
    loadChampionships();
    loadCurrentUser();
  }, []);

  const isAdmin = currentUserRole === "ADMIN";

  const filteredChampionships = championships.filter((championship) =>
    championship.name.toLowerCase().includes(search.toLowerCase()),
  );

  const latestUpdate =
    championships.length > 0
      ? championships
          .map((championship) => new Date(championship.updatedAt))
          .sort((a, b) => b.getTime() - a.getTime())[0]
      : null;

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
  }

  function startEdit(championship: Championship) {
    setEditingId(championship.id);
    setName(championship.name);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function createChampionship() {
    try {
      await api.post("/championships", {
        name,
      });

      clearForm();
      await loadChampionships();

      showModal({
        title: "Campeonato cadastrado",
        message: "O campeonato foi cadastrado com sucesso.",
        variant: "success",
      });
    } catch (error: any) {
      showModal({
        title: "Erro ao cadastrar",
        message:
          error.response?.data?.message || "Erro ao cadastrar campeonato.",
        variant: "danger",
      });
    }
  }

  async function updateChampionship() {
    if (!editingId) return;

    try {
      await api.patch(`/championships/${editingId}`, {
        name,
      });

      clearForm();
      await loadChampionships();

      showModal({
        title: "Campeonato atualizado",
        message: "As informações do campeonato foram atualizadas com sucesso.",
        variant: "success",
      });
    } catch (error: any) {
      showModal({
        title: "Erro ao atualizar",
        message:
          error.response?.data?.message || "Erro ao atualizar campeonato.",
        variant: "danger",
      });
    }
  }

  function requestDeleteChampionship(championship: Championship) {
    showModal({
      title: "Excluir campeonato?",
      message: `Deseja realmente excluir o campeonato ${championship.name}? Essa ação não poderá ser desfeita.`,
      variant: "danger",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await api.delete(`/championships/${championship.id}`);
          await loadChampionships();
          closeModal();

          showModal({
            title: "Campeonato excluído",
            message: "O campeonato foi excluído com sucesso.",
            variant: "success",
          });
        } catch (error: any) {
          closeModal();

          showModal({
            title: "Erro ao excluir",
            message:
              error.response?.data?.message || "Erro ao excluir campeonato.",
            variant: "danger",
          });
        }
      },
    });
  }

  async function handleSubmit() {
    if (!name.trim()) {
      showModal({
        title: "Campo obrigatório",
        message: "Informe o nome do campeonato para salvar.",
        variant: "warning",
      });
      return;
    }

    if (editingId) {
      await updateChampionship();
      return;
    }

    await createChampionship();
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                🏆 Gestão esportiva
              </div>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Campeonatos
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Cadastre e consulte os campeonatos utilizados nas operações de
                controle de doping.
              </p>
            </div>

            <div className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold shadow-lg w-fit">
              {championships.length} cadastrados
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 mb-8">
            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Total de campeonatos
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-dark)]">
                    {championships.length}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] flex items-center justify-center text-3xl">
                  🏆
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Última atualização
                  </p>

                  <h2 className="text-lg lg:text-xl font-black mt-2 text-[var(--cdb-dark)]">
                    {latestUpdate
                      ? latestUpdate.toLocaleDateString("pt-BR")
                      : "--"}
                  </h2>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-yellow-soft)] text-[var(--cdb-yellow-dark)] flex items-center justify-center text-3xl">
                  📅
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[var(--cdb-blue)] to-[var(--cdb-dark)] text-white rounded-3xl p-5 lg:p-6 shadow-sm">
              <div className="text-4xl mb-4">⚽</div>

              <h2 className="text-xl font-black">Gestão centralizada</h2>

              <p className="text-blue-100 mt-2 text-sm leading-relaxed">
                Organize os campeonatos para facilitar o cadastro de jogos e
                escalas operacionais.
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-6 mb-8">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                    {editingId ? "Editar campeonato" : "Cadastrar campeonato"}
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Informe os dados básicos do campeonato.
                  </p>
                </div>

                {editingId && (
                  <span className="bg-[var(--cdb-yellow-soft)] text-[var(--cdb-yellow-dark)] px-4 py-2 rounded-2xl text-sm font-bold w-fit">
                    Modo edição
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_auto] gap-4 items-start">
                <div>
                  <input
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                    placeholder="Ex.: Campeonato Brasileiro Série A"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />

                  <label className="mt-2 block text-sm font-bold text-slate-700">
                    Nome do campeonato <span className="text-red-600">*</span>
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  className="bg-[var(--cdb-blue)] text-white px-6 py-3 rounded-2xl font-bold hover:brightness-95 transition shadow-sm"
                >
                  {editingId ? "Salvar edição" : "Cadastrar"}
                </button>

                {editingId && (
                  <button
                    onClick={clearForm}
                    className="bg-[var(--cdb-yellow-soft)] text-[var(--cdb-yellow-dark)] px-6 py-3 rounded-2xl font-bold hover:brightness-95 transition"
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
                  Lista de campeonatos
                </h2>

                <p className="text-slate-500 mt-1">
                  Consulte os campeonatos cadastrados no sistema.
                </p>
              </div>

              <input
                className="border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 min-w-full xl:min-w-[320px] focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-[var(--cdb-blue)]"
                placeholder="Buscar campeonato..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredChampionships.map((championship) => (
                <div
                  key={championship.id}
                  className="border border-slate-200 rounded-3xl p-5 hover:border-[var(--cdb-blue)] transition bg-white"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] flex items-center justify-center text-2xl shrink-0">
                      🏆
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl lg:text-2xl font-black text-[var(--cdb-dark)] break-words">
                        {championship.name}
                      </h3>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm font-semibold">
                          Criado em:{" "}
                          {new Date(championship.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>

                        <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm font-semibold">
                          Atualizado:{" "}
                          {new Date(championship.updatedAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <button
                        onClick={() => startEdit(championship)}
                        className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold hover:brightness-95 transition"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => requestDeleteChampionship(championship)}
                        className="bg-red-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-red-700 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {filteredChampionships.length === 0 && (
                <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center xl:col-span-2">
                  <div className="text-6xl mb-4">🏆</div>

                  <h3 className="text-xl font-bold text-[var(--cdb-dark)]">
                    Nenhum campeonato encontrado
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Ajuste a busca ou cadastre um novo campeonato.
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
        variant={modal.variant}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onClose={closeModal}
        onConfirm={modal.onConfirm ?? closeModal}
      />
    </main>
  );
}
