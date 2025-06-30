import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { formatPhone, isValidPhone } from '../../utils/phoneUtils';
import DatePickerCalendar from '../DatePickerCalendar';

interface ClientFormProps {
  clientForm: {
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string;
    dataNascimento: string;
    ano: string;
  };
  onUpdateForm: (field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ClientForm({
  clientForm,
  onUpdateForm,
  onSave,
  onCancel
}: ClientFormProps) {
  // Validar formulário
  const isFormValid = () => {
    return clientForm.nome.trim() !== '' && 
           clientForm.telefone.trim() !== '' && 
           isValidPhone(clientForm.telefone);
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhone(value);
    onUpdateForm('telefone', formattedPhone);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        {/* Header compacto */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Voltar"
            >
              <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Cadastrar Cliente</h2>
          </div>
        </div>

        {/* Formulário em grid responsivo */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
            {/* Coluna esquerda - Informações básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Informações Pessoais
              </h3>
              
              {/* Nome e Sobrenome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ex.: João"
                    value={clientForm.nome}
                    onChange={(e) => onUpdateForm('nome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    placeholder="ex.: Silva"
                    value={clientForm.sobrenome}
                    onChange={(e) => onUpdateForm('sobrenome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="exemplo@dominio.com"
                  value={clientForm.email}
                  onChange={(e) => onUpdateForm('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm">
                    <option>+55</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={clientForm.telefone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                {clientForm.telefone && !isValidPhone(clientForm.telefone) && (
                  <p className="text-xs text-red-500 mt-1">
                    Telefone deve ter entre 10 e 11 dígitos
                  </p>
                )}
              </div>
            </div>

            {/* Coluna direita - Informações adicionais */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Informações Adicionais
              </h3>

              {/* Data de nascimento com calendário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de nascimento
                  </label>
                  <DatePickerCalendar
                    selectedDate={clientForm.dataNascimento}
                    onDateChange={(date) => onUpdateForm('dataNascimento', date)}
                    placeholder="Dia e mês"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano
                  </label>
                  <input
                    type="number"
                    placeholder="1990"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={clientForm.ano}
                    onChange={(e) => onUpdateForm('ano', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Espaço para futuras informações */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">
                  Campos adicionais podem ser incluídos conforme necessário
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer compacto */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={!isFormValid()}
            className={`px-6 py-2 text-sm rounded-lg transition-colors ${
              isFormValid()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Salvar e Continuar
          </button>
        </div>
      </div>
    </div>
  );
}