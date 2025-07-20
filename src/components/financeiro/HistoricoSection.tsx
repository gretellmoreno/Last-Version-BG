import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, CreditCard, Wallet, Building2, Receipt, Gift, CreditCard as CreditCardIcon } from 'lucide-react';
import { formatDateForDisplay } from '../../utils/dateUtils';
import PeriodFilterModal from '../PeriodFilterModal';
import { useApp } from '../../contexts/AppContext';
import { paymentMethodService } from '../../lib/supabaseService';

interface HistoricoData {
  data: string;
  valorBruto: number;
  valorLiquido: number;
  taxas: number;
  comissoes: number;
  profissional: string;
  metodoPagamento: {
    id: string;
    nome: string;
  };
}

interface PaymentMethodSummary {
  id: string;
  name: string;
  total: number;
  percentage: number;
}

interface HistoricoSectionProps {
  data?: HistoricoData[];
  onPeriodChange: (startDate: string, endDate: string) => void;
  currentPeriod: { start: string; end: string };
}

export default function HistoricoSection({ data = [], onPeriodChange, currentPeriod }: HistoricoSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>([]);
  const { currentSalon } = useApp();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!currentSalon?.id) return;
      
      try {
        const response = await paymentMethodService.list(currentSalon.id);
        if (response.data) {
          // Calcular totais e porcentagens
          const totalReceita = data.reduce((acc, item) => acc + item.valorBruto, 0);
          
          // Agrupar valores por método de pagamento
          const methodTotals = data.reduce((acc, item) => {
            const methodId = item.metodoPagamento.id;
            if (!acc[methodId]) {
              acc[methodId] = 0;
            }
            acc[methodId] += item.valorBruto;
            return acc;
          }, {} as Record<string, number>);

          const methodSummaries = response.data.map(method => ({
            id: method.id,
            name: method.name,
            total: methodTotals[method.id] || 0,
            percentage: totalReceita > 0 ? ((methodTotals[method.id] || 0) / totalReceita) * 100 : 0
          }));
          
          setPaymentMethods(methodSummaries);
        }
      } catch (error) {
        console.error('Erro ao carregar métodos de pagamento:', error);
      }
    };

    loadPaymentMethods();
  }, [currentSalon?.id, data]);

  // Calcular totais com valor default para data vazia
  const totais = data.reduce((acc, item) => {
    return {
      valorBruto: acc.valorBruto + (item.valorBruto || 0),
      valorLiquido: acc.valorLiquido + (item.valorLiquido || 0),
      taxas: acc.taxas + (item.taxas || 0),
      comissoes: acc.comissoes + (item.comissoes || 0)
    };
  }, {
    valorBruto: 0,
    valorLiquido: 0,
    taxas: 0,
    comissoes: 0
  });

  // Calcular lucro
  const lucro = totais.valorLiquido - totais.comissoes;

  const getPaymentIcon = (methodName: string) => {
    const name = methodName.toLowerCase();
    if (name.includes('dinheiro')) return <Wallet className="h-5 w-5" />;
    if (name.includes('pix')) return <Building2 className="h-5 w-5" />;
    if (name.includes('crédito')) return <CreditCardIcon className="h-5 w-5" />;
    if (name.includes('débito')) return <CreditCard className="h-5 w-5" />;
    if (name.includes('cheque')) return <Receipt className="h-5 w-5" />;
    if (name.includes('cortesia')) return <Gift className="h-5 w-5" />;
    return <CreditCard className="h-5 w-5" />;
  };

        return (
    <div className="space-y-6">
      {/* Botão de Período */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors w-full"
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
              <h2 className="text-base font-semibold text-gray-900">Período</h2>
              <p className="text-sm text-gray-500">
                {formatDateForDisplay(currentPeriod.start)} - {formatDateForDisplay(currentPeriod.end)}
              </p>
                        </div>
                      </div>
        </button>
      </div>

      {/* Modal de Período */}
      <PeriodFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={onPeriodChange}
        currentPeriod={currentPeriod}
      />

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card de Receita */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="text-sm text-gray-600">Receita</h4>
                      </div>
          <p className="text-2xl font-bold text-gray-900">
            R$ {totais.valorBruto.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Desde o mês passado
          </p>
                    </div>
                    
        {/* Card de Comissões */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-sm text-gray-600">Comissões</h4>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            R$ {totais.comissoes.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Desde o mês passado
          </p>
                      </div>

        {/* Card de Lucro */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-600" />
                      </div>
            <h4 className="text-sm text-gray-600">Lucro</h4>
                      </div>
          <p className="text-2xl font-bold text-purple-600">
            R$ {lucro.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Desde o mês passado
          </p>
                      </div>
                    </div>

      {/* Métodos de Pagamento */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              {getPaymentIcon(method.name)}
              <h4 className="text-sm font-medium text-gray-700">{method.name}</h4>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              R$ {method.total.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-gray-500">
              {method.percentage.toFixed(1)}%
            </p>
                  </div>
                ))}
      </div>

      {/* Lista de Transações */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Histórico de Transações</h3>
        </div>
        {data.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Nenhuma transação encontrada para o período selecionado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                      </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Profissional
                      </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Valor Bruto
                      </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Valor Líquido
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateForDisplay(item.data)}
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.profissional}
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      R$ {item.valorBruto.toFixed(2).replace('.', ',')}
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                      R$ {item.valorLiquido.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
    </div>
  );
}