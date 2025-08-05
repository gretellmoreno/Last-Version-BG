const CACHE_NAME = 'salao-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se disponível
        if (response) {
          return response;
        }
        
        // Se não estiver no cache, busca da rede
        return fetch(event.request)
          .then((response) => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clona a resposta para armazenar no cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Fallback para páginas offline
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Função para sincronização em background
function doBackgroundSync() {
  // Implementar sincronização de dados quando a conexão for restaurada
  console.log('Sincronizando dados em background...');
}

// Notificações push
self.addEventListener('push', (event) => {
  let options = {
    body: 'Nova notificação do BelaGestão',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Detalhes',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Fechar',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  // Se há dados na notificação push, usar eles
  if (event.data) {
    try {
      const pushData = event.data.json();
      options = {
        ...options,
        body: pushData.body || options.body,
        title: pushData.title || 'BelaGestão',
        data: {
          ...options.data,
          ...pushData.data
        }
      };
    } catch (error) {
      console.error('Erro ao processar dados da notificação:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(options.title || 'BelaGestão', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  
  if (event.action === 'view') {
    // Abrir página específica baseada no tipo de notificação
    if (data && data.type === 'appointment') {
      event.waitUntil(
        clients.openWindow(`/agenda?appointment=${data.appointment_id}`)
      );
    } else {
      event.waitUntil(
        clients.openWindow('/agenda')
      );
    }
  } else if (event.action === 'dismiss') {
    // Apenas fechar a notificação
    console.log('Notificação descartada');
  } else {
    // Clique na notificação principal
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Foco na janela quando clicado
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada:', event.notification.tag);
}); 