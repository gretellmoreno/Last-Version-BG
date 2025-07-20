import React from 'react';
import { X, CheckCircle, DollarSign } from 'lucide-react';

interface FechamentoCaixaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalLiquido: number;
  profissionalNome: string;
  periodo: string;
  servicos: Array<{
    data: string;
    cliente: string;
    servico: string;
    valorBruto: number;
    taxa: number;
    comissao: number;
    valorLiquido: number;
  }>;
}

export default function FechamentoCaixaModal({
  isOpen,
  onClose,
  onConfirm,
  totalLiquido,
  profissionalNome,
  periodo,
  servicos
}: FechamentoCaixaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[500px] bg-white rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={16} className="sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Confirmar Fechamento</h2>
              <p className="text-xs sm:text-sm text-gray-600">Fechamento de caixa para {profissionalNome}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Resumo */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Período:</span>
              <span className="text-sm text-gray-900">{periodo}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Total de serviços:</span>
              <span className="text-sm text-gray-900">{servicos.length}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-base font-semibold text-gray-900">Total Líquido:</span>
              <span className="text-lg font-bold text-green-600">
                R$ {totalLiquido.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-yellow-800 text-xs font-bold">!</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Atenção</h4>
                <p className="text-sm text-yellow-700">
                  Após confirmar o fechamento, os serviços serão movidos para o histórico e não poderão ser alterados.
                </p>
              </div>
            </div>
          </div>

          {/* Botões para mobile */}
          <div className="block sm:hidden space-y-3 pt-4">
            <button
              onClick={onConfirm}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle size={16} />
              <span>Fechar Caixa</span>
            </button>
          </div>
        </div>

        {/* Footer - apenas para desktop */}
        <div className="hidden sm:flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle size={16} />
            <span>Fechar Caixa</span>
          </button>
        </div>
      </div>
    </div>
  );
}