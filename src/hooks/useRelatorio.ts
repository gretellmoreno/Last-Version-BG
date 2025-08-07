import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';

interface RelatorioPeriod {
  start: string;
  end: string;
}

interface FinancialDashboard {
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

interface DailyMetric {
  date: string;
  atendimentos: number;
  produtos: number;
  faturamento_total: number;
  lucro_liquido: number;
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
  client_id: string;
  frequency: string;
  client_name: string;
  total_visits: number;
  total_revenue: number;
  rank_by_visits: number;
  rank_by_revenue: number;
  rank_by_frequency: number;
}

interface ClientesPerformanceReport {
  success: boolean;
  report: {
    kpis: {
      new_clients_in_period: number;
      total_clients_in_period: number;
    };
    rankings: {
      by_visits: ClienteRanking[];
      by_revenue: ClienteRanking[];
      by_frequency: ClienteRanking[];
    };
  };
}

interface RelatorioData {
  dashboard: FinancialDashboard | null;
  dailyMetrics: DailyMetric[];
  atendimentos: Atendimento[];
  produtos: VendaProduto[];
  clientes: ClientesPerformanceReport | null;
}

interface UseRelatorioReturn {
  data: RelatorioData;
  loading: boolean;
  error: string | null;
  loadDashboardData: (period: RelatorioPeriod) => Promise<void>;
  loadAtendimentosData: (period: RelatorioPeriod) => Promise<void>;
  loadProdutosData: (period: RelatorioPeriod) => Promise<void>;
  loadClientesData: (period: RelatorioPeriod) => Promise<void>;
  loadDailyMetrics: (period: RelatorioPeriod) => Promise<void>;
  loadAllData: (period: RelatorioPeriod) => Promise<void>;
}

export const useRelatorio = (): UseRelatorioReturn => {
  const { currentSalon } = useApp();
  const [data, setData] = useState<RelatorioData>({
    dashboard: null,
    dailyMetrics: [],
    atendimentos: [],
    produtos: [],
    clientes: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async (period: RelatorioPeriod) => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: dashboardResponse, error: dashboardError } = await supabase.rpc('get_financial_dashboard', {
        p_salon_id: currentSalon.id,
        p_date_from: period.start,
        p_date_to: period.end
      });

      if (dashboardError) {
        console.error('Erro ao buscar dashboard financeiro:', dashboardError);
        setError('Erro ao carregar dados do dashboard');
      } else {
        setData(prev => ({
          ...prev,
          dashboard: dashboardResponse
        }));
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar dashboard:', err);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [currentSalon]);

  const loadDailyMetrics = useCallback(async (period: RelatorioPeriod) => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: metricsResponse, error: metricsError } = await supabase.rpc('get_daily_metrics', {
        p_salon_id: currentSalon.id,
        p_date_from: period.start,
        p_date_to: period.end
      });

      if (metricsError) {
        console.error('Erro ao buscar métricas diárias:', metricsError);
        setError('Erro ao carregar métricas diárias');
      } else if (metricsResponse && metricsResponse.metrics && Array.isArray(metricsResponse.metrics)) {
        setData(prev => ({
          ...prev,
          dailyMetrics: metricsResponse.metrics
        }));
      } else {
        console.log('Nenhum dado retornado da função get_daily_metrics');
        setData(prev => ({
          ...prev,
          dailyMetrics: []
        }));
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar métricas:', err);
      setError('Erro inesperado ao carregar métricas');
    } finally {
      setLoading(false);
    }
  }, [currentSalon]);

  const loadAtendimentosData = useCallback(async (period: RelatorioPeriod) => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: appointmentsData, error: appointmentsError } = await supabase.rpc('get_financial_appointments', {
        p_salon_id: currentSalon.id,
        p_date_from: period.start,
        p_date_to: period.end
      });

      if (appointmentsError) {
        console.error('Erro ao buscar atendimentos:', appointmentsError);
        setError('Erro ao carregar dados de atendimentos');
      } else {
        setData(prev => ({
          ...prev,
          atendimentos: appointmentsData || []
        }));
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar atendimentos:', err);
      setError('Erro inesperado ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  }, [currentSalon]);

  const loadProdutosData = useCallback(async (period: RelatorioPeriod) => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: productsData, error: productsError } = await supabase.rpc('get_financial_product_sales', {
        p_salon_id: currentSalon.id,
        p_date_from: period.start,
        p_date_to: period.end
      });

      if (productsError) {
        console.error('Erro ao buscar vendas de produtos:', productsError);
        setError('Erro ao carregar dados de produtos');
      } else {
        setData(prev => ({
          ...prev,
          produtos: productsData || []
        }));
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar produtos:', err);
      setError('Erro inesperado ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [currentSalon]);

  const loadClientesData = useCallback(async (period: RelatorioPeriod) => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: clientsData, error: clientsError } = await supabase.rpc('get_clients_performance_report', {
        p_salon_id: currentSalon.id,
        p_date_from: period.start,
        p_date_to: period.end
      });

      if (clientsError) {
        console.error('Erro ao buscar performance dos clientes:', clientsError);
        setError('Erro ao carregar dados de clientes');
      } else {
        setData(prev => ({
          ...prev,
          clientes: clientsData
        }));
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar clientes:', err);
      setError('Erro inesperado ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [currentSalon]);

  const loadAllData = useCallback(async (period: RelatorioPeriod) => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);

    try {
      // Carregar todos os dados em paralelo
      const [
        dashboardResponse,
        metricsResponse,
        appointmentsResponse,
        productsResponse,
        clientsResponse
      ] = await Promise.all([
        supabase.rpc('get_financial_dashboard', {
          p_salon_id: currentSalon.id,
          p_date_from: period.start,
          p_date_to: period.end
        }),
        supabase.rpc('get_daily_metrics', {
          p_salon_id: currentSalon.id,
          p_date_from: period.start,
          p_date_to: period.end
        }),
        supabase.rpc('get_financial_appointments', {
          p_salon_id: currentSalon.id,
          p_date_from: period.start,
          p_date_to: period.end
        }),
        supabase.rpc('get_financial_product_sales', {
          p_salon_id: currentSalon.id,
          p_date_from: period.start,
          p_date_to: period.end
        }),
        supabase.rpc('get_clients_performance_report', {
          p_salon_id: currentSalon.id,
          p_date_from: period.start,
          p_date_to: period.end
        })
      ]);

      // Verificar erros
      const errors = [
        dashboardResponse.error,
        metricsResponse.error,
        appointmentsResponse.error,
        productsResponse.error,
        clientsResponse.error
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('Erros ao carregar dados:', errors);
        setError('Erro ao carregar alguns dados');
      }

      // Atualizar estado com todos os dados
      setData({
        dashboard: dashboardResponse.data,
        dailyMetrics: metricsResponse.data?.metrics || [],
        atendimentos: appointmentsResponse.data || [],
        produtos: productsResponse.data || [],
        clientes: clientsResponse.data
      });

    } catch (err) {
      console.error('Erro inesperado ao carregar todos os dados:', err);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [currentSalon]);

  return {
    data,
    loading,
    error,
    loadDashboardData,
    loadAtendimentosData,
    loadProdutosData,
    loadClientesData,
    loadDailyMetrics,
    loadAllData,
  };
}; 