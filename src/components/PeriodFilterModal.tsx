import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

interface PeriodFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  currentPeriod: { start: string; end: string };
}

export default function PeriodFilterModal({
  isOpen,
  onClose,
  onApply,
  currentPeriod
}: PeriodFilterModalProps) {
  const [startDate, setStartDate] = useState(currentPeriod.start);
  const [endDate, setEndDate] = useState(currentPeriod.end);
  const [selectedQuickPeriod, setSelectedQuickPeriod] = useState<string>('');
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

  const quickPeriods = [
    { label: 'Hoje', value: 'today' },
    { label: '7 dias', value: '7days' },
    { label: '15 dias', value: '15days' },
    { label: '30 dias', value: '30days' }
  ];

  const handleQuickPeriodSelect = (period: string) => {
    setSelectedQuickPeriod(period);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (period) {
      case 'today':
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
      case '7days':
        const week = new Date(today);
        week.setDate(today.getDate() - 6);
        setStartDate(week.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
      case '15days':
        const twoWeeks = new Date(today);
        twoWeeks.setDate(today.getDate() - 14);
        setStartDate(twoWeeks.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
      case '30days':
        const month = new Date(today);
        month.setDate(today.getDate() - 29);
        setStartDate(month.toISOString().split('T')[0]);
        setEndDate(todayStr);
        break;
    }
  };

  const handleApply = () => {
    onApply(startDate, endDate);
    onClose();
  };

  const handleCancel = () => {
    setStartDate(currentPeriod.start);
    setEndDate(currentPeriod.end);
    setSelectedQuickPeriod('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal - responsivo e compacto */}
      <div className={`
        absolute bg-white shadow-2xl
        ${isMobile 
          ? 'inset-x-4 top-1/2 transform -translate-y-1/2 rounded-2xl max-w-sm mx-auto' 
          : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[420px] rounded-2xl'
        }
      `}>
        {/* Header compacto */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Período</h2>
              <p className="text-xs text-gray-500">Selecione o período</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Conteúdo compacto */}
        <div className={`${isMobile ? 'p-4' : 'p-5'} space-y-5`}>
          {/* Períodos Rápidos */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Períodos Rápidos</h3>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {quickPeriods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => handleQuickPeriodSelect(period.value)}
                  className={`
                    px-3 py-2.5 text-sm font-medium rounded-lg border transition-all
                    ${selectedQuickPeriod === period.value
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Período Personalizado */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Período Personalizado</h3>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSelectedQuickPeriod('');
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  style={{ fontSize: isMobile ? '16px' : '14px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Data Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSelectedQuickPeriod('');
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  style={{ fontSize: isMobile ? '16px' : '14px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer compacto */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}