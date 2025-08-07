import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import { BarChart2, List, Package, Star, Users } from 'lucide-react';

import Header from '../components/Header';
import PeriodFilterModal from '../components/PeriodFilterModal';
import { useApp } from '../contexts/AppContext';

// Componentes da aba
import ComandasTab from '../components/financeiro/ComandasTab';
import ProdutosTab from '../components/financeiro/ProdutosTab';
import ResumoChart from '../components/financeiro/ResumoChart';

import { supabaseService } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';
import { FinanceiroProvider } from '../contexts/FinanceiroContext';
import { ProfessionalProvider } from '../contexts/ProfessionalContext';

interface RelatorioProps {
  onToggleMobileSidebar?: () => void;
}

interface FinancialSummary {
  success: boolean;
  dashboard: {
    summary: {
      total_services_revenue: number;
      total_products_revenue: number;
      total_gross_revenue: number;
      total_net_profit: number;
      salon_profit_from_services: number;
      total_commissions: number;
      salon_profit_from_products: number;
  };
  };
}

interface Atendimento {
  appointment_datetime: string;
  professional_name: string;
  client_name: string;
  payment_method_name: string;
  total_value: number;
  salon_profit: number;
  professional_profit: number;
}

interface VendaProduto {
  sale_date: string;
  product_name: string;
  sale_source: string;
  client_name: string;
  payment_method_name: string;
  quantity: number;
  total_value: number;
  profit: number;
}

interface ClienteRanking {
  posicao: number;
  nome: string;
  receita: number;
  visitas: number;
  frequencia: string;
}

type TabType = 'resumo' | 'comandas' | 'produtos' | 'clientes';

interface Metric {
  date: string;
  atendimentos: number;
  produtos: number;
  faturamento_total: number;
  lucro_liquido: number;
}

function RelatorioContent({ onToggleMobileSidebar }: RelatorioProps) {
  const { currentSalon } = useApp();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState<TabType>('resumo');
  const [loading, setLoading] = useState(true);
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

  // Estados dos dados
  const [dashboardData, setDashboardData] = useState<any>(null); // Usando any para simplicidade
  const [comandasData, setComandasData] = useState<any[]>([]);
  const [produtosData, setProdutosData] = useState<any[]>([]);
  const [clientesData, setClientesData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<Metric[]>([]);
  const [activeMetric, setActiveMetric] = useState<'atendimentos' | 'produtos' | 'faturamento_total' | 'lucro_liquido'>('faturamento_total');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
    
  const loadData = useCallback(async () => {
    if (!currentSalon) return;
    setLoading(true);

    const { start, end } = selectedPeriod;
    
    try {
      // Chamada para get_daily_metrics
      const { data: metricsData, error } = await supabase.rpc('get_daily_metrics', {
        p_salon_id: currentSalon.id,
        p_date_from: start,
        p_date_to: end
      });

      if (error) {
        console.error('Erro ao buscar métricas diárias:', error);
        setChartData([]);
        setDashboardData(null);
        return;
      }

      if (metricsData && Array.isArray(metricsData)) {
        // Alimentar o gráfico com os dados reais
        setChartData(metricsData);

        // Calcular os totais dos cards
        const summary = metricsData.reduce((acc, metric) => {
          acc.total_gross_revenue += metric.faturamento_total || 0;
          acc.total_net_profit += metric.lucro_liquido || 0;
          acc.total_services_revenue += metric.atendimentos || 0;
          acc.total_products_revenue += metric.produtos || 0;
          return acc;
        }, { 
          total_gross_revenue: 0, 
          total_net_profit: 0, 
          total_services_revenue: 0, 
          total_products_revenue: 0 
        });

        setDashboardData({ dashboard: { summary } });
      } else {
        console.log('Nenhum dado retornado da função get_daily_metrics');
        setChartData([]);
        setDashboardData(null);
      }
    } catch (error) {
      console.error('Erro inesperado ao carregar dados:', error);
      setChartData([]);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [currentSalon, selectedPeriod]);

  // Carregar dados quando o componente monta ou quando o período muda
  useEffect(() => {
    if (currentSalon) {
      loadData();
    }
  }, [currentSalon, selectedPeriod, loadData]);


  const renderResumoTab = () => {
    const summary = dashboardData?.dashboard.summary;
    
    const isPeriodInvalid = () => {
        const start = new Date(selectedPeriod.start);
        const end = new Date(selectedPeriod.end);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 2;
    }

    if (loading) {
        return <div className="p-8 text-center">Carregando...</div>;
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
                <p className="text-lg font-bold text-gray-900">{summary?.total_services_revenue || 0}</p>
          </div>
            <div onClick={() => setActiveMetric('produtos')} className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${activeMetric === 'produtos' ? 'bg-green-100/80 border-green-400 ring-2 ring-green-200' : 'bg-white/80 border-gray-200'} border backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02]`}>
                <h3 className="text-xs font-semibold uppercase text-gray-600 mb-1">Produtos</h3>
                <p className="text-lg font-bold text-gray-900">{summary?.total_products_revenue || 0}</p>
          </div>
        </div>

        {isPeriodInvalid() ? (
            <div className="text-center text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-xl p-8 h-[350px] flex items-center justify-center">
                Selecione um período de pelo menos 2 dias para ver a evolução.
            </div>
        ) : (
            <ResumoChart data={chartData} metricKey={activeMetric} isMobile={isMobile} />
        )}
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
                    className={`flex items-center justify-center space-x-2 px-3 py-3 text-sm rounded-lg font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
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
                    className={`flex items-center justify-center space-x-2 px-3 py-3 text-sm rounded-lg font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
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
                    className={`flex items-center justify-center space-x-2 px-3 py-3 text-sm rounded-lg font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
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
                    className={`flex items-center justify-center space-x-2 px-3 py-3 text-sm rounded-lg font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
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
                      Período: {`${new Date(selectedPeriod.start).toLocaleDateString()} - ${new Date(selectedPeriod.end).toLocaleDateString()}`}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="tab-content">
              {activeTab === 'resumo' && renderResumoTab()}
              {activeTab === 'comandas' && <ComandasTab comandas={comandasData} isLoading={loading} />}
              {activeTab === 'produtos' && <ProdutosTab vendas={produtosData} isLoading={loading} />}
              {activeTab === 'clientes' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
                    <h2 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-sm' : 'text-lg'}`}>Melhores Clientes</h2>
                    
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">📊</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Funcionalidade em Desenvolvimento</h3>
                      <p className="text-gray-500 mb-4">A aba de melhores clientes será implementada em breve</p>
                    </div>
                  </div>
                </div>
              )}
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