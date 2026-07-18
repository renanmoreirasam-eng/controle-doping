'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Sidebar } from '../../../../components/Sidebar';
import { api } from '../../../../services/api';
import { getUser } from '../../../../services/auth';

type Stadium = { id: string; name: string; city: string; state: string };
type Rate = {
  id: string;
  stadiumId: string;
  validFrom: string;
  validUntil?: string | null;
  dcoFee: string | number;
  assistantFee: string | number;
  travelExpense: string | number;
  notes?: string | null;
  active: boolean;
  stadium: Stadium;
};

const emptyForm = {
  stadiumId: '',
  validFrom: '',
  validUntil: '',
  dcoFee: '',
  assistantFee: '',
  travelExpense: '',
  notes: '',
};

function currency(value: string | number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

function date(value?: string | null) {
  if (!value) return 'Sem término';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(value));
}

export default function FinanceRatesPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStadium, setFilterStadium] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filterStadium) params.set('stadiumId', filterStadium);
      if (filterActive) params.set('active', filterActive);

      const [stadiumResponse, rateResponse] = await Promise.all([
        api.get('/stadiums'),
        api.get(`/finance/rates${params.size ? `?${params.toString()}` : ''}`),
      ]);

      setStadiums(stadiumResponse.data);
      setRates(rateResponse.data);
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          'Não foi possível carregar a tabela financeira.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const user = getUser();
    setRole(String(user?.role || user?.user?.role || '').toUpperCase());
  }, []);

  useEffect(() => {
    load();
  }, [filterStadium, filterActive]);

  const sortedStadiums = useMemo(
    () =>
      [...stadiums].sort((a, b) =>
        `${a.name}-${a.city}`.localeCompare(`${b.name}-${b.city}`),
      ),
    [stadiums],
  );

  function change(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  function startEdit(rate: Rate) {
    setEditingId(rate.id);
    setForm({
      stadiumId: rate.stadiumId,
      validFrom: rate.validFrom.slice(0, 10),
      validUntil: rate.validUntil?.slice(0, 10) || '',
      dcoFee: String(rate.dcoFee),
      assistantFee: String(rate.assistantFee),
      travelExpense: String(rate.travelExpense),
      notes: rate.notes || '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const dcoFee = Number(form.dcoFee);
    const assistantFee = Number(form.assistantFee);
    const travelExpense = Number(form.travelExpense);

    if (!form.stadiumId || !form.validFrom) {
      setError('Selecione o estádio e informe o início da vigência.');
      setSaving(false);
      return;
    }

    if (
      [dcoFee, assistantFee, travelExpense].some(
        (value) => Number.isNaN(value) || value < 0,
      )
    ) {
      setError('Informe valores válidos e maiores ou iguais a zero.');
      setSaving(false);
      return;
    }

    if (form.validUntil && form.validUntil < form.validFrom) {
      setError('O término da vigência não pode ser anterior ao início.');
      setSaving(false);
      return;
    }

    const body = {
      stadiumId: form.stadiumId,
      validFrom: form.validFrom,
      validUntil: form.validUntil || null,
      dcoFee,
      assistantFee,
      travelExpense,
      notes: form.notes.trim() || null,
    };

    try {
      if (editingId) {
        await api.patch(`/finance/rates/${editingId}`, body);
        setMessage('Tabela atualizada com sucesso.');
      } else {
        await api.post('/finance/rates', {
          ...body,
          validUntil: body.validUntil || undefined,
          notes: body.notes || undefined,
        });
        setMessage('Tabela cadastrada com sucesso.');
      }

      cancelEdit();
      await load();
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          'Não foi possível salvar a tabela.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggle(rate: Rate) {
    const action = rate.active ? 'inativar' : 'ativar';
    if (!window.confirm(`Deseja ${action} esta tabela?`)) return;

    try {
      await api.patch(`/finance/rates/${rate.id}/toggle`);
      setMessage(`Tabela ${rate.active ? 'inativada' : 'ativada'} com sucesso.`);
      await load();
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          'Não foi possível alterar a situação.',
      );
    }
  }

  if (role && role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[var(--cdb-light)] lg:flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <h1 className="text-2xl font-black text-slate-900">Acesso restrito</h1>
            <p className="mt-2 text-slate-600">
              Esta página está disponível somente para administradores.
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
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--cdb-blue)]">
                Dashboard / Financeiro / Tabela de valores
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">
                Tabela de valores
              </h1>
              <p className="mt-2 text-slate-600">
                Taxas por estádio e período de vigência.
              </p>
            </div>

            <Link
              href="/dashboard/finance"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center font-bold text-slate-700"
            >
              Voltar ao financeiro
            </Link>
          </div>

          {message && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-900">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-900">
              {error}
            </div>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">
            <h2 className="text-xl font-black text-slate-900">
              {editingId ? 'Editar tabela' : 'Nova tabela'}
            </h2>

            <form onSubmit={submit} className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <label className="md:col-span-2 xl:col-span-1">
                <span className="mb-2 block text-sm font-bold text-slate-700">Estádio</span>
                <select
                  value={form.stadiumId}
                  onChange={(event) => change('stadiumId', event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                  required
                >
                  <option value="">Selecione</option>
                  {sortedStadiums.map((stadium) => (
                    <option key={stadium.id} value={stadium.id}>
                      {stadium.name} — {stadium.city}/{stadium.state}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Início da vigência</span>
                <input
                  type="date"
                  value={form.validFrom}
                  onChange={(event) => change('validFrom', event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Término da vigência</span>
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={(event) => change('validUntil', event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
              </label>

              {[
                ['dcoFee', 'Taxa DCO'],
                ['assistantFee', 'Taxa Oficial'],
                ['travelExpense', 'Despesas de deslocamento'],
              ].map(([field, label]) => (
                <label key={field}>
                  <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form[field as keyof typeof form]}
                    onChange={(event) =>
                      change(field as keyof typeof emptyForm, event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                    required
                  />
                </label>
              ))}

              <label className="md:col-span-2 xl:col-span-3">
                <span className="mb-2 block text-sm font-bold text-slate-700">Observações</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => change('notes', event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                />
              </label>

              <div className="flex gap-3 md:col-span-2 xl:col-span-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 font-bold text-white disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar tabela'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Histórico cadastrado</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Alterações futuras não mudam os valores já copiados para jogos.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={filterStadium}
                  onChange={(event) => setFilterStadium(event.target.value)}
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                >
                  <option value="">Todos os estádios</option>
                  {sortedStadiums.map((stadium) => (
                    <option key={stadium.id} value={stadium.id}>{stadium.name}</option>
                  ))}
                </select>

                <select
                  value={filterActive}
                  onChange={(event) => setFilterActive(event.target.value)}
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3"
                >
                  <option value="">Ativas e inativas</option>
                  <option value="true">Somente ativas</option>
                  <option value="false">Somente inativas</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p className="py-10 text-center text-slate-500">Carregando...</p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="p-3">Estádio</th>
                      <th className="p-3">Vigência</th>
                      <th className="p-3">DCO</th>
                      <th className="p-3">Oficial</th>
                      <th className="p-3">Deslocamento</th>
                      <th className="p-3">Situação</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((rate, index) => (
                      <tr
                        key={rate.id}
                        className={`border-b border-slate-100 ${index % 2 ? 'bg-slate-50/70' : ''}`}
                      >
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{rate.stadium.name}</p>
                          <p className="text-xs text-slate-500">
                            {rate.stadium.city}/{rate.stadium.state}
                          </p>
                        </td>
                        <td className="p-3">{date(rate.validFrom)} até {date(rate.validUntil)}</td>
                        <td className="p-3 font-bold">{currency(rate.dcoFee)}</td>
                        <td className="p-3 font-bold">{currency(rate.assistantFee)}</td>
                        <td className="p-3 font-bold">{currency(rate.travelExpense)}</td>
                        <td className="p-3">
                          <span className={`rounded-full px-3 py-1 font-bold ${
                            rate.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {rate.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(rate)}
                              className="rounded-xl bg-[var(--cdb-blue)] px-3 py-2 font-bold text-white"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => toggle(rate)}
                              className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-700"
                            >
                              {rate.active ? 'Inativar' : 'Ativar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!rates.length && (
                  <p className="py-10 text-center text-slate-500">
                    Nenhuma tabela de valores cadastrada.
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
