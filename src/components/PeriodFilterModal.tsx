import React, { useState, useEffect } from 'react';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Clock from 'lucide-react/dist/esm/icons/clock';
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days';
import CalendarRange from 'lucide-react/dist/esm/icons/calendar-range';
import { getTodayLocal, getStartOfMonth, getEndOfMonth } from '../utils/dateUtils';

interface PeriodFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (period: { start: string; end: string }) => void;
  currentPeriod: {
    start: string;
    end: string;
  };
}

export default function PeriodFilterModal({ isOpen, onClose, onApply, currentPeriod }: PeriodFilterModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState({
    start: getTodayLocal(),
    end: getTodayLocal()
  });

  // Atualizar selectedPeriod quando currentPeriod mudar
  useEffect(() => {
    if (currentPeriod?.start && currentPeriod?.end) {
      setSelectedPeriod(currentPeriod);
    }
  }, [currentPeriod]);

  if (!isOpen) return null;

  const handleApply = () => {
    // Validar se as datas são válidas antes de aplicar
    if (!selectedPeriod.start || !selectedPeriod.end) {
      console.warn('⚠️ PeriodFilterModal: Datas inválidas:', selectedPeriod);
      return;
    }
    
    // Garantir que as datas estão no formato correto
    const startDate = selectedPeriod.start || getTodayLocal();
    const endDate = selectedPeriod.end || getTodayLocal();
    
    console.log('✅ PeriodFilterModal: Aplicando período:', { start: startDate, end: endDate });
    onApply({ start: startDate, end: endDate });
    onClose();
  };

  // Funções para os botões de atalho
  const setToday = () => {
    const today = getTodayLocal();
    setSelectedPeriod({ start: today, end: today });
  };

  const setCurrentMonth = () => {
    const start = getStartOfMonth();
    const end = getEndOfMonth();
    setSelectedPeriod({ start, end });
  };

  const setLastWeek = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    // Usar as funções do dateUtils que tratam corretamente o timezone
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const start = formatDate(lastWeek);
    const end = formatDate(today);
    setSelectedPeriod({ start, end });
  };

  const setLastMonth = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // Usar as funções do dateUtils que tratam corretamente o timezone
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const start = formatDate(lastMonth);
    const end = formatDate(lastMonthEnd);
    setSelectedPeriod({ start, end });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Selecionar Período</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Data Inicial
            </label>
            <input
              type="date"
              id="start-date"
              value={selectedPeriod.start}
              onChange={(e) => setSelectedPeriod({ ...selectedPeriod, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
              Data Final
            </label>
            <input
              type="date"
              id="end-date"
              value={selectedPeriod.end}
              onChange={(e) => setSelectedPeriod({ ...selectedPeriod, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Botões de Atalho */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Atalhos Rápidos</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={setToday}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                <Clock size={16} className="mr-2" />
                Hoje
              </button>
              <button
                onClick={setCurrentMonth}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
              >
                <CalendarDays size={16} className="mr-2" />
                Mês Atual
              </button>
              <button
                onClick={setLastWeek}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
              >
                <CalendarRange size={16} className="mr-2" />
                Última Semana
              </button>
              <button
                onClick={setLastMonth}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
              >
                <Calendar size={16} className="mr-2" />
                Mês Passado
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}