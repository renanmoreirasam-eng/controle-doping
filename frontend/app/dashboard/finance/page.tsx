'use client';

import { useEffect, useMemo, useState } from 'react';

import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';
import { getUser } from '../../../services/auth';

type Summary = {
  receivable: number;
  received: number;
  payable: number;
  paid: number;
  pendingPayable: number;
  pendingReceivable: number;
  operationalBalance: number;
  projectedBalance: number;
};

type Entry = {
  id: string;
  direction: 'PAYABLE' | 'RECEIVABLE';
  type: string;
  description: string;
  amount: string | number;
  settledAmount: string | number;
  status: string;
  dueDate?: string;
  settledAt?: string;
  official?: {
    pixKey?: string;
    user?: { name?: string };
  };
  match?: {
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    stadium?: { name?: string; city?: string };
    championship?: { name?: string };
  };
  attachments?: Array<{
    id: string;
    fileName: string;
    dataUrl: string;
  }>;
};

const statusLabel: Record<string, string> = {
  SCHEDULED: 'Programado',
  PENDING: 'Pendente',
  PARTIALLY_PAID: 'Pago parcialmente',
  PAID: 'Pago',
  PARTIALLY_RECEIVED: 'Recebido parcialmente',
  RECEIVED: 'Recebido',
  CANCELED: 'Cancelado',
  UNDER_REVIEW: 'Em conferência',
  REVERSED: 'Estornado',
};

function currency(value: number | string | undefined) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

function date(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(value));
}

