import React, { useState, useEffect } from 'react';
import { X, User, Trash2, Phone, Mail, Hash, Calendar } from 'lucide-react';
import { formatPhone, isValidPhone, formatCPF } from '../utils/phoneUtils';
import { Client } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => Promise<void>;
  editingClient?: Client | null;
  onDelete?: () => void;
  loading?: boolean;
  isMobile?: boolean;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

export default function ClientModal({
  isOpen,
  onClose,
  onSave,
  editingClient,
  onDelete,
  loading = false,
  isMobile = false
}: ClientModalProps) {
  const [clientForm, setClientForm] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [internalIsMobile, setInternalIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setInternalIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isMobileDevice = isMobile || internalIsMobile;

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingClient) {
      setClientForm({
        name: editingClient.name || '',
        email: editingClient.email || '',
        phone: editingClient.phone || '',
        cpf: editingClient.cpf || '',
        birth_date: editingClient.birth_date || ''
      });
    } else {
      setClientForm({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        birth_date: ''
      });
    }
    setErrors({});
  }, [editingClient, isOpen]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!clientForm.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!clientForm.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!isValidPhone(clientForm.phone)) {
      newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateForm = (field: keyof ClientFormData, value: string) => {
    if (field === 'phone') {
      const formattedPhone = formatPhone(value);
      setClientForm(prev => ({
        ...prev,
        [field]: formattedPhone
      }));
    } else if (field === 'cpf') {
      const formattedCPF = formatCPF(value);
      setClientForm(prev => ({
        ...prev,
        [field]: formattedCPF
      }));
    } else {
      setClientForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Limpar erro do campo quando user começar a digitar
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const isFormValid = () => {
    return clientForm.name.trim() !== '' && 
           clientForm.phone.trim() !== '' && 
           isValidPhone(clientForm.phone) &&
           Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || loading) return;
    
    const clientData = {
      name: clientForm.name.trim(),
      email: clientForm.email.trim(),
      phone: clientForm.phone,
      cpf: clientForm.cpf.trim(),
      birth_date: clientForm.birth_date
    };
    
    await onSave(clientData);
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal - responsivo e compacto */}
      <div className={`
        absolute bg-white shadow-2xl
        ${isMobileDevice 
          ? 'inset-x-4 top-1/2 transform -translate-y-1/2 rounded-2xl' 
          : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[380px] rounded-2xl'
        }
      `}>
        {/* Header compacto */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-3">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              value={clientForm.name}
              onChange={(e) => handleUpdateForm('name', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors ${
                errors.name 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20'
              } focus:ring-2 focus:outline-none`}
              style={{ fontSize: isMobileDevice ? '16px' : '14px' }}
              disabled={loading}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Grid compacto para telefone e email */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Phone size={12} className="inline mr-1" />
                Telefone
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={clientForm.phone}
                onChange={(e) => handleUpdateForm('phone', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors ${
                  errors.phone 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                } focus:ring-2 focus:outline-none`}
                style={{ fontSize: isMobileDevice ? '16px' : '14px' }}
                disabled={loading}
              />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Mail size={12} className="inline mr-1" />
                E-mail (opcional)
              </label>
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={clientForm.email}
                onChange={(e) => handleUpdateForm('email', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm transition-colors focus:border-indigo-500 focus:ring-indigo-500/20 focus:ring-2 focus:outline-none"
                style={{ fontSize: isMobileDevice ? '16px' : '14px' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Grid para CPF e Data de Nascimento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Hash size={12} className="inline mr-1" />
                CPF
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={clientForm.cpf}
                onChange={(e) => handleUpdateForm('cpf', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm transition-colors focus:border-indigo-500 focus:ring-indigo-500/20 focus:ring-2 focus:outline-none"
                style={{ fontSize: isMobileDevice ? '16px' : '14px' }}
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Calendar size={12} className="inline mr-1" />
                Nascimento (opcional)
              </label>
              <input
                type="date"
                value={clientForm.birth_date}
                onChange={(e) => handleUpdateForm('birth_date', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:border-indigo-500 focus:ring-indigo-500/20 focus:ring-2 focus:outline-none bg-white text-gray-900 hover:border-gray-400"
                style={{ 
                  fontSize: isMobileDevice ? '16px' : '14px',
                  colorScheme: 'light'
                }}
                disabled={loading}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Footer fixo e compacto */}
        <div className="flex items-center justify-between p-3 border-t border-gray-100 bg-white rounded-b-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            {editingClient && onDelete && (
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
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <span>{editingClient ? 'Atualizar' : 'Criar Cliente'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}