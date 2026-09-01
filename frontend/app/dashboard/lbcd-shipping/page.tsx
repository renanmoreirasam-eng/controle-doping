'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { api } from '../../../services/api';
import { getUser } from '../../../services/auth';

type ShippingKit = {
  matchKitId: string;
  kitId: string;
  number: string;
  status: string;
  usedAt?: string | null;
  officialName?: string | null;
  officialEmail?: string | null;
};

type ShippingMatch = {
  matchId: string;
  missionCode?: string | null;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  status: string;
  championshipName?: string | null;
  stadiumName?: string | null;
  stadiumCity?: string | null;
  stadiumState?: string | null;
  kits: ShippingKit[];
};

type PrintableMissionGroup = {
  missionCode: string;
  matchLabel: string;
  kits: ShippingKit[];
};

type ModalVariant = 'danger' | 'success' | 'warning' | 'default';

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant: ModalVariant;
  confirmText: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
};

const initialModalState: ModalState = {
  open: false,
  title: '',
  message: '',
  variant: 'default',
  confirmText: 'Fechar',
};

const cbfLogoDataUrl = 'https://i.logos-download.com/8383/1917-s640-80bbb502bb1e747ccd0a63df987ba244.png/Confedera%C3%A7%C3%A3o_Brasileira_de_Futebol_%28CBF%29_Logo_2019-s640.png?dl=';

