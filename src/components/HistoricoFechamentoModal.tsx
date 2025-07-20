import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, History, DollarSign, Calendar, Clock, User, Package, Receipt } from 'lucide-react';
import { useCashClosureHistory } from '../hooks/useCashClosureHistory';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/formatters';

interface HistoricoFechamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalId: string;
}

export default function HistoricoFechamentoModal({
  isOpen,
  onClose,
  professionalId
}: HistoricoFechamentoModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { currentSalon } = useApp();
  
  // Buscar histórico de fechamentos
  const { data: fechamentos, isLoading, error } = useCashClosureHistory(
    currentSalon?.id || null,
    professionalId
  );
  
  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!isOpen) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-white p-6 rounded-lg shadow-xl">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-indigo-200 rounded-full mb-4" />
            <div className="h-4 w-32 bg-indigo-100 rounded mb-2" />
            <div className="text-sm text-gray-500">Carregando histórico...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !fechamentos || fechamentos.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <Receipt className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum fechamento encontrado
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {error ? error.toString() : 'Não há registros de fechamento de caixa para este profissional.'}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentFechamento = fechamentos[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(fechamentos.length - 1, prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className={`
        absolute bg-white shadow-2xl flex flex-col
        ${isMobile 
          ? 'inset-x-4 top-1/2 transform -translate-y-1/2 rounded-2xl max-w-sm mx-auto' 
          : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[480px] max-h-[85vh] rounded-xl'
        }
      `}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <History className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Histórico de Fechamentos
              </h2>
              <p className="text-sm text-gray-600">
                {currentFechamento.profissionalNome}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Cabeçalho do fechamento */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-gray-700">{currentFechamento.data}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-gray-700">{currentFechamento.hora}</span>
              </div>
            </div>

            {/* Totais */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Total Bruto</div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(currentFechamento.servicos.reduce((sum, s) => sum + s.valorBruto, 0))}
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Total Taxas</div>
                <div className="text-sm font-semibold text-red-600">
                  {formatCurrency(currentFechamento.servicos.reduce((sum, s) => sum + s.taxa, 0))}
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Total Comissões</div>
                <div className="text-sm font-semibold text-indigo-600">
                  {formatCurrency(currentFechamento.servicos.reduce((sum, s) => sum + s.comissao, 0))}
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Total Líquido</div>
                <div className="text-sm font-bold text-green-600">
                  {formatCurrency(currentFechamento.totalLiquido)}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de serviços */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Serviços Realizados ({currentFechamento.servicos.length})</span>
            </h3>
            
            {currentFechamento.servicos.map((servico, idx) => (
              <div 
                key={idx}
                className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {servico.servico}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{servico.cliente || 'Cliente não especificado'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(servico.valorBruto)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Líquido: {formatCurrency(servico.valorLiquido)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-red-600">
                    Taxa: {formatCurrency(servico.taxa)}
                  </div>
                  <div className="text-indigo-600 text-right">
                    Comissão: {formatCurrency(servico.comissao)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer com navegação */}
        <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>
            
            <span className="text-sm text-gray-600">
              {currentIndex + 1} de {fechamentos.length}
            </span>
            
            <button
              onClick={handleNext}
              disabled={currentIndex === fechamentos.length - 1}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            >
              <span>Próximo</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}