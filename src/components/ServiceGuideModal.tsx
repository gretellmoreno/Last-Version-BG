import React from 'react';
import { X, Plus } from 'lucide-react';

interface ServiceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddService: () => void;
}

export default function ServiceGuideModal({ isOpen, onClose, onAddService }: ServiceGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
        {/* Close (X) */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="px-5 pt-8 pb-6 text-center">
          {/* Logo sem moldura, maior, aproveitando espaço */}
          <img
            src="/logos/logo-bela-gestao.png"
            alt="BelaGestão"
            className="mx-auto w-40 md:w-52 h-auto mb-4"
          />

          <h3 className="text-lg font-semibold text-gray-900">Bem-vindo(a) ao BelaGestão!</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Para começar a usar a agenda e disponibilizar o agendamento online, o primeiro passo é cadastrar os serviços que seu estabelecimento oferece.
          </p>

          <div className="mt-5">
            <button
              type="button"
              onClick={onAddService}
              className="w-full inline-flex justify-center rounded-lg px-4 py-3 bg-[#6366F1] text-white font-medium text-sm shadow-sm hover:bg-[#4F46E5] active:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Serviço
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 