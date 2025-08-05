import React, { useState, useEffect } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import Scissors from 'lucide-react/dist/esm/icons/scissors';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Percent from 'lucide-react/dist/esm/icons/percent';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import { Servico } from '../types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (servico: Servico) => void;
  editingService?: Servico | null;
  onDelete?: () => void;
}

interface ServiceFormData {
  nome: string;
  preco: string;
  tempoAproximado: string;
  comissao: string;
  observacoes: string;
}

export default function ServiceModal({
  isOpen,
  onClose,
  onSave,
  editingService,
  onDelete
}: ServiceModalProps) {
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    nome: '',
    preco: '',
    tempoAproximado: '',
    comissao: '',
    observacoes: ''
  });
  const [isMobile, setIsMobile] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detecção de mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingService) {
      setServiceForm({
        nome: editingService.nome || '',
        preco: editingService.preco.toString() || '',
        tempoAproximado: editingService.duracao.toString() || '',
        comissao: editingService.comissao.toString() || '',
        observacoes: ''
      });
    } else {
      setServiceForm({
        nome: '',
        preco: '',
        tempoAproximado: '30',
        comissao: '',
        observacoes: ''
      });
    }
    setErrors({});
  }, [editingService, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!serviceForm.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!serviceForm.preco.trim()) {
      newErrors.preco = 'Preço é obrigatório';
    } else if (parseFloat(serviceForm.preco) <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }
    
    if (!serviceForm.tempoAproximado.trim()) {
      newErrors.tempoAproximado = 'Tempo é obrigatório';
    } else if (parseInt(serviceForm.tempoAproximado) < 5) {
      newErrors.tempoAproximado = 'Tempo mínimo é 5 minutos';
    }
    
    if (!serviceForm.comissao.trim()) {
      newErrors.comissao = 'Comissão é obrigatória';
    } else if (parseFloat(serviceForm.comissao) < 0 || parseFloat(serviceForm.comissao) > 100) {
      newErrors.comissao = 'Comissão deve estar entre 0 e 100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateForm = (field: keyof ServiceFormData, value: string | boolean) => {
    setServiceForm(prev => ({
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
    return serviceForm.nome.trim() !== '' && 
           serviceForm.preco.trim() !== '' &&
           serviceForm.tempoAproximado.trim() !== '' &&
           parseInt(serviceForm.tempoAproximado) >= 5 &&
           serviceForm.comissao.trim() !== '' &&
           Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    console.log('🔥 ServiceModal - handleSave chamado!');
    console.log('Formulário:', serviceForm);
    
    if (!validateForm()) {
      console.log('❌ Validação falhou');
      return;
    }
    
    const servico: Servico = {
      id: editingService?.id || Date.now().toString(),
      nome: serviceForm.nome.trim(),
      preco: parseFloat(serviceForm.preco) || 0,
      duracao: parseInt(serviceForm.tempoAproximado) || 0,
      comissao: parseFloat(serviceForm.comissao) || 0
    };
    
    console.log('✅ Serviço criado:', servico);
    onSave(servico);
    onClose();
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
        ${isMobile 
          ? 'inset-x-4 top-1/2 transform -translate-y-1/2 rounded-2xl' 
          : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[380px] rounded-2xl'
        }
      `}>
        {/* Header compacto */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Scissors size={16} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
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
              Nome do Serviço
            </label>
            <input
              type="text"
              placeholder="Ex: Corte Masculino"
              value={serviceForm.nome}
              onChange={(e) => handleUpdateForm('nome', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors ${
                errors.nome 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'
              } focus:ring-2 focus:outline-none`}
              style={{ fontSize: isMobile ? '16px' : '14px' }}
            />
            {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
          </div>

          {/* Grid compacto para preço e tempo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <DollarSign size={12} className="inline mr-1" />
                Preço
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                  R$
                </span>
                <input
                  type="number"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  value={serviceForm.preco}
                  onChange={(e) => handleUpdateForm('preco', e.target.value)}
                  className={`w-full pl-8 pr-3 py-2.5 border rounded-lg text-sm transition-colors ${
                    errors.preco 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'
                  } focus:ring-2 focus:outline-none`}
                  style={{ fontSize: isMobile ? '16px' : '14px' }}
                />
              </div>
              {errors.preco && <p className="text-xs text-red-600 mt-1">{errors.preco}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Clock size={12} className="inline mr-1" />
                Tempo
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* Seletor de Horas */}
                <div className="relative">
                  <select
                    value={Math.floor(parseInt(serviceForm.tempoAproximado) / 60) || 0}
                    onChange={(e) => {
                      const hours = parseInt(e.target.value);
                      const minutes = parseInt(serviceForm.tempoAproximado) % 60;
                      const totalMinutes = hours * 60 + minutes;
                      handleUpdateForm('tempoAproximado', totalMinutes.toString());
                    }}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors ${
                      errors.tempoAproximado 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'
                    } focus:ring-2 focus:outline-none`}
                    style={{ fontSize: isMobile ? '16px' : '14px' }}
                  >
                    {Array.from({ length: 9 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}h
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Seletor de Minutos */}
                <div className="relative">
                  <select
                    value={parseInt(serviceForm.tempoAproximado) % 60 || 0}
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value);
                      const hours = Math.floor(parseInt(serviceForm.tempoAproximado) / 60);
                      const totalMinutes = hours * 60 + minutes;
                      handleUpdateForm('tempoAproximado', totalMinutes.toString());
                    }}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors ${
                      errors.tempoAproximado 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'
                    } focus:ring-2 focus:outline-none`}
                    style={{ fontSize: isMobile ? '16px' : '14px' }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i * 5} value={i * 5}>
                        {i * 5}min
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {errors.tempoAproximado && <p className="text-xs text-red-600 mt-1">{errors.tempoAproximado}</p>}
            </div>
          </div>

          {/* Comissão */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Percent size={12} className="inline mr-1" />
              Comissão do Profissional
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="50"
                min="0"
                max="100"
                value={serviceForm.comissao}
                onChange={(e) => handleUpdateForm('comissao', e.target.value)}
                className={`w-full px-3 pr-8 py-2.5 border rounded-lg text-sm transition-colors ${
                  errors.comissao 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'
                } focus:ring-2 focus:outline-none`}
                style={{ fontSize: isMobile ? '16px' : '14px' }}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                %
              </span>
            </div>
            {errors.comissao && <p className="text-xs text-red-600 mt-1">{errors.comissao}</p>}
          </div>


        </div>

        {/* Footer fixo e compacto */}
        <div className="flex items-center justify-between p-3 border-t border-gray-100 bg-white rounded-b-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            {editingService && onDelete && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 size={14} />
                Deletar
              </button>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!isFormValid()}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              isFormValid()
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {editingService ? 'Atualizar' : 'Criar Serviço'}
          </button>
        </div>
      </div>
    </div>
  );
}