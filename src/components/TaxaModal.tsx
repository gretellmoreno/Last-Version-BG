import React, { useState, useEffect } from 'react';
import { X, CreditCard, Percent, Trash2 } from 'lucide-react';

interface Taxa {
  id: string;
  nome: string;
  taxa: number;
  ativo: boolean;
}

interface TaxaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taxa: Omit<Taxa, 'id'> | Taxa) => Promise<void>;
  editingTaxa?: Taxa | null;
  onDelete?: () => Promise<void>;
}

interface TaxaFormData {
  nome: string;
  taxa: string;
}

export default function TaxaModal({
  isOpen,
  onClose,
  onSave,
  editingTaxa,
  onDelete
}: TaxaModalProps) {
  const [taxaForm, setTaxaForm] = useState<TaxaFormData>({
    nome: '',
    taxa: ''
  });
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingTaxa) {
      setTaxaForm({
        nome: editingTaxa.nome || '',
        taxa: editingTaxa.taxa != null ? editingTaxa.taxa.toString() : ''
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
           !isNaN(parseFloat(taxaForm.taxa));
  };

  const handleSave = async () => {
    if (!isFormValid() || saving) return;
    
    setSaving(true);
    try {
      const taxa = {
        id: editingTaxa?.id || '',
        nome: taxaForm.nome.trim(),
        taxa: parseFloat(taxaForm.taxa) || 0,
        ativo: true
      };
    
      await onSave(taxa);
    } catch (err) {
      console.error('Erro ao salvar taxa:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete && editingTaxa) {
      try {
        await onDelete();
      } catch (err) {
        console.error('Erro ao deletar taxa:', err);
      }
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal - Ultra Compacto */}
      <div className={`absolute ${
        isMobile 
          ? 'inset-x-3 top-1/2 transform -translate-y-1/2 rounded-2xl max-h-[70vh]' 
          : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[340px] rounded-2xl'
      } bg-white shadow-2xl border border-gray-100`}>
        
        {/* Header ultra compacto */}
        <div className={`bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl ${isMobile ? 'p-3' : 'p-4'} border-b border-gray-100`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-indigo-600 rounded-lg flex items-center justify-center`}>
                <CreditCard size={isMobile ? 16 : 20} className="text-white" />
              </div>
              <div>
                <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>
                  {editingTaxa ? 'Editar Método' : 'Novo Método'}
                </h2>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                  {editingTaxa ? 'Atualizar dados' : 'Configurar pagamento'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white hover:bg-opacity-80 rounded-full transition-all duration-200"
            >
              <X size={isMobile ? 14 : 16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Conteúdo ultra compacto */}
        <div className={`${isMobile ? 'p-3 space-y-3' : 'p-4 space-y-3'}`}>
          {/* Nome do Método */}
          <div>
            <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-semibold text-gray-700 mb-1.5`}>
              Nome do Método
            </label>
            <input
              type="text"
              placeholder="Ex: Cartão de crédito"
              value={taxaForm.nome}
              onChange={(e) => handleUpdateForm('nome', e.target.value)}
              style={{ fontSize: isMobile ? '16px' : '14px' }}
              className={`w-full ${isMobile ? 'px-3 py-2' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white`}
            />
          </div>

          {/* Taxa */}
          <div>
            <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-semibold text-gray-700 mb-1.5`}>
              <Percent size={12} className="inline mr-1" />
              Taxa (%)
            </label>
            <div className="relative">
              <span className={`absolute ${isMobile ? 'left-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm`}>
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
                style={{ fontSize: isMobile ? '16px' : '14px' }}
                className={`w-full ${isMobile ? 'pl-8 pr-3 py-2' : 'pl-8 pr-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white`}
              />
            </div>
          </div>
        </div>

        {/* Footer compacto */}
        <div className={`flex items-center justify-between ${isMobile ? 'px-3 py-2.5' : 'px-4 py-3'} bg-gray-50 rounded-b-2xl border-t border-gray-100`}>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className={`${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-200 disabled:opacity-50`}
            >
              Cancelar
            </button>
            {editingTaxa && onDelete && (
              <button
                onClick={handleDelete}
                className={`${isMobile ? 'px-3 py-1.5' : 'px-3 py-2'} text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1`}
              >
                <Trash2 size={14} />
                Deletar
              </button>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!isFormValid() || saving}
            className={`
              ${isMobile ? 'px-4 py-1.5' : 'px-6 py-2'} text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg
              ${isFormValid() && !saving
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {saving ? 'Salvando...' : editingTaxa ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}