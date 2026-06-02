"use client";

import { useEffect, useState } from "react";
import { subscribeUserToPush } from "@/lib/pushNotifications";

type NotificationStatus =
  | "unsupported"
  | "default"
  | "granted"
  | "denied"
  | "checking";

type SubscriptionStatus = "unknown" | "active" | "inactive";

export default function EnableNotificationsButton() {
  const [status, setStatus] = useState<NotificationStatus>("checking");
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>("unknown");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function checkNotificationStatus() {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setStatus("unsupported");
      setSubscriptionStatus("inactive");
      return;
    }

    const permission = Notification.permission as NotificationStatus;

    setStatus(permission);

    if (permission !== "granted") {
      setSubscriptionStatus("inactive");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      setSubscriptionStatus(subscription ? "active" : "inactive");
    } catch (error) {
      console.warn("Não foi possível verificar inscrição push:", error);
      setSubscriptionStatus("unknown");
    }
  }

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  async function handleEnableNotifications() {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setStatus("unsupported");
      setSubscriptionStatus("inactive");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const permission = await Notification.requestPermission();
      setStatus(permission as NotificationStatus);

      if (permission !== "granted") {
        setSubscriptionStatus("inactive");
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

      setSubscriptionStatus("active");
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

      setSubscriptionStatus("inactive");

      if (error instanceof Error) {
        setMessage(error.message);
        return;
      }

      setMessage("Não foi possível ativar as notificações.");
    } finally {
      setLoading(false);
      await checkNotificationStatus();
    }
  }

  if (status === "checking") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--cdb-blue)]" />

          <div>
            <p className="text-sm font-black text-slate-700">
              Verificando notificações...
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Aguarde enquanto verificamos se este aparelho já está cadastrado
              para receber avisos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📵</div>

          <div>
            <p className="text-sm font-black text-yellow-800">
              Notificações não suportadas
            </p>

            <p className="mt-1 text-xs leading-5 text-yellow-800">
              Este navegador ou aparelho não suporta notificações push.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🚫</div>

          <div>
            <p className="text-sm font-black text-red-800">
              Notificações bloqueadas
            </p>

            <p className="mt-1 text-xs leading-5 text-red-800">
              As notificações estão bloqueadas neste navegador. Para ativar,
              libere as permissões do site nas configurações do navegador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const notificationsActive =
    status === "granted" && subscriptionStatus === "active";

  return (
    <div className="space-y-3">
      <div
        className={`rounded-2xl border p-4 ${
          notificationsActive
            ? "border-green-200 bg-green-50"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {notificationsActive ? "✅" : "🔔"}
            </div>

            <div>
              <p
                className={`text-sm font-black ${
                  notificationsActive ? "text-green-800" : "text-slate-700"
                }`}
              >
                {notificationsActive
                  ? "Notificações ativadas"
                  : "Notificações não ativadas"}
              </p>

              <p
                className={`mt-1 text-xs leading-5 ${
                  notificationsActive ? "text-green-700" : "text-slate-500"
                }`}
              >
                {notificationsActive
                  ? "Este aparelho já está cadastrado para receber avisos quando houver escala pendente."
                  : "Ative para receber avisos quando houver escala pendente."}
              </p>

              {status === "granted" && subscriptionStatus !== "active" && (
                <p className="mt-2 text-xs font-semibold text-yellow-700">
                  A permissão do navegador está liberada, mas este aparelho
                  ainda precisa ser salvo no sistema.
                </p>
              )}
            </div>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
              notificationsActive
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {notificationsActive ? "Ativo" : "Pendente"}
          </span>
        </div>
      </div>

      {!notificationsActive && (
        <button
          type="button"
          onClick={handleEnableNotifications}
          disabled={loading}
          className="w-full rounded-2xl bg-[var(--cdb-blue)] px-4 py-3 text-sm font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Ativando..."
            : status === "granted"
              ? "Salvar aparelho para notificações"
              : "Ativar notificações"}
        </button>
      )}

      {notificationsActive && (
        <button
          type="button"
          onClick={handleEnableNotifications}
          disabled={loading}
          className="w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm font-black text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Atualizando..." : "Atualizar inscrição deste aparelho"}
        </button>
      )}

      {message && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            notificationsActive
              ? "bg-green-50 text-green-700"
              : "bg-slate-50 text-slate-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
