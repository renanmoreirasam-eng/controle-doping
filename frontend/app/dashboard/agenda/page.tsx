'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { api } from '../../../services/api';
import { getUser } from '../../../services/auth';

type AdminTask = {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  remindAt?: string | null;
  done: boolean;
  doneAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type TaskForm = {
  title: string;
  description: string;
  dueDate: string;
};

type ModalVariant = 'danger' | 'success' | 'warning' | 'default';

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: ModalVariant;
  confirmText: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
};

const emptyForm: TaskForm = {
  title: '',
  description: '',
  dueDate: '',
};

const initialModalState: ModalState = {
  open: false,
  title: '',
  message: '',
  variant: 'default',
  confirmText: 'Fechar',
};

function toDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 10);
}

function dateInputToIso(value: string) {
  return new Date(`${value}T12:00:00`).toISOString();
}

function getDateKey(date: Date | string) {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  return parsedDate.toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function buildMonthDays(currentMonth: Date) {
  const firstDay = startOfMonth(currentMonth);
  const lastDay = endOfMonth(currentMonth);
  const days: Date[] = [];

  const startWeekDay = firstDay.getDay();

  for (let index = startWeekDay; index > 0; index -= 1) {
    days.push(
      new Date(firstDay.getFullYear(), firstDay.getMonth(), 1 - index),
    );
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  }

  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];

    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }

  return days;
}

function getErrorMessage(error: any, fallback: string) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(' ') : String(message);
}

