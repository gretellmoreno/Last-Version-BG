import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LoginForm from './components/LoginForm';
import LoadingScreen from './components/LoadingScreen';
import Agenda from './pages/Agenda';
import Clientes from './pages/Clientes';
import Profissionais from './pages/Profissionais';
import Servicos from './pages/Servicos';
import Financeiro from './pages/Financeiro';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { BookingProvider } from './contexts/BookingContext';
import { ClientProvider } from './contexts/ClientContext';
import { ProfessionalProvider } from './contexts/ProfessionalContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { ProductProvider } from './contexts/ProductContext';
import { FinanceiroProvider } from './contexts/FinanceiroContext';
import { TaxasProvider } from './contexts/TaxasContext';

function AppContent() {
  const [activeMenu, setActiveMenu] = useState('agenda');
  const { isAuthenticated, loading, userContext } = useAuth();

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
    switch (activeMenu) {
      case 'agenda':
        return <Agenda />;
      case 'clientes':
        return <Clientes />;
      case 'profissionais':
        return <Profissionais />;
      case 'servicos':
        return <Servicos />;
      case 'financeiro':
        return <Financeiro />;
      default:
        return <Agenda />;
    }
  };

  return (
    <AppProvider>
      <ProfessionalProvider>
      <TaxasProvider>
        <FinanceiroProvider>
          <ProductProvider>
            <ServiceProvider>
                <ClientProvider>
                  <BookingProvider>
                    <div className="flex h-screen bg-gray-50 overflow-hidden">
                      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
                      
                      {/* Main Content */}
                      <div className="flex-1 ml-16 transition-all duration-300">
                        {renderContent()}
                      </div>
                    </div>
                  </BookingProvider>
                </ClientProvider>
            </ServiceProvider>
          </ProductProvider>
        </FinanceiroProvider>
      </TaxasProvider>
      </ProfessionalProvider>
    </AppProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;