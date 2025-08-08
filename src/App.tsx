import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import Sidebar from './components/Sidebar';
import LoginForm from './components/LoginForm';
import LoadingScreen from './components/LoadingScreen';
import InviteRedirect from './components/InviteRedirect';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import LandingPage from './pages/LandingPage';
import LandingPageLoader from './components/LandingPageLoader';
import ServiceRedirect from './components/ServiceRedirect';
import { usePWAInstallation } from './hooks/usePWAInstallation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { useIsAppDomain } from './hooks/useSubdomain';

// Lazy loading das páginas
const Agenda = lazy(() => import('./pages/Agenda'));
const Clientes = lazy(() => import('./pages/Clientes'));
const Profissionais = lazy(() => import('./pages/Profissionais'));
const Servicos = lazy(() => import('./pages/Servicos'));
const Relatorio = lazy(() => import('./pages/Financeiro'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const LinkAgendamento = lazy(() => import('./pages/LinkAgendamento'));
const AgendamentoPublico = lazy(() => import('./pages/AgendamentoPublico'));
const MeusAgendamentos = lazy(() => import('./pages/MeusAgendamentos'));
const DefinirSenha = lazy(() => import('./pages/DefinirSenha'));
const SalonNotFound = lazy(() => import('./pages/SalonNotFound'));
const MarketingApp = lazy(() => import('./pages/MarketingApp'));

// Componente de loading para páginas
const PageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p className="text-gray-600">Carregando página...</p>
    </div>
  </div>
);

function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [forceReady, setForceReady] = useState(false);
  const { isAuthenticated, loading: authLoading, userContext, isEmployee } = useAuth();
  const { currentSalon, isReady, loading: salonLoading, error: salonError, isMainDomain } = useApp();

  // Hook para detectar mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      // Fechar sidebar quando mudar para desktop
      if (window.innerWidth > 768) {
        setIsMobileSidebarOpen(false);
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Timeout de fallback para evitar carregamento infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('⏰ Timeout de carregamento atingido, forçando ready...');
      setForceReady(true);
    }, 15000); // 15 segundos

    return () => clearTimeout(timeout);
  }, []);

  // Loading geral (auth + salon)
  const isLoading = (authLoading || salonLoading) && !forceReady;

  // Mostrar tela de loading durante verificações iniciais
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Se houver erro ao carregar salão (subdomínio inválido)
  if (salonError && !isMainDomain) {
    return (
      <Suspense fallback={<PageLoader />}>
        <SalonNotFound />
      </Suspense>
    );
  }

  // Se não está no domínio principal e não tem salão, erro
  if (!isMainDomain && !currentSalon) {
    return (
      <Suspense fallback={<PageLoader />}>
        <SalonNotFound />
      </Suspense>
    );
  }

  // Se está no domínio principal e não está autenticado
  if (isMainDomain && !isAuthenticated) {
    return <LoginForm />;
  }

  // Se está no domínio principal e autenticado mas sem contexto
  if (isMainDomain && isAuthenticated && !userContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">BelaGestão</h1>
          <p className="text-gray-600 mb-4">Carregando dados do salão...</p>
          <div className="flex items-center justify-center space-x-2 text-indigo-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <span className="text-sm">Aguarde...</span>
          </div>
        </div>
      </div>
    );
  }

  // Se está em subdomínio mas não está autenticado, mostrar login ou páginas públicas
  if (!isMainDomain && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/agendamento" element={<AgendamentoPublico />} />
            <Route path="/*" element={<LoginForm />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  const commonProps = {
    onToggleMobileSidebar: () => setIsMobileSidebarOpen(!isMobileSidebarOpen),
    isMobile
  };

  // Layout principal com sidebar (para usuários autenticados)
  return (
    <ServiceRedirect>
      <div className={`flex h-screen bg-gray-50 overflow-hidden ${isMobile ? 'mobile-app-layout' : ''}`}>
        {/* Desktop Sidebar */}
        <div className={isMobile ? 'hidden' : 'block'}>
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {isMobile && isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg">
              <Sidebar 
                isMobile={true}
                onClose={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 main-content-area ${isMobile ? 'ml-0' : 'ml-16 group-hover:ml-64'}`}>
          <div className="h-full w-full page-container">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={
                  isEmployee ? <Navigate to="/agenda" replace /> : <InviteRedirect />
                } />
                <Route path="/agenda" element={<Agenda {...commonProps} />} />
                {/* Rotas restritas apenas para admins */}
                {!isEmployee && (
                  <>
                    <Route path="/clientes" element={<Clientes {...commonProps} />} />
                    <Route path="/profissionais" element={<Profissionais {...commonProps} />} />
                    <Route path="/servicos" element={<Servicos {...commonProps} />} />
                    <Route path="/financeiro" element={<Relatorio {...commonProps} />} />
                    <Route path="/configuracoes" element={<Configuracoes {...commonProps} />} />
                    <Route path="/link-agendamento" element={<LinkAgendamento {...commonProps} />} />
                  </>
                )}
                {/* Redirecionar funcionários para agenda se tentarem acessar outras rotas */}
                {isEmployee && (
                  <Route path="/*" element={<Navigate to="/agenda" replace />} />
                )}
              </Routes>
            </Suspense>
          </div>
        </div>
        
        {/* PWA Install Banner */}
        <PWAInstallBanner />
      </div>
    </ServiceRedirect>
  );
}

function DomainRouter() {
  const isAppDomain = useIsAppDomain();
  const { shouldShowLandingPage } = usePWAInstallation();

  // Se estiver no app.localhost:5173, mostrar página de marketing
  if (isAppDomain) {
    console.log('🎨 Mostrando MarketingApp (app domain)');
    return (
      <Suspense fallback={<PageLoader />}>
        <MarketingApp />
      </Suspense>
    );
  }

  // Se estiver no domínio principal e não for PWA instalado, mostrar landing page
  const isMainDomain = window.location.hostname === 'belagestao.com' || 
                      (window.location.hostname === 'localhost' && window.location.port === '5173');
  
  console.log('🏠 DomainRouter Debug:', {
    isAppDomain,
    shouldShowLandingPage,
    isMainDomain,
    hostname: window.location.hostname,
    port: window.location.port
  });
  
  if (shouldShowLandingPage && isMainDomain) {
    console.log('🎯 Mostrando LandingPage');
    return (
      <Suspense fallback={<LandingPageLoader />}>
        <LandingPage />
      </Suspense>
    );
  }

  console.log('🔧 Mostrando rotas normais (AppLayout)');
  // Caso contrário, usar as rotas normais
  return (
    <Routes>
      <Route path="/agendamento" element={
        <Suspense fallback={<PageLoader />}>
          <AgendamentoPublico />
        </Suspense>
      } />
      <Route path="/meus-agendamentos" element={
        <Suspense fallback={<PageLoader />}>
          <MeusAgendamentos />
        </Suspense>
      } />
      <Route path="/definir-senha" element={
        <Suspense fallback={<PageLoader />}>
          <DefinirSenha />
        </Suspense>
      } />
      <Route path="/*" element={
        <AppProvider>
          <AppLayout />
        </AppProvider>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DomainRouter />
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Router>
  );
}

export default App;