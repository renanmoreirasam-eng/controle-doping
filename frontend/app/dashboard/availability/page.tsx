'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';
import { getUser } from '../../../services/auth';

type Unavailability = {
  id: string;
  userId: string;
  date: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
};

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthTitle(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1)));
}

export default function AvailabilityPage() {
  const user = getUser();
  const userRole = String(user?.role || user?.user?.role || '').toUpperCase();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [items, setItems] = useState<Unavailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canUsePage = ['ADMIN', 'COORDINATOR', 'OFFICIAL'].includes(userRole);
  const monthKey = `${currentMonth.getFullYear()}-${pad(currentMonth.getMonth() + 1)}`;

  async function loadAvailability() {
    try {
      setLoading(true);
      setMessage(null);
      const response = await api.get(
        userRole === 'ADMIN' ? '/availability/admin' : '/availability/me',
        { params: { month: monthKey } },
      );
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Não foi possível carregar suas indisponibilidades.',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canUsePage) loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  const unavailableByDate = useMemo(() => {
    const map = new Map<string, Unavailability>();
    items.forEach((item) => map.set(item.date.slice(0, 10), item));
    return map;
  }, [items]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstWeekDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: Array<{ key: string; day?: number; dateKey?: string }> = [];

    for (let index = 0; index < firstWeekDay; index += 1) {
      result.push({ key: `empty-start-${index}` });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push({ key: `day-${day}`, day, dateKey: toDateKey(year, month, day) });
    }

    while (result.length % 7 !== 0) {
      result.push({ key: `empty-end-${result.length}` });
    }

    return result;
  }, [currentMonth]);

  const groupedAdminItems = useMemo(() => {
    const grouped = new Map<string, {
      userId: string;
      name: string;
      email: string;
      dates: Unavailability[];
    }>();

    items.forEach((item: Unavailability) => {
      const key = item.userId;
      const current = grouped.get(key) || {
        userId: item.userId,
        name: (item as any).user?.name || 'Usuário',
        email: (item as any).user?.email || '',
        dates: [] as Unavailability[],
      };

      current.dates.push(item);
      grouped.set(key, current);
    });

    return Array.from(grouped.values())
      .map((group) => ({
        ...group,
        dates: group.dates.sort((a, b) => a.date.localeCompare(b.date)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [items]);

  async function toggleDate(dateKey: string) {
    if (savingDate) return;

    if (dateKey < getTodayKey()) {
      setMessage({
        type: 'error',
        text: 'Datas anteriores a hoje não podem mais ser alteradas.',
      });
      return;
    }

    const existing = unavailableByDate.get(dateKey);

    try {
      setSavingDate(dateKey);
      setMessage(null);

      if (existing) {
        await api.delete(`/availability/${existing.id}`);
        setItems((current) => current.filter((item) => item.id !== existing.id));
        setMessage({ type: 'success', text: `${formatDate(dateKey)} voltou a ficar disponível.` });
        return;
      }

      const response = await api.post('/availability', { date: dateKey });
      setItems((current) =>
        [...current, response.data].sort((a, b) => a.date.localeCompare(b.date)),
      );
      setMessage({ type: 'success', text: `${formatDate(dateKey)} marcado como indisponível.` });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Não foi possível atualizar a disponibilidade.',
      });
    } finally {
      setSavingDate(null);
    }
  }

  function changeMonth(offset: number) {
    setCurrentMonth((current) =>
      new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function goToCurrentMonth() {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  if (!canUsePage) {
    return (
      <main className="min-h-screen bg-[var(--cdb-light)] lg:flex">
        <Sidebar />
        <section className="flex-1 p-4 lg:p-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            Você não possui permissão para acessar esta página.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--cdb-light)] lg:flex-row">
      <Sidebar />

      <div className="min-w-0 flex-1 overflow-x-hidden">
        <header className="border-b border-slate-200 bg-white px-4 py-5 lg:px-8 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--cdb-blue-soft)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                📅 Gestão operacional
              </div>

              <h1 className="mt-3 text-3xl font-black text-[var(--cdb-dark)] lg:text-4xl">
                {userRole === 'ADMIN'
                  ? 'Indisponibilidades'
                  : 'Minha disponibilidade'}
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                {userRole === 'ADMIN'
                  ? 'Consulte por pessoa as datas em que coordenadores e oficiais informaram indisponibilidade.'
                  : 'Selecione os dias em que você não poderá realizar controle.'}
              </p>
            </div>

            <div className="w-fit rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 font-bold text-white shadow-lg">
              {userRole === 'ADMIN'
                ? `${groupedAdminItems.length} ${groupedAdminItems.length === 1 ? 'pessoa' : 'pessoas'}`
                : `${items.length} ${items.length === 1 ? 'dia indisponível' : 'dias indisponíveis'}`}
            </div>
          </div>
        </header>

        <section className="w-full max-w-full overflow-x-hidden p-4 lg:p-8">
          {message && (
            <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              message.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {userRole === 'ADMIN' ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700"
                  aria-label="Mês anterior"
                >
                  ‹
                </button>

                <div className="min-w-0 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                    Indisponibilidades
                  </p>
                  <h2 className="mt-1 capitalize text-lg font-black text-slate-900">
                    {monthTitle(currentMonth)}
                  </h2>
                  <button
                    type="button"
                    onClick={goToCurrentMonth}
                    className="mt-1 text-xs font-bold text-[var(--cdb-blue)] hover:underline"
                  >
                    Ir para o mês atual
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700"
                  aria-label="Próximo mês"
                >
                  ›
                </button>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
                  Carregando indisponibilidades...
                </div>
              ) : groupedAdminItems.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                  <div className="text-3xl">📅</div>
                  <p className="mt-3 font-black text-slate-800">
                    Nenhuma indisponibilidade cadastrada
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Não há datas informadas pelos oficiais neste mês.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {groupedAdminItems.map((group) => (
                    <div
                      key={group.userId}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-base font-black text-[var(--cdb-dark)]">
                            {group.name}
                          </p>
                          {group.email && (
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {group.email}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                          {group.dates.length} {group.dates.length === 1 ? 'dia' : 'dias'}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {group.dates.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-black text-red-700"
                          >
                            {formatDate(item.date)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 lg:p-5">
                <button type="button" onClick={() => changeMonth(-1)} className="h-11 w-11 rounded-2xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700">‹</button>
                <div className="min-w-0 text-center">
                  <h2 className="capitalize text-lg font-black text-slate-900">{monthTitle(currentMonth)}</h2>
                  <button type="button" onClick={goToCurrentMonth} className="mt-1 text-xs font-bold text-[var(--cdb-blue)] hover:underline">
                    Ir para o mês atual
                  </button>
                </div>
                <button type="button" onClick={() => changeMonth(1)} className="h-11 w-11 rounded-2xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700">›</button>
              </div>

              <div className="p-3 sm:p-4 lg:p-5">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-green-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    Disponível
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-red-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    Indisponível
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    Encerrado
                  </span>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="py-2 text-center text-[10px] font-black uppercase tracking-wide text-slate-400 sm:text-xs">
                      {day}
                    </div>
                  ))}
                </div>

                {loading ? (
                  <div className="flex min-h-80 items-center justify-center text-sm font-semibold text-slate-500">
                    Carregando calendário...
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {calendarDays.map((calendarDay) => {
                      if (!calendarDay.day || !calendarDay.dateKey) {
                        return <div key={calendarDay.key} className="aspect-square rounded-xl bg-slate-50/50" />;
                      }

                      const unavailable = unavailableByDate.has(calendarDay.dateKey);
                      const saving = savingDate === calendarDay.dateKey;
                      const isPastDate = calendarDay.dateKey < getTodayKey();

                      return (
                        <button
                          key={calendarDay.key}
                          type="button"
                          onClick={() => toggleDate(calendarDay.dateKey!)}
                          disabled={Boolean(savingDate) || isPastDate}
                          className={`relative aspect-square min-h-11 rounded-xl border text-sm font-black transition sm:rounded-2xl sm:text-base ${
                            isPastDate
                              ? unavailable
                                ? 'cursor-not-allowed border-red-100 bg-red-50 text-red-300 opacity-60'
                                : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 opacity-70'
                              : unavailable
                                ? 'border-red-300 bg-red-100 text-red-700 shadow-sm'
                                : 'border-green-200 bg-green-50 text-green-700 shadow-sm hover:border-green-300 hover:bg-green-100'
                          } disabled:cursor-not-allowed`}
                          title={
                            isPastDate
                              ? 'Data encerrada — não pode mais ser alterada'
                              : unavailable
                                ? 'Indisponível — clique para remover'
                                : 'Disponível — clique para marcar como indisponível'
                          }
                        >
                          {calendarDay.day}
                          {unavailable && <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-500 sm:bottom-2 sm:h-2 sm:w-2" />}
                          {saving && <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 text-[10px]">...</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Neste mês</p>
                <p className="mt-2 text-3xl font-black text-red-600">{items.length}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {items.length === 1 ? 'dia indisponível' : 'dias indisponíveis'}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-black text-slate-900">Datas indisponíveis</h3>
                {items.length === 0 ? (
                  <p className="mt-3 text-sm leading-6 text-slate-500">Nenhuma indisponibilidade cadastrada neste mês.</p>
                ) : (
                  <div className="mt-4 space-y-2">
                    {items.slice().sort((a, b) => a.date.localeCompare(b.date)).map((item) => {
                      const dateKey = item.date.slice(0, 10);
                      const isPastDate = dateKey < getTodayKey();

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleDate(dateKey)}
                          disabled={Boolean(savingDate) || isPastDate}
                          className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                            isPastDate
                              ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
                              : 'border-red-100 bg-red-50 hover:bg-red-100'
                          }`}
                        >
                          <span className={isPastDate ? 'font-black text-slate-500' : 'font-black text-red-700'}>
                            {formatDate(item.date)}
                          </span>
                          <span className={isPastDate ? 'text-xs font-bold text-slate-400' : 'text-xs font-bold text-red-500'}>
                            {isPastDate ? 'Encerrada' : 'Remover'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-black text-[var(--cdb-blue)]">Como funciona na escala</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  O administrador poderá consultar estas datas ao montar a escala e receber um alerta quando houver indisponibilidade no dia do jogo.
                </p>
              </div>
            </aside>
          </div>
          )}
        </section>
      </div>
    </main>
  );
}
