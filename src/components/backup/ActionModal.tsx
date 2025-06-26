import React from 'react';
import { X } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActionModal({
  isOpen,
  onClose,
  onEdit,
  onDelete
}: ActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal - pequeno e centralizado */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ações</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo - botões de ação */}
        <div className="p-4 space-y-2">
          <button
            onClick={onEdit}
            className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}