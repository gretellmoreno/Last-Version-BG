import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calculator, User, Receipt, TrendingUp, Calendar, UserCheck } from 'lucide-react';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { CashClosurePreview } from '../../types';

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

interface FechamentoCaixaResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicosParaFechamento: ServicoFechamento[];
  totalLiquidoFechamento: number;
  previewData: CashClosurePreview;
  selectedAdvanceIds: string[];
  totalValesDescontados: number;
  calculatedTotalLiquido: number;
  isProcessing: boolean;
  canConfirmClosure: boolean;
  isFechamentoRealizado?: boolean;
  onAdvanceToggle: (advanceId: string) => void;
  onConfirmarFechamento: () => void;
  onHistoricoModalOpen: () => void;
  getProfessionalName: (id: string) => string;
  selectedProfessional: string;
  periodFilter: {
    start: string;
    end: string;
  };
}

export default function FechamentoCaixaResultModal({
  isOpen,
  onClose,
  servicosParaFechamento,
  totalLiquidoFechamento,
  previewData,
  selectedAdvanceIds,
  totalValesDescontados,
  calculatedTotalLiquido,
  isProcessing,
  canConfirmClosure,
  isFechamentoRealizado = false,
  onAdvanceToggle,
  onConfirmarFechamento,
  onHistoricoModalOpen,
  getProfessionalName,
  selectedProfessional,
  periodFilter
}: FechamentoCaixaResultModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Função de fechamento simplificada
  const handleClose = () => {
    console.log('🔴 handleClose chamado');
    if (onClose) {
      console.log('🔴 onClose existe, chamando...');
      onClose();
    } else {
      console.log('🔴 onClose não existe');
    }
  };

  if (!isOpen) {
    console.log('🔴 Modal não está aberto, isOpen:', isOpen);
    return null;
  }

  console.log('🔴 Modal renderizando - isOpen:', isOpen);

  const formatPeriodDisplay = () => {
    if (!periodFilter.start || !periodFilter.end) return 'Selecione o período';
    return `${formatDateForDisplay(periodFilter.start)} - ${formatDateForDisplay(periodFilter.end)}`;
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden z-[10000] ${
          isMobile ? 'w-full max-w-sm' : 'w-full max-w-4xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com botão X sempre visível */}
        <div className="bg-gray-800 text-white p-4 relative">
          {/* Botão X absoluto no canto superior direito */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            className="absolute top-3 right-3 p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fechar modal"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="pr-12"> {/* Espaço para o botão X */}
            <h2 className="text-lg font-semibold mb-1">Fechamento de Caixa</h2>
            <div className="flex items-center space-x-2 text-gray-300 text-sm">
              <UserCheck className="w-4 h-4" />
                              <span>{getProfessionalName(selectedProfessional)}</span>
                <Calendar className="w-4 h-4" />
                <span>{formatPeriodDisplay()}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Detalhamento dos Serviços */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <h3 className="text-base font-semibold text-gray-900">Detalhamento dos Serviços</h3>
            </div>
            
              <div className="space-y-2">
              {servicosParaFechamento.map((servico, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-3">
                    {/* Header do serviço */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {servico.cliente || 'Cliente não informado'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateForDisplay(servico.data)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-green-600 text-sm">
                          {formatCurrency(servico.valorLiquido)}
                      </p>
                      <p className="text-xs text-gray-500">Líquido</p>
                    </div>
                  </div>

                    {/* Detalhes do serviço */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-600">Serviço</p>
                        <p className="font-medium text-gray-900">{servico.servico}</p>
                    </div>
                      <div>
                        <p className="text-gray-600">Valor Bruto</p>
                        <p className="font-medium text-gray-900">{formatCurrency(servico.valorBruto)}</p>
          </div>
            <div>
                        <p className="text-gray-600">Taxa</p>
                        <p className="font-medium text-red-600">-{formatCurrency(Math.abs(servico.taxa))}</p>
              </div>
                      <div>
                        <p className="text-gray-600">Comissão</p>
                        <p className="font-medium text-gray-900">{formatCurrency(servico.comissao)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          {/* Total a Receber */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                  <h3 className="text-base font-semibold text-gray-900">Total a Receber</h3>
                  <p className="text-xs text-gray-600 mt-1">
                  Valor líquido menos vales selecionados
                </p>
              </div>
              <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(calculatedTotalLiquido)}
                </p>
                {totalValesDescontados > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ({formatCurrency(totalLiquidoFechamento)} - {formatCurrency(totalValesDescontados)})
                  </p>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com botões */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                handleClose();
                onHistoricoModalOpen();
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ver Histórico
            </button>
            <button
              type="button"
              onClick={onConfirmarFechamento}
              disabled={!canConfirmClosure || isProcessing || isFechamentoRealizado}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
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
    </div>
  );
} 