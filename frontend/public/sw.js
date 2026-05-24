/* sw.js - Service Worker com correção para notificações PWA
   Correção aplicada:
   - NÃO usar new Notification(...) dentro do Service Worker
   - Usar self.registration.showNotification(...)
*/

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = {
      title: "Nova notificação",
      body: event.data ? event.data.text() : "Você recebeu uma nova mensagem.",
    };
  }

  const title = data.title || data.notification?.title || "Nova notificação";

  const options = {
    body: data.body || data.notification?.body || "Você recebeu uma nova mensagem.",
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/icon-192.png",
    image: data.image,
    data: {
      url: data.url || data.click_action || data.notification?.click_action || "/",
      ...data,
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});