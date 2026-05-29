"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "../../../components/Sidebar";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { api } from "../../../services/api";
import { getUser } from "../../../services/auth";

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  status: string;
  missionOrderFileName?: string | null;
  missionOrderFileType?: string | null;
  missionOrderFileData?: string | null;
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
  role: "DCO" | "ASSISTANT";
  confirmed: boolean | null;
  match: Match;
  official: Official;
};

type ScaleGroup = {
  match: Match;
  dco?: Scale;
  assistant?: Scale;
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

function ScalesPageContent() {
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement | null>(null);

  const [scales, setScales] = useState<Scale[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [scaleStatusFilter, setScaleStatusFilter] = useState("");

  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState("");
  const [dcoOfficialId, setDcoOfficialId] = useState("");
  const [assistantOfficialId, setAssistantOfficialId] = useState("");
  const [modal, setModal] = useState<ModalState>(initialModalState);

  const user = getUser();

  const userRole = String(user?.role || user?.user?.role || "").toUpperCase();

  const loggedUserId = user?.id || user?.sub || user?.userId || user?.user?.id;

  const loggedUserEmail = user?.email || user?.user?.email;

  const isAdmin = userRole === "ADMIN";

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

  async function loadScales() {
    const response = await api.get("/match-officials");
    setScales(response.data);
  }

  async function loadMatches() {
    const response = await api.get("/matches");
    setMatches(response.data);
  }

  async function loadOfficials() {
    const response = await api.get("/officials");
    setOfficials(response.data.filter((item: Official) => item.active));
  }

  useEffect(() => {
    loadScales();
    loadMatches();
    loadOfficials();
  }, []);

  useEffect(() => {
    const status = searchParams.get("status");

    if (
      status === "PENDING" ||
      status === "CONFIRMED" ||
      status === "REFUSED"
    ) {
      setScaleStatusFilter(status);
    }
  }, [searchParams]);

  function canConfirmScale(scale?: Scale) {
    if (!scale) return false;

    return (
      scale.official?.user?.id === loggedUserId ||
      scale.official?.user?.email === loggedUserEmail
    );
  }

  function canRespondScale(scale?: Scale) {
    if (!scale) return false;
    if (!canConfirmScale(scale)) return false;

    return scale.confirmed === null;
  }

  function isOwnScale(scale: Scale) {
    return (
      scale.official?.user?.id === loggedUserId ||
      scale.official?.user?.email === loggedUserEmail
    );
  }

  function hasMissionOrder(match?: Match | null) {
    return Boolean(
      match?.missionOrderFileData ||
        match?.missionOrderFileName ||
        match?.missionOrderFileType,
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

      if (scale.role === "DCO") {
        group.dco = scale;
      }

      if (scale.role === "ASSISTANT") {
        group.assistant = scale;
      }
    }

    const groups = Array.from(map.values());

    if (isAdmin) {
      return groups;
    }

    return groups.filter(
      (group) => canConfirmScale(group.dco) || canConfirmScale(group.assistant),
    );
  }, [scales, isAdmin, loggedUserId, loggedUserEmail]);

  const filteredGroups = groupedScales.filter((group) => {
    const value = `
      ${group.match.homeTeam}
      ${group.match.awayTeam}
      ${group.match.championship.name}
      ${group.match.stadium.name}
      ${group.match.stadium.city}
      ${group.dco?.official.user.name || ""}
      ${group.assistant?.official.user.name || ""}
    `.toLowerCase();

    const matchesSearch = value.includes(search.toLowerCase());

    const matchDate = new Date(group.match.matchDate);

    const matchesStartDate = startDate
      ? matchDate >= new Date(`${startDate}T00:00:00`)
      : true;

    const matchesEndDate = endDate
      ? matchDate <= new Date(`${endDate}T23:59:59`)
      : true;

    const scaleStatuses = [group.dco?.confirmed, group.assistant?.confirmed];

    const matchesScaleStatus =
      !scaleStatusFilter ||
      scaleStatuses.some((confirmed) => {
        if (scaleStatusFilter === "PENDING") {
          return confirmed === null || confirmed === undefined;
        }

        if (scaleStatusFilter === "CONFIRMED") {
          return confirmed === true;
        }

        if (scaleStatusFilter === "REFUSED") {
          return confirmed === false;
        }

        return true;
      });

    return (
      matchesSearch && matchesStartDate && matchesEndDate && matchesScaleStatus
    );
  });

  const availableMatches = useMemo(() => {
    return matches
      .filter((match) => {
        if (editingMatchId === match.id) {
          return true;
        }

        if (match.status === "CONTROL_DONE" || match.status === "CANCELED") {
          return false;
        }

        const group = groupedScales.find((item) => item.match.id === match.id);

        return !group;
      })
      .sort(
        (a, b) =>
          new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
      );
  }, [matches, groupedScales, editingMatchId]);

  const visibleScales = useMemo(() => {
    if (isAdmin) return scales;

    return scales.filter((scale) => isOwnScale(scale));
  }, [isAdmin, scales, loggedUserId, loggedUserEmail]);

  const pendingScales = useMemo(() => {
    return visibleScales.filter(
      (scale) => scale.confirmed === null || scale.confirmed === undefined,
    );
  }, [visibleScales]);

  const refusedScales = useMemo(() => {
    return scales.filter((scale) => scale.confirmed === false);
  }, [scales]);

  const scalesWithoutMissionOrder = useMemo(() => {
    const uniqueMatches = new Map<string, Match>();

    for (const scale of scales) {
      const match = scale.match;

      if (!match?.id) continue;
      if (match.status === "CONTROL_DONE") continue;
      if (match.status === "CANCELED") continue;
      if (hasMissionOrder(match)) continue;

      uniqueMatches.set(match.id, match);
    }

    return Array.from(uniqueMatches.values());
  }, [scales]);

  const confirmedScales = useMemo(() => {
    return visibleScales.filter((scale) => scale.confirmed === true);
  }, [visibleScales]);

  function clearForm() {
    setEditingMatchId(null);
    setMatchId("");
    setDcoOfficialId("");
    setAssistantOfficialId("");
  }

  function startEdit(group: ScaleGroup) {
    setEditingMatchId(group.match.id);
    setMatchId(group.match.id);
    setDcoOfficialId(group.dco?.officialId || "");
    setAssistantOfficialId(group.assistant?.officialId || "");

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function getStatus(scale?: Scale) {
    if (!scale) return "Não escalado";
    if (scale.confirmed === true) return "Confirmado";
    if (scale.confirmed === false) return "Recusado";
    return "Pendente";
  }

  function getStatusClass(scale?: Scale) {
    if (!scale) {
      return "bg-slate-100 text-slate-600 border border-slate-200";
    }

    if (scale.confirmed === true) {
      return "bg-green-100 text-green-700 border border-green-200";
    }

    if (scale.confirmed === false) {
      return "bg-red-100 text-red-700 border border-red-200";
    }

    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  }

  async function createScale(role: "DCO" | "ASSISTANT", officialId: string) {
    await api.post("/match-officials", {
      matchId,
      officialId,
      role,
    });
  }

  async function saveScales() {
    if (!isAdmin) {
      showMessage(
        "Permissão negada",
        "Você não tem permissão para editar escalas.",
        "warning",
      );
      return;
    }

    if (!matchId) {
      showMessage("Jogo obrigatório", "Selecione um jogo.", "warning");
      return;
    }

    if (!dcoOfficialId && !assistantOfficialId) {
      showMessage(
        "Oficial obrigatório",
        "Selecione pelo menos um oficial.",
        "warning",
      );
      return;
    }

    if (
      dcoOfficialId &&
      assistantOfficialId &&
      dcoOfficialId === assistantOfficialId
    ) {
      showMessage(
        "Oficiais inválidos",
        "O DCO e o Assistente não podem ser o mesmo oficial.",
        "warning",
      );
      return;
    }

    try {
      const group = groupedScales.find((item) => item.match.id === matchId);

      if (group && !editingMatchId) {
        showMessage(
          "Jogo já escalado",
          "Este jogo já possui escala cadastrada. Use a opção Editar na lista de escalas.",
          "warning",
        );
        return;
      }

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
        await createScale("DCO", dcoOfficialId);
      }

      if (
        assistantOfficialId &&
        group?.assistant?.officialId !== assistantOfficialId
      ) {
        await createScale("ASSISTANT", assistantOfficialId);
      }

      clearForm();
      await loadScales();

      showMessage("Escala salva", "Escala salva com sucesso!", "success");
    } catch (error: any) {
      showMessage(
        "Erro ao salvar escala",
        getErrorMessage(error, "Erro ao salvar escala."),
        "danger",
      );
    }
  }

  async function confirmScale(scale?: Scale) {
    if (!scale) return;

    if (scale.confirmed !== null) {
      showMessage(
        "Resposta já registrada",
        "Esta escala já possui uma resposta registrada.",
        "warning",
      );
      return;
    }

    const officialName = scale.official?.user?.name || "este oficial";
    const roleLabel = scale.role === "DCO" ? "DCO" : "Assistente";

    showConfirm({
      title: "Confirmar escala",
      message: `Deseja confirmar a escala como ${roleLabel} para ${officialName}?`,
      variant: "success",
      confirmText: "Confirmar",
      onConfirm: async () => {
        try {
          await api.patch(`/match-officials/${scale.id}/confirm`);
          await loadScales();
          showMessage(
            "Escala confirmada",
            "Sua confirmação foi registrada com sucesso.",
            "success",
          );
        } catch (error: any) {
          showMessage(
            "Erro ao confirmar escala",
            getErrorMessage(error, "Erro ao confirmar escala."),
            "danger",
          );
        }
      },
    });
  }

  async function refuseScale(scale?: Scale) {
    if (!scale) return;

    if (scale.confirmed !== null) {
      showMessage(
        "Resposta já registrada",
        "Esta escala já possui uma resposta registrada.",
        "warning",
      );
      return;
    }

    const officialName = scale.official?.user?.name || "este oficial";
    const roleLabel = scale.role === "DCO" ? "DCO" : "Assistente";

    showConfirm({
      title: "Recusar escala",
      message: `Deseja recusar a escala como ${roleLabel} para ${officialName}?`,
      variant: "warning",
      confirmText: "Recusar",
      onConfirm: async () => {
        try {
          await api.patch(`/match-officials/${scale.id}/refuse`);
          await loadScales();
          showMessage(
            "Escala recusada",
            "Sua recusa foi registrada com sucesso.",
            "success",
          );
        } catch (error: any) {
          showMessage(
            "Erro ao recusar escala",
            getErrorMessage(error, "Erro ao recusar escala."),
            "danger",
          );
        }
      },
    });
  }

  async function deleteScale(id: string) {
    if (!isAdmin) {
      showMessage(
        "Permissão negada",
        "Você não tem permissão para remover escala.",
        "warning",
      );
      return;
    }

    showConfirm({
      title: "Remover oficial da escala",
      message: "Deseja remover este oficial da escala?",
      variant: "danger",
      confirmText: "Remover",
      onConfirm: async () => {
        try {
          await api.delete(`/match-officials/${id}`);
          await loadScales();
          showMessage(
            "Oficial removido",
            "Oficial removido da escala com sucesso.",
            "success",
          );
        } catch (error: any) {
          showMessage(
            "Erro ao remover oficial",
            getErrorMessage(error, "Erro ao remover oficial da escala."),
            "danger",
          );
        }
      },
    });
  }

  async function deleteFullScale(group: ScaleGroup) {
    if (!isAdmin) {
      showMessage(
        "Permissão negada",
        "Você não tem permissão para excluir escala.",
        "warning",
      );
      return;
    }

    showConfirm({
      title: "Excluir escala",
      message: "Deseja remover a escala completa deste jogo?",
      variant: "danger",
      confirmText: "Excluir",
      onConfirm: async () => {
        try {
          if (group.dco) {
            await api.delete(`/match-officials/${group.dco.id}`);
          }

          if (group.assistant) {
            await api.delete(`/match-officials/${group.assistant.id}`);
          }

          await loadScales();
          showMessage("Escala excluída", "Escala removida com sucesso.", "success");
        } catch (error: any) {
          showMessage(
            "Erro ao excluir escala",
            getErrorMessage(error, "Erro ao excluir escala."),
            "danger",
          );
        }
      },
    });
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--cdb-light)] lg:flex-row">
      <Sidebar />

      <div className="min-w-0 flex-1 overflow-x-hidden">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                📋 Gestão operacional
              </div>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Escalas
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Cadastre, acompanhe e confirme as escalas dos oficiais por jogo.
              </p>
            </div>

            <div className="bg-[var(--cdb-blue)] text-white px-5 py-3 rounded-2xl font-bold shadow-lg w-fit">
              {groupedScales.length} jogos escalados
            </div>
          </div>
        </header>

        <section className="w-full max-w-full overflow-x-hidden p-4 lg:p-8">
          <div
            className={`mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-8 ${
              isAdmin ? "xl:grid-cols-4" : "xl:grid-cols-2"
            }`}
          >
            <button
              type="button"
              onClick={() => setScaleStatusFilter("PENDING")}
              className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:shadow-md text-left ${
                pendingScales.length > 0
                  ? "bg-[var(--cdb-yellow-soft)] border-yellow-200"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      pendingScales.length > 0
                        ? "text-[#9A7600]"
                        : "text-slate-500"
                    }`}
                  >
                    Escalas pendentes
                  </p>

                  <h2
                    className={`text-3xl lg:text-4xl font-black mt-2 ${
                      pendingScales.length > 0
                        ? "text-[#9A7600]"
                        : "text-slate-700"
                    }`}
                  >
                    {pendingScales.length}
                  </h2>

                  <p className="text-xs text-slate-500 mt-2">
                    {isAdmin
                      ? "Todas pendentes de confirmação"
                      : "Minhas pendentes de confirmação"}
                  </p>
                </div>

                <div
                  className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                    pendingScales.length > 0
                      ? "bg-yellow-100 text-[#9A7600]"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  📋
                </div>
              </div>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setScaleStatusFilter("REFUSED")}
                className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:shadow-md text-left ${
                  refusedScales.length > 0
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        refusedScales.length > 0
                          ? "text-red-700"
                          : "text-slate-500"
                      }`}
                    >
                      Escalas recusadas
                    </p>

                    <h2
                      className={`text-3xl lg:text-4xl font-black mt-2 ${
                        refusedScales.length > 0
                          ? "text-red-700"
                          : "text-slate-700"
                      }`}
                    >
                      {refusedScales.length}
                    </h2>

                    <p className="text-xs text-slate-500 mt-2">
                      Clique para ver recusadas
                    </p>
                  </div>

                  <div
                    className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                      refusedScales.length > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    ⚠️
                  </div>
                </div>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setScaleStatusFilter("")}
                className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:shadow-md text-left ${
                  scalesWithoutMissionOrder.length > 0
                    ? "bg-purple-50 border-purple-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        scalesWithoutMissionOrder.length > 0
                          ? "text-purple-700"
                          : "text-slate-500"
                      }`}
                    >
                      Sem ordem de missão
                    </p>

                    <h2
                      className={`text-3xl lg:text-4xl font-black mt-2 ${
                        scalesWithoutMissionOrder.length > 0
                          ? "text-purple-700"
                          : "text-slate-700"
                      }`}
                    >
                      {scalesWithoutMissionOrder.length}
                    </h2>

                    <p className="text-xs text-slate-500 mt-2">
                      Escalas com ordem não anexada
                    </p>
                  </div>

                  <div
                    className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                      scalesWithoutMissionOrder.length > 0
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    📄
                  </div>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => setScaleStatusFilter("CONFIRMED")}
              className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200 transition hover:shadow-md text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    Escalas confirmadas
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-green)]">
                    {confirmedScales.length}
                  </h2>

                  <p className="text-xs text-slate-500 mt-2">
                    {isAdmin ? "Todas confirmadas" : "Minhas confirmadas"}
                  </p>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[var(--cdb-green-soft)] text-[var(--cdb-green)] flex items-center justify-center text-3xl">
                  ✅
                </div>
              </div>
            </button>
          </div>

          {isAdmin && (
            <div
              ref={formRef}
              className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:mb-8 lg:p-6"
            >
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.22em] text-[var(--cdb-blue)]">
                    Cadastro de escala
                  </span>

                  <h2 className="mt-2 text-2xl font-black text-[var(--cdb-dark)]">
                    {editingMatchId ? "Editar escala" : "Nova escala"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Selecione o jogo e cadastre DCO e Assistente.
                  </p>
                </div>

                {editingMatchId && (
                  <span className="w-fit rounded-2xl bg-yellow-50 px-4 py-2 text-sm font-bold text-yellow-700 ring-1 ring-yellow-100">
                    Modo edição
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Jogo <span className="text-red-500">*</span>
                  </label>

                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value)}
                    disabled={!!editingMatchId}
                  >
                    <option value="">Selecione o jogo</option>

                    {availableMatches.map((match) => (
                      <option key={match.id} value={match.id}>
                        {match.homeTeam} x {match.awayTeam} —{" "}
                        {new Date(match.matchDate).toLocaleString("pt-BR")}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-slate-500">
                    São listados apenas jogos ativos e ainda sem escala cadastrada.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    DCO
                  </label>

                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
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
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Assistente
                  </label>

                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    value={assistantOfficialId}
                    onChange={(e) => setAssistantOfficialId(e.target.value)}
                  >
                    <option value="">Assistente opcional</option>

                    {officials.map((official) => (
                      <option key={official.id} value={official.id}>
                        {official.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={saveScales}
                  className="w-full rounded-2xl bg-[var(--cdb-blue)] px-6 py-3 font-bold text-white shadow-lg shadow-blue-900/10 transition hover:brightness-95 sm:w-auto"
                >
                  {editingMatchId ? "Salvar edição" : "Cadastrar escala"}
                </button>

                {editingMatchId && (
                  <button
                    onClick={clearForm}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6">
            <div className="mb-6 flex flex-col gap-5">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.22em] text-[var(--cdb-blue)]">
                  Consulta
                </span>
                <h2 className="mt-2 text-2xl font-black text-[var(--cdb-dark)]">
                  Escalas cadastradas
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Visualização operacional por jogo.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <label className="mt-2 block text-sm font-bold text-slate-700">
                    Data início
                  </label>
                </div>

                <div>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <label className="mt-2 block text-sm font-bold text-slate-700">
                    Data fim
                  </label>
                </div>

                <div>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    value={scaleStatusFilter}
                    onChange={(e) => setScaleStatusFilter(e.target.value)}
                  >
                    <option value="">Todos os status</option>
                    <option value="PENDING">Pendente</option>
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="REFUSED">Recusado</option>
                  </select>
                  <label className="mt-2 block text-sm font-bold text-slate-700">
                    Status da escala
                  </label>
                </div>

                <div className="xl:col-span-2">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    placeholder="Buscar por jogo, campeonato, estádio ou oficial..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <label className="mt-2 block text-sm font-bold text-slate-700">
                    Buscar
                  </label>
                </div>

                {(startDate || endDate || search || scaleStatusFilter) && (
                  <div className="xl:col-span-5">
                    <button
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                        setSearch("");
                        setScaleStatusFilter("");
                      }}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 lg:hidden">
              {filteredGroups.map((group) => (
                <div
                  key={group.match.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--cdb-blue)]">
                      {group.match.championship.name}
                    </p>

                    <h3 className="mt-1 text-xl font-black text-[var(--cdb-dark)]">
                      {group.match.homeTeam} x {group.match.awayTeam}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {group.match.stadium.city}/{group.match.stadium.state}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <p className="text-slate-500">Estádio</p>
                      <strong>🏟️ {group.match.stadium.name}</strong>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <p className="text-slate-500">Data e horário</p>
                      <strong>
                        {new Date(group.match.matchDate).toLocaleString(
                          "pt-BR",
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                          DCO
                        </p>

                        <span
                          className={`${getStatusClass(
                            group.dco,
                          )} shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-bold leading-none`}
                        >
                          {getStatus(group.dco)}
                        </span>
                      </div>

                      {group.dco ? (
                        <div className="min-w-0">
                          <h4 className="break-words font-black leading-tight text-slate-900">
                            {group.dco.official.user.name}
                          </h4>

                          <p className="mt-1 break-all text-sm text-slate-500">
                            {group.dco.official.user.email}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">Não escalado</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                          Assistente
                        </p>

                        <span
                          className={`${getStatusClass(
                            group.assistant,
                          )} shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-bold leading-none`}
                        >
                          {getStatus(group.assistant)}
                        </span>
                      </div>

                      {group.assistant ? (
                        <div className="min-w-0">
                          <h4 className="break-words font-black leading-tight text-slate-900">
                            {group.assistant.official.user.name}
                          </h4>

                          <p className="mt-1 break-all text-sm text-slate-500">
                            {group.assistant.official.user.email}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">Não escalado</p>
                      )}
                    </div>
                  </div>

                  {(canRespondScale(group.dco) ||
                    canRespondScale(group.assistant)) && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                        Minha confirmação
                      </p>

                      <div className="space-y-3">
                        {canRespondScale(group.dco) && (
                          <div>
                            <p className="mb-2 text-sm font-bold text-slate-700">
                              DCO
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => confirmScale(group.dco)}
                                className="rounded-xl bg-green-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                              >
                                Confirmar
                              </button>

                              <button
                                onClick={() => refuseScale(group.dco)}
                                className="rounded-xl bg-yellow-500 px-3 py-3 text-sm font-bold text-white transition hover:bg-yellow-600"
                              >
                                Recusar
                              </button>
                            </div>
                          </div>
                        )}

                        {canRespondScale(group.assistant) && (
                          <div>
                            <p className="mb-2 text-sm font-bold text-slate-700">
                              Assistente
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() =>
                                  confirmScale(group.assistant)
                                }
                                className="rounded-xl bg-green-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                              >
                                Confirmar
                              </button>

                              <button
                                onClick={() => refuseScale(group.assistant)}
                                className="rounded-xl bg-yellow-500 px-3 py-3 text-sm font-bold text-white transition hover:bg-yellow-600"
                              >
                                Recusar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[var(--cdb-blue)]">
                        Administração
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => startEdit(group)}
                          className="rounded-xl bg-[var(--cdb-blue)] px-3 py-3 text-sm font-bold text-white transition hover:brightness-95"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => deleteFullScale(group)}
                          className="rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}

                  {!isAdmin &&
                    !canConfirmScale(group.dco) &&
                    !canConfirmScale(group.assistant) && (
                      <span className="mt-4 block rounded-xl bg-slate-100 px-3 py-3 text-center text-sm text-slate-400">
                        Sem ação disponível
                      </span>
                    )}
                </div>
              ))}
            </div>

            <div className="hidden max-w-full overflow-x-auto lg:block">
              <table className="min-w-[1180px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                    <th className="py-4 pr-4 font-black">Jogo</th>
                    <th className="py-4 pr-4 font-black">Campeonato</th>
                    <th className="py-4 pr-4 font-black">Estádio</th>
                    <th className="py-4 pr-4 font-black">DCO</th>
                    <th className="py-4 pr-4 font-black">Status DCO</th>
                    <th className="py-4 pr-4 font-black">Assistente</th>
                    <th className="py-4 pr-4 font-black">Status Assistente</th>
                    <th className="py-4 pr-4 font-black">Data</th>
                    <th className="py-4 pr-4 font-black">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredGroups.map((group) => (
                    <tr
                      key={group.match.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="py-5 pr-4">
                        <div className="font-black text-[var(--cdb-dark)]">
                          {group.match.homeTeam} x {group.match.awayTeam}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {group.match.stadium.city}/{group.match.stadium.state}
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
                            <div className="font-bold text-slate-800">
                              {group.dco.official.user.name}
                            </div>

                            <div className="text-sm text-slate-500">
                              {group.dco.official.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">Não escalado</span>
                        )}
                      </td>

                      <td className="py-5 pr-4">
                        <span
                          className={`${getStatusClass(
                            group.dco,
                          )} inline-flex min-w-[110px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold`}
                        >
                          {getStatus(group.dco)}
                        </span>
                      </td>

                      <td className="py-5 pr-4">
                        {group.assistant ? (
                          <div>
                            <div className="font-bold text-slate-800">
                              {group.assistant.official.user.name}
                            </div>

                            <div className="text-sm text-slate-500">
                              {group.assistant.official.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">Não escalado</span>
                        )}
                      </td>

                      <td className="py-5 pr-4">
                        <span
                          className={`${getStatusClass(
                            group.assistant,
                          )} inline-flex min-w-[110px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold`}
                        >
                          {getStatus(group.assistant)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap py-5 pr-4 text-sm text-slate-600">
                        {new Date(group.match.matchDate).toLocaleString(
                          "pt-BR",
                        )}
                      </td>

                      <td className="py-5 pr-4">
                        <div className="flex min-w-[220px] flex-col gap-3">
                          {(canRespondScale(group.dco) ||
                            canRespondScale(group.assistant)) && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                                Minha confirmação
                              </p>

                              <div className="flex flex-col gap-2">
                                {canRespondScale(group.dco) && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        confirmScale(group.dco)
                                      }
                                      className="flex-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-green-700"
                                    >
                                      Confirmar DCO
                                    </button>

                                    <button
                                      onClick={() => refuseScale(group.dco)}
                                      className="flex-1 rounded-xl bg-yellow-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-yellow-600"
                                    >
                                      Recusar
                                    </button>
                                  </div>
                                )}

                                {canRespondScale(group.assistant) && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        confirmScale(group.assistant)
                                      }
                                      className="flex-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-green-700"
                                    >
                                      Confirmar Assist.
                                    </button>

                                    <button
                                      onClick={() =>
                                        refuseScale(group.assistant)
                                      }
                                      className="flex-1 rounded-xl bg-yellow-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-yellow-600"
                                    >
                                      Recusar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {isAdmin && (
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                              <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--cdb-blue)]">
                                Administração
                              </p>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(group)}
                                  className="flex-1 rounded-xl bg-[var(--cdb-blue)] px-3 py-2 text-sm font-bold text-white transition hover:brightness-95"
                                >
                                  Editar
                                </button>

                                <button
                                  onClick={() => deleteFullScale(group)}
                                  className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                                >
                                  Excluir
                                </button>
                              </div>
                            </div>
                          )}

                          {!isAdmin &&
                            !canConfirmScale(group.dco) &&
                            !canConfirmScale(group.assistant) && (
                              <span className="rounded-xl bg-slate-100 px-3 py-2 text-center text-sm text-slate-400">
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
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-10 text-center">
                <div className="mb-4 text-6xl">📋</div>

                <h3 className="text-xl font-bold text-[var(--cdb-dark)]">
                  Nenhuma escala encontrada
                </h3>

                <p className="mt-2 text-slate-500">
                  Cadastre uma escala ou ajuste sua busca.
                </p>
              </div>
            )}
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

export default function ScalesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--cdb-light)] lg:flex-row">
          <div className="p-8 text-slate-500">Carregando escalas...</div>
        </main>
      }
    >
      <ScalesPageContent />
    </Suspense>
  );
}
