import React, { useState, useEffect } from 'react';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { Calculator, DollarSign, User, Receipt } from 'lucide-react';
import { supabaseService } from '../../lib/supabaseService';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'react-hot-toast';
import { CashClosurePreview } from '../../types';
import FechamentoCaixaSuccessModal from './FechamentoCaixaSuccessModal';
import FechamentoCaixaResultModal from './FechamentoCaixaResultModal';

interface ServicoFechamento {
  data: string;
  cliente: string;
  servico: string;
  valorBruto: number;
  taxa: number;
  comissao: number;
  valorLiquido: number;
  appointment_id: string;
}

interface FechamentoCaixaSectionProps {
  selectedProfessional: string;
  periodFilter: {
    start: string;
    end: string;
  };
  hasSearched: boolean;
  canSearch: boolean;
  servicosParaFechamento: ServicoFechamento[];
  totalLiquidoFechamento: number;
  isLoadingPreview: boolean;
  canConfirmClosure: boolean;
  setCanConfirmClosure: (value: boolean) => void;
  profissionais: any[];
  onProfessionalChange: (id: string) => void;
  onPeriodModalOpen: () => void;
  onBuscar: () => void;
  onConfirmarFechamento: () => void;
  onHistoricoModalOpen: () => void;
  formatPeriodDisplay: () => string;
  getProfessionalName: (id: string) => string;
  previewData: CashClosurePreview;
}

