import React, { useState, useEffect } from 'react';
import { X, CreditCard, Percent } from 'lucide-react';

interface Taxa {
  id: string;
  nome: string;
  taxa: number;
  ativo: boolean;
}

interface TaxaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taxa: Taxa) => void;
  editingTaxa?: Taxa | null;
}

interface TaxaFormData {
  nome: string;
  taxa: string;
}

export default function TaxaModal({
  isOpen,
  onClose,
  onSave,
  editingTaxa
}: TaxaModalProps) {
  const [taxaForm, setTaxaForm] = useState<TaxaFormData>({
    nome: '',
    taxa: ''
  });

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingTaxa) {
      setTaxaForm({
        nome: editingTaxa.nome || '',
        taxa: editingTaxa.taxa.toString() || ''
      });
    } else {
      setTaxaForm({
        nome: '',
        taxa: ''
      });
    }
  }, [editingTaxa, isOpen]);

  const handleUpdateForm = (field: keyof TaxaFormData, value: string) => {
    setTaxaForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return taxaForm.nome.trim() !== '' && 
           taxaForm.taxa.trim() !== '' &&
           !isNaN(parseFloat(taxaForm.taxa)) &&
           parseFloat(taxaForm.taxa) >= 0;
  };

  const handleSave = () => {
    if (!isFormValid()) return;
    
    const taxa: Taxa = {
      id: editingTaxa?.id || Date.now().toString(),
      nome: taxaForm.nome.trim(),
      taxa: parseFloat(taxaForm.taxa),
      ativo: true
    };
    
    onSave(taxa);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay com blur */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal - design moderno e elegante */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100">
        {/* Header com gradiente sutil */}
        <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-80 rounded-full transition-all duration-200"
          >
            <X size={18} className="text-gray-500" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Adicionar Método de Pagamento</h2>
              <p className="text-sm text-gray-600 mt-1">Configure um novo método de pagamento</p>
            </div>
          </div>
        </div>

        {/* Conteúdo do formulário */}
        <div className="p-6 space-y-5">
          {/* Nome do Método */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Método
            </label>
            <input
              type="text"
              placeholder="Ex: Cartão de crédito"
              value={taxaForm.nome}
              onChange={(e) => handleUpdateForm('nome', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
            />
          </div>

          {/* Taxa */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Percent size={16} className="inline mr-2" />
              Taxa (%)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                %
              </span>
              <input
                type="number"
                placeholder="0,00"
                step="0.01"
                min="0"
                max="100"
                value={taxaForm.taxa}
                onChange={(e) => handleUpdateForm('taxa', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Digite a taxa cobrada para este método de pagamento. Por exemplo, para 3,5%, digite 3,5
            </p>
          </div>

          {/* Informação adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-800 text-xs font-bold">i</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">Informação</h4>
                <p className="text-sm text-blue-700">
                  Esta taxa será aplicada automaticamente nos cálculos de fechamento de caixa para este método de pagamento.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com botões */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid()}
            className={`
              px-8 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg
              ${isFormValid()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Adicionar Método
          </button>
        </div>
      </div>
    </div>
  );
}