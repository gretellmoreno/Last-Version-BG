import { useApp } from '../contexts/AppContext';

export const generateManifest = (salonSubdomain?: string) => {
  const baseUrl = salonSubdomain 
    ? `https://${salonSubdomain}.belagestao.com`
    : 'https://belagestao.com';

  return {
    name: salonSubdomain 
      ? `BelaGestão - ${salonSubdomain}`
      : "Sistema de Gerenciamento de Salão de Beleza",
    short_name: "BelaGestão",
    description: "Sistema completo para gerenciamento de salões de beleza, incluindo agendamentos, clientes, profissionais e financeiro",
    start_url: salonSubdomain ? `https://${salonSubdomain}.belagestao.com/` : "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    scope: salonSubdomain ? `https://${salonSubdomain}.belagestao.com/` : "/",
    lang: "pt-BR",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    screenshots: [
      {
        src: "/screenshots/desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Interface desktop do sistema de gerenciamento de salão"
      },
      {
        src: "/screenshots/mobile.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "Interface mobile do sistema de gerenciamento de salão"
      }
    ]
  };
};

export const updateManifest = (salonSubdomain?: string) => {
  const manifest = generateManifest(salonSubdomain);
  
  // Criar um novo manifest dinâmico
  const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: 'application/json'
  });
  
  const manifestUrl = URL.createObjectURL(manifestBlob);
  
  // Atualizar o link do manifest no head
  let manifestLink = document.querySelector('link[rel="manifest"]');
  if (!manifestLink) {
    manifestLink = document.createElement('link');
    manifestLink.setAttribute('rel', 'manifest');
    document.head.appendChild(manifestLink);
  }
  
  manifestLink.setAttribute('href', manifestUrl);
  
  console.log('Manifest atualizado para:', salonSubdomain || 'domínio principal');
  console.log('Start URL:', manifest.start_url);
  console.log('Scope:', manifest.scope);
  
  return manifestUrl;
}; 