import React from 'react';
import { Plus } from 'lucide-react';
import DatePicker from './DatePicker';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  hasDateNavigation?: boolean;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export default function Header({ 
  title, 
  subtitle, 
  action, 
  hasDateNavigation = false,
  selectedDate = new Date(),
  onDateChange = () => {}
}: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        
        {hasDateNavigation && (
          <DatePicker 
            selectedDate={selectedDate}
            onDateChange={onDateChange}
          />
        )}
        
        {subtitle && (
          <span className="text-sm text-gray-500">{subtitle}</span>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {hasDateNavigation && (
          <button className="px-4 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
            Venda
          </button>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus size={16} />
            <span>{action.label}</span>
          </button>
        )}
      </div>
    </div>
  );
}