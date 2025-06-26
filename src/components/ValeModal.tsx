import React, { useState, useEffect } from 'react';
import { X, Receipt, Calendar, User, DollarSign } from 'lucide-react';
import { useProfessional } from '../contexts/ProfessionalContext';

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
  onSave: (vale: Omit<Vale, 'id' | 'status'> | Vale) => Promise<void>;
  editingVale?: Vale | null;
}

interface ValeFormData {
  data: string;
  profissionalId: string;
  valor: string;
  observacoes: string;
}

export default function ValeModal({
  isOpen,
  onClose,
  onSave,
  editingVale
}: ValeModalProps) {
  const { professionals } = useProfessional();
  const [saving, setSaving] = useState(false);
  
  const [valeForm, setValeForm] = useState<ValeFormData>({
    data: new Date().toISOString().split('T')[0],
    profissionalId: '',
    valor: '',
    observacoes: ''
  });

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingVale) {
      setValeForm({
        data: editingVale.data,
        profissionalId: editingVale.profissionalId,
        valor: editingVale.valor.toString(),
        observacoes: editingVale.observacoes || ''
      });
    } else {
      setValeForm({
        data: new Date().toISOString().split('T')[0],
        profissionalId: '',
        valor: '',
        observacoes: ''
      });
    }
  }, [editingVale, isOpen]);

  const handleUpdateForm = (field: keyof ValeFormData, value: string) => {
    setValeForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return valeForm.data.trim() !== '' && 
           valeForm.profissionalId.trim() !== '' &&
           valeForm.valor.trim() !== '' &&
           parseFloat(valeForm.valor) > 0;
  };

  const handleSave = async () => {
    if (!isFormValid() || saving) return;
    
    setSaving(true);
    try {
      const profissional = professionals?.find(p => p.id === valeForm.profissionalId);
      
      const vale = {
        id: editingVale?.id || '',
        data: valeForm.data,
        profissionalId: valeForm.profissionalId,
        profissionalNome: profissional?.name || '',
        valor: parseFloat(valeForm.valor),
        status: 'pendente' as const,
        observacoes: valeForm.observacoes.trim()
      };
      
      await onSave(vale);
    } catch (err) {
      console.error('Erro ao salvar vale:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
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
              <Receipt size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingVale ? 'Editar Vale' : 'Registrar Novo Vale'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editingVale ? 'Atualize os dados do vale' : 'Preencha os dados do vale'}
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo do formulário */}
        <div className="p-6 space-y-5">
          {/* Data */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Data
            </label>
            <input
              type="date"
              value={valeForm.data}
              onChange={(e) => handleUpdateForm('data', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
            />
          </div>

          {/* Profissional */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Profissional
            </label>
            <select
              value={valeForm.profissionalId}
              onChange={(e) => handleUpdateForm('profissionalId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
            >
              <option value="">Selecione um profissional</option>
              {professionals?.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              )) || []}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                R$
              </span>
              <input
                type="number"
                placeholder="0,00"
                step="0.01"
                min="0"
                value={valeForm.valor}
                onChange={(e) => handleUpdateForm('valor', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              placeholder="Adicione observações sobre o vale... (opcional)"
              rows={3}
              value={valeForm.observacoes}
              onChange={(e) => handleUpdateForm('observacoes', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm bg-gray-50 hover:bg-white resize-none"
            />
          </div>
        </div>

        {/* Footer com botões */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid() || saving}
            className={`
              px-8 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg
              ${isFormValid() && !saving
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {saving ? 'Salvando...' : editingVale ? 'Atualizar Vale' : 'Registrar Vale'}
          </button>
        </div>
      </div>
    </div>
  );
}