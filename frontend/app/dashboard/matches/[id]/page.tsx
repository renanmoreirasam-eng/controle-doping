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

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const [playerTeam, setPlayerTeam] = useState<'HOME' | 'AWAY'>('HOME');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerNickname, setPlayerNickname] = useState('');
  const [playerType, setPlayerType] = useState<'EXAME' | 'RESERVA'>('EXAME');
  const [drawnPlayers, setDrawnPlayers] = useState<DrawPlayer[]>([]);

  const [subTeam, setSubTeam] = useState<'HOME' | 'AWAY'>('HOME');
  const [playerOutNumber, setPlayerOutNumber] = useState('');
  const [playerInNumber, setPlayerInNumber] = useState('');
  const [subMinute, setSubMinute] = useState('');
  const [subPeriod, setSubPeriod] = useState('SECOND_HALF');
  const [subNotes, setSubNotes] = useState('');

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
    }
  }, [matchId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (running) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }

    return () => clearInterval(interval);
  }, [running]);
  
  const hasRoomInspection = roomInspections.length > 0;
  const isControlDone = match?.status === 'CONTROL_DONE';

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

  async function loadRoomInspections() {
    const response = await api.get(`/room-inspections?matchId=${matchId}`);
    setRoomInspections(response.data);
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
    if (status === 'SCHEDULED') return 'bg-slate-100 text-slate-700';
    if (status === 'SCALE_ACCEPTED') return 'bg-blue-100 text-blue-700';
    if (status === 'IN_PROGRESS') return 'bg-yellow-100 text-yellow-700';
    if (status === 'CONTROL_DONE') return 'bg-green-100 text-green-700';
    if (status === 'CANCELED') return 'bg-red-100 text-red-700';

    return 'bg-slate-100 text-slate-700';
  }

  async function updateMatchStatus(status: string) {
    try {
      await api.patch(`/matches/${matchId}/status`, {
        status,
      });

      await loadMatch();

      alert('Status do jogo atualizado com sucesso!');
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao atualizar status do jogo',
      );
    }
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

    return 'bg-slate-100 text-slate-700';
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

    if (drawnPlayers.length === 0) {
      alert('Adicione pelo menos um atleta sorteado');
      return;
    }

    try {
      await api.post('/draws', {
        matchId,
        players: drawnPlayers,
      });

      setDrawnPlayers([]);

      await loadDraws();

      alert('Registro salvo com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar registro dos atletas');
    }
  }

  async function createSubstitution() {
    if (isControlDone) {
      alert('Controle já realizado. Não é possível alterar informações.');
      return;
    }

    if (!playerOutNumber || !playerInNumber) {
      alert('Informe o número do atleta que saiu e do atleta que entrou');
      return;
    }

    try {
      await api.post('/substitutions', {
        matchId,
        team: subTeam,
        playerOutName: `Atleta ${playerOutNumber}`,
        playerOutNumber,
        playerInName: `Atleta ${playerInNumber}`,
        playerInNumber,
        minute: subMinute ? Number(subMinute) : Math.floor(seconds / 60),
        period: subPeriod,
        notes: subNotes || null,
      });

      setPlayerOutNumber('');
      setPlayerInNumber('');
      setSubMinute('');
      setSubNotes('');

      await loadSubstitutions();

      alert('Substituição registrada com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao registrar substituição');
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
      <main className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 p-8">Carregando...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-500 font-medium">
        Operação da partida
      </p>

      <h1 className="text-4xl font-black mt-1">
        {match.homeTeam} x {match.awayTeam}
      </h1>

      <p className="text-slate-500 mt-2">
        {match.championship.name}
      </p>
      {match.missionCode && (
  <p className="text-slate-500 mt-1">
    Código da missão: <strong>{match.missionCode}</strong>
  </p>
)}
    </div>

    <span
      className={`${getStatusClass(
        match.status,
      )} px-5 py-3 rounded-2xl text-sm font-semibold`}
    >
      {getStatusLabel(match.status)}
    </span>
  </div>
</header>

        <section className="p-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
  <h2 className="text-2xl font-black mb-6">
    Informações da partida
  </h2>

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
  </div>
</div>

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

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-2xl font-black">
        Oficiais escalados
      </h2>

      <p className="text-slate-500 mt-1">
        Equipe responsável pela operação deste jogo.
      </p>
    </div>

    <span className="bg-slate-100 px-4 py-2 rounded-2xl text-sm font-semibold">
      {scales.length} oficiais
    </span>
  </div>

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

          <Link
  href={`/dashboard/matches/${matchId}/room-inspection`}
  className={`block text-center py-4 rounded-2xl font-semibold transition ${
    hasRoomInspection
      ? 'bg-green-600 text-white hover:bg-green-700'
      : 'bg-blue-600 text-white hover:bg-blue-700'
  }`}
>
  {hasRoomInspection
    ? 'Visualizar checklist da sala'
    : 'Abrir inspeção da sala'}
</Link>

            <div className="bg-white rounded-3xl shadow p-8">
              <h2 className="text-2xl font-bold mb-6">Substituições</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <select
                  className="border rounded-xl p-3 disabled:bg-slate-100"
                  value={subTeam}
                  disabled={isControlDone}
                  onChange={(e) => setSubTeam(e.target.value as 'HOME' | 'AWAY')}
                >
                  <option value="HOME">{match.homeTeam}</option>
                  <option value="AWAY">{match.awayTeam}</option>
                </select>

                <input
                  className="border rounded-xl p-3 disabled:bg-slate-100"
                  placeholder="Minuto"
                  value={subMinute}
                  disabled={isControlDone}
                  onChange={(e) => setSubMinute(e.target.value)}
                />

                <select
                  className="border rounded-xl p-3 md:col-span-2 disabled:bg-slate-100"
                  value={subPeriod}
                  disabled={isControlDone}
                  onChange={(e) => setSubPeriod(e.target.value)}
                >
                  <option value="FIRST_HALF">1º tempo</option>
                  <option value="SECOND_HALF">2º tempo</option>
                  <option value="EXTRA_TIME">Acréscimos/prorrogação</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <input
                  className="border rounded-xl p-3 disabled:bg-slate-100"
                  placeholder="Nº saiu"
                  value={playerOutNumber}
                  disabled={isControlDone}
                  onChange={(e) => setPlayerOutNumber(e.target.value)}
                />

                <input
                  className="border rounded-xl p-3 disabled:bg-slate-100"
                  placeholder="Nº entrou"
                  value={playerInNumber}
                  disabled={isControlDone}
                  onChange={(e) => setPlayerInNumber(e.target.value)}
                />
              </div>

              <textarea
                className="border rounded-xl p-3 w-full mb-4 disabled:bg-slate-100"
                placeholder="Observações da substituição"
                value={subNotes}
                disabled={isControlDone}
                onChange={(e) => setSubNotes(e.target.value)}
              />

              <button
                disabled={isControlDone}
                onClick={createSubstitution}
                className="bg-slate-950 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl mb-6"
              >
                Registrar substituição
              </button>

              <div className="space-y-3">
                {substitutions.map((sub) => (
                  <div
                    key={sub.id}
                    className="border rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <strong>
                        {getTeamName(sub.team)} -{' '}
                        {sub.minute ? `${sub.minute}'` : 'minuto não informado'}
                      </strong>

                      <p className="text-slate-600 text-sm">
                        Saiu: Nº {sub.playerOutNumber}
                      </p>

                      <p className="text-slate-600 text-sm">
                        Entrou: Nº {sub.playerInNumber}
                      </p>

                      {sub.notes && (
                        <p className="text-slate-500 text-sm mt-1">
                          Obs.: {sub.notes}
                        </p>
                      )}
                    </div>

                    <button
                      disabled={isControlDone}
                      onClick={() => deleteSubstitution(sub.id)}
                      className="bg-red-600 disabled:bg-slate-300 text-white px-3 py-2 rounded-xl text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                ))}

                {substitutions.length === 0 && (
                  <p className="text-slate-500">
                    Nenhuma substituição registrada.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow p-8">
              <h2 className="text-2xl font-bold mb-6">
                Registro dos atletas sorteados
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5">
                <select
                  className="border rounded-xl p-3 disabled:bg-slate-100"
                  value={playerTeam}
                  disabled={isControlDone}
                  onChange={(e) =>
                    setPlayerTeam(e.target.value as 'HOME' | 'AWAY')
                  }
                >
                  <option value="HOME">{match.homeTeam}</option>
                  <option value="AWAY">{match.awayTeam}</option>
                </select>

                <input
                  className="border rounded-xl p-3 disabled:bg-slate-100"
                  placeholder="Número"
                  value={playerNumber}
                  disabled={isControlDone}
                  onChange={(e) => setPlayerNumber(e.target.value)}
                />

                <input
                  className="border rounded-xl p-3 disabled:bg-slate-100"
                  placeholder="Nome atleta"
                  value={playerName}
                  disabled={isControlDone}
                  onChange={(e) => setPlayerName(e.target.value)}
                />

                <input
                  className="border rounded-xl p-3 disabled:bg-slate-100"
                  placeholder="Apelido opcional"
                  value={playerNickname}
                  disabled={isControlDone}
                  onChange={(e) => setPlayerNickname(e.target.value)}
                />

                <select
                  className="border rounded-xl p-3 disabled:bg-slate-100"
                  value={playerType}
                  disabled={isControlDone}
                  onChange={(e) =>
                    setPlayerType(e.target.value as 'EXAME' | 'RESERVA')
                  }
                >
                  <option value="EXAME">Principal exame</option>
                  <option value="RESERVA">Reserva</option>
                </select>
              </div>

              <div className="flex gap-3 mb-6 flex-wrap">
                <button
                  disabled={isControlDone}
                  onClick={addPlayer}
                  className="bg-slate-950 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl"
                >
                  Adicionar atleta
                </button>

                <button
                  disabled={isControlDone}
                  onClick={saveDraw}
                  className="bg-green-600 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl"
                >
                  Salvar registro
                </button>
              </div>

              <h3 className="font-bold mb-3">Atletas adicionados</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {drawnPlayers.map((player, index) => {
                  const substitution = wasSubstituted(player);

                  return (
                    <div
                      key={`${player.number}-${index}`}
                      className={`rounded-2xl p-5 border ${
                        player.type === 'EXAME'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <p className="text-sm text-slate-500">
                        {getTeamName(player.team)}
                      </p>

                      <div className="text-4xl font-bold mt-2">
                        Nº {player.number}
                      </div>

                      <h4 className="text-xl font-bold mt-2">{player.name}</h4>

                      {player.nickname && (
                        <p className="text-slate-500 mt-1">
                          Apelido: {player.nickname}
                        </p>
                      )}

                      <span
                        className={`inline-block mt-4 px-3 py-1 rounded-full text-sm ${
                          player.type === 'EXAME'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {player.type === 'EXAME' ? 'Principal exame' : 'Reserva'}
                      </span>

                      {substitution && (
                        <div className="mt-4 bg-orange-100 text-orange-800 border border-orange-200 rounded-xl p-3 text-sm">
                          Atenção: atleta substituído. Entrou Nº{' '}
                          {substitution.playerInNumber}.
                        </div>
                      )}

                      <button
                        disabled={isControlDone}
                        onClick={() => removePendingPlayer(index)}
                        className="mt-4 bg-slate-200 disabled:bg-slate-100 text-slate-800 px-3 py-2 rounded-xl text-sm"
                      >
                        Remover da lista
                      </button>
                    </div>
                  );
                })}

                {drawnPlayers.length === 0 && (
                  <p className="text-slate-500">
                    Nenhum atleta adicionado para salvar.
                  </p>
                )}
              </div>

              <h3 className="font-bold mb-3">Registros salvos</h3>

              <div className="space-y-4">
                {draws.map((draw) => (
                  <div key={draw.id} className="border rounded-2xl p-5">
                    <p className="text-slate-500 text-sm mb-3">
                      Registro realizado em{' '}
                      {new Date(draw.createdAt).toLocaleString('pt-BR')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {draw.players.map((player, index) => {
                        const substitution = wasSubstituted(player);

                        return (
                          <div
                            key={`${draw.id}-${index}`}
                            className="bg-slate-50 rounded-xl p-3"
                          >
                            <strong>
                              Nº {player.number} - {player.name}
                            </strong>

                            {player.nickname && (
                              <p className="text-sm text-slate-500">
                                Apelido: {player.nickname}
                              </p>
                            )}

                            <p className="text-sm text-slate-500">
                              {getTeamName(player.team)} -{' '}
                              {player.type === 'EXAME'
                                ? 'Principal exame'
                                : 'Reserva'}
                            </p>

                            {substitution && (
                              <p className="mt-2 text-sm text-orange-700 font-medium">
                                Substituído: entrou Nº {substitution.playerInNumber}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {draws.length === 0 && (
                  <p className="text-slate-500">
                    Nenhum registro salvo ainda.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
  <h2 className="text-2xl font-black mb-2">
    Status operacional
  </h2>

  <p className="text-slate-500 mb-6">
    Controle do andamento da operação.
  </p>

  <div className="space-y-3">
    <button
      onClick={() => updateMatchStatus('IN_PROGRESS')}
      disabled={isControlDone}
      className="block w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-300 text-white text-center py-4 rounded-2xl font-semibold transition"
    >
      Marcar em andamento
    </button>

    <button
      onClick={() => updateMatchStatus('CONTROL_DONE')}
      disabled={isControlDone}
      className="block w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white text-center py-4 rounded-2xl font-semibold transition"
    >
      Marcar controle realizado
    </button>

    {isControlDone && (
      <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 text-sm">
        Controle já realizado. Informações operacionais bloqueadas.
      </div>
    )}
  </div>
</div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center">
  <h2 className="text-2xl font-black mb-2">
    Cronômetro
  </h2>

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
          </div>
        </section>
      </div>
    </main>
  );
}