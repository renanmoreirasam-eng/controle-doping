'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '../../../../components/Sidebar';
import { api } from '../../../../services/api';
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

export default function MatchDetailsPage() {
  const params = useParams();
  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [scales, setScales] = useState<Scale[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [roomInspections, setRoomInspections] = useState<RoomInspection[]>([]);
  const [operationalLogs, setOperationalLogs] = useState<OperationalLog[]>([]);

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

  const [roomItems, setRoomItems] = useState<RoomInspectionItem[]>(defaultRoomItems);
  const [roomNotes, setRoomNotes] = useState('');
  const [roomPhotos, setRoomPhotos] = useState<RoomInspectionPhoto[]>([]);

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
  }, [substitutions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (running) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }

    return () => clearInterval(interval);
  }, [running]);
  
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

  const savedDrawPlayers = draws.flatMap((draw) => draw.players);

  const canDoCheckIn =
    !!match &&
    !isControlDone &&
    !isCheckedIn &&
    isScaleAccepted;

  const canStartMatch =
    !!match &&
    !isControlDone &&
    isCheckedIn &&
    match.status !== 'IN_PROGRESS';

  const canFinishControl =
    !!match &&
    !isControlDone &&
    isMatchInProgress &&
    hasDrawDone;

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

  async function updateMatchStatus(status: string) {
    try {
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

      alert('Status do jogo atualizado com sucesso!');
    } catch (error: any) {
      alert(
        error.message ||
          error.response?.data?.message ||
          'Erro ao atualizar status do jogo',
      );
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
      alert('Controle já realizado. Não é possível alterar informações.');
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

      alert('Inspeção da sala salva com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar inspeção da sala');
    }
  }

  async function deleteRoomInspection(id: string) {
    if (isControlDone) {
      alert('Controle já realizado. Não é possível excluir inspeções.');
      return;
    }

    if (!confirm('Deseja excluir esta inspeção?')) return;

    try {
      await api.delete(`/room-inspections/${id}`);
      await loadRoomInspections();
    } catch (error) {
      alert('Erro ao excluir inspeção');
    }
  }

  function addPlayer() {
    if (isControlDone) return;

    if (!playerName || !playerNumber) {
      alert('Informe nome e número do atleta');
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
      alert('Controle já realizado. Não é possível alterar informações.');
      return;
    }

    if (hasDrawDone) {
      alert('Sorteio já realizado para este jogo.');
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
      alert('Informe o número e o nome do Principal Exame de cada time.');
      return;
    }

    if (
      (homeReserveNumber && !homeReserveName) ||
      (!homeReserveNumber && homeReserveName)
    ) {
      alert('Para o Reserva do mandante, informe número e nome ou deixe ambos em branco.');
      return;
    }

    if (
      (awayReserveNumber && !awayReserveName) ||
      (!awayReserveNumber && awayReserveName)
    ) {
      alert('Para o Reserva do visitante, informe número e nome ou deixe ambos em branco.');
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

      alert('Sorteio realizado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar sorteio dos atletas');
    }
  }

  async function saveSubstitutions() {
    if (isControlDone) {
      alert('Controle já realizado. Não é possível alterar informações.');
      return;
    }

    const rowsToSave = (['HOME', 'AWAY'] as const).flatMap((team) =>
      substitutionForm[team]
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
      alert(
        `Preencha Nº saiu e Nº entrou na substituição ${incompleteRow.index + 1} de ${getTeamName(
          incompleteRow.team,
        )}.`,
      );
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

      alert('Substituições salvas com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar substituições');
    }
  }

  async function deleteSubstitution(id: string) {
    if (isControlDone) {
      alert('Controle já realizado. Não é possível excluir substituições.');
      return;
    }

    if (!confirm('Deseja remover esta substituição?')) return;

    try {
      await api.delete(`/substitutions/${id}`);
      await loadSubstitutions();
    } catch (error) {
      alert('Erro ao remover substituição');
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
                      onClick={() => updateMatchStatus('SCALE_ACCEPTED')}
                      className="mt-4 w-full bg-[var(--cdb-blue)] text-white hover:brightness-95 py-3 rounded-2xl font-semibold transition"
                    >
                      Fazer check-in no estádio
                    </button>
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
                        2. Jogo em andamento
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
                      onClick={() => updateMatchStatus('IN_PROGRESS')}
                      className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-2xl font-semibold transition"
                    >
                      Marcar jogo em andamento
                    </button>
                  )}

                  {!isCheckedIn && !isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      {isScaleAccepted
                        ? 'Aguardando check-in no estádio.'
                        : 'Aguardando confirmação da escala pelos oficiais.'}
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
                        3. Sorteio realizado
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
                        4. Controle realizado
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
                      onClick={() => updateMatchStatus('CONTROL_DONE')}
                      className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold transition"
                    >
                      Marcar controle realizado
                    </button>
                  )}

                  {!canFinishControl && !isControlDone && (
                    <p className="mt-4 text-xs text-slate-500">
                      Aguardando jogo em andamento e sorteio realizado.
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

          <div className="xl:col-span-2 space-y-4 lg:space-y-6">
            <details open className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 lg:px-8 lg:py-6 [&::-webkit-details-marker]:hidden">
                <div>
                  <h2 className="text-xl font-black text-[var(--cdb-dark)] lg:text-2xl">
                    Informações da partida
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Dados principais, local, status e atletas sorteados.
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-black text-slate-600 transition group-open:rotate-180">
                    ⌄
                  </span>
                </div>
              </summary>

              <div className="px-5 pb-5 lg:px-8 lg:pb-8">
  <div className="grid md:grid-cols-2 gap-4">
    <div className="border border-slate-200 rounded-3xl p-5 bg-slate-50">
      <p className="text-slate-500 text-sm">
        Código da missão
      </p>

      <strong className="text-lg">
        {match.missionCode || 'Não informado'}
      </strong>
    </div>

    <div className="border border-slate-200 rounded-3xl p-5 bg-slate-50">
      <p className="text-slate-500 text-sm">
        Campeonato
      </p>

      <strong className="text-lg">
        {match.championship.name}
      </strong>
    </div>

    <div className="border border-slate-200 rounded-3xl p-5 bg-slate-50">
      <p className="text-slate-500 text-sm">
        Data do jogo
      </p>

      <strong className="text-lg">
        {formatDateOnly(match.matchDate)}
      </strong>
    </div>

    <div className="border border-slate-200 rounded-3xl p-5 bg-slate-50">
      <p className="text-slate-500 text-sm">
        Horário do jogo
      </p>

      <strong className="text-lg">
        {formatTimeOnly(match.matchDate)}
      </strong>
    </div>

    <div className="border border-slate-200 rounded-3xl p-5 bg-slate-50">
      <p className="text-slate-500 text-sm">
        Estádio
      </p>

      <strong className="text-lg">
        🏟️ {match.stadium.name}
      </strong>
    </div>

    <div className="border border-slate-200 rounded-3xl p-5 bg-slate-50">
      <p className="text-slate-500 text-sm">
        Cidade
      </p>

      <strong className="text-lg">
        {match.stadium.city}/{match.stadium.state}
      </strong>
    </div>

    <div className="border border-slate-200 rounded-3xl p-5 bg-slate-50 md:col-span-2">
      <p className="text-slate-500 text-sm">
        Status
      </p>

      <span
        className={`${getStatusClass(
          match.status,
        )} inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold`}
      >
        {getStatusLabel(match.status)}
      </span>
    </div>

    {hasDrawDone && (
      <div className="border border-green-200 rounded-3xl p-5 bg-green-50 md:col-span-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <p className="text-slate-500 text-sm">
              Sorteio realizado
            </p>

            <strong className="text-lg text-green-800">
              Atletas sorteados para exame
            </strong>
          </div>

          <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold w-fit">
            Salvo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(['HOME', 'AWAY'] as const).map((team) => {
            const examPlayer = getSavedDrawPlayer(team, 'EXAME');
            const reservePlayer = getSavedDrawPlayer(team, 'RESERVA');

            return (
              <div
                key={team}
                className="bg-white border border-green-100 rounded-2xl p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">
                  {getTeamName(team)}
                </p>

                {examPlayer && (
                  <div className="mb-3">
                    <p className="text-xs text-red-600 font-bold uppercase">
                      Principal exame
                    </p>

                    <p className="font-black text-[var(--cdb-dark)]">
                      Nº {examPlayer.number} - {examPlayer.name}
                    </p>
                  </div>
                )}

                {reservePlayer ? (
                  <div>
                    <p className="text-xs text-yellow-600 font-bold uppercase">
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
  </div>
              </div>
            </details>
            {isControlDone && (
              <div className="bg-green-100 text-green-800 border border-green-200 rounded-3xl p-6">
                <h2 className="font-bold text-xl mb-1">
                  Controle realizado
                </h2>

                <p>
                  As informações operacionais deste jogo estão bloqueadas para edição.
                </p>
              </div>
            )}
            <details className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 lg:px-8 lg:py-6 [&::-webkit-details-marker]:hidden">
                <div>
                  <h2 className="text-xl font-black text-[var(--cdb-dark)] lg:text-2xl">
                    Oficiais escalados
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Equipe responsável pela operação deste jogo.
                  </p>
                </div>

                <div className="flex items-center gap-3">

              <span className="bg-slate-100 px-3 py-1 rounded-2xl text-xs font-semibold text-slate-700">
                {scales.length} oficiais
              </span>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-black text-slate-600 transition group-open:rotate-180">
                    ⌄
                  </span>
                </div>
              </summary>

              <div className="px-5 pb-5 lg:px-8 lg:pb-8">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {scales.map((scale) => (
      <div
        key={scale.id}
        className="border border-slate-200 rounded-3xl p-5 bg-slate-50"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl">
              {scale.role === 'DCO' ? '🧑' : '👤'}
            </div>

            <div>
              <p className="text-sm text-slate-500 font-medium">
                {scale.role === 'DCO' ? 'DCO' : 'Assistente'}
              </p>

              <h3 className="text-xl font-black mt-1">
                {scale.official.user.name}
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                {scale.official.user.email}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
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

    {scales.length === 0 && (
      <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center md:col-span-2">
        <div className="text-6xl mb-4">
          👥
        </div>

        <h3 className="text-xl font-bold">
          Nenhum oficial escalado
        </h3>

        <p className="text-slate-500 mt-2">
          Este jogo ainda não possui oficiais vinculados.
        </p>
      </div>
    )}
  </div>
              </div>
            </details>
            {canShowOperationalSections && (
              <>
            
            <details className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 lg:px-8 lg:py-6 [&::-webkit-details-marker]:hidden">
                <div>
                  <h2 className="text-xl font-black text-[var(--cdb-dark)] lg:text-2xl">
                    Substituições
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Informe até 5 substituições por equipe. Campos vazios serão ignorados.
                  </p>
                </div>

                <div className="flex items-center gap-3">

              <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold w-fit">
                {substitutions.length > 0 ? `${substitutions.length} registrada(s)` : 'Opcional'}
              </span>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-black text-slate-600 transition group-open:rotate-180">
                    ⌄
                  </span>
                </div>
              </summary>

              <div className="px-5 pb-5 lg:px-8 lg:pb-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {(['HOME', 'AWAY'] as const).map((team) => (
                  <div
                    key={team}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:p-5"
                  >
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">
                        {team === 'HOME' ? 'Equipe Mandante' : 'Equipe Visitante'}
                      </p>

                      <h3 className="text-xl font-black text-[var(--cdb-dark)]">
                        {getTeamName(team)}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {substitutionForm[team].map((row, index) => (
                        <div
                          key={`${team}-${index}`}
                          className="bg-white border border-slate-200 rounded-2xl p-3"
                        >
                          <p className="text-xs font-bold text-slate-400 mb-2">
                            Substituição {index + 1}
                          </p>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">
                                Nº saiu
                              </label>

                              <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                placeholder="Ex: 10"
                                value={row.playerOutNumber}
                                disabled={isControlDone}
                                onChange={(e) =>
                                  updateSubstitutionForm(
                                    team,
                                    index,
                                    'playerOutNumber',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">
                                Nº entrou
                              </label>

                              <input
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-[var(--cdb-blue)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                placeholder="Ex: 18"
                                value={row.playerInNumber}
                                disabled={isControlDone}
                                onChange={(e) =>
                                  updateSubstitutionForm(
                                    team,
                                    index,
                                    'playerInNumber',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  disabled={isControlDone}
                  onClick={saveSubstitutions}
                  className="bg-[var(--cdb-blue)] disabled:bg-slate-300 text-white hover:brightness-95 px-5 py-3 rounded-2xl font-semibold"
                >
                  Salvar substituições
                </button>

                {isControlDone && (
                  <p className="text-sm text-slate-500 flex items-center">
                    Controle realizado. As substituições estão bloqueadas.
                  </p>
                )}
              </div>
              </div>
            </details>
            {!hasDrawDone && (
            <details className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 lg:px-8 lg:py-6 [&::-webkit-details-marker]:hidden">
                  <div>
                    <h2 className="text-xl font-black text-[var(--cdb-dark)] lg:text-2xl">
                      Registro dos atletas sorteados
                    </h2>
  
                    <p className="text-sm text-slate-500 mt-1">
                      Preencha os atletas principais de cada time. O reserva é opcional.
                    </p>
                  </div>
  
                  <div className="flex items-center gap-3">
  
                <span className="bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold w-fit">
                  Sorteio pendente
                </span>
                    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-black text-slate-600 transition group-open:rotate-180">
                      ⌄
                    </span>
                  </div>
                </summary>
  
                <div className="px-5 pb-5 lg:px-8 lg:pb-8">
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
                      disabled={isControlDone}
                      onClick={saveDraw}
                      className="rounded-2xl bg-green-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-green-700 disabled:bg-slate-300"
                    >
                      Salvar sorteio
                    </button>
                  </div>
                </div>
              </details>
            )}
            {hasDrawDone && (
            <details className="group overflow-hidden rounded-3xl border border-green-200 bg-green-50 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 lg:px-8 lg:py-6 [&::-webkit-details-marker]:hidden">
                  <div>
                    <h2 className="text-xl font-black text-[var(--cdb-dark)] lg:text-2xl">
                      Sorteio realizado
                    </h2>
  
                    <p className="text-sm text-slate-500 mt-1">
                      Atletas disponíveis em Informações da partida.
                    </p>
                  </div>
  
                  <div className="flex items-center gap-3">
  
                    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-black text-slate-600 transition group-open:rotate-180">
                      ⌄
                    </span>
                  </div>
                </summary>
  
                <div className="px-5 pb-5 lg:px-8 lg:pb-8">
                  <p className="text-green-700">
                    Os atletas sorteados estão disponíveis em Informações da partida.
                  </p>
                </div>
              </details>
            )}
              </>
            )}
          </div>

          <div className="space-y-4 lg:space-y-6">
            
            {canShowOperationalSections && (
              <>
            <details className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 lg:px-8 lg:py-6 [&::-webkit-details-marker]:hidden">
                <div>
                  <h2 className="text-xl font-black text-[var(--cdb-dark)] lg:text-2xl">
                    Cronômetro
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Apoio operacional durante a partida.
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-black text-slate-600 transition group-open:rotate-180">
                    ⌄
                  </span>
                </div>
              </summary>

              <div className="px-5 pb-5 lg:px-8 lg:pb-8">
  <p className="text-slate-500 mb-6">
    Apoio operacional durante a partida.
  </p>

  <div className="text-6xl font-black mb-8 tracking-tight">
    {formatTime()}
  </div>

  <div className="flex gap-3">
    <button
      disabled={isControlDone}
      onClick={() => setRunning(true)}
      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-semibold transition"
    >
      Iniciar
    </button>

    <button
      disabled={isControlDone}
      onClick={() => setRunning(false)}
      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-semibold transition"
    >
      Parar
    </button>
  </div>
              </div>
            </details>

<details className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 lg:px-8 lg:py-6 [&::-webkit-details-marker]:hidden">
                <div>
                  <h2 className="text-xl font-black text-[var(--cdb-dark)] lg:text-2xl">
                    Inspeção da sala
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Checklist da sala de controle de doping.
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-black text-slate-600 transition group-open:rotate-180">
                    ⌄
                  </span>
                </div>
              </summary>

              <div className="px-5 pb-5 lg:px-8 lg:pb-8">
          <Link
  href={`/dashboard/matches/${matchId}/room-inspection`}
  className={`block text-center py-4 rounded-2xl font-semibold transition ${
    hasRoomInspection
      ? 'bg-green-600 text-white hover:bg-green-700'
      : 'bg-[var(--cdb-blue)] text-white hover:brightness-95'
  }`}
>
  {hasRoomInspection
    ? 'Visualizar checklist da sala'
    : 'Abrir inspeção da sala'}
</Link>
              </div>
            </details>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
