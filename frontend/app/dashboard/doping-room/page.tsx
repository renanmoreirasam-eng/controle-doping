'use client';

import { useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';

type ChecklistItem = {
  id: number;
  label: string;
  checked: boolean;
};

export default function DopingRoomPage() {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 1,
      label: 'Atleta chegou na sala',
      checked: false,
    },
    {
      id: 2,
      label: 'Documento conferido',
      checked: false,
    },
    {
      id: 3,
      label: 'Lacre validado',
      checked: false,
    },
    {
      id: 4,
      label: 'Coleta realizada',
      checked: false,
    },
    {
      id: 5,
      label: 'Amostra A armazenada',
      checked: false,
    },
    {
      id: 6,
      label: 'Amostra B armazenada',
      checked: false,
    },
    {
      id: 7,
      label: 'Assinatura realizada',
      checked: false,
    },
    {
      id: 8,
      label: 'Fotos anexadas',
      checked: false,
    },
  ]);

  const [notes, setNotes] = useState('');

  function toggleItem(id: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              checked: !item.checked,
            }
          : item,
      ),
    );
  }

  const completedItems = items.filter(
    (item) => item.checked,
  ).length;

  const progress = Math.round(
    (completedItems / items.length) * 100,
  );

  return (
    <main className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white border-b px-8 py-5">
          <h1 className="text-3xl font-bold">
            Sala de Doping
          </h1>

          <p className="text-slate-500">
            Checklist operacional da coleta
          </p>
        </header>

        <section className="p-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-3xl shadow p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  Checklist
                </h2>

                <p className="text-slate-500">
                  Controle da coleta antidoping
                </p>
              </div>

              <div className="text-right">
                <strong className="text-3xl">
                  {progress}%
                </strong>

                <p className="text-slate-500">
                  concluído
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-4 mb-8">
              <div
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`
                    border rounded-2xl p-5 flex items-center justify-between transition
                    ${
                      item.checked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white'
                    }
                  `}
                >
                  <div>
                    <h3 className="font-semibold text-lg">
                      {item.label}
                    </h3>

                    <p className="text-slate-500 text-sm">
                      Item operacional da coleta
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      toggleItem(item.id)
                    }
                    className={`
                      px-5 py-3 rounded-xl text-white font-medium
                      ${
                        item.checked
                          ? 'bg-green-600'
                          : 'bg-slate-800'
                      }
                    `}
                  >
                    {item.checked
                      ? 'Concluído'
                      : 'Marcar'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-8">
            <h2 className="text-2xl font-bold mb-6">
              Observações
            </h2>

            <textarea
              className="w-full border rounded-2xl p-4 min-h-[300px]"
              placeholder="Digite observações da coleta..."
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
            />

            <button className="w-full mt-6 bg-slate-950 text-white py-4 rounded-2xl font-semibold">
              Salvar relatório
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}