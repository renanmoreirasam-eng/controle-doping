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
  officials?: {
    id: string;
    role: "DCO" | "ASSISTANT";
    confirmed: boolean | null;
  }[];
};

type Team = {
  id: string;
  name: string;
  shortName?: string | null;
  isActive?: boolean;
};

type Official = {
  id: string;
  active: boolean;
  operationalRole?: string | null;
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

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};


type ScaleSummary = {
  activeScaleGroups: number;
  doneScaleGroups: number;
  pendingScales: number;
  refusedScales: number;
  confirmedScales: number;
  confirmedActiveScales?: number;
  confirmedDoneScales?: number;
  scalesWithoutMissionOrder: number;
};


const initialPagination: Pagination = {
  page: 1,
  limit: 0,
  total: 0,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

const initialSummary: ScaleSummary = {
  activeScaleGroups: 0,
  doneScaleGroups: 0,
  pendingScales: 0,
  refusedScales: 0,
  confirmedScales: 0,
  confirmedActiveScales: 0,
  confirmedDoneScales: 0,
  scalesWithoutMissionOrder: 0,
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
  const [teams, setTeams] = useState<Team[]>([]);
  const [expandedTeamKey, setExpandedTeamKey] = useState<string | null>(null);
  const [expandedOfficialKey, setExpandedOfficialKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [scaleStatusFilter, setScaleStatusFilter] = useState("");
  const [championshipFilter, setChampionshipFilter] = useState("");
  const [scaleTab, setScaleTab] = useState<"ACTIVE" | "DONE">("ACTIVE");
  const [scaleGroups, setScaleGroups] = useState<ScaleGroup[]>([]);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [summary, setSummary] = useState<ScaleSummary>(initialSummary);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState("");
  const [dcoOfficialId, setDcoOfficialId] = useState("");
  const [assistantOfficialId, setAssistantOfficialId] = useState("");
  const [modal, setModal] = useState<ModalState>(initialModalState);

  const user = getUser();

  const userRole = String(user?.role || user?.user?.role || "").toUpperCase();

  const loggedUserId = user?.id || user?.sub || user?.userId || user?.user?.id;

  const loggedUserEmail = user?.email || user?.user?.email;

  const loggedUserName = user?.name || user?.user?.name;

  const isAdmin = ["ADMIN", "ADM", "COORDINATOR"].includes(userRole);

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
    try {
      setListLoading(true);
      setListError("");

      const response = await api.get("/match-officials/groups", {
        params: {
          tab: scaleTab,
          status: scaleStatusFilter || undefined,
          championship: championshipFilter || undefined,
          search: search.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });

      const groups: ScaleGroup[] = response.data?.data || [];

      setScaleGroups(groups);
      setPagination(response.data?.pagination || initialPagination);
      setSummary(response.data?.summary || initialSummary);

      setScales(
        groups.flatMap((group) =>
          [group.dco, group.assistant].filter(Boolean) as Scale[],
        ),
      );
    } catch (error: any) {
      setListError(
        getErrorMessage(
          error,
          "Não foi possível carregar a lista de escalas.",
        ),
      );
      setScaleGroups([]);
      setScales([]);
      setPagination(initialPagination);
      setSummary(initialSummary);
    } finally {
      setListLoading(false);
    }
  }

  async function loadMatches() {
    const response = await api.get("/matches");
    setMatches(response.data);
  }

  async function loadOfficials() {
    const response = await api.get("/officials");
    setOfficials(response.data.filter((item: Official) => item.active));
  }

  async function loadTeams() {
    const response = await api.get("/teams");
    setTeams(
      response.data.filter((team: Team) => team.isActive !== false),
    );
  }

  useEffect(() => {
    loadMatches();
    loadOfficials();
    loadTeams();
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


  useEffect(() => {
    loadScales();
  }, [
    scaleTab,
    scaleStatusFilter,
    championshipFilter,
    search,
    startDate,
    endDate,
  ]);

  function normalizeIdentity(value?: string | null) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase("pt-BR");
  }

  function isOwnScale(scale?: Scale) {
    if (!scale) return false;

    const loggedUserIdentifiers = [
      loggedUserId,
      loggedUserEmail,
      loggedUserName,
      user?.officialId,
      user?.official?.id,
      user?.official?.user?.id,
      user?.official?.user?.email,
      user?.official?.user?.name,
      user?.user?.officialId,
      user?.user?.official?.id,
      user?.user?.official?.user?.id,
      user?.user?.official?.user?.email,
      user?.user?.official?.user?.name,
    ]
      .map((value) => normalizeIdentity(value))
      .filter(Boolean);

    const scaleIdentifiers = [
      scale.officialId,
      scale.official?.id,
      scale.official?.user?.id,
      scale.official?.user?.email,
      scale.official?.user?.name,
    ]
      .map((value) => normalizeIdentity(value))
      .filter(Boolean);

    return scaleIdentifiers.some((identifier) =>
      loggedUserIdentifiers.includes(identifier),
    );
  }

  function getScaleConfirmationState(scale?: Scale) {
    if (!scale) return "MISSING" as const;

    const value = scale.confirmed as boolean | string | null | undefined;

    if (
      value === true ||
      String(value).trim().toUpperCase() === "TRUE" ||
      String(value).trim().toUpperCase() === "CONFIRMED"
    ) {
      return "CONFIRMED" as const;
    }

    if (
      value === false ||
      String(value).trim().toUpperCase() === "FALSE" ||
      String(value).trim().toUpperCase() === "REFUSED"
    ) {
      return "REFUSED" as const;
    }

    return "PENDING" as const;
  }

  function canConfirmScale(scale?: Scale) {
    if (!scale) return false;

    // ADMIN/ADM/COORDINATOR podem responder qualquer escala.
    if (isAdmin) return true;

    // DCO e Oficial podem responder somente a própria escala.
    return isOwnScale(scale);
  }

  function canRespondScale(scale?: Scale) {
    if (!scale) return false;

    // Os botões aparecem somente enquanto a escala estiver pendente.
    if (getScaleConfirmationState(scale) !== "PENDING") {
      return false;
    }

    return canConfirmScale(scale);
  }

  function hasMissionOrder(match?: Match | null) {
    return Boolean(
      match?.missionOrderFileData ||
        match?.missionOrderFileName ||
        match?.missionOrderFileType,
    );
  }

  function hasAnyOfficialAssociated(match: Match) {
    return Boolean(
      match.officials?.some(
        (official) =>
          official.role === "DCO" ||
          official.role === "ASSISTANT",
      ),
    );
  }

  function getTeamShortName(teamName: string) {
    const normalizedName = String(teamName || "").trim();
    const team = teams.find(
      (item) =>
        item.name.trim().toLocaleLowerCase("pt-BR") ===
        normalizedName.toLocaleLowerCase("pt-BR"),
    );

    const configuredShortName = String(team?.shortName || "").trim();

    if (configuredShortName) {
      return configuredShortName.toUpperCase();
    }

    return normalizedName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 3)
      .toUpperCase();
  }

  function getFirstName(fullName: string) {
    const normalizedName = String(fullName || "").trim();

    if (!normalizedName) return "Não escalado";

    return normalizedName.split(/\s+/)[0];
  }

  function renderTeamName(
    teamName: string,
    key: string,
    size: "desktop" | "mobile" = "desktop",
  ) {
    const isExpanded = expandedTeamKey === key;
    const shortName = getTeamShortName(teamName);

    return (
      <button
        type="button"
        onClick={() =>
          setExpandedTeamKey((current) => (current === key ? null : key))
        }
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Mostrar nome curto de" : "Mostrar nome completo de"} ${teamName}`}
        title={isExpanded ? "Voltar para o nome curto" : `Mostrar ${teamName}`}
        className={`inline-flex max-w-full items-center rounded-lg border border-blue-100 bg-blue-50 font-black text-[var(--cdb-blue)] underline decoration-dotted underline-offset-4 transition hover:border-blue-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
          size === "mobile"
            ? "px-3 py-1.5 text-xl"
            : "px-2 py-1 text-base"
        } ${isExpanded ? "whitespace-normal text-left leading-snug" : "whitespace-nowrap"}`}
      >
        {isExpanded ? teamName : shortName}
      </button>
    );
  }

  function renderOfficialName(scale: Scale | undefined, key: string) {
    if (!scale) {
      return <span className="text-sm text-slate-400">Não escalado</span>;
    }

    const fullName = scale.official.user.name;
    const firstName = getFirstName(fullName);
    const isExpanded = expandedOfficialKey === key;
    const canExpand = firstName !== fullName;

    return (
      <button
        type="button"
        onClick={() => {
          if (!canExpand) return;
          setExpandedOfficialKey((current) => (current === key ? null : key));
        }}
        aria-expanded={isExpanded}
        title={isExpanded ? "Mostrar primeiro nome" : fullName}
        className={`break-words text-left font-black leading-tight text-slate-900 ${
          canExpand
            ? "cursor-pointer underline decoration-dotted underline-offset-4 transition hover:text-[var(--cdb-blue)] focus:outline-none focus:ring-2 focus:ring-blue-100"
            : "cursor-default"
        }`}
      >
        {isExpanded ? fullName : firstName}
      </button>
    );
  }

  const groupedScales = scaleGroups;

  const championshipOptions = useMemo(() => {
    const names = matches
      .map((match) => match.championship?.name?.trim())
      .filter((name): name is string => Boolean(name));

    return Array.from(new Set(names)).sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
  }, [matches]);

  const filteredGroups = useMemo(() => {
    if (!championshipFilter) return groupedScales;

    return groupedScales.filter(
      (group) =>
        group.match.championship?.name?.trim() === championshipFilter,
    );
  }, [groupedScales, championshipFilter]);

  const groupedFilteredGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        id: string;
        name: string;
        groups: ScaleGroup[];
        visibleGroups: ScaleGroup[];
        page: number;
        total: number;
        totalPages: number;
      }
    >();

    filteredGroups.forEach((group) => {
      const championshipName =
        group.match.championship?.name?.trim() || "Sem campeonato";
      const championshipId = championshipName.toLocaleLowerCase("pt-BR");
      const currentGroup = groups.get(championshipId);

      if (currentGroup) {
        currentGroup.groups.push(group);
        currentGroup.visibleGroups.push(group);
        currentGroup.total += 1;
        return;
      }

      groups.set(championshipId, {
        id: championshipId,
        name: championshipName,
        groups: [group],
        visibleGroups: [group],
        page: 1,
        total: 1,
        totalPages: 1,
      });
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    );
  }, [filteredGroups]);

  const activeScaleGroups = summary.activeScaleGroups;
  const doneScaleGroups = summary.doneScaleGroups;
  const pendingScalesCount = summary.pendingScales;
  const refusedScalesCount = summary.refusedScales;
  const confirmedScalesCount =
    scaleTab === "DONE"
      ? summary.confirmedDoneScales ?? summary.confirmedScales
      : summary.confirmedActiveScales ?? summary.confirmedScales;
  const scalesWithoutMissionOrderCount = summary.scalesWithoutMissionOrder;

  const dcoOptions = useMemo(() => {
    return officials
      .filter(
        (official) =>
          official.active !== false &&
          String(official.operationalRole || "")
            .trim()
            .toUpperCase() === "DCO",
      )
      .sort((a, b) =>
        a.user.name.localeCompare(b.user.name, "pt-BR", {
          sensitivity: "base",
        }),
      );
  }, [officials]);

  const assistantOptions = useMemo(() => {
    return officials
      .filter((official) => official.active !== false)
      .sort((a, b) =>
        a.user.name.localeCompare(b.user.name, "pt-BR", {
          sensitivity: "base",
        }),
      );
  }, [officials]);

  const availableMatches = useMemo(() => {
    return matches
      .filter((match) => {
        if (editingMatchId === match.id) {
          return true;
        }

        if (match.status === "CONTROL_DONE" || match.status === "CANCELED") {
          return false;
        }

        return !hasAnyOfficialAssociated(match);
      })
      .sort(
        (a, b) =>
          new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
      );
  }, [matches, editingMatchId]);

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
    const state = getScaleConfirmationState(scale);

    if (state === "MISSING") return "Não escalado";
    if (state === "CONFIRMED") return "Confirmado";
    if (state === "REFUSED") return "Recusado";

    return "Pendente";
  }

  function getStatusClass(scale?: Scale) {
    const state = getScaleConfirmationState(scale);

    if (state === "MISSING") {
      return "bg-slate-100 text-slate-600 border border-slate-200";
    }

    if (state === "CONFIRMED") {
      return "bg-green-100 text-green-700 border border-green-200";
    }

    if (state === "REFUSED") {
      return "bg-red-100 text-red-700 border border-red-200";
    }

    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  }

  function renderScaleStatus(
    scale?: Scale,
    className = "shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-bold leading-none",
  ) {
    const baseClassName = `${getStatusClass(scale)} ${className}`;

    return (
      <span className={baseClassName}>
        {getStatus(scale)}
      </span>
    );
  }

  function renderScaleConfirmation(
    scale: Scale | undefined,
    roleLabel: "DCO" | "OF",
    compact = false,
  ) {
    const state = getScaleConfirmationState(scale);

    const wrapperClass = compact
      ? "flex min-h-8 flex-wrap items-center gap-2"
      : "flex min-h-8 min-w-[220px] flex-wrap items-center gap-2";

    const roleClass =
      "inline-flex w-9 shrink-0 items-center text-[10px] font-black uppercase tracking-[0.12em] text-slate-400";

    if (state === "MISSING") {
      return (
        <div className={wrapperClass}>
          <span className={roleClass}>{roleLabel}</span>
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
            Não escalado
          </span>
        </div>
      );
    }

    if (state === "CONFIRMED") {
      return (
        <div className={wrapperClass}>
          <span className={roleClass}>{roleLabel}</span>
          {renderScaleStatus(
            scale,
            "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black",
          )}
        </div>
      );
    }

    if (state === "REFUSED") {
      return (
        <div className={wrapperClass}>
          <span className={roleClass}>{roleLabel}</span>
          {renderScaleStatus(
            scale,
            "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black",
          )}
        </div>
      );
    }

    if (!canRespondScale(scale)) {
      return (
        <div className={wrapperClass}>
          <span className={roleClass}>{roleLabel}</span>
          {renderScaleStatus(
            scale,
            "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black",
          )}
        </div>
      );
    }

    return (
      <div className={wrapperClass}>
        <span className={roleClass}>{roleLabel}</span>

        <button
          type="button"
          onClick={() => confirmScale(scale)}
          className="inline-flex items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
        >
          Aceitar
        </button>

        <button
          type="button"
          onClick={() => refuseScale(scale)}
          className="inline-flex items-center justify-center rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-100"
        >
          Recusar
        </button>

        {canResendScaleNotification(scale) && (
          <button
            type="button"
            onClick={() => resendScaleNotification(scale)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-sm text-[var(--cdb-blue)] transition hover:bg-blue-100"
            title="Reenviar notificação push"
            aria-label={`Reenviar notificação push para ${
              scale?.official?.user?.name || "o oficial"
            }`}
          >
            🔔
          </button>
        )}
      </div>
    );
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

  function canResendScaleNotification(scale?: Scale) {
    return (
      isAdmin &&
      Boolean(scale) &&
      getScaleConfirmationState(scale) === "PENDING"
    );
  }

  async function resendScaleNotification(scale?: Scale) {
    if (!scale) return;

    const roleLabel = scale.role === "DCO" ? "DCO" : "Assistente";
    const officialName = scale.official?.user?.name || "este oficial";

    showConfirm({
      title: "Reenviar notificação de escala pendente",
      message: `Deseja enviar novamente uma notificação push para ${officialName} confirmar esta escala como ${roleLabel}?`,
      variant: "warning",
      confirmText: "Reenviar notificação",
      onConfirm: async () => {
        try {
          await api.post(`/match-officials/${scale.id}/resend-notification`);

          showMessage(
            "Notificação reenviada",
            "A notificação push foi reenviada com sucesso.",
            "success",
          );
        } catch (error: any) {
          showMessage(
            "Erro ao reenviar notificação",
            getErrorMessage(error, "Não foi possível reenviar a notificação."),
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
              {scaleTab === "DONE" ? doneScaleGroups : activeScaleGroups} jogos escalados
            </div>
          </div>
        </header>

        <section className="w-full max-w-full overflow-x-hidden p-4 lg:p-8">
          <div
            className={`mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-8 ${
              isAdmin ? "xl:grid-cols-3" : "xl:grid-cols-2"
            }`}
          >
            <button
              type="button"
              onClick={() => setScaleStatusFilter("PENDING")}
              className={`rounded-3xl p-5 lg:p-6 shadow-sm border transition hover:shadow-md text-left ${
                pendingScalesCount > 0
                  ? "bg-[var(--cdb-yellow-soft)] border-yellow-200"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      pendingScalesCount > 0
                        ? "text-[#9A7600]"
                        : "text-slate-500"
                    }`}
                  >
                    Escalas pendentes
                  </p>

                  <h2
                    className={`text-3xl lg:text-4xl font-black mt-2 ${
                      pendingScalesCount > 0
                        ? "text-[#9A7600]"
                        : "text-slate-700"
                    }`}
                  >
                    {pendingScalesCount}
                  </h2>

                  <p className="text-xs text-slate-500 mt-2">
                    {isAdmin
                      ? "Todas pendentes de confirmação"
                      : "Minhas pendentes de confirmação"}
                  </p>
                </div>

                <div
                  className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                    pendingScalesCount > 0
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
                  refusedScalesCount > 0
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        refusedScalesCount > 0
                          ? "text-red-700"
                          : "text-slate-500"
                      }`}
                    >
                      Escalas recusadas
                    </p>

                    <h2
                      className={`text-3xl lg:text-4xl font-black mt-2 ${
                        refusedScalesCount > 0
                          ? "text-red-700"
                          : "text-slate-700"
                      }`}
                    >
                      {refusedScalesCount}
                    </h2>

                    <p className="text-xs text-slate-500 mt-2">
                      Clique para ver recusadas
                    </p>
                  </div>

                  <div
                    className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-3xl ${
                      refusedScalesCount > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    ⚠️
                  </div>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setScaleStatusFilter("CONFIRMED");
              }}
              className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-200 transition hover:shadow-md text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">
                    {scaleTab === "DONE"
                      ? "Confirmadas em jogos concluídos"
                      : "Confirmadas em jogos ativos"}
                  </p>

                  <h2 className="text-3xl lg:text-4xl font-black mt-2 text-[var(--cdb-green)]">
                    {confirmedScalesCount}
                  </h2>

                  <p className="text-xs text-slate-500 mt-2">
                    {scaleTab === "DONE"
                      ? "Escalas confirmadas de jogos finalizados"
                      : "Escalas confirmadas de jogos ainda ativos"}
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
                    São listados apenas jogos ativos sem DCO ou Assistente associado.
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
                    <option value="">DCO obrigatorio</option>

                    {dcoOptions.map((official) => (
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

                    {assistantOptions.map((official) => (
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setScaleTab("ACTIVE");
                  }}
                  className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                    scaleTab === "ACTIVE"
                      ? "bg-[var(--cdb-blue)] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-[var(--cdb-blue)] hover:bg-[var(--cdb-blue-soft)]"
                  }`}
                >
                  Escalas de jogos ativos ({activeScaleGroups})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setScaleTab("DONE");
                  }}
                  className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                    scaleTab === "DONE"
                      ? "bg-[var(--cdb-green)] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-[var(--cdb-blue)] hover:bg-[var(--cdb-blue-soft)]"
                  }`}
                >
                  Escalas de jogos concluídos ({doneScaleGroups})
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Data início
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Data fim
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Status da escala
                  </label>
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
                </div>

                <div className="xl:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Campeonato
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    value={championshipFilter}
                    onChange={(e) => setChampionshipFilter(e.target.value)}
                  >
                    <option value="">Todos os campeonatos</option>
                    {championshipOptions.map((championship) => (
                      <option key={championship} value={championship}>
                        {championship}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Buscar
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    placeholder="Jogo, estádio ou oficial"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {(startDate ||
                  endDate ||
                  search ||
                  scaleStatusFilter ||
                  championshipFilter) && (
                  <div className="xl:col-span-6">
                    <button
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                        setSearch("");
                        setScaleStatusFilter("");
                        setChampionshipFilter("");
                      }}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>
            </div>

            {listError && (
              <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {listError}
              </div>
            )}

            {listLoading && (
              <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-[var(--cdb-blue)]">
                Atualizando lista de escalas...
              </div>
            )}

            <div className="space-y-5 lg:hidden">
              {groupedFilteredGroups.map((championshipGroup) => (
                <section
                  key={championshipGroup.id}
                  className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-blue-50 px-5 py-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                        Competição
                      </p>
                      <h3 className="mt-1 text-lg font-black text-[var(--cdb-blue)]">
                        {championshipGroup.name}
                      </h3>
                    </div>
                    <span className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-black text-[var(--cdb-blue)]">
                      {championshipGroup.groups.length} escala{championshipGroup.groups.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="space-y-4 p-4">
              {championshipGroup.visibleGroups.map((group) => (
                <div
                  key={group.match.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--cdb-blue)]">
                      {group.match.championship.name}
                    </p>

                    <h3 className="mt-1 text-xl font-black text-[var(--cdb-dark)]">
                      {renderTeamName(
                        group.match.homeTeam,
                        `${group.match.id}-mobile-home`,
                        "mobile",
                      )}{" "}
                      x{" "}
                      {renderTeamName(
                        group.match.awayTeam,
                        `${group.match.id}-mobile-away`,
                        "mobile",
                      )}
                    </h3>

                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <p className="text-slate-500">Local</p>
                      <strong className="mt-1 block text-[var(--cdb-dark)]">
                        🏟️ {group.match.stadium.name}
                      </strong>
                      <span className="mt-1 block text-xs font-semibold text-slate-500">
                        {group.match.stadium.city}/{group.match.stadium.state}
                      </span>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <p className="text-slate-500">Data/Hora</p>
                      <strong className="mt-1 block text-[var(--cdb-dark)]">
                        {new Date(group.match.matchDate).toLocaleDateString(
                          "pt-BR",
                        )}
                      </strong>
                      <span className="mt-1 block text-xs font-black text-[var(--cdb-blue)]">
                        ⏰{" "}
                        {new Date(group.match.matchDate).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                      Oficiais da escala
                    </p>

                    <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <div className="flex min-h-8 min-w-0 items-center gap-2">
                        <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-[var(--cdb-blue)]">
                          DCO
                        </span>
                        <div className="min-w-0">
                          {renderOfficialName(
                            group.dco,
                            `${group.match.id}-mobile-dco`,
                          )}
                        </div>
                      </div>

                      <div className="flex min-h-8 min-w-0 items-center gap-2">
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-700">
                          OF
                        </span>
                        <div className="min-w-0">
                          {renderOfficialName(
                            group.assistant,
                            `${group.match.id}-mobile-assistant`,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Status e confirmação
                    </p>

                    <div className="space-y-3">
                      {renderScaleConfirmation(group.dco, "DCO", true)}
                      {renderScaleConfirmation(group.assistant, "OF", true)}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => startEdit(group)}
                        className="inline-flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm font-black text-[var(--cdb-blue)] transition hover:bg-blue-100"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => deleteFullScale(group)}
                        className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-black text-red-700 transition hover:bg-red-100"
                      >
                        Excluir
                      </button>
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
                </section>
              ))}
            </div>

            <div className="hidden space-y-5 lg:block">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Todos os campeonatos
                </p>
                <h3 className="mt-1 text-xl font-black text-[var(--cdb-dark)]">
                  Escalas agrupadas por competição
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {filteredGroups.length} jogo{filteredGroups.length === 1 ? "" : "s"} em {groupedFilteredGroups.length} {groupedFilteredGroups.length === 1 ? "competição" : "competições"}.
                </p>
              </div>

              {groupedFilteredGroups.map((championshipGroup) => (
                <section
                  key={championshipGroup.id}
                  className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-blue-100 bg-blue-50 px-5 py-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                        Competição
                      </p>
                      <h3 className="mt-1 text-xl font-black text-[var(--cdb-blue)]">
                        {championshipGroup.name}
                      </h3>
                    </div>
                    <span className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-black text-[var(--cdb-blue)]">
                      {championshipGroup.groups.length} escala{championshipGroup.groups.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="max-w-full overflow-x-auto px-5">
              <table className={`${isAdmin ? "min-w-[1180px]" : "min-w-[1080px]"} w-full table-fixed border-collapse`}>
                <thead>
                  <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                    <th className={`${isAdmin ? "w-[18%]" : "w-[20%]"} py-4 pr-4 font-black`}>
                      Jogo
                    </th>
                    <th className={`${isAdmin ? "w-[20%]" : "w-[23%]"} py-4 pr-4 font-black`}>
                      Local
                    </th>
                    <th className={`${isAdmin ? "w-[12%]" : "w-[13%]"} py-4 pr-4 font-black`}>
                      Data/Hora
                    </th>
                    <th className={`${isAdmin ? "w-[20%]" : "w-[22%]"} py-4 pr-4 font-black`}>
                      Oficiais da escala
                    </th>
                    <th className={`${isAdmin ? "w-[20%]" : "w-[22%]"} py-4 pr-4 font-black`}>
                      Status e confirmação
                    </th>
                    {isAdmin && (
                      <th className="w-[10%] py-4 font-black">Ações</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {championshipGroup.visibleGroups.map((group) => (
                    <tr
                      key={group.match.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="py-5 pr-4 align-top">
                        <div className="font-black text-[var(--cdb-dark)]">
                          {renderTeamName(
                            group.match.homeTeam,
                            `${group.match.id}-desktop-home`,
                          )}{" "}
                          x{" "}
                          {renderTeamName(
                            group.match.awayTeam,
                            `${group.match.id}-desktop-away`,
                          )}
                        </div>
                      </td>


                      <td className="py-5 pr-4 align-top">
                        <div className="min-w-[210px]">
                          <div className="flex min-h-8 items-start font-black leading-snug text-[var(--cdb-dark)]">
                            🏟️ {group.match.stadium.name}
                          </div>
                          <div className="mt-2 min-h-5 text-xs font-semibold text-slate-500">
                            {group.match.stadium.city}/{group.match.stadium.state}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap py-5 pr-4 align-top">
                        <div className="flex min-h-8 items-start font-black text-[var(--cdb-dark)]">
                          {new Date(group.match.matchDate).toLocaleDateString(
                            "pt-BR",
                          )}
                        </div>
                        <div className="mt-2 min-h-5 text-xs font-black text-[var(--cdb-blue)]">
                          ⏰{" "}
                          {new Date(group.match.matchDate).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </td>

                      <td className="py-5 pr-4 align-top">
                        <div className="flex min-w-[230px] flex-col items-start gap-2 text-sm">
                          <div className="flex min-h-8 min-w-0 items-center gap-2">
                            <span className="inline-flex w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-[var(--cdb-blue)]">
                              DCO
                            </span>
                            <div className="min-w-0">
                              {renderOfficialName(
                                group.dco,
                                `${group.match.id}-desktop-dco`,
                              )}
                            </div>
                          </div>

                          <div className="flex min-h-8 min-w-0 items-center gap-2">
                            <span className="inline-flex w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-700">
                              OF
                            </span>
                            <div className="min-w-0">
                              {renderOfficialName(
                                group.assistant,
                                `${group.match.id}-desktop-assistant`,
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-5 pr-4 align-top">
                        <div className="flex min-w-[250px] flex-col gap-2">
                          {renderScaleConfirmation(group.dco, "DCO")}
                          {renderScaleConfirmation(group.assistant, "OF")}
                        </div>
                      </td>

                      {isAdmin && (
                        <td className="py-5 align-top">
                          <div className="flex w-full min-w-[96px] max-w-[110px] flex-col items-stretch gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(group)}
                              className="inline-flex w-full items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-[var(--cdb-blue)] transition hover:bg-blue-100"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteFullScale(group)}
                              className="inline-flex w-full items-center justify-center rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
                  </div>
                </section>
              ))}
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
