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

type PendingAthleteListFile = {
  fileName: string;
  fileType: string;
  dataUrl: string;
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

function openFileInNewTab(blobUrl: string) {
  const openedWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');

  if (openedWindow) {
    return true;
  }

  const link = document.createElement('a');

  link.href = blobUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  document.body.appendChild(link);
  link.click();
  link.remove();

  return false;
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const blob = dataUrlToBlob(dataUrl);
  const blobUrl = window.URL.createObjectURL(blob);

  if (isMobileDevice()) {
    openFileInNewTab(blobUrl);

    window.setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60000);

    return;
  }

  const link = document.createElement('a');

  link.href = blobUrl;
  link.download = fileName;
  link.rel = 'noopener noreferrer';

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 1000);
}

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
  const [pendingAthleteListFile, setPendingAthleteListFile] =
    useState<PendingAthleteListFile | null>(null);
  const [savingMissionCode, setSavingMissionCode] = useState(false);
  const [savingAthleteListFile, setSavingAthleteListFile] = useState(false);
  const [savingFinalDocumentFile, setSavingFinalDocumentFile] = useState(false);
  const [modal, setModal] = useState<ModalState>(initialModalState);
  const [actionLoading, setActionLoading] = useState<ActionKey | null>(null);
  const actionLockRef = useRef<ActionKey | null>(null);

  const isAnyActionLoading = Boolean(actionLoading);

  async function runExclusiveAction(
    actionKey: ActionKey,
    callback: () => Promise<void>,
  ) {
    if (actionLockRef.current) return;

    actionLockRef.current = actionKey;
    setActionLoading(actionKey);

    try {
      await callback();
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

  async function loadMatch() {
    const response = await api.get(`/matches/${matchId}`);
    setMatch(response.data);
  }
  
  async function loadScales() {
    const response = await api.get('/match-officials');
    setScales(response.data.filter((scale: Scale) => scale.matchId === matchId));
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
      loadMatch();
      loadScales();
      loadDraws();
      loadSubstitutions();
      loadRoomInspections();
      loadOperationalLogs();
      loadMyKits();
      loadMatchKits();
    }
  }, [matchId]);

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
    setMissionCodeInput(match?.missionCode || '');

    if (match?.status === 'IN_PROGRESS' || match?.status === 'CONTROL_DONE') {
      setMissionCodeConfirmed(true);
    }
  }, [match?.missionCode, match?.status]);
  
  const hasRoomInspection = roomInspections.length > 0;
  const isControlDone = match?.status === 'CONTROL_DONE';
  const checkInLog = getOperationalLog('CHECKIN_STADIUM');
  const isCheckedIn = Boolean(checkInLog) || isControlDone;

  const isScaleAccepted =
    match?.status === 'SCALE_ACCEPTED' ||
    match?.status === 'IN_PROGRESS' ||
    match?.status === 'CONTROL_DONE';

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
  const isMissionCodeConfirmed =
    missionCodeConfirmed || isMatchInProgress || isControlDone;

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
    !isControlDone &&
    isMissionCodeConfirmed;

  const canUploadFinalDocumentFile =
    isAdmin &&
    !!match &&
    isControlDone;

  const canShowOperationalSections =
    isMatchInProgress || hasDrawDone || isControlDone;

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
      await loadMyKits();
      await loadMatchKits();
      return;
    }

    try {
      setSavingKits(true);

      await api.post(`/inventory/matches/${matchId}/kits`, {
        kitIds: selectedKitIds,
      });

      await loadMyKits();
      await loadMatchKits();

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

          await loadMyKits();
          await loadMatchKits();

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

      await loadMatch();
      setMissionCodeConfirmed(true);

      showMessage('Código confirmado', 'Código da missão confirmado com sucesso!', 'success');
    } catch (error: any) {
      showMessage('Erro ao confirmar código', getErrorMessage(error, 'Erro ao salvar código da missão.'), 'danger');
    } finally {
      setSavingMissionCode(false);
    }
  }

  async function handleSelectAthleteListFile(files: FileList | null) {
    const file = files?.[0];

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
      const fileData = await readFileAsDataUrl(file);

      setPendingAthleteListFile({
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        dataUrl: fileData,
      });
    } catch (error: any) {
      showMessage(
        'Erro ao preparar arquivo',
        getErrorMessage(error, 'Erro ao preparar pré-visualização do arquivo.'),
        'danger',
      );
    }
  }

  function cancelAthleteListPreview() {
    if (savingAthleteListFile || isAnyActionLoading) return;
    setPendingAthleteListFile(null);
  }

  async function confirmAthleteListUpload() {
    if (!pendingAthleteListFile) return;

    try {
      setSavingAthleteListFile(true);

      await api.patch(`/matches/${matchId}/documents`, {
        athleteListFileName: pendingAthleteListFile.fileName,
        athleteListFileType: pendingAthleteListFile.fileType,
        athleteListFileData: pendingAthleteListFile.dataUrl,
      });

      setPendingAthleteListFile(null);

      await loadMatch();

      showMessage(
        'Relação salva',
        'Relação de atletas salva com sucesso!',
        'success',
      );
    } catch (error: any) {
      showMessage(
        'Erro ao salvar relação',
        getErrorMessage(error, 'Erro ao salvar relação de atletas.'),
        'danger',
      );
    } finally {
      setSavingAthleteListFile(false);
    }
  }

  async function handleUploadMatchDocument(
    type: 'athleteList' | 'finalDocument',
    files: FileList | null,
  ) {
    const file = files?.[0];

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

      await api.patch(`/matches/${matchId}/documents`,
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

      await loadMatch();

      showMessage(
        'Documento salvo',
        type === 'athleteList'
          ? 'Relação de atletas salva com sucesso!'
          : 'Documento final do jogo salvo com sucesso!',
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
      });

      await loadMatch();
      await loadOperationalLogs();
      await loadMyKits();
      await loadMatchKits();

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

      await loadRoomInspections();

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
          await loadRoomInspections();
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

      await loadDraws();
      await loadOperationalLogs();

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

      await loadSubstitutions();

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
          await loadSubstitutions();
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

  if (!match) {
    return (
      <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 p-8"><div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">Carregando...</div></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cdb-light)] flex flex-col lg:flex-row">
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
                        Missão {match.missionCode}
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
                            {match.missionCode}
                          </p>
                        </div>

                        {match.missionOrderFileData && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadDataUrl(
                                match.missionOrderFileData!,
                                match.missionOrderFileName || 'ordem-de-missao',
                              )
                            }
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

                      {match.missionOrderFileData && (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              downloadDataUrl(
                                match.missionOrderFileData!,
                                match.missionOrderFileName || 'ordem-de-missao',
                              )
                            }
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
                        Envie uma foto ou PDF da relação de atletas antes do sorteio.
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

                  {match.athleteListFileName && match.athleteListFileData && (
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
                        onClick={() =>
                          downloadDataUrl(
                            match.athleteListFileData!,
                            match.athleteListFileName || 'relacao-de-atletas',
                          )
                        }
                        className="inline-flex items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
                      >
                        Baixar relação de atletas
                      </button>
                    </div>
                  )}

                  {canUploadAthleteListFile && !match.athleteListFileName ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      {!pendingAthleteListFile ? (
                        <>
                          <label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            Relação de atletas
                          </label>

                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={
                              savingAthleteListFile ||
                              isAnyActionLoading
                            }
                            onChange={(event) => {
                              handleSelectAthleteListFile(
                                event.currentTarget.files,
                              );
                              event.currentTarget.value = '';
                            }}
                            className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--cdb-blue)] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          />

                          <p className="mt-2 text-xs text-slate-500">
                            Selecione o arquivo para pré-visualizar antes de confirmar. Formatos aceitos: PDF, JPG ou PNG. Tamanho máximo: 10 MB.
                          </p>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                Pré-visualização da relação
                              </p>

                              <p className="mt-1 text-sm font-black text-slate-900">
                                {pendingAthleteListFile.fileName}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                downloadDataUrl(
                                  pendingAthleteListFile.dataUrl,
                                  pendingAthleteListFile.fileName,
                                )
                              }
                              className="inline-flex w-fit items-center justify-center rounded-2xl bg-[var(--cdb-blue)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
                            >
                              Abrir pré-visualização
                            </button>
                          </div>

                          {pendingAthleteListFile.fileType.startsWith('image/') && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                              <img
                                src={pendingAthleteListFile.dataUrl}
                                alt={pendingAthleteListFile.fileName}
                                className="max-h-80 w-full object-contain"
                              />
                            </div>
                          )}

                          {pendingAthleteListFile.fileType === 'application/pdf' && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                              PDF selecionado. Clique em <strong>Abrir pré-visualização</strong> para conferir o arquivo antes de confirmar.
                            </div>
                          )}

                          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              onClick={cancelAthleteListPreview}
                              disabled={
                                savingAthleteListFile ||
                                isAnyActionLoading
                              }
                              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Cancelar
                            </button>

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
                                isAnyActionLoading
                              }
                              className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionLoading === 'athlete-list-upload' ||
                              savingAthleteListFile
                                ? 'Confirmando envio...'
                                : 'Confirmar envio'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-slate-500">
                      {match.athleteListFileName
                        ? 'Arquivo enviado. Não é possível enviar novamente após a confirmação.'
                        : isControlDone
                          ? 'Upload indisponível após o controle ser concluído.'
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

                  {match.finalDocumentFileName && match.finalDocumentFileData && (
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
                        onClick={() =>
                          downloadDataUrl(
                            match.finalDocumentFileData!,
                            match.finalDocumentFileName || 'documento-final-jogo',
                          )
                        }
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
                          const files = event.currentTarget.files;
                          runExclusiveAction('final-document-upload', () =>
                            handleUploadMatchDocument('finalDocument', files),
                          );
                          event.currentTarget.value = '';
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
