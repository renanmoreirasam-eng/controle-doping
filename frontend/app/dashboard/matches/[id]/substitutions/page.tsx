"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Sidebar } from "../../../../../components/Sidebar";
import { ConfirmModal } from "../../../../../components/ConfirmModal";
import { api } from "../../../../../services/api";
import { getUser } from "../../../../../services/auth";

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  status: string;
  championship: {
    name: string;
  };
  stadium: {
    name: string;
    city: string;
    state: string;
  };
};

type Scale = {
  id: string;
  role: string;
  confirmed: boolean | null;
  matchId: string;
  official: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
};

type Substitution = {
  id: string;
  matchId: string;
  team: "HOME" | "AWAY";
  playerOutName: string;
  playerOutNumber: string;
  playerInName: string;
  playerInNumber: string;
  minute?: number | null;
  period?: string | null;
  notes?: string | null;
  createdAt: string;
};

type OperationSummaryResponse = {
  match: Match;
  scales: Scale[];
  substitutions: Substitution[];
};

type ModalVariant = "danger" | "success" | "warning" | "default";

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: ModalVariant;
  confirmText: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
};

const initialModalState: ModalState = {
  open: false,
  title: "",
  message: "",
  variant: "default",
  confirmText: "Fechar",
};

function getErrorMessage(error: any, fallback: string) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : String(message);
}

