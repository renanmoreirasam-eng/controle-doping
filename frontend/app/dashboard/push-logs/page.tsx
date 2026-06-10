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

type PushLogResponse = {
  data: PushLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  summary: {
    totalSent: number;
    totalFailed: number;
    totalPartial: number;
    totalNoSubscription: number;
    sentToday: number;
  };
};

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

function formatDateTime(date: string) {
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

export default function PushLogsPage() {
  const user = getUser();
  const userRole = String(user?.role || user?.user?.role || '').toUpperCase();
  const isAdmin = userRole === 'ADMIN';

  const [logs, setLogs] = useState<PushLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [module, setModule] = useState('');
  const [role, setRole] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PushLogResponse['pagination']>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [summary, setSummary] = useState<PushLogResponse['summary']>({
    totalSent: 0,
    totalFailed: 0,
    totalPartial: 0,
    totalNoSubscription: 0,
    sentToday: 0,
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

  async function loadLogs() {
    try {
      setLoading(true);

      const response = await api.get<PushLogResponse>(`/push-logs?${queryString}`);

      setLogs(response.data.data || []);
      setPagination(response.data.pagination);
      setSummary(response.data.summary);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;

    loadLogs();
  }, [isAdmin, queryString]);

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
        <header className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
            Administração
          </span>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-[var(--cdb-dark)] lg:text-5xl">
                Notificações Push
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 lg:text-base">
                Consulte o histórico de notificações enviadas, destinatários, data, horário e falhas.
              </p>
            </div>

            <button
              type="button"
              onClick={loadLogs}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Enviadas</p>
            <p className="mt-3 text-3xl font-black text-green-700">{summary.totalSent}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Hoje</p>
            <p className="mt-3 text-3xl font-black text-[var(--cdb-blue)]">{summary.sentToday}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Parciais</p>
            <p className="mt-3 text-3xl font-black text-yellow-700">{summary.totalPartial}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Falhas</p>
            <p className="mt-3 text-3xl font-black text-red-700">{summary.totalFailed}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Sem inscrição</p>
            <p className="mt-3 text-3xl font-black text-slate-700">{summary.totalNoSubscription}</p>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por usuário, e-mail, título ou mensagem"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
              />
              <label className="mt-2 block text-xs font-bold text-slate-600">Busca</label>
            </div>

            <div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <label className="mt-2 block text-xs font-bold text-slate-600">Status</label>
            </div>

            <div>
              <select
                value={module}
                onChange={(event) => setModule(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
              >
                {moduleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <label className="mt-2 block text-xs font-bold text-slate-600">Origem</label>
            </div>

            <div>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <label className="mt-2 block text-xs font-bold text-slate-600">Perfil</label>
            </div>

            <div>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
              />
              <label className="mt-2 block text-xs font-bold text-slate-600">Data inicial</label>
            </div>

            <div>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
              />
              <label className="mt-2 block text-xs font-bold text-slate-600">Data final</label>
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

          {loading ? (
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
                disabled={!pagination.hasPreviousPage || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-2xl bg-[var(--cdb-blue)] px-4 py-2 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}