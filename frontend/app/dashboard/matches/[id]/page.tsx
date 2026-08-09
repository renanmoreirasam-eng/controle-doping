'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '../../../../components/Sidebar';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { api } from '../../../../services/api';
import { getUser } from '../../../../services/auth';
import Link from 'next/link';

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  status: string;
  updatedAt?: string;
  championship: { name: string };
  stadium: { name: string; city: string; state: string };
  missionCode?: string;
  missionOrderAnalysis?: string | null;
  extraMaterialUsed?: boolean | null;
  extraMaterialNotes?: string | null;
  extraMaterialRegisteredAt?: string | null;
  extraMaterialRegisteredById?: string | null;
  extraMaterialRegisteredByName?: string | null;
  extraMaterialRegisteredByEmail?: string | null;
  missionOrderFileName?: string | null;
  missionOrderFileType?: string | null;
  missionOrderFileData?: string | null;
  athleteListFileName?: string | null;
  athleteListFileType?: string | null;
  athleteListFileData?: string | null;
  finalDocumentFileName?: string | null;
  finalDocumentFileType?: string | null;
  finalDocumentFileData?: string | null;
};

type PendingAthleteListImageFile = {
  id: string;
  fileName: string;
  fileType: string;
  dataUrl: string;
};

type PendingAthleteListFiles = {
  HOME: PendingAthleteListImageFile[];
  AWAY: PendingAthleteListImageFile[];
};

type Scale = {
  id: string;
  role: string;
  confirmed: boolean | null;
  matchId: string;
  official: { id: string; user: { name: string; email: string } };
};

type DrawPlayer = {
  id?: string;
  team: string;
  name: string;
  nickname?: string;
  number: string;
  type: 'EXAME' | 'RESERVA';
};

type Draw = {
  id: string;
  matchId: string;
  players: DrawPlayer[];
  createdAt: string;
};

type DrawForm = {
  homeExamNumber: string;
  homeExamName: string;
  homeReserveNumber: string;
  homeReserveName: string;
  awayExamNumber: string;
  awayExamName: string;
  awayReserveNumber: string;
  awayReserveName: string;
};

type Substitution = {
  id: string;
  matchId: string;
  team: string;
  playerOutName: string;
  playerOutNumber: string;
  playerInName: string;
  playerInNumber: string;
  minute?: number | null;
  period?: string | null;
  notes?: string | null;
  createdAt: string;
};

type RoomInspectionItem = {
  label: string;
  status: string;
  notes?: string;
};

type RoomInspectionPhoto = {
  fileName: string;
  dataUrl: string;
};

type RoomInspection = {
  id: string;
  matchId: string;
  status: string;
  notes?: string;
  createdAt: string;
  items: RoomInspectionItem[];
  photos: RoomInspectionPhoto[];
};


type OperationalStep =
  | 'CHECKIN_STADIUM'
  | 'MATCH_IN_PROGRESS'
  | 'DRAW_DONE'
  | 'CONTROL_DONE';

type OperationalLog = {
  id: string;
  matchId: string;
  step: OperationalStep;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  comment?: string | null;
  createdAt: string;
};


type KitInventoryItem = {
  id: string;
  number: string;
  status: 'DISPONIVEL' | 'COM_DCO' | 'VINCULADO_JOGO' | 'UTILIZADO' | 'CANCELADO';
};

type MatchKitItem = {
  id: string;
  matchId: string;
  kitId: string;
  officialId: string;
  createdAt: string;
  usedAt?: string | null;
  kit: {
    id: string;
    number: string;
    status: string;
  };
  official?: {
    user?: {
      name: string;
      email: string;
    };
  };
};

type ExtraMaterialStockItem = {
  id: string;
  itemId: string;
  quantity: number;
  officialId?: string | null;
  item: {
    id: string;
    name: string;
    active: boolean;
  };
};

type ExtraMaterialUsageItem = {
  id: string;
  matchId: string;
  itemId: string;
  officialId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  item: {
    id: string;
    name: string;
    active: boolean;
  };
  official?: {
    user?: {
      name: string;
      email: string;
    };
  };
};


const defaultRoomItems: RoomInspectionItem[] = [
  { label: 'Mesa disponível', status: 'CONFORME' },
  { label: 'Cadeiras disponíveis', status: 'CONFORME' },
  { label: 'Iluminação adequada', status: 'CONFORME' },
  { label: 'Luz de emergência', status: 'CONFORME' },
  { label: 'Espelho', status: 'CONFORME' },
  { label: 'Geladeira', status: 'CONFORME' },
  { label: 'Ar-condicionado ou ventilador', status: 'CONFORME' },
  { label: 'Chave para trancar a sala', status: 'CONFORME' },
  { label: 'Banheiro próximo', status: 'CONFORME' },
  { label: 'Água disponível', status: 'CONFORME' },
  { label: 'Lanche para equipe', status: 'CONFORME' },
  { label: 'Privacidade da sala', status: 'CONFORME' },
  { label: 'Lixeira', status: 'CONFORME' },
  { label: 'Sala limpa e organizada', status: 'CONFORME' },
];


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

type ActionKey =
  | 'checkin'
  | 'mission-code'
  | 'athlete-list-upload'
  | 'start-match'
  | 'save-draw'
  | 'match-kits'
  | 'finish-control'
  | 'extra-materials'
  | 'final-document-upload';

const initialModalState: ModalState = {
  open: false,
  title: '',
  message: '',
  variant: 'default',
  confirmText: 'Fechar',
};

function getErrorMessage(error: any, fallback: string) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(' ') : String(message);
}

const DEFAULT_MISSION_ORDER_ANALYSIS = 'Urine';
const COMPLEMENTARY_MISSION_ORDER_ANALYSIS =
  'Urine + GHRF (GHS/GHRP), ERAs (incl. recombinant ERAs and analogues)';

const REQUIRED_COLLECTOR_MATERIAL_NAME = 'Copo coletor';
const REQUIRED_COLLECTOR_USAGE_QUANTITY = 2;

function normalizeMaterialLabel(value?: string | null) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isCollectorMaterialName(value?: string | null) {
  return (
    normalizeMaterialLabel(value) ===
    normalizeMaterialLabel(REQUIRED_COLLECTOR_MATERIAL_NAME)
  );
}

function isFormMaterialName(value?: string | null) {
  return normalizeMaterialLabel(value).startsWith('formulario');
}

function hasMissionOrder(match?: Match | null) {
  return Boolean(
    match?.missionOrderFileName ||
      match?.missionOrderFileType ||
      match?.missionOrderAnalysis,
  );
}

function getMissionOrderAnalysisDisplay(match?: Match | null) {
  return String(match?.missionOrderAnalysis || '').trim() || DEFAULT_MISSION_ORDER_ANALYSIS;
}

function hasComplementaryMissionOrderAnalysis(match?: Match | null) {
  const analysis = getMissionOrderAnalysisDisplay(match);

  return (
    analysis === COMPLEMENTARY_MISSION_ORDER_ANALYSIS ||
    analysis !== DEFAULT_MISSION_ORDER_ANALYSIS
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo selecionado.'));
    reader.readAsDataURL(file);
  });
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

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;

  return /Android|iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

async function downloadDataUrl(dataUrl: string, fileName: string) {
  const blob = dataUrlToBlob(dataUrl);
  const safeFileName = fileName || 'documento-do-jogo';

  if (isMobileDevice()) {
    const navigatorWithShare = navigator as Navigator & {
      canShare?: (data: { files?: File[] }) => boolean;
      share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
    };

    if (navigatorWithShare.share) {
      try {
        const file = new File([blob], safeFileName, {
          type: blob.type || 'application/octet-stream',
        });

        if (
          !navigatorWithShare.canShare ||
          navigatorWithShare.canShare({ files: [file] })
        ) {
          await navigatorWithShare.share({
            files: [file],
            title: safeFileName,
            text: 'Documento do jogo',
          });

          return;
        }
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          return;
        }

        console.warn('Não foi possível abrir o compartilhamento do arquivo.', error);
      }
    }
  }

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = blobUrl;
  link.download = safeFileName;
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, isMobileDevice() ? 60000 : 1000);
}

type MatchDocumentType = 'mission-order' | 'athlete-list' | 'final-document';

type MatchDocumentResponse = {
  fileName: string;
  fileType: string;
  fileData: string;
};

type OperationSummaryResponse = {
  match: Match;
  scales: Scale[];
  draws: Draw[];
  substitutions: Substitution[];
  roomInspections: RoomInspection[];
  operationalLogs: OperationalLog[];
  matchKits: MatchKitItem[];
  myKits: KitInventoryItem[];
  extraMaterialUsages: ExtraMaterialUsageItem[];
  myExtraMaterialStocks: ExtraMaterialStockItem[];
};

