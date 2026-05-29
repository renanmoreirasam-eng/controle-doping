'use client';

import { useEffect, useMemo, useState } from 'react';

import { api } from '../services/api';
import { getToken } from '../services/auth';

type Announcement = {
  id: string;
  title: string;
  message: string;
  targetRole: 'ALL' | 'COORDINATOR' | 'OFFICIAL';
  createdAt: string;
};

function formatAnnouncementMessage(message: string) {
  return message
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function PendingAnnouncementsModal() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  const currentAnnouncement = announcements[0];

  const formattedParagraphs = useMemo(() => {
    if (!currentAnnouncement?.message) return [];

    return formatAnnouncementMessage(currentAnnouncement.message);
  }, [currentAnnouncement?.message]);

  async function loadPendingAnnouncements() {
    const token = getToken();

    if (!token) return;

    try {
      setLoading(true);

      const response = await api.get('/announcements/pending/me');

      setAnnouncements(response.data || []);
    } catch (error) {
      console.warn('Não foi possível carregar comunicados pendentes.', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingAnnouncements();
  }, []);

  async function acknowledgeCurrentAnnouncement() {
    if (!currentAnnouncement || acknowledging) return;

    try {
      setAcknowledging(true);

      await api.post(`/announcements/${currentAnnouncement.id}/acknowledge`);

      setAnnouncements((current) =>
        current.filter((announcement) => announcement.id !== currentAnnouncement.id),
      );
    } catch (error) {
      console.warn('Não foi possível marcar o comunicado como ciente.', error);
    } finally {
      setAcknowledging(false);
    }
  }

  if (loading || !currentAnnouncement) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-5 py-5 lg:px-6">
          <span className="inline-flex w-fit items-center rounded-full border border-yellow-100 bg-yellow-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-yellow-700">
            Comunicado importante
          </span>

          <h2 className="mt-3 break-words text-2xl font-black leading-tight text-[var(--cdb-dark)] lg:text-3xl">
            {currentAnnouncement.title}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Leia o comunicado abaixo e confirme ciência para continuar.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 lg:px-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 lg:p-5 lg:text-base">
            {formattedParagraphs.length > 0 ? (
              <div className="space-y-4">
                {formattedParagraphs.map((paragraph, index) => (
                  <p
                    key={`${currentAnnouncement.id}-${index}`}
                    className="whitespace-pre-wrap break-words"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">
                {currentAnnouncement.message}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-5 py-4 lg:px-6">
          <button
            type="button"
            onClick={acknowledgeCurrentAnnouncement}
            disabled={acknowledging}
            className="w-full rounded-2xl bg-[var(--cdb-blue)] px-5 py-3 font-black text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {acknowledging ? 'Registrando...' : 'Estou ciente'}
          </button>
        </div>
      </div>
    </div>
  );
}
