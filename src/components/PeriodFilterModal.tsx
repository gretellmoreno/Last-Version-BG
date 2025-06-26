import React, { useState } from 'react';
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
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Selecionar Período</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Períodos Rápidos */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Períodos Rápidos</h3>
            <div className="grid grid-cols-4 gap-3">
              {quickPeriods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => handleQuickPeriodSelect(period.value)}
                  className={`
                    px-4 py-3 text-sm font-medium rounded-lg border transition-all
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Data Inicial
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setSelectedQuickPeriod('');
                    }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Data Final
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setSelectedQuickPeriod('');
                    }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}