export default function MatchDetailsPage() {
  const params = useParams();
  const matchId = params.id as string;

  const user = getUser();
  const userRole = String(user?.role || user?.user?.role || '').toUpperCase();
  const isAdmin = userRole === 'ADMIN';

  const [match, setMatch] = useState<Match | null>(null);
  const [scales, setScales] = useState<Scale[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [roomInspections, setRoomInspections] = useState<RoomInspection[]>([]);
  const [operationalLogs, setOperationalLogs] = useState<OperationalLog[]>([]);
  const [myKits, setMyKits] = useState<KitInventoryItem[]>([]);
  const [matchKits, setMatchKits] = useState<MatchKitItem[]>([]);
  const [myExtraMaterialStocks, setMyExtraMaterialStocks] = useState<ExtraMaterialStockItem[]>([]);
  const [extraMaterialUsages, setExtraMaterialUsages] = useState<ExtraMaterialUsageItem[]>([]);
  const [extraMaterialUseOption, setExtraMaterialUseOption] = useState<'NO' | 'YES'>('NO');
  const [extraMaterialQuantities, setExtraMaterialQuantities] = useState<Record<string, string>>({});
  const [extraMaterialNotes, setExtraMaterialNotes] = useState('');
  const [savingExtraMaterials, setSavingExtraMaterials] = useState(false);
  const [editingExtraMaterials, setEditingExtraMaterials] = useState(false);
  const [selectedExtraMaterialOfficialId, setSelectedExtraMaterialOfficialId] = useState('');
  const [loadingExtraMaterialStocks, setLoadingExtraMaterialStocks] = useState(false);
  const linkedKitIds = matchKits.map((item) => item.kitId);
  const availableKitsForMatch = myKits.filter(
    (kit) => kit.status === 'COM_DCO' && !linkedKitIds.includes(kit.id),
  );
  const [selectedKitIds, setSelectedKitIds] = useState<string[]>([]);
  const [savingKits, setSavingKits] = useState(false);
  const [controlComment, setControlComment] = useState('');

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const [playerTeam, setPlayerTeam] = useState<'HOME' | 'AWAY'>('HOME');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerNickname, setPlayerNickname] = useState('');
  const [playerType, setPlayerType] = useState<'EXAME' | 'RESERVA'>('EXAME');
  const [drawnPlayers, setDrawnPlayers] = useState<DrawPlayer[]>([]);
  const [editingDraw, setEditingDraw] = useState(false);
  const [drawForm, setDrawForm] = useState<DrawForm>({
    homeExamNumber: '',
    homeExamName: '',
    homeReserveNumber: '',
    homeReserveName: '',
    awayExamNumber: '',
    awayExamName: '',
    awayReserveNumber: '',
    awayReserveName: '',
  });

  const [roomItems, setRoomItems] = useState<RoomInspectionItem[]>(defaultRoomItems);
  const [roomNotes, setRoomNotes] = useState('');
  const [roomPhotos, setRoomPhotos] = useState<RoomInspectionPhoto[]>([]);

  const [missionCodeInput, setMissionCodeInput] = useState('');
  const [missionCodeConfirmed, setMissionCodeConfirmed] = useState(false);
  const [pendingAthleteListFiles, setPendingAthleteListFiles] =
    useState<PendingAthleteListFiles>({
      HOME: [],
      AWAY: [],
    });
  const [savingMissionCode, setSavingMissionCode] = useState(false);
  const [savingAthleteListFile, setSavingAthleteListFile] = useState(false);
  const [savingFinalDocumentFile, setSavingFinalDocumentFile] = useState(false);
  const [modal, setModal] = useState<ModalState>(initialModalState);
  const [actionLoading, setActionLoading] = useState<ActionKey | null>(null);
  const [scalesLoaded, setScalesLoaded] = useState(false);
  const actionLockRef = useRef<ActionKey | null>(null);
  const lastOperationalSnapshotRef = useRef('');
  const hasShownExternalUpdateRef = useRef(false);
  const isUserEditingRef = useRef(false);
  const editingTimeoutRef = useRef<number | null>(null);

  const isAnyActionLoading = Boolean(actionLoading);

  function isEditableElement(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;

    return Boolean(
      target.closest('input, textarea, select, [contenteditable="true"]'),
    );
  }

  function keepAutomaticRefreshPaused() {
    isUserEditingRef.current = true;

    if (editingTimeoutRef.current) {
      window.clearTimeout(editingTimeoutRef.current);
    }
  }

  function releaseAutomaticRefreshAfterDelay() {
    if (editingTimeoutRef.current) {
      window.clearTimeout(editingTimeoutRef.current);
    }

    editingTimeoutRef.current = window.setTimeout(() => {
      isUserEditingRef.current = false;
    }, 1500);
  }

  function handleOperationFormFocus(event: React.FocusEvent<HTMLElement>) {
    if (!isEditableElement(event.target)) return;

    keepAutomaticRefreshPaused();
  }

  function handleOperationFormBlur(event: React.FocusEvent<HTMLElement>) {
    if (!isEditableElement(event.target)) return;

    releaseAutomaticRefreshAfterDelay();
  }

  function handleOperationFormInput(event: React.FormEvent<HTMLElement>) {
    if (!isEditableElement(event.target)) return;

    keepAutomaticRefreshPaused();
  }

  function getMissionCodeConfirmationStorageKey() {
    return `controle-doping:mission-code-confirmed:${matchId}`;
  }

  function getStoredMissionCodeConfirmation(missionCode?: string | null) {
    if (typeof window === 'undefined') return false;

    try {
      const storedValue = window.localStorage.getItem(
        getMissionCodeConfirmationStorageKey(),
      );

      if (!storedValue || !missionCode?.trim()) {
        return false;
      }

      const parsedValue = JSON.parse(storedValue) as {
        missionCode?: string;
      };

      return parsedValue.missionCode === missionCode.trim();
    } catch (error) {
      console.warn(
        'Não foi possível ler a confirmação local do código da missão.',
        error,
      );

      return false;
    }
  }

  function saveMissionCodeConfirmation(missionCode: string) {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(
        getMissionCodeConfirmationStorageKey(),
        JSON.stringify({
          missionCode: missionCode.trim(),
          confirmedAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.warn(
        'Não foi possível salvar a confirmação local do código da missão.',
        error,
      );
    }
  }

  async function runExclusiveAction(
    actionKey: ActionKey,
    callback: () => Promise<void>,
  ) {
    if (actionLockRef.current) return;

    actionLockRef.current = actionKey;
    setActionLoading(actionKey);

    try {
      await refreshOperationData({ silent: true });
      await callback();
      hasShownExternalUpdateRef.current = false;
    } catch (error: any) {
      await refreshOperationData({ silent: true });

      showMessage(
        'Operação atualizada',
        getErrorMessage(
          error,
          'A operação foi atualizada por outro usuário. Revise as informações mais recentes e tente novamente.',
        ),
        'warning',
      );
    } finally {
      actionLockRef.current = null;
      setActionLoading(null);
    }
  }

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


  function getMatchDocumentDownloadTitle(type: MatchDocumentType) {
    if (type === 'mission-order') return 'Baixar ordem de missão';
    if (type === 'athlete-list') return 'Baixar relação de atletas';

    return 'Baixar documento final';
  }

  function getMatchDocumentDownloadMessage(type: MatchDocumentType) {
    if (type === 'mission-order') {
      return 'Deseja baixar a ordem de missão deste jogo? O arquivo será carregado somente agora para manter a página mais rápida.';
    }

    if (type === 'athlete-list') {
      return 'Deseja baixar a relação de atletas deste jogo? O arquivo será carregado somente agora para manter a página mais rápida.';
    }

    return 'Deseja baixar o documento final deste jogo? O arquivo será carregado somente agora para manter a página mais rápida.';
  }

  function confirmDownloadMatchDocument(type: MatchDocumentType) {
    showConfirm({
      title: getMatchDocumentDownloadTitle(type),
      message: getMatchDocumentDownloadMessage(type),
      variant: 'default',
      confirmText: 'Baixar arquivo',
      onConfirm: () => downloadMatchDocument(type),
    });
  }

  async function downloadMatchDocument(type: MatchDocumentType) {
    try {
      const response = await api.get<MatchDocumentResponse>(
        `/matches/${matchId}/documents/${type}`,
      );

      const document = response.data;

      if (!document?.fileData) {
        showMessage(
          'Arquivo indisponível',
          'Não foi possível localizar o arquivo solicitado para download.',
          'warning',
        );
        return;
      }

      downloadDataUrl(
        document.fileData,
        document.fileName || 'documento-do-jogo',
      );
    } catch (error: any) {
      showMessage(
        'Erro ao baixar arquivo',
        getErrorMessage(error, 'Erro ao carregar o arquivo para download.'),
        'danger',
      );
    }
  }

  function buildExtraMaterialQuantityState(
    usages: ExtraMaterialUsageItem[],
    stocks: ExtraMaterialStockItem[] = [],
  ) {
    const quantities: Record<string, string> = {};

    for (const usage of usages || []) {
      const isCollector = isCollectorMaterialName(usage.item?.name);
      const currentQuantity = Number(quantities[usage.itemId] || 0);
      const usageQuantity = Number(usage.quantity || 0);

      quantities[usage.itemId] = String(
        currentQuantity +
          (isCollector
            ? Math.max(0, usageQuantity - REQUIRED_COLLECTOR_USAGE_QUANTITY)
            : usageQuantity),
      );
    }

    const collectorStock = stocks.find((stock) =>
      isCollectorMaterialName(stock.item?.name),
    );

    if (collectorStock && quantities[collectorStock.itemId] === undefined) {
      quantities[collectorStock.itemId] = '0';
    }

    return quantities;
  }

  function syncExtraMaterialForm(
    nextMatch: Match | null,
    nextUsages: ExtraMaterialUsageItem[],
    nextStocks: ExtraMaterialStockItem[] = [],
  ) {
    const hasNonCollectorMaterial = (nextUsages || []).some(
      (usage) => !isCollectorMaterialName(usage.item?.name),
    );

    setExtraMaterialUseOption(hasNonCollectorMaterial ? 'YES' : 'NO');
    setExtraMaterialNotes(nextMatch?.extraMaterialNotes || '');
    setExtraMaterialQuantities(
      buildExtraMaterialQuantityState(nextUsages, nextStocks),
    );
  }

  function getExtraMaterialUsagesForSelectedDco() {
    if (isAdmin && selectedExtraMaterialOfficialId) {
      return extraMaterialUsages.filter(
        (usage) => usage.officialId === selectedExtraMaterialOfficialId,
      );
    }

    return extraMaterialUsages;
  }

  function isUsageInCurrentExtraMaterialContext(usage: ExtraMaterialUsageItem) {
    if (isAdmin && selectedExtraMaterialOfficialId) {
      return usage.officialId === selectedExtraMaterialOfficialId;
    }

    return true;
  }

  function getExtraMaterialQuantity(itemId: string) {
    return extraMaterialQuantities[itemId] || '';
  }

  function updateExtraMaterialQuantity(itemId: string, value: string) {
    const onlyNumbers = value.replace(/\D/g, '');

    setExtraMaterialQuantities((current) => ({
      ...current,
      [itemId]: onlyNumbers,
    }));
  }

  function getExtraMaterialTotalUsed() {
    return getExtraMaterialUsagesForSelectedDco().reduce(
      (total, usage) => total + Number(usage.quantity || 0),
      0,
    );
  }


  function getExistingExtraMaterialUsageQuantity(itemId: string) {
    return extraMaterialUsages
      .filter(
        (usage) =>
          usage.itemId === itemId && isUsageInCurrentExtraMaterialContext(usage),
      )
      .reduce((total, usage) => total + Number(usage.quantity || 0), 0);
  }

  function getExtraMaterialAvailableForSave(stock: ExtraMaterialStockItem) {
    if (isFormMaterialName(stock.item?.name)) {
      return Number.MAX_SAFE_INTEGER;
    }

    return (
      Number(stock.quantity || 0) +
      getExistingExtraMaterialUsageQuantity(stock.itemId)
    );
  }

  function getExtraMaterialRegistrationLabel() {
    if (match?.extraMaterialUsed === true || getExtraMaterialUsagesForSelectedDco().length > 0) {
      return `${getExtraMaterialTotalUsed()} unidade(s)`;
    }

    if (match?.extraMaterialUsed === false) {
      return 'Sem registro de uso';
    }

    return 'Pendente';
  }

  function applyOperationSummary(summary: OperationSummaryResponse) {
    setMatch(summary.match);
    setScales(summary.scales || []);
    setDraws(summary.draws || []);
    setSubstitutions(summary.substitutions || []);
    setRoomInspections(summary.roomInspections || []);
    setOperationalLogs(summary.operationalLogs || []);
    setMatchKits(summary.matchKits || []);
    setMyKits(summary.myKits || []);
    const nextExtraMaterialUsages = summary.extraMaterialUsages || [];
    const nextExtraMaterialStocks = summary.myExtraMaterialStocks || [];

    setExtraMaterialUsages(nextExtraMaterialUsages);

    if (!isAdmin) {
      setMyExtraMaterialStocks(nextExtraMaterialStocks);
      syncExtraMaterialForm(
        summary.match || null,
        nextExtraMaterialUsages,
        nextExtraMaterialStocks,
      );
    }

    const defaultDcoId = (summary.scales || []).find(
      (scale) => scale.role === 'DCO',
    )?.official?.id;

    if (isAdmin && defaultDcoId && !selectedExtraMaterialOfficialId) {
      setSelectedExtraMaterialOfficialId(defaultDcoId);
    }

    setSelectedKitIds([]);
  }

  async function loadOperationSummary() {
    try {
      const response = await api.get<OperationSummaryResponse>(
        `/matches/${matchId}/operation-summary`,
      );

      applyOperationSummary(response.data);
    } finally {
      setScalesLoaded(true);
    }
  }

  async function loadExtraMaterialStocksForOfficial(officialId: string) {
    if (!officialId) return;

    try {
      setLoadingExtraMaterialStocks(true);

      const response = await api.get<ExtraMaterialStockItem[]>(
        `/extra-materials/stocks/official/${officialId}`,
      );
      const nextStocks = response.data || [];
      const nextUsages = extraMaterialUsages.filter(
        (usage) => usage.officialId === officialId,
      );

      setMyExtraMaterialStocks(nextStocks);
      syncExtraMaterialForm(match, nextUsages, nextStocks);
    } catch (error: any) {
      showMessage(
        'Erro ao carregar estoque do DCO',
        getErrorMessage(error, 'Erro ao carregar estoque de material do DCO.'),
        'danger',
      );
    } finally {
      setLoadingExtraMaterialStocks(false);
    }
  }

  async function loadMatch() {
    const response = await api.get(`/matches/${matchId}`);
    setMatch(response.data);
  }
  
  async function loadScales() {
    try {
      const response = await api.get('/match-officials');

      setScales(
        response.data.filter((scale: Scale) => scale.matchId === matchId),
      );
    } finally {
      setScalesLoaded(true);
    }
  }

  async function loadDraws() {
    const response = await api.get('/draws');
    setDraws(response.data.filter((draw: Draw) => draw.matchId === matchId));
  }

  async function loadSubstitutions() {
    const response = await api.get(`/substitutions?matchId=${matchId}`);
    setSubstitutions(response.data);
  }

  
  useEffect(() => {
    if (matchId) {
      setScalesLoaded(false);
      loadOperationSummary();
    }
  }, [matchId]);

  useEffect(() => {
    if (!isAdmin || selectedExtraMaterialOfficialId) return;

    const defaultDcoId = scales.find((scale) => scale.role === 'DCO')?.official?.id;

    if (defaultDcoId) {
      setSelectedExtraMaterialOfficialId(defaultDcoId);
    }
  }, [isAdmin, scales, selectedExtraMaterialOfficialId]);

  useEffect(() => {
    if (!isAdmin || !selectedExtraMaterialOfficialId) return;

    loadExtraMaterialStocksForOfficial(selectedExtraMaterialOfficialId);
  }, [isAdmin, selectedExtraMaterialOfficialId, extraMaterialUsages.length, match?.id]);

  useEffect(() => {
    if (!matchId) return;

    const interval = window.setInterval(() => {
      refreshOperationData();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    return () => {
      if (editingTimeoutRef.current) {
        window.clearTimeout(editingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (running) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }

    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    const currentMissionCode = match?.missionCode || '';

    setMissionCodeInput(currentMissionCode);

    const hasStoredConfirmation =
      getStoredMissionCodeConfirmation(currentMissionCode);

    if (
      hasStoredConfirmation ||
      match?.status === 'IN_PROGRESS' ||
      match?.status === 'CONTROL_DONE'
    ) {
      setMissionCodeConfirmed(true);
      return;
    }

    setMissionCodeConfirmed(false);
  }, [match?.missionCode, match?.status, matchId]);
  
  const hasRoomInspection = roomInspections.length > 0;
  const isControlDone = match?.status === 'CONTROL_DONE';
  const checkInLog = getOperationalLog('CHECKIN_STADIUM');
  const isCheckedIn = Boolean(checkInLog) || isControlDone;

  const hasDcoConfirmed = scales.some(
    (scale) => scale.role === 'DCO' && scale.confirmed === true,
  );

  const hasAssistant = scales.some(
    (scale) => scale.role === 'ASSISTANT',
  );

  const hasAssistantConfirmed = scales.some(
    (scale) => scale.role === 'ASSISTANT' && scale.confirmed === true,
  );

  const isScaleAcceptedByScales =
    hasDcoConfirmed && (!hasAssistant || hasAssistantConfirmed);

  const isScaleAccepted =
    match?.status === 'SCALE_ACCEPTED' ||
    match?.status === 'IN_PROGRESS' ||
    match?.status === 'CONTROL_DONE' ||
    isScaleAcceptedByScales;

  const isMatchInProgress =
    match?.status === 'IN_PROGRESS' ||
    match?.status === 'CONTROL_DONE';

  const hasDrawDone = draws.length > 0;
  const hasMatchKits = matchKits.length > 0;
  const canManageMatchKits = !!match && !isControlDone && isMatchInProgress && hasDrawDone;
  const dcoScales = scales.filter((scale) => scale.role === 'DCO');
  const selectedExtraMaterialUsages = getExtraMaterialUsagesForSelectedDco();
  const hasExtraMaterialUsages = extraMaterialUsages.length > 0;
  const hasSelectedExtraMaterialUsages = selectedExtraMaterialUsages.length > 0;
  const hasExtraMaterialDecision =
    match?.extraMaterialUsed === true || match?.extraMaterialUsed === false;
  const canManageExtraMaterials = !!match && isMatchInProgress && hasDrawDone && hasMatchKits;
  const canEditExtraMaterials =
    canManageExtraMaterials &&
    (!hasSelectedExtraMaterialUsages || isAdmin || editingExtraMaterials);
  const isExtraMaterialRegistrationLocked =
    hasSelectedExtraMaterialUsages && !isAdmin && !editingExtraMaterials;
  const canDcoEditExtraMaterials =
    hasSelectedExtraMaterialUsages && !isAdmin && match?.status === 'IN_PROGRESS';

  const savedDrawPlayers = draws.flatMap((draw) => draw.players);

  const canDoCheckIn =
    !!match &&
    !isControlDone &&
    !isCheckedIn &&
    isScaleAccepted;

  const canDoRoomInspection =
    !!match &&
    !isControlDone &&
    isCheckedIn &&
    !hasRoomInspection;

  const hasMissionCode = Boolean(match?.missionCode?.trim());
  const hasPostMissionProgress =
    Boolean(getOperationalLog('MATCH_IN_PROGRESS')) ||
    Boolean(getOperationalLog('DRAW_DONE')) ||
    Boolean(getOperationalLog('CONTROL_DONE')) ||
    hasDrawDone ||
    hasMatchKits ||
    Boolean(match?.athleteListFileName);

  const isMissionCodeConfirmed =
    missionCodeConfirmed ||
    isMatchInProgress ||
    isControlDone ||
    hasPostMissionProgress;

  const canFillMissionCode =
    !!match &&
    !isControlDone &&
    isCheckedIn &&
    hasRoomInspection &&
    !isMissionCodeConfirmed;

  const canStartMatch =
    !!match &&
    !isControlDone &&
    isCheckedIn &&
    hasRoomInspection &&
    isMissionCodeConfirmed &&
    match.status !== 'IN_PROGRESS';

  const canFinishControl =
    !!match &&
    !isControlDone &&
    isMatchInProgress &&
    hasDrawDone &&
    hasMatchKits &&
    hasExtraMaterialUsages;

  const canUploadAthleteListFile =
    !!match &&
    (
      (!isControlDone && isMissionCodeConfirmed) ||
      (isAdmin && ['IN_PROGRESS', 'CONTROL_DONE'].includes(match.status))
    );

  const canUploadFinalDocumentFile =
    isAdmin &&
    !!match &&
    isControlDone;

  const canShowOperationalSections =
    isMatchInProgress || hasDrawDone || isControlDone;

  function getOperationalSnapshot(params: {
    matchStatus?: string;
    matchMissionCode?: string | null;
    matchUpdatedAt?: string | null;
    logs?: OperationalLog[];
    drawCount?: number;
    kitCount?: number;
    substitutionCount?: number;
    roomInspectionCount?: number;
  }) {
    const orderedSteps = [...(params.logs || [])]
      .map((log) => `${log.step}:${log.createdAt}`)
      .sort()
      .join('|');

    return [
      params.matchStatus || '',
      params.matchMissionCode || '',
      params.matchUpdatedAt || '',
      orderedSteps,
      params.drawCount || 0,
      params.kitCount || 0,
      params.substitutionCount || 0,
      params.roomInspectionCount || 0,
    ].join('::');
  }

  async function refreshOperationData(options?: { silent?: boolean }) {
    if (!matchId || actionLockRef.current) return;

    if (!options?.silent && isUserEditingRef.current) {
      return;
    }

    try {
      const response = await api.get<OperationSummaryResponse>(
        `/matches/${matchId}/operation-summary`,
      );

      const summary = response.data;
      const nextMatch = summary.match;
      const nextScales = summary.scales || [];
      const nextDraws = summary.draws || [];
      const nextSubstitutions = summary.substitutions || [];
      const nextRoomInspections = summary.roomInspections || [];
      const nextOperationalLogs = summary.operationalLogs || [];
      const nextMatchKits = summary.matchKits || [];
      const nextMyKits = summary.myKits || [];
      const nextExtraMaterialUsages = summary.extraMaterialUsages || [];
      const nextMyExtraMaterialStocks = summary.myExtraMaterialStocks || [];

      const nextSnapshot = getOperationalSnapshot({
        matchStatus: nextMatch?.status,
        matchMissionCode: nextMatch?.missionCode || '',
        matchUpdatedAt: nextMatch?.updatedAt || '',
        logs: nextOperationalLogs,
        drawCount: nextDraws.length,
        kitCount: nextMatchKits.length,
        substitutionCount: nextSubstitutions.length,
        roomInspectionCount: nextRoomInspections.length,
      });

      const previousSnapshot = lastOperationalSnapshotRef.current;

      const hasConfirmedMissionCodeByProgress =
        nextMatch?.status === 'IN_PROGRESS' ||
        nextMatch?.status === 'CONTROL_DONE' ||
        nextDraws.length > 0 ||
        nextMatchKits.length > 0 ||
        Boolean(nextMatch?.athleteListFileName) ||
        nextOperationalLogs.some((log: OperationalLog) =>
          ['MATCH_IN_PROGRESS', 'DRAW_DONE', 'CONTROL_DONE'].includes(log.step),
        );

      const hasConfirmedMissionCodeByRemoteUpdate =
        Boolean(nextMatch?.missionCode?.trim()) &&
        Boolean(nextMatch?.updatedAt) &&
        Boolean(previousSnapshot) &&
        previousSnapshot !== nextSnapshot;

      const hasConfirmedMissionCodeByLocalStorage =
        getStoredMissionCodeConfirmation(nextMatch?.missionCode || '');

      if (
        hasConfirmedMissionCodeByProgress ||
        hasConfirmedMissionCodeByRemoteUpdate ||
        hasConfirmedMissionCodeByLocalStorage
      ) {
        setMissionCodeConfirmed(true);
      }

      setMatch(nextMatch);
      setScales(nextScales);
      setDraws(nextDraws);
      setSubstitutions(nextSubstitutions);
      setRoomInspections(nextRoomInspections);
      setOperationalLogs(nextOperationalLogs);
      setMatchKits(nextMatchKits);
      setMyKits(nextMyKits);
      setExtraMaterialUsages(nextExtraMaterialUsages);
      setMyExtraMaterialStocks(nextMyExtraMaterialStocks);
      syncExtraMaterialForm(nextMatch || null, nextExtraMaterialUsages);
      setSelectedKitIds([]);
      setScalesLoaded(true);

      lastOperationalSnapshotRef.current = nextSnapshot;

      if (
        !options?.silent &&
        previousSnapshot &&
        previousSnapshot !== nextSnapshot &&
        !hasShownExternalUpdateRef.current
      ) {
        hasShownExternalUpdateRef.current = true;
      }
    } catch (error) {
      console.warn('Não foi possível atualizar automaticamente a operação.', error);
    }
  }

  function formatTime() {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');

    return `${hrs}:${mins}:${secs}`;
  }

  function getTeamName(team: string) {
    if (!match) return team;
    return team === 'HOME' ? match.homeTeam : match.awayTeam;
  }

  function getSubstitutionsSummary(team: 'HOME' | 'AWAY') {
    return substitutions.filter((substitution) => substitution.team === team);
  }

  function updateDrawForm(field: keyof DrawForm, value: string) {
    if (isControlDone || (hasDrawDone && !editingDraw)) return;

    setDrawForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function getSavedDrawPlayer(team: 'HOME' | 'AWAY', type: 'EXAME' | 'RESERVA') {
    return savedDrawPlayers.find(
      (player) => player.team === team && player.type === type,
    );
  }

  async function loadRoomInspections() {
    const response = await api.get(`/room-inspections?matchId=${matchId}`);
    setRoomInspections(response.data);
  }

  async function loadOperationalLogs() {
    const response = await api.get(`/matches/${matchId}/operational-logs`);
    setOperationalLogs(response.data);
  }

  async function loadMyKits() {
    try {
      const response = await api.get('/inventory/kits/my');
      setMyKits(response.data || []);
    } catch (error) {
      console.warn('Não foi possível carregar os kits do DCO.', error);
      setMyKits([]);
    }
  }

  async function loadMatchKits() {
    try {
      const response = await api.get(`/inventory/matches/${matchId}/kits`);
      const linkedKits = response.data || [];

      setMatchKits(linkedKits);
      setSelectedKitIds([]);
    } catch (error) {
      console.warn('Não foi possível carregar os kits utilizados no jogo.', error);
      setMatchKits([]);
      setSelectedKitIds([]);
    }
  }

  function getStatusLabel(status: string) {
    if (status === 'SCHEDULED') return 'Agendado';
    if (status === 'SCALE_ACCEPTED') return 'Escala aceita';
    if (status === 'IN_PROGRESS') return 'Em andamento';
    if (status === 'CONTROL_DONE') return 'Controle realizado';
    if (status === 'CANCELED') return 'Cancelado';

    return status;
  }

  function getStatusClass(status: string) {
    if (status === 'SCHEDULED') return 'border border-slate-200 bg-slate-100 text-slate-700';
    if (status === 'SCALE_ACCEPTED') return 'border border-blue-200 bg-blue-100 text-blue-700';
    if (status === 'IN_PROGRESS') return 'border border-yellow-200 bg-yellow-100 text-yellow-700';
    if (status === 'CONTROL_DONE') return 'border border-green-200 bg-green-100 text-green-700';
    if (status === 'CANCELED') return 'border border-red-200 bg-red-100 text-red-700';

    return 'border border-slate-200 bg-slate-100 text-slate-700';
  }

  function getCurrentPosition(): Promise<{
    latitude: number;
    longitude: number;
  }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não disponível neste navegador.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          reject(
            new Error(
              'Não foi possível obter sua localização. Autorize o acesso à localização para fazer o check-in.',
            ),
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    });
  }

  function toggleKitSelection(kitId: string) {
    if (isControlDone) return;

    setSelectedKitIds((current) =>
      current.includes(kitId)
        ? current.filter((id) => id !== kitId)
        : [...current, kitId],
    );
  }

  async function handleSaveMatchKits() {
    if (isControlDone) return;

    if (selectedKitIds.length === 0) {
      showMessage('Selecione um kit', 'Selecione pelo menos um kit utilizado no controle.', 'warning');
      return;
    }

    const validAvailableKitIds = availableKitsForMatch.map((kit) => kit.id);
    const invalidSelectedKitIds = selectedKitIds.filter(
      (kitId) => !validAvailableKitIds.includes(kitId),
    );

    if (invalidSelectedKitIds.length > 0) {
      showMessage('Kit indisponível', 'A seleção possui kit que já foi utilizado ou não está mais disponível. Atualize a página e selecione novamente.', 'warning');
      await refreshOperationData({ silent: true });
      return;
    }

    try {
      setSavingKits(true);

      await api.post(`/inventory/matches/${matchId}/kits`, {
        kitIds: selectedKitIds,
      });

      await refreshOperationData({ silent: true });

      showMessage('Kits registrados', 'Kits utilizados registrados com sucesso!', 'success');
    } catch (error: any) {
      showMessage('Erro ao registrar kits', getErrorMessage(error, 'Erro ao registrar kits utilizados.'), 'danger');
    } finally {
      setSavingKits(false);
    }
  }

  async function handleRemoveMatchKit(kitId: string) {
    if (isControlDone) return;

    showConfirm({
      title: 'Remover kit utilizado',
      message: 'Deseja remover este registro de kit utilizado da partida?',
      variant: 'danger',
      confirmText: 'Remover',
      onConfirm: async () => {
        try {
          await api.delete(`/inventory/matches/${matchId}/kits/${kitId}`);

          await refreshOperationData({ silent: true });

          showMessage('Kit removido', 'Registro de kit utilizado removido com sucesso.', 'success');
        } catch (error: any) {
          showMessage('Erro ao remover kit', getErrorMessage(error, 'Erro ao remover kit utilizado da partida.'), 'danger');
        }
      },
    });
  }


  async function handleSaveExtraMaterials() {
    if (!match || !isMatchInProgress || !hasDrawDone || !hasMatchKits) {
      showMessage(
        'Registro indisponível',
        'O registro de material utilizado será liberado após o jogo estar em andamento, com sorteio e kits utilizados registrados.',
        'warning',
      );
      return;
    }

    if (isExtraMaterialRegistrationLocked) {
      showMessage(
        'Material já registrado',
        'O material utilizado já foi salvo e ficou bloqueado para o usuário. Solicite alteração para um administrador, se necessário.',
        'warning',
      );
      return;
    }

    if (isAdmin && !selectedExtraMaterialOfficialId) {
      showMessage(
        'Selecione o DCO',
        'Selecione o DCO responsável pela baixa do material utilizado no jogo.',
        'warning',
      );
      return;
    }

    const collectorStock = myExtraMaterialStocks.find((stock) =>
      isCollectorMaterialName(stock.item?.name),
    );

    if (!collectorStock) {
      showMessage(
        'Copo coletor obrigatório',
        'Cadastre o item Copo coletor em Material Extra antes de registrar o material utilizado no jogo.',
        'warning',
      );
      return;
    }

    const collectorAvailable = getExtraMaterialAvailableForSave(collectorStock);
    const extraCollectorQuantity =
      extraMaterialUseOption === 'YES'
        ? Number(extraMaterialQuantities[collectorStock.itemId] || 0)
        : 0;
    const collectorQuantity =
      REQUIRED_COLLECTOR_USAGE_QUANTITY + extraCollectorQuantity;

    if (
      !Number.isInteger(extraCollectorQuantity) ||
      extraCollectorQuantity < 0
    ) {
      showMessage(
        'Quantidade inválida',
        'Informe uma quantidade válida de copos coletores extras.',
        'warning',
      );
      return;
    }

    if (collectorAvailable < collectorQuantity) {
      showMessage(
        'Estoque insuficiente',
        `Você informou ${collectorQuantity} copo(s) coletor(es), mas existem ${collectorAvailable} unidade(s) disponível(is) com este DCO considerando o que já foi registrado neste jogo.`,
        'warning',
      );
      return;
    }

    const items = myExtraMaterialStocks
      .map((stock) => {
        const isCollector = isCollectorMaterialName(stock.item?.name);

        const quantity = isCollector
          ? collectorQuantity
          : extraMaterialUseOption === 'YES'
            ? Number(extraMaterialQuantities[stock.itemId] || 0)
            : 0;

        return {
          itemId: stock.itemId,
          quantity,
        };
      })
      .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0);

    const invalidStock = items.find((item) => {
      const stock = myExtraMaterialStocks.find(
        (current) => current.itemId === item.itemId,
      );

      if (!stock) return true;

      if (isFormMaterialName(stock.item?.name)) {
        return false;
      }

      return item.quantity > getExtraMaterialAvailableForSave(stock);
    });

    if (invalidStock) {
      const stock = myExtraMaterialStocks.find(
        (current) => current.itemId === invalidStock.itemId,
      );
      const availableQuantity = stock
        ? getExtraMaterialAvailableForSave(stock)
        : 0;

      showMessage(
        'Quantidade indisponível',
        `Você possui ${availableQuantity} unidade(s) de ${stock?.item?.name || 'material selecionado'} com este DCO considerando o que já foi registrado neste jogo.`,
        'warning',
      );
      return;
    }

    try {
      setSavingExtraMaterials(true);

      await api.post(`/extra-materials/matches/${matchId}/usages`, {
        used: true,
        officialId: isAdmin ? selectedExtraMaterialOfficialId : undefined,
        notes:
          extraMaterialUseOption === 'YES'
            ? extraMaterialNotes.trim() || undefined
            : undefined,
        items,
      });

      await refreshOperationData({ silent: true });
      setEditingExtraMaterials(false);

      showMessage(
        editingExtraMaterials ? 'Material utilizado atualizado' : 'Material utilizado registrado',
        extraMaterialUseOption === 'YES'
          ? 'Os copos coletores e os materiais extras utilizados foram salvos e o estoque do DCO foi atualizado.'
          : `Os ${REQUIRED_COLLECTOR_USAGE_QUANTITY} copos coletores obrigatórios foram salvos e o estoque do DCO foi atualizado.`,
        'success',
      );
    } catch (error: any) {
      showMessage(
        'Erro ao registrar material utilizado',
        getErrorMessage(error, 'Erro ao registrar material utilizado.'),
        'danger',
      );
    } finally {
      setSavingExtraMaterials(false);
    }
  }

  async function handleRemoveExtraMaterialUsage(usage: ExtraMaterialUsageItem) {
    showConfirm({
      title: 'Remover material extra',
      message: `Deseja remover o registro de ${usage.quantity} unidade(s) de ${usage.item.name}? A quantidade voltará para o estoque do DCO.`,
      variant: 'danger',
      confirmText: 'Remover',
      onConfirm: async () => {
        try {
          await api.delete(
            `/extra-materials/matches/${matchId}/usages/${usage.id}`,
          );

          await refreshOperationData({ silent: true });

          showMessage(
            'Material extra removido',
            'Registro removido com sucesso.',
            'success',
          );
        } catch (error: any) {
          showMessage(
            'Erro ao remover material extra',
            getErrorMessage(error, 'Erro ao remover material extra.'),
            'danger',
          );
        }
      },
    });
  }

  async function handleSaveMissionCode() {
    if (isControlDone) return;

    const missionCode = missionCodeInput.trim();

    if (!missionCode) {
      showMessage('Código obrigatório', 'Informe o código da missão para continuar.', 'warning');
      return;
    }

    try {
      setSavingMissionCode(true);

      await api.patch(`/matches/${matchId}/mission-code`, {
        missionCode,
      });

      saveMissionCodeConfirmation(missionCode);

      await refreshOperationData({ silent: true });
      setMissionCodeConfirmed(true);

      showMessage('Código confirmado', 'Código da missão confirmado com sucesso!', 'success');
    } catch (error: any) {
      showMessage('Erro ao confirmar código', getErrorMessage(error, 'Erro ao salvar código da missão.'), 'danger');
    } finally {
      setSavingMissionCode(false);
    }
  }

  function getPendingAthleteListFileCount(files = pendingAthleteListFiles) {
    return files.HOME.length + files.AWAY.length;
  }

  async function compressAthleteListImage(file: File): Promise<{
    fileName: string;
    fileType: string;
    dataUrl: string;
  }> {
    const sourceDataUrl = await readFileAsDataUrl(file);

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();

      element.onload = () => resolve(element);
      element.onerror = () =>
        reject(new Error('Não foi possível carregar uma das imagens selecionadas.'));
      element.src = sourceDataUrl;
    });

    const maxDimension = 1800;
    const jpegQuality = 0.82;
    const originalWidth = image.naturalWidth || image.width;
    const originalHeight = image.naturalHeight || image.height;

    if (!originalWidth || !originalHeight) {
      throw new Error('Uma das imagens selecionadas possui dimensões inválidas.');
    }

    const scale = Math.min(
      1,
      maxDimension / Math.max(originalWidth, originalHeight),
    );

    const targetWidth = Math.max(1, Math.round(originalWidth * scale));
    const targetHeight = Math.max(1, Math.round(originalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Não foi possível preparar a imagem para compactação.');
    }

    // Fundo branco evita áreas transparentes escuras ao converter PNG para JPEG.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const compactedDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
    const fileNameWithoutExtension = file.name.replace(/\.[^.]+$/, '') || 'relacao-atletas';

    return {
      fileName: `${fileNameWithoutExtension}.jpg`,
      fileType: 'image/jpeg',
      dataUrl: compactedDataUrl,
    };
  }

  function getImageFormat(fileType: string) {
    return fileType.includes('png') ? 'PNG' : 'JPEG';
  }

  function getImageDimensions(dataUrl: string): Promise<{
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        resolve({
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
        });
      };

      image.onerror = () => reject(new Error('Não foi possível carregar uma das imagens selecionadas.'));
      image.src = dataUrl;
    });
  }

  async function generateAthleteListPdfDataUrl(files: PendingAthleteListFiles) {
    if (!match) {
      throw new Error('Jogo não carregado.');
    }

    const { jsPDF } = await import('jspdf');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Relação de atletas', margin, 24);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(`Jogo: ${match.homeTeam} x ${match.awayTeam}`, margin, 38);
    pdf.text(`Campeonato: ${match.championship.name}`, margin, 46);
    pdf.text(`Data: ${formatDateOnly(match.matchDate)} às ${formatTimeOnly(match.matchDate)}`, margin, 54);
    pdf.text(`Estádio: ${match.stadium.name} - ${match.stadium.city}/${match.stadium.state}`, margin, 62);

    pdf.setFont('helvetica', 'bold');
    pdf.text(`Mandante: ${match.homeTeam} (${files.HOME.length} arquivo(s))`, margin, 82);
    pdf.text(`Visitante: ${match.awayTeam} (${files.AWAY.length} arquivo(s))`, margin, 90);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 18);

    const addImagePage = async (
      teamLabel: string,
      file: PendingAthleteListImageFile,
      index: number,
    ) => {
      pdf.addPage();

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(`${teamLabel} - arquivo ${index + 1}`, margin, 14);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(file.fileName, margin, 20);

      const dimensions = await getImageDimensions(file.dataUrl);
      const availableHeight = contentHeight - 14;
      const scale = Math.min(
        contentWidth / dimensions.width,
        availableHeight / dimensions.height,
      );

      const imageWidth = dimensions.width * scale;
      const imageHeight = dimensions.height * scale;
      const x = margin + (contentWidth - imageWidth) / 2;
      const y = 26;

      pdf.addImage(
        file.dataUrl,
        getImageFormat(file.fileType),
        x,
        y,
        imageWidth,
        imageHeight,
      );
    };

    for (let index = 0; index < files.HOME.length; index += 1) {
      await addImagePage(`Mandante - ${match.homeTeam}`, files.HOME[index], index);
    }

    for (let index = 0; index < files.AWAY.length; index += 1) {
      await addImagePage(`Visitante - ${match.awayTeam}`, files.AWAY[index], index);
    }

    return pdf.output('datauristring');
  }

  async function handleSelectAthleteListFiles(
    team: 'HOME' | 'AWAY',
    files: FileList | null,
  ) {
    if (!files) return;

    const selectedFiles = Array.from(files);

    if (selectedFiles.length === 0) return;

    const maxSizeInMb = 10;
    const maxSizeInBytes = maxSizeInMb * 1024 * 1024;
    const invalidTypeFile = selectedFiles.find(
      (file) => !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
    );

    if (invalidTypeFile) {
      showMessage(
        'Formato inválido',
        'Selecione somente imagens JPG, JPEG ou PNG.',
        'warning',
      );
      return;
    }

    const oversizedFile = selectedFiles.find((file) => file.size > maxSizeInBytes);

    if (oversizedFile) {
      showMessage(
        'Arquivo muito grande',
        `Cada imagem deve ter até ${maxSizeInMb} MB.`,
        'warning',
      );
      return;
    }

    try {
      const preparedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          const compactedImage = await compressAthleteListImage(file);

          return {
            id: `${team}-${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
            ...compactedImage,
          };
        }),
      );

      setPendingAthleteListFiles((current) => ({
        ...current,
        [team]: [...current[team], ...preparedFiles],
      }));
    } catch (error: any) {
      showMessage(
        'Erro ao preparar imagens',
        getErrorMessage(error, 'Erro ao preparar pré-visualização das imagens.'),
        'danger',
      );
    }
  }

  function removePendingAthleteListFile(team: 'HOME' | 'AWAY', fileId: string) {
    if (savingAthleteListFile || isAnyActionLoading) return;

    setPendingAthleteListFiles((current) => ({
      ...current,
      [team]: current[team].filter((file) => file.id !== fileId),
    }));
  }

  function cancelAthleteListPreview() {
    if (savingAthleteListFile || isAnyActionLoading) return;

    setPendingAthleteListFiles({
      HOME: [],
      AWAY: [],
    });
  }

  async function confirmAthleteListUpload() {
    if (getPendingAthleteListFileCount() === 0) {
      showMessage(
        'Nenhuma imagem selecionada',
        'Selecione pelo menos uma imagem do mandante ou do visitante para gerar a relação de atletas.',
        'warning',
      );
      return;
    }

    try {
      setSavingAthleteListFile(true);

      const pdfDataUrl = await generateAthleteListPdfDataUrl(pendingAthleteListFiles);
      const fileName = `relacao-atletas-${match?.homeTeam || 'mandante'}-x-${match?.awayTeam || 'visitante'}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'relacao-atletas';

      await api.patch(`/matches/${matchId}/documents`, {
        athleteListFileName: `${fileName}.pdf`,
        athleteListFileType: 'application/pdf',
        athleteListFileData: pdfDataUrl,
      });

      setPendingAthleteListFiles({
        HOME: [],
        AWAY: [],
      });

      await refreshOperationData({ silent: true });

      setModal({
        open: true,
        title: 'Relação salva',
        message: 'Relação de atletas gerada em PDF e salva com sucesso!',
        variant: 'success',
        confirmText: 'Continuar',
        onConfirm: () => {
          closeModal();
          window.location.reload();
        },
      });
    } catch (error: any) {
      showMessage(
        'Erro ao salvar relação',
        getErrorMessage(error, 'Erro ao gerar e salvar a relação de atletas.'),
        'danger',
      );
    } finally {
      setSavingAthleteListFile(false);
    }
  }

  async function handleUploadMatchDocument(
    type: 'athleteList' | 'finalDocument',
    selectedFile: File | FileList | null,
  ) {
    const file = selectedFile instanceof File ? selectedFile : selectedFile?.[0];

    if (!file) return;

    const maxSizeInMb = 10;
    const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      showMessage(
        'Arquivo muito grande',
        `Selecione um arquivo de até ${maxSizeInMb} MB.`,
        'warning',
      );
      return;
    }

    try {
      if (type === 'athleteList') {
        setSavingAthleteListFile(true);
      } else {
        setSavingFinalDocumentFile(true);
      }

      const fileData = await readFileAsDataUrl(file);

      const response = await api.patch(`/matches/${matchId}/documents`,
        type === 'athleteList'
          ? {
              athleteListFileName: file.name,
              athleteListFileType: file.type || 'application/octet-stream',
              athleteListFileData: fileData,
            }
          : {
              finalDocumentFileName: file.name,
              finalDocumentFileType: file.type || 'application/octet-stream',
              finalDocumentFileData: fileData,
            },
      );

      if (response.data) {
        setMatch(response.data);
      }

      if (type === 'finalDocument') {
        setModal({
          open: true,
          title: 'Documento salvo',
          message: 'Documento final do jogo salvo com sucesso. Atualize a página para visualizar o arquivo enviado.',
          variant: 'success',
          confirmText: 'Atualizar página',
          onConfirm: () => {
            closeModal();
            window.location.reload();
          },
        });

        return;
      }

      await refreshOperationData({ silent: true });

      setModal({
        open: true,
        title: 'Documento salvo',
        message: 'Relação de atletas salva com sucesso!',
        variant: 'success',
        confirmText: 'Continuar',
        onConfirm: () => {
          closeModal();
          window.location.reload();
        },
      });
    } catch (error: any) {
      showMessage(
        'Erro ao salvar documento',
        getErrorMessage(error, 'Erro ao salvar documento do jogo.'),
        'danger',
      );
    } finally {
      setSavingAthleteListFile(false);
      setSavingFinalDocumentFile(false);
    }
  }

  async function updateMatchStatus(status: string) {
    try {
      if (status === 'CONTROL_DONE' && matchKits.length === 0) {
        showMessage('Kits obrigatórios', 'Antes de finalizar o controle, registre pelo menos um kit utilizado na partida.', 'warning');
        return;
      }

      if (status === 'CONTROL_DONE' && extraMaterialUsages.length === 0) {
        showMessage('Material obrigatório', 'Antes de finalizar o controle, registre o material utilizado no jogo.', 'warning');
        return;
      }

      let location:
        | {
            latitude: number;
            longitude: number;
          }
        | undefined;

      if (status === 'SCALE_ACCEPTED') {
        location = await getCurrentPosition();
      }

      await api.patch(`/matches/${matchId}/status`, {
        status,
        latitude: location?.latitude,
        longitude: location?.longitude,
        comment:
          status === 'CONTROL_DONE'
            ? controlComment.trim() || null
            : undefined,
      });

      await refreshOperationData({ silent: true });

      if (status === 'CONTROL_DONE') {
        setControlComment('');
      }

      if (status === 'SCALE_ACCEPTED') {
        setModal({
          open: true,
          title: 'Check-in realizado',
          message: 'Check-in no estádio realizado com sucesso!',
          variant: 'success',
          confirmText: 'Continuar',
          onConfirm: () => {
            closeModal();
            window.location.reload();
          },
        });

        return;
      }

      if (status === 'IN_PROGRESS') {
        setModal({
          open: true,
          title: 'Jogo em andamento',
          message: 'Jogo marcado como em andamento com sucesso!',
          variant: 'success',
          confirmText: 'Continuar',
          onConfirm: () => {
            closeModal();
            window.location.reload();
          },
        });

        return;
      }

      showMessage('Status atualizado', 'Status do jogo atualizado com sucesso!', 'success');
    } catch (error: any) {
      showMessage('Erro ao atualizar status', getErrorMessage(error, 'Erro ao atualizar status do jogo'), 'danger');
    }
  }

  function getOperationalLog(step: OperationalStep) {
    return operationalLogs.find((log) => log.step === step);
  }

  function getOperationalStepLabel(step: OperationalStep) {
    if (step === 'CHECKIN_STADIUM') return 'Check-in no estádio';
    if (step === 'MATCH_IN_PROGRESS') return 'Jogo em andamento';
    if (step === 'DRAW_DONE') return 'Sorteio realizado';
    if (step === 'CONTROL_DONE') return 'Controle realizado';

    return step;
  }

  function getMapUrl(log: OperationalLog) {
    if (log.latitude === null || log.latitude === undefined) return '';
    if (log.longitude === null || log.longitude === undefined) return '';

    return `https://www.google.com/maps?q=${log.latitude},${log.longitude}`;
  }

  function renderOperationalLog(step: OperationalStep) {
    const log = getOperationalLog(step);

    if (!log) {
      return null;
    }

    return (
      <div className="mt-4 rounded-2xl bg-white/70 border border-slate-200 p-3 text-xs text-slate-600">
        <p>
          <strong>Registrado em:</strong>{' '}
          {new Date(log.createdAt).toLocaleString('pt-BR')}
        </p>

        <p className="mt-1">
          <strong>Usuário:</strong>{' '}
          {log.userName || log.userEmail || 'Não identificado'}
        </p>

        {log.comment && (
          <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-slate-700">
            <p className="font-black text-[var(--cdb-blue)]">
              Comentário do controle
            </p>

            <p className="mt-1 whitespace-pre-line leading-relaxed">
              {log.comment}
            </p>
          </div>
        )}

        {step === 'CHECKIN_STADIUM' &&
          log.latitude !== null &&
          log.latitude !== undefined &&
          log.longitude !== null &&
          log.longitude !== undefined && (
            <div className="mt-2 space-y-1">
              <p>
                <strong>Latitude:</strong> {log.latitude}
              </p>

              <p>
                <strong>Longitude:</strong> {log.longitude}
              </p>

              <a
                href={getMapUrl(log)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex mt-2 bg-[var(--cdb-blue)] text-white px-3 py-2 rounded-xl font-semibold"
              >
                Ver local no mapa
              </a>
            </div>
          )}
      </div>
    );
  }

  function getRoomStatus() {
    const hasRejected = roomItems.some((item) => item.status === 'NAO_CONFORME');
    const hasUnavailable = roomItems.some((item) => item.status === 'NAO_DISPONIVEL');

    if (hasRejected) return 'REPROVADA';
    if (hasUnavailable) return 'APROVADA_COM_OBSERVACOES';

    return 'APROVADA';
  }

  function getRoomStatusLabel(status: string) {
    if (status === 'APROVADA') return 'Aprovada';
    if (status === 'APROVADA_COM_OBSERVACOES') return 'Aprovada com observações';
    if (status === 'REPROVADA') return 'Reprovada';

    return status;
  }

  function getRoomStatusClass(status: string) {
    if (status === 'APROVADA') return 'bg-green-100 text-green-700';
    if (status === 'APROVADA_COM_OBSERVACOES') return 'bg-yellow-100 text-yellow-700';
    if (status === 'REPROVADA') return 'bg-red-100 text-red-700';

    return 'border border-slate-200 bg-slate-100 text-slate-700';
  }

  function updateRoomItem(index: number, field: 'status' | 'notes', value: string) {
    if (isControlDone) return;

    setRoomItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  async function handleRoomPhotos(files: FileList | null) {
    if (isControlDone) return;
    if (!files) return;

    const selectedFiles = Array.from(files);

    const photos = await Promise.all(
      selectedFiles.map(
        (file) =>
          new Promise<RoomInspectionPhoto>((resolve) => {
            const reader = new FileReader();

            reader.onload = () => {
              resolve({
                fileName: file.name,
                dataUrl: String(reader.result),
              });
            };

            reader.readAsDataURL(file);
          }),
      ),
    );

    setRoomPhotos((prev) => [...prev, ...photos]);
  }

  function removeRoomPhoto(index: number) {
    if (isControlDone) return;
    setRoomPhotos((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  async function saveRoomInspection() {
    if (isControlDone) {
      showMessage('Controle bloqueado', 'Controle já realizado. Não é possível alterar informações.', 'warning');
      return;
    }

    try {
      await api.post('/room-inspections', {
        matchId,
        status: getRoomStatus(),
        notes: roomNotes || null,
        items: roomItems,
        photos: roomPhotos,
      });

      setRoomItems(defaultRoomItems);
      setRoomNotes('');
      setRoomPhotos([]);

      await refreshOperationData({ silent: true });

      showMessage('Inspeção salva', 'Inspeção da sala salva com sucesso!', 'success');
    } catch (error: any) {
      showMessage('Erro ao salvar inspeção', getErrorMessage(error, 'Erro ao salvar inspeção da sala'), 'danger');
    }
  }

  async function deleteRoomInspection(id: string) {
    if (isControlDone) {
      showMessage('Controle bloqueado', 'Controle já realizado. Não é possível excluir inspeções.', 'warning');
      return;
    }

    showConfirm({
      title: 'Excluir inspeção',
      message: 'Deseja excluir esta inspeção?',
      variant: 'danger',
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/room-inspections/${id}`);
          await refreshOperationData({ silent: true });
          showMessage('Inspeção excluída', 'Inspeção excluída com sucesso.', 'success');
        } catch (error: any) {
          showMessage('Erro ao excluir inspeção', getErrorMessage(error, 'Erro ao excluir inspeção'), 'danger');
        }
      },
    });
  }

  function addPlayer() {
    if (isControlDone) return;

    if (!playerName || !playerNumber) {
      showMessage('Dados obrigatórios', 'Informe nome e número do atleta', 'warning');
      return;
    }

    setDrawnPlayers((prev) => [
      ...prev,
      {
        team: playerTeam,
        name: playerName,
        nickname: playerNickname || undefined,
        number: playerNumber,
        type: playerType,
      },
    ]);

    setPlayerName('');
    setPlayerNumber('');
    setPlayerNickname('');
    setPlayerType('EXAME');
  }

  function removePendingPlayer(index: number) {
    if (isControlDone) return;
    setDrawnPlayers((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  function startDrawEdit() {
    if (!isMatchInProgress || isControlDone || !hasDrawDone) return;

    const homeExam = getSavedDrawPlayer('HOME', 'EXAME');
    const homeReserve = getSavedDrawPlayer('HOME', 'RESERVA');
    const awayExam = getSavedDrawPlayer('AWAY', 'EXAME');
    const awayReserve = getSavedDrawPlayer('AWAY', 'RESERVA');

    setDrawForm({
      homeExamNumber: homeExam?.number || '',
      homeExamName: homeExam?.name || '',
      homeReserveNumber: homeReserve?.number || '',
      homeReserveName: homeReserve?.name || '',
      awayExamNumber: awayExam?.number || '',
      awayExamName: awayExam?.name || '',
      awayReserveNumber: awayReserve?.number || '',
      awayReserveName: awayReserve?.name || '',
    });

    setEditingDraw(true);
  }

  function cancelDrawEdit() {
    setEditingDraw(false);
    setDrawForm({
      homeExamNumber: '',
      homeExamName: '',
      homeReserveNumber: '',
      homeReserveName: '',
      awayExamNumber: '',
      awayExamName: '',
      awayReserveNumber: '',
      awayReserveName: '',
    });
  }

  async function saveDraw() {
    if (isControlDone) {
      showMessage('Controle bloqueado', 'Controle já realizado. Não é possível alterar informações.', 'warning');
      return;
    }

    if (hasDrawDone && !editingDraw) {
      showMessage('Sorteio já realizado', 'Clique em Alterar sorteio para editar os atletas.', 'warning');
      return;
    }

    const homeExamNumber = drawForm.homeExamNumber.trim();
    const homeExamName = drawForm.homeExamName.trim();
    const homeReserveNumber = drawForm.homeReserveNumber.trim();
    const homeReserveName = drawForm.homeReserveName.trim();

    const awayExamNumber = drawForm.awayExamNumber.trim();
    const awayExamName = drawForm.awayExamName.trim();
    const awayReserveNumber = drawForm.awayReserveNumber.trim();
    const awayReserveName = drawForm.awayReserveName.trim();

    if (!homeExamNumber || !homeExamName || !awayExamNumber || !awayExamName) {
      showMessage('Dados obrigatórios', 'Informe o número e o nome do Principal Exame de cada time.', 'warning');
      return;
    }

    if (
      (homeReserveNumber && !homeReserveName) ||
      (!homeReserveNumber && homeReserveName)
    ) {
      showMessage('Reserva do mandante', 'Para o Reserva do mandante, informe número e nome ou deixe ambos em branco.', 'warning');
      return;
    }

    if (
      (awayReserveNumber && !awayReserveName) ||
      (!awayReserveNumber && awayReserveName)
    ) {
      showMessage('Reserva do visitante', 'Para o Reserva do visitante, informe número e nome ou deixe ambos em branco.', 'warning');
      return;
    }

    const players: DrawPlayer[] = [
      {
        team: 'HOME',
        number: homeExamNumber,
        name: homeExamName,
        type: 'EXAME',
      },
      {
        team: 'AWAY',
        number: awayExamNumber,
        name: awayExamName,
        type: 'EXAME',
      },
    ];

    if (homeReserveNumber && homeReserveName) {
      players.push({
        team: 'HOME',
        number: homeReserveNumber,
        name: homeReserveName,
        type: 'RESERVA',
      });
    }

    if (awayReserveNumber && awayReserveName) {
      players.push({
        team: 'AWAY',
        number: awayReserveNumber,
        name: awayReserveName,
        type: 'RESERVA',
      });
    }

    try {
      if (editingDraw) {
        await api.patch(`/draws/matches/${matchId}`, {
          players,
        });
      } else {
        await api.post('/draws', {
          matchId,
          players,
        });

        await api.post(`/matches/${matchId}/operational-logs`, {
          step: 'DRAW_DONE',
        });
      }

      setDrawForm({
        homeExamNumber: '',
        homeExamName: '',
        homeReserveNumber: '',
        homeReserveName: '',
        awayExamNumber: '',
        awayExamName: '',
        awayReserveNumber: '',
        awayReserveName: '',
      });

      setDrawnPlayers([]);
      setEditingDraw(false);

      await refreshOperationData({ silent: true });

      showMessage(
        editingDraw ? 'Sorteio atualizado' : 'Sorteio salvo',
        editingDraw
          ? 'Sorteio alterado com sucesso!'
          : 'Sorteio realizado com sucesso!',
        'success',
      );
    } catch (error: any) {
      showMessage('Erro ao salvar sorteio', getErrorMessage(error, 'Erro ao salvar sorteio dos atletas'), 'danger');
    }
  }

  function formatDateOnly(date: string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatTimeOnly(date: string) {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

  const isCoordinator = userRole === 'COORDINATOR';
  const isOfficial = userRole === 'OFFICIAL';
  const userEmail = String(user?.email || user?.user?.email || '').toLowerCase();

  const isCurrentUserScaled = scales.some(
    (scale) =>
      scale.official.user.email.trim().toLowerCase() === userEmail,
  );

  const canAccessOperationPage =
    isAdmin ||
    ((isCoordinator || isOfficial) &&
      isCurrentUserScaled &&
      !(isOfficial && match?.status === 'CONTROL_DONE'));

  const accessDeniedMessage =
    isOfficial && match?.status === 'CONTROL_DONE'
      ? 'Este controle já foi concluído. Oficiais não têm acesso à operação após a finalização.'
      : 'Você não está escalado para esta partida ou não possui permissão para acessar esta operação.';

  if (!match || !scalesLoaded) {
    return (
      <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 p-8"><div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">Carregando...</div></div>
      </main>
    );
  }

  if (!canAccessOperationPage) {
    return (
      <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
        <Sidebar />

        <div className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm lg:p-8">
            <span className="inline-flex w-fit items-center rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-700">
              Acesso bloqueado
            </span>

            <h1 className="mt-4 text-2xl font-black text-[var(--cdb-dark)] lg:text-4xl">
              Operação indisponível
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 lg:text-base">
              {accessDeniedMessage}
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

  return (
    <main
      className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row"
      onFocusCapture={handleOperationFormFocus}
      onBlurCapture={handleOperationFormBlur}
      onInputCapture={handleOperationFormInput}
      onChangeCapture={handleOperationFormInput}
    >
      <Sidebar />

      <div className="flex-1">
        <header className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative p-6 lg:p-8">
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[var(--cdb-blue)]">
                    Operação da partida
                  </span>

                  <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--cdb-dark)] lg:text-5xl">
                    {match.homeTeam} x {match.awayTeam}
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 lg:text-base">
                    Acompanhe as etapas operacionais, oficiais escalados, sorteio, substituições e inspeção da sala.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700">
                      {match.championship.name}
                    </span>

                    <span className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700">
                      {formatDateOnly(match.matchDate)} às {formatTimeOnly(match.matchDate)}
                    </span>

                    <span className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700">
                      {match.stadium.name} · {match.stadium.city}/{match.stadium.state}
                    </span>

                    {match.missionCode && (
                      <span className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-[var(--cdb-blue)]">
                        Missão {userRole === 'OFFICIAL' ? '**********' : match.missionCode}
                      </span>
                    )}

                    {hasMissionOrder(match) && (
                      <span
                        className={`rounded-2xl border px-4 py-2 text-xs font-black ${
                          hasComplementaryMissionOrderAnalysis(match)
                            ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
                            : 'border-green-100 bg-green-50 text-green-800'
                        }`}
                      >
                        🧪 Análises: {getMissionOrderAnalysisDisplay(match)}
                      </span>
                    )}
                  </div>

                                  </div>

                <div className="flex flex-row flex-wrap gap-3 lg:flex-col lg:items-end">
                  <span
                    className={`${getStatusClass(
                      match.status,
                    )} w-fit rounded-2xl px-4 py-2 text-xs font-black shadow-sm lg:px-5 lg:py-3 lg:text-sm`}
                  >
                    {getStatusLabel(match.status)}
                  </span>

                  <Link
                    href="/dashboard/matches"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[var(--cdb-blue)]/30 hover:bg-blue-50 hover:text-[var(--cdb-blue)]"
                  >
                    ← Voltar para jogos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        {hasMissionOrder(match) && (
          <div className="px-4 pb-4 lg:px-8" data-section="analises-card-topo">
            <div
              className={`rounded-3xl border p-5 shadow-sm lg:p-6 ${
                hasComplementaryMissionOrderAnalysis(match)
                  ? 'border-yellow-200 bg-yellow-50 text-yellow-900'
                  : 'border-green-200 bg-green-50 text-green-900'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em]">
                    Análises da ordem de missão
                  </p>

                  <h2 className="mt-2 text-xl font-black">
                    Análises complementares = {getMissionOrderAnalysisDisplay(match)}
                  </h2>

                  <p className="mt-2 text-sm font-semibold leading-6">
                    {hasComplementaryMissionOrderAnalysis(match)
                      ? 'Atenção: esta ordem indica análise complementar. Preencha essa informação no formulário do controle.'
                      : 'A ordem indica somente urina. Não foi identificada análise complementar no arquivo.'}
                  </p>
                </div>

                <span className="w-fit rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-black">
                  {hasComplementaryMissionOrderAnalysis(match)
                    ? 'Com complementar'
                    : 'Somente urina'}
                </span>
              </div>
            </div>
          </div>
        )}

        {isControlDone && (
          <div className="px-4 pb-4 lg:px-8">
            <div className="rounded-3xl border border-green-200 bg-green-50 p-5 text-green-800 shadow-sm lg:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    Controle realizado
                  </h2>

                  <p className="mt-1 text-sm font-medium">
                    As informações operacionais deste jogo estão bloqueadas para edição.
                  </p>
                </div>

                <span className="w-fit rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                  Finalizado
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 pb-4 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                          Oficiais escalados
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          Equipe responsável pela operação
                        </p>
                      </div>

                      <span className="w-fit rounded-2xl bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                        {scales.length} oficial(is)
                      </span>
                    </div>

                    {scales.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {scales.map((scale) => (
                          <div
                            key={scale.id}
                            className="rounded-2xl border border-slate-200 bg-white p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                                  {scale.role === 'DCO' ? 'DCO' : 'Assistente'}
                                </p>

                                <p className="mt-1 truncate text-sm font-black text-slate-900">
                                  {scale.official.user.name}
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {scale.official.user.email}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                  scale.confirmed === true
                                    ? 'bg-green-100 text-green-700'
                                    : scale.confirmed === false
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {scale.confirmed === true
                                  ? 'Confirmado'
                                  : scale.confirmed === false
                                    ? 'Recusado'
                                    : 'Pendente'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm font-semibold text-slate-500">
                        Nenhum oficial escalado para este jogo.
                      </div>
                    )}
                  </div>

        </div>

        <section className="grid grid-cols-1 gap-4 px-4 pb-8 lg:gap-6 lg:px-8 xl:grid-cols-3">
<details open className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 lg:px-8 lg:py-6 [&::-webkit-details-marker]:hidden">
                <div>
                  <h2 className="text-xl font-black text-[var(--cdb-dark)] lg:text-2xl">
                    Status operacional
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Avance a operação seguindo a sequência obrigatória.
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-black text-slate-600 transition group-open:rotate-180">
                    ⌄
                  </span>
                </div>
              </summary>

              <div className="px-5 pb-5 lg:px-8 lg:pb-8">
              <div className="space-y-3">
                <div
                  className={`rounded-2xl border p-4 ${
                    isCheckedIn
                      ? 'bg-green-50 border-green-200'
                      : canDoCheckIn
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--cdb-dark)]">
                        1. Check-in no estádio
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Confirme a chegada da equipe ao estádio.
                      </p>
                    </div>

                    {isCheckedIn && (
                      <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        Feito
                      </span>
                    )}
                  </div>

                  {renderOperationalLog('CHECKIN_STADIUM')}

                  {canDoCheckIn && (
                    <button
                      type="button"
                      onClick={() =>
                        runExclusiveAction('checkin', () =>
                          updateMatchStatus('SCALE_ACCEPTED'),
                        )
                      }
                      disabled={isAnyActionLoading}
                      className="mt-4 w-full bg-[var(--cdb-blue)] text-white hover:brightness-95 py-3 rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading === 'checkin'
                        ? 'Registrando check-in...'
                        : 'Fazer check-in no estádio'}
                    </button>
                  )}
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    hasRoomInspection
                      ? 'bg-green-50 border-green-200'
                      : canDoRoomInspection
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--cdb-dark)]">
                        2. Inspeção da sala
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {hasRoomInspection
                          ? 'Checklist realizado. A inspeção da sala foi registrada para esta partida.'
                          : 'Realize o checklist da sala antes de marcar o jogo em andamento.'}
                      </p>
                    </div>

                    {hasRoomInspection ? (
                      <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        Feita
                      </span>
                    ) : (
                      <span className="shrink-0 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                        Pendente
                      </span>
                    )}
                  </div>

                  {canDoRoomInspection && (
                    <Link
                      href={`/dashboard/matches/${matchId}/room-inspection`}
                      className="mt-4 block w-full rounded-2xl bg-[var(--cdb-blue)] py-3 text-center font-semibold text-white transition hover:brightness-95"
                    >
                      Realizar inspeção da sala
                    </Link>
                  )}

                  {hasRoomInspection && (
                    <div className="mt-4 flex justify-end">
                      <Link
                        href={`/dashboard/matches/${matchId}/room-inspection`}
                        className="inline-flex w-fit items-center justify-center rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                      >
                        Visualizar inspeção
                      </Link>
                    </div>
                  )}

                  {!isCheckedIn && !isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      Aguardando check-in no estádio para liberar a inspeção da sala.
                    </p>
                  )}
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    isMissionCodeConfirmed
                      ? 'bg-green-50 border-green-200'
                      : canFillMissionCode
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--cdb-dark)]">
                        3. Código da missão
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {isMissionCodeConfirmed
                          ? 'Código da missão confirmado pelo DCO.'
                          : 'Revise o código da missão, ajuste se necessário e confirme para liberar as próximas etapas.'}
                      </p>
                    </div>

                    {isMissionCodeConfirmed ? (
                      <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        Confirmado
                      </span>
                    ) : hasMissionCode ? (
                      <span className="shrink-0 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                        Aguardando confirmação
                      </span>
                    ) : (
                      <span className="shrink-0 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                        Pendente
                      </span>
                    )}
                  </div>

                  {isMissionCodeConfirmed && hasMissionCode && (
                    <div className="mt-4 rounded-2xl border border-green-100 bg-white px-4 py-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            Código confirmado
                          </p>

                          <p className="mt-1 text-lg font-black text-[var(--cdb-dark)]">
                            {userRole === 'OFFICIAL' ? '**********' : match.missionCode}
                          </p>
                        </div>

                        {userRole !== 'OFFICIAL' && match.missionOrderFileName && (
                          <button
                            type="button"
                            onClick={() => confirmDownloadMatchDocument('mission-order')}
                            className="inline-flex w-fit items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
                          >
                            Baixar ordem de missão
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {canFillMissionCode && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Código da missão para confirmação *
                      </label>

                      <input
                        value={missionCodeInput}
                        onChange={(event) => setMissionCodeInput(event.target.value)}
                        placeholder="Revise ou informe o código da missão"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100"
                      />

                      {hasMissionCode && !isMissionCodeConfirmed && (
                        <p className="mt-2 text-xs text-yellow-700">
                          Código preenchido automaticamente. Revise e confirme antes de seguir.
                        </p>
                      )}

                      {userRole !== 'OFFICIAL' && match.missionOrderFileName && (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => confirmDownloadMatchDocument('mission-order')}
                            className="inline-flex w-fit items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
                          >
                            Baixar ordem de missão
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          runExclusiveAction('mission-code', handleSaveMissionCode)
                        }
                        disabled={
                          savingMissionCode ||
                          !missionCodeInput.trim() ||
                          isAnyActionLoading
                        }
                        className="mt-4 w-full rounded-2xl bg-[var(--cdb-blue)] py-3 font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading === 'mission-code' || savingMissionCode
                          ? 'Confirmando código...'
                          : 'Confirmar código da missão'}
                      </button>
                    </div>
                  )}

                  {!isCheckedIn && !isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      Aguardando check-in no estádio.
                    </p>
                  )}

                  {isCheckedIn && !hasRoomInspection && !isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      Aguardando inspeção da sala para liberar o código da missão.
                    </p>
                  )}
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    match.athleteListFileName
                      ? 'bg-green-50 border-green-200'
                      : canUploadAthleteListFile
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--cdb-dark)]">
                        4. Relação de atletas
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Envie uma ou mais imagens da relação de atletas do mandante e/ou visitante antes do sorteio.
                      </p>
                    </div>

                    {match.athleteListFileName ? (
                      <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        Enviada
                      </span>
                    ) : (
                      <span className="shrink-0 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                        Pendente
                      </span>
                    )}
                  </div>

                  {match.athleteListFileName && (
                    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-green-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                          Arquivo enviado
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-900">
                          {match.athleteListFileName}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => confirmDownloadMatchDocument('athlete-list')}
                        className="inline-flex items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
                      >
                        Baixar relação de atletas
                      </button>
                    </div>
                  )}

                  {canUploadAthleteListFile && (!match.athleteListFileName || isAdmin) ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                          <p className="text-sm font-bold text-[var(--cdb-blue)]">
                            Envie imagens separadas por equipe
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            Selecione uma ou mais fotos JPG, JPEG ou PNG do mandante e/ou visitante. Ao confirmar, o sistema vai gerar um único PDF e salvar no campo atual da relação de atletas.
                          </p>
                        </div>

                        {([
                          { team: 'HOME' as const, title: 'Time mandante', name: match.homeTeam },
                          { team: 'AWAY' as const, title: 'Time visitante', name: match.awayTeam },
                        ]).map((group) => (
                          <div
                            key={group.team}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                  {group.title}
                                </p>

                                <p className="mt-1 text-base font-black text-[var(--cdb-dark)]">
                                  {group.name}
                                </p>
                              </div>

                              <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
                                {pendingAthleteListFiles[group.team].length} imagem(ns)
                              </span>
                            </div>

                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                              multiple
                              disabled={
                                savingAthleteListFile ||
                                isAnyActionLoading
                              }
                              onChange={(event) => {
                                const files = event.currentTarget.files;

                                handleSelectAthleteListFiles(group.team, files);
                                event.currentTarget.value = '';
                              }}
                              className="block w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--cdb-blue)] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            {pendingAthleteListFiles[group.team].length > 0 && (
                              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {pendingAthleteListFiles[group.team].map((file) => (
                                  <div
                                    key={file.id}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                                  >
                                    <img
                                      src={file.dataUrl}
                                      alt={file.fileName}
                                      className="h-40 w-full object-contain bg-slate-50"
                                    />

                                    <div className="space-y-2 p-3">
                                      <p className="truncate text-xs font-bold text-slate-700" title={file.fileName}>
                                        {file.fileName}
                                      </p>

                                      <button
                                        type="button"
                                        onClick={() => removePendingAthleteListFile(group.team, file.id)}
                                        disabled={
                                          savingAthleteListFile ||
                                          isAnyActionLoading
                                        }
                                        className="w-full rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        Remover
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}

                        <p className="text-xs text-slate-500">
                          Formatos aceitos: JPG, JPEG ou PNG. Tamanho máximo: 10 MB por imagem.
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                          {getPendingAthleteListFileCount() > 0 && (
                            <button
                              type="button"
                              onClick={cancelAthleteListPreview}
                              disabled={
                                savingAthleteListFile ||
                                isAnyActionLoading
                              }
                              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Limpar seleção
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              runExclusiveAction(
                                'athlete-list-upload',
                                confirmAthleteListUpload,
                              )
                            }
                            disabled={
                              savingAthleteListFile ||
                              isAnyActionLoading ||
                              getPendingAthleteListFileCount() === 0
                            }
                            className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoading === 'athlete-list-upload' ||
                            savingAthleteListFile
                              ? 'Gerando PDF...'
                              : 'Gerar PDF e confirmar envio'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-slate-500">
                      {match.athleteListFileName
                        ? isAdmin
                          ? 'Arquivo enviado. Como ADMIN, você pode substituir a relação de atletas por um novo PDF.'
                          : 'Arquivo enviado. Não é possível enviar novamente após a confirmação.'
                        : isControlDone
                          ? isAdmin
                            ? 'Como ADMIN, você pode enviar a relação de atletas mesmo com o controle concluído.'
                            : 'Upload indisponível após o controle ser concluído.'
                          : 'Upload disponível após confirmar o código da missão.'}
                    </p>
                  )}
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    isMatchInProgress
                      ? 'bg-green-50 border-green-200'
                      : canStartMatch
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--cdb-dark)]">
                        5. Jogo em andamento
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Libera a etapa operacional da partida.
                      </p>
                    </div>

                    {isMatchInProgress && (
                      <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        Feito
                      </span>
                    )}
                  </div>

                  {renderOperationalLog('MATCH_IN_PROGRESS')}

                  {canStartMatch && (
                    <button
                      type="button"
                      onClick={() =>
                        runExclusiveAction('start-match', () =>
                          updateMatchStatus('IN_PROGRESS'),
                        )
                      }
                      disabled={isAnyActionLoading}
                      className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading === 'start-match'
                        ? 'Marcando jogo...'
                        : 'Marcar jogo em andamento'}
                    </button>
                  )}



                  {!isCheckedIn && !isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      {isScaleAccepted
                        ? 'Aguardando check-in no estádio.'
                        : 'Aguardando confirmação da escala pelos oficiais.'}
                    </p>
                  )}

                  {isCheckedIn && !hasRoomInspection && !isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      Aguardando inspeção da sala para liberar o jogo em andamento.
                    </p>
                  )}

                  {isCheckedIn && hasRoomInspection && !hasMissionCode && !isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      Aguardando confirmação do código da missão para liberar o jogo em andamento.
                    </p>
                  )}
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    substitutions.length > 0
                      ? 'bg-green-50 border-green-200'
                      : isMatchInProgress
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-[var(--cdb-dark)]">
                          6. Substituições
                        </p>

                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                          Opcional
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Consulte as substituições registradas. O cadastro e as alterações são feitos em uma página exclusiva.
                      </p>
                    </div>

                    {substitutions.length > 0 && (
                      <span className="w-fit shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        {substitutions.length} registrada(s)
                      </span>
                    )}
                  </div>

                  {(isMatchInProgress || substitutions.length > 0 || isControlDone) ? (
                    <div className="mt-4">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {(['HOME', 'AWAY'] as const).map((team) => {
                          const teamSubstitutions = getSubstitutionsSummary(team);
                          const outNumbers = teamSubstitutions
                            .map((item) => item.playerOutNumber)
                            .filter(Boolean);
                          const inNumbers = teamSubstitutions
                            .map((item) => item.playerInNumber)
                            .filter(Boolean);

                          return (
                            <div
                              key={`summary-${team}`}
                              className="rounded-2xl border border-slate-200 bg-white p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    {team === 'HOME' ? 'Mandante' : 'Visitante'}
                                  </p>

                                  <h3 className="mt-1 text-base font-black text-[var(--cdb-dark)]">
                                    {getTeamName(team)}
                                  </h3>
                                </div>

                                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-[var(--cdb-blue)]">
                                  {teamSubstitutions.length}/5
                                </span>
                              </div>

                              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div className="rounded-xl bg-red-50 px-3 py-2 ring-1 ring-red-100">
                                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-500">
                                    Saíram
                                  </p>
                                  <p className="mt-1 text-sm font-black text-red-700">
                                    {outNumbers.length > 0 ? outNumbers.join(', ') : '—'}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-green-50 px-3 py-2 ring-1 ring-green-100">
                                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-green-600">
                                    Entraram
                                  </p>
                                  <p className="mt-1 text-sm font-black text-green-700">
                                    {inNumbers.length > 0 ? inNumbers.join(', ') : '—'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {!isControlDone && isMatchInProgress && (
                        <Link
                          href={`/dashboard/matches/${matchId}/substitutions`}
                          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95 sm:w-auto"
                        >
                          Registrar substituições
                        </Link>
                      )}

                      {isControlDone && substitutions.length > 0 && (
                        <Link
                          href={`/dashboard/matches/${matchId}/substitutions`}
                          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm font-bold text-green-700 transition hover:bg-green-50 sm:w-auto"
                        >
                          Visualizar substituições
                        </Link>
                      )}

                      {isControlDone && substitutions.length === 0 && (
                        <p className="mt-4 text-xs text-slate-500">
                          Controle realizado sem substituições registradas.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-slate-500">
                      Disponível quando o jogo estiver em andamento.
                    </p>
                  )}
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    hasDrawDone
                      ? 'bg-green-50 border-green-200'
                      : isMatchInProgress
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--cdb-dark)]">
                        7. Sorteio realizado
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Registre os atletas sorteados para concluir esta etapa.
                      </p>
                    </div>

                    {hasDrawDone ? (
                      <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        Feito
                      </span>
                    ) : (
                      <span className="shrink-0 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                        Pendente
                      </span>
                    )}
                  </div>

                  {renderOperationalLog('DRAW_DONE')}

                  {hasDrawDone && !editingDraw && (
                    <div className="mt-4 rounded-2xl border border-green-100 bg-white p-4">
                      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            Atletas sorteados
                          </p>

                          <p className="mt-1 text-sm font-semibold text-green-800">
                            Sorteio registrado para exame.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-fit rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            Salvo
                          </span>

                          {isMatchInProgress && !isControlDone && !editingDraw && (
                            <button
                              type="button"
                              onClick={startDrawEdit}
                              className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-[var(--cdb-blue)] transition hover:bg-blue-100"
                            >
                              ✏️ Alterar sorteio
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {(['HOME', 'AWAY'] as const).map((team) => {
                          const examPlayer = getSavedDrawPlayer(team, 'EXAME');
                          const reservePlayer = getSavedDrawPlayer(team, 'RESERVA');

                          return (
                            <div
                              key={team}
                              className="rounded-2xl border border-green-100 bg-green-50 p-4"
                            >
                              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                {getTeamName(team)}
                              </p>

                              {examPlayer && (
                                <div className="mb-3">
                                  <p className="text-xs font-bold uppercase text-red-600">
                                    Principal exame
                                  </p>

                                  <p className="font-black text-[var(--cdb-dark)]">
                                    Nº {examPlayer.number} - {examPlayer.name}
                                  </p>
                                </div>
                              )}

                              {reservePlayer ? (
                                <div>
                                  <p className="text-xs font-bold uppercase text-yellow-600">
                                    Reserva
                                  </p>

                                  <p className="font-black text-[var(--cdb-dark)]">
                                    Nº {reservePlayer.number} - {reservePlayer.name}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-400">
                                  Reserva não informado.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(!hasDrawDone || editingDraw) && isMatchInProgress && !isControlDone && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:p-5">
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">
                          Mandante
                        </p>
  
                        <h3 className="text-xl font-black text-[var(--cdb-dark)]">
                          {match.homeTeam}
                        </h3>
                      </div>
  
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="font-black text-red-700">
                              Principal Exame
                            </h4>
  
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[11px] font-bold">
                              Obrigatório
                            </span>
                          </div>
  
                          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
                            <div>
                              <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                placeholder="Número"
                                value={drawForm.homeExamNumber}
                                disabled={isControlDone}
                                onChange={(e) =>
                                  updateDrawForm('homeExamNumber', e.target.value)
                                }
                              />
                              <label className="mt-2 block text-xs font-bold text-slate-600">Número *</label>
                            </div>
  
                            <div>
                              <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                placeholder="Nome do atleta"
                                value={drawForm.homeExamName}
                                disabled={isControlDone}
                                onChange={(e) =>
                                  updateDrawForm('homeExamName', e.target.value)
                                }
                              />
                              <label className="mt-2 block text-xs font-bold text-slate-600">Nome do atleta *</label>
                            </div>
                          </div>
                        </div>
  
                        <div className="rounded-2xl border border-yellow-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="font-black text-yellow-700">
                              Reserva
                            </h4>
  
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[11px] font-bold">
                              Opcional
                            </span>
                          </div>
  
                          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
                            <div>
                              <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                placeholder="Número"
                                value={drawForm.homeReserveNumber}
                                disabled={isControlDone}
                                onChange={(e) =>
                                  updateDrawForm('homeReserveNumber', e.target.value)
                                }
                              />
                              <label className="mt-2 block text-xs font-bold text-slate-600">Número</label>
                            </div>
  
                            <div>
                              <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                placeholder="Nome do atleta"
                                value={drawForm.homeReserveName}
                                disabled={isControlDone}
                                onChange={(e) =>
                                  updateDrawForm('homeReserveName', e.target.value)
                                }
                              />
                              <label className="mt-2 block text-xs font-bold text-slate-600">Nome do atleta</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
  
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:p-5">
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">
                          Visitante
                        </p>
  
                        <h3 className="text-xl font-black text-[var(--cdb-dark)]">
                          {match.awayTeam}
                        </h3>
                      </div>
  
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="font-black text-red-700">
                              Principal Exame
                            </h4>
  
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[11px] font-bold">
                              Obrigatório
                            </span>
                          </div>
  
                          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
                            <div>
                              <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                placeholder="Número"
                                value={drawForm.awayExamNumber}
                                disabled={isControlDone}
                                onChange={(e) =>
                                  updateDrawForm('awayExamNumber', e.target.value)
                                }
                              />
                              <label className="mt-2 block text-xs font-bold text-slate-600">Número *</label>
                            </div>
  
                            <div>
                              <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                placeholder="Nome do atleta"
                                value={drawForm.awayExamName}
                                disabled={isControlDone}
                                onChange={(e) =>
                                  updateDrawForm('awayExamName', e.target.value)
                                }
                              />
                              <label className="mt-2 block text-xs font-bold text-slate-600">Nome do atleta *</label>
                            </div>
                          </div>
                        </div>
  
                        <div className="rounded-2xl border border-yellow-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="font-black text-yellow-700">
                              Reserva
                            </h4>
  
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[11px] font-bold">
                              Opcional
                            </span>
                          </div>
  
                          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
                            <div>
                              <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                placeholder="Número"
                                value={drawForm.awayReserveNumber}
                                disabled={isControlDone}
                                onChange={(e) =>
                                  updateDrawForm('awayReserveNumber', e.target.value)
                                }
                              />
                              <label className="mt-2 block text-xs font-bold text-slate-600">Número</label>
                            </div>
  
                            <div>
                              <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                placeholder="Nome do atleta"
                                value={drawForm.awayReserveName}
                                disabled={isControlDone}
                                onChange={(e) =>
                                  updateDrawForm('awayReserveName', e.target.value)
                                }
                              />
                              <label className="mt-2 block text-xs font-bold text-slate-600">Nome do atleta</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
  


                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      {editingDraw
                        ? 'Revise os atletas e salve as alterações do sorteio.'
                        : 'Após salvar, o sorteio será exibido em Informações da partida.'}
                    </p>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      {editingDraw && (
                        <button
                          type="button"
                          disabled={isAnyActionLoading}
                          onClick={cancelDrawEdit}
                          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancelar alteração
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isControlDone || isAnyActionLoading}
                        onClick={() => runExclusiveAction('save-draw', saveDraw)}
                        className="rounded-2xl bg-green-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {actionLoading === 'save-draw'
                          ? editingDraw
                            ? 'Salvando alterações...'
                            : 'Salvando sorteio...'
                          : editingDraw
                            ? 'Salvar alterações'
                            : 'Salvar sorteio'}
                      </button>
                    </div>
                  </div>
                    </div>
                  )}

                  {!hasDrawDone && !editingDraw && isMatchInProgress && !isControlDone && (
                    <p className="mt-4 text-xs text-purple-700">
                      Após salvar os atletas sorteados, esta etapa ficará como sorteio realizado.
                    </p>
                  )}

                  {!isMatchInProgress && !isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      Aguardando o jogo ser marcado como em andamento.
                    </p>
                  )}
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    hasMatchKits
                      ? 'bg-green-50 border-green-200'
                      : canManageMatchKits
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--cdb-dark)]">
                        8. Kits utilizados no controle
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Registre os kits utilizados nesta partida. Ao salvar, eles sairão automaticamente da responsabilidade do DCO e ficarão marcados como utilizados.
                      </p>
                    </div>

                    {hasMatchKits ? (
                      <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        {matchKits.length} utilizado(s)
                      </span>
                    ) : (
                      <span className="shrink-0 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                        Pendente
                      </span>
                    )}
                  </div>

                  {matchKits.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {matchKits.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              Kit {item.kit.number}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.official?.user?.name
                                ? `Registrado por ${item.official.user.name}`
                                : 'Kit utilizado nesta partida'}
                            </p>
                          </div>

                          {!isControlDone && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMatchKit(item.kitId)}
                              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {canManageMatchKits && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Meus kits disponíveis
                      </p>

                      {availableKitsForMatch.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">
                          Nenhum kit disponível para o seu usuário. Solicite o repasse ao administrador.
                        </p>
                      ) : (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {availableKitsForMatch.map((kit) => {
                            const checked = selectedKitIds.includes(kit.id);

                            return (
                              <label
                                key={kit.id}
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                                  checked
                                    ? 'border-[var(--cdb-blue)] bg-blue-50 text-[var(--cdb-blue)]'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleKitSelection(kit.id)}
                                  className="h-4 w-4 accent-[var(--cdb-blue)]"
                                />
                                Kit {kit.number}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          runExclusiveAction('match-kits', handleSaveMatchKits)
                        }
                        disabled={
                          savingKits ||
                          selectedKitIds.length === 0 ||
                          isAnyActionLoading
                        }
                        className="mt-4 w-full rounded-2xl bg-[var(--cdb-blue)] py-3 font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading === 'match-kits' || savingKits
                          ? 'Salvando kits...'
                          : 'Registrar kits utilizados'}
                      </button>
                    </div>
                  )}

                  {!canManageMatchKits && !isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      Aguardando jogo em andamento e sorteio realizado para liberar o registro de kits utilizados.
                    </p>
                  )}
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    hasExtraMaterialDecision || hasExtraMaterialUsages
                      ? 'bg-green-50 border-green-200'
                      : canManageExtraMaterials
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--cdb-dark)]">
                        9. Material extra utilizado no jogo
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Registre somente os materiais extras utilizados. Os 2 copos coletores obrigatórios são contabilizados automaticamente.
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                      {canDcoEditExtraMaterials && (
                        <button
                          type="button"
                          onClick={() => {
                            syncExtraMaterialForm(
                              match,
                              selectedExtraMaterialUsages,
                              myExtraMaterialStocks,
                            );
                            setEditingExtraMaterials(true);
                          }}
                          disabled={isAnyActionLoading}
                          className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-[var(--cdb-blue)] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          ✏️ Alterar material
                        </button>
                      )}

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          hasExtraMaterialDecision || hasExtraMaterialUsages
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {getExtraMaterialRegistrationLabel()}
                      </span>
                    </div>
                  </div>

                  {selectedExtraMaterialUsages.some((usage) =>
                    isCollectorMaterialName(usage.item?.name)
                      ? Number(usage.quantity || 0) > REQUIRED_COLLECTOR_USAGE_QUANTITY
                      : Number(usage.quantity || 0) > 0,
                  ) && (
                    <div className="mt-4 space-y-2">
                      {selectedExtraMaterialUsages
                        .map((usage) => {
                          const isCollector = isCollectorMaterialName(usage.item?.name);
                          const visibleQuantity = isCollector
                            ? Math.max(0, Number(usage.quantity || 0) - REQUIRED_COLLECTOR_USAGE_QUANTITY)
                            : Number(usage.quantity || 0);

                          if (visibleQuantity <= 0) return null;

                          return (
                            <div
                              key={usage.id}
                              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                            >
                              <div>
                                <p className="text-sm font-black text-slate-900">
                                  {isCollector ? 'Copos coletores extras' : usage.item.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {visibleQuantity} unidade(s)
                                  {usage.official?.user?.name
                                    ? ` · DCO ${usage.official.user.name}`
                                    : ''}
                                </p>
                              </div>

                              {isAdmin && !isCollector && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExtraMaterialUsage(usage)}
                                  disabled={isAnyActionLoading}
                                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Remover
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {match?.extraMaterialUsed === false && selectedExtraMaterialUsages.length === 0 && (
                    <div className="mt-4 rounded-2xl border border-green-100 bg-white p-4 text-sm font-semibold text-green-700">
                      Registro antigo indicando que não houve uso. Atualize este item para registrar os 2 copos coletores obrigatórios.
                    </div>
                  )}

                  {isExtraMaterialRegistrationLocked && (
                    <div className="mt-4 rounded-2xl border border-green-100 bg-white p-4 text-sm text-green-700">
                      <p className="font-black">Material extra utilizado salvo</p>
                      <p className="mt-1">
                        Enquanto o jogo estiver em andamento, o DCO pode corrigir as quantidades registradas pelo botão no topo.
                      </p>
                    </div>
                  )}

                  {canEditExtraMaterials && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-black text-slate-900">
                          Foi utilizado material extra no jogo?
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Se selecionar Não, nenhum material extra será registrado. Os 2 copos obrigatórios continuarão sendo contabilizados automaticamente.
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setExtraMaterialUseOption('NO')}
                            disabled={isAnyActionLoading}
                            className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                              extraMaterialUseOption === 'NO'
                                ? 'border-green-300 bg-green-50 text-green-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            Não
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setExtraMaterialUseOption('YES');

                              const collectorStock = myExtraMaterialStocks.find((stock) =>
                                isCollectorMaterialName(stock.item?.name),
                              );

                              if (collectorStock) {
                                setExtraMaterialQuantities((current) => ({
                                  ...current,
                                  [collectorStock.itemId]:
                                    current[collectorStock.itemId] || '0',
                                }));
                              }
                            }}
                            disabled={isAnyActionLoading}
                            className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                              extraMaterialUseOption === 'YES'
                                ? 'border-blue-300 bg-blue-50 text-[var(--cdb-blue)]'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            Sim
                          </button>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="mt-4">
                          <label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            DCO para baixa do material
                          </label>
                          <select
                            value={selectedExtraMaterialOfficialId}
                            onChange={(event) =>
                              setSelectedExtraMaterialOfficialId(event.target.value)
                            }
                            disabled={isAnyActionLoading}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            <option value="">Selecione um DCO</option>
                            {dcoScales.map((scale) => (
                              <option key={scale.official.id} value={scale.official.id}>
                                {scale.official.user.name}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-slate-500">
                            A baixa dos copos e dos demais materiais controlados será feita no estoque do DCO selecionado.
                          </p>
                        </div>
                      )}

                      {extraMaterialUseOption === 'NO' ? (
                        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                          <p className="text-sm font-black text-green-800">
                            Nenhum material extra utilizado
                          </p>

                          <p className="mt-1 text-xs text-green-700">
                            Ao salvar, nenhum material extra será informado. O sistema continuará contabilizando automaticamente os {REQUIRED_COLLECTOR_USAGE_QUANTITY} copos coletores obrigatórios.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                            <p className="font-black">Informe os materiais utilizados</p>
                            <p className="mt-1">
                              Informe somente os materiais extras realmente utilizados. Para copos, digite apenas a quantidade adicional além dos 2 obrigatórios.
                            </p>
                          </div>

                          <div className="mt-4 space-y-3">
                            {isAdmin && !selectedExtraMaterialOfficialId ? (
                              <p className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                                Selecione um DCO para visualizar os materiais disponíveis para baixa.
                              </p>
                            ) : loadingExtraMaterialStocks ? (
                              <p className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                                Carregando materiais do DCO selecionado...
                              </p>
                            ) : myExtraMaterialStocks.length === 0 ? (
                              <p className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                                Nenhum material cadastrado. Cadastre os materiais em Material Extra antes de registrar o uso no jogo.
                              </p>
                            ) : (
                              myExtraMaterialStocks.map((stock) => {
                                const isCollector = isCollectorMaterialName(stock.item?.name);
                                const isFormMaterial = isFormMaterialName(stock.item?.name);
                                const alreadyUsed = getExistingExtraMaterialUsageQuantity(stock.itemId);
                                const availableToUse = getExtraMaterialAvailableForSave(stock);
                                const hasInsufficientCollector =
                                  isCollector && availableToUse < REQUIRED_COLLECTOR_USAGE_QUANTITY;

                                return (
                                  <div
                                    key={stock.id}
                                    className={`grid gap-3 rounded-2xl border p-4 sm:grid-cols-[1fr_140px] sm:items-center ${
                                      hasInsufficientCollector
                                        ? 'border-red-200 bg-red-50'
                                        : isCollector
                                          ? 'border-blue-200 bg-blue-50'
                                          : 'border-slate-200 bg-slate-50'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-black text-slate-900">
                                          {isCollector ? 'Copos coletores extras' : stock.item.name}
                                        </p>

                                        {isCollector && (
                                          <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-[var(--cdb-blue)] ring-1 ring-blue-100">
                                            2 obrigatórios já inclusos
                                          </span>
                                        )}
                                      </div>

                                      <p className="mt-1 text-xs text-slate-500">
                                        {isFormMaterial
                                          ? 'Sem controle de estoque · informe somente a quantidade utilizada neste jogo'
                                          : isCollector
                                            ? `Disponível com o DCO: ${stock.quantity} unidade(s) · os 2 obrigatórios são somados automaticamente${
                                                alreadyUsed > 0
                                                  ? ` · total já registrado neste jogo: ${alreadyUsed}`
                                                  : ''
                                              }`
                                            : `Disponível com o DCO: ${stock.quantity} unidade(s)${
                                                alreadyUsed > 0
                                                  ? ` · já registrado neste jogo: ${alreadyUsed}`
                                                  : ''
                                              }`}
                                      </p>

                                      {isCollector && (
                                        <p className={`mt-1 text-xs font-bold ${hasInsufficientCollector ? 'text-red-700' : 'text-blue-700'}`}>
                                          Digite apenas quantos copos foram usados além dos {REQUIRED_COLLECTOR_USAGE_QUANTITY} obrigatórios.
                                        </p>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                        {isCollector ? 'Qtd. extra' : 'Qtd. usada'}
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        max={
                                          isFormMaterial
                                            ? undefined
                                            : isCollector
                                              ? Math.max(0, availableToUse - REQUIRED_COLLECTOR_USAGE_QUANTITY)
                                              : availableToUse
                                        }
                                        value={getExtraMaterialQuantity(stock.itemId)}
                                        onChange={(event) => {
                                          const nextValue = event.target.value.replace(/\D/g, '');

                                          updateExtraMaterialQuantity(
                                            stock.itemId,
                                            nextValue,
                                          );
                                        }}
                                        disabled={
                                          isAnyActionLoading ||
                                          (!isFormMaterial && availableToUse <= 0)
                                        }
                                        className="mt-1 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                      />
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          <label className="mt-4 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            Observação
                          </label>

                          <textarea
                            value={extraMaterialNotes}
                            onChange={(event) => setExtraMaterialNotes(event.target.value)}
                            placeholder="Campo opcional. Exemplo: fita parcial, formulários ou outros materiais utilizados."
                            rows={3}
                            maxLength={1500}
                            disabled={isAnyActionLoading}
                            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                          />
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          runExclusiveAction(
                            'extra-materials',
                            handleSaveExtraMaterials,
                          )
                        }
                        disabled={savingExtraMaterials || isAnyActionLoading}
                        className="mt-4 w-full rounded-2xl bg-[var(--cdb-blue)] py-3 font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading === 'extra-materials' || savingExtraMaterials
                          ? 'Salvando material extra...'
                          : editingExtraMaterials
                            ? 'Salvar alterações'
                            : extraMaterialUseOption === 'NO'
                              ? 'Registrar sem material extra'
                              : 'Salvar material extra'}
                      </button>

                      {editingExtraMaterials && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExtraMaterials(false);
                            syncExtraMaterialForm(
                              match,
                              selectedExtraMaterialUsages,
                              myExtraMaterialStocks,
                            );
                          }}
                          disabled={isAnyActionLoading}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancelar alteração
                        </button>
                      )}
                    </div>
                  )}

                  {!canManageExtraMaterials && (
                    <p className="mt-4 text-xs text-slate-500">
                      Esse registro será liberado após o jogo estar em andamento, com sorteio e kits utilizados registrados.
                    </p>
                  )}
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    isControlDone
                      ? 'bg-green-50 border-green-200'
                      : canFinishControl
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--cdb-dark)]">
                        10. Controle realizado
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Finaliza a operação e bloqueia alterações.
                      </p>
                    </div>

                    {isControlDone && (
                      <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        Finalizado
                      </span>
                    )}
                  </div>

                  {renderOperationalLog('CONTROL_DONE')}

                  {canFinishControl && (
                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-white p-4">
                      <label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Comentário do controle
                      </label>

                      <textarea
                        value={controlComment}
                        onChange={(event) => setControlComment(event.target.value)}
                        placeholder="Descreva aqui informações relevantes que aconteceram no controle de doping. Campo opcional."
                        rows={4}
                        maxLength={2000}
                        disabled={isAnyActionLoading}
                        className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        Campo opcional. Use para registrar observações relevantes do controle.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          runExclusiveAction('finish-control', () =>
                            updateMatchStatus('CONTROL_DONE'),
                          )
                        }
                        disabled={isAnyActionLoading}
                        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading === 'finish-control'
                          ? 'Finalizando controle...'
                          : 'Marcar controle realizado'}
                      </button>
                    </div>
                  )}

                  {!canFinishControl && !isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      Aguardando jogo em andamento, sorteio, kits utilizados e material utilizado registrados.
                    </p>
                  )}
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    match.finalDocumentFileName
                      ? 'bg-green-50 border-green-200'
                      : isControlDone
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--cdb-dark)]">
                        11. Documentos do jogo
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Após finalizar o controle, o ADMIN deverá enviar o documento final do jogo para consulta posterior.
                      </p>
                    </div>

                    {match.finalDocumentFileName ? (
                      <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        Enviado
                      </span>
                    ) : (
                      <span className="shrink-0 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                        Pendente
                      </span>
                    )}
                  </div>

                  {match.finalDocumentFileName && (
                    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-green-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                          Documento enviado
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-900">
                          {match.finalDocumentFileName}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => confirmDownloadMatchDocument('final-document')}
                        className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                      >
                        Baixar documento
                      </button>
                    </div>
                  )}

                  {canUploadFinalDocumentFile && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        Documento final do jogo
                      </label>

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={savingFinalDocumentFile || isAnyActionLoading}
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0] || null;
                          event.currentTarget.value = '';

                          if (!file) return;

                          runExclusiveAction('final-document-upload', () =>
                            handleUploadMatchDocument('finalDocument', file),
                          );
                        }}
                        className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--cdb-blue)] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        Formatos aceitos: PDF, JPG ou PNG. Tamanho máximo: 10 MB.
                      </p>
                    </div>
                  )}

                  {!isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      O upload dos documentos finais será liberado para o ADMIN após o controle realizado.
                    </p>
                  )}
                </div>

                {isControlDone && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 text-sm">
                    Controle já realizado. Informações operacionais principais bloqueadas.
                  </div>
                )}
              </div>
              </div>
            </details>

          <div className="xl:col-span-3 space-y-4 lg:space-y-6">
                                    
          </div>

                  </section>
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
