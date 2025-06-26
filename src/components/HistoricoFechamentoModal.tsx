import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, History, DollarSign } from 'lucide-react';

interface FechamentoHistorico {
  id: string;
  data: string;
  hora: string;
  profissionalNome: string;
  servicos: Array<{
    data: string;
    cliente: string;
    servico: string;
    valorBruto: number;
    taxa: number;
    comissao: number;
    valorLiquido: number;
  }>;
  totalLiquido: number;
}

interface HistoricoFechamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fechamentos: FechamentoHistorico[];
  profissionalNome: string;
}

export default function HistoricoFechamentoModal({
  isOpen,
  onClose,
  fechamentos,
  profissionalNome
}: HistoricoFechamentoModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!isOpen || fechamentos.length === 0) return null;

  const currentFechamento = fechamentos[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(fechamentos.length - 1, prev + 1));
  };

  const handleLimparHistorico = () => {
    // Implementar lógica para limpar histórico
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <History size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Histórico - {profissionalNome}
              </h2>
              <p className="text-sm text-gray-600">
                {currentIndex + 1} de {fechamentos.length} fechamentos
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Navegação */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <span className="text-sm text-gray-600 px-2">
                {currentIndex + 1}/{fechamentos.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex === fechamentos.length - 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info do fechamento */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6 border border-indigo-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <DollarSign size={16} className="text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">
                  {currentFechamento.data} {currentFechamento.hora}
                </span>
              </div>
              <span className="text-sm text-indigo-600">
                {currentFechamento.servicos.length} serviços
              </span>
            </div>
            
            {/* Lista de serviços */}
            <div className="text-sm text-indigo-700 mb-3">
              {currentFechamento.servicos.map((servico, index) => (
                <span key={index}>
                  {servico.servico}
                  {index < currentFechamento.servicos.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>

            {/* Resumo financeiro */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xs text-indigo-600 mb-1">Valor Bruto:</div>
                <div className="font-semibold text-indigo-900">
                  R$ {currentFechamento.servicos.reduce((sum, s) => sum + s.valorBruto, 0).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div>
                <div className="text-xs text-red-600 mb-1">Taxa:</div>
                <div className="font-semibold text-red-700">
                  -R$ {currentFechamento.servicos.reduce((sum, s) => sum + s.taxa, 0).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div>
                <div className="text-xs text-indigo-600 mb-1">Comissão:</div>
                <div className="font-semibold text-indigo-900">
                  R$ {currentFechamento.servicos.reduce((sum, s) => sum + s.comissao, 0).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div>
                <div className="text-xs text-green-600 mb-1">Valor Líquido:</div>
                <div className="font-bold text-green-700">
                  R$ {currentFechamento.totalLiquido.toFixed(2).replace('.', ',')}
                </div>
              </div>
            </div>
          </div>

          {/* Indicadores de navegação */}
          <div className="flex justify-center space-x-2 mb-4">
            {fechamentos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleLimparHistorico}
            className="px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Limpar Histórico
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}