export default function FinancePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'PAYABLE' | 'RECEIVABLE'>('PAYABLE');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState('');

  async function load() {
    setLoading(true);
    setMessage('');

    try {
      const [summaryResponse, entriesResponse] = await Promise.all([
        api.get('/finance/summary'),
        api.get('/finance/entries'),
      ]);

      setSummary(summaryResponse.data);
      setEntries(entriesResponse.data);
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          'Não foi possível carregar o financeiro.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const user = getUser();
    setUserRole(String(user?.role || user?.user?.role || '').toUpperCase());
    load();
  }, []);

  const filtered = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.direction === tab && (!status || entry.status === status),
      ),
    [entries, tab, status],
  );

  function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function settle(entry: Entry) {
    const label =
      entry.direction === 'PAYABLE' ? 'pagamento' : 'recebimento';

    if (!window.confirm(`Confirmar ${label} de ${currency(entry.amount)}?`)) {
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/png,image/jpeg';

    input.onchange = async () => {
      const file = input.files?.[0];
      const receiptDataUrl = file ? await fileToDataUrl(file) : undefined;

      try {
        const endpoint =
          entry.direction === 'PAYABLE'
            ? `/finance/entries/${entry.id}/pay`
            : `/finance/entries/${entry.id}/receive`;

        await api.patch(endpoint, {
          paymentMethod: entry.direction === 'PAYABLE' ? 'PIX' : undefined,
          pixKeyUsed:
            entry.direction === 'PAYABLE' ? entry.official?.pixKey : undefined,
          receiptFileName: file?.name,
          receiptMimeType: file?.type,
          receiptDataUrl,
        });

        setMessage(
          entry.direction === 'PAYABLE'
            ? 'Pagamento registrado com sucesso.'
            : 'Recebimento registrado com sucesso.',
        );
        await load();
      } catch (error: any) {
        setMessage(
          error?.response?.data?.message ||
            'Não foi possível atualizar o lançamento.',
        );
      }
    };

    input.click();
  }

  async function payBatch() {
    if (!selected.length) return;

    const selectedEntries = entries.filter((item) =>
      selected.includes(item.id),
    );

    const names = new Set(
      selectedEntries.map((item) => item.official?.user?.name || ''),
    );

    if (names.size !== 1) {
      setMessage('Selecione lançamentos do mesmo beneficiário.');
      return;
    }

    const total = selectedEntries.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    if (!window.confirm(`Registrar PIX em lote de ${currency(total)}?`)) {
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/png,image/jpeg';

    input.onchange = async () => {
      const file = input.files?.[0];
      const receiptDataUrl = file ? await fileToDataUrl(file) : undefined;

      try {
        await api.post('/finance/batches', {
          entryIds: selected,
          paymentMethod: 'PIX',
          pixKeyUsed: selectedEntries[0]?.official?.pixKey,
          receiptFileName: file?.name,
          receiptMimeType: file?.type,
          receiptDataUrl,
        });

        setSelected([]);
        setMessage('Pagamento em lote registrado com sucesso.');
        await load();
      } catch (error: any) {
        setMessage(
          error?.response?.data?.message ||
            'Não foi possível registrar o lote.',
        );
      }
    };

    input.click();
  }

  const cards = [
    ['A receber', summary?.pendingReceivable],
    ['Recebido', summary?.received],
    ['A pagar', summary?.pendingPayable],
    ['Pago', summary?.paid],
    ['Saldo operacional', summary?.operationalBalance],
    ['Saldo projetado', summary?.projectedBalance],
  ];

  if (userRole && userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[var(--cdb-light)] lg:flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <h1 className="text-2xl font-black text-slate-900">
              Acesso restrito
            </h1>
            <p className="mt-2 text-slate-600">
              O módulo financeiro está disponível somente para administradores.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cdb-light)] lg:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <p className="text-sm font-bold text-[var(--cdb-blue)]">
              Dashboard / Financeiro
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Gestão financeira
            </h1>
            <p className="mt-2 text-slate-600">
              Controle de valores pagos aos profissionais, despesas de
              deslocamento e recebimentos da CBF.
            </p>
          </div>

          {message && (
            <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-900">
              {message}
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-bold text-slate-500">{label}</p>
                <p className="mt-3 text-2xl font-black text-slate-900">
                  {currency(value as number)}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTab('PAYABLE');
                    setSelected([]);
                  }}
                  className={`rounded-2xl px-4 py-3 font-bold ${
                    tab === 'PAYABLE'
                      ? 'bg-[var(--cdb-blue)] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Pagamentos
                </button>
                <button
                  onClick={() => {
                    setTab('RECEIVABLE');
                    setSelected([]);
                  }}
                  className={`rounded-2xl px-4 py-3 font-bold ${
                    tab === 'RECEIVABLE'
                      ? 'bg-[var(--cdb-blue)] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Recebimentos
                </button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                >
                  <option value="">Todos os status</option>
                  {Object.entries(statusLabel).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>

                {tab === 'PAYABLE' && selected.length > 0 && (
                  <button
                    onClick={payBatch}
                    className="rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-white"
                  >
                    Pagar selecionados ({selected.length})
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <p className="py-10 text-center text-slate-500">Carregando...</p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      {tab === 'PAYABLE' && <th className="p-3">Selecionar</th>}
                      <th className="p-3">Jogo</th>
                      <th className="p-3">Beneficiário</th>
                      <th className="p-3">Descrição</th>
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry, index) => {
                      const settled = ['PAID', 'RECEIVED'].includes(entry.status);
                      return (
                        <tr
                          key={entry.id}
                          className={`border-b border-slate-100 ${
                            index % 2 ? 'bg-slate-50/70' : ''
                          }`}
                        >
                          {tab === 'PAYABLE' && (
                            <td className="p-3">
                              <input
                                type="checkbox"
                                disabled={settled}
                                checked={selected.includes(entry.id)}
                                onChange={(event) =>
                                  setSelected((current) =>
                                    event.target.checked
                                      ? [...current, entry.id]
                                      : current.filter((id) => id !== entry.id),
                                  )
                                }
                              />
                            </td>
                          )}
                          <td className="p-3">
                            <p className="font-bold text-slate-900">
                              {entry.match?.homeTeam} x {entry.match?.awayTeam}
                            </p>
                            <p className="text-xs text-slate-500">
                              {entry.match?.stadium?.name} •{' '}
                              {date(entry.match?.matchDate)}
                            </p>
                          </td>
                          <td className="p-3">
                            {entry.official?.user?.name || 'CDB'}
                          </td>
                          <td className="p-3">{entry.description}</td>
                          <td className="p-3">{date(entry.dueDate)}</td>
                          <td className="p-3 font-black">
                            {currency(entry.amount)}
                          </td>
                          <td className="p-3">
                            <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">
                              {statusLabel[entry.status] || entry.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {!settled ? (
                              <button
                                onClick={() => settle(entry)}
                                className="rounded-xl bg-[var(--cdb-blue)] px-3 py-2 font-bold text-white"
                              >
                                {entry.direction === 'PAYABLE'
                                  ? 'Marcar pago'
                                  : 'Marcar recebido'}
                              </button>
                            ) : (
                              <span className="font-semibold text-emerald-700">
                                Concluído
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!filtered.length && (
                  <p className="py-10 text-center text-slate-500">
                    Nenhum lançamento encontrado.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
