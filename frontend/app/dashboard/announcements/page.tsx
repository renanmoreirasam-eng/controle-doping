'use client';

import { useEffect, useMemo, useState } from 'react';

import { ConfirmModal } from '../../../components/ConfirmModal';
import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';

type AnnouncementTargetRole = 'ALL' | 'COORDINATOR' | 'OFFICIAL';

type Announcement = {
  id: string;
  title: string;
  message: string;
  targetRole: AnnouncementTargetRole;
  active: boolean;
  createdByName?: string | null;
  createdByEmail?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    acknowledgements: number;
  };
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

const initialModalState: ModalState = {
  open: false,
  title: '',
  message: '',
  variant: 'default',
  confirmText: 'Fechar',
};

const targetRoleOptions: {
  value: AnnouncementTargetRole;
  label: string;
  description: string;
}[] = [
  {
    value: 'ALL',
    label: 'Todos',
    description: 'Coordenadores e oficiais.',
  },
  {
    value: 'COORDINATOR',
    label: 'Coordenadores',
    description: 'Somente usuários com perfil Coordenador.',
  },
  {
    value: 'OFFICIAL',
    label: 'Oficiais',
    description: 'Somente usuários com perfil Oficial.',
  },
];

function getTargetRoleLabel(targetRole: AnnouncementTargetRole) {
  if (targetRole === 'ALL') return 'Todos';
  if (targetRole === 'COORDINATOR') return 'Coordenadores';
  if (targetRole === 'OFFICIAL') return 'Oficiais';

  return targetRole;
}

