'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ConfirmModal } from '../../components/ConfirmModal';
import { api } from '../../services/api';

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: 'danger' | 'success' | 'warning' | 'default';
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: '',
    message: '',
    variant: 'default',
  });

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

  async function handleForgotPassword() {
    if (!email.trim()) {
      showModal(
        'Informe o e-mail',
        'Digite o e-mail cadastrado para solicitar a recuperação de senha.',
        'warning',
      );
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/forgot-password', {
        email,
      });

      showModal(
        'Verifique seu e-mail',
        'Se o e-mail estiver cadastrado, enviaremos um link para redefinição de senha.',
        'success',
      );
    } catch (error: any) {
      showModal(
        'Não foi possível solicitar a recuperação',
        error.response?.data?.message ||
          'Tente novamente em instantes.',
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
            Recuperar senha
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Informe seu e-mail para receber o link de redefinição de senha.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">
              E-mail
            </label>

            <input
              type="email"
              placeholder="Digite seu e-mail"
              className="w-full border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-transparent transition"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleForgotPassword();
                }
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            className="w-full bg-[var(--cdb-blue)] hover:bg-[var(--cdb-blue-dark)] disabled:bg-slate-400 text-white rounded-2xl p-4 font-black transition shadow-lg shadow-blue-950/20"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </div>

        <div className="mt-7 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="text-sm font-bold text-[var(--cdb-blue)] hover:underline"
          >
            Voltar para o login
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
