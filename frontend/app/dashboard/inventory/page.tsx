"use client";

import { useEffect, useMemo, useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Sidebar } from "@/components/Sidebar";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const [myKits, setMyKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingEntry, setSavingEntry] = useState(false);
  const [savingTransfer, setSavingTransfer] = useState(false);

  const [entryForm, setEntryForm] = useState({
    quantity: "",
    initialNumber: "",
    finalNumber: "",
    notes: "",
  });

  const [transferForm, setTransferForm] = useState({
    officialId: "",
    initialNumber: "",
    finalNumber: "",
    notes: "",
  });

  const [filters, setFilters] = useState({
    status: "",
    officialId: "",
    number: "",
  });

  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: "",
    message: "",
    variant: "default",
  });

  const isAdmin = user?.role === "ADMIN";
  const isOfficial = user?.role === "OFFICIAL";

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
    const data = await apiFetch(`/inventory/kits${queryString ? `?${queryString}` : ""}`);

    setKits(data);
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
        currentUser.role === "ADMIN" || currentUser.role === "COORDINATOR"
          ? loadKits()
          : loadMyKits(),
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
      isAdmin || user?.role === "COORDINATOR" ? loadKits() : loadMyKits(),
    ]);
  }

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!entryForm.quantity || !entryForm.initialNumber || !entryForm.finalNumber) {
      showModal({
        title: "Campos obrigatórios",
        message: "Preencha quantidade, número inicial e número final.",
        variant: "warning",
        confirmText: "Fechar",
      });
      return;
    }

    try {
      setSavingEntry(true);

      const result = await apiFetch("/inventory/entries", {
        method: "POST",
        body: JSON.stringify(entryForm),
      });

      setEntryForm({
        quantity: "",
        initialNumber: "",
        finalNumber: "",
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

    if (!transferForm.officialId || !transferForm.initialNumber || !transferForm.finalNumber) {
      showModal({
        title: "Campos obrigatórios",
        message: "Selecione o DCO e informe o número inicial e final dos kits.",
        variant: "warning",
        confirmText: "Fechar",
      });
      return;
    }

    try {
      setSavingTransfer(true);

      const result = await apiFetch("/inventory/transfers", {
        method: "POST",
        body: JSON.stringify(transferForm),
      });

      setTransferForm({
        officialId: "",
        initialNumber: "",
        finalNumber: "",
        notes: "",
      });

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

  const visibleKits = isOfficial ? myKits : kits;

  return (
  <div className="flex min-h-screen bg-[var(--cdb-light)]">
    <Sidebar />

    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--cdb-blue)]">
                📦 Estoque
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[var(--cdb-dark)]">
                Controle de estoque de kits
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Gerencie a entrada de kits, repasse para DCOs e acompanhe a
                numeração disponível, repassada e utilizada nos controles.
              </p>
            </div>

            <div className="rounded-3xl bg-[var(--cdb-blue)] px-6 py-5 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                Total de kits
              </p>
              <p className="mt-1 text-4xl font-black">{summary?.total ?? 0}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard title="Disponíveis" value={summary?.disponivel ?? 0} icon="✅" />
          <SummaryCard title="Com DCO" value={summary?.comDco ?? 0} icon="👤" />
          <SummaryCard title="Vinculados" value={summary?.vinculadoJogo ?? 0} icon="🏟️" />
          <SummaryCard title="Utilizados" value={summary?.utilizado ?? 0} icon="🧪" />
          <SummaryCard title="Cancelados" value={summary?.cancelado ?? 0} icon="🚫" />
        </section>

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
                  Informe a quantidade e a sequência recebida para inserir os kits
                  automaticamente no estoque.
                </p>
              </div>

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
                  Repasses mudam os kits de disponível para responsabilidade do
                  DCO selecionado.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
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

        {summary?.byDco && summary.byDco.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                Kits por DCO
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Veja a quantidade e numeração sob responsabilidade de cada DCO.
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
                      <h3 className="font-black text-slate-900">{item.name}</h3>
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
                {isOfficial ? "Meus kits" : "Lista de kits"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isOfficial
                  ? "Kits sob sua responsabilidade para uso nos controles."
                  : "Consulte kits por número, status ou DCO responsável."}
              </p>
            </div>

            {!isOfficial && (
              <form onSubmit={handleFilter} className="grid gap-3 md:grid-cols-4">
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
                  <option value="VINCULADO_JOGO">Vinculado ao jogo</option>
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
              Nenhum kit encontrado.
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
                      {!isOfficial && (
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

                          {!isOfficial && (
                            <td className="px-5 py-4 text-slate-600">
                              {kit.currentOfficial?.user?.name || "-"}
                            </td>
                          )}

                          <td className="px-5 py-4 text-slate-600">
                            {lastMatch
                              ? `${lastMatch.homeTeam} x ${lastMatch.awayTeam}`
                              : "-"}
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

          <ConfirmModal
            open={modal.open}
            title={modal.title}
            message={modal.message}
            variant={modal.variant}
            confirmText={modal.confirmText}
            cancelText="Fechar"
            onCancel={closeModal}
          />
        </main>
      </div>
    
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