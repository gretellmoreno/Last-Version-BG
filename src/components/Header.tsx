import React from 'react';
import { Plus } from 'lucide-react';
import DatePicker from './DatePicker';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddClick?: () => void;
  hasDateNavigation?: boolean;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export default function Header({ 
  title, 
  subtitle, 
  onAddClick, 
  hasDateNavigation = false,
  selectedDate = new Date(),
  onDateChange = () => {}
}: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900 ml-12">{title}</h1>
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
        
        {hasDateNavigation && (
          <div className="ml-12">
            <DatePicker 
              selectedDate={selectedDate}
              onDateChange={onDateChange}
            />
          </div>
        )}
        
        {subtitle && (
          <div className="ml-12 mt-2">
            <span className="text-sm text-gray-500">{subtitle}</span>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between">
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
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Plus size={16} />
              <span>Adicionar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}