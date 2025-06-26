import React from 'react';
import { Calendar, ShoppingBag } from 'lucide-react';

interface AddActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgendamento: () => void;
  onSelectVenda: () => void;
}

export default function AddActionModal({ 
  isOpen, 
  onClose, 
  onSelectAgendamento, 
  onSelectVenda 
}: AddActionModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay invisível para fechar ao clicar fora */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown posicionado no canto superior direito */}
      <div className="absolute top-16 right-6 z-50 w-80">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-800">O que deseja adicionar?</h3>
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {/* Botão Agendamento */}
            <button
              onClick={() => {
                onSelectAgendamento();
                onClose();
              }}
              className="w-full p-3 rounded-lg hover:bg-indigo-50 transition-all duration-200 flex items-center space-x-3 group text-left"
            >
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <Calendar size={16} className="text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Agendamento</h4>
                <p className="text-xs text-gray-500">Criar novo agendamento para cliente</p>
              </div>
            </button>

            {/* Botão Venda */}
            <button
              onClick={() => {
                onSelectVenda();
                onClose();
              }}
              className="w-full p-3 rounded-lg hover:bg-green-50 transition-all duration-200 flex items-center space-x-3 group text-left"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <ShoppingBag size={16} className="text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Venda</h4>
                <p className="text-xs text-gray-500">Registrar venda de produtos</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 