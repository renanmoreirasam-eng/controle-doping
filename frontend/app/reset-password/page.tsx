'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ConfirmModal } from '../../components/ConfirmModal';
import { api } from '../../services/api';

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: 'danger' | 'success' | 'warning' | 'default';
};

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: '',
    message: '',
    variant: 'default',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') || '');
  }, []);

  function showModal(
    title: string,
    message: string,
    variant: ModalState['variant'] = 'default',
  ) {
    setModal({
      open: true,
      title,
      message,
      variant,
    });
  }

  function closeModal() {
    setModal((current) => ({
      ...current,
      open: false,
    }));
  }

  async function handleResetPassword() {
    if (!token) {
      showModal(
        'Link inválido',
        'O link de recuperação não possui token. Solicite um novo link.',
        'warning',
      );
      return;
    }

    if (password.length < 6) {
      showModal(
        'Senha muito curta',
        'A nova senha deve ter pelo menos 6 caracteres.',
        'warning',
      );
      return;
    }

    if (password !== confirmPassword) {
      showModal(
        'Confirmação inválida',
        'A confirmação da senha não confere.',
        'warning',
      );
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });

      setResetDone(true);
      setPassword('');
      setConfirmPassword('');

      showModal(
        'Senha redefinida',
        'Sua senha foi redefinida com sucesso. Você já pode acessar o sistema.',
        'success',
      );
    } catch (error: any) {
      showModal(
        'Não foi possível redefinir a senha',
        error.response?.data?.message ||
          'O link pode estar inválido ou expirado. Solicite um novo link.',
        'danger',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen cdb-login-bg flex items-center justify-center p-4 lg:p-8">
      <section className="cdb-card w-full max-w-md rounded-[34px] p-6 lg:p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-slate-100">
              <img
                src="/CDB_logo_colorido_retangular.png"
                alt="Controle de Doping Brasil"
                className="h-24 lg:h-28 w-auto object-contain"
              />
            </div>
          </div>

          <h1 className="text-3xl font-black text-[var(--cdb-blue)]">
            Nova senha
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Crie uma nova senha para acessar o Controle de Doping.
          </p>
        </div>

        {!token && (
          <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
            Link inválido ou sem token. Solicite uma nova recuperação de senha.
          </div>
        )}

        {resetDone ? (
          <Link
            href="/"
            className="mt-4 block w-full rounded-2xl bg-[var(--cdb-blue)] p-4 text-center font-black text-white transition hover:bg-[var(--cdb-blue-dark)]"
          >
            Voltar para o login
          </Link>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">
                Nova senha
              </label>

              <input
                type="password"
                placeholder="Digite a nova senha"
                className="w-full border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-transparent transition"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">
                Confirmar nova senha
              </label>

              <input
                type="password"
                placeholder="Confirme a nova senha"
                className="w-full border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-transparent transition"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleResetPassword();
                  }
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading || !token}
              className="w-full bg-[var(--cdb-blue)] hover:bg-[var(--cdb-blue-dark)] disabled:bg-slate-400 text-white rounded-2xl p-4 font-black transition shadow-lg shadow-blue-950/20"
            >
              {loading ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </div>
        )}

        <div className="mt-7 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/forgot-password"
            className="text-sm font-bold text-[var(--cdb-blue)] hover:underline"
          >
            Solicitar novo link
          </Link>
        </div>
      </section>

      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmText="Entendi"
        cancelText="Fechar"
        variant={modal.variant}
        onCancel={closeModal}
        onConfirm={closeModal}
      />
    </main>
  );
}
