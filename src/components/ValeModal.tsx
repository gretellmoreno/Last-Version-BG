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
  onDelete?: () => void;
}

interface ValeFormData {
  data: string;
  profissionalId: string;
  valor: string;
}

export default function ValeModal({
  isOpen,
  onClose,
  onSave,
  editingVale,
  onDelete
}: ValeModalProps) {
  const { professionals } = useProfessional();
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [valeForm, setValeForm] = useState<ValeFormData>({
    data: new Date().toISOString().split('T')[0],
    profissionalId: '',
    valor: ''
  });

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
    if (editingVale) {
      setValeForm({
        data: editingVale.data,
        profissionalId: editingVale.profissionalId,
        valor: editingVale.valor.toString()
      });
    } else {
      setValeForm({
        data: new Date().toISOString().split('T')[0],
        profissionalId: '',
        valor: ''
      });
    }
    setErrors({});
  }, [editingVale, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!valeForm.data.trim()) {
      newErrors.data = 'Data é obrigatória';
    }
    
    if (!valeForm.profissionalId.trim()) {
      newErrors.profissionalId = 'Profissional é obrigatório';
    }
    
    if (!valeForm.valor.trim()) {
      newErrors.valor = 'Valor é obrigatório';
    } else if (parseFloat(valeForm.valor) <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateForm = (field: keyof ValeFormData, value: string) => {
    setValeForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando user começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const isFormValid = () => {
    return valeForm.data.trim() !== '' && 
           valeForm.profissionalId.trim() !== '' &&
           valeForm.valor.trim() !== '' &&
           parseFloat(valeForm.valor) > 0 &&
           Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || saving) return;
    
    setSaving(true);
    try {
      const profissional = professionals?.find(p => p.id === valeForm.profissionalId);
      
      const vale = {
        id: editingVale?.id || '',
        data: valeForm.data,
        profissionalId: valeForm.profissionalId,
        profissionalNome: profissional?.name || '',
        valor: parseFloat(valeForm.valor),
        status: 'pendente' as const
      };
      
      await onSave(vale);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar vale:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal - responsivo e compacto */}
      <div className={`
        absolute bg-white shadow-2xl
        ${isMobile 
          ? 'inset-x-4 top-1/2 transform -translate-y-1/2 rounded-2xl max-w-sm mx-auto' 
          : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[380px] rounded-2xl'
        }
      `}>
        {/* Header compacto */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Receipt size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {editingVale ? 'Editar Vale' : 'Novo Vale'}
              </h2>
              <p className="text-xs text-gray-500">
                {editingVale ? 'Atualize os dados' : 'Preencha as informações'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-4">
          {/* Data - Campo limpo e funcional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Data do Vale
            </label>
            <input
              type="date"
              value={valeForm.data}
              onChange={(e) => handleUpdateForm('data', e.target.value)}
              className={`
                w-full px-4 py-3 border rounded-xl font-medium
                transition-all duration-200 bg-gray-50 hover:bg-white
                ${errors.data 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                } 
                focus:ring-2 focus:outline-none focus:bg-white
                ${isMobile ? 'text-base' : 'text-sm'}
              `}
              style={{ 
                fontSize: isMobile ? '16px' : '14px',
                colorScheme: 'light'
              }}
            />
            {errors.data && <p className="text-xs text-red-600 mt-1">{errors.data}</p>}
          </div>

          {/* Profissional - Select customizado e bonito */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Profissional
            </label>
            <div className="relative">
              <select
                value={valeForm.profissionalId}
                onChange={(e) => handleUpdateForm('profissionalId', e.target.value)}
                className={`
                  w-full px-4 py-3 border rounded-xl font-medium text-center
                  transition-all duration-200 bg-gray-50 hover:bg-white
                  appearance-none cursor-pointer
                  ${errors.profissionalId 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  } 
                  focus:ring-2 focus:outline-none focus:bg-white
                  ${isMobile ? 'text-base' : 'text-sm'}
                `}
                style={{ fontSize: isMobile ? '16px' : '14px' }}
              >
                <option value="" disabled>
                  Selecione um profissional
                </option>
                {professionals?.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name}
                  </option>
                )) || []}
              </select>
              {/* Ícone de seta customizado */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.profissionalId && <p className="text-xs text-red-600 mt-1">{errors.profissionalId}</p>}
          </div>

          {/* Valor - Campo bonito e centralizado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Valor do Vale
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0,00"
                step="0.01"
                min="0"
                value={valeForm.valor}
                onChange={(e) => handleUpdateForm('valor', e.target.value)}
                className={`
                  w-full px-4 py-3 border rounded-xl text-center font-medium
                  transition-all duration-200 bg-gray-50 hover:bg-white
                  ${errors.valor 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  } 
                  focus:ring-2 focus:outline-none focus:bg-white
                  ${isMobile ? 'text-base' : 'text-sm'}
                `}
                style={{ fontSize: isMobile ? '16px' : '14px' }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <span className="text-gray-500 font-medium">R$</span>
              </div>
            </div>
            {errors.valor && <p className="text-xs text-red-600 mt-1">{errors.valor}</p>}
          </div>
        </div>

        {/* Footer elegante */}
        <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            {editingVale && onDelete && (
              <button
                onClick={onDelete}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Excluir
              </button>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!isFormValid() || saving}
            className={`
              px-6 py-2.5 text-sm font-medium rounded-lg transition-all
              ${isFormValid() && !saving
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {saving ? 'Salvando...' : editingVale ? 'Atualizar' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}