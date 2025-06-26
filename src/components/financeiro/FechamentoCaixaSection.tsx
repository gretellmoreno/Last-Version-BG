import React from 'react';
import { DollarSign, Filter, Search, Eye, Calculator } from 'lucide-react';

interface ServicoFechamento {
  data: string;
  cliente: string;
  servico: string;
  valorBruto: number;
  taxa: number;
  comissao: number;
  valorLiquido: number;
}

interface FechamentoCaixaSectionProps {
  selectedProfessional: string;
  periodFilter: { start: string; end: string };
  hasSearched: boolean;
  canSearch: boolean;
  servicosParaFechamento: ServicoFechamento[];
  totalLiquidoFechamento: number;
  profissionais: any[];
  onProfessionalChange: (professionalId: string) => void;
  onPeriodModalOpen: () => void;
  onBuscar: () => void;
  onHistoricoModalOpen: () => void;
  onFechamentoCaixaModalOpen: () => void;
  formatPeriodDisplay: () => string;
  getProfessionalName: (professionalId: string) => string;
}

export default function FechamentoCaixaSection({
  selectedProfessional,
  periodFilter,
  hasSearched,
  canSearch,
  servicosParaFechamento,
  totalLiquidoFechamento,
  profissionais,
  onProfessionalChange,
  onPeriodModalOpen,
  onBuscar,
  onHistoricoModalOpen,
  onFechamentoCaixaModalOpen,
  formatPeriodDisplay,
  getProfessionalName
}: FechamentoCaixaSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <DollarSign size={24} className="text-indigo-600" />
            <span>Caixa por Profissional</span>
          </h2>
          <p className="text-gray-600 mt-1">Gerencie fechamentos e histórico financeiro</p>
        </div>
        <button
          onClick={onHistoricoModalOpen}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          <Eye size={16} />
          <span>Ver Histórico</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={16} className="text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profissional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profissional
            </label>
            <select
              value={selectedProfessional}
              onChange={(e) => onProfessionalChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecionar profissional</option>
              {profissionais.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name.replace('[Exemplo] ', '')}
                </option>
              ))}
            </select>
          </div>

          {/* Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <button
              onClick={onPeriodModalOpen}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-left bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">{formatPeriodDisplay()}</span>
            </button>
          </div>

          {/* Botão Buscar */}
          <div className="flex items-end">
            <button 
              onClick={onBuscar}
              disabled={!canSearch}
              className={`
                w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2
                ${canSearch
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <Search size={16} />
              <span>Buscar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resultado do fechamento */}
      {hasSearched && selectedProfessional ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header do fechamento */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <DollarSign size={20} className="text-indigo-600" />
                  <span>Fechamento de Caixa: {getProfessionalName(selectedProfessional)}</span>
                </h3>
                <p className="text-gray-600 mt-1">Fechamentos do período selecionado</p>
              </div>
            </div>
          </div>

          {/* Lista de serviços */}
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Calculator size={16} className="text-gray-500" />
              <span>Serviços do Período</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serviço
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Bruto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Comissão
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Líquido
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {servicosParaFechamento.map((servico, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {servico.data}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {servico.cliente}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {servico.servico.replace('[Exemplo] ', '')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        R$ {servico.valorBruto.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                        -R$ {Math.abs(servico.taxa).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {servico.comissao}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                        R$ {servico.valorLiquido.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <span className="text-lg font-semibold text-green-800">
                Total Líquido dos Fechamentos:
              </span>
              <span className="text-xl font-bold text-green-600">
                R$ {totalLiquidoFechamento.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Botão Fechar Caixa */}
            <div className="mt-6 text-center">
              <button
                onClick={onFechamentoCaixaModalOpen}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Calculator size={16} />
                <span>Fechar Caixa</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calculator size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecione os filtros e clique em Buscar</h3>
          <p className="text-gray-600">
            Escolha um profissional e período para visualizar os serviços disponíveis para fechamento.
          </p>
        </div>
      )}
    </div>
  );
}