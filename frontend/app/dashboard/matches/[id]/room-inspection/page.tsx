'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { Sidebar } from '../../../../../components/Sidebar';
import { api } from '../../../../../services/api';

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  championship: {
    name: string;
  };
  stadium: {
    name: string;
    city: string;
    state: string;
  };
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
  { label: 'Chave da sala', status: 'CONFORME' },
  { label: 'Banheiro próximo', status: 'CONFORME' },
  { label: 'Água disponível', status: 'CONFORME' },
  { label: 'Lanche disponível', status: 'CONFORME' },
  { label: 'Privacidade adequada', status: 'CONFORME' },
  { label: 'Sala limpa', status: 'CONFORME' },
];

export default function RoomInspectionPage() {
  const params = useParams();
  const router = useRouter();

  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);

  const [roomItems, setRoomItems] =
    useState<RoomInspectionItem[]>(
      defaultRoomItems,
    );

  const [roomNotes, setRoomNotes] =
    useState('');

  const [roomPhotos, setRoomPhotos] =
    useState<RoomInspectionPhoto[]>([]);

  const [roomInspections, setRoomInspections] =
    useState<RoomInspection[]>([]);

  async function loadMatch() {
    const response = await api.get(
      `/matches/${matchId}`,
    );

    setMatch(response.data);
  }

  async function loadRoomInspections() {
    const response = await api.get(
      `/room-inspections?matchId=${matchId}`,
    );

    setRoomInspections(response.data);
  }

  useEffect(() => {
    if (matchId) {
      loadMatch();
      loadRoomInspections();
    }
  }, [matchId]);

  const hasInspection =
    roomInspections.length > 0;

  function getRoomStatus() {
    const hasRejected = roomItems.some(
      (item) =>
        item.status === 'NAO_CONFORME',
    );

    const hasUnavailable =
      roomItems.some(
        (item) =>
          item.status ===
          'NAO_DISPONIVEL',
      );

    if (hasRejected) return 'REPROVADA';

    if (hasUnavailable)
      return 'APROVADA_COM_OBSERVACOES';

    return 'APROVADA';
  }

  function getRoomStatusLabel(
    status: string,
  ) {
    if (status === 'APROVADA')
      return 'Aprovada';

    if (
      status ===
      'APROVADA_COM_OBSERVACOES'
    )
      return 'Aprovada com observações';

    if (status === 'REPROVADA')
      return 'Reprovada';

    return status;
  }

  function getRoomStatusClass(
    status: string,
  ) {
    if (status === 'APROVADA')
      return 'bg-green-100 text-green-700';

    if (
      status ===
      'APROVADA_COM_OBSERVACOES'
    )
      return 'bg-yellow-100 text-yellow-700';

    if (status === 'REPROVADA')
      return 'bg-red-100 text-red-700';

    return 'bg-slate-100 text-slate-700';
  }

  function updateRoomItem(
    index: number,
    field: 'status' | 'notes',
    value: string,
  ) {
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

  async function handleRoomPhotos(
    files: FileList | null,
  ) {
    if (!files) return;

    const photos = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<RoomInspectionPhoto>(
            (resolve) => {
              const reader =
                new FileReader();

              reader.onload = () => {
                resolve({
                  fileName: file.name,
                  dataUrl: String(
                    reader.result,
                  ),
                });
              };

              reader.readAsDataURL(file);
            },
          ),
      ),
    );

    setRoomPhotos((prev) => [
      ...prev,
      ...photos,
    ]);
  }

  function removeRoomPhoto(
    index: number,
  ) {
    setRoomPhotos((prev) =>
      prev.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  }

  async function saveRoomInspection() {
    try {
      await api.post(
        '/room-inspections',
        {
          matchId,
          status: getRoomStatus(),
          notes: roomNotes || null,
          items: roomItems,
          photos: roomPhotos,
        },
      );

      alert(
        'Inspeção da sala salva com sucesso!',
      );

      router.push(
        `/dashboard/matches/${matchId}`,
      );
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erro ao salvar inspeção',
      );
    }
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-slate-100 flex">
        <Sidebar />

        <div className="flex-1 p-8">
          Carregando...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Inspeção da sala
              </p>

              <h1 className="text-4xl font-black mt-1">
                {match.homeTeam} x{' '}
                {match.awayTeam}
              </h1>

              <p className="text-slate-500 mt-2">
                {
                  match.championship
                    .name
                }{' '}
                —{' '}
                {match.stadium.name}
              </p>
            </div>

            <Link
              href={`/dashboard/matches/${matchId}`}
              className="bg-slate-950 text-white px-5 py-3 rounded-2xl font-semibold"
            >
              Voltar ao jogo
            </Link>
          </div>
        </header>

        <section className="p-8 space-y-8">
          {hasInspection && (
            <div className="bg-green-100 text-green-700 border border-green-200 rounded-3xl p-5">
              Checklist da sala já realizado
              para este jogo.
            </div>
          )}

          {!hasInspection && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-2xl font-black mb-2">
                Checklist estrutural
              </h2>

              <p className="text-slate-500 mb-6">
                Verifique somente as
                condições físicas e
                estruturais da sala.
              </p>

              <div className="space-y-4">
                {roomItems.map(
                  (item, index) => (
                    <div
                      key={item.label}
                      className="border border-slate-200 rounded-3xl p-4 bg-slate-50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <p className="font-black">
                            {item.label}
                          </p>

                          <p className="text-slate-500 text-sm">
                            Item da sala
                          </p>
                        </div>

                        <select
                          className="border border-slate-200 rounded-2xl px-4 py-3 bg-white"
                          value={
                            item.status
                          }
                          onChange={(
                            e,
                          ) =>
                            updateRoomItem(
                              index,
                              'status',
                              e.target
                                .value,
                            )
                          }
                        >
                          <option value="CONFORME">
                            Conforme
                          </option>

                          <option value="NAO_CONFORME">
                            Não conforme
                          </option>

                          <option value="NAO_DISPONIVEL">
                            Não disponível
                          </option>
                        </select>

                        <input
                          className="border border-slate-200 rounded-2xl px-4 py-3 bg-white"
                          placeholder="Observação"
                          value={
                            item.notes ||
                            ''
                          }
                          onChange={(
                            e,
                          ) =>
                            updateRoomItem(
                              index,
                              'notes',
                              e.target
                                .value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>

              <textarea
                className="border border-slate-200 rounded-2xl p-4 w-full mt-6 bg-white"
                placeholder="Observações gerais da sala"
                value={roomNotes}
                onChange={(e) =>
                  setRoomNotes(
                    e.target.value,
                  )
                }
              />

              <div className="mt-6">
                <label className="block font-black mb-2">
                  Fotos do local
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="border border-slate-200 rounded-2xl p-4 w-full bg-white"
                  onChange={(e) =>
                    handleRoomPhotos(
                      e.target.files,
                    )
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {roomPhotos.map(
                    (photo, index) => (
                      <div
                        key={`${photo.fileName}-${index}`}
                        className="border border-slate-200 rounded-3xl p-3"
                      >
                        <img
                          src={
                            photo.dataUrl
                          }
                          alt={
                            photo.fileName
                          }
                          className="w-full h-40 object-cover rounded-2xl mb-3"
                        />

                        <p className="text-sm text-slate-500 truncate">
                          {
                            photo.fileName
                          }
                        </p>

                        <button
                          onClick={() =>
                            removeRoomPhoto(
                              index,
                            )
                          }
                          className="mt-3 bg-slate-100 px-4 py-2 rounded-2xl text-sm font-semibold"
                        >
                          Remover foto
                        </button>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <button
                onClick={
                  saveRoomInspection
                }
                className="bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold mt-6"
              >
                Salvar inspeção da sala
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-2xl font-black mb-6">
              Inspeções salvas
            </h2>

            <div className="space-y-5">
              {roomInspections.map(
                (inspection) => (
                  <div
                    key={inspection.id}
                    className="border border-slate-200 rounded-3xl p-5"
                  >
                    <div className="flex justify-between gap-4 mb-4">
                      <div>
                        <p className="text-slate-500 text-sm">
                          Registrada em{' '}
                          {new Date(
                            inspection.createdAt,
                          ).toLocaleString(
                            'pt-BR',
                          )}
                        </p>

                        <span
                          className={`${getRoomStatusClass(
                            inspection.status,
                          )} inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold`}
                        >
                          {getRoomStatusLabel(
                            inspection.status,
                          )}
                        </span>
                      </div>
                    </div>

                    {inspection.notes && (
                      <p className="text-slate-600 mb-4">
                        Obs.:{' '}
                        {
                          inspection.notes
                        }
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {inspection.items.map(
                        (item) => (
                          <div
                            key={item.label}
                            className="bg-slate-50 rounded-2xl p-3"
                          >
                            <strong>
                              {item.label}
                            </strong>

                            <p className="text-sm text-slate-500">
                              Status:{' '}
                              {item.status ===
                              'CONFORME'
                                ? 'Conforme'
                                : item.status ===
                                    'NAO_CONFORME'
                                  ? 'Não conforme'
                                  : 'Não disponível'}
                            </p>

                            {item.notes && (
                              <p className="text-sm text-slate-500">
                                Obs.:{' '}
                                {
                                  item.notes
                                }
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </div>

                    {inspection.photos
                      .length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {inspection.photos.map(
                          (
                            photo,
                            index,
                          ) => (
                            <img
                              key={`${inspection.id}-${index}`}
                              src={
                                photo.dataUrl
                              }
                              alt={
                                photo.fileName
                              }
                              className="w-full h-40 object-cover rounded-2xl border"
                            />
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ),
              )}

              {roomInspections.length ===
                0 && (
                <div className="border border-dashed border-slate-300 rounded-3xl p-10 text-center">
                  <div className="text-6xl mb-4">
                    🧪
                  </div>

                  <h3 className="text-xl font-bold">
                    Nenhuma inspeção
                    registrada
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Faça o checklist da
                    sala para este jogo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}