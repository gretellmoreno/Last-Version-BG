import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
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

  // Atualizar mês/ano quando a data selecionada mudar
  useEffect(() => {
    setCurrentMonth(selectedDate.getMonth());
    setCurrentYear(selectedDate.getFullYear());
  }, [selectedDate]);

  // Formatar data para exibição
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Verificar se é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
      days.push(new Date(currentYear, currentMonth, day));
    }

    return days;
  };

  // Verificar se é o dia selecionado
  const isSelectedDay = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  // Verificar se é hoje (para células do calendário)
  const isTodayCell = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Selecionar data
  const selectDate = (date: Date) => {
    onDateChange(date);
    setIsOpen(false);
  };

  // Navegar para o dia anterior
  const previousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  // Navegar para o próximo dia
  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  // Ir para hoje
  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Botão dia anterior */}
      <button 
        onClick={previousDay}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
      >
        <ChevronLeft size={16} className="text-gray-600 group-hover:text-gray-800" />
      </button>

      {/* Container do date picker com posicionamento relativo */}
      <div className="relative" ref={dropdownRef}>
        {/* Botão da data atual com largura fixa */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group min-w-[200px] justify-center"
        >
          <Calendar size={16} className="text-gray-500 group-hover:text-gray-700" />
          <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 whitespace-nowrap">
            {formatDate(selectedDate)}
          </span>
        </button>

        {/* Dropdown do calendário com posicionamento fixo */}
        {isOpen && (
          <>
            {/* Overlay para fechar ao clicar fora */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            {/* Calendário */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 w-80">
              {/* Header do calendário */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
                
                <h3 className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
                  {months[currentMonth]} {currentYear}
                </h3>
                
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do mês */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((date, index) => (
                  <div key={index} className="aspect-square">
                    {date ? (
                      <button
                        onClick={() => selectDate(date)}
                        className={`
                          w-full h-full flex items-center justify-center text-sm rounded-lg transition-all
                          ${isSelectedDay(date)
                            ? 'bg-indigo-600 text-white font-semibold shadow-md'
                            : isTodayCell(date)
                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        {date.getDate()}
                      </button>
                    ) : (
                      <div></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer com botão hoje */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => selectDate(new Date())}
                  className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors rounded-lg hover:bg-indigo-50"
                >
                  Hoje
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Botão próximo dia */}
      <button 
        onClick={nextDay}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
      >
        <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-800" />
      </button>

      {/* Botão "Hoje" quando não estiver no dia atual */}
      {!isToday(selectedDate) && (
        <button
          onClick={goToToday}
          className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors rounded-lg hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-300"
        >
          Hoje
        </button>
      )}
    </div>
  );
}