'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { Sidebar } from '../../../components/Sidebar';
import { api } from '../../../services/api';

type Stadium = {
  id: string;
  name: string;
  city: string;
  state: string;
};

type RoomInspectionItem = {
  id?: string;
  label: string;
  status: string;
  notes?: string | null;
};

type RoomInspectionPhoto = {
  id?: string;
  fileName: string;
  dataUrl: string;
};

type RoomInspection = {
  id: string;
  matchId: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  items: RoomInspectionItem[];
  photos: RoomInspectionPhoto[];
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    missionCode?: string | null;
    matchNumber?: string | null;
    roundOrPhase?: string | null;
    championship: {
      name: string;
    };
    stadium: Stadium;
  };
};

function getInspectionStatusLabel(status: string) {
  if (status === 'APROVADA') return 'Aprovada';
  if (status === 'APROVADA_COM_OBSERVACOES') return 'Aprovada com observações';
  if (status === 'REPROVADA') return 'Reprovada';
  if (status === 'PENDING') return 'Pendente';

  return status;
}

function getInspectionStatusClass(status: string) {
  if (status === 'APROVADA') {
    return 'bg-green-100 text-green-700 border border-green-200';
  }

  if (status === 'APROVADA_COM_OBSERVACOES') {
    return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  }

  if (status === 'REPROVADA') {
    return 'bg-red-100 text-red-700 border border-red-200';
  }

  return 'bg-slate-100 text-slate-700 border border-slate-200';
}

function getItemStatusLabel(status: string) {
  if (status === 'CONFORME') return 'Conforme';
  if (status === 'NAO_CONFORME') return 'Não conforme';
  if (status === 'NAO_DISPONIVEL') return 'Não disponível';

  return status;
}

function isItemNotOk(status: string) {
  return status === 'NAO_CONFORME' || status === 'NAO_DISPONIVEL';
}

function getItemCardClass(status: string) {
  if (status === 'NAO_CONFORME') {
    return 'rounded-2xl border border-red-200 bg-red-50 p-3 ring-1 ring-red-100';
  }

  if (status === 'NAO_DISPONIVEL') {
    return 'rounded-2xl border border-yellow-200 bg-yellow-50 p-3 ring-1 ring-yellow-100';
  }

  return 'rounded-2xl border border-slate-100 bg-slate-50 p-3 ring-1 ring-slate-100';
}

function getItemBadgeClass(status: string) {
  if (status === 'NAO_CONFORME') {
    return 'shrink-0 rounded-full bg-red-100 px-2 py-1 text-[11px] font-black text-red-700 ring-1 ring-red-200';
  }

  if (status === 'NAO_DISPONIVEL') {
    return 'shrink-0 rounded-full bg-yellow-100 px-2 py-1 text-[11px] font-black text-yellow-800 ring-1 ring-yellow-200';
  }

  return 'shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200';
}


function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-BR');
}