function formatDate(date: Date | string) {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return parsedDate.toLocaleDateString('pt-BR');
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export default function LbcdShippingPage() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<ShippingMatch[]>([]);
  const [selectedKitIds, setSelectedKitIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [markingAsSent, setMarkingAsSent] = useState(false);
  const [modal, setModal] = useState<ModalState>(initialModalState);
  const [todayLabel, setTodayLabel] = useState('');

  useEffect(() => {
    setTodayLabel(formatDate(new Date()));

    const user = getUser();
    const userRole = String(user?.role || user?.user?.role || '').toUpperCase();
    const nextIsAdmin = userRole === 'ADMIN';

    setIsAdmin(nextIsAdmin);
    setHasHydrated(true);

    if (nextIsAdmin) {
      loadShippingKits();
    } else {
      setLoading(false);
    }
  }, []);

  function closeModal() {
    setModal(initialModalState);
  }

  function showMessage(
    title: string,
    message: string,
    variant: ModalVariant = 'default',
  ) {
    setModal({
      open: true,
      title,
      message,
      variant,
      confirmText: 'Fechar',
      onConfirm: closeModal,
    });
  }

  function showConfirm(params: {
    title: string;
    message: string;
    variant?: ModalVariant;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }) {
    setModal({
      open: true,
      title: params.title,
      message: params.message,
      variant: params.variant || 'warning',
      confirmText: params.confirmText || 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        closeModal();
        await params.onConfirm();
      },
    });
  }

  async function loadShippingKits() {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await api.get('/inventory/lbcd-shipping/kits');
      setMatches(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar kits para envio ao laboratório:', error);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Não foi possível carregar os kits para envio ao laboratório.',
      );
    } finally {
      setLoading(false);
    }
  }

  const allSelectableKitIds = useMemo(() => {
    return matches.flatMap((match) =>
      match.missionCode?.trim()
        ? match.kits.map((kit) => kit.kitId)
        : [],
    );
  }, [matches]);

  const selectedKitsCount = selectedKitIds.length;

  const selectedGroups = useMemo<PrintableMissionGroup[]>(() => {
    return matches
      .map((match) => {
        const kits = match.kits.filter((kit) =>
          selectedKitIds.includes(kit.kitId),
        );

        return {
          missionCode: match.missionCode?.trim() || 'SEM MISSÃO',
          matchLabel: `${match.homeTeam} x ${match.awayTeam}`,
          kits,
        };
      })
      .filter((group) => group.kits.length > 0);
  }, [matches, selectedKitIds]);

  function toggleKit(kitId: string) {
    setSelectedKitIds((current) =>
      current.includes(kitId)
        ? current.filter((id) => id !== kitId)
        : [...current, kitId],
    );
  }

  function toggleMatch(match: ShippingMatch) {
    if (!match.missionCode?.trim()) return;

    const kitIds = match.kits.map((kit) => kit.kitId);
    const allSelected = kitIds.every((kitId) => selectedKitIds.includes(kitId));

    setSelectedKitIds((current) => {
      if (allSelected) {
        return current.filter((kitId) => !kitIds.includes(kitId));
      }

      return Array.from(new Set([...current, ...kitIds]));
    });
  }

  function selectAll() {
    setSelectedKitIds(allSelectableKitIds);
  }

  function clearSelection() {
    setSelectedKitIds([]);
  }

  function printDocuments() {
    if (selectedKitsCount === 0) {
      showMessage(
        'Nenhum kit selecionado',
        'Selecione pelo menos um kit para gerar a impressão.',
        'warning',
      );
      return;
    }

    window.print();
  }

  function confirmMarkKitsAsSent() {
    if (selectedKitsCount === 0) {
      showMessage(
        'Nenhum kit selecionado',
        'Selecione pelo menos um kit para marcar como enviado ao laboratório.',
        'warning',
      );
      return;
    }

    showConfirm({
      title: 'Marcar kits como enviados',
      message: `Deseja marcar ${selectedKitsCount} kit(s) como enviado(s) ao laboratório? Após confirmar, eles sairão da lista de envio pendente.`,
      variant: 'warning',
      confirmText: 'Marcar como enviado',
      onConfirm: markKitsAsSent,
    });
  }

  async function markKitsAsSent() {
    try {
      setMarkingAsSent(true);

      await api.patch('/inventory/lbcd-shipping/mark-sent', {
        kitIds: selectedKitIds,
      });

      setSelectedKitIds([]);
      await loadShippingKits();

      showMessage(
        'Kits enviados',
        'Kits marcados como enviados ao laboratório com sucesso.',
        'success',
      );
    } catch (error: any) {
      showMessage(
        'Erro ao marcar envio',
        error?.response?.data?.message ||
          error?.message ||
          'Não foi possível marcar os kits como enviados ao laboratório.',
        'danger',
      );
    } finally {
      setMarkingAsSent(false);
    }
  }

  const printMissionBlocks = useMemo(() => {
    const groups = [...selectedGroups];

    while (groups.length < 18) {
      groups.push({
        missionCode: '-',
        matchLabel: '',
        kits: [],
      });
    }

    return chunkArray(groups.slice(0, 18), 6);
  }, [selectedGroups]);

  if (!hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--cdb-light)] p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cdb-blue-soft)] text-3xl">
            📦
          </div>

          <h1 className="mt-4 text-2xl font-black text-[var(--cdb-dark)]">
            Carregando envio
          </h1>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            Preparando os kits para envio ao laboratório...
          </p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
        <Sidebar />

        <div className="flex-1 p-4 lg:p-8">
          <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">
              Acesso bloqueado
            </p>

            <h1 className="mt-3 text-3xl font-black text-[var(--cdb-dark)]">
              Envio ao Laboratório exclusivo do ADMIN
            </h1>

            <p className="mt-2 text-slate-500">
              Esta página é restrita aos administradores do sistema.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <header className="no-print bg-white border-b border-slate-200 px-4 lg:px-8 py-5 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--cdb-blue-soft)] text-[var(--cdb-blue)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em]">
                🚚 Envio ao Laboratório
              </div>

              <h1 className="text-3xl lg:text-4xl font-black mt-3 text-[var(--cdb-dark)]">
                Envio de kits ao laboratório
              </h1>

              <p className="text-slate-500 mt-2 max-w-3xl">
                Selecione os kits utilizados em jogos finalizados para gerar o novo documento de remessa ao laboratório.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadShippingKits}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                Atualizar
              </button>

              <button
                type="button"
                onClick={printDocuments}
                disabled={selectedKitsCount === 0}
                className="rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 text-sm font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Imprimir documento
              </button>

              <button
                type="button"
                onClick={confirmMarkKitsAsSent}
                disabled={selectedKitsCount === 0 || markingAsSent}
                className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {markingAsSent
                  ? 'Marcando...'
                  : 'Marcar kits como enviados ao laboratório'}
              </button>
            </div>
          </div>
        </header>

        <section className="no-print p-4 lg:p-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[var(--cdb-dark)]">
                    Kits disponíveis para remessa
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Apenas kits de jogos com controle finalizado aparecem nesta tela.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    disabled={allSelectableKitIds.length === 0}
                    className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-[var(--cdb-blue)] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Selecionar todos
                  </button>

                  <button
                    type="button"
                    onClick={clearSelection}
                    disabled={selectedKitsCount === 0}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {errorMessage}
                </div>
              )}

              {loading ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                  Carregando kits...
                </div>
              ) : matches.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div className="text-4xl">📦</div>

                  <h3 className="mt-3 text-lg font-black text-[var(--cdb-dark)]">
                    Nenhum kit encontrado
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Finalize um controle com kits utilizados para liberar a remessa.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {matches.map((match) => {
                    const matchKitIds = match.kits.map((kit) => kit.kitId);
                    const selectedInMatch = matchKitIds.filter((kitId) =>
                      selectedKitIds.includes(kitId),
                    );
                    const allSelected =
                      selectedInMatch.length === matchKitIds.length &&
                      matchKitIds.length > 0;
                    const missionMissing = !match.missionCode?.trim();

                    return (
                      <div
                        key={match.matchId}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                                Controle finalizado
                              </span>

                              {missionMissing ? (
                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                                  Missão não informada
                                </span>
                              ) : (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-[var(--cdb-blue)]">
                                  Missão {match.missionCode}
                                </span>
                              )}
                            </div>

                            <h3 className="mt-3 text-xl font-black text-[var(--cdb-dark)]">
                              {match.homeTeam} x {match.awayTeam}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {match.championshipName || 'Campeonato não informado'} · {formatDate(match.matchDate)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleMatch(match)}
                            disabled={missionMissing}
                            className="rounded-2xl bg-[var(--cdb-blue)] px-4 py-3 text-sm font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {allSelected ? 'Remover seleção' : 'Selecionar kits'}
                          </button>
                        </div>

                        {missionMissing && (
                          <p className="mt-3 rounded-2xl border border-red-100 bg-white p-3 text-xs font-semibold text-red-700">
                            Informe o código da missão no cadastro do jogo para gerar a remessa deste jogo.
                          </p>
                        )}

                        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {match.kits.map((kit) => {
                            const checked = selectedKitIds.includes(kit.kitId);

                            return (
                              <label
                                key={kit.kitId}
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                                  checked
                                    ? 'border-[var(--cdb-blue)] bg-blue-50 text-[var(--cdb-blue)]'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                                } ${missionMissing ? 'cursor-not-allowed opacity-50' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={missionMissing}
                                  onChange={() => toggleKit(kit.kitId)}
                                  className="h-4 w-4 accent-[var(--cdb-blue)]"
                                />
                                Kit {kit.number}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
                <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                  Resumo do envio
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
                    <span className="text-sm font-bold text-[var(--cdb-blue)]">
                      Missões
                    </span>
                    <strong className="text-[var(--cdb-blue)]">
                      {selectedGroups.length}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-green-50 px-4 py-3">
                    <span className="text-sm font-bold text-green-700">
                      Amostras selecionadas
                    </span>
                    <strong className="text-green-700">
                      {selectedKitsCount}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-bold text-slate-700">
                      Data de envio
                    </span>
                    <strong className="text-slate-700">
                      {todayLabel}
                    </strong>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  O novo modelo será impresso em uma única página A4, com a declaração na parte superior e a relação das amostras abaixo.
                </p>
              </div>

              {selectedGroups.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
                  <h2 className="text-xl font-black text-[var(--cdb-dark)]">
                    Seleção atual
                  </h2>

                  <div className="mt-4 space-y-3">
                    {selectedGroups.map((group) => (
                      <div
                        key={`${group.missionCode}-${group.matchLabel}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                          Missão {group.missionCode}
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-800">
                          {group.matchLabel}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Kits: {group.kits.map((kit) => kit.number).join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="print-only">
          <div className="shipping-document">
            {selectedGroups.length === 0 ? (
              <div className="print-empty">
                Selecione os kits antes de imprimir.
              </div>
            ) : (
              <>
                <section className="declaration">
                  <div className="declaration-letterhead">
                    <img src={cbfLogoDataUrl} alt="CBF" />

                    <h1>Confederação Brasileira de Futebol</h1>
                  </div>

                  <h2>Declaração</h2>

                  <p>
                    Declaramos para os devidos fins, que estamos transportando através dos
                    <strong> CORREIOS</strong>., a (s) mercadoria (s) abaixo descrita (s), sem fins comerciais,
                    razão porque, não sujeito a emissão de Nota Fiscal, as quais destinam se a
                    ILHA DO FUNDÃO / RJ.
                  </p>

                  <p>
                    Em razão desta declaração, assumimos toda e qualquer responsabilidade decorrente deste
                    transporte, seja junto ao Fisco em geral, ao privilégio postal da União e a outros
                    terceiros, bem como não se tratar de bens catalogados na legislação como carga perigosa.
                  </p>

                  <div className="merchandise-box">
                    <strong>Mercadoria:</strong> Transporte de kits com urina para análise laboratorial com fins
                    de investigação de violação esportiva às Normas Antidopagem. (Bereg kit – Berlinger Special AG,
                    exemplos de amostras de urina humana, sem qualquer tipo de contaminação de atletas praticantes
                    de futebol saudáveis).
                  </div>

                  <p>
                    <strong>Exame:</strong> (urina humana para exames antidoping de atletas do futebol, saudáveis,
                    sem qualquer doença ou contaminação).
                  </p>

                  <div className="compact-info">
                    <p><strong>Valor da Mercadoria:</strong> R$ 500,00</p>
                    <p>
                      <strong>Mercadoria:</strong> ( 1 ) Caixa (s) -{' '}
                      <strong>{String(selectedKitsCount).padStart(2, '0')}</strong> Amostras para análise.
                    </p>
                    <p><strong>Peso Aproximado:</strong> Caixa 01 __________________ kg/caixa</p>
                  </div>

                  <div className="address-block">
                    <p><strong>Centro de custo: CCD</strong></p>
                    <p><strong>REMETENTE: CONTROL DE DOPING BRASIL</strong></p>
                    <p><strong>CNPJ 49.316.563/0001-82</strong></p>
                    <p><strong>ENDEREÇO: R. Jovita, 440 – SALA 2 - São Paulo/SP</strong></p>
                    <p><strong>TEL.: 11 984315888 - Contato: Renato</strong></p>
                    <p><strong>CEP: 02036-001</strong></p>
                  </div>

                  <div className="address-block destination">
                    <p><strong>DESTINATÁRIO: LBCD – UFRJ</strong></p>
                    <p>ENDEREÇO: Avenida Horácio Macedo, 1281, Polo de Química, bloco C</p>
                    <p>ILHA DO FUNDÃO – RIO DE JANEIRO (Cidade Universitária)</p>
                    <p>CEP 21941-598</p>
                    <p>TELEFONE: 21 39383700/39383798</p>
                    <p>CNPJ: 33.663.683/0027-55</p>
                  </div>

                  <p className="urgent"><strong>OBS.: ENTREGAR EM HORÁRIO COMERCIAL URGENTE</strong></p>

                  <p>
                    <strong>Responsabilidade de pagamento do frete:</strong> Confederação Brasileira de Futebol
                  </p>

                  <p className="declaration-date">
                    <strong>DATA:</strong> {todayLabel} &nbsp;&nbsp; - &nbsp;&nbsp; às &nbsp;&nbsp; ____:____ hrs
                  </p>

                  <div className="signature">
                    <div className="signature-line" />
                    <strong>ASSINATURA E CARIMBO</strong>
                  </div>
                </section>

                <section className="samples-section">
                  <table className="sample-table">
                    <tbody>
                      <tr>
                        <th colSpan={7} className="table-main-title">
                          Confederação Brasileira de Futebol
                        </th>
                      </tr>

                      <tr>
                        <th colSpan={7} className="table-subtitle">
                          Amostras para Controle de Doping / Samples for Control Doping
                        </th>
                      </tr>

                      {printMissionBlocks.map((block, blockIndex) => {
                        const maxKitRows = Math.max(
                          2,
                          ...block.map((group) => group.kits.length),
                        );

                        return (
                          <Fragment key={`block-${blockIndex}`}>
                            <tr>
                              <th className="table-label">Mission Order</th>
                              {block.map((group, index) => (
                                <td
                                  key={`mission-${blockIndex}-${index}`}
                                  className="table-value"
                                >
                                  {group.missionCode || '-'}
                                </td>
                              ))}
                            </tr>

                            {Array.from({ length: maxKitRows }).map((_, rowIndex) => (
                              <tr key={`kit-${blockIndex}-${rowIndex}`}>
                                {rowIndex === 0 && (
                                  <th
                                    className="table-label"
                                    rowSpan={maxKitRows}
                                  >
                                    CAIXA 1 (Amostras)
                                  </th>
                                )}

                                {block.map((group, columnIndex) => (
                                  <td
                                    key={`kit-value-${blockIndex}-${rowIndex}-${columnIndex}`}
                                    className="table-value"
                                  >
                                    {group.kits[rowIndex]?.number || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </Fragment>
                        );
                      })}

                      <tr>
                        <th colSpan={3} className="table-section">
                          REMETENTE (Portador)
                        </th>
                        <th colSpan={4} className="table-section">
                          DESTINATÁRIO
                        </th>
                      </tr>

                      <tr>
                        <td colSpan={3}>Renato Helmut Deeke Junior</td>
                        <td colSpan={4}>Prof. Dr. Henrique Marcelo G Pereira</td>
                      </tr>

                      <tr>
                        <td colSpan={3}>Controle de Doping Brasil</td>
                        <td colSpan={4}>Laboratório LBCD</td>
                      </tr>

                      <tr>
                        <td colSpan={3}>Brasil</td>
                        <td colSpan={4}>Brasil</td>
                      </tr>

                      <tr>
                        <td colSpan={3}>São Paulo</td>
                        <td colSpan={4}>Rio de Janeiro</td>
                      </tr>

                      <tr>
                        <th>Data de Envio</th>
                        <td colSpan={2}>{todayLabel}</td>
                        <td colSpan={4}>&nbsp;</td>
                      </tr>

                      <tr>
                        <td colSpan={3} className="responsible">
                          Responsável: Renato Helmut Deeke Junior
                        </td>
                        <td colSpan={4}>&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </>
            )}
          </div>
        </section>

        <style jsx global>{`
          .print-only {
            display: none;
          }

          @media print {
            @page {
              size: A4 portrait;
              margin: 5mm 5.5mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
              background: #fff !important;
            }

            main {
              min-height: 0 !important;
              height: auto !important;
              overflow: visible !important;
            }

            .no-print,
            .no-print *,
            aside,
            header,
            nav {
              display: none !important;
            }

            .print-only {
              display: block !important;
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              break-after: auto !important;
              page-break-after: auto !important;
            }

            .shipping-document {
              width: 100%;
              max-width: none;
              height: auto;
              min-height: 0;
              margin: 0;
              padding: 0;
              break-after: auto;
              page-break-after: auto;
              break-inside: avoid;
              page-break-inside: avoid;
              color: #111;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 9.5px;
              line-height: 1.3;
            }

            .print-empty {
              padding: 40px;
              border: 1px solid #111;
              text-align: center;
              font-weight: 700;
            }

            .declaration {
              width: 100%;
              padding: 0 1.5mm;
            }

            .declaration-letterhead {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 14px;
              margin-bottom: 6px;
              min-height: 70px;
            }

            .declaration-letterhead img {
              width: 50px;
              height: 68px;
              object-fit: contain;
            }

            .declaration-letterhead h1 {
              margin: 0;
              color: #5a6630;
              font-size: 18.5px;
              font-weight: 500;
              letter-spacing: -0.1px;
            }

            .declaration h2 {
              margin: 3px 0 12px;
              text-align: center;
              font-size: 12.8px;
              font-weight: 800;
            }

            .declaration p {
              margin: 0 0 6px;
              text-align: left;
            }

            .declaration > p:nth-of-type(1),
            .declaration > p:nth-of-type(2) {
              text-align: justify;
            }

            .merchandise-box {
              border: 1px solid #111;
              font-style: italic;
              margin: 7px 0;
              padding: 5px 6px;
              line-height: 1.27;
            }

            .merchandise-box strong {
              font-style: normal;
            }

            .compact-info {
              margin-top: 6px;
            }

            .compact-info p,
            .address-block p {
              margin-bottom: 3px;
            }

            .address-block {
              margin-top: 6px;
            }

            .address-block.destination {
              margin-top: 9px;
              font-weight: 500;
            }

            .urgent {
              margin-top: 8px !important;
            }

            .declaration-date {
              margin-top: 9px !important;
            }

            .signature {
              width: 215px;
              margin: 10px auto 7px;
              text-align: center;
              font-size: 9px;
            }

            .signature-line {
              border-top: 1px solid #111;
              margin-bottom: 3px;
            }

            .samples-section {
              margin-top: 6px;
            }

            .samples-section,
            .sample-table {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .sample-table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
              font-size: 9.6px;
              color: #111;
            }

            .sample-table th,
            .sample-table td {
              border: 1px solid #111;
              padding: 2.7px 3.2px;
              text-align: center;
              vertical-align: middle;
              height: 15px;
              font-weight: 600;
            }

            .sample-table .table-main-title {
              height: 20px;
              font-size: 9px;
              font-weight: 800;
            }

            .sample-table .table-subtitle {
              height: 32px;
              font-size: 9px;
              font-weight: 800;
            }

            .sample-table .table-label {
              width: 16%;
              font-weight: 800;
            }

            .sample-table .table-value {
              font-size: 9px;
              font-weight: 800;
            }

            .sample-table .table-section {
              font-weight: 800;
            }

            .sample-table .responsible {
              font-weight: 700;
            }

            .shipping-document > *:last-child,
            .print-only > *:last-child {
              margin-bottom: 0 !important;
              break-after: auto !important;
              page-break-after: auto !important;
            }
          }
        `}</style>
      </div>

      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onCancel={closeModal}
        onConfirm={async () => {
          if (modal.onConfirm) {
            await modal.onConfirm();
            return;
          }

          closeModal();
        }}
      />
    </main>
  );
}
