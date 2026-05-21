'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '../services/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleLogin() {
    try {
      setLoading(true);

      const response = await api.post(
        '/auth/login',
        {
          email,
          password,
        },
      );

      localStorage.setItem(
        'token',
        response.data.accessToken,
      );

      localStorage.setItem(
        'user',
        JSON.stringify(response.data.user),
      );

      router.push('/dashboard');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao realizar login',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              🧪
            </div>

            <h1 className="text-4xl font-black">
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
    </main>
  );
}