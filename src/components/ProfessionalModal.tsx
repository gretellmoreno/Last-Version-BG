import React, { useState, useEffect } from 'react';
import { X, User, Edit3, Camera, Upload, Trash2 } from 'lucide-react';
import { formatPhone, isValidPhone, formatCPF } from '../utils/phoneUtils';
import { Professional } from '../types';
import DatePickerCalendar from './DatePickerCalendar';

interface ProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => Promise<void>;
  editingProfessional?: Professional | null;
  onDelete?: () => void;
  loading?: boolean;
  isMobile?: boolean;
}

interface ProfessionalFormData {
  name: string;
  role: string;
  phone: string;
  email: string;
  cpf: string;
  color: string;
  active: boolean;
  photo?: string;
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
  onDelete,
  loading = false,
  isMobile = false
}: ProfessionalModalProps) {
  const [professionalForm, setProfessionalForm] = useState<ProfessionalFormData>({
    name: '',
    role: '',
    phone: '',
    email: '',
    cpf: '',
    color: CALENDAR_COLORS[0],
    active: true,
    photo: ''
  });

  // Detectar se é mobile (fallback se não vier via props)
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Usar props ou fallback interno
  const isMobileView = isMobile || isMobileDevice;

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingProfessional) {
      setProfessionalForm({
        name: editingProfessional.name || '',
        role: editingProfessional.role || '',
        phone: editingProfessional.phone || '',
        email: editingProfessional.email || '',
        cpf: (editingProfessional as any).cpf || '',
        color: editingProfessional.color || CALENDAR_COLORS[0],
        active: editingProfessional.active !== undefined ? editingProfessional.active : true,
        photo: editingProfessional.photo || ''
      });
    } else {
      setProfessionalForm({
        name: '',
        role: '',
        phone: '',
        email: '',
        cpf: '',
        color: CALENDAR_COLORS[0],
        active: true,
        photo: ''
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
    } else if (field === 'cpf') {
      // Aplicar máscara no CPF
      const formattedCPF = formatCPF(value as string);
      setProfessionalForm(prev => ({
        ...prev,
        [field]: formattedCPF
      }));
    } else {
      setProfessionalForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setProfessionalForm(prev => ({
          ...prev,
          photo: base64
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setProfessionalForm(prev => ({
      ...prev,
      photo: ''
    }));
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return professionalForm.name.trim() !== '' && 
           professionalForm.role.trim() !== '' &&
           professionalForm.phone.trim() !== '' && 
           isValidPhone(professionalForm.phone) &&
           professionalForm.email.trim() !== '' &&
           isValidEmail(professionalForm.email);
  };

  const handleSave = async () => {
    if (!isFormValid()) return;
    
    const professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'> = {
      name: professionalForm.name.trim(),
      role: professionalForm.role.trim(),
      phone: professionalForm.phone,
      email: professionalForm.email.trim(),
      color: professionalForm.color,
      commission_rate: 50, // Valor padrão fixo
      active: professionalForm.active,
      photo: professionalForm.photo || undefined
    };
    
    await onSave(professionalData);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={loading ? undefined : onClose} />
      
      {/* Modal - Layout responsivo */}
      <div className={`
        absolute bg-white shadow-xl flex flex-col overflow-hidden
        ${isMobileView 
          ? 'inset-x-4 bottom-0 top-16 rounded-t-3xl max-w-none' // Mobile: com margens laterais
          : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[580px] max-w-[calc(100vw-2rem)] max-h-[90vh] rounded-3xl' // Desktop: largura controlada
        }
      `}>
        {/* Header */}
        <div className={`flex items-center justify-between ${isMobileView ? 'px-4 py-3' : 'px-4 py-2'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center">
              <User size={10} className="text-pink-600" />
            </div>
            <h2 className={`font-medium text-gray-900 ${isMobileView ? 'text-sm' : 'text-xs'}`}>
              {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={loading}
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className={`space-y-${isMobileView ? '4' : '3'}`}>
            {/* Avatar com upload de foto */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div
                  className={`${isMobileView ? 'w-16 h-16' : 'w-20 h-20'} rounded-full flex items-center justify-center text-white font-bold overflow-hidden border-2 border-gray-200`}
                  style={{ backgroundColor: professionalForm.photo ? 'transparent' : professionalForm.color }}
                >
                  {professionalForm.photo ? (
                    <img
                      src={professionalForm.photo}
                      alt="Foto do profissional"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={`${isMobileView ? 'text-lg' : 'text-xl'}`}>
                      {professionalForm.name.charAt(0).toUpperCase() || 'P'}
                    </span>
                  )}
                </div>
                
                {/* Botão de câmera */}
                <div className="absolute -bottom-1 -right-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-pink-300 transition-colors shadow-sm"
                  >
                    <Camera size={14} className="text-gray-600" />
                  </label>
                </div>
              </div>
            </div>

            {/* Botão remover foto */}
            {professionalForm.photo && (
              <div className="flex justify-center">
                <button
                  onClick={removePhoto}
                  className="text-xs text-red-600 hover:text-red-800 transition-colors"
                >
                  Remover foto
                </button>
              </div>
            )}

            {/* Formulário em coluna única */}
            <div className="space-y-3">
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Digite o nome completo"
                  value={professionalForm.name}
                  onChange={(e) => handleUpdateForm('name', e.target.value)}
                  className={`w-full px-3 ${isMobileView ? 'py-2.5' : 'py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm`}
                />
              </div>

              {/* Função */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Função <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cabeleireira, Manicure, etc."
                  value={professionalForm.role}
                  onChange={(e) => handleUpdateForm('role', e.target.value)}
                  className={`w-full px-3 ${isMobileView ? 'py-2.5' : 'py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm`}
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={professionalForm.phone}
                  onChange={(e) => handleUpdateForm('phone', e.target.value)}
                  className={`w-full px-3 ${isMobileView ? 'py-2.5' : 'py-2'} border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm ${
                    professionalForm.phone.trim() !== '' && !isValidPhone(professionalForm.phone)
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {professionalForm.phone.trim() !== '' && !isValidPhone(professionalForm.phone) && (
                  <p className="text-red-500 text-xs mt-1">
                    Telefone deve ter 10 ou 11 dígitos
                  </p>
                )}
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={professionalForm.email}
                  onChange={(e) => handleUpdateForm('email', e.target.value)}
                  className={`w-full px-3 ${isMobileView ? 'py-2.5' : 'py-2'} border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm ${
                    professionalForm.email.trim() !== '' && !isValidEmail(professionalForm.email)
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {professionalForm.email.trim() !== '' && !isValidEmail(professionalForm.email) && (
                  <p className="text-red-500 text-xs mt-1">
                    E-mail deve ter formato válido
                  </p>
                )}
              </div>

              {/* CPF */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  CPF (opcional)
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={professionalForm.cpf}
                  onChange={(e) => handleUpdateForm('cpf', e.target.value)}
                  className={`w-full px-3 ${isMobileView ? 'py-2.5' : 'py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm`}
                />
              </div>

              {/* Cor do Calendário */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Cor no Calendário
                </label>
                <div className={`grid ${isMobileView ? 'grid-cols-8' : 'grid-cols-10'} gap-2`}>
                  {CALENDAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleUpdateForm('color', color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        professionalForm.color === color
                          ? 'border-gray-400 ring-2 ring-gray-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Status Ativo/Inativo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateForm('active', true)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                      professionalForm.active
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Ativo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateForm('active', false)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                      !professionalForm.active
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Inativo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            {editingProfessional && onDelete && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                disabled={loading}
              >
                <Trash2 size={14} />
                Deletar
              </button>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!isFormValid() || loading}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center space-x-2 ${
              isFormValid() && !loading
                ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <span>{editingProfessional ? 'Atualizar' : 'Criar Profissional'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}