function formatDateOnly(date: string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function dataUrlToBlob(dataUrl: string) {
  const [header, base64Data] = dataUrl.split(',');
  const mimeType =
    header?.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream';

  const binaryString = window.atob(base64Data || '');
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function openDataUrlFile(dataUrl: string) {
  const blob = dataUrlToBlob(dataUrl);
  const blobUrl = window.URL.createObjectURL(blob);

  window.open(blobUrl, '_blank', 'noopener,noreferrer');

  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 60000);
}

export default function RoomInspectionsListPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [selectedStadiumId, setSelectedStadiumId] = useState('');
  const [inspections, setInspections] = useState<RoomInspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function loadStadiums() {
    const response = await api.get('/stadiums');
    setStadiums(response.data);
  }

  async function loadInspectionsByStadium(stadiumId: string) {
    if (!stadiumId) {
      setInspections([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/room-inspections?stadiumId=${stadiumId}`);
      setInspections(response.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStadiums();
  }, []);

  useEffect(() => {
    loadInspectionsByStadium(selectedStadiumId);
  }, [selectedStadiumId]);

  const selectedStadium = stadiums.find(
    (stadium) => stadium.id === selectedStadiumId,
  );

  const filteredInspections = useMemo(() => {
    return inspections.filter((inspection) => {
      const value = `
        ${inspection.match.homeTeam}
        ${inspection.match.awayTeam}
        ${inspection.match.championship.name}
        ${inspection.match.missionCode || ''}
        ${inspection.match.matchNumber || ''}
        ${inspection.match.roundOrPhase || ''}
        ${inspection.notes || ''}
        ${inspection.items.map((item) => `${item.label} ${item.status} ${item.notes || ''}`).join(' ')}
      `.toLowerCase();

      const matchesSearch = value.includes(search.toLowerCase());
      const matchesStatus = statusFilter
        ? inspection.status === statusFilter
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [inspections, search, statusFilter]);

  const approvedInspections = inspections.filter(
    (inspection) => inspection.status === 'APROVADA',
  ).length;

  const inspectionsWithNotes = inspections.filter(
    (inspection) =>
      inspection.status === 'APROVADA_COM_OBSERVACOES' ||
      inspection.status === 'REPROVADA' ||
      inspection.items.some(
        (item) =>
          item.status === 'NAO_CONFORME' ||
          item.status === 'NAO_DISPONIVEL' ||
          Boolean(item.notes),
      ) ||
      Boolean(inspection.notes),
  ).length;

  const lastInspection = inspections[0];

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--cdb-light)] lg:flex-row">
      <Sidebar />

      <div className="min-w-0 flex-1 overflow-x-hidden">
        <header className="border-b border-slate-200 bg-white px-4 py-5 lg:px-8 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--cdb-blue-soft)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                🔎 Consulta operacional
              </div>

              <h1 className="mt-3 text-3xl font-black text-[var(--cdb-dark)] lg:text-4xl">
                Inspeções de sala
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                Consulte o histórico de inspeções realizadas por estádio.
              </p>
            </div>

            <div className="w-fit rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 font-bold text-white shadow-lg">
              {inspections.length} inspeções encontradas
            </div>
          </div>
        </header>

        <section className="w-full max-w-full overflow-x-hidden p-4 lg:p-8">
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:mb-8 lg:p-6">
            <div className="mb-6">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[var(--cdb-blue)]">
                Filtros
              </span>

              <h2 className="mt-2 text-2xl font-black text-[var(--cdb-dark)]">
                Selecione o estádio
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Todos os perfis podem consultar as inspeções registradas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100"
                  value={selectedStadiumId}
                  onChange={(event) => {
                    setSelectedStadiumId(event.target.value);
                    setSearch('');
                    setStatusFilter('');
                  }}
                >
                  <option value="">Selecione um estádio</option>

                  {stadiums.map((stadium) => (
                    <option key={stadium.id} value={stadium.id}>
                      {stadium.name} — {stadium.city}/{stadium.state}
                    </option>
                  ))}
                </select>

                <label className="mt-2 block text-sm font-bold text-slate-700">
                  Estádio
                </label>
              </div>

              <div>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  disabled={!selectedStadiumId}
                >
                  <option value="">Todos os status</option>
                  <option value="APROVADA">Aprovada</option>
                  <option value="APROVADA_COM_OBSERVACOES">
                    Aprovada com observações
                  </option>
                  <option value="REPROVADA">Reprovada</option>
                </select>

                <label className="mt-2 block text-sm font-bold text-slate-700">
                  Status
                </label>
              </div>

              <div>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  placeholder="Buscar por jogo, campeonato ou missão..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  disabled={!selectedStadiumId}
                />

                <label className="mt-2 block text-sm font-bold text-slate-700">
                  Buscar
                </label>
              </div>
            </div>
          </div>

          {selectedStadium && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:mb-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Total de inspeções
                </p>
                <h2 className="mt-2 text-4xl font-black text-[var(--cdb-dark)]">
                  {inspections.length}
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  {selectedStadium.name}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Aprovadas
                </p>
                <h2 className="mt-2 text-4xl font-black text-green-600">
                  {approvedInspections}
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  Sem pendências registradas
                </p>
              </div>

              <div
                className={`rounded-3xl border p-5 shadow-sm ${
                  inspectionsWithNotes > 0
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    inspectionsWithNotes > 0 ? 'text-yellow-700' : 'text-slate-500'
                  }`}
                >
                  Com observações
                </p>
                <h2
                  className={`mt-2 text-4xl font-black ${
                    inspectionsWithNotes > 0 ? 'text-yellow-700' : 'text-slate-700'
                  }`}
                >
                  {inspectionsWithNotes}
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  Itens não conformes ou observações
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Última inspeção
                </p>
                <h2 className="mt-2 text-2xl font-black text-[var(--cdb-blue)]">
                  {lastInspection ? formatDateOnly(lastInspection.createdAt) : '-'}
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  {lastInspection
                    ? `${lastInspection.match.homeTeam} x ${lastInspection.match.awayTeam}`
                    : 'Nenhum registro'}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.22em] text-[var(--cdb-blue)]">
                  Histórico
                </span>

                <h2 className="mt-2 text-2xl font-black text-[var(--cdb-dark)]">
                  Inspeções registradas
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Visualização consolidada por estádio.
                </p>
              </div>
            </div>

            {!selectedStadiumId && (
              <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
                <div className="mb-4 text-6xl">🏟️</div>
                <h3 className="text-xl font-bold text-[var(--cdb-dark)]">
                  Selecione um estádio
                </h3>
                <p className="mt-2 text-slate-500">
                  Escolha um estádio acima para consultar as inspeções já realizadas.
                </p>
              </div>
            )}

            {selectedStadiumId && loading && (
              <div className="rounded-3xl border border-slate-200 p-10 text-center text-slate-500">
                Carregando inspeções...
              </div>
            )}

            {selectedStadiumId && !loading && filteredInspections.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
                <div className="mb-4 text-6xl">🔎</div>
                <h3 className="text-xl font-bold text-[var(--cdb-dark)]">
                  Nenhuma inspeção encontrada
                </h3>
                <p className="mt-2 text-slate-500">
                  Ainda não há inspeções para este estádio ou os filtros não retornaram resultados.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {filteredInspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`${getInspectionStatusClass(
                            inspection.status,
                          )} inline-flex rounded-full px-3 py-1 text-xs font-bold`}
                        >
                          {getInspectionStatusLabel(inspection.status)}
                        </span>

                        {inspection.match.missionCode && (
                          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-[var(--cdb-blue)]">
                            Missão {inspection.match.missionCode}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-xl font-black text-[var(--cdb-dark)]">
                        {inspection.match.homeTeam} x {inspection.match.awayTeam}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {inspection.match.championship.name} •{' '}
                        {formatDate(inspection.match.matchDate)}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Registrada em {formatDate(inspection.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/matches/${inspection.matchId}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        🧪 Ver operação
                      </Link>

                      <Link
                        href={`/dashboard/matches/${inspection.matchId}/room-inspection`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-[var(--cdb-blue)] transition hover:bg-blue-100"
                      >
                        🔎 Ver inspeção
                      </Link>
                    </div>
                  </div>

                  {inspection.notes && (
                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700 ring-1 ring-blue-100">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                        Comentário geral da inspeção
                      </p>
                      <p className="mt-2 leading-relaxed">{inspection.notes}</p>
                    </div>
                  )}

                  {inspection.items.some((item) => isItemNotOk(item.status)) && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <strong>
                        ⚠️ Atenção: esta inspeção possui itens não conformes ou não disponíveis.
                      </strong>
                      <p className="mt-1 text-xs text-red-600">
                        Os itens com pendência estão destacados em vermelho/amarelo abaixo.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {inspection.items.map((item) => (
                      <div
                        key={`${inspection.id}-${item.label}`}
                        className={getItemCardClass(item.status)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <strong
                            className={`text-sm ${
                              isItemNotOk(item.status)
                                ? 'text-slate-950'
                                : 'text-slate-900'
                            }`}
                          >
                            {isItemNotOk(item.status) ? '⚠️ ' : ''}
                            {item.label}
                          </strong>

                          <span className={getItemBadgeClass(item.status)}>
                            {getItemStatusLabel(item.status)}
                          </span>
                        </div>

                        {item.notes ? (
                          <div
                            className={`mt-3 rounded-xl p-3 text-xs leading-relaxed ${
                              isItemNotOk(item.status)
                                ? 'bg-white/80 text-slate-700 ring-1 ring-white'
                                : 'bg-white text-slate-600 ring-1 ring-slate-100'
                            }`}
                          >
                            <span className="font-black">
                              Comentário do item:
                            </span>{' '}
                            {item.notes}
                          </div>
                        ) : isItemNotOk(item.status) ? (
                          <p className="mt-3 rounded-xl bg-white/70 p-3 text-xs font-semibold text-red-700 ring-1 ring-white">
                            Item marcado como {getItemStatusLabel(item.status).toLowerCase()} sem comentário informado.
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {inspection.photos.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        Fotos da inspeção
                      </p>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
                        {inspection.photos.map((photo, index) => (
                          <button
                            key={`${inspection.id}-${photo.fileName}-${index}`}
                            type="button"
                            onClick={() => openDataUrlFile(photo.dataUrl)}
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left transition hover:border-blue-200 hover:shadow-sm"
                            title="Abrir foto em nova aba"
                          >
                            <img
                              src={photo.dataUrl}
                              alt={photo.fileName}
                              className="h-28 w-full object-cover transition group-hover:scale-105"
                            />

                            <div className="border-t border-slate-200 bg-white px-3 py-2">
                              <p className="truncate text-[11px] font-bold text-slate-600">
                                🔍 Abrir foto
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
