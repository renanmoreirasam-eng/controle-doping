"use client";

import { useEffect, useState } from "react";
import { subscribeUserToPush } from "@/lib/pushNotifications";

type NotificationStatus = "unsupported" | "default" | "granted" | "denied";

export default function EnableNotificationsButton() {
  const [status, setStatus] = useState<NotificationStatus>("default");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      setMessage("");

      const permission = await Notification.requestPermission();
      setStatus(permission as NotificationStatus);

      if (permission !== "granted") {
        setMessage("Permissão de notificação não foi concedida.");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL não configurada.");
      }

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("authToken");

      if (!token) {
        throw new Error(
          "Token de login não encontrado. Faça logout e login novamente.",
        );
      }

      const subscription = await subscribeUserToPush();

      const response = await fetch(`${apiUrl}/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          subscription,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();

        throw new Error(
          `Erro ao salvar inscrição push. Status: ${response.status}. Resposta: ${responseText}`,
        );
      }

      setMessage("Notificações ativadas com sucesso.");

      try {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification("Notificações ativadas", {
          body: "Você receberá avisos quando houver escala pendente.",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          data: {
            url: "/dashboard",
          },
        });
      } catch (notificationError) {
        console.warn(
          "A inscrição foi salva, mas a notificação local não foi exibida:",
          notificationError,
        );
      }
    } catch (error) {
      console.error("Erro ao ativar notificações:", error);

      if (error instanceof Error) {
        setMessage(error.message);
        return;
      }

      setMessage("Não foi possível ativar as notificações.");
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

  if (status === "denied") {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        As notificações estão bloqueadas neste navegador. Para ativar, acesse as
        permissões do site nas configurações do navegador.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleEnableNotifications}
        disabled={loading}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Ativando..."
          : status === "granted"
            ? "Salvar aparelho para notificações"
            : "Ativar notificações"}
      </button>

      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}