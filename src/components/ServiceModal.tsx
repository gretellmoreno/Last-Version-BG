import React, { useState, useEffect } from 'react';
import { X, Scissors } from 'lucide-react';
import { Servico } from '../types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (servico: Servico) => void;
  editingService?: Servico | null;
}

interface ServiceFormData {
  nome: string;
  preco: string;
  tempoAproximado: string;
  comissao: string;
  observacoes: string;
  disponivel: boolean;
}

export default function ServiceModal({
  isOpen,
  onClose,
  onSave,
  editingService
}: ServiceModalProps) {
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    nome: '',
    preco: '',
    tempoAproximado: '',
    comissao: '',
    observacoes: '',
    disponivel: true
  });

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingService) {
      setServiceForm({
        nome: editingService.nome || '',
        preco: editingService.preco.toString() || '',
        tempoAproximado: editingService.duracao.toString() || '',
        comissao: editingService.comissao.toString() || '',
        observacoes: '',
        disponivel: true
      });
    } else {
      setServiceForm({
        nome: '',
        preco: '',
        tempoAproximado: '',
        comissao: '',
        observacoes: '',
        disponivel: true
      });
    }
  }, [editingService, isOpen]);

  const handleUpdateForm = (field: keyof ServiceFormData, value: string | boolean) => {
    setServiceForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return serviceForm.nome.trim() !== '' && 
           serviceForm.preco.trim() !== '' &&
           serviceForm.tempoAproximado.trim() !== '' &&
           serviceForm.comissao.trim() !== '';
  };

  const handleSave = () => {
    if (!isFormValid()) return;
    
    const servico: Servico = {
      id: editingService?.id || Date.now().toString(),
      nome: serviceForm.nome.trim(),
      preco: parseFloat(serviceForm.preco) || 0,
      duracao: parseInt(serviceForm.tempoAproximado) || 0,
      comissao: parseFloat(serviceForm.comissao) || 0
    };
    
    onSave(servico);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal - tamanho exato da imagem */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">
              <Scissors size={14} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Novo Serviço</h2>
              <p className="text-xs text-gray-500">Preencha os dados do serviço</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              placeholder="Digite o nome do serviço"
              value={serviceForm.nome}
              onChange={(e) => handleUpdateForm('nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Preço e Tempo Aproximado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  R$
                </span>
                <input
                  type="number"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  value={serviceForm.preco}
                  onChange={(e) => handleUpdateForm('preco', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo Aproximado
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Ex: 15, 30, 45..."
                  min="1"
                  value={serviceForm.tempoAproximado}
                  onChange={(e) => handleUpdateForm('tempoAproximado', e.target.value)}
                  className="w-full px-3 pr-12 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  min
                </span>
              </div>
            </div>
          </div>

          {/* Comissão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comissão (%)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                %
              </span>
              <input
                type="number"
                placeholder="Ex: 10, 20, 30..."
                min="0"
                max="100"
                value={serviceForm.comissao}
                onChange={(e) => handleUpdateForm('comissao', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Porcentagem que o profissional receberá pelo serviço
            </p>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              placeholder="Descreva o serviço... (opcional)"
              rows={3}
              value={serviceForm.observacoes}
              onChange={(e) => handleUpdateForm('observacoes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
            />
          </div>

          {/* Disponível */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disponível
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="disponivel"
                  checked={serviceForm.disponivel === true}
                  onChange={() => handleUpdateForm('disponivel', true)}
                  className="sr-only"
                />
                <div className={`
                  flex items-center px-4 py-2 rounded-md border text-sm cursor-pointer transition-colors
                  ${serviceForm.disponivel === true
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    serviceForm.disponivel === true ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  Sim
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="disponivel"
                  checked={serviceForm.disponivel === false}
                  onChange={() => handleUpdateForm('disponivel', false)}
                  className="sr-only"
                />
                <div className={`
                  flex items-center px-4 py-2 rounded-md border text-sm cursor-pointer transition-colors
                  ${serviceForm.disponivel === false
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    serviceForm.disponivel === false ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  Não
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleCancel}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid()}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              isFormValid()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}