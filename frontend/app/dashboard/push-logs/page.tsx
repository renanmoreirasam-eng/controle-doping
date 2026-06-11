'use client';

import { useEffect, useMemo, useState } from 'react';

import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';
import { getUser } from '../../../services/auth';

type PushLog = {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  title: string;
  message: string;
  url?: string | null;
  module?: string | null;
  entityId?: string | null;
  entityType?: string | null;
  status: string;
  error?: string | null;
  subscriptionCount: number;
  sentCount: number;
  failedCount: number;
  sentAt: string;
  createdAt: string;
};

type PushSubscriptionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  pushEnabled: boolean;
  subscriptionCount: number;
  lastSubscriptionAt?: string | null;
  createdAt: string;
  subscriptions: {
    id: string;
    userAgent?: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type PushLogResponse = {
  data: PushLog[];
  pagination: Pagination;
  summary: {
    totalSent: number;
    totalFailed: number;
    totalPartial: number;
    totalNoSubscription: number;
    sentToday: number;
  };
};

type PushSubscriptionUsersResponse = {
  data: PushSubscriptionUser[];
  pagination: Pagination;
  summary: {
    totalUsers: number;
    enabledUsers: number;
    disabledUsers: number;
  };
};

type ActiveTab = 'LOGS' | 'ENABLED' | 'DISABLED';

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'SENT', label: 'Enviada' },
  { value: 'PARTIAL', label: 'Parcial' },
  { value: 'FAILED', label: 'Falha' },
  { value: 'NO_SUBSCRIPTION', label: 'Sem inscrição' },
];

const roleOptions = [
  { value: '', label: 'Todos' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'COORDINATOR', label: 'Coordenador' },
  { value: 'OFFICIAL', label: 'Oficial' },
];

const moduleOptions = [
  { value: '', label: 'Todas' },
  { value: 'SCALES', label: 'Escalas' },
  { value: 'MATCHES', label: 'Jogos' },
  { value: 'MISSION_ORDER', label: 'Ordem de missão' },
  { value: 'DRAWS', label: 'Sorteio' },
  { value: 'ANNOUNCEMENTS', label: 'Comunicados' },
  { value: 'INVENTORY', label: 'Estoque' },
  { value: 'LAB_SHIPPING', label: 'Envio ao laboratório' },
  { value: 'TEST', label: 'Teste' },
  { value: 'PUSH', label: 'Push' },
];

function formatDateTime(date?: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
}

function getStatusLabel(status: string) {
  if (status === 'SENT') return 'Enviada';
  if (status === 'PARTIAL') return 'Parcial';
  if (status === 'FAILED') return 'Falha';
  if (status === 'NO_SUBSCRIPTION') return 'Sem inscrição';

  return status;
}

