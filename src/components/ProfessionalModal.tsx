import React, { useState, useEffect } from 'react';
import { X, User, Edit3 } from 'lucide-react';
import { formatPhone, isValidPhone } from '../utils/phoneUtils';
import { Professional } from '../types';
import DatePickerCalendar from './DatePickerCalendar';

interface ProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => Promise<void>;
  editingProfessional?: Professional | null;
  loading?: boolean;
}

interface ProfessionalFormData {
  name: string;
  role: string;
  phone: string;
  email: string;
  color: string;
  commission_rate: number;
  active: boolean;
}

const CALENDAR_COLORS = [
  '#E0E7FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6',
  '#C084FC', '#F3E8FF', '#E879F9', '#D946EF', '#C026D2', '#A21CAF',
  '#FDE68A', '#FCD34D', '#F59E0B', '#D97706', '#92400E', '#78350F',
  '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D', '#166534',
  '#67E8F9', '#22D3EE', '#06B6D4', '#0891B2', '#0E7490', '#155E75'
];

export default function ProfessionalModal({
  isOpen,
  onClose,
  onSave,
  editingProfessional,
  loading = false
}: ProfessionalModalProps) {
  const [professionalForm, setProfessionalForm] = useState<ProfessionalFormData>({
    name: '',
    role: '',
    phone: '',
    email: '',
    color: CALENDAR_COLORS[0],
    commission_rate: 50,
    active: true
  });

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingProfessional) {
      setProfessionalForm({
        name: editingProfessional.name || '',
        role: editingProfessional.role || '',
        phone: editingProfessional.phone || '',
        email: editingProfessional.email || '',
        color: editingProfessional.color || CALENDAR_COLORS[0],
        commission_rate: editingProfessional.commission_rate || 50,
        active: editingProfessional.active !== undefined ? editingProfessional.active : true
      });
    } else {
      setProfessionalForm({
        name: '',
        role: '',
        phone: '',
        email: '',
        color: CALENDAR_COLORS[0],
        commission_rate: 50,
        active: true
      });
    }
  }, [editingProfessional, isOpen]);

  const handleUpdateForm = (field: keyof ProfessionalFormData, value: string | number | boolean) => {
    if (field === 'phone') {
      // Aplicar máscara no telefone
      const formattedPhone = formatPhone(value as string);
      setProfessionalForm(prev => ({
        ...prev,
        [field]: formattedPhone
      }));
    } else {
      setProfessionalForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const isFormValid = () => {
    return professionalForm.name.trim() !== '' && 
           professionalForm.role.trim() !== '' &&
           professionalForm.phone.trim() !== '' && 
           isValidPhone(professionalForm.phone) &&
           professionalForm.commission_rate >= 0 && 
           professionalForm.commission_rate <= 100;
  };

  const handleSave = async () => {
    if (!isFormValid()) return;
    
    const professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'> = {
      name: professionalForm.name.trim(),
      role: professionalForm.role.trim(),
      phone: professionalForm.phone,
      email: professionalForm.email.trim(),
      color: professionalForm.color,
      commission_rate: professionalForm.commission_rate,
      active: professionalForm.active
    };
    
    await onSave(professionalData);
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={loading ? undefined : onClose} />
      
      {/* Modal - tamanho adaptado */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center relative">
              <User size={24} className="text-pink-600" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                <Edit3 size={10} className="text-gray-600" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
              </h2>
              <p className="text-sm text-gray-500">Gerenciar dados do profissional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            disabled={loading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Avatar com cor selecionada */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center relative text-white font-bold text-2xl"
                style={{ backgroundColor: professionalForm.color }}
              >
                {professionalForm.name ? professionalForm.name.charAt(0).toUpperCase() : 'P'}
                <button 
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                  type="button"
                >
                  <Edit3 size={12} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Formulário em grid 2 colunas */}
            <div className="grid grid-cols-2 gap-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={professionalForm.name}
                  onChange={(e) => handleUpdateForm('name', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm disabled:bg-gray-50"
                />
              </div>

              {/* Função/Cargo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função/Cargo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={professionalForm.role}
                  onChange={(e) => handleUpdateForm('role', e.target.value)}
                  disabled={loading}
                  placeholder="Ex: Cabeleireira, Manicure, Esteticista"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm disabled:bg-gray-50"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={professionalForm.phone}
                  onChange={(e) => handleUpdateForm('phone', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm disabled:bg-gray-50"
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={professionalForm.email}
                  onChange={(e) => handleUpdateForm('email', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm disabled:bg-gray-50"
                />
              </div>

              {/* Taxa de Comissão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Comissão (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={professionalForm.commission_rate}
                  onChange={(e) => handleUpdateForm('commission_rate', Number(e.target.value))}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm disabled:bg-gray-50"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={professionalForm.active ? 'true' : 'false'}
                  onChange={(e) => handleUpdateForm('active', e.target.value === 'true')}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm disabled:bg-gray-50"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>

            {/* Cor do Calendário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cor do Calendário
              </label>
              <div className="grid grid-cols-10 gap-2">
                {CALENDAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleUpdateForm('color', color)}
                    disabled={loading}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === professionalForm.color 
                        ? 'border-gray-600 scale-110' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid() || loading}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}