export default function MatchSubstitutionsPage() {
  const params = useParams();
  const matchId = params.id as string;

  const user = getUser();
  const userRole = String(user?.role || user?.user?.role || "").toUpperCase();
  const userEmail = String(user?.email || user?.user?.email || "").toLowerCase();

  const isAdmin = userRole === "ADMIN";
  const isCoordinator = userRole === "COORDINATOR";
  const isOfficial = userRole === "OFFICIAL";

  const [match, setMatch] = useState<Match | null>(null);
  const [scales, setScales] = useState<Scale[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [team, setTeam] = useState<"HOME" | "AWAY">("HOME");
  const [playerOutNumber, setPlayerOutNumber] = useState("");
  const [playerInNumber, setPlayerInNumber] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalState>(initialModalState);

  function closeModal() {
    setModal(initialModalState);
  }

  function showMessage(
    title: string,
    message: string,
    variant: ModalVariant = "default",
  ) {
    setModal({
      open: true,
      title,
      message,
      variant,
      confirmText: "Fechar",
      onConfirm: closeModal,
    });
  }

  function showConfirm(params: {
    title: string;
    message: string;
    variant?: ModalVariant;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }) {
    setModal({
      open: true,
      title: params.title,
      message: params.message,
      variant: params.variant || "warning",
      confirmText: params.confirmText || "Confirmar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        closeModal();
        await params.onConfirm();
      },
    });
  }

  async function loadPage() {
    try {
      setLoading(true);

      const response = await api.get<OperationSummaryResponse>(
        `/matches/${matchId}/operation-summary`,
      );

      setMatch(response.data.match);
      setScales(response.data.scales || []);
      setSubstitutions(response.data.substitutions || []);
    } catch (error: any) {
      showMessage(
        "Erro ao carregar substituições",
        getErrorMessage(error, "Não foi possível carregar os dados deste jogo."),
        "danger",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (matchId) {
      loadPage();
    }
  }, [matchId]);

  const homeSubstitutions = useMemo(
    () => substitutions.filter((item) => item.team === "HOME"),
    [substitutions],
  );

  const awaySubstitutions = useMemo(
    () => substitutions.filter((item) => item.team === "AWAY"),
    [substitutions],
  );

  const isCurrentUserScaled = scales.some(
    (scale) =>
      scale.official.user.email.trim().toLowerCase() === userEmail,
  );

  const canAccessPage =
    isAdmin ||
    ((isCoordinator || isOfficial) &&
      isCurrentUserScaled &&
      !(isOfficial && match?.status === "CONTROL_DONE"));

  const isControlDone = match?.status === "CONTROL_DONE";
  const canEdit = Boolean(match && match.status === "IN_PROGRESS" && !isControlDone);

  function getTeamName(value: "HOME" | "AWAY") {
    if (!match) return value;
    return value === "HOME" ? match.homeTeam : match.awayTeam;
  }

  function getTeamSubstitutions(value: "HOME" | "AWAY") {
    return value === "HOME" ? homeSubstitutions : awaySubstitutions;
  }

  function resetForm() {
    setTeam("HOME");
    setPlayerOutNumber("");
    setPlayerInNumber("");
    setEditingId(null);
  }

  function startEdit(substitution: Substitution) {
    if (!canEdit) return;

    setTeam(substitution.team);
    setPlayerOutNumber(substitution.playerOutNumber);
    setPlayerInNumber(substitution.playerInNumber);
    setEditingId(substitution.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function buildBulkPayload(nextSubstitutions: Substitution[]) {
    return nextSubstitutions.map((item) => ({
      team: item.team,
      playerOutName: `Atleta ${item.playerOutNumber}`,
      playerOutNumber: item.playerOutNumber,
      playerInName: `Atleta ${item.playerInNumber}`,
      playerInNumber: item.playerInNumber,
      minute: null,
      period: "JOGO",
      notes: null,
    }));
  }

  async function replaceSubstitutions(nextSubstitutions: Substitution[]) {
    const response = await api.post("/substitutions/bulk", {
      matchId,
      substitutions: buildBulkPayload(nextSubstitutions),
    });

    setSubstitutions(response.data || []);
  }

  async function saveSubstitution() {
    if (!canEdit) {
      showMessage(
        "Registro indisponível",
        "As substituições só podem ser alteradas enquanto o jogo estiver em andamento.",
        "warning",
      );
      return;
    }

    const outNumber = playerOutNumber.trim();
    const inNumber = playerInNumber.trim();

    if (!outNumber || !inNumber) {
      showMessage(
        "Dados obrigatórios",
        "Informe o número do jogador que saiu e o número do jogador que entrou.",
        "warning",
      );
      return;
    }

    if (outNumber === inNumber) {
      showMessage(
        "Números inválidos",
        "O jogador que entrou não pode ter o mesmo número do jogador que saiu.",
        "warning",
      );
      return;
    }

    const teamSubstitutions = getTeamSubstitutions(team);
    const isEditingSameTeam = Boolean(
      editingId &&
        substitutions.find((item) => item.id === editingId)?.team === team,
    );

    if (
      !isEditingSameTeam &&
      teamSubstitutions.length >= 5
    ) {
      showMessage(
        "Limite atingido",
        `${getTeamName(team)} já possui 5 substituições registradas.`,
        "warning",
      );
      return;
    }

    const duplicate = substitutions.some(
      (item) =>
        item.id !== editingId &&
        item.team === team &&
        item.playerOutNumber === outNumber &&
        item.playerInNumber === inNumber,
    );

    if (duplicate) {
      showMessage(
        "Substituição duplicada",
        "Essa troca já está registrada para esta equipe.",
        "warning",
      );
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const existing = substitutions.find((item) => item.id === editingId);

        if (!existing) {
          showMessage(
            "Registro não encontrado",
            "A substituição que você tentou alterar não está mais disponível.",
            "warning",
          );
          await loadPage();
          return;
        }

        const nextSubstitutions = substitutions.map((item) =>
          item.id === editingId
            ? {
                ...item,
                team,
                playerOutNumber: outNumber,
                playerInNumber: inNumber,
                playerOutName: `Atleta ${outNumber}`,
                playerInName: `Atleta ${inNumber}`,
              }
            : item,
        );

        await replaceSubstitutions(nextSubstitutions);

        showMessage(
          "Substituição atualizada",
          "A substituição foi alterada com sucesso.",
          "success",
        );
      } else {
        await api.post("/substitutions", {
          matchId,
          team,
          playerOutName: `Atleta ${outNumber}`,
          playerOutNumber: outNumber,
          playerInName: `Atleta ${inNumber}`,
          playerInNumber: inNumber,
          minute: null,
          period: null,
          notes: null,
        });

        await loadPage();

        showMessage(
          "Substituição registrada",
          "A substituição foi registrada com sucesso.",
          "success",
        );
      }

      resetForm();
    } catch (error: any) {
      showMessage(
        editingId ? "Erro ao alterar substituição" : "Erro ao registrar substituição",
        getErrorMessage(error, "Não foi possível salvar a substituição."),
        "danger",
      );
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(substitution: Substitution) {
    if (!canEdit) return;

    showConfirm({
      title: "Excluir substituição",
      message: `Deseja excluir a troca Nº ${substitution.playerOutNumber} saiu → Nº ${substitution.playerInNumber} entrou de ${getTeamName(substitution.team)}?`,
      variant: "danger",
      confirmText: "Excluir",
      onConfirm: async () => {
        try {
          setSaving(true);

          await api.delete(`/substitutions/${substitution.id}`);

          if (editingId === substitution.id) {
            resetForm();
          }

          await loadPage();

          showMessage(
            "Substituição excluída",
            "O registro foi removido com sucesso.",
            "success",
          );
        } catch (error: any) {
          showMessage(
            "Erro ao excluir substituição",
            getErrorMessage(error, "Não foi possível excluir a substituição."),
            "danger",
          );
        } finally {
          setSaving(false);
        }
      },
    });
  }

  if (loading || !match) {
    return (
      <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
        <Sidebar />

        <div className="flex-1 p-4 lg:p-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
            Carregando substituições...
          </div>
        </div>

        <ConfirmModal
          open={modal.open}
          title={modal.title}
          message={modal.message}
          variant={modal.variant}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
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

  if (!canAccessPage) {
    return (
      <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
        <Sidebar />

        <div className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm lg:p-8">
            <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-700">
              Acesso bloqueado
            </span>

            <h1 className="mt-4 text-2xl font-black text-[var(--cdb-dark)] lg:text-4xl">
              Substituições indisponíveis
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Você não está escalado para esta partida ou não possui permissão para acessar esta operação.
            </p>

            <Link
              href="/dashboard/matches"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-bold text-white"
            >
              Voltar para jogos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <header className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="p-5 lg:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="inline-flex w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                    Substituições da partida
                  </span>

                  <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--cdb-dark)] lg:text-5xl">
                    {match.homeTeam} x {match.awayTeam}
                  </h1>

                  <p className="mt-2 text-sm text-slate-500">
                    {match.championship.name} · {match.stadium.name} ·{" "}
                    {match.stadium.city}/{match.stadium.state}
                  </p>
                </div>

                <Link
                  href={`/dashboard/matches/${matchId}`}
                  className="hidden w-fit items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[var(--cdb-blue)] sm:inline-flex"
                >
                  ← Voltar para operação do jogo
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-6 px-4 pb-8 lg:px-8">
          {isControlDone && (
            <div className="rounded-3xl border border-green-200 bg-green-50 p-5 text-green-800">
              <p className="font-black">Controle realizado</p>
              <p className="mt-1 text-sm">
                As substituições estão disponíveis somente para consulta.
              </p>
            </div>
          )}

          {canEdit && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                    {editingId ? "Alterar registro" : "Novo registro"}
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[var(--cdb-dark)]">
                    {editingId ? "Editar substituição" : "Registrar substituição"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Informe somente a equipe e os números dos jogadores.
                  </p>
                </div>

                {editingId && (
                  <span className="w-fit rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-black text-yellow-700">
                    Modo edição
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Equipe
                  </label>

                  <select
                    value={team}
                    onChange={(event) =>
                      setTeam(event.target.value as "HOME" | "AWAY")
                    }
                    disabled={saving}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  >
                    <option value="HOME">
                      Mandante - {match.homeTeam}
                    </option>
                    <option value="AWAY">
                      Visitante - {match.awayTeam}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-red-700">
                    Nº saiu
                  </label>

                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    placeholder="Ex: 10"
                    value={playerOutNumber}
                    disabled={saving}
                    onChange={(event) =>
                      setPlayerOutNumber(event.target.value.replace(/\D/g, ""))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-green-700">
                    Nº entrou
                  </label>

                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    placeholder="Ex: 18"
                    value={playerInNumber}
                    disabled={saving}
                    onChange={(event) =>
                      setPlayerInNumber(event.target.value.replace(/\D/g, ""))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-green-300 focus:ring-4 focus:ring-green-50 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={saveSubstitution}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving
                    ? "Salvando..."
                    : editingId
                      ? "Salvar alteração"
                      : "Registrar substituição"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
                  >
                    Cancelar edição
                  </button>
                )}

                <Link
                  href={`/dashboard/matches/${matchId}`}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 sm:hidden"
                >
                  ← Voltar para operação do jogo
                </Link>
              </div>
            </div>
          )}

          {!canEdit && !isControlDone && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
              O registro de substituições será liberado quando o jogo estiver em andamento.
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {(["HOME", "AWAY"] as const).map((side) => {
              const teamSubstitutions = getTeamSubstitutions(side);

              return (
                <div
                  key={side}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 p-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {side === "HOME" ? "Mandante" : "Visitante"}
                      </p>

                      <h2 className="mt-1 text-xl font-black text-[var(--cdb-dark)]">
                        {getTeamName(side)}
                      </h2>
                    </div>

                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-black text-[var(--cdb-blue)]">
                      {teamSubstitutions.length}/5
                    </span>
                  </div>

                  <div className="space-y-3 p-4 lg:p-5">
                    {teamSubstitutions.map((substitution, index) => (
                      <div
                        key={substitution.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                              Substituição {index + 1}
                            </p>

                            {/* Visualização mobile */}
                            <div className="mt-3 sm:hidden">
                              <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
                                <div className="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-3 text-center">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm ring-1 ring-red-100">
                                    👤
                                  </div>

                                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-red-500">
                                    Saiu
                                  </p>

                                  <p className="mt-1 text-xl font-black text-red-700">
                                    Nº {substitution.playerOutNumber}
                                  </p>
                                </div>

                                <div className="flex items-center justify-center px-1 text-xl font-black text-slate-400">
                                  →
                                </div>

                                <div className="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-green-100 bg-green-50 p-3 text-center">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm ring-1 ring-green-100">
                                    👤
                                  </div>

                                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-green-600">
                                    Entrou
                                  </p>

                                  <p className="mt-1 text-xl font-black text-green-700">
                                    Nº {substitution.playerInNumber}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Visualização desktop/tablet */}
                            <div className="mt-2 hidden flex-wrap items-center gap-2 sm:flex">
                              <span className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-black text-red-700">
                                Nº {substitution.playerOutNumber} saiu
                              </span>

                              <span className="font-black text-slate-400">→</span>

                              <span className="rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-sm font-black text-green-700">
                                Nº {substitution.playerInNumber} entrou
                              </span>
                            </div>
                          </div>

                          {canEdit && (
                            <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
                              <button
                                type="button"
                                onClick={() => startEdit(substitution)}
                                disabled={saving}
                                className="min-w-[96px] rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-[var(--cdb-blue)] transition hover:bg-blue-100 disabled:opacity-60"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => requestDelete(substitution)}
                                disabled={saving}
                                className="min-w-[96px] rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                              >
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {teamSubstitutions.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                        <p className="text-sm font-semibold text-slate-500">
                          Nenhuma substituição registrada.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
