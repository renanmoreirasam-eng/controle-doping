'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';
import { api } from '../services/api';

const TOKEN_COOKIE_NAME = 'token';
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: 'danger' | 'success' | 'warning' | 'default';
};

function saveAuthCookie(token: string) {
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; path=/; max-age=${TOKEN_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function getRedirectPath() {
  if (typeof window === 'undefined') return '/dashboard';

  const searchParams = new URLSearchParams(window.location.search);
  const redirect = searchParams.get('redirect');

  if (!redirect) return '/dashboard';

  if (!redirect.startsWith('/')) return '/dashboard';
  if (redirect.startsWith('//')) return '/dashboard';

  return redirect;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      const response = await api.post('/auth/login', {
        email,
        password,
      });

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

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      saveAuthCookie(token);

      router.push(getRedirectPath());
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
    <main className="min-h-screen cdb-login-bg flex items-center justify-center p-4 lg:p-8">
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-14 items-center">
        <section className="hidden lg:block text-white">
          <div className="inline-flex items-center gap-3 bg-white/12 border border-white/15 rounded-full px-5 py-3 mb-8 backdrop-blur-sm">
            <span className="w-3 h-3 rounded-full bg-[var(--cdb-green)]" />
            <span className="text-sm font-semibold">
              Sistema operacional de controle
            </span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-black leading-tight max-w-2xl">
            Controle de Doping Brasil
          </h1>

          <p className="text-blue-100 text-lg mt-5 max-w-xl leading-relaxed">
            Gestão de jogos, escalas, inspeções, sorteios e registros operacionais em uma plataforma segura e responsiva.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-10 max-w-2xl">
            <div className="bg-white/12 border border-white/15 rounded-3xl p-5 backdrop-blur-sm">
              <div className="w-11 h-11 rounded-2xl bg-[var(--cdb-green)] flex items-center justify-center text-xl mb-4">
                ✓
              </div>
              <p className="font-bold">Segurança</p>
              <p className="text-sm text-blue-100 mt-1">Dados protegidos</p>
            </div>

            <div className="bg-white/12 border border-white/15 rounded-3xl p-5 backdrop-blur-sm">
              <div className="w-11 h-11 rounded-2xl bg-[var(--cdb-yellow)] text-[var(--cdb-blue)] flex items-center justify-center text-xl mb-4">
                ⚑
              </div>
              <p className="font-bold">Operação</p>
              <p className="text-sm text-blue-100 mt-1">Fluxo por etapas</p>
            </div>

            <div className="bg-white/12 border border-white/15 rounded-3xl p-5 backdrop-blur-sm">
              <div className="w-11 h-11 rounded-2xl bg-white text-[var(--cdb-blue)] flex items-center justify-center text-xl mb-4">
                ⚽
              </div>
              <p className="font-bold">Esporte</p>
              <p className="text-sm text-blue-100 mt-1">Controle em campo</p>
            </div>
          </div>
        </section>

        <section className="cdb-card rounded-[34px] p-6 lg:p-8">
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

            <h2 className="text-3xl lg:text-4xl font-black text-[var(--cdb-blue)]">
              Controle Doping
            </h2>

            <p className="text-slate-500 mt-2">
              Acesse o sistema operacional
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
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">
                Senha
              </label>

              <input
                type="password"
                placeholder="Digite sua senha"
                className="w-full border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--cdb-blue)] focus:border-transparent transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              className="w-full bg-[var(--cdb-blue)] hover:bg-[var(--cdb-blue-dark)] disabled:bg-slate-400 text-white rounded-2xl p-4 font-black transition shadow-lg shadow-blue-950/20"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 mt-7 pt-6 border-t border-slate-100 text-sm text-slate-500">
            <span className="text-[var(--cdb-green)]">🛡️</span>
            <span>Sistema seguro e acesso restrito</span>
          </div>
        </section>
      </div>

      <div className="absolute bottom-4 left-0 right-0 z-10 px-4 text-center">
        <p className="text-xs font-semibold text-white/70">
          Controle de Doping © 2026 · Desenvolvido por{' '}
          <span className="font-black text-white">SampSoluções</span>
        </p>
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
