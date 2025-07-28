import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFinanceiro } from '../contexts/FinanceiroContext';
import { useProfessional } from '../contexts/ProfessionalContext';

// Importa o tipo Vale da definição centralizada
import type { Professional } from '../types';

// Importa o tipo Vale da definição centralizada do contexto
// (Se necessário, pode-se exportar o tipo Vale do contexto para uso externo)
interface Vale {
  id: string;
  data: string;
  profissionalId: string;
  profissionalNome: string;
  valor: number;
  status: 'pendente' | 'descontado';
  observacoes?: string;
}

interface ValeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingVale?: Partial<Vale>;
  onSave?: (vale: Partial<Vale>) => Promise<void>;
  onDelete?: () => void;
}

export default function ValeModal({ isOpen, onClose, editingVale, onSave, onDelete }: ValeModalProps) {
  const { professionals } = useProfessional();
  const { addVale } = useFinanceiro();
  

  const [selectedProfessional, setSelectedProfessional] = useState<string>(editingVale?.profissionalId || '');
  const [valor, setValor] = useState<string>(editingVale && editingVale.valor !== undefined ? editingVale.valor.toFixed(2).replace('.', ',') : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para formatar valor monetário
  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const number = parseInt(digits, 10);
    const reais = number / 100;
    return reais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para converter valor formatado para número
  const parseFormattedValue = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 0;
    return parseInt(digits, 10) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProfessional) {
      setError('Selecione um profissional');
      return;
    }

    const valorNumerico = parseFormattedValue(valor);
    if (valorNumerico <= 0) {
      setError('Informe um valor válido');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingVale && onSave) {
        // Se estiver editando, chama a função onSave
        await onSave({
          ...editingVale,
          profissionalId: selectedProfessional,
          profissionalNome: professionals.find((p: Professional) => p.id === selectedProfessional)?.name || '',
          valor: valorNumerico
        });
      } else {
        // Se estiver criando novo vale
        const success = await addVale({
          profissionalId: selectedProfessional,
          profissionalNome: professionals.find((p: Professional) => p.id === selectedProfessional)?.name || '',
          valor: valorNumerico,
          data: new Date().toISOString().split('T')[0],
        });

        if (!success) {
          setError('Erro ao criar vale');
          return;
        }
      }

      onClose();
      setSelectedProfessional('');
      setValor('');
    } catch (err) {
      setError('Erro inesperado ao salvar vale');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-[95vw] max-w-sm bg-white rounded-xl shadow-xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {editingVale ? 'Editar Vale' : 'Novo Vale'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-3 space-y-4">
          {/* Seleção de Profissional */}
          <div>
            <label htmlFor="professional" className="block text-sm font-medium text-gray-700 mb-1">
              Profissional
            </label>
            <select
              id="professional"
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
              disabled={isSubmitting}
            >
              <option value="">Selecione um profissional</option>
              {professionals.map((prof: Professional) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">R$</span>
              <input
                type="text"
                id="valor"
                value={valor}
                onChange={(e) => setValor(formatCurrencyInput(e.target.value))}
                className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                placeholder="0,00"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Actions */}
          <div className="flex flex-col space-y-2 pt-2">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-base font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            {editingVale && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="w-full px-4 py-2 text-base font-medium text-red-600 hover:text-red-700 transition-colors"
                disabled={isSubmitting}
              >
                Excluir
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}