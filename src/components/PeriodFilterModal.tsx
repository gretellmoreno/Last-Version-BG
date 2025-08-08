import React, { useState, useEffect, useRef } from 'react';
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

  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const [activeShortcut, setActiveShortcut] = useState<null | 'today' | 'current_month' | 'last_week' | 'last_month'>(null);

  // Atualizar selectedPeriod quando currentPeriod mudar
  useEffect(() => {
    if (currentPeriod?.start && currentPeriod?.end) {
      setSelectedPeriod(currentPeriod);
    }
  }, [currentPeriod]);
  // Mantemos a animação enquanto o atalho estiver selecionado.

  if (!isOpen) return null;

  const handleApply = () => {
    if (!selectedPeriod.start || !selectedPeriod.end) {
      return;
    }
    const startDate = selectedPeriod.start || getTodayLocal();
    const endDate = selectedPeriod.end || getTodayLocal();
    onApply({ start: startDate, end: endDate });
    onClose();
  };

  // Atalhos
  const setToday = () => {
    const today = getTodayLocal();
    setSelectedPeriod({ start: today, end: today });
    setActiveShortcut('today');
  };
  const setCurrentMonth = () => {
    setSelectedPeriod({ start: getStartOfMonth(), end: getEndOfMonth() });
    setActiveShortcut('current_month');
  };
  const setLastWeek = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    setSelectedPeriod({ start: formatDate(lastWeek), end: formatDate(today) });
    setActiveShortcut('last_week');
  };
  const setLastMonth = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    setSelectedPeriod({ start: formatDate(lastMonth), end: formatDate(lastMonthEnd) });
    setActiveShortcut('last_month');
  };

  const focusStart = () => startRef.current?.showPicker?.() || startRef.current?.focus();
  const focusEnd = () => endRef.current?.showPicker?.() || endRef.current?.focus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Selecionar Período</h3>
        </div>

        <div className="p-5 space-y-4">
          {/* Linha compacta com datas lado a lado e toda clicável */}
          <div
            className="flex items-center gap-2 w-full"
          >
            <div className="flex-1 min-w-0">
              <label htmlFor="start-date" className="block text-[11px] font-medium text-gray-600 mb-1">Data Inicial</label>
              <div
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={focusStart}
              >
                <input
                  ref={startRef}
                  type="date"
                  id="start-date"
                  value={selectedPeriod.start}
                  onChange={(e) => { setSelectedPeriod({ ...selectedPeriod, start: e.target.value }); setActiveShortcut(null); }}
                  className="w-full bg-transparent focus:outline-none text-sm h-6"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <label htmlFor="end-date" className="block text-[11px] font-medium text-gray-600 mb-1">Data Final</label>
              <div
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={focusEnd}
              >
                <input
                  ref={endRef}
                  type="date"
                  id="end-date"
                  value={selectedPeriod.end}
                  onChange={(e) => { setSelectedPeriod({ ...selectedPeriod, end: e.target.value }); setActiveShortcut(null); }}
                  className="w-full bg-transparent focus:outline-none text-sm h-6"
                />
              </div>
            </div>
          </div>

          {/* Atalhos sem cor; animação ao selecionar */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Atalhos Rápidos</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={setToday} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${activeShortcut==='today' ? 'ring-2 ring-indigo-500 animate-pulse' : 'border-gray-300 hover:bg-gray-50'}`}>Hoje</button>
              <button onClick={setCurrentMonth} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${activeShortcut==='current_month' ? 'ring-2 ring-indigo-500 animate-pulse' : 'border-gray-300 hover:bg-gray-50'}`}>Mês Atual</button>
              <button onClick={setLastWeek} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${activeShortcut==='last_week' ? 'ring-2 ring-indigo-500 animate-pulse' : 'border-gray-300 hover:bg-gray-50'}`}>Última Semana</button>
              <button onClick={setLastMonth} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${activeShortcut==='last_month' ? 'ring-2 ring-indigo-500 animate-pulse' : 'border-gray-300 hover:bg-gray-50'}`}>Mês Passado</button>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleApply} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Aplicar</button>
          </div>
        </div>
      </div>
    </div>
  );
}