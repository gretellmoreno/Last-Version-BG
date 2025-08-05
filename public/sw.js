const CACHE_NAME = 'belagestao-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/screenshots/desktop.png',
  '/screenshots/mobile.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Interceptar manifest.json para modificar dinamicamente
  if (url.pathname === '/manifest.json') {
    event.respondWith(
      caches.match('/manifest.json')
        .then((response) => {
          if (response) {
            return response.json().then((manifest) => {
              // Detectar subdomínio do hostname
              const hostname = url.hostname;
              let subdomain = null;
              
              if (hostname.includes('.') && hostname.split('.').length > 2) {
                subdomain = hostname.split('.')[0];
              }
              
              // Modificar manifest se estiver em subdomínio
              if (subdomain) {
                manifest.name = `BelaGestão - ${subdomain}`;
                manifest.start_url = `https://${subdomain}.belagestao.com/`;
                manifest.scope = `https://${subdomain}.belagestao.com/`;
                
                console.log('Service Worker: Manifest modificado para subdomínio:', subdomain);
                console.log('Service Worker: Start URL:', manifest.start_url);
                console.log('Service Worker: Scope:', manifest.scope);
              }
              
              return new Response(JSON.stringify(manifest), {
                headers: {
                  'Content-Type': 'application/json',
                },
              });
            });
          }
          
          // Se não estiver em cache, buscar da rede
          return fetch(event.request);
        })
    );
    return;
  }
  
  // Para outras requisições, usar estratégia cache-first
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar do cache se disponível
        if (response) {
          return response;
        }
        
        // Se não estiver em cache, buscar da rede
        return fetch(event.request);
      }
    )
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  let data = {
    title: 'BelaGestão',
    body: 'Você tem uma nova notificação!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: {
      url: '/agenda'
    }
  };

  // Tentar parsear dados da notificação
  if (event.data) {
    try {
      const pushData = event.data.json();
      data = {
        ...data,
        ...pushData
      };
    } catch (error) {
      console.log('Erro ao parsear dados da notificação:', error);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Fechar',
        icon: '/icons/icon-72x72.png'
      }
    ],
    requireInteraction: true,
    tag: 'belagestao-notification'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    const urlToOpen = event.notification.data?.url || '/agenda';
    
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
}); 