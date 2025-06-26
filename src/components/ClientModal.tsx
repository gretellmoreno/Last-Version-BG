import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { formatPhone, isValidPhone } from '../utils/phoneUtils';
import { Client } from '../types';
import DatePickerCalendar from './DatePickerCalendar';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => Promise<void>;
  editingClient?: Client | null;
  loading?: boolean;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
}

export default function ClientModal({
  isOpen,
  onClose,
  onSave,
  editingClient,
  loading = false
}: ClientModalProps) {
  const [clientForm, setClientForm] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: ''
  });

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
  }, [editingClient, isOpen]);

  const handleUpdateForm = (field: keyof ClientFormData, value: string) => {
    if (field === 'phone') {
      // Aplicar máscara no telefone
      const formattedPhone = formatPhone(value);
      setClientForm(prev => ({
        ...prev,
        [field]: formattedPhone
      }));
    } else {
      setClientForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const isFormValid = () => {
    return clientForm.name.trim() !== '' && 
           clientForm.phone.trim() !== '' && 
           isValidPhone(clientForm.phone);
  };

  const handleSave = async () => {
    if (!isFormValid() || loading) return;
    
    const clientData = {
      name: clientForm.name.trim(),
      email: clientForm.email.trim(),
      phone: clientForm.phone,
      cpf: clientForm.cpf.trim(),
      birth_date: clientForm.birth_date
    };
    
    await onSave(clientData);
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={12} className="text-indigo-600" />
            </div>
            <h2 className="text-sm font-medium text-gray-900">
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={loading}
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Coluna esquerda */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-gray-900">
                Informações Pessoais
              </h3>
              
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex.: João Silva"
                  value={clientForm.name}
                  onChange={(e) => handleUpdateForm('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  disabled={loading}
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="exemplo@dominio.com"
                  value={clientForm.email}
                  onChange={(e) => handleUpdateForm('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  disabled={loading}
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <select className="px-2 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm w-16" disabled={loading}>
                    <option>+55</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={clientForm.phone}
                    onChange={(e) => handleUpdateForm('phone', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    disabled={loading}
                  />
                </div>
                {clientForm.phone && !isValidPhone(clientForm.phone) && (
                  <p className="text-xs text-red-500 mt-1">
                    Formato inválido. Use (11) 99999-9999
                  </p>
                )}
              </div>
            </div>

            {/* Coluna direita */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-gray-900">
                Informações Adicionais
              </h3>

              {/* CPF */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={clientForm.cpf}
                  onChange={(e) => handleUpdateForm('cpf', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  disabled={loading}
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={clientForm.birth_date}
                  onChange={(e) => handleUpdateForm('birth_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid() || loading}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}