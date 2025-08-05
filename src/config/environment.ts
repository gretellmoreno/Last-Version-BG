// Configuração de ambiente para desenvolvimento e produção
export const environment = {
  // URLs base
  development: {
    baseUrl: 'http://localhost:5173',
    domain: 'localhost',
    subdomainPattern: '.localhost'
  },
  production: {
    baseUrl: 'https://belagestao.com',
    domain: 'belagestao.com',
    subdomainPattern: '.belagestao.com'
  }
};

// Detectar se está em produção
export const isProduction = () => {
  return window.location.hostname.includes('belagestao.com') || 
         window.location.hostname.includes('vercel.app');
};

// Obter configuração atual
export const getCurrentConfig = () => {
  return isProduction() ? environment.production : environment.development;
};

// Obter URL base atual
export const getBaseUrl = () => {
  return getCurrentConfig().baseUrl;
};

// Obter domínio atual
export const getCurrentDomain = () => {
  return getCurrentConfig().domain;
};

// Obter padrão de subdomínio atual
export const getSubdomainPattern = () => {
  return getCurrentConfig().subdomainPattern;
}; 