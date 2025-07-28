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

// Adicione esta interface para tipar corretamente os fechamentos
interface FechamentoHistorico {
  id: string;
  data: string;
  hora: string;
  profissionalNome: string;
  servicos: any[];
  totalLiquido: number;
  totalBruto?: number;
  totalTaxas?: number;
  totalComissoes?: number;
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
  ) as { data: FechamentoHistorico[]; isLoading: boolean; error: any };
  
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
      <div className={`absolute bg-white shadow-2xl flex flex-col ${isMobile ? 'inset-x-4 top-1/2 transform -translate-y-1/2 rounded-2xl max-w-sm mx-auto' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[380px] max-h-[85vh] rounded-xl'}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 rounded-t-xl">
          <h2 className="font-semibold text-gray-900 text-lg">Histórico de Fechamento</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-700 font-medium">Data:</div>
            <div className="text-sm text-gray-900">{currentFechamento.data}</div>
            <div className="text-sm text-gray-700 font-medium">Hora:</div>
            <div className="text-sm text-gray-900">{currentFechamento.hora}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Bruto</div>
              <div className="text-base font-semibold text-gray-900">{formatCurrency(currentFechamento.totalBruto ?? 0)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Taxas</div>
              <div className="text-base font-semibold text-red-600">{formatCurrency(currentFechamento.totalTaxas ?? 0)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Comissões</div>
              <div className="text-base font-semibold text-indigo-600">{formatCurrency(currentFechamento.totalComissoes ?? 0)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Líquido</div>
              <div className="text-base font-bold text-green-600">{formatCurrency(currentFechamento.totalLiquido ?? 0)}</div>
            </div>
          </div>
        </div>
        {/* Footer com navegação */}
        <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <button onClick={handlePrevious} disabled={currentIndex === 0} className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1">
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>
            <span className="text-sm text-gray-600">{currentIndex + 1} de {fechamentos.length}</span>
            <button onClick={handleNext} disabled={currentIndex === fechamentos.length - 1} className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1">
              <span>Próximo</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}