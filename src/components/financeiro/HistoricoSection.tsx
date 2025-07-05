import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, FileText, Calculator, TrendingUp, User, Package, CreditCard } from 'lucide-react';
import PeriodFilterModal from '../PeriodFilterModal';

interface HistoricoSectionProps {
  currentDate: string;
}

export default function HistoricoSection({ currentDate }: HistoricoSectionProps) {
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumo' | 'atendimentos' | 'produtos'>('resumo');
  const [isMobile, setIsMobile] = useState(false);
  const [periodFilter, setPeriodFilter] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dados mock para atendimentos
  const atendimentos = [
    {
      id: '1',
      dataHora: '25/06/2025',
      profissional: '[Exemplo] Carmen',
      cliente: 'João Silva',
      formaPagamento: '[Exemplo] Cartão de débito',
      valorTotal: 25.00,
      lucroSalao: 10.00,
      lucroProfissional: 13.75
    },
    {
      id: '2',
      dataHora: '25/06/2025',
      profissional: '[Exemplo] Carmen',
      cliente: 'Maria Santos',
      formaPagamento: '[Exemplo] Cartão de débito',
      valorTotal: 80.00,
      lucroSalao: 40.00,
      lucroProfissional: 36.00
    }
  ];

  // Dados mock para produtos
  const produtos = [
    {
      id: '1',
      dataHora: '25/06/2025 04:56',
      cliente: 'Ana Costa',
      produto: '[Exemplo] Perfume',
      quantidade: 1,
      formaPagamento: '[Exemplo] Cartão de débito',
      valorTotal: 120.48,
      lucro: 84.33
    }
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const formatPeriodDisplay = () => {
    if (periodFilter.start === periodFilter.end) {
      return `${formatDate(periodFilter.start)}`;
    }
    return `${formatDate(periodFilter.start)} - ${formatDate(periodFilter.end)}`;
  };

  const handlePeriodApply = (startDate: string, endDate: string) => {
    setPeriodFilter({ start: startDate, end: endDate });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'atendimentos':
        return (
          <div className={isMobile ? 'p-4' : 'p-6'}>
            <h3 className="font-semibold text-gray-900 mb-4">
              {isMobile ? 'Atendimentos' : `Histórico de Atendimentos (${atendimentos.length})`}
            </h3>
            
            {isMobile ? (
              /* Cards Mobile */
              <div className="space-y-3">
                {atendimentos.map((atendimento) => (
                  <div key={atendimento.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{atendimento.profissional}</p>
                          <p className="text-xs text-gray-500">{atendimento.dataHora}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">R$ {atendimento.valorTotal.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cliente:</span>
                        <span className="font-medium">{atendimento.cliente || 'Não informado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pagamento:</span>
                        <span className="font-medium text-blue-600">{atendimento.formaPagamento}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lucro Salão:</span>
                        <span className="font-medium text-green-600">R$ {atendimento.lucroSalao.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lucro Profissional:</span>
                        <span className="font-medium text-blue-600">R$ {atendimento.lucroProfissional.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Tabela Desktop */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profissional
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Forma de Pagamento
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lucro Salão
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lucro Profissional
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {atendimentos.map((atendimento) => (
                      <tr key={atendimento.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {atendimento.dataHora}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                          {atendimento.profissional}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {atendimento.cliente || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                          {atendimento.formaPagamento}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          R$ {atendimento.valorTotal.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                          R$ {atendimento.lucroSalao.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                          R$ {atendimento.lucroProfissional.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'produtos':
        return (
          <div className={isMobile ? 'p-4' : 'p-6'}>
            <h3 className="font-semibold text-gray-900 mb-4">
              {isMobile ? 'Produtos' : `Histórico de Produtos (${produtos.length})`}
            </h3>
            
            {isMobile ? (
              /* Cards Mobile */
              <div className="space-y-3">
                {produtos.map((produto) => (
                  <div key={produto.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Package size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{produto.produto}</p>
                          <p className="text-xs text-gray-500">{produto.dataHora}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">R$ {produto.valorTotal.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cliente:</span>
                        <span className="font-medium">{produto.cliente || 'Não informado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantidade:</span>
                        <span className="font-medium">{produto.quantidade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pagamento:</span>
                        <span className="font-medium text-blue-600">{produto.formaPagamento}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lucro:</span>
                        <span className="font-medium text-green-600">R$ {produto.lucro.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Tabela Desktop */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Forma de Pagamento
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lucro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {produtos.map((produto) => (
                      <tr key={produto.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {produto.dataHora}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {produto.cliente || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                          {produto.produto}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {produto.quantidade}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                          {produto.formaPagamento}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          R$ {produto.valorTotal.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                          R$ {produto.lucro.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className={isMobile ? 'p-4' : 'p-6'}>
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-6">
                {isMobile ? 'Resumo' : `Resumo do Período: ${formatPeriodDisplay()}`}
              </h3>
              
              {/* Cards de resumo responsivos */}
              <div className={`grid gap-4 mb-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                {/* Total em Atendimentos */}
                <div className="group bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${isMobile ? 'p-2' : 'p-1.5'} bg-indigo-100 rounded-lg`}>
                      <DollarSign size={isMobile ? 18 : 16} className="text-indigo-600" />
                    </div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Total em Atendimentos
                  </h4>
                  <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>R$ 105,00</p>
                  <p className="text-xs text-gray-500">Valor total dos atendimentos</p>
                </div>
                
                {/* Total em Produtos */}
                <div className="group bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:shadow-green-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${isMobile ? 'p-2' : 'p-1.5'} bg-green-100 rounded-lg`}>
                      <Package size={isMobile ? 18 : 16} className="text-green-600" />
                    </div>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Total em Produtos
                  </h4>
                  <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>R$ 0,00</p>
                  <p className="text-xs text-gray-500">Valor total dos produtos vendidos</p>
                </div>
                
                {/* Faturamento Total */}
                <div className="group bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${isMobile ? 'p-2' : 'p-1.5'} bg-blue-100 rounded-lg`}>
                      <Calculator size={isMobile ? 18 : 16} className="text-blue-600" />
                    </div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Faturamento Total
                  </h4>
                  <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>R$ 105,00</p>
                  <p className="text-xs text-gray-500">Soma de serviços e produtos</p>
                </div>
                
                {/* Lucro Líquido */}
                <div className="group bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${isMobile ? 'p-2' : 'p-1.5'} bg-purple-100 rounded-lg`}>
                      <TrendingUp size={isMobile ? 18 : 16} className="text-purple-600" />
                    </div>
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Lucro Líquido
                  </h4>
                  <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>R$ 50,00</p>
                  <p className="text-xs text-gray-500">Margem: 47,62%</p>
                </div>
              </div>
            </div>

            {/* Resumo detalhado responsivo */}
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Resumo Detalhado</h4>
                
                {/* Cards de resumo detalhado */}
                <div className={`space-y-4 ${isMobile ? '' : 'space-y-6'}`}>
                  {/* Serviços Realizados */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                      Serviços Realizados
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-700">Total:</span>
                        <span className="font-semibold text-gray-900">R$ 105,00</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-700">Lucro do Salão</span>
                        <span className="font-semibold text-gray-900">R$ 50,00</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700">Lucro dos Profissionais</span>
                        <span className="font-semibold text-gray-900">R$ 49,75</span>
                      </div>
                    </div>
                  </div>

                  {/* Vendas de Produtos */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Vendas de Produtos
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-700">Total:</span>
                        <span className="font-semibold text-gray-900">R$ 0,00</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700">Lucro sobre Produtos</span>
                        <span className="font-semibold text-gray-900">R$ 0,00</span>
                      </div>
                    </div>
                  </div>

                  {/* Lucro Total */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                      Lucro Total
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-300">
                        <span className="text-gray-700">Lucro do Salão</span>
                        <span className="font-semibold text-gray-900">R$ 50,00</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-300">
                        <span className="text-gray-700">Lucro sobre Produtos</span>
                        <span className="font-semibold text-gray-900">R$ 0,00</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-t-2 border-gray-400 font-bold">
                        <span className="text-gray-900">LUCRO TOTAL</span>
                        <span className="text-green-600 text-lg">R$ 50,00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Relatório Financeiro */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-gray-200`}>
          <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : ''}`}>
            <div>
              <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Relatório Financeiro
              </h2>
              <p className={`text-gray-600 mt-1 ${isMobile ? 'text-sm' : ''}`}>{currentDate}</p>
            </div>
            {/* Botão de período */}
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className={`flex items-center space-x-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300 ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'}`}
            >
              <Calendar size={isMobile ? 14 : 16} />
              <span>{isMobile ? formatPeriodDisplay() : `Período: ${formatPeriodDisplay()}`}</span>
            </button>
          </div>

          {/* Tabs responsivos */}
          <div className="mt-6">
            <nav className={`flex ${isMobile ? 'space-x-4' : 'space-x-8'}`}>
              <button
                onClick={() => setActiveTab('resumo')}
                className={`py-2 font-medium border-b-2 transition-colors ${isMobile ? 'text-sm' : 'text-sm'} ${
                  activeTab === 'resumo'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Resumo
              </button>
              <button
                onClick={() => setActiveTab('atendimentos')}
                className={`py-2 font-medium border-b-2 transition-colors ${isMobile ? 'text-sm' : 'text-sm'} ${
                  activeTab === 'atendimentos'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Atendimentos
              </button>
              <button
                onClick={() => setActiveTab('produtos')}
                className={`py-2 font-medium border-b-2 transition-colors ${isMobile ? 'text-sm' : 'text-sm'} ${
                  activeTab === 'produtos'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Produtos
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo das abas */}
        {renderTabContent()}
      </div>

      {/* Modal de seleção de período */}
      <PeriodFilterModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onApply={handlePeriodApply}
        currentPeriod={periodFilter}
      />
    </div>
  );
}