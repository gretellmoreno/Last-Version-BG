import React, { useState, useEffect } from 'react';
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal - responsivo e compacto */}
      <div className={`
        absolute bg-white shadow-2xl flex flex-col
        ${isMobile 
          ? 'inset-x-4 top-1/2 transform -translate-y-1/2 rounded-2xl max-w-sm mx-auto' 
          : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[480px] max-h-[85vh] rounded-xl'
        }
      `}>
        {/* Header compacto */}
        <div className={`flex items-center justify-between border-b border-gray-100 ${
          isMobile ? 'p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl' : 'p-4'
        }`}>
          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-2'}`}>
            <div className={`bg-indigo-100 rounded-lg flex items-center justify-center ${
              isMobile ? 'w-7 h-7' : 'w-8 h-8'
            }`}>
              <History size={isMobile ? 14 : 16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Histórico {isMobile ? '' : `- ${profissionalNome}`}
              </h2>
              {isMobile && (
                <p className="text-xs text-gray-600">{profissionalNome}</p>
              )}
              <p className="text-xs text-gray-500">
                {currentIndex + 1} de {fechamentos.length} fechamentos
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Navegação compacta */}
            <div className="flex items-center space-x-0.5">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} className="text-gray-600" />
              </button>
              <span className="text-xs text-gray-600 px-1 min-w-[30px] text-center">
                {currentIndex + 1}/{fechamentos.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex === fechamentos.length - 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} className="text-gray-600" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Conteúdo compacto */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'}`}>
          {/* Info do fechamento */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <DollarSign size={12} className="text-indigo-600" />
                <span className="text-xs font-medium text-indigo-800">
                  {currentFechamento.data} {currentFechamento.hora}
                </span>
              </div>
              <span className="text-xs text-indigo-600">
                {currentFechamento.servicos.length} serviços
              </span>
            </div>
            
            {/* Lista de serviços */}
            <div className="text-xs text-indigo-700 mb-2">
              {currentFechamento.servicos.map((servico, index) => (
                <span key={index}>
                  {servico.servico}
                  {index < currentFechamento.servicos.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>

            {/* Resumo financeiro compacto */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/50 rounded p-1.5">
                <div className="text-xs text-indigo-600 mb-0.5">Valor Bruto:</div>
                <div className="text-xs font-semibold text-indigo-900">
                  R$ {currentFechamento.servicos.reduce((sum, s) => sum + s.valorBruto, 0).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="bg-white/50 rounded p-1.5">
                <div className="text-xs text-red-600 mb-0.5">Taxa:</div>
                <div className="text-xs font-semibold text-red-700">
                  -R$ {Math.abs(currentFechamento.servicos.reduce((sum, s) => sum + s.taxa, 0)).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="bg-white/50 rounded p-1.5">
                <div className="text-xs text-indigo-600 mb-0.5">Comissão:</div>
                <div className="text-xs font-semibold text-indigo-900">
                  R$ {currentFechamento.servicos.reduce((sum, s) => sum + s.comissao, 0).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="bg-white/50 rounded p-1.5">
                <div className="text-xs text-green-600 mb-0.5">Valor Líquido:</div>
                <div className="text-sm font-bold text-green-700">
                  R$ {currentFechamento.totalLiquido.toFixed(2).replace('.', ',')}
                </div>
              </div>
            </div>
          </div>

          {/* Indicadores de navegação compactos */}
          {fechamentos.length > 1 && (
            <div className="flex justify-center space-x-1.5 mb-2">
              {fechamentos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer compacto */}
        <div className={`flex items-center justify-between border-t border-gray-100 bg-gray-50 ${
          isMobile ? 'p-2.5 rounded-b-2xl' : 'p-3 rounded-b-xl'
        }`}>
          <button
            onClick={handleLimparHistorico}
            className="px-3 py-1.5 text-xs text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Limpar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}