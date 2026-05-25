"use client";

import { useEffect, useMemo, useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

type UserRole = "ADMIN" | "COORDINATOR" | "OFFICIAL";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type Official = {
  id: string;
  user?: {
    name: string;
    email: string;
  };
};

type KitStatus =
  | "DISPONIVEL"
  | "COM_DCO"
  | "VINCULADO_JOGO"
  | "UTILIZADO"
  | "CANCELADO";

type Kit = {
  id: string;
  number: string;
  status: KitStatus;
  currentOfficial?: {
    id: string;
    user?: {
      name: string;
      email: string;
    };
  } | null;
  matchKits?: {
    match?: {
      id: string;
      homeTeam: string;
      awayTeam: string;
      matchDate: string;
      status: string;
    };
  }[];
};

type InventorySummary = {
  total: number;
  disponivel: number;
  comDco: number;
  vinculadoJogo: number;
  utilizado: number;
  cancelado: number;
  byDco: {
    officialId: string;
    name: string;
    email: string;
    total: number;
    kits: {
      id: string;
      number: string;
      status: KitStatus;
    }[];
  }[];
};

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant?: "danger" | "success" | "warning" | "default";
  confirmText?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

const statusLabel: Record<KitStatus, string> = {
  DISPONIVEL: "Disponível",
  COM_DCO: "Com DCO",
  VINCULADO_JOGO: "Vinculado ao jogo",
  UTILIZADO: "Utilizado",
  CANCELADO: "Cancelado",
};

const statusClass: Record<KitStatus, string> = {
  DISPONIVEL: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COM_DCO: "bg-blue-50 text-blue-700 border-blue-200",
  VINCULADO_JOGO: "bg-amber-50 text-amber-700 border-amber-200",
  UTILIZADO: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELADO: "bg-red-50 text-red-700 border-red-200",
};

export default function InventoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [kits, setKits] = useState<Kit[]>([]);
  const [availableKits, setAvailableKits] = useState<Kit[]>([]);
  const [myKits, setMyKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingEntry, setSavingEntry] = useState(false);
  const [savingTransfer, setSavingTransfer] = useState(false);
  const [entryMode, setEntryMode] = useState<"batch" | "single">("batch");
  const [transferMode, setTransferMode] = useState<
    "selected" | "batch" | "single"
  >("selected");

  const [entryForm, setEntryForm] = useState({
    quantity: "",
    initialNumber: "",
    finalNumber: "",
    singleNumber: "",
    notes: "",
  });

  const [transferForm, setTransferForm] = useState({
    officialId: "",
    initialNumber: "",
    finalNumber: "",
    singleNumber: "",
    notes: "",
  });
  const [selectedTransferKitNumbers, setSelectedTransferKitNumbers] = useState<
    string[]
  >([]);

  const [filters, setFilters] = useState({
    status: "",
    officialId: "",
    number: "",
  });
  const [myKitsView, setMyKitsView] = useState<"COM_DCO" | "UTILIZADO">(
    "COM_DCO",
  );

  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: "",
    message: "",
    variant: "default",
  });

  const isAdmin = user?.role === "ADMIN";

  function closeModal() {
    setModal((current) => ({ ...current, open: false }));
  }

  function showModal(data: Omit<ModalState, "open">) {
    setModal({
      open: true,
      ...data,
    });
  }

  function getToken() {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("authToken")
    );
  }

  async function apiFetch(path: string, options?: RequestInit) {
    const token = getToken();

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Erro ao comunicar com a API.");
    }

    return response.json();
  }

  async function loadUser() {
    const me = await apiFetch("/auth/me");
    setUser(me);
    return me as User;
  }

  async function loadSummary() {
    const data = await apiFetch("/inventory/summary");
    setSummary(data);
  }

  async function loadKits() {
    const params = new URLSearchParams();

    if (filters.status) params.set("status", filters.status);
    if (filters.officialId) params.set("officialId", filters.officialId);
    if (filters.number) params.set("number", filters.number);

    const queryString = params.toString();
    const data = await apiFetch(
      `/inventory/kits${queryString ? `?${queryString}` : ""}`,
    );

    setKits(data);
  }

  async function loadAvailableKits() {
    const data = await apiFetch("/inventory/kits?status=DISPONIVEL");
    setAvailableKits(data);
  }

  async function loadMyKits() {
    const data = await apiFetch("/inventory/kits/my");
    setMyKits(data);
  }

  async function loadOfficials() {
    const data = await apiFetch("/officials");
    setOfficials(data);
  }

  async function loadPage() {
    try {
      setLoading(true);

      const currentUser = await loadUser();

      await Promise.all([
        loadSummary(),
        currentUser.role === "ADMIN" ? loadKits() : loadMyKits(),
        currentUser.role === "ADMIN" ? loadAvailableKits() : Promise.resolve(),
        currentUser.role === "ADMIN" ? loadOfficials() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error(error);

      showModal({
        title: "Erro ao carregar estoque",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do estoque.",
        variant: "danger",
        confirmText: "Fechar",
      });
    } finally {
      setLoading(false);
    }
  }

  async function refreshData() {
    await Promise.all([
      loadSummary(),
      isAdmin ? loadKits() : loadMyKits(),
      isAdmin ? loadAvailableKits() : Promise.resolve(),
    ]);
  }

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload =
      entryMode === "single"
        ? {
            quantity: 1,
            initialNumber: entryForm.singleNumber.trim(),
            finalNumber: entryForm.singleNumber.trim(),
            notes: entryForm.notes,
          }
        : {
            quantity: Number(entryForm.quantity),
            initialNumber: entryForm.initialNumber.trim(),
            finalNumber: entryForm.finalNumber.trim(),
            notes: entryForm.notes,
          };

    if (
      entryMode === "single"
        ? !payload.initialNumber
        : !entryForm.quantity || !payload.initialNumber || !payload.finalNumber
    ) {
      showModal({
        title: "Campos obrigatórios",
        message:
          entryMode === "single"
            ? "Informe o número do kit."
            : "Preencha quantidade, número inicial e número final.",
        variant: "warning",
        confirmText: "Fechar",
      });
      return;
    }

    try {
      setSavingEntry(true);

      const result = await apiFetch("/inventory/entries", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setEntryForm({
        quantity: "",
        initialNumber: "",
        finalNumber: "",
        singleNumber: "",
        notes: "",
      });

      await refreshData();

      showModal({
        title: "Entrada cadastrada",
        message:
          result?.message ||
          "A entrada de kits foi cadastrada com sucesso no estoque.",
        variant: "success",
        confirmText: "Fechar",
      });
    } catch (error) {
      console.error(error);

      showModal({
        title: "Erro ao cadastrar entrada",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar a entrada de kits.",
        variant: "danger",
        confirmText: "Fechar",
      });
    } finally {
      setSavingEntry(false);
    }
  }

  async function handleTransfer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload =
      transferMode === "selected"
        ? {
            officialId: transferForm.officialId,
            kitNumbers: selectedTransferKitNumbers,
            notes: transferForm.notes,
          }
        : transferMode === "single"
          ? {
              officialId: transferForm.officialId,
              initialNumber: transferForm.singleNumber.trim(),
              finalNumber: transferForm.singleNumber.trim(),
              notes: transferForm.notes,
            }
          : {
              officialId: transferForm.officialId,
              initialNumber: transferForm.initialNumber.trim(),
              finalNumber: transferForm.finalNumber.trim(),
              notes: transferForm.notes,
            };

    if (
      !payload.officialId ||
      (transferMode === "selected"
        ? selectedTransferKitNumbers.length === 0
        : transferMode === "single"
          ? !("initialNumber" in payload) || !payload.initialNumber
          : !("initialNumber" in payload) ||
            !payload.initialNumber ||
            !payload.finalNumber)
    ) {
      showModal({
        title: "Campos obrigatórios",
        message:
          transferMode === "selected"
            ? "Selecione o DCO e pelo menos um kit disponível."
            : transferMode === "single"
              ? "Selecione o DCO e informe o número do kit."
              : "Selecione o DCO e informe o número inicial e final dos kits.",
        variant: "warning",
        confirmText: "Fechar",
      });
      return;
    }

    try {
      setSavingTransfer(true);

      const result = await apiFetch("/inventory/transfers", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setTransferForm({
        officialId: "",
        initialNumber: "",
        finalNumber: "",
        singleNumber: "",
        notes: "",
      });
      setSelectedTransferKitNumbers([]);

      await refreshData();

      showModal({
        title: "Repasse realizado",
        message:
          result?.message || "Os kits foram repassados para o DCO com sucesso.",
        variant: "success",
        confirmText: "Fechar",
      });
    } catch (error) {
      console.error(error);

      showModal({
        title: "Erro ao repassar kits",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível repassar os kits para o DCO.",
        variant: "danger",
        confirmText: "Fechar",
      });
    } finally {
      setSavingTransfer(false);
    }
  }

  function toggleTransferKit(number: string) {
    setSelectedTransferKitNumbers((current) =>
      current.includes(number)
        ? current.filter((item) => item !== number)
        : [...current, number],
    );
  }

  async function handleFilter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      await loadKits();
    } catch (error) {
      console.error(error);

      showModal({
        title: "Erro ao filtrar kits",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível filtrar os kits.",
        variant: "danger",
        confirmText: "Fechar",
      });
    } finally {
      setLoading(false);
    }
  }

  const dcoOptions = useMemo(() => {
    return officials.filter((official) => Boolean(official.user));
  }, [officials]);

  const availableStockKits = useMemo(() => {
    return availableKits
      .filter((kit) => kit.status === "DISPONIVEL")
      .sort((a, b) => a.number.localeCompare(b.number));
  }, [availableKits]);

  const myKitsComDco = myKits.filter((kit) => kit.status === "COM_DCO");
  const myKitsUtilizados = myKits.filter((kit) => kit.status === "UTILIZADO");
  const visibleKits = isAdmin
    ? kits
    : myKitsView === "COM_DCO"
      ? myKitsComDco
      : myKitsUtilizados;

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-4 py-5 lg:px-8 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--cdb-blue-soft)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                📦 Gestão de estoque
              </div>

              <h1 className="mt-3 text-3xl font-black text-[var(--cdb-dark)] lg:text-4xl">
                Estoque de Kits
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 lg:text-base">
                Gerencie entradas, repasses para DCOs e acompanhe a numeração
                disponível, em uso e utilizada nos controles.
              </p>
            </div>

            <div className="w-fit rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 font-bold text-white shadow-lg">
              {summary?.total ?? 0} kits cadastrados
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
          {isAdmin && (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Disponíveis"
                value={summary?.disponivel ?? 0}
                icon="✅"
              />
              <SummaryCard
                title="Com DCO"
                value={summary?.comDco ?? 0}
                icon="👤"
              />
              <SummaryCard
                title="Utilizados"
                value={summary?.utilizado ?? 0}
                icon="🧪"
              />
              <SummaryCard
                title="Cancelados"
                value={summary?.cancelado ?? 0}
                icon="🚫"
              />
            </section>
          )}

          {isAdmin && (
            <section className="grid gap-6 xl:grid-cols-2">
              <form
                onSubmit={handleCreateEntry}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5">
                  <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                    Entrada de kits
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Informe a quantidade e a sequência recebida para inserir os
                    kits automaticamente no estoque.
                  </p>
                </div>

                <ModeToggle
                  value={entryMode}
                  onChange={setEntryMode}
                  batchLabel="Entrada por lote"
                  singleLabel="Kit unitário"
                />

                {entryMode === "single" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldWithLabel label="Número do kit *">
                      <input
                        value={entryForm.singleNumber}
                        onChange={(event) =>
                          setEntryForm((current) => ({
                            ...current,
                            singleNumber: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                        placeholder="2001"
                      />
                    </FieldWithLabel>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[var(--cdb-blue)]">
                      <strong className="block font-black">
                        Entrada unitária
                      </strong>
                      <span className="mt-1 block text-xs font-semibold">
                        O sistema cadastra 1 kit usando o mesmo número como
                        inicial e final.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    <FieldWithLabel label="Quantidade *">
                      <input
                        type="number"
                        min="1"
                        value={entryForm.quantity}
                        onChange={(event) =>
                          setEntryForm((current) => ({
                            ...current,
                            quantity: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                        placeholder="100"
                      />
                    </FieldWithLabel>

                    <FieldWithLabel label="Número inicial *">
                      <input
                        value={entryForm.initialNumber}
                        onChange={(event) =>
                          setEntryForm((current) => ({
                            ...current,
                            initialNumber: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                        placeholder="2001"
                      />
                    </FieldWithLabel>

                    <FieldWithLabel label="Número final *">
                      <input
                        value={entryForm.finalNumber}
                        onChange={(event) =>
                          setEntryForm((current) => ({
                            ...current,
                            finalNumber: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                        placeholder="2100"
                      />
                    </FieldWithLabel>
                  </div>
                )}

                <div className="mt-4">
                  <FieldWithLabel label="Observação">
                    <textarea
                      value={entryForm.notes}
                      onChange={(event) =>
                        setEntryForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                      placeholder="Ex.: Kits recebidos da remessa do mês"
                    />
                  </FieldWithLabel>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingEntry}
                    className="rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingEntry ? "Cadastrando..." : "Cadastrar entrada"}
                  </button>
                </div>
              </form>

              <form
                onSubmit={handleTransfer}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5">
                  <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                    Repasse para DCO
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Repasses mudam os kits de disponível para responsabilidade
                    do DCO selecionado.
                  </p>
                </div>

                <TransferModeToggle
                  value={transferMode}
                  onChange={setTransferMode}
                />

                <div className="mb-4">
                  <FieldWithLabel label="DCO *">
                    <select
                      value={transferForm.officialId}
                      onChange={(event) =>
                        setTransferForm((current) => ({
                          ...current,
                          officialId: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Selecione</option>
                      {dcoOptions.map((official) => (
                        <option key={official.id} value={official.id}>
                          {official.user?.name}
                        </option>
                      ))}
                    </select>
                  </FieldWithLabel>
                </div>

                {transferMode === "selected" ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-[var(--cdb-dark)]">
                          Kits disponíveis para repasse
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Selecione exatamente os kits que serão repassados ao
                          DCO escolhido.
                        </p>
                      </div>

                      <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-[var(--cdb-blue)]">
                        {selectedTransferKitNumbers.length} selecionado(s)
                      </span>
                    </div>

                    {availableStockKits.length === 0 ? (
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm font-semibold text-slate-500">
                        Nenhum kit disponível para repasse.
                      </div>
                    ) : (
                      <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                        {availableStockKits.map((kit) => {
                          const checked = selectedTransferKitNumbers.includes(
                            kit.number,
                          );

                          return (
                            <button
                              key={kit.id}
                              type="button"
                              onClick={() => toggleTransferKit(kit.number)}
                              className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                                checked
                                  ? "border-[var(--cdb-blue)] bg-blue-50 text-[var(--cdb-blue)] shadow-sm"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                              }`}
                            >
                              <span className="flex items-center justify-between gap-3">
                                <span>Kit {kit.number}</span>
                                <span
                                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                                    checked
                                      ? "border-[var(--cdb-blue)] bg-[var(--cdb-blue)] text-white"
                                      : "border-slate-300 bg-white text-transparent"
                                  }`}
                                >
                                  ✓
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : transferMode === "single" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldWithLabel label="Número do kit *">
                      <input
                        value={transferForm.singleNumber}
                        onChange={(event) =>
                          setTransferForm((current) => ({
                            ...current,
                            singleNumber: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                        placeholder="2001"
                      />
                    </FieldWithLabel>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[var(--cdb-blue)]">
                      <strong className="block font-black">
                        Repasse unitário
                      </strong>
                      <span className="mt-1 block text-xs font-semibold">
                        Informe apenas um kit específico para repasse.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldWithLabel label="Número inicial *">
                      <input
                        value={transferForm.initialNumber}
                        onChange={(event) =>
                          setTransferForm((current) => ({
                            ...current,
                            initialNumber: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                        placeholder="2001"
                      />
                    </FieldWithLabel>

                    <FieldWithLabel label="Número final *">
                      <input
                        value={transferForm.finalNumber}
                        onChange={(event) =>
                          setTransferForm((current) => ({
                            ...current,
                            finalNumber: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                        placeholder="2010"
                      />
                    </FieldWithLabel>
                  </div>
                )}

                <div className="mt-4">
                  <FieldWithLabel label="Observação">
                    <textarea
                      value={transferForm.notes}
                      onChange={(event) =>
                        setTransferForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                      placeholder="Ex.: Repasse para jogos do fim de semana"
                    />
                  </FieldWithLabel>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingTransfer}
                    className="rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingTransfer ? "Repassando..." : "Repassar kits"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {isAdmin && summary?.byDco && summary.byDco.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                  Kits por DCO
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Veja a quantidade e numeração sob responsabilidade de cada
                  DCO.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {summary.byDco.map((item) => (
                  <div
                    key={item.officialId}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-black text-slate-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-slate-500">{item.email}</p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[var(--cdb-blue)]">
                        {item.total} kit(s)
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.kits.map((kit) => (
                        <span
                          key={kit.id}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700"
                        >
                          {kit.number}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                  {isAdmin ? "Lista de kits" : "Meus kits"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isAdmin
                    ? "Consulte kits por número, status ou DCO responsável."
                    : "Acompanhe os kits que estão com você e os kits já utilizados em controles."}
                </p>

                {!isAdmin && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setMyKitsView("COM_DCO")}
                      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                        myKitsView === "COM_DCO"
                          ? "border-[var(--cdb-blue)] bg-[var(--cdb-blue)] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Comigo para uso ({myKitsComDco.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setMyKitsView("UTILIZADO")}
                      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                        myKitsView === "UTILIZADO"
                          ? "border-[var(--cdb-blue)] bg-[var(--cdb-blue)] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Utilizados ({myKitsUtilizados.length})
                    </button>
                  </div>
                )}
              </div>

              {isAdmin && (
                <form
                  onSubmit={handleFilter}
                  className="grid gap-3 md:grid-cols-4"
                >
                  <input
                    value={filters.number}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        number: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                    placeholder="Número do kit"
                  />

                  <select
                    value={filters.status}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Todos os status</option>
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="COM_DCO">Com DCO</option>
                    <option value="UTILIZADO">Utilizado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>

                  <select
                    value={filters.officialId}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        officialId: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Todos os DCOs</option>
                    {dcoOptions.map((official) => (
                      <option key={official.id} value={official.id}>
                        {official.user?.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
                  >
                    Filtrar
                  </button>
                </form>
              )}
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                Carregando estoque...
              </div>
            ) : visibleKits.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                {isAdmin
                  ? "Nenhum kit encontrado."
                  : myKitsView === "COM_DCO"
                    ? "Você não possui kits com status Com DCO no momento."
                    : "Você ainda não possui kits utilizados."}
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-5 py-4 text-left font-black text-slate-700">
                          Número
                        </th>
                        <th className="px-5 py-4 text-left font-black text-slate-700">
                          Status
                        </th>
                        {isAdmin && (
                          <th className="px-5 py-4 text-left font-black text-slate-700">
                            DCO responsável
                          </th>
                        )}
                        <th className="px-5 py-4 text-left font-black text-slate-700">
                          Jogo
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">
                      {visibleKits.map((kit) => {
                        const lastMatch = kit.matchKits?.[0]?.match;

                        return (
                          <tr key={kit.id} className="hover:bg-slate-50">
                            <td className="px-5 py-4 font-black text-slate-900">
                              {kit.number}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                                  statusClass[kit.status]
                                }`}
                              >
                                {statusLabel[kit.status]}
                              </span>
                            </td>

                            {isAdmin && (
                              <td className="px-5 py-4 text-slate-600">
                                {kit.currentOfficial?.user?.name || "-"}
                              </td>
                            )}

                            <td className="px-5 py-4 text-slate-600">
                              {lastMatch ? (
                                <div className="space-y-1">
                                  <p className="font-semibold text-slate-700">
                                    {lastMatch.homeTeam} x {lastMatch.awayTeam}
                                  </p>

                                  <Link
                                    href={`/dashboard/matches/${lastMatch.id}`}
                                    className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-[var(--cdb-blue)] transition hover:bg-blue-100"
                                  >
                                    Ver jogo
                                  </Link>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
          </div>
        </section>

        <ConfirmModal
          open={modal.open}
          title={modal.title}
          message={modal.message}
          variant={modal.variant}
          confirmText={modal.confirmText}
          cancelText="Fechar"
          onCancel={closeModal}
        />
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black text-[var(--cdb-dark)]">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ModeToggle({
  value,
  onChange,
  batchLabel,
  singleLabel,
}: {
  value: "batch" | "single";
  onChange: (value: "batch" | "single") => void;
  batchLabel: string;
  singleLabel: string;
}) {
  return (
    <div className="mb-5 inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
      <button
        type="button"
        onClick={() => onChange("batch")}
        className={`rounded-xl px-4 py-2 text-sm font-black transition ${
          value === "batch"
            ? "bg-[var(--cdb-blue)] text-white shadow-sm"
            : "text-slate-600 hover:bg-white"
        }`}
      >
        {batchLabel}
      </button>

      <button
        type="button"
        onClick={() => onChange("single")}
        className={`rounded-xl px-4 py-2 text-sm font-black transition ${
          value === "single"
            ? "bg-[var(--cdb-blue)] text-white shadow-sm"
            : "text-slate-600 hover:bg-white"
        }`}
      >
        {singleLabel}
      </button>
    </div>
  );
}

function TransferModeToggle({
  value,
  onChange,
}: {
  value: "selected" | "batch" | "single";
  onChange: (value: "selected" | "batch" | "single") => void;
}) {
  const options: Array<{
    value: "selected" | "batch" | "single";
    label: string;
  }> = [
    { value: "selected", label: "Selecionar disponíveis" },
    { value: "batch", label: "Repasse por lote" },
    { value: "single", label: "Kit unitário" },
  ];

  return (
    <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-xl px-4 py-2 text-sm font-black transition ${
            value === option.value
              ? "bg-[var(--cdb-blue)] text-white shadow-sm"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function FieldWithLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      {children}
      <span className="mt-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
    </label>
  );
}
