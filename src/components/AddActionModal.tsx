import React, { useEffect } from 'react';
import { Calendar, ShoppingBag } from 'lucide-react';

interface AddActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgendamento: () => void;
  onSelectVenda: () => void;
  isMobile?: boolean;
}

export default function AddActionModal({ 
  isOpen, 
  onClose, 
  onSelectAgendamento, 
  onSelectVenda,
  isMobile = false
}: AddActionModalProps) {
  useEffect(() => {
    if (isOpen) {
      console.log(`📋 AddActionModal ABERTO - Modo: ${isMobile ? 'Mobile' : 'Desktop'}`);
    } else {
      console.log('📋 AddActionModal fechado');
    }
  }, [isOpen, isMobile]);

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <>
        {/* Overlay com z-index alto para bloquear interações com agenda */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-[99998]" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📱 Overlay mobile clicado - fechando modal');
            onClose();
          }}
          style={{ pointerEvents: 'auto' }}
        />
        
        {/* Modal mobile com z-index muito alto */}
        <div 
          className="fixed top-20 right-4 z-[99999] w-72"
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            {/* Header compacto */}
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800">O que deseja adicionar?</h3>
            </div>

            {/* Content compacto */}
            <div className="p-2 space-y-1">
              {/* Botão Agendamento */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔵 Botão Agendamento clicado!');
                  onSelectAgendamento();
                }}
                className="w-full p-3 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-all duration-200 flex items-center space-x-3 group text-left cursor-pointer"
                style={{ pointerEvents: 'auto' }}
                type="button"
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🟢 Botão Venda clicado!');
                  onSelectVenda();
                }}
                className="w-full p-3 rounded-lg hover:bg-green-50 active:bg-green-100 transition-all duration-200 flex items-center space-x-3 group text-left cursor-pointer"
                style={{ pointerEvents: 'auto' }}
                type="button"
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

  return (
    <>
      {/* Overlay desktop com z-index alto */}
      <div 
        className="fixed inset-0 z-[99998]" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🖥️ Overlay desktop clicado - fechando modal');
          onClose();
        }}
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Dropdown desktop posicionado no canto superior direito */}
      <div 
        className="absolute top-16 right-6 z-[99999] w-80"
        style={{ pointerEvents: 'auto' }}
      >
        <div 
          className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-800">O que deseja adicionar?</h3>
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {/* Botão Agendamento */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔵 Botão Agendamento clicado! (Desktop)');
                onSelectAgendamento();
              }}
              className="w-full p-3 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-all duration-200 flex items-center space-x-3 group text-left cursor-pointer"
              style={{ pointerEvents: 'auto' }}
              type="button"
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🟢 Botão Venda clicado! (Desktop)');
                onSelectVenda();
              }}
              className="w-full p-3 rounded-lg hover:bg-green-50 active:bg-green-100 transition-all duration-200 flex items-center space-x-3 group text-left cursor-pointer"
              style={{ pointerEvents: 'auto' }}
              type="button"
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