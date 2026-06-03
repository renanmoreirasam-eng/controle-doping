'use client';

import Link from 'next/link';

import { Sidebar } from '../../../components/Sidebar';

export default function DrawnAthletesPage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--cdb-light)] lg:flex-row">
      <Sidebar />

      <div className="min-w-0 flex-1 overflow-x-hidden p-4 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm lg:p-8">
          <span className="inline-flex w-fit items-center rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-700">
            Consulta indisponível
          </span>

          <h1 className="mt-4 text-2xl font-black text-[var(--cdb-dark)] lg:text-4xl">
            Consulta de atletas sorteados bloqueada
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 lg:text-base">
            Por questões de privacidade, a consulta dos atletas sorteados não está disponível para nenhum perfil.
          </p>

          <Link
            href="/dashboard/matches"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
          >
            Voltar para jogos
          </Link>
        </div>
      </div>
    </main>
  );
}