function getTargetRoleClass(targetRole: AnnouncementTargetRole) {
  if (targetRole === 'ALL') {
    return 'border-blue-100 bg-blue-50 text-[var(--cdb-blue)]';
  }

  if (targetRole === 'COORDINATOR') {
    return 'border-purple-100 bg-purple-50 text-purple-700';
  }

  return 'border-emerald-100 bg-emerald-50 text-emerald-700';
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-BR');
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<AnnouncementTargetRole>('ALL');

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(initialModalState);

  const activeAnnouncements = announcements.filter((announcement) => announcement.active);
  const inactiveAnnouncements = announcements.filter((announcement) => !announcement.active);

  const filteredAnnouncements = useMemo(() => {
    const term = search.trim().toLowerCase();

    return announcements.filter((announcement) => {
      if (!term) return true;

      const value = `
        ${announcement.title}
        ${announcement.message}
        ${getTargetRoleLabel(announcement.targetRole)}
        ${announcement.createdByName || ''}
        ${announcement.createdByEmail || ''}
      `.toLowerCase();

      return value.includes(term);
    });
  }, [announcements, search]);

  async function loadAnnouncements() {
    try {
      setLoading(true);

      const response = await api.get('/announcements');

      setAnnouncements(response.data || []);
    } catch (error: any) {
      showMessage(
        'Erro ao carregar comunicados',
        error.response?.data?.message || 'Não foi possível carregar os comunicados.',
        'danger',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  function closeModal() {
    setModal(initialModalState);
  }

  function showMessage(
    modalTitle: string,
    modalMessage: string,
    variant: ModalVariant = 'default',
  ) {
    setModal({
      open: true,
      title: modalTitle,
      message: modalMessage,
      variant,
      confirmText: 'Fechar',
    });
  }

  function showConfirm(params: {
    modalTitle: string;
    modalMessage: string;
    variant?: ModalVariant;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }) {
    setModal({
      open: true,
      title: params.modalTitle,
      message: params.modalMessage,
      variant: params.variant || 'warning',
      confirmText: params.confirmText || 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: params.onConfirm,
    });
  }

  function clearForm() {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setTargetRole('ALL');
  }

  function startEdit(announcement: Announcement) {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setMessage(announcement.message);
    setTargetRole(announcement.targetRole);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function handleSubmit() {
    if (!title.trim()) {
      showMessage('Título obrigatório', 'Informe o título do comunicado.', 'warning');
      return;
    }

    if (!message.trim()) {
      showMessage('Mensagem obrigatória', 'Informe a mensagem do comunicado.', 'warning');
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await api.patch(`/announcements/${editingId}`, {
          title,
          message,
          targetRole,
        });

        showMessage('Comunicado atualizado', 'Comunicado atualizado com sucesso.', 'success');
      } else {
        await api.post('/announcements', {
          title,
          message,
          targetRole,
        });

        showMessage('Comunicado enviado', 'Comunicado criado com sucesso.', 'success');
      }

      clearForm();
      await loadAnnouncements();
    } catch (error: any) {
      showMessage(
        editingId ? 'Erro ao atualizar comunicado' : 'Erro ao criar comunicado',
        error.response?.data?.message || 'Não foi possível salvar o comunicado.',
        'danger',
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleActive(announcement: Announcement) {
    showConfirm({
      modalTitle: announcement.active ? 'Desativar comunicado' : 'Ativar comunicado',
      modalMessage: announcement.active
        ? 'Deseja desativar este comunicado? Ele deixará de aparecer para os usuários que ainda não deram ciência.'
        : 'Deseja ativar este comunicado novamente?',
      variant: announcement.active ? 'warning' : 'success',
      confirmText: announcement.active ? 'Desativar' : 'Ativar',
      onConfirm: async () => {
        try {
          await api.patch(`/announcements/${announcement.id}`, {
            active: !announcement.active,
          });

          await loadAnnouncements();

          setModal({
            open: true,
            title: announcement.active ? 'Comunicado desativado' : 'Comunicado ativado',
            message: announcement.active
              ? 'Comunicado desativado com sucesso.'
              : 'Comunicado ativado com sucesso.',
            variant: 'success',
            confirmText: 'Fechar',
          });
        } catch (error: any) {
          setModal({
            open: true,
            title: 'Erro ao alterar comunicado',
            message: error.response?.data?.message || 'Não foi possível alterar o comunicado.',
            variant: 'danger',
            confirmText: 'Fechar',
          });
        }
      },
    });
  }

  function deleteAnnouncement(announcement: Announcement) {
    showConfirm({
      modalTitle: 'Excluir comunicado',
      modalMessage: 'Deseja realmente excluir este comunicado? Essa ação não poderá ser desfeita.',
      variant: 'danger',
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/announcements/${announcement.id}`);

          await loadAnnouncements();

          setModal({
            open: true,
            title: 'Comunicado excluído',
            message: 'Comunicado excluído com sucesso.',
            variant: 'success',
            confirmText: 'Fechar',
          });
        } catch (error: any) {
          setModal({
            open: true,
            title: 'Erro ao excluir comunicado',
            message: error.response?.data?.message || 'Não foi possível excluir o comunicado.',
            variant: 'danger',
            confirmText: 'Fechar',
          });
        }
      },
    });
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <header className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative p-6 lg:p-8">
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                    📢 Comunicação
                  </span>

                  <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--cdb-dark)] lg:text-5xl">
                    Comunicados
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 lg:text-base">
                    Envie avisos obrigatórios para coordenadores, oficiais ou todos os usuários. O comunicado aparece até o usuário clicar em “Estou ciente”.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap lg:justify-end">
                  <div className="rounded-3xl border border-blue-100 bg-blue-50 px-4 py-3 text-center">
                    <p className="text-2xl font-black text-[var(--cdb-blue)]">
                      {activeAnnouncements.length}
                    </p>
                    <p className="text-xs font-bold text-slate-500">
                      Ativos
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                    <p className="text-2xl font-black text-slate-700">
                      {inactiveAnnouncements.length}
                    </p>
                    <p className="text-xs font-bold text-slate-500">
                      Inativos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="px-4 pb-8 lg:px-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6 h-fit">
              <div className="mb-5">
                <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                  {editingId ? 'Editar comunicado' : 'Novo comunicado'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Defina o público-alvo e a mensagem que será exibida no sistema.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block px-2 text-xs font-bold text-slate-700">
                    Título *
                  </label>

                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Ex.: Orientação para próximas partidas"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-[var(--cdb-blue)]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block px-2 text-xs font-bold text-slate-700">
                    Público-alvo *
                  </label>

                  <div className="grid grid-cols-1 gap-2">
                    {targetRoleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTargetRole(option.value)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          targetRole === option.value
                            ? 'border-[var(--cdb-blue)] bg-blue-50'
                            : 'border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        <p className="font-black text-[var(--cdb-dark)]">
                          {option.label}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block px-2 text-xs font-bold text-slate-700">
                    Mensagem *
                  </label>

                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Digite o comunicado..."
                    rows={7}
                    className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-[var(--cdb-blue)]/20"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 font-black text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? 'Salvando...'
                      : editingId
                        ? 'Salvar edição'
                        : 'Enviar comunicado'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={clearForm}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6 min-w-0">
              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                    Comunicados cadastrados
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Gerencie os comunicados enviados aos usuários.
                  </p>
                </div>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar comunicado..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-[var(--cdb-blue)]/20 lg:max-w-sm"
                />
              </div>

              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
                  Carregando comunicados...
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <div className="mb-3 text-5xl">📢</div>
                  <h3 className="text-xl font-black text-slate-900">
                    Nenhum comunicado encontrado
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Crie um comunicado para que ele apareça para os usuários no sistema.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`${getTargetRoleClass(
                                announcement.targetRole,
                              )} rounded-full border px-3 py-1 text-xs font-black`}
                            >
                              {getTargetRoleLabel(announcement.targetRole)}
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-black ${
                                announcement.active
                                  ? 'border-green-100 bg-green-50 text-green-700'
                                  : 'border-slate-200 bg-slate-100 text-slate-500'
                              }`}
                            >
                              {announcement.active ? 'Ativo' : 'Inativo'}
                            </span>

                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500">
                              {announcement._count?.acknowledgements || 0} ciência(s)
                            </span>
                          </div>

                          <h3 className="mt-3 break-words text-lg font-black text-[var(--cdb-dark)]">
                            {announcement.title}
                          </h3>

                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                            {announcement.message}
                          </p>

                          <p className="mt-3 text-xs text-slate-400">
                            Criado em {formatDate(announcement.createdAt)}
                            {announcement.createdByName
                              ? ` por ${announcement.createdByName}`
                              : ''}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() => startEdit(announcement)}
                            className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-[var(--cdb-blue)] transition hover:bg-blue-100"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleActive(announcement)}
                            className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                              announcement.active
                                ? 'border-yellow-100 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                : 'border-green-100 bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {announcement.active ? 'Desativar' : 'Ativar'}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteAnnouncement(announcement)}
                            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
