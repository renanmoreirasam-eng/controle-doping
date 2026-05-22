'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';
import { api } from '../services/api';

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: 'danger' | 'success' | 'warning' | 'default';
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [modal, setModal] =
    useState<ModalState>({
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

  async function handleLogin() {
    if (!email.trim()) {
      showModal(
        'Informe o e-mail',
        'Digite seu e-mail para acessar o sistema.',
        'warning',
      );
      return;
    }

    if (!password.trim()) {
      showModal(
        'Informe a senha',
        'Digite sua senha para acessar o sistema.',
        'warning',
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        '/auth/login',
        {
          email,
          password,
        },
      );

      const token =
        response.data.accessToken ||
        response.data.token ||
        response.data.access_token;

      if (!token) {
        showModal(
          'Erro no login',
          'O backend não retornou um token de acesso.',
          'danger',
        );
        return;
      }

      localStorage.setItem(
        'token',
        token,
      );

      localStorage.setItem(
        'user',
        JSON.stringify(response.data.user),
      );

      router.push('/dashboard');
    } catch (error: any) {
      showModal(
        'Não foi possível entrar',
        error.response?.data?.message ||
          'E-mail ou senha inválidos. Verifique os dados e tente novamente.',
        'danger',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 lg:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-200 p-6 lg:p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              🧪
            </div>

            <h1 className="text-3xl lg:text-4xl font-black">
              Controle Doping
            </h1>

            <p className="text-slate-500 mt-2">
              Sistema operacional de controle
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-2">
                E-mail
              </label>

              <input
                type="email"
                placeholder="Digite seu e-mail"
                className="w-full border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-2">
                Senha
              </label>

              <input
                type="password"
                placeholder="Digite sua senha"
                className="w-full border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-2xl p-4 font-bold transition"
            >
              {loading
                ? 'Entrando...'
                : 'Entrar'}
            </button>
          </div>
        </div>
      </div>

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
