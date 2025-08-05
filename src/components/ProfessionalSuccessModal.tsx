import React from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Mail from 'lucide-react/dist/esm/icons/mail';
import X from 'lucide-react/dist/esm/icons/x';

interface ProfessionalSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalName: string;
  professionalEmail: string;
}

export default function ProfessionalSuccessModal({
  isOpen,
  onClose,
  professionalName,
  professionalEmail
}: ProfessionalSuccessModalProps) {
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
                Profissional Criado com Sucesso!
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-3">
                  <strong className="text-gray-900">{professionalName}</strong> foi adicionado ao sistema.
                </p>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Mail size={16} />
                    <span className="text-sm font-medium">Convite Enviado</span>
                  </div>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    Um e-mail com link de acesso foi enviado para <strong className="text-blue-700">{professionalEmail}</strong>. 
                    O profissional poderá definir sua senha e começar a usar o sistema.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão */}
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              onClick={onClose}
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 