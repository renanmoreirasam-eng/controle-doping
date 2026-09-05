'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../services/api';

type ConfirmationData = {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'REFUSED';
  respondedAt?: string | null;
  responseMethod?: string | null;
  role: 'DCO' | 'ASSISTANT';
  official: { name: string };
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    championship?: { name?: string | null } | null;
    stadium?: {
      name?: string | null;
      city?: string | null;
      state?: string | null;
    } | null;
  };
};

function getErrorMessage(error: any, fallback: string) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(' ') : String(message);
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function ConfirmarEscalaPage() {
  const params = useParams<{ token: string }>();
  const token = String(params?.token || '');

  const [data, setData] = useState<ConfirmationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<'CONFIRM' | 'REFUSE' | null>(null);
  const [error, setError] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  async function loadConfirmation() {
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const response = await api.get<ConfirmationData>(
        `/scale-confirmation/${encodeURIComponent(token)}`,
      );

      setData(response.data);
    } catch (err: any) {
      setData(null);
      setError(
        getErrorMessage(err, 'Não foi possível carregar os dados desta escala.'),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConfirmation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function respond(action: 'confirm' | 'refuse') {
    if (!token || submitting || data?.status !== 'PENDING') return;

    try {
      setSubmitting(action === 'confirm' ? 'CONFIRM' : 'REFUSE');
      setError('');

      await api.post(
        `/scale-confirmation/${encodeURIComponent(token)}/${action}`,
      );

      if (action === 'confirm') {
        setShowSuccessAnimation(true);

        window.setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 2200);
      }

      await loadConfirmation();
    } catch (err: any) {
      setError(
        getErrorMessage(
          err,
          action === 'confirm'
            ? 'Não foi possível confirmar a escala.'
            : 'Não foi possível recusar a escala.',
        ),
      );
      await loadConfirmation();
    } finally {
      setSubmitting(null);
    }
  }

  const roleLabel = data?.role === 'DCO' ? 'DCO' : 'Assistente';
  const stadiumParts = [
    data?.match?.stadium?.name,
    data?.match?.stadium?.city,
    data?.match?.stadium?.state,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-slate-200">
            <img
              src="/icon-192.png"
              alt="CDB"
              className="h-full w-full object-contain"
            />
          </div>

          <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
            Controle de Doping
          </p>

          <h1 className="mt-2 text-3xl font-black text-[var(--cdb-dark)]">
            Confirmação de escala
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Confira os dados abaixo antes de responder.
          </p>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--cdb-blue)]" />
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Carregando sua escala...
              </p>
            </div>
          ) : error && !data ? (
            <div className="p-8 text-center">
              <div className="text-5xl">⚠️</div>
              <h2 className="mt-4 text-xl font-black text-slate-900">
                Link indisponível
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
            </div>
          ) : data ? (
            <>
              <div
                className={`border-b px-5 py-4 text-center ${
                  data.status === 'CONFIRMED'
                    ? 'border-green-200 bg-green-50'
                    : data.status === 'REFUSED'
                      ? 'border-red-200 bg-red-50'
                      : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <p
                  className={`text-sm font-black ${
                    data.status === 'CONFIRMED'
                      ? 'text-green-700'
                      : data.status === 'REFUSED'
                        ? 'text-red-700'
                        : 'text-yellow-700'
                  }`}
                >
                  {data.status === 'CONFIRMED'
                    ? '✅ Escala confirmada'
                    : data.status === 'REFUSED'
                      ? '❌ Escala recusada'
                      : '⏳ Aguardando sua resposta'}
                </p>

                {data.respondedAt && (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Respondida em {formatDate(data.respondedAt)}
                  </p>
                )}
              </div>

              <div className="p-5 sm:p-7">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                  {data.match.championship?.name && (
                    <div className="mb-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Competição
                      </p>
                      <p className="mt-2 text-sm font-black text-[var(--cdb-blue)]">
                        🏆 {data.match.championship.name}
                      </p>
                    </div>
                  )}

                  <div className={data.match.championship?.name ? "border-t border-slate-200 pt-4" : ""}>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Partida
                    </p>

                    <div className="mt-3 flex items-center justify-center gap-3 text-xl font-black text-[var(--cdb-dark)] sm:text-2xl">
                      <span>{data.match.homeTeam}</span>
                      <span className="text-slate-400">×</span>
                      <span>{data.match.awayTeam}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Data e horário
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-800">
                      📅 {formatDate(data.match.matchDate)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Função
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-800">
                      👤 {roleLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 sm:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Local
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-800">
                      📍 {stadiumParts.length > 0 ? stadiumParts.join(' - ') : '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 sm:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Oficial
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-800">
                      {data.official.name || '-'}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                  </div>
                )}

                {data.status === 'PENDING' ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => respond('confirm')}
                      disabled={Boolean(submitting)}
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting === 'CONFIRM'
                        ? 'Confirmando...'
                        : '✅ Confirmar escala'}
                    </button>

                    <button
                      type="button"
                      onClick={() => respond('refuse')}
                      disabled={Boolean(submitting)}
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting === 'REFUSE'
                        ? 'Registrando...'
                        : '❌ Recusar escala'}
                    </button>
                  </div>
                ) : (
                  <div
                    className={`mt-6 rounded-2xl border px-4 py-4 text-center text-sm font-bold ${
                      data.status === 'CONFIRMED'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {data.status === 'CONFIRMED'
                      ? 'Sua participação nesta escala está confirmada.'
                      : 'Sua recusa já foi registrada. Não é necessário responder novamente.'}
                  </div>
                )}

                <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                  Este link é individual e vinculado exclusivamente a esta escala.
                </p>
              </div>
            </>
          ) : null}
        </section>
      </div>

      {showSuccessAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="goal-celebration relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-[2rem] border border-white/20 bg-white px-6 py-8 text-center shadow-2xl">
            <div className="goal-ring absolute left-1/2 top-8 h-36 w-36 -translate-x-1/2 rounded-full border-4 border-emerald-200" />

            <div className="football-ball relative z-10 text-6xl" aria-hidden="true">
              ⚽
            </div>

            <div className="success-check relative z-10 mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-4xl font-black text-white shadow-lg">
              ✓
            </div>

            <h2 className="relative z-10 mt-5 text-3xl font-black text-slate-900">
              Escala confirmada!
            </h2>

            <p className="relative z-10 mt-2 text-base font-bold text-slate-500">
              Nos vemos no jogo ⚽
            </p>

            <div className="goal-confetti goal-confetti-1" />
            <div className="goal-confetti goal-confetti-2" />
            <div className="goal-confetti goal-confetti-3" />
            <div className="goal-confetti goal-confetti-4" />
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes footballShoot {
          0% {
            opacity: 0;
            transform: translate(-120px, 90px) scale(0.4) rotate(-90deg);
          }
          55% {
            opacity: 1;
            transform: translate(12px, -8px) scale(1.15) rotate(180deg);
          }
          75% {
            transform: translate(-5px, 4px) scale(0.95) rotate(250deg);
          }
          100% {
            transform: translate(0, 0) scale(1) rotate(360deg);
          }
        }

        @keyframes successPop {
          0% {
            opacity: 0;
            transform: scale(0.4);
          }
          70% {
            opacity: 1;
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes goalPulse {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.5);
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) scale(1.45);
          }
        }

        @keyframes confettiFall {
          0% {
            opacity: 0;
            transform: translateY(-10px) rotate(0deg);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(130px) rotate(220deg);
          }
        }

        .football-ball {
          animation: footballShoot 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .success-check {
          animation: successPop 480ms ease-out 420ms both;
        }

        .goal-ring {
          animation: goalPulse 900ms ease-out 280ms both;
        }

        .goal-confetti {
          position: absolute;
          top: 20px;
          width: 9px;
          height: 18px;
          border-radius: 999px;
          animation: confettiFall 1100ms ease-out 500ms both;
        }

        .goal-confetti-1 {
          left: 18%;
          background: #16a34a;
        }

        .goal-confetti-2 {
          left: 36%;
          background: #facc15;
          animation-delay: 620ms;
        }

        .goal-confetti-3 {
          right: 30%;
          background: #2563eb;
          animation-delay: 560ms;
        }

        .goal-confetti-4 {
          right: 16%;
          background: #16a34a;
          animation-delay: 680ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .football-ball,
          .success-check,
          .goal-ring,
          .goal-confetti {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
