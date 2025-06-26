import React, { useState } from 'react';
import { Calendar, DollarSign, FileText, Calculator, TrendingUp } from 'lucide-react';
import PeriodFilterModal from '../PeriodFilterModal';

interface HistoricoSectionProps {
  currentDate: string;
}

export default function HistoricoSection({ currentDate }: HistoricoSectionProps) {
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumo' | 'atendimentos' | 'produtos'>('resumo');
  const [periodFilter, setPeriodFilter] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Dados mock para atendimentos
  const atendimentos = [
    {
      id: '1',
      dataHora: '25/06/2025',
      profissional: '[Exemplo] Carmen',
      cliente: '',
      formaPagamento: '[Exemplo] Cartão de débito',
      valorTotal: 25.00,
      lucroSalao: 10.00,
      lucroProfissional: 13.75
    },
    {
      id: '2',
      dataHora: '25/06/2025',
      profissional: '[Exemplo] Carmen',
      cliente: '',
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
      cliente: '',
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
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Histórico de Atendimentos ({atendimentos.length})
            </h3>
            
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
          </div>
        );

      case 'produtos':
        return (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Histórico de Produtos ({produtos.length})
            </h3>
            
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
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-6">Resumo do Período: {formatPeriodDisplay()}</h3>
              
              {/* Cards de resumo COMPACTOS sem ícones - mais espaço para conteúdo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total em Atendimentos - Hover com glow indigo */}
                <div className="group bg-white p-5 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100 cursor-pointer transform hover:-translate-y-1">
                  <div className="flex items-center justify-end mb-3">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full group-hover:bg-indigo-600 group-hover:shadow-md group-hover:shadow-indigo-300 transition-all duration-300"></div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                    Total em Atendimentos
                  </h4>
                  <p className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-indigo-900 transition-colors duration-300">R$ 105,00</p>
                  <p className="text-xs text-gray-500 group-hover:text-indigo-500 transition-colors duration-300">Valor total dos atendimentos</p>
                </div>
                
                {/* Total em Produtos - Hover com glow verde */}
                <div className="group bg-white p-5 rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:shadow-green-100 cursor-pointer transform hover:-translate-y-1">
                  <div className="flex items-center justify-end mb-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full group-hover:bg-green-600 group-hover:shadow-md group-hover:shadow-green-300 transition-all duration-300"></div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-green-600 transition-colors duration-300">
                    Total em Produtos
                  </h4>
                  <p className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-green-900 transition-colors duration-300">R$ 0,00</p>
                  <p className="text-xs text-gray-500 group-hover:text-green-500 transition-colors duration-300">Valor total dos produtos vendidos</p>
                </div>
                
                {/* Faturamento Total - Hover com glow azul */}
                <div className="group bg-white p-5 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 cursor-pointer transform hover:-translate-y-1">
                  <div className="flex items-center justify-end mb-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:bg-blue-600 group-hover:shadow-md group-hover:shadow-blue-300 transition-all duration-300"></div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    Faturamento Total
                  </h4>
                  <p className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-900 transition-colors duration-300">R$ 105,00</p>
                  <p className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-300">Soma de serviços e produtos</p>
                </div>
                
                {/* Lucro Líquido - Hover com glow roxo */}
                <div className="group bg-white p-5 rounded-lg border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100 cursor-pointer transform hover:-translate-y-1">
                  <div className="flex items-center justify-end mb-3">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full group-hover:bg-purple-600 group-hover:shadow-md group-hover:shadow-purple-300 transition-all duration-300"></div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-purple-600 transition-colors duration-300">
                    Lucro Líquido
                  </h4>
                  <p className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-purple-900 transition-colors duration-300">R$ 50,00</p>
                  <p className="text-xs text-gray-500 group-hover:text-purple-500 transition-colors duration-300">Margem: 47,62%</p>
                </div>
              </div>
            </div>

            {/* Resumo detalhado moderno - COM TODOS OS DADOS DA IMAGEM */}
            <div className="space-y-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-6 text-lg">Resumo Detalhado</h4>
                
                {/* Serviços Realizados */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                    Serviços Realizados
                  </h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700">Total:</span>
                      <span className="font-semibold text-gray-900">R$ 105,00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700">Lucro do Salão (Serviços)</span>
                      <span className="font-semibold text-gray-900">R$ 50,00</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Lucro dos Profissionais</span>
                      <span className="font-semibold text-gray-900">R$ 49,75</span>
                    </div>
                  </div>
                </div>

                {/* Vendas de Produtos */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Vendas de Produtos
                  </h5>
                  <div className="space-y-3">
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

                {/* Lucro Total (Serviços + Produtos) */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                    Lucro Total (Serviços + Produtos)
                  </h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-300">
                      <span className="text-gray-700">Lucro do Salão (Serviços)</span>
                      <span className="font-semibold text-gray-900">R$ 50,00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-300">
                      <span className="text-gray-700">Lucro sobre Produtos</span>
                      <span className="font-semibold text-gray-900">R$ 0,00</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-t-2 border-gray-400 font-bold text-lg">
                      <span className="text-gray-900">LUCRO TOTAL</span>
                      <span className="text-green-600 text-xl">R$ 50,00</span>
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Relatório Financeiro</h2>
              <p className="text-gray-600 mt-1">{currentDate}</p>
            </div>
            {/* Card de período clicável - ÚNICO */}
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
            >
              <Calendar size={16} />
              <span>Período: {formatPeriodDisplay()}</span>
            </button>
          </div>

          {/* Tabs do relatório */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('resumo')}
                className={`py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'resumo'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Resumo
              </button>
              <button
                onClick={() => setActiveTab('atendimentos')}
                className={`py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'atendimentos'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Atendimentos
              </button>
              <button
                onClick={() => setActiveTab('produtos')}
                className={`py-2 text-sm font-medium border-b-2 transition-colors ${
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