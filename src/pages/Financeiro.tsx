import React, { useState, useEffect } from 'react';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import { BarChart2, List, Package, Star, Users, User, Award } from 'lucide-react';

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

  // Estados para métricas ativas em cada aba
  const [activeServicesMetric, setActiveServicesMetric] = useState<'services_revenue' | 'services_profit' | 'services_count'>('services_revenue');
  const [activeProductsMetric, setActiveProductsMetric] = useState<'products_revenue' | 'products_profit' | 'products_items_sold'>('products_revenue');
  const [activeResumoMetric, setActiveResumoMetric] = useState<'total_revenue' | 'total_profit'>('total_revenue');

  // Usar o hook personalizado
  const { 
    data, 
    loading, 
    error, 
    loadReportData,
    loadAtendimentosData, 
    loadProdutosData, 
    loadClientesData, 
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
    // Criar data no fuso horário local para evitar problemas de timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const dayFormatted = String(date.getDate()).padStart(2, '0');
    const monthFormatted = String(date.getMonth() + 1).padStart(2, '0');
    return `${dayFormatted}/${monthFormatted}`;
  };

  // Carregar dados quando o componente monta ou quando o período muda
  useEffect(() => {
    if (currentSalon) {
      // Carregar dados específicos da aba ativa
      switch (activeTab) {
        case 'resumo':
          loadReportData(selectedPeriod);
          break;
        case 'comandas':
          loadReportData(selectedPeriod);
          loadAtendimentosData(selectedPeriod);
          break;
        case 'produtos':
          loadReportData(selectedPeriod);
          loadProdutosData(selectedPeriod);
          break;
        case 'clientes':
          loadClientesData(selectedPeriod);
          break;
      }
    }
  }, [currentSalon, selectedPeriod, activeTab, loadReportData, loadAtendimentosData, loadProdutosData, loadClientesData]);

  // Debug do período selecionado
  useEffect(() => {
    console.log('🔍 selectedPeriod mudou:', selectedPeriod);
    console.log('🔍 Período formatado:', `${formatDateShort(selectedPeriod.start)} - ${formatDateShort(selectedPeriod.end)}`);
  }, [selectedPeriod]);

  const renderResumoTab = () => {
    const totals = data.reportData?.totals;
    const dailyData = data.reportData?.daily_report || [];

    if (loading) {
        return <LoadingSpinner size="lg" className="p-8" />;
    }

    if (error) {
        return <ErrorDisplay message={error} />;
    }

  return (
      <div className="space-y-4">
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
                                  <div
                        onClick={() => setActiveResumoMetric('total_revenue')}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                          activeResumoMetric === 'total_revenue'
                            ? 'bg-blue-100/80 border-blue-400 ring-2 ring-blue-200'
                            : 'bg-white/80 border-gray-200'
                        } border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}
                      >
                <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Receita</h3>
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(totals?.total_revenue || 0)}</p>
          </div>
            <div 
              onClick={() => setActiveResumoMetric('total_profit')} 
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                activeResumoMetric === 'total_profit' 
                  ? 'bg-purple-100/80 border-purple-400 ring-2 ring-purple-200' 
                  : 'bg-white/80 border-gray-200'
              } border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}
            >
                <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Lucro</h3>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totals?.total_profit || 0)}</p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4">
          {dailyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-gray-400 mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
              <p className="text-gray-500 mb-4">Não há dados para o período selecionado</p>
            </div>
          ) : (
            <ResumoChart 
              data={dailyData}
              metricKey={activeResumoMetric === 'total_revenue' ? 'services_revenue' : 'services_profit'}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>
    );
  };

  const renderComandasTab = () => {
    if (loading) {
      return <LoadingSpinner size="lg" className="h-64" />;
    }

    if (error) {
      return <ErrorDisplay message={error} />;
    }

    const dailyData = data.reportData?.daily_report || [];

    return (
      <div className="space-y-6">
        {/* Pills para seleção de métrica */}
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-3' : 'grid-cols-3'}`}>
          <button
            onClick={() => setActiveServicesMetric('services_revenue')}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
              activeServicesMetric === 'services_revenue'
                ? 'bg-blue-100/80 border-blue-400 ring-2 ring-blue-200'
                : 'bg-white/80 border-gray-200'
            } border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}
          >
            <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Receita</h3>
            <p className="text-sm font-bold text-gray-900">Valor Total</p>
          </button>
          <button
            onClick={() => setActiveServicesMetric('services_profit')}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
              activeServicesMetric === 'services_profit'
                ? 'bg-purple-100/80 border-purple-400 ring-2 ring-purple-200'
                : 'bg-white/80 border-gray-200'
            } border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}
          >
            <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Lucro</h3>
            <p className="text-sm font-bold text-gray-900">Valor Total</p>
          </button>
          <button
            onClick={() => setActiveServicesMetric('services_count')}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
              activeServicesMetric === 'services_count'
                ? 'bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-200'
                : 'bg-white/80 border-gray-200'
            } border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}
          >
            <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Atendimentos</h3>
            <p className="text-sm font-bold text-gray-900">Realizados</p>
          </button>
        </div>

        {/* Gráfico */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4">
          {dailyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-gray-400 mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
              <p className="text-gray-500 mb-4">Não há dados para o período selecionado</p>
            </div>
          ) : (
            <ResumoChart 
              data={dailyData}
              metricKey={activeServicesMetric}
              isMobile={isMobile}
            />
          )}
        </div>

        {/* Tabela de Atendimentos */}
        <ComandasTab comandas={data.atendimentos} isLoading={loading} />
      </div>
    );
  };

  const renderProdutosTab = () => {
    if (loading) {
      return <LoadingSpinner size="lg" className="h-64" />;
    }

    if (error) {
      return <ErrorDisplay message={error} />;
    }

    const dailyData = data.reportData?.daily_report || [];

    return (
      <div className="space-y-6">
        {/* Pills para seleção de métrica */}
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-3' : 'grid-cols-3'}`}>
          <button
            onClick={() => setActiveProductsMetric('products_revenue')}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
              activeProductsMetric === 'products_revenue'
                ? 'bg-blue-100/80 border-blue-400 ring-2 ring-blue-200'
                : 'bg-white/80 border-gray-200'
            } border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}
          >
            <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Receita</h3>
            <p className="text-sm font-bold text-gray-900">Valor Total</p>
          </button>
          <button
            onClick={() => setActiveProductsMetric('products_profit')}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
              activeProductsMetric === 'products_profit'
                ? 'bg-purple-100/80 border-purple-400 ring-2 ring-purple-200'
                : 'bg-white/80 border-gray-200'
            } border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}
          >
            <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Lucro</h3>
            <p className="text-sm font-bold text-gray-900">Valor Total</p>
          </button>
          <button
            onClick={() => setActiveProductsMetric('products_items_sold')}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
              activeProductsMetric === 'products_items_sold'
                ? 'bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-200'
                : 'bg-white/80 border-gray-200'
            } border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}
          >
            <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Itens</h3>
            <p className="text-sm font-bold text-gray-900">Vendidos</p>
          </button>
        </div>

        {/* Gráfico */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4">
          {dailyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-gray-400 mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
              <p className="text-gray-500 mb-4">Não há dados para o período selecionado</p>
            </div>
          ) : (
            <ResumoChart 
              data={dailyData}
              metricKey={activeProductsMetric}
              isMobile={isMobile}
            />
          )}
        </div>

        {/* Tabela de Produtos */}
        <ProdutosTab vendas={data.produtos} isLoading={loading} />
      </div>
    );
  };

  const renderClientesTab = () => {
    if (loading) {
      return <LoadingSpinner size="lg" className="h-64" />;
    }

    if (error) {
      return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <h2 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-sm' : 'text-lg'}`}>Melhores Clientes</h2>
            <ErrorDisplay message={error} />
          </div>
        </div>
      );
    }

    if (!data.clientes) {
      return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <h2 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-sm' : 'text-lg'}`}>Melhores Clientes</h2>
            <div className="text-center py-12">
              <div className="text-gray-300 mb-4 text-4xl">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
              <p className="text-gray-500 mb-4">Não há dados de clientes para o período selecionado</p>
            </div>
          </div>
        </div>
      );
    }

    const { rankings } = data.clientes.report;

    return (
      <div className="space-y-8">
        {/* Cards de Top 3 - Mais Impactantes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 3 por Receita */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User size={14} className="text-blue-600" />
                  </div>
                  Top 3 por Receita
                </h4>
              </div>
              <div className="space-y-3">
                {rankings.by_revenue.slice(0, 3).map((cliente, index) => (
                  <div key={cliente.client_id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center font-bold text-blue-600 text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{cliente.client_name}</p>
                        <p className="text-xs text-gray-500">{cliente.total_visits} visitas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 text-sm">{formatCurrency(cliente.total_revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top 3 por Visitas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users size={14} className="text-purple-600" />
                  </div>
                  Top 3 por Visitas
                </h4>
              </div>
              <div className="space-y-3">
                {rankings.by_visits.slice(0, 3).map((cliente, index) => (
                  <div key={cliente.client_id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center font-bold text-purple-600 text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{cliente.client_name}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(cliente.total_revenue)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600 text-sm">{cliente.total_visits}</p>
                      <p className="text-xs text-purple-500">visitas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Rankings - Mais Clean */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-xl'}`}>
                Ranking Completo de Clientes
              </h3>
              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {rankings.by_revenue.length} clientes
              </div>
            </div>

            {rankings.by_revenue.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-sm">Nenhum cliente encontrado no período</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {isMobile ? (
                  // Versão Mobile - Cards Modernos
                  <div className="space-y-3">
                    {rankings.by_revenue.map((cliente, index) => (
                      <div key={cliente.client_id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                              index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-600' :
                              'bg-gradient-to-br from-blue-500 to-blue-600'
                            }`}>
                              {index === 0 ? <Award size={16} className="text-white" /> :
                              index === 1 ? <Award size={16} className="text-white" /> :
                              index === 2 ? <Award size={16} className="text-white" /> :
                              index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{cliente.client_name}</p>
                              <p className="text-xs text-gray-500">{cliente.total_visits} visitas</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600 text-sm">{formatCurrency(cliente.total_revenue)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            cliente.frequency === 'Semanal'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {cliente.frequency}
                          </span>
                          <div className="text-xs text-gray-400">
                            Posição #{index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
            </div>
        ) : (
                  // Versão Desktop - Tabela Moderna
                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Posição
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Frequência
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Visitas
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Receita Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-50">
                        {rankings.by_revenue.map((cliente, index) => (
                          <tr key={cliente.client_id} className="hover:bg-gray-50/50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg ${
                                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                  index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-600' :
                                  'bg-gradient-to-br from-blue-500 to-blue-600'
                                }`}>
                                  {index === 0 ? <Award size={16} className="text-white" /> :
                                  index === 1 ? <Award size={16} className="text-white" /> :
                                  index === 2 ? <Award size={16} className="text-white" /> :
                                  index + 1}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {cliente.client_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                cliente.frequency === 'Semanal'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {cliente.frequency}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-semibold text-gray-900">
                                {cliente.total_visits}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-bold text-emerald-600">
                                {formatCurrency(cliente.total_revenue)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handlePeriodChange = (period: { start: string, end: string }) => {
    console.log('🔄 handlePeriodChange chamado com:', period);
    console.log('📅 Período anterior:', selectedPeriod);
    setSelectedPeriod(period);
    console.log('✅ Novo período definido:', period);
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
                <div className={`${isMobile ? 'w-full' : 'w-auto'}`}>
                  <button
                    onClick={() => setIsPeriodModalOpen(true)}
                    className={`inline-flex items-center border border-gray-300 shadow-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                      isMobile ? 'w-full px-6 py-3 text-sm justify-center' : 'px-4 py-2 text-sm h-10'
                    }`}
                    style={!isMobile ? { minHeight: '40px' } : {}}
                  >
                    <Calendar className={`mr-3 ${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                    <span className={isMobile ? 'block w-full text-center font-medium' : 'whitespace-nowrap font-medium'}>
                      Período: {`${formatDateShort(selectedPeriod.start)} - ${formatDateShort(selectedPeriod.end)}`}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="tab-content">
              {activeTab === 'resumo' && renderResumoTab()}
              {activeTab === 'comandas' && renderComandasTab()}
              {activeTab === 'produtos' && renderProdutosTab()}
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