export default function AgendaPage() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<TaskForm>(() => ({
    ...emptyForm,
    dueDate: toDateInputValue(new Date()),
  }));

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState(getDateKey(new Date()));
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [modal, setModal] = useState<ModalState>(initialModalState);

  function closeModal() {
    setModal(initialModalState);
  }

  function showMessage(
    title: string,
    message: string,
    variant: ModalVariant = 'default',
  ) {
    setModal({
      open: true,
      title,
      message,
      variant,
      confirmText: 'Fechar',
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
      variant: params.variant || 'warning',
      confirmText: params.confirmText || 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        closeModal();
        await params.onConfirm();
      },
    });
  }

  async function loadTasks() {
    try {
      setLoading(true);

      const response = await api.get('/admin-tasks');

      setTasks(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      setTasks([]);
      showMessage(
        'Erro ao carregar agenda',
        'Não foi possível carregar as atividades cadastradas.',
        'danger',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const user = getUser();
    const userRole = String(user?.role || user?.user?.role || '').toUpperCase();
    const nextIsAdmin = userRole === 'ADMIN';

    setIsAdmin(nextIsAdmin);
    setHasHydrated(true);

    if (nextIsAdmin) {
      loadTasks();
    } else {
      setLoading(false);
    }
  }, []);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, AdminTask[]>();

    for (const task of tasks) {
      const key = getDateKey(task.dueDate);
      const current = map.get(key) || [];

      current.push(task);
      map.set(key, current);
    }

    return map;
  }, [tasks]);

  const selectedDateTasks = useMemo(() => {
    return (tasksByDate.get(selectedDateKey) || []).slice().sort((a, b) => {
      if (a.done !== b.done) return Number(a.done) - Number(b.done);

      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasksByDate, selectedDateKey]);

  const pendingTasks = useMemo(
    () => tasks.filter((task) => !task.done),
    [tasks],
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.done),
    [tasks],
  );

  const todayTasks = useMemo(() => {
    const todayKey = getDateKey(new Date());

    return tasks.filter((task) => getDateKey(task.dueDate) === todayKey);
  }, [tasks]);

  const calendarDays = useMemo(
    () => buildMonthDays(currentMonth),
    [currentMonth],
  );

  function updateForm(field: keyof TaskForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      dueDate: selectedDateKey,
    });
    setEditingTaskId(null);
  }

  async function saveTask(event: React.FormEvent) {
    event.preventDefault();

    if (!form.title.trim()) {
      showMessage('Título obrigatório', 'Informe o título da atividade.', 'warning');
      return;
    }

    if (!form.dueDate) {
      showMessage(
        'Data obrigatória',
        'Informe a data da atividade.',
        'warning',
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title,
        description: form.description || null,
        dueDate: dateInputToIso(form.dueDate),
        remindAt: null,
      };

      if (editingTaskId) {
        await api.patch(`/admin-tasks/${editingTaskId}`, payload);
        showMessage(
          'Atividade atualizada',
          'Atividade atualizada com sucesso.',
          'success',
        );
      } else {
        await api.post('/admin-tasks', payload);
        showMessage(
          'Atividade cadastrada',
          'Atividade cadastrada com sucesso.',
          'success',
        );
      }

      resetForm();
      await loadTasks();
    } catch (error: any) {
      showMessage(
        'Erro ao salvar atividade',
        getErrorMessage(error, 'Erro ao salvar atividade.'),
        'danger',
      );
    } finally {
      setSaving(false);
    }
  }

  function editTask(task: AdminTask) {
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: getDateKey(task.dueDate),
    });
    setSelectedDateKey(getDateKey(task.dueDate));
  }

  function confirmToggleDone(task: AdminTask) {
    showConfirm({
      title: task.done ? 'Reabrir atividade' : 'Marcar atividade como feita',
      message: task.done
        ? `Deseja reabrir a atividade "${task.title}"?`
        : `Deseja marcar a atividade "${task.title}" como feita?`,
      variant: task.done ? 'warning' : 'success',
      confirmText: task.done ? 'Reabrir' : 'Marcar como feita',
      onConfirm: async () => {
        try {
          await api.patch(`/admin-tasks/${task.id}/done`, {
            done: !task.done,
          });

          await loadTasks();

          showMessage(
            task.done ? 'Atividade reaberta' : 'Atividade concluída',
            task.done
              ? 'Atividade reaberta com sucesso.'
              : 'Atividade marcada como feita com sucesso.',
            'success',
          );
        } catch (error: any) {
          showMessage(
            'Erro ao atualizar atividade',
            getErrorMessage(error, 'Erro ao atualizar atividade.'),
            'danger',
          );
        }
      },
    });
  }

  function confirmDeleteTask(task: AdminTask) {
    showConfirm({
      title: 'Excluir atividade',
      message: `Deseja excluir a atividade "${task.title}"? Essa ação não poderá ser desfeita.`,
      variant: 'danger',
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/admin-tasks/${task.id}`);
          await loadTasks();

          showMessage(
            'Atividade excluída',
            'Atividade excluída com sucesso.',
            'success',
          );
        } catch (error: any) {
          showMessage(
            'Erro ao excluir atividade',
            getErrorMessage(error, 'Erro ao excluir atividade.'),
            'danger',
          );
        }
      },
    });
  }

  function confirmCancelEdit() {
    showConfirm({
      title: 'Cancelar edição',
      message: 'Deseja cancelar a edição desta atividade? As alterações não salvas serão perdidas.',
      variant: 'warning',
      confirmText: 'Cancelar edição',
      onConfirm: resetForm,
    });
  }

  function previousMonth() {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  }

  function nextMonth() {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  }

  function selectCalendarDay(day: Date) {
    const key = getDateKey(day);

    setSelectedDateKey(key);
    setForm((current) => ({
      ...current,
      dueDate: current.dueDate || key,
    }));
  }

  if (!hasHydrated) {
    return (
      <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
        <Sidebar />

        <div className="flex-1 p-4 lg:p-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
            Carregando agenda...
          </div>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
        <Sidebar />

        <div className="flex-1 p-4 lg:p-8">
          <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">
              Acesso bloqueado
            </p>

            <h1 className="mt-3 text-3xl font-black text-[var(--cdb-dark)]">
              Agenda exclusiva do ADMIN
            </h1>

            <p className="mt-2 text-slate-500">
              Esta página é restrita aos administradores do sistema.
            </p>
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

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                🗓️ Agenda do Admin
              </div>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Calendário de atividades
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Cadastre atividades, acompanhe pendências por data e marque como concluídas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-center">
                <p className="text-2xl font-black text-yellow-700">
                  {pendingTasks.length}
                </p>
                <p className="text-[11px] font-bold text-yellow-700">
                  Pendentes
                </p>
              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center">
                <p className="text-2xl font-black text-green-700">
                  {completedTasks.length}
                </p>
                <p className="text-[11px] font-bold text-green-700">
                  Feitas
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                      Calendário
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Clique em uma data para visualizar ou cadastrar atividades.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={previousMonth}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                    >
                      ←
                    </button>

                    <div className="min-w-48 rounded-2xl bg-slate-100 px-4 py-2 text-center text-sm font-black text-slate-700">
                      {currentMonth.toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={nextMonth}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(
                    (day) => (
                      <div key={day}>{day}</div>
                    ),
                  )}
                </div>

                <div className="mt-3 grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const key = getDateKey(day);
                    const dayTasks = tasksByDate.get(key) || [];
                    const isCurrentMonth =
                      day.getMonth() === currentMonth.getMonth();
                    const isSelected = key === selectedDateKey;
                    const hasPending = dayTasks.some((task) => !task.done);
                    const hasDone = dayTasks.some((task) => task.done);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => selectCalendarDay(day)}
                        className={`min-h-24 rounded-3xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-[var(--cdb-blue)] bg-blue-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50'
                        } ${!isCurrentMonth ? 'opacity-45' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-black text-[var(--cdb-dark)]">
                            {day.getDate()}
                          </span>

                          {dayTasks.length > 0 && (
                            <span className="rounded-full bg-[var(--cdb-blue)] px-2 py-0.5 text-[10px] font-black text-white">
                              {dayTasks.length}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {hasPending && (
                            <span className="h-2 w-2 rounded-full bg-yellow-500" />
                          )}

                          {hasDone && (
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                          )}
                        </div>

                        {dayTasks[0] && (
                          <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-500">
                            {dayTasks[0].title}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                      Atividades da data
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      {formatDate(`${selectedDateKey}T12:00:00`)}
                    </p>
                  </div>

                  <span className="w-fit rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                    {selectedDateTasks.length} atividade(s)
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                      Carregando agenda...
                    </div>
                  ) : selectedDateTasks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <div className="text-4xl">🗓️</div>

                      <h3 className="mt-3 text-lg font-black text-[var(--cdb-dark)]">
                        Nenhuma atividade nesta data
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Cadastre uma nova atividade no formulário ao lado.
                      </p>
                    </div>
                  ) : (
                    selectedDateTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`rounded-3xl border p-4 ${
                          task.done
                            ? 'border-green-200 bg-green-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {task.done ? (
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                                  Feita
                                </span>
                              ) : (
                                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-700">
                                  Pendente
                                </span>
                              )}
                            </div>

                            <h3
                              className={`mt-3 text-lg font-black ${
                                task.done
                                  ? 'text-green-800 line-through'
                                  : 'text-[var(--cdb-dark)]'
                              }`}
                            >
                              {task.title}
                            </h3>

                            {task.description && (
                              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => confirmToggleDone(task)}
                              className={`rounded-2xl px-4 py-2 text-sm font-black text-white ${
                                task.done
                                  ? 'bg-yellow-500 hover:bg-yellow-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {task.done ? 'Reabrir' : 'Marcar feito'}
                            </button>

                            <button
                              type="button"
                              onClick={() => editTask(task)}
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => confirmDeleteTask(task)}
                              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 hover:bg-red-100"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <form
                onSubmit={saveTask}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6"
              >
                <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                  {editingTaskId ? 'Editar atividade' : 'Nova atividade'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Cadastre atividades administrativas visíveis apenas para ADMIN.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Título *
                    </label>

                    <input
                      value={form.title}
                      onChange={(event) => updateForm('title', event.target.value)}
                      placeholder="Ex: Conferir documentos do jogo"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Descrição
                    </label>

                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        updateForm('description', event.target.value)
                      }
                      rows={4}
                      placeholder="Observações da atividade"
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Data *
                    </label>

                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(event) => updateForm('dueDate', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 rounded-2xl bg-[var(--cdb-blue)] px-4 py-3 text-sm font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving
                        ? 'Salvando...'
                        : editingTaskId
                          ? 'Salvar alterações'
                          : 'Cadastrar atividade'}
                    </button>

                    {editingTaskId && (
                      <button
                        type="button"
                        onClick={confirmCancelEdit}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </form>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
                <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                  Resumo rápido
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-yellow-50 px-4 py-3">
                    <span className="text-sm font-bold text-yellow-700">
                      Para hoje
                    </span>
                    <strong className="text-yellow-700">
                      {todayTasks.length}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-yellow-50 px-4 py-3">
                    <span className="text-sm font-bold text-yellow-700">
                      Pendentes
                    </span>
                    <strong className="text-yellow-700">
                      {pendingTasks.length}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-green-50 px-4 py-3">
                    <span className="text-sm font-bold text-green-700">
                      Feitas
                    </span>
                    <strong className="text-green-700">
                      {completedTasks.length}
                    </strong>
                  </div>
                </div>
              </div>
            </aside>
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
