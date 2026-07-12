// frontend/public/sw.js

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Recebido.');
  console.log(`[Service Worker] Push data: "${event.data.text()}"`);

  const data = event.data.json();
  const title = data.title || 'Nova Notificação';
  const options = {
    body: data.body || 'Você tem uma nova mensagem.',
    icon: '/img/icons/android-chrome-192x192.png', // Caminho para um ícone
    badge: '/img/icons/favicon-32x32.png', // Ícone pequeno para a barra de status
    data: {
      url: data.data?.url || '/' // URL para abrir ao clicar
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clique na notificação recebido.');

  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';
  event.waitUntil(clients.openWindow(urlToOpen));
});