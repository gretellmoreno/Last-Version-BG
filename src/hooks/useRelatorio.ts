import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';

interface RelatorioPeriod {
  start: string;
  end: string;
}

interface DailyEvolutionData {
  date: string;
  services_revenue: number;
  services_profit: number;
  services_count: number;
  products_revenue: number;
  products_profit: number;
  products_items_sold: number;
}

interface ReportTotals {
  total_revenue: number;
  total_profit: number;
}

interface DailyEvolutionReport {
  totals: ReportTotals;
  daily_report: DailyEvolutionData[];
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
  reportData: DailyEvolutionReport | null;
  atendimentos: Atendimento[];
  produtos: VendaProduto[];
  clientes: ClientesPerformanceReport | null;
}

interface UseRelatorioReturn {
  data: RelatorioData;
  loading: boolean;
  error: string | null;
  loadReportData: (period: RelatorioPeriod) => Promise<void>;
  loadAtendimentosData: (period: RelatorioPeriod) => Promise<void>;
  loadProdutosData: (period: RelatorioPeriod) => Promise<void>;
  loadClientesData: (period: RelatorioPeriod) => Promise<void>;
  loadAllData: (period: RelatorioPeriod) => Promise<void>;
}

export const useRelatorio = (): UseRelatorioReturn => {
  const { currentSalon } = useApp();
  const [data, setData] = useState<RelatorioData>({
    reportData: null,
    atendimentos: [],
    produtos: [],
    clientes: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReportData = useCallback(async (period: RelatorioPeriod) => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: evolutionResponse, error: evolutionError } = await supabase.rpc('get_daily_evolution_report', {
        p_salon_id: currentSalon.id,
        p_date_from: period.start,
        p_date_to: period.end
      });

      if (evolutionError) {
        console.error('Erro ao buscar relatório de evolução diária:', evolutionError);
        setError('Erro ao carregar relatório de evolução diária');
      } else if (evolutionResponse && evolutionResponse.data) {
        setData(prev => ({
          ...prev,
          reportData: evolutionResponse.data
        }));
      } else {
        console.log('Nenhum dado retornado da função get_daily_evolution_report');
        setData(prev => ({
          ...prev,
          reportData: null
        }));
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar relatório de evolução:', err);
      setError('Erro inesperado ao carregar relatório de evolução');
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
      setError('Erro inesperado ao carregar dados');
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
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [currentSalon]);

  const loadClientesData = useCallback(async (period: RelatorioPeriod) => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: clientsResponse, error: clientsError } = await supabase.rpc('get_clients_performance_report', {
        p_salon_id: currentSalon.id,
        p_date_from: period.start,
        p_date_to: period.end
      });

      if (clientsError) {
        console.error('Erro ao buscar relatório de clientes:', clientsError);
        setError('Erro ao carregar dados de clientes');
      } else {
        setData(prev => ({
          ...prev,
          clientes: clientsResponse
        }));
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar clientes:', err);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [currentSalon]);

  const loadAllData = useCallback(async (period: RelatorioPeriod) => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);

    try {
      const [evolutionResponse, appointmentsResponse, productsResponse, clientsResponse] = await Promise.all([
        supabase.rpc('get_daily_evolution_report', {
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

      setData({
        reportData: evolutionResponse.data?.data || null,
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
    loadReportData,
    loadAtendimentosData,
    loadProdutosData,
    loadClientesData,
    loadAllData
  };
}; 