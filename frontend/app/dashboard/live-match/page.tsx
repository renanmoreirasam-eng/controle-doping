'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';

type Player = {
  id: number;
  team: 'home' | 'away';
  name: string;
  number: string;
};

type DrawnPlayer = Player & {
  type: 'EXAME' | 'RESERVA';
};

export default function LiveMatchPage() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const [currentPeriod, setCurrentPeriod] = useState<
    'PRE_GAME' | 'FIRST_HALF' | 'HALFTIME' | 'SECOND_HALF' | 'FINISHED'
  >('PRE_GAME');

  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerTeam, setPlayerTeam] = useState<'home' | 'away'>('home');
  const [drawnPlayers, setDrawnPlayers] = useState<DrawnPlayer[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (running) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`;

  const shouldShowDrawAlert =
    currentPeriod === 'SECOND_HALF' && minutes >= 25 && minutes < 30;

  const drawMoment = currentPeriod === 'SECOND_HALF' && minutes >= 30;

  function startFirstHalf() {
    setCurrentPeriod('FIRST_HALF');
    setRunning(true);
    setSeconds(0);
  }

  function finishFirstHalf() {
    setRunning(false);
    setCurrentPeriod('HALFTIME');
  }

  function startSecondHalf() {
    setCurrentPeriod('SECOND_HALF');
    setRunning(true);
    setSeconds(0);
  }

  function finishMatch() {
    setRunning(false);
    setCurrentPeriod('FINISHED');
  }

  function addPlayer() {
    if (!playerName || !playerNumber) {
      alert('Informe nome e número do atleta');
      return;
    }

    setPlayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        team: playerTeam,
        name: playerName,
        number: playerNumber,
      },
    ]);

    setPlayerName('');
    setPlayerNumber('');
  }

  function drawPlayers() {
    const homePlayers = players.filter((player) => player.team === 'home');
    const awayPlayers = players.filter((player) => player.team === 'away');

    if (homePlayers.length < 2 || awayPlayers.length < 2) {
      alert('Cadastre pelo menos 2 atletas de cada equipe');
      return;
    }

    const shuffle = (list: Player[]) => [...list].sort(() => Math.random() - 0.5);

    const selectedHome = shuffle(homePlayers).slice(0, 2);
    const selectedAway = shuffle(awayPlayers).slice(0, 2);

    setDrawnPlayers([
      { ...selectedHome[0], type: 'EXAME' },
      { ...selectedHome[1], type: 'RESERVA' },
      { ...selectedAway[0], type: 'EXAME' },
      { ...selectedAway[1], type: 'RESERVA' },
    ]);
  }

  return (
    <main className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b px-8 py-5">
          <h1 className="text-3xl font-bold">Jogo ao vivo</h1>
          <p className="text-slate-500">Controle operacional da partida</p>
        </header>

        <section className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow p-8">
            <div className="flex flex-col items-center">
              <p className="text-slate-500 mb-2">Status atual</p>

              <h2 className="text-2xl font-bold mb-6">{currentPeriod}</h2>

              <div className="text-8xl font-bold tracking-wider mb-8">
                {formattedTime}
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={startFirstHalf}
                  className="bg-green-600 text-white px-5 py-3 rounded-xl"
                >
                  Iniciar 1º Tempo
                </button>

                <button
                  onClick={finishFirstHalf}
                  className="bg-yellow-500 text-white px-5 py-3 rounded-xl"
                >
                  Finalizar 1º Tempo
                </button>

                <button
                  onClick={startSecondHalf}
                  className="bg-blue-600 text-white px-5 py-3 rounded-xl"
                >
                  Iniciar 2º Tempo
                </button>

                <button
                  onClick={finishMatch}
                  className="bg-red-600 text-white px-5 py-3 rounded-xl"
                >
                  Encerrar Partida
                </button>
              </div>

              {shouldShowDrawAlert && (
                <div className="mt-10 bg-yellow-100 border border-yellow-300 text-yellow-800 px-6 py-4 rounded-2xl text-lg font-semibold">
                  Atenção: o momento do sorteio está se aproximando.
                </div>
              )}

              {drawMoment && (
                <div className="mt-6 bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-2xl text-lg font-bold">
                  Realizar sorteio dos atletas agora.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-8">
            <h2 className="text-2xl font-bold mb-4">Sorteio dos atletas</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
              <select
                className="border rounded-xl p-3"
                value={playerTeam}
                onChange={(e) => setPlayerTeam(e.target.value as 'home' | 'away')}
              >
                <option value="home">Mandante</option>
                <option value="away">Visitante</option>
              </select>

              <input
                className="border rounded-xl p-3"
                placeholder="Nº"
                value={playerNumber}
                onChange={(e) => setPlayerNumber(e.target.value)}
              />

              <input
                className="border rounded-xl p-3 md:col-span-2"
                placeholder="Nome do atleta"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={addPlayer}
                className="bg-slate-950 text-white px-5 py-3 rounded-xl"
              >
                Adicionar atleta
              </button>

              <button
                onClick={drawPlayers}
                className="bg-blue-600 text-white px-5 py-3 rounded-xl"
              >
                Realizar sorteio
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-3">Atletas cadastrados</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {players.map((player) => (
                  <div key={player.id} className="border rounded-xl p-3">
                    <strong>
                      {player.number} - {player.name}
                    </strong>
                    <p className="text-slate-500">
                      {player.team === 'home' ? 'Mandante' : 'Visitante'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">Resultado do sorteio</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drawnPlayers.map((player) => (
                  <div
                    key={`${player.id}-${player.type}`}
                    className={`rounded-2xl p-5 border ${
                      player.type === 'EXAME'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <p className="text-sm text-slate-500">
                      {player.team === 'home' ? 'Mandante' : 'Visitante'}
                    </p>

                    <div className="text-4xl font-bold mt-2">
                      Nº {player.number}
                    </div>

                    <h4 className="text-xl font-bold mt-2">{player.name}</h4>

                    <span
                      className={`inline-block mt-4 px-3 py-1 rounded-full text-sm ${
                        player.type === 'EXAME'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {player.type === 'EXAME'
                        ? 'Vai para exame'
                        : 'Reserva'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}