import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerCalendarProps {
  selectedDate?: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function DatePickerCalendar({ 
  selectedDate, 
  onDateChange, 
  placeholder = "Selecione uma data" 
}: DatePickerCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formatar data para exibição
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [day, month] = dateStr.split('/');
    return `${day}/${month}`;
  };

  // Navegar para o mês anterior
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navegar para o próximo mês
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Obter dias do mês
  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias vazios do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // Verificar se é o dia selecionado
  const isSelectedDay = (day: number | null) => {
    if (!day || !selectedDate) return false;
    const [selectedDay, selectedMonth] = selectedDate.split('/').map(Number);
    return day === selectedDay && (currentMonth + 1) === selectedMonth;
  };

  // Verificar se é hoje
  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  // Selecionar data
  const selectDate = (day: number) => {
    const formattedDate = `${day.toString().padStart(2, '0')}/${(currentMonth + 1).toString().padStart(2, '0')}`;
    onDateChange(formattedDate);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input da data */}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={formatDateForDisplay(selectedDate || '')}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer text-sm"
        />
        <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
      </div>

      {/* Dropdown do calendário */}
      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Calendário - posicionamento fixo e responsivo */}
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 w-64">
            {/* Header do calendário - apenas o mês, sem ano */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={previousMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              >
                <ChevronLeft size={14} className="text-gray-600" />
              </button>
              
              <h3 className="text-sm font-medium text-gray-900 text-center flex-1 mx-2">
                {months[currentMonth]}
              </h3>
              
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              >
                <ChevronRight size={14} className="text-gray-600" />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((day, index) => (
                <div key={index} className="aspect-square">
                  {day ? (
                    <button
                      onClick={() => selectDate(day)}
                      className={`
                        w-full h-full flex items-center justify-center text-xs rounded transition-all
                        ${isSelectedDay(day)
                          ? 'bg-indigo-600 text-white font-medium'
                          : isToday(day)
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {day}
                    </button>
                  ) : (
                    <div></div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer com botão limpar */}
            <div className="mt-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  onDateChange('');
                  setIsOpen(false);
                }}
                className="w-full py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors rounded hover:bg-gray-50"
              >
                Limpar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}