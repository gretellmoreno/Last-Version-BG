import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import Sidebar from './components/Sidebar';
import LoginForm from './components/LoginForm';
import LoadingScreen from './components/LoadingScreen';
import Agenda from './pages/Agenda';
import Clientes from './pages/Clientes';
import Profissionais from './pages/Profissionais';
import Servicos from './pages/Servicos';
import Relatorio from './pages/Financeiro';
import Configuracoes from './pages/Configuracoes';
import LinkAgendamento from './pages/LinkAgendamento';
import AgendamentoPublico from './pages/AgendamentoPublico';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ProfessionalProvider } from './contexts/ProfessionalContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { ProductProvider } from './contexts/ProductContext';
import { ClientProvider } from './contexts/ClientContext';
import { TaxasProvider } from './contexts/TaxasContext';
import { FinanceiroProvider } from './contexts/FinanceiroContext';
function AppContent() {
  const [activeMenu, setActiveMenu] = useState('agenda');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated, loading, userContext } = useAuth();

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

  // Mostrar tela de loading durante a verificação inicial de autenticação
  if (loading) {
    return <LoadingScreen />;
  }

  // Mostrar tela de login se não estiver autenticado
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Se o usuário está autenticado mas o contexto ainda não foi carregado,
  // mostrar uma tela de loading simples
  if (!userContext) {
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

  const renderContent = () => {
    const commonProps = {
      onToggleMobileSidebar: () => setIsMobileSidebarOpen(!isMobileSidebarOpen),
      isMobile
    };

    switch (activeMenu) {
      case 'agenda':
        return <Agenda {...commonProps} />;
      case 'clientes':
        return <Clientes {...commonProps} />;
      case 'profissionais':
        return <Profissionais {...commonProps} />;
      case 'servicos':
        return <Servicos {...commonProps} />;
      case 'financeiro':
        return <Relatorio {...commonProps} />;
      case 'configuracoes':
        return <Configuracoes {...commonProps} />;
      case 'link-agendamento':
        return <LinkAgendamento {...commonProps} />;
      default:
        return <Agenda {...commonProps} />;
    }
  };

  // Mantemos apenas os providers que são realmente globais
  return (
    <AppProvider>
      <ProfessionalProvider>
        <ServiceProvider>
          <ProductProvider>
            <ClientProvider>
              <TaxasProvider>
                <FinanceiroProvider>
                  <div className={`flex h-screen bg-gray-50 overflow-hidden ${isMobile ? 'mobile-app-layout' : ''}`}>
                    {/* Desktop Sidebar */}
                    <div className={isMobile ? 'hidden' : 'block'}>
                      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
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
                            activeMenu={activeMenu} 
                            onMenuChange={(menu) => {
                              setActiveMenu(menu);
                              setIsMobileSidebarOpen(false);
                            }}
                            isMobile={true}
                            onClose={() => setIsMobileSidebarOpen(false)}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Main Content */}
                    <div className={`flex-1 transition-all duration-300 main-content-area ${isMobile ? 'ml-0' : 'ml-16 group-hover:ml-64'}`}>
                      <div className="h-full w-full page-container">
                        {renderContent()}
                      </div>
                    </div>
                  </div>
                </FinanceiroProvider>
              </TaxasProvider>
            </ClientProvider>
          </ProductProvider>
        </ServiceProvider>
      </ProfessionalProvider>
    </AppProvider>
  );
}

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/agendamento" element={<AgendamentoPublico />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Router>
  );
}

export default App;