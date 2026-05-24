"use client";

import { useEffect, useState } from "react";

type NotificationStatus = "unsupported" | "default" | "granted" | "denied";

export default function EnableNotificationsButton() {
  const [status, setStatus] = useState<NotificationStatus>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setStatus("unsupported");
      return;
    }

    setStatus(Notification.permission as NotificationStatus);
  }, []);

  async function handleEnableNotifications() {
    if (!("Notification" in window)) {
      setStatus("unsupported");
      return;
    }

    try {
      setLoading(true);

      const permission = await Notification.requestPermission();

      setStatus(permission as NotificationStatus);

      if (permission === "granted") {
        new Notification("Notificações ativadas", {
          body: "Você receberá avisos quando houver escala pendente.",
          icon: "/icon-192.png",
        });
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificação:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
        Este navegador não suporta notificações push.
      </div>
    );
  }

  if (status === "granted") {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800">
        Notificações ativadas. Você receberá avisos de escalas pendentes.
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        As notificações estão bloqueadas neste navegador. Para ativar, acesse as
        permissões do site nas configurações do navegador.
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleEnableNotifications}
      disabled={loading}
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Ativando..." : "Ativar notificações"}
    </button>
  );
}