function getStatusClass(status: string) {
  if (status === 'SENT') return 'border-green-200 bg-green-50 text-green-700';
  if (status === 'PARTIAL') return 'border-yellow-200 bg-yellow-50 text-yellow-700';
  if (status === 'FAILED') return 'border-red-200 bg-red-50 text-red-700';
  if (status === 'NO_SUBSCRIPTION') return 'border-slate-200 bg-slate-50 text-slate-600';

  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function getRoleLabel(role?: string | null) {
  if (role === 'ADMIN') return 'Admin';
  if (role === 'COORDINATOR') return 'Coordenador';
  if (role === 'OFFICIAL') return 'Oficial';

  return role || 'Não identificado';
}

function getModuleLabel(module?: string | null) {
  return moduleOptions.find((item) => item.value === module)?.label || module || 'Push';
}

const emptyPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

export default function PushLogsPage() {
  const user = getUser();
  const userRole = String(user?.role || user?.user?.role || '').toUpperCase();
  const isAdmin = userRole === 'ADMIN';

  const [activeTab, setActiveTab] = useState<ActiveTab>('LOGS');

  const [logs, setLogs] = useState<PushLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [module, setModule] = useState('');
  const [role, setRole] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [summary, setSummary] = useState<PushLogResponse['summary']>({
    totalSent: 0,
    totalFailed: 0,
    totalPartial: 0,
    totalNoSubscription: 0,
    sentToday: 0,
  });

  const [users, setUsers] = useState<PushSubscriptionUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState<Pagination>(emptyPagination);
  const [userSummary, setUserSummary] = useState<PushSubscriptionUsersResponse['summary']>({
    totalUsers: 0,
    enabledUsers: 0,
    disabledUsers: 0,
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set('page', String(page));
    params.set('limit', '20');

    if (search.trim()) params.set('search', search.trim());
    if (status) params.set('status', status);
    if (module) params.set('module', module);
    if (role) params.set('userRole', role);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    return params.toString();
  }, [endDate, module, page, role, search, startDate, status]);

  const userStatus = activeTab === 'ENABLED' ? 'ENABLED' : activeTab === 'DISABLED' ? 'DISABLED' : 'ALL';

  const userQueryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set('page', String(userPage));
    params.set('limit', '20');
    params.set('status', userStatus);

    if (userSearch.trim()) params.set('search', userSearch.trim());
    if (userRoleFilter) params.set('userRole', userRoleFilter);

    return params.toString();
  }, [userPage, userRoleFilter, userSearch, userStatus]);

  async function loadLogs() {
    try {
      setLoadingLogs(true);

      const response = await api.get<PushLogResponse>(`/push-logs?${queryString}`);

      setLogs(response.data.data || []);
      setPagination(response.data.pagination || emptyPagination);
      setSummary(response.data.summary);
    } finally {
      setLoadingLogs(false);
    }
  }

  async function loadUsers() {
    try {
      setLoadingUsers(true);

      const response = await api.get<PushSubscriptionUsersResponse>(
        `/push-logs/subscriptions?${userQueryString}`,
      );

      setUsers(response.data.data || []);
      setUserPagination(response.data.pagination || emptyPagination);
      setUserSummary(response.data.summary);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;

    loadLogs();
  }, [isAdmin, queryString]);

  useEffect(() => {
    if (!isAdmin) return;

    loadUsers();
  }, [isAdmin, userQueryString]);

  function applyFilters() {
    setPage(1);
    loadLogs();
  }

  function clearFilters() {
    setSearch('');
    setStatus('');
    setModule('');
    setRole('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }

  function clearUserFilters() {
    setUserSearch('');
    setUserRoleFilter('');
    setUserPage(1);
  }

  function changeTab(tab: ActiveTab) {
    setActiveTab(tab);
    setUserPage(1);
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--cdb-light)] lg:flex-row">
        <Sidebar />
        <div className="flex-1 p-4 lg:p-8">
          <div className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm lg:p-8">
            <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-700">
              Acesso bloqueado
            </span>
            <h1 className="mt-4 text-3xl font-black text-[var(--cdb-dark)]">
              Notificações Push
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Esta página é exclusiva para administradores.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[var(--cdb-light)] lg:flex-row">
      <Sidebar />

      <div className="flex-1 p-4 lg:p-8">
        <header className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-4xl">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                  <span>Dashboard</span>
                  <span>/</span>
                  <span className="text-[var(--cdb-blue)]">Notificações Push</span>
                </div>

                <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                  Administração
                </span>

                <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--cdb-dark)] lg:text-5xl">
                  Notificações Push
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 lg:text-base">
                  Consulte o histórico de envios e acompanhe quais usuários estão com notificações habilitadas no sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  loadLogs();
                  loadUsers();
                }}
                disabled={loadingLogs || loadingUsers}
                className="inline-flex w-fit items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingLogs || loadingUsers ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => changeTab('LOGS')}
            className={`rounded-3xl border p-5 text-left shadow-sm transition ${
              activeTab === 'LOGS'
                ? 'border-blue-200 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-blue-100 hover:bg-blue-50/40'
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Histórico</p>
            <p className="mt-3 text-3xl font-black text-[var(--cdb-blue)]">{pagination.total}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">notificações encontradas</p>
          </button>

          <button
            type="button"
            onClick={() => changeTab('ENABLED')}
            className={`rounded-3xl border p-5 text-left shadow-sm transition ${
              activeTab === 'ENABLED'
                ? 'border-green-200 bg-green-50'
                : 'border-slate-200 bg-white hover:border-green-100 hover:bg-green-50/40'
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Usuários com push</p>
            <p className="mt-3 text-3xl font-black text-green-700">{userSummary.enabledUsers}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">com notificação habilitada</p>
          </button>

          <button
            type="button"
            onClick={() => changeTab('DISABLED')}
            className={`rounded-3xl border p-5 text-left shadow-sm transition ${
              activeTab === 'DISABLED'
                ? 'border-red-200 bg-red-50'
                : 'border-slate-200 bg-white hover:border-red-100 hover:bg-red-50/40'
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Usuários sem push</p>
            <p className="mt-3 text-3xl font-black text-red-700">{userSummary.disabledUsers}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">precisam habilitar</p>
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Enviadas hoje</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{summary.sentToday}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">registros de push hoje</p>
          </div>
        </section>

        {activeTab === 'LOGS' ? (
          <>
            <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-black text-[var(--cdb-dark)]">Filtros do histórico</h2>
                <p className="mt-1 text-sm text-slate-500">Refine a consulta por usuário, status, origem, perfil ou período.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                <div className="lg:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Busca
                  </label>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por usuário, e-mail, título ou mensagem"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Origem
                  </label>
                  <select
                    value={module}
                    onChange={(event) => setModule(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                  >
                    {moduleOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Perfil
                  </label>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Data inicial
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Data final
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Limpar filtros
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
                >
                  Filtrar
                </button>
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 lg:p-6">
                <h2 className="text-xl font-black text-[var(--cdb-dark)]">Histórico de envios</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {pagination.total} registro(s) encontrado(s).
                </p>
              </div>

              {loadingLogs ? (
                <div className="p-6 text-sm font-semibold text-slate-500">Carregando notificações...</div>
              ) : logs.length === 0 ? (
                <div className="p-6 text-sm font-semibold text-slate-500">Nenhuma notificação encontrada.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[1100px] w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400">
                      <tr>
                        <th className="px-4 py-4">Data/Hora</th>
                        <th className="px-4 py-4">Destinatário</th>
                        <th className="px-4 py-4">Perfil</th>
                        <th className="px-4 py-4">Origem</th>
                        <th className="px-4 py-4">Mensagem</th>
                        <th className="px-4 py-4">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log) => (
                        <tr key={log.id} className="align-top transition hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-700">
                            {formatDateTime(log.sentAt)}
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-black text-slate-900">{log.userName || 'Não identificado'}</p>
                            <p className="mt-1 text-xs text-slate-500">{log.userEmail || '-'}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                              {getRoleLabel(log.userRole)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-[var(--cdb-blue)]">
                              {getModuleLabel(log.module)}
                            </span>
                          </td>
                          <td className="max-w-[420px] px-4 py-4">
                            <p className="font-black text-slate-900">{log.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{log.message}</p>
                            {log.url && (
                              <p className="mt-2 text-xs font-semibold text-slate-400">URL: {log.url}</p>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`${getStatusClass(log.status)} inline-flex rounded-full border px-3 py-1 text-xs font-black`}>
                              {getStatusLabel(log.status)}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              Inscrições: {log.subscriptionCount} · Enviadas: {log.sentCount} · Falhas: {log.failedCount}
                            </p>
                            {log.error && (
                              <p className="mt-2 max-w-xs rounded-xl border border-red-100 bg-red-50 p-2 text-xs leading-5 text-red-700">
                                {log.error}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Página {pagination.page} de {pagination.totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!pagination.hasPreviousPage || loadingLogs}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    disabled={!pagination.hasNextPage || loadingLogs}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-2xl bg-[var(--cdb-blue)] px-4 py-2 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-black text-[var(--cdb-dark)]">Filtros de usuários</h2>
                <p className="mt-1 text-sm text-slate-500">Busque por nome, e-mail ou perfil para conferir quem habilitou as notificações.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                <div className="lg:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Busca
                  </label>
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Buscar por nome ou e-mail"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Perfil
                  </label>
                  <select
                    value={userRoleFilter}
                    onChange={(event) => setUserRoleFilter(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={clearUserFilters}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 lg:p-6">
                <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                  {activeTab === 'ENABLED' ? 'Usuários com push habilitado' : 'Usuários sem push habilitado'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {userPagination.total} usuário(s) encontrado(s).
                </p>
              </div>

              {loadingUsers ? (
                <div className="p-6 text-sm font-semibold text-slate-500">Carregando usuários...</div>
              ) : users.length === 0 ? (
                <div className="p-6 text-sm font-semibold text-slate-500">Nenhum usuário encontrado.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[980px] w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400">
                      <tr>
                        <th className="px-4 py-4">Usuário</th>
                        <th className="px-4 py-4">Perfil</th>
                        <th className="px-4 py-4">Status push</th>
                        <th className="px-4 py-4">Dispositivos</th>
                        <th className="px-4 py-4">Última atualização</th>
                        <th className="px-4 py-4">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((item) => (
                        <tr key={item.id} className="align-top transition hover:bg-slate-50">
                          <td className="px-4 py-4">
                            <p className="font-black text-slate-900">{item.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                              {getRoleLabel(item.role)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {item.pushEnabled ? (
                              <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                                Habilitada
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                                Não habilitada
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 font-black text-slate-800">
                            {item.subscriptionCount}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                            {formatDateTime(item.lastSubscriptionAt)}
                          </td>
                          <td className="max-w-[340px] px-4 py-4">
                            {item.subscriptions.length > 0 ? (
                              <div className="space-y-2">
                                {item.subscriptions.slice(0, 3).map((subscription) => (
                                  <div key={subscription.id} className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-xs text-slate-600">
                                    <p className="font-bold text-slate-700">
                                      Atualizado em {formatDateTime(subscription.updatedAt)}
                                    </p>
                                    {subscription.userAgent && (
                                      <p className="mt-1 line-clamp-2">{subscription.userAgent}</p>
                                    )}
                                  </div>
                                ))}
                                {item.subscriptions.length > 3 && (
                                  <p className="text-xs font-semibold text-slate-400">
                                    + {item.subscriptions.length - 3} dispositivo(s)
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs leading-5 text-slate-500">
                                Usuário ainda não ativou as notificações neste navegador/PWA.
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Página {userPagination.page} de {userPagination.totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!userPagination.hasPreviousPage || loadingUsers}
                    onClick={() => setUserPage((current) => Math.max(1, current - 1))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    disabled={!userPagination.hasNextPage || loadingUsers}
                    onClick={() => setUserPage((current) => current + 1)}
                    className="rounded-2xl bg-[var(--cdb-blue)] px-4 py-2 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
