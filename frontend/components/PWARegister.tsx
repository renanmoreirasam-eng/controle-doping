"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.log("Service Worker não suportado neste navegador");
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("Service Worker só será registrado em produção");
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        console.log("Service Worker registrado com sucesso:", registration);
      } catch (error) {
        console.error("Erro ao registrar Service Worker:", error);
      }
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener("load", registerServiceWorker);
    }

    return () => {
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  return null;
}