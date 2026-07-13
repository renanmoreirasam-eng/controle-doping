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
  official: { user: { name: string; email: string } };
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

type SubstitutionFormRow = {
  playerOutNumber: string;
  playerInNumber: string;
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


function createEmptySubstitutionRows(): SubstitutionFormRow[] {
  return Array.from({ length: 5 }, () => ({
    playerOutNumber: '',
    playerInNumber: '',
  }));
}

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
  | 'final-document-upload'
  | 'substitutions';

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

  const [substitutionForm, setSubstitutionForm] = useState<{
    HOME: SubstitutionFormRow[];
    AWAY: SubstitutionFormRow[];
  }>({
    HOME: createEmptySubstitutionRows(),
    AWAY: createEmptySubstitutionRows(),
  });
  const [showSubstitutionsForm, setShowSubstitutionsForm] = useState(false);
  const [visibleSubstitutionRows, setVisibleSubstitutionRows] = useState<{
    HOME: number;
    AWAY: number;
  }>({
    HOME: 1,
    AWAY: 1,
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

  function applyOperationSummary(summary: OperationSummaryResponse) {
    setMatch(summary.match);
    setScales(summary.scales || []);
    setDraws(summary.draws || []);
    setSubstitutions(summary.substitutions || []);
    setRoomInspections(summary.roomInspections || []);
    setOperationalLogs(summary.operationalLogs || []);
    setMatchKits(summary.matchKits || []);
    setMyKits(summary.myKits || []);
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
    const nextForm = {
      HOME: createEmptySubstitutionRows(),
      AWAY: createEmptySubstitutionRows(),
    };

    const orderedSubstitutions = [...substitutions].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );

    for (const team of ['HOME', 'AWAY'] as const) {
      orderedSubstitutions
        .filter((sub) => sub.team === team)
        .slice(0, 5)
        .forEach((sub, index) => {
          nextForm[team][index] = {
            playerOutNumber: sub.playerOutNumber,
            playerInNumber: sub.playerInNumber,
          };
        });
    }

    setSubstitutionForm(nextForm);

    setVisibleSubstitutionRows({
      HOME: Math.max(
        1,
        nextForm.HOME.filter(
          (row) => row.playerOutNumber || row.playerInNumber,
        ).length,
      ),
      AWAY: Math.max(
        1,
        nextForm.AWAY.filter(
          (row) => row.playerOutNumber || row.playerInNumber,
        ).length,
      ),
    });
  }, [substitutions]);

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
    hasMatchKits;

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

  function wasSubstituted(player: DrawPlayer) {
    return substitutions.find(
      (sub) => sub.team === player.team && sub.playerOutNumber === player.number,
    );
  }

  function updateSubstitutionForm(
    team: 'HOME' | 'AWAY',
    index: number,
    field: keyof SubstitutionFormRow,
    value: string,
  ) {
    if (isControlDone) return;

    setSubstitutionForm((prev) => {
      const rows = [...prev[team]];
      rows[index] = {
        ...rows[index],
        [field]: value,
      };

      return {
        ...prev,
        [team]: rows,
      };
    });
  }

  function addSubstitutionRow(team: 'HOME' | 'AWAY') {
    if (isControlDone) return;

    setVisibleSubstitutionRows((prev) => ({
      ...prev,
      [team]: Math.min(5, prev[team] + 1),
    }));
  }

  async function removeSubstitutionRow(team: 'HOME' | 'AWAY', index: number) {
    if (isControlDone || isAnyActionLoading) return;

    const nextRows = [...substitutionForm[team]];
    nextRows.splice(index, 1);
    nextRows.push({
      playerOutNumber: '',
      playerInNumber: '',
    });

    const nextForm = {
      ...substitutionForm,
      [team]: nextRows,
    };

    setSubstitutionForm(nextForm);

    setVisibleSubstitutionRows((prev) => ({
      ...prev,
      [team]: Math.max(1, prev[team] - 1),
    }));

    await runExclusiveAction('substitutions', () =>
      saveSubstitutions(nextForm),
    );
  }

  function getSubstitutionsSummary(team: 'HOME' | 'AWAY') {
    return substitutions.filter((substitution) => substitution.team === team);
  }

  function updateDrawForm(field: keyof DrawForm, value: string) {
    if (isControlDone || hasDrawDone) return;

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
        selectedFiles.map(async (file) => ({
          id: `${team}-${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
          fileName: file.name,
          fileType: file.type || 'image/jpeg',
          dataUrl: await readFileAsDataUrl(file),
        })),
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

      showMessage(
        'Relação salva',
        'Relação de atletas gerada em PDF e salva com sucesso!',
        'success',
      );
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

      showMessage(
        'Documento salvo',
        'Relação de atletas salva com sucesso!',
        'success',
      );
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

  async function saveDraw() {
    if (isControlDone) {
      showMessage('Controle bloqueado', 'Controle já realizado. Não é possível alterar informações.', 'warning');
      return;
    }

    if (hasDrawDone) {
      showMessage('Sorteio já realizado', 'Sorteio já realizado para este jogo.', 'warning');
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
      await api.post('/draws', {
        matchId,
        players,
      });

      await api.post(`/matches/${matchId}/operational-logs`, {
        step: 'DRAW_DONE',
      });

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

      await refreshOperationData({ silent: true });

      showMessage('Sorteio salvo', 'Sorteio realizado com sucesso!', 'success');
    } catch (error: any) {
      showMessage('Erro ao salvar sorteio', getErrorMessage(error, 'Erro ao salvar sorteio dos atletas'), 'danger');
    }
  }

  async function saveSubstitutions(
    formToSave: {
      HOME: SubstitutionFormRow[];
      AWAY: SubstitutionFormRow[];
    } = substitutionForm,
  ) {
    if (isControlDone) {
      showMessage('Controle bloqueado', 'Controle já realizado. Não é possível alterar informações.', 'warning');
      return;
    }

    const rowsToSave = (['HOME', 'AWAY'] as const).flatMap((team) =>
      formToSave[team]
        .map((row, index) => ({
          team,
          index,
          playerOutNumber: row.playerOutNumber.trim(),
          playerInNumber: row.playerInNumber.trim(),
        }))
        .filter((row) => row.playerOutNumber || row.playerInNumber),
    );

    const incompleteRow = rowsToSave.find(
      (row) => !row.playerOutNumber || !row.playerInNumber,
    );

    if (incompleteRow) {
      showMessage('Substituição incompleta', `Preencha Nº saiu e Nº entrou na substituição ${incompleteRow.index + 1} de ${getTeamName(incompleteRow.team)}.`, 'warning');
      return;
    }

    try {
      for (const substitution of substitutions) {
        await api.delete(`/substitutions/${substitution.id}`);
      }

      for (const row of rowsToSave) {
        await api.post('/substitutions', {
          matchId,
          team: row.team,
          playerOutName: `Atleta ${row.playerOutNumber}`,
          playerOutNumber: row.playerOutNumber,
          playerInName: `Atleta ${row.playerInNumber}`,
          playerInNumber: row.playerInNumber,
          minute: null,
          period: null,
          notes: null,
        });
      }

      await refreshOperationData({ silent: true });

      showMessage('Substituições salvas', 'Substituições salvas com sucesso!', 'success');
    } catch (error: any) {
      showMessage('Erro ao salvar substituições', getErrorMessage(error, 'Erro ao salvar substituições'), 'danger');
    }
  }

  async function deleteSubstitution(id: string) {
    if (isControlDone) {
      showMessage('Controle bloqueado', 'Controle já realizado. Não é possível excluir substituições.', 'warning');
      return;
    }

    showConfirm({
      title: 'Remover substituição',
      message: 'Deseja remover esta substituição?',
      variant: 'danger',
      confirmText: 'Remover',
      onConfirm: async () => {
        try {
          await api.delete(`/substitutions/${id}`);
          await refreshOperationData({ silent: true });
          showMessage('Substituição removida', 'Substituição removida com sucesso.', 'success');
        } catch (error: any) {
          showMessage('Erro ao remover substituição', getErrorMessage(error, 'Erro ao remover substituição'), 'danger');
        }
      },
    });
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

                  {(isMatchInProgress || substitutions.length > 0 || isControlDone) && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            Substituições
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            {substitutions.length > 0
                              ? `${substitutions.length} substituição(ões) registrada(s).`
                              : 'Nenhuma substituição registrada.'}
                          </p>
                        </div>

                        {!isControlDone && isMatchInProgress && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowSubstitutionsForm((current) => !current)
                            }
                            className="inline-flex w-fit items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
                          >
                            {showSubstitutionsForm
                              ? 'Ocultar substituições'
                              : substitutions.length > 0
                                ? 'Ver/editar substituições'
                                : 'Registrar substituições'}
                          </button>
                        )}
                      </div>

                      {substitutions.length > 0 && !showSubstitutionsForm && (
                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                          {(['HOME', 'AWAY'] as const).map((team) => {
                            const teamSubstitutions = getSubstitutionsSummary(team);

                            return (
                              <div
                                key={`summary-${team}`}
                                className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                              >
                                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                  {getTeamName(team)}
                                </p>

                                {teamSubstitutions.length > 0 ? (
                                  <div className="space-y-2">
                                    {teamSubstitutions.map((substitution, index) => (
                                      <p
                                        key={substitution.id || `${team}-${index}`}
                                        className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-100"
                                      >
                                        Nº {substitution.playerOutNumber} saiu → Nº{' '}
                                        {substitution.playerInNumber} entrou
                                      </p>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-400">
                                    Nenhuma substituição registrada.
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {showSubstitutionsForm && !isControlDone && isMatchInProgress && (
                        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {(['HOME', 'AWAY'] as const).map((team) => (
                              <div
                                key={`form-${team}`}
                                className="rounded-2xl border border-slate-200 bg-white p-4"
                              >
                                <div className="mb-4 flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                      {team === 'HOME'
                                        ? 'Equipe mandante'
                                        : 'Equipe visitante'}
                                    </p>

                                    <h3 className="mt-1 text-lg font-black text-[var(--cdb-dark)]">
                                      {getTeamName(team)}
                                    </h3>
                                  </div>

                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                    Máx. 5
                                  </span>
                                </div>

                                <div className="space-y-3">
                                  {substitutionForm[team]
                                    .slice(0, visibleSubstitutionRows[team])
                                    .map((row, index) => (
                                      <div
                                        key={`${team}-${index}`}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                                      >
                                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                                            Substituição {index + 1}
                                          </p>

                                          <div className="flex flex-wrap gap-2">
                                            {visibleSubstitutionRows[team] > 1 && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeSubstitutionRow(team, index)
                                                }
                                                disabled={isAnyActionLoading}
                                                className="rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                              >
                                                {actionLoading === 'substitutions'
                                                  ? 'Salvando...'
                                                  : 'Remover'}
                                              </button>
                                            )}

                                            <button
                                              type="button"
                                              disabled={isAnyActionLoading}
                                              onClick={() =>
                                                runExclusiveAction(
                                                  'substitutions',
                                                  saveSubstitutions,
                                                )
                                              }
                                              className="rounded-xl bg-[var(--cdb-blue)] px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                              {actionLoading === 'substitutions'
                                                ? 'Salvando...'
                                                : 'Salvar alterações'}
                                            </button>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                          <div>
                                            <input
                                              type="tel"
                                              inputMode="numeric"
                                              pattern="[0-9]*"
                                              autoComplete="off"
                                              className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                              placeholder="Ex: 10"
                                              value={row.playerOutNumber}
                                              disabled={isControlDone}
                                              onChange={(event) =>
                                                updateSubstitutionForm(
                                                  team,
                                                  index,
                                                  'playerOutNumber',
                                                  event.target.value.replace(/\D/g, ''),
                                                )
                                              }
                                            />
                                            <label className="mt-2 block text-xs font-bold text-slate-600">
                                              Nº saiu
                                            </label>
                                          </div>

                                          <div>
                                            <input
                                              type="tel"
                                              inputMode="numeric"
                                              pattern="[0-9]*"
                                              autoComplete="off"
                                              className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                              placeholder="Ex: 18"
                                              value={row.playerInNumber}
                                              disabled={isControlDone}
                                              onChange={(event) =>
                                                updateSubstitutionForm(
                                                  team,
                                                  index,
                                                  'playerInNumber',
                                                  event.target.value.replace(/\D/g, ''),
                                                )
                                              }
                                            />
                                            <label className="mt-2 block text-xs font-bold text-slate-600">
                                              Nº entrou
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>

                                {visibleSubstitutionRows[team] < 5 && (
                                  <button
                                    type="button"
                                    onClick={() => addSubstitutionRow(team)}
                                    className="mt-3 w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-[var(--cdb-blue)] transition hover:bg-blue-100"
                                  >
                                    + Adicionar substituição
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-3">
                            <p className="text-sm text-slate-500">
                              Campos vazios serão ignorados. Preencha sempre o número que saiu e o número que entrou. Use o botão <strong>Salvar alterações</strong> ao lado da substituição para registrar.
                            </p>
                          </div>
                        </div>
                      )}

                      {isControlDone && substitutions.length === 0 && (
                        <p className="mt-4 text-xs text-slate-500">
                          Controle realizado sem substituições registradas.
                        </p>
                      )}
                    </div>
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
                        6. Sorteio realizado
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

                  {hasDrawDone && (
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

                        <span className="w-fit rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Salvo
                        </span>
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

                  {!hasDrawDone && isMatchInProgress && !isControlDone && (
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
                      Após salvar, o sorteio será exibido em Informações da partida e esta área ficará oculta.
                    </p>
  
                    <button
                      type="button"
                      disabled={isControlDone || isAnyActionLoading}
                      onClick={() => runExclusiveAction('save-draw', saveDraw)}
                      className="rounded-2xl bg-green-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {actionLoading === 'save-draw'
                        ? 'Salvando sorteio...'
                        : 'Salvar sorteio'}
                    </button>
                  </div>
                    </div>
                  )}

                  {!hasDrawDone && isMatchInProgress && !isControlDone && (
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
                        7. Kits utilizados no controle
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
                        8. Controle realizado
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
                      Aguardando jogo em andamento, sorteio realizado e kits utilizados registrados.
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
                        9. Documentos do jogo
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
                    Controle já realizado. Informações operacionais bloqueadas.
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
