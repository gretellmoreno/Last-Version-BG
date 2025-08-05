import React from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import X from 'lucide-react/dist/esm/icons/x';

interface FechamentoCaixaSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHistoricoClick: () => void;
}

export default function FechamentoCaixaSuccessModal({
  isOpen,
  onClose,
  onHistoricoClick
}: FechamentoCaixaSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div>
            {/* Ícone de sucesso */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>

            {/* Título e mensagem */}
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Fechamento Realizado!
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  O fechamento de caixa foi realizado com sucesso. Você pode visualizar os detalhes no histórico.
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="mt-5 sm:mt-6 space-y-2">
            <button
              type="button"
              onClick={onHistoricoClick}
              className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Ver Histórico
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 