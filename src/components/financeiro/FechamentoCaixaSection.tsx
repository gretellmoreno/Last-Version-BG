import React, { useState, useEffect } from 'react';
import { DollarSign, Filter, Search, Eye, Calculator, User, TrendingUp } from 'lucide-react';

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
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header da seção responsivo */}
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-4' : ''}`}>
        <div>
          <h2 className={`font-bold text-gray-900 flex items-center space-x-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            <DollarSign size={isMobile ? 20 : 24} className="text-indigo-600" />
            <span>Caixa por Profissional</span>
          </h2>
          <p className={`text-gray-600 mt-1 ${isMobile ? 'text-sm' : ''}`}>
            Gerencie fechamentos e histórico financeiro
          </p>
        </div>
        <button
          onClick={onHistoricoModalOpen}
          className={`flex items-center space-x-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'}`}
        >
          <Eye size={16} />
          <span>Ver Histórico</span>
        </button>
      </div>

      {/* Filtros responsivos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={16} className="text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
        </div>
        
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          {/* Profissional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profissional
            </label>
            <select
              value={selectedProfessional}
              onChange={(e) => onProfessionalChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              style={{ fontSize: isMobile ? '16px' : '14px' }}
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
              style={{ fontSize: isMobile ? '16px' : '14px' }}
            >
              <span className="text-gray-700">{formatPeriodDisplay()}</span>
            </button>
          </div>

          {/* Botão Buscar */}
          <div className={isMobile ? '' : 'flex items-end'}>
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

      {/* Resultado do fechamento responsivo */}
      {hasSearched && selectedProfessional ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header do fechamento */}
          <div className={`border-b border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-semibold text-gray-900 flex items-center space-x-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  <DollarSign size={isMobile ? 18 : 20} className="text-indigo-600" />
                  <span>{isMobile ? 'Fechamento' : `Fechamento de Caixa: ${getProfessionalName(selectedProfessional)}`}</span>
                </h3>
                {isMobile && (
                  <p className="text-sm text-gray-600 mt-1">{getProfessionalName(selectedProfessional)}</p>
                )}
                <p className={`text-gray-600 mt-1 ${isMobile ? 'text-xs' : ''}`}>
                  Fechamentos do período selecionado
                </p>
              </div>
            </div>
          </div>

          {/* Lista de serviços responsiva */}
          <div className={isMobile ? 'p-4' : 'p-6'}>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Calculator size={16} className="text-gray-500" />
              <span>Serviços do Período</span>
            </h4>

            {isMobile ? (
              /* Cards Mobile */
              <div className="space-y-3">
                {servicosParaFechamento.map((servico, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{servico.cliente}</p>
                          <p className="text-xs text-gray-500">{servico.data}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">
                          R$ {servico.valorLiquido.toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-xs text-gray-500">Líquido</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Serviço:</span>
                        <span className="font-medium">{servico.servico.replace('[Exemplo] ', '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Bruto:</span>
                        <span className="font-medium">R$ {servico.valorBruto.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxa:</span>
                        <span className="font-medium text-red-600">-R$ {Math.abs(servico.taxa).toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comissão:</span>
                        <span className="font-medium">{servico.comissao}%</span>
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
            )}

            {/* Total responsivo */}
            <div className={`mt-6 flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 ${isMobile ? 'flex-col space-y-2' : ''}`}>
              <span className={`font-semibold text-green-800 ${isMobile ? 'text-base' : 'text-lg'}`}>
                Total Líquido dos Fechamentos:
              </span>
              <span className={`font-bold text-green-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                R$ {totalLiquidoFechamento.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Botão Fechar Caixa responsivo */}
            <div className="mt-6 text-center">
              <button
                onClick={onFechamentoCaixaModalOpen}
                className={`bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto ${isMobile ? 'px-6 py-2.5 text-sm' : 'px-8 py-3'}`}
              >
                <Calculator size={16} />
                <span>Fechar Caixa</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 text-center ${isMobile ? 'p-8' : 'p-12'}`}>
          <Calculator size={isMobile ? 40 : 48} className="mx-auto text-gray-400 mb-4" />
          <h3 className={`font-semibold text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            Selecione os filtros e clique em Buscar
          </h3>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
            Escolha um profissional e período para visualizar os serviços disponíveis para fechamento.
          </p>
        </div>
      )}
    </div>
  );
}