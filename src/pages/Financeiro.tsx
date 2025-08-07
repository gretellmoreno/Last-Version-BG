import React, { useState, useEffect } from 'react';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import { BarChart2, List, Package, Star, Users } from 'lucide-react';

import Header from '../components/Header';
import PeriodFilterModal from '../components/PeriodFilterModal';
import ErrorDisplay from '../components/ErrorDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApp } from '../contexts/AppContext';

// Componentes da aba
import ComandasTab from '../components/financeiro/ComandasTab';
import ProdutosTab from '../components/financeiro/ProdutosTab';
import ResumoChart from '../components/financeiro/ResumoChart';

import { supabaseService } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';
import { FinanceiroProvider } from '../contexts/FinanceiroContext';
import { ProfessionalProvider } from '../contexts/ProfessionalContext';
import { useRelatorio } from '../hooks/useRelatorio';

interface RelatorioProps {
  onToggleMobileSidebar?: () => void;
}

type TabType = 'resumo' | 'comandas' | 'produtos' | 'clientes';

function RelatorioContent({ onToggleMobileSidebar }: RelatorioProps) {
  const { currentSalon } = useApp();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState<TabType>('resumo');
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    
    // Formatação de data que respeita o timezone local
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      start: formatDate(startDate),
      end: formatDate(endDate),
    };
  });

  const [activeMetric, setActiveMetric] = useState<'atendimentos' | 'produtos' | 'faturamento_total' | 'lucro_liquido'>('faturamento_total');

  // Usar o hook personalizado
  const { 
    data, 
    loading, 
    error, 
    loadDashboardData, 
    loadAtendimentosData, 
    loadProdutosData, 
    loadClientesData, 
    loadDailyMetrics,
    loadAllData 
  } = useRelatorio();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Função para formatar data apenas com dia e mês
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };
    
  // Carregar dados quando o componente monta ou quando o período muda
  useEffect(() => {
    if (currentSalon) {
      // Carregar dados específicos da aba ativa
      switch (activeTab) {
        case 'resumo':
          loadDashboardData(selectedPeriod);
          loadDailyMetrics(selectedPeriod);
          break;
        case 'comandas':
          loadAtendimentosData(selectedPeriod);
          break;
        case 'produtos':
          loadProdutosData(selectedPeriod);
          break;
        case 'clientes':
          loadClientesData(selectedPeriod);
          break;
      }
    }
  }, [currentSalon, selectedPeriod, activeTab, loadDashboardData, loadDailyMetrics, loadAtendimentosData, loadProdutosData, loadClientesData]);

  const renderResumoTab = () => {
    const summary = data.dashboard?.dashboard?.summary;
    
    const isPeriodInvalid = () => {
        const start = new Date(selectedPeriod.start);
        const end = new Date(selectedPeriod.end);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 2;
    }

    if (loading) {
        return <LoadingSpinner size="lg" className="p-8" />;
    }

    if (error) {
        return <ErrorDisplay message={error} />;
    }

  return (
      <div className="space-y-4">
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <div onClick={() => setActiveMetric('faturamento_total')} className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${activeMetric === 'faturamento_total' ? 'bg-orange-100/80 border-orange-400 ring-2 ring-orange-200' : 'bg-white/80 border-gray-200'} border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}>
                <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Faturamento</h3>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary?.total_gross_revenue || 0)}</p>
          </div>
            <div onClick={() => setActiveMetric('lucro_liquido')} className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${activeMetric === 'lucro_liquido' ? 'bg-purple-100/80 border-purple-400 ring-2 ring-purple-200' : 'bg-white/80 border-gray-200'} border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}>
                <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Lucro Líquido</h3>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary?.total_net_profit || 0)}</p>
          </div>
            <div onClick={() => setActiveMetric('atendimentos')} className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${activeMetric === 'atendimentos' ? 'bg-blue-100/80 border-blue-400 ring-2 ring-blue-200' : 'bg-white/80 border-gray-200'} border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}>
                <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Atendimentos</h3>
                <p className="text-lg font-bold text-gray-900">{data.atendimentos.length}</p>
          </div>
            <div onClick={() => setActiveMetric('produtos')} className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${activeMetric === 'produtos' ? 'bg-green-100/80 border-green-400 ring-2 ring-green-200' : 'bg-white/80 border-gray-200'} border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}>
                <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Produtos</h3>
                <p className="text-lg font-bold text-gray-900">{data.produtos.length}</p>
          </div>
        </div>

        {/* Gráfico sempre visível */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Evolução Diária</h3>
            <p className="text-sm text-gray-600">Clique nos cards acima para alterar a métrica exibida</p>
          </div>
          
          {data.dailyMetrics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-gray-400 mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
              <p className="text-gray-500 mb-4">Não há dados para o período selecionado</p>
            </div>
          ) : (
            <ResumoChart 
              data={data.dailyMetrics} 
              metricKey={activeMetric}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>
    );
  };

  const renderClientesTab = () => {
    if (loading) {
      return <LoadingSpinner size="lg" className="h-64" />;
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <h2 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-sm' : 'text-lg'}`}>Melhores Clientes</h2>
            <ErrorDisplay message={error} />
          </div>
        </div>
      );
    }

    if (!data.clientes) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <h2 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-sm' : 'text-lg'}`}>Melhores Clientes</h2>
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
              <p className="text-gray-500 mb-4">Não há dados de clientes para o período selecionado</p>
            </div>
          </div>
        </div>
      );
    }

    const { rankings } = data.clientes.report;

    return (
      <div className="space-y-6">
        {/* Tabela de Rankings (ou Cards para Mobile) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <h3 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-sm' : 'text-lg'}`}>
              Ranking de Clientes
            </h3>

            {rankings.by_revenue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum cliente encontrado no período
              </div>
            ) : (
              <div className="overflow-x-auto">
                {isMobile ? (
                  // Versão Mobile - Cards
                  <div className="space-y-3">
                    {rankings.by_revenue.map((cliente, index) => (
                      <div key={cliente.client_id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{cliente.client_name}</p>
                              <p className="text-xs text-gray-500">{cliente.total_visits} visitas</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600 text-sm">{formatCurrency(cliente.total_revenue)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            cliente.frequency === 'Semanal'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cliente.frequency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Versão Desktop - Tabela
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Posição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequência
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visitas
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receita Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rankings.by_revenue.map((cliente, index) => (
                        <tr key={cliente.client_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                {index + 1}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {cliente.client_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              cliente.frequency === 'Semanal'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {cliente.frequency}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-900 font-medium">
                              {cliente.total_visits}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-green-600">
                              {formatCurrency(cliente.total_revenue)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resumo dos Rankings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top 3 por Receita */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Top 3 por Receita</h4>
              <div className="space-y-2">
                {rankings.by_revenue.slice(0, 3).map((cliente, index) => (
                  <div key={cliente.client_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{cliente.client_name}</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(cliente.total_revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top 3 por Visitas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Top 3 por Visitas</h4>
              <div className="space-y-2">
                {rankings.by_visits.slice(0, 3).map((cliente, index) => (
                  <div key={cliente.client_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{cliente.client_name}</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{cliente.total_visits} visitas</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handlePeriodChange = (period: { start: string, end: string }) => {
    setSelectedPeriod(period);
    setIsPeriodModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen page-content">
      <Header 
        title="Relatório" 
        onMenuClick={onToggleMobileSidebar}
        isMobile={isMobile}
      />
      
      <div className="flex-1 bg-gray-50 overflow-hidden">
        <div className="h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin">
          <div className={`${isMobile ? 'p-4' : 'p-4 md:p-6'}`}>
            <div className={`mb-4 bg-white rounded-xl shadow-sm border border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
              {/* Tabs de Navegação */}
              <div className="bg-gray-100 p-1.5 rounded-xl mb-4">
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setActiveTab('resumo')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                      activeTab === 'resumo'
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <BarChart2 size={isMobile ? 18 : 16} />
                    {!isMobile && <span>Resumo</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab('comandas')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                      activeTab === 'comandas'
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <List size={isMobile ? 18 : 16} />
                    {!isMobile && <span>Atendimentos</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab('produtos')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                      activeTab === 'produtos'
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <Package size={isMobile ? 18 : 16} />
                    {!isMobile && <span>Produtos</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab('clientes')}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                      activeTab === 'clientes'
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <Star size={isMobile ? 18 : 16} />
                    {!isMobile && <span>Melhores Clientes</span>}
                  </button>
                </div>
              </div>
              
              {/* Período */}
              <div className={`w-full ${isMobile ? 'flex justify-center' : 'flex justify-end'}`}>
                <div className={`${isMobile ? 'w-full' : 'w-80'}`}>
                  <button
                    onClick={() => setIsPeriodModalOpen(true)}
                    className={`inline-flex items-center w-full border border-gray-300 shadow-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                      isMobile ? 'px-6 py-3 text-sm justify-center' : 'px-4 py-2 text-sm h-10'
                    }`}
                    style={!isMobile ? { minHeight: '40px' } : {}}
                  >
                    <Calendar className={`mr-3 ${isMobile ? 'w-5 h-5' : 'w-5 h-5'}`} />
                    <span className={isMobile ? 'block w-full text-center font-medium' : 'block w-full text-left'}>
                      Período: {`${formatDateShort(selectedPeriod.start)} - ${formatDateShort(selectedPeriod.end)}`}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="tab-content">
              {activeTab === 'resumo' && renderResumoTab()}
              {activeTab === 'comandas' && <ComandasTab comandas={data.atendimentos} isLoading={loading} />}
              {activeTab === 'produtos' && <ProdutosTab vendas={data.produtos} isLoading={loading} />}
              {activeTab === 'clientes' && renderClientesTab()}
            </div>
          </div>
        </div>
      </div>
      
      {isPeriodModalOpen && (
        <PeriodFilterModal
          isOpen={isPeriodModalOpen}
          onClose={() => setIsPeriodModalOpen(false)}
          onApply={handlePeriodChange}
          currentPeriod={selectedPeriod}
        />
      )}
    </div>
  );
}

export default function Relatorio(props: RelatorioProps) {
  return (
    <ProfessionalProvider>
      <FinanceiroProvider>
        <RelatorioContent {...props} />
      </FinanceiroProvider>
    </ProfessionalProvider>
  );
}