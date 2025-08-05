import React, { useState, useEffect } from 'react';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Users from 'lucide-react/dist/esm/icons/users';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import BarChart2 from 'lucide-react/dist/esm/icons/bar-chart-2';
import List from 'lucide-react/dist/esm/icons/list';
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import Star from 'lucide-react/dist/esm/icons/star';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '../components/Header';
import PeriodFilterModal from '../components/PeriodFilterModal';
import ComandasTab from '../components/financeiro/ComandasTab';
import ProdutosTab from '../components/financeiro/ProdutosTab';
import { supabaseService } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import { getTodayLocal, formatDateForDisplay } from '../utils/dateUtils';
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

function RelatorioContent({ onToggleMobileSidebar }: RelatorioProps) {
  const { currentSalon } = useApp();
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('resumo');
  const [loading, setLoading] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState('receita');
  
  // Estados de dados
  const [dashboardData, setDashboardData] = useState<FinancialSummary | null>(null);
  const [comandas, setComandas] = useState<Atendimento[]>([]);
  const [vendas, setVendas] = useState<VendaProduto[]>([]);
  
  // Estado do período selecionado
  const [selectedPeriod, setSelectedPeriod] = useState({
    start: getTodayLocal(),
    end: getTodayLocal()
  });

  // Estado para dados reais dos melhores clientes
  const [bestClientsData, setBestClientsData] = useState<any[]>([]);
  const [bestClientsLoading, setBestClientsLoading] = useState(false);
  const [bestClientsError, setBestClientsError] = useState<string | null>(null);

  // Dados mock para melhores clientes (fallback)
  const dadosClientes = {
    receita: [
      { posicao: 1, nome: 'Bianca', receita: 70.00, visitas: 8, frequencia: 'Semanal' },
      { posicao: 2, nome: 'Vinicius', receita: 35.00, visitas: 5, frequencia: 'Quinzenal' },
      { posicao: 3, nome: 'Gretell', receita: 35.00, visitas: 4, frequencia: 'Mensal' },
      { posicao: 4, nome: 'Ana Costa', receita: 28.50, visitas: 3, frequencia: 'Esporádica' },
      { posicao: 5, nome: 'João Silva', receita: 25.00, visitas: 2, frequencia: 'Esporádica' },
    ],
    visitas: [
      { posicao: 1, nome: 'Bianca', receita: 70.00, visitas: 8, frequencia: 'Semanal' },
      { posicao: 2, nome: 'Vinicius', receita: 35.00, visitas: 5, frequencia: 'Quinzenal' },
      { posicao: 3, nome: 'Gretell', receita: 35.00, visitas: 4, frequencia: 'Mensal' },
      { posicao: 4, nome: 'Ana Costa', receita: 28.50, visitas: 3, frequencia: 'Esporádica' },
      { posicao: 5, nome: 'João Silva', receita: 25.00, visitas: 2, frequencia: 'Esporádica' },
    ],
    frequencia: [
      { posicao: 1, nome: 'Bianca', receita: 70.00, visitas: 8, frequencia: 'Semanal' },
      { posicao: 2, nome: 'Vinicius', receita: 35.00, visitas: 5, frequencia: 'Quinzenal' },
      { posicao: 3, nome: 'Gretell', receita: 35.00, visitas: 4, frequencia: 'Mensal' },
      { posicao: 4, nome: 'Ana Costa', receita: 28.50, visitas: 3, frequencia: 'Esporádica' },
      { posicao: 5, nome: 'João Silva', receita: 25.00, visitas: 2, frequencia: 'Esporádica' },
    ]
  };

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    if (!currentSalon?.id) return;

    try {
      const response = await supabaseService.finance.getFinancialDashboard({
        salonId: currentSalon.id,
        dateFrom: selectedPeriod.start,
        dateTo: selectedPeriod.end
      });
      
      if (response.error) {
        console.error('Erro ao carregar dashboard:', response.error);
        return;
      }

      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  // Carregar dados dos melhores clientes
  const loadBestClientsData = async () => {
    if (!currentSalon?.id) return;

    setBestClientsLoading(true);
    setBestClientsError(null);

    try {
      console.log('🔍 Carregando melhores clientes para o período:', selectedPeriod.start, 'até', selectedPeriod.end);
      
      const { data, error } = await supabase.rpc('get_clients_performance_report', {
        p_salon_id: currentSalon.id,
        p_date_from: selectedPeriod.start,
        p_date_to: selectedPeriod.end
      });

      if (error) {
        console.error('❌ Erro ao carregar melhores clientes:', error);
        setBestClientsError(error.message);
        return;
      }

      console.log('✅ Dados recebidos da função RPC:', data);
      
      if (data && data.report && data.report.rankings && data.report.rankings.by_revenue) {
        const bestClientsList = data.report.rankings.by_revenue;
        console.log('📊 Lista de melhores clientes:', bestClientsList);
        setBestClientsData(bestClientsList);
      } else {
        console.log('⚠️ Nenhum dado de ranking encontrado');
        setBestClientsData([]);
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar melhores clientes:', error);
      setBestClientsError('Erro inesperado ao carregar dados');
    } finally {
      setBestClientsLoading(false);
    }
  };

  // Carregar dados baseado na tab ativa
  useEffect(() => {
    if (!currentSalon?.id) return;

    setLoading(true);
    
    const loadData = async () => {
      try {
        if (activeTab === 'resumo') {
          await loadDashboardData();
        } else if (activeTab === 'comandas') {
          const response = await supabaseService.finance.getFinancialAppointments({
            salonId: currentSalon.id,
            dateFrom: selectedPeriod.start,
            dateTo: selectedPeriod.end
          });

          if (response.error) {
            console.error('Erro ao carregar comandas:', response.error);
            return;
          }

          if (response.data) {
            setComandas(response.data);
          }
        } else if (activeTab === 'produtos') {
          const response = await supabaseService.finance.getFinancialProductSales({
        salonId: currentSalon.id,
        dateFrom: selectedPeriod.start,
        dateTo: selectedPeriod.end
      });

      if (response.error) {
            console.error('Erro ao carregar vendas:', response.error);
        return;
      }

          if (response.data) {
            setVendas(response.data);
          }
        } else if (activeTab === 'clientes') {
          await loadBestClientsData();
      }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

    loadData();
  }, [currentSalon, selectedPeriod, activeTab]);

  const handleMenuClick = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  const handlePeriodChange = (period: { start: string; end: string }) => {
    setSelectedPeriod(period);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPeriodDisplay = () => {
    return `${formatDateForDisplay(selectedPeriod.start)} - ${formatDateForDisplay(selectedPeriod.end)}`;
  };

  function formatMobilePeriod(start: Date, end: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(start.getDate())}/${pad(start.getMonth() + 1)} - ${pad(end.getDate())}/${pad(end.getMonth() + 1)}`;
  }

  const renderResumoTab = () => {
    const summary = dashboardData;
    const margin = summary ? (summary.dashboard.summary.total_net_profit / summary.dashboard.summary.total_gross_revenue) * 100 : 0;

  return (
      <div className="space-y-3">
        {/* Cards do Topo Compactos em 2 Colunas */}
        <div className="grid gap-2 grid-cols-2">
          {/* Card de Total em Atendimentos */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-2' : 'p-4'}`}>
            <h3 className={`font-medium text-gray-900 uppercase ${isMobile ? 'text-[8px]' : 'text-xs'}`}>Total em Atendimentos</h3>
            <p className={`font-bold text-blue-600 mt-1 ${isMobile ? 'text-sm' : 'text-lg'}`}>
              {loading ? "..." : formatCurrency(summary?.dashboard.summary.total_services_revenue || 0)}
            </p>
            <p className={`text-gray-500 mt-0.5 ${isMobile ? 'text-[8px]' : 'text-xs'}`}>Valor total dos atendimentos</p>
        </div>

          {/* Card de Total em Produtos */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-2' : 'p-4'}`}>
            <h3 className={`font-medium text-gray-900 uppercase ${isMobile ? 'text-[8px]' : 'text-xs'}`}>Total em Produtos</h3>
            <p className={`font-bold text-green-600 mt-1 ${isMobile ? 'text-sm' : 'text-lg'}`}>
              {loading ? "..." : formatCurrency(summary?.dashboard.summary.total_products_revenue || 0)}
            </p>
            <p className={`text-gray-500 mt-0.5 ${isMobile ? 'text-[8px]' : 'text-xs'}`}>Valor total dos produtos vendidos</p>
          </div>

          {/* Card de Faturamento Total */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-2' : 'p-4'}`}>
            <h3 className={`font-medium text-gray-900 uppercase ${isMobile ? 'text-[8px]' : 'text-xs'}`}>Faturamento Total</h3>
            <p className={`font-bold text-yellow-600 mt-1 ${isMobile ? 'text-sm' : 'text-lg'}`}>
              {loading ? "..." : formatCurrency(summary?.dashboard.summary.total_gross_revenue || 0)}
            </p>
            <p className={`text-gray-500 mt-0.5 ${isMobile ? 'text-[8px]' : 'text-xs'}`}>Soma de serviços e produtos</p>
          </div>

          {/* Card de Lucro Líquido */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'p-2' : 'p-4'}`}>
            <h3 className={`font-medium text-gray-900 uppercase ${isMobile ? 'text-[8px]' : 'text-xs'}`}>Lucro Líquido</h3>
            <p className={`font-bold text-purple-600 mt-1 ${isMobile ? 'text-sm' : 'text-lg'}`}>
              {loading ? "..." : formatCurrency(summary?.dashboard.summary.total_net_profit || 0)}
            </p>
            <p className={`text-gray-500 mt-0.5 ${isMobile ? 'text-[8px]' : 'text-xs'}`}>Margem: {margin.toFixed(2)}%</p>
          </div>
        </div>

        {/* Resumo Detalhado Responsivo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
            {isMobile ? (
              // Mobile: Layout vertical super compacto com melhor uso do espaço
              <div className="space-y-2">
                {/* Serviços Realizados */}
                <div className="bg-gray-50 rounded-lg p-2">
                  <h3 className="text-xs font-medium text-gray-900 mb-1.5">Serviços Realizados</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium text-xs">{formatCurrency(summary?.dashboard.summary.total_services_revenue || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-600">Lucro do Salão:</span>
                      <span className="font-medium text-xs">{formatCurrency(summary?.dashboard.summary.salon_profit_from_services || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-600">Lucro dos Profissionais:</span>
                      <span className="font-medium text-xs">{formatCurrency(summary?.dashboard.summary.total_commissions || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Vendas de Produtos */}
                <div className="bg-gray-50 rounded-lg p-2">
                  <h3 className="text-xs font-medium text-gray-900 mb-1.5">Vendas de Produtos</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium text-xs">{formatCurrency(summary?.dashboard.summary.total_products_revenue || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-600">Lucro sobre Produtos:</span>
                      <span className="font-medium text-xs">{formatCurrency(summary?.dashboard.summary.salon_profit_from_products || 0)}</span>
              </div>
                  </div>
                </div>

                {/* Lucro Total */}
                <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                  <h3 className="text-xs font-medium text-gray-900 mb-1.5">Lucro Total</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-600">Lucro do Salão (Serviços):</span>
                      <span className="font-medium text-xs">{formatCurrency(summary?.dashboard.summary.salon_profit_from_services || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-600">Lucro sobre Produtos:</span>
                      <span className="font-medium text-xs">{formatCurrency(summary?.dashboard.summary.salon_profit_from_products || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-green-600 pt-1.5 border-t border-green-200 mt-1.5">
                      <span>LUCRO TOTAL</span>
                      <span>{formatCurrency(summary?.dashboard.summary.total_net_profit || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Desktop: Layout otimizado com melhor uso do espaço
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumo Detalhado</h2>

                {/* Grid para melhor aproveitamento do espaço */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Serviços Realizados */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-900">Serviços Realizados</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{formatCurrency(summary?.dashboard.summary.total_services_revenue || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Lucro do Salão (Serviços):</span>
                        <span className="font-medium">{formatCurrency(summary?.dashboard.summary.salon_profit_from_services || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Lucro dos Profissionais:</span>
                        <span className="font-medium">{formatCurrency(summary?.dashboard.summary.total_commissions || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vendas de Produtos */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-900">Vendas de Produtos</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{formatCurrency(summary?.dashboard.summary.total_products_revenue || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Lucro sobre Produtos:</span>
                        <span className="font-medium">{formatCurrency(summary?.dashboard.summary.salon_profit_from_products || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lucro Total - Ocupando toda a largura */}
                <div className="space-y-4 pt-6 mt-6 border-t border-gray-200">
                  <h3 className="text-base font-medium text-gray-900">Lucro Total (Serviços + Produtos)</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Lucro do Salão (Serviços):</span>
                        <span className="font-medium">{formatCurrency(summary?.dashboard.summary.salon_profit_from_services || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Lucro sobre Produtos:</span>
                        <span className="font-medium">{formatCurrency(summary?.dashboard.summary.salon_profit_from_products || 0)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-base font-semibold text-green-600 pt-4 border-t border-gray-100">
                      <span>LUCRO TOTAL</span>
                      <span>{formatCurrency(summary?.dashboard.summary.total_net_profit || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-screen page-content">
      <Header 
        title="Relatório" 
        onMenuClick={handleMenuClick}
        isMobile={isMobile}
      />
      
      <div className="flex-1 bg-gray-50 overflow-hidden">
        <div className="h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin">
          <div className={`${isMobile ? 'p-2' : 'p-4 md:p-6'}`}>
            {/* Header Compacto */}
            <div className={`mb-3 bg-white rounded-xl shadow-sm border border-gray-200 ${isMobile ? 'p-3' : 'p-6'}`}>
              {/* Tabs de Navegação */}
              <div className="bg-gray-100 p-1 rounded-lg mb-2">
                <div className="grid grid-cols-4 gap-1">
                  <button
                    onClick={() => setActiveTab('resumo')}
                    className={`flex items-center justify-center space-x-1 px-3 py-2 text-sm rounded-md font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                      activeTab === 'resumo'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <BarChart2 size={16} />
                    {!isMobile && <span>Resumo</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab('comandas')}
                    className={`flex items-center justify-center space-x-1 px-3 py-2 text-sm rounded-md font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                      activeTab === 'comandas'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <List size={16} />
                    {!isMobile && <span>Atendimentos</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab('produtos')}
                    className={`flex items-center justify-center space-x-1 px-3 py-2 text-sm rounded-md font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                      activeTab === 'produtos'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <ShoppingBag size={16} />
                    {!isMobile && <span>Produtos</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab('clientes')}
                    className={`flex items-center justify-center space-x-1 px-3 py-2 text-sm rounded-md font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                      activeTab === 'clientes'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <Star size={16} />
                    {!isMobile && <span>Melhores Clientes</span>}
                  </button>
                </div>
              </div>
              {/* Período - agora abaixo das tabs */}
              <div className={`w-full ${isMobile ? 'flex justify-center mb-4' : 'flex justify-end mb-4'}`}>
                <div className={`${isMobile ? 'w-11/12' : 'w-80'}`}>
                  <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className={`inline-flex items-center w-full border border-gray-300 shadow-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isMobile ? 'px-6 py-2.5 text-xs justify-center' : 'px-4 py-2 text-sm h-10'
                    }`}
                    style={!isMobile ? { minHeight: '40px' } : {}}
                  >
                    <Calendar className={`mr-2 ${isMobile ? 'size-4' : 'size-5'}`} />
                    <span className={isMobile ? 'block w-full text-center' : 'block w-full text-left'}>
                      Período: {isMobile
                        ? formatMobilePeriod(
                            typeof selectedPeriod.start === 'string' ? new Date(selectedPeriod.start) : selectedPeriod.start,
                            typeof selectedPeriod.end === 'string' ? new Date(selectedPeriod.end) : selectedPeriod.end
                          )
                        : formatPeriodDisplay()}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Conteúdo das tabs */}
            {activeTab === 'resumo' && renderResumoTab()}
            {activeTab === 'comandas' && <ComandasTab comandas={comandas} isLoading={loading} />}
            {activeTab === 'produtos' && <ProdutosTab vendas={vendas} isLoading={loading} />}
            {activeTab === 'clientes' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
                  <h2 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-sm' : 'text-lg'}`}>Melhores Clientes</h2>
                  
                  {bestClientsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Carregando melhores clientes...</p>
                    </div>
                  ) : bestClientsError ? (
                    <div className="text-center py-8">
                      <div className="text-red-500 mb-4">⚠️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
                      <p className="text-gray-500 mb-4">{bestClientsError}</p>
                      <button 
                        onClick={loadBestClientsData}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  ) : bestClientsData.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">📊</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
                      <p className="text-gray-500 mb-4">Não há dados de clientes para o período selecionado</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop View */}
                      <div className="overflow-x-auto hidden md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Posição
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Receita
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Visitas
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Frequência
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {bestClientsData.map((cliente, index) => (
                              <tr key={cliente.client_id || index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {cliente.rank_by_revenue}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {cliente.client_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                  {formatCurrency(cliente.total_revenue)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {cliente.total_visits}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {cliente.frequency}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile View */}
                      <div className="md:hidden space-y-2">
                        {bestClientsData.map((cliente, index) => (
                          <div key={cliente.client_id || index} className="bg-gray-50 rounded-lg p-2.5">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-green-600">{cliente.rank_by_revenue}º</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-xs">{cliente.client_name}</p>
                                  <p className="text-xs text-gray-500">{cliente.frequency}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-gray-500">Receita</p>
                                <p className="font-medium text-green-600">{formatCurrency(cliente.total_revenue)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-500">Visitas</p>
                                <p className="font-medium text-gray-900">{cliente.total_visits}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Modal de Seleção de Período */}
        {isFilterModalOpen && (
      <PeriodFilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
        onApply={handlePeriodChange}
        currentPeriod={selectedPeriod}
      />
        )}
      </div>
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