export default function FechamentoCaixaSection({
  selectedProfessional,
  periodFilter,
  hasSearched,
  canSearch,
  servicosParaFechamento,
  totalLiquidoFechamento,
  isLoadingPreview,
  canConfirmClosure,
  setCanConfirmClosure,
  profissionais,
  onProfessionalChange,
  onPeriodModalOpen,
  onBuscar,
  onConfirmarFechamento: onConfirmarFechamentoOriginal,
  onHistoricoModalOpen,
  formatPeriodDisplay,
  getProfessionalName,
  previewData
}: FechamentoCaixaSectionProps) {
  // Validar periodFilter para evitar erros de data indefinida
  if (!periodFilter || !periodFilter.start || !periodFilter.end) {
    console.warn('⚠️ FechamentoCaixaSection: periodFilter inválido:', periodFilter);
    return (
      <div className="space-y-6 h-full overflow-y-auto pb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Erro: Período de datas inválido. Por favor, selecione um período válido.</p>
        </div>
      </div>
    );
  }
  const [isMobile, setIsMobile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedAdvanceIds, setSelectedAdvanceIds] = useState<string[]>([]);
  const [isFechamentoRealizado, setIsFechamentoRealizado] = useState(false);
  const [servicosAposFechamento, setServicosAposFechamento] = useState<ServicoFechamento[] | null>(null); // Novo estado
  const { currentSalon } = useApp();

  // Inicializar selectedAdvanceIds com todos os vales quando previewData muda
  useEffect(() => {
    if (previewData?.preview?.advancesList) {
      setSelectedAdvanceIds(previewData.preview.advancesList.map(advance => advance.id));
    }
  }, [previewData]);

  // Monitorar quando dados chegam para mostrar modal no mobile
  useEffect(() => {
    if (isMobile && hasSearched && servicosParaFechamento.length > 0 && !showResultModal) {
      setShowResultModal(true);
    }
  }, [isMobile, hasSearched, servicosParaFechamento.length, showResultModal]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calcular valor líquido total incluindo vales selecionados
  const totalValesDescontados = previewData?.preview?.advancesList
    ?.filter(advance => selectedAdvanceIds.includes(advance.id))
    ?.reduce((total, advance) => total + advance.value, 0) || 0;

  const calculatedTotalLiquido = servicosParaFechamento.reduce((total, servico) => {
    return total + servico.valorLiquido;
  }, 0) - totalValesDescontados;

  const handleBuscar = () => {
    // Resetar estado de fechamento quando fizer nova busca
    setIsFechamentoRealizado(false);
    onBuscar();
    // O modal será mostrado automaticamente via useEffect quando os dados chegarem
  };

  const handleConfirmarFechamento = async () => {
    if (!currentSalon?.id || !selectedProfessional || isProcessing) {
      console.log('❌ FechamentoCaixaSection: Validação falhou:', {
        hasSalon: !!currentSalon?.id,
        hasProfessional: !!selectedProfessional,
        isProcessing
      });
      return;
    }

    // Validar datas antes de prosseguir
    if (!periodFilter?.start || !periodFilter?.end) {
      console.error('❌ FechamentoCaixaSection: Datas inválidas para fechamento:', periodFilter);
      toast.error('Erro: Período de datas inválido. Selecione um período válido.');
      return;
    }

    console.log('🔄 FechamentoCaixaSection: Iniciando processamento...');
    setIsProcessing(true);
    
    // Timeout de segurança para resetar isProcessing após 30 segundos
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ FechamentoCaixaSection: Timeout de segurança - resetando isProcessing');
      setIsProcessing(false);
    }, 30000);
    
    try {
      console.log('✅ FechamentoCaixaSection: Iniciando fechamento de caixa...', {
        salonId: currentSalon.id,
        professionalId: selectedProfessional,
        startDate: periodFilter.start,
        endDate: periodFilter.end,
        advanceIdsToDiscount: selectedAdvanceIds
      });

      // Chamar a RPC finalize_cash_closure com os parâmetros corretos
      const finalizeResult = await supabaseService.finance.finalizeCashClosure({
        salonId: currentSalon.id,
        professionalId: selectedProfessional,
        startDate: periodFilter.start,
        endDate: periodFilter.end,
        advanceIdsToDiscount: selectedAdvanceIds // Array com os IDs dos vales selecionados
      });

      console.log('📡 FechamentoCaixaSection: Resposta da RPC:', finalizeResult);

      if (finalizeResult.error) {
        console.error('❌ FechamentoCaixaSection: Erro na RPC:', finalizeResult.error);
        throw new Error(finalizeResult.error);
      }

      if (!finalizeResult.data) {
        throw new Error('Nenhum dado retornado pelo fechamento');
      }

      const { id: cash_closure_id, resumo, closed_at } = finalizeResult.data;

      console.log('✅ FechamentoCaixaSection: Fechamento realizado com sucesso!', {
        cash_closure_id,
        resumo,
        closed_at,
        valesDescontados: selectedAdvanceIds
      });

      // ✅ Exibir mensagem de sucesso com os totais
      toast.success(`✅ Caixa fechado com sucesso! Total líquido: R$ ${resumo.net_total.toFixed(2)}`);
      
      // ✅ Marcar fechamento como realizado
      setIsFechamentoRealizado(true);
      
      // ✅ Atualizar a tela removendo os serviços já incluídos
      // Chamar callback para limpar os dados da tela
      onConfirmarFechamentoOriginal();
      
      // ✅ Mostrar modal de sucesso
      setShowSuccessModal(true);
      
      // Limpar dados imediatamente após fechar
      setServicosAposFechamento([]); // Limpa serviços
      setCanConfirmClosure(false); // Desabilita o botão após fechar
      
    } catch (error) {
      console.error('❌ FechamentoCaixaSection: Erro ao realizar fechamento:', error);
      toast.error('Erro ao realizar fechamento de caixa');
    } finally {
      console.log('🔄 FechamentoCaixaSection: Finalizando processamento...');
      clearTimeout(timeoutId); // Limpar timeout se chegou aqui
      setIsProcessing(false);
    }
  };

  // Ao fechar o modal de sucesso, manter tela limpa
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setServicosAposFechamento([]); // Garante que a tela fique limpa
    setCanConfirmClosure(false); // Mantém botão desabilitado após busca automática
    onBuscar(); // Dispara nova busca automaticamente
  };

  const handleHistoricoClick = () => {
    setShowSuccessModal(false);
    onHistoricoModalOpen();
  };

  const handleAdvanceToggle = (advanceId: string) => {
    setSelectedAdvanceIds(prev => {
      if (prev.includes(advanceId)) {
        return prev.filter(id => id !== advanceId);
      } else {
        return [...prev, advanceId];
      }
    });
  };

  // Detectar se há conteúdo para rolar e gerenciar scrollbar
  useEffect(() => {
    const container = document.querySelector('.fechamento-caixa-container');
    if (container) {
      const hasScroll = container.scrollHeight > container.clientHeight;
      if (hasScroll) {
        container.classList.add('scrollable');
      } else {
        container.classList.remove('scrollable');
      }

      // Detectar quando o usuário está rolando
      let scrollTimeout: NodeJS.Timeout;
      const handleScroll = () => {
        container.classList.add('scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          container.classList.remove('scrolling');
        }, 1000); // Remove a classe após 1 segundo sem scroll
      };

      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout);
      };
    }
  }, [servicosParaFechamento, previewData]);

  return (
    <div className="fechamento-caixa-container">
      <div className="fechamento-caixa-content space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 sticky top-0 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seleção de Profissional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profissional
            </label>
            <select
              value={selectedProfessional}
              onChange={(e) => onProfessionalChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione um profissional</option>
              {profissionais.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seleção de Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <button
              onClick={onPeriodModalOpen}
              className="w-full text-left rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {formatPeriodDisplay()}
            </button>
          </div>
        </div>

        {/* Botão de Busca */}
        <div className="mt-4">
          <button
            onClick={handleBuscar}
            disabled={!canSearch || isLoadingPreview}
            className={`w-full rounded-md px-4 py-2 text-white font-medium ${
              canSearch && !isLoadingPreview
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoadingPreview ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Resultados - apenas para desktop */}
      {hasSearched && !isMobile && (
        <div className="space-y-6">
          {/* Se não houver serviços após fechamento, mostra mensagem amigável */}
          {((servicosAposFechamento && servicosAposFechamento.length === 0) || servicosParaFechamento.length === 0) ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Nenhum agendamento encontrado para fechamento neste período.
            </div>
          ) : (
            // Resumo
            <div className="bg-white rounded-lg shadow p-4">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4 mb-6">
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <p className="text-xs md:text-sm text-gray-500">Valor Bruto Total</p>
                  </div>
                  <p className="text-base md:text-xl font-bold text-gray-900 mt-1">
                    R$ {servicosParaFechamento.reduce((total, servico) => total + servico.valorBruto, 0).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-red-500" />
                    <p className="text-xs md:text-sm text-gray-500">Total em Taxas</p>
                  </div>
                  <p className="text-base md:text-xl font-bold text-red-600 mt-1">
                    -R$ {servicosParaFechamento.reduce((total, servico) => total + servico.taxa, 0).toFixed(2).replace('.', ',')}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    <p className="text-xs md:text-sm text-gray-500">Total em Comissões</p>
                  </div>
                  <p className="text-base md:text-xl font-bold text-blue-600 mt-1">
                    R$ {servicosParaFechamento.reduce((total, servico) => total + servico.comissao, 0).toFixed(2).replace('.', ',')}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-green-500" />
                    <p className="text-xs md:text-sm text-gray-500">Valor Líquido</p>
                  </div>
                  <p className="text-base md:text-xl font-bold text-green-600 mt-1">
                    R$ {totalLiquidoFechamento.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              {/* Lista de Serviços - Desktop */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhamento dos Serviços</h3>
                {/* Visualização Desktop - Tabela */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serviço
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Bruto
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Taxa
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comissão
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Líquido
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {servicosParaFechamento.map((servico, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {servico.data ? formatDateForDisplay(servico.data) : 'Data não informada'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {servico.cliente || 'Cliente não informado'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {servico.servico}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            R$ {servico.valorBruto.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                            -R$ {servico.taxa.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                            R$ {servico.comissao.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-medium">
                            R$ {servico.valorLiquido.toFixed(2).replace('.', ',')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vales a Descontar - Desktop */}
              {previewData?.preview?.advancesList && previewData.preview.advancesList.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Vales a Descontar</h3>
                    <span className="text-sm text-gray-500">
                      Total em Vales: R$ {totalValesDescontados.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {previewData.preview.advancesList.map((advance) => (
                      <div
                        key={advance.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedAdvanceIds.includes(advance.id)}
                            onChange={() => handleAdvanceToggle(advance.id)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Vale de R$ {advance.value.toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {advance.created_at ? formatDateForDisplay(advance.created_at.split('T')[0]) : 'Data não informada'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total a Receber - Desktop */}
              <div className="mt-8 border-t pt-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Total a Receber</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Valor líquido menos vales selecionados
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        R$ {calculatedTotalLiquido.toFixed(2).replace('.', ',')}
                      </p>
                      {totalValesDescontados > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          (R$ {totalLiquidoFechamento.toFixed(2).replace('.', ',')} - R$ {totalValesDescontados.toFixed(2).replace('.', ',')})
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botões de Ação - Desktop */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onHistoricoModalOpen}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
                  >
                    Ver Histórico
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmarFechamento}
                    disabled={!canConfirmClosure || isProcessing || isFechamentoRealizado}
                    className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                      isFechamentoRealizado
                        ? 'bg-green-700 cursor-default'
                        : canConfirmClosure && !isProcessing
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isProcessing 
                      ? 'Processando...' 
                      : isFechamentoRealizado 
                      ? '✅ Fechado' 
                      : 'Confirmar Fechamento'
                    }
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Resultados - Mobile */}
      <FechamentoCaixaResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        servicosParaFechamento={servicosParaFechamento}
        totalLiquidoFechamento={totalLiquidoFechamento}
        previewData={previewData}
        selectedAdvanceIds={selectedAdvanceIds}
        totalValesDescontados={totalValesDescontados}
        calculatedTotalLiquido={calculatedTotalLiquido}
        isProcessing={isProcessing}
        canConfirmClosure={canConfirmClosure}
        isFechamentoRealizado={isFechamentoRealizado}
        onAdvanceToggle={handleAdvanceToggle}
        onConfirmarFechamento={handleConfirmarFechamento}
        onHistoricoModalOpen={onHistoricoModalOpen}
        getProfessionalName={getProfessionalName}
        selectedProfessional={selectedProfessional}
        periodFilter={periodFilter}
      />

      {/* Modal de Sucesso */}
      <FechamentoCaixaSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onHistoricoClick={handleHistoricoClick}
      />
      </div>
    </div>
  );
}