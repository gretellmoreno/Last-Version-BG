import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, TrendingUp, Hash, Trash2 } from 'lucide-react';
import { Produto } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (produto: Produto) => void;
  editingProduct?: Produto | null;
  onDelete?: () => void;
}

interface ProductFormData {
  nome: string;
  custoAquisicao: string;
  precoVenda: string;
  margemLucro: string;
  estoque: string;
  observacoes: string;
  disponivel: boolean;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  onDelete
}: ProductModalProps) {
  const [productForm, setProductForm] = useState<ProductFormData>({
    nome: '',
    custoAquisicao: '',
    precoVenda: '',
    margemLucro: '',
    estoque: '',
    observacoes: '',
    disponivel: true
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
    if (editingProduct) {
      const margemCalculada = editingProduct.custoAquisicao && editingProduct.preco 
        ? (((editingProduct.preco - editingProduct.custoAquisicao) / editingProduct.preco) * 100).toFixed(2)
        : '';
      
      setProductForm({
        nome: editingProduct.nome || '',
        custoAquisicao: editingProduct.custoAquisicao?.toString() || '',
        precoVenda: editingProduct.preco.toString() || '',
        margemLucro: margemCalculada,
        estoque: editingProduct.estoque.toString() || '',
        observacoes: '',
        disponivel: true
      });
    } else {
      setProductForm({
        nome: '',
        custoAquisicao: '',
        precoVenda: '',
        margemLucro: '',
        estoque: '',
        observacoes: '',
        disponivel: true
      });
    }
    setErrors({});
  }, [editingProduct, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!productForm.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!productForm.custoAquisicao.trim()) {
      newErrors.custoAquisicao = 'Custo é obrigatório';
    } else if (parseFloat(productForm.custoAquisicao) < 0) {
      newErrors.custoAquisicao = 'Custo deve ser positivo';
    }
    
    if (!productForm.precoVenda.trim()) {
      newErrors.precoVenda = 'Preço é obrigatório';
    } else if (parseFloat(productForm.precoVenda) <= 0) {
      newErrors.precoVenda = 'Preço deve ser maior que zero';
    }
    
    if (!productForm.estoque.trim()) {
      newErrors.estoque = 'Estoque é obrigatório';
    } else if (parseInt(productForm.estoque) < 0) {
      newErrors.estoque = 'Estoque deve ser positivo';
    }
    
    // Validar se preço é maior que custo
    const custo = parseFloat(productForm.custoAquisicao) || 0;
    const preco = parseFloat(productForm.precoVenda) || 0;
    if (custo > 0 && preco > 0 && preco <= custo) {
      newErrors.precoVenda = 'Preço deve ser maior que o custo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateForm = (field: keyof ProductFormData, value: string | boolean) => {
    setProductForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Calcular margem automaticamente quando custo ou preço mudam
      if (field === 'custoAquisicao' || field === 'precoVenda') {
        const custo = parseFloat(field === 'custoAquisicao' ? value as string : prev.custoAquisicao) || 0;
        const preco = parseFloat(field === 'precoVenda' ? value as string : prev.precoVenda) || 0;
        
        if (custo > 0 && preco > 0) {
          const margem = ((preco - custo) / preco) * 100;
          newForm.margemLucro = margem.toFixed(1);
        } else {
          newForm.margemLucro = '';
        }
      }
      
      return newForm;
    });
    
    // Limpar erro do campo quando user começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const isFormValid = () => {
    return productForm.nome.trim() !== '' && 
           productForm.custoAquisicao.trim() !== '' &&
           productForm.precoVenda.trim() !== '' &&
           productForm.estoque.trim() !== '' &&
           Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const produto: Produto = {
      id: editingProduct?.id || Date.now().toString(),
      nome: productForm.nome.trim(),
      preco: parseFloat(productForm.precoVenda) || 0,
      custoAquisicao: parseFloat(productForm.custoAquisicao) || 0,
      estoque: parseInt(productForm.estoque) || 0
    };
    
    onSave(produto);
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
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
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
              Nome do Produto
            </label>
            <input
              type="text"
              placeholder="Ex: Shampoo Profissional"
              value={productForm.nome}
              onChange={(e) => handleUpdateForm('nome', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors ${
                errors.nome 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-500/20'
              } focus:ring-2 focus:outline-none`}
              style={{ fontSize: isMobile ? '16px' : '14px' }}
            />
            {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
          </div>

          {/* Grid compacto para custos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <DollarSign size={12} className="inline mr-1" />
                Custo
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
                  value={productForm.custoAquisicao}
                  onChange={(e) => handleUpdateForm('custoAquisicao', e.target.value)}
                  className={`w-full pl-8 pr-3 py-2.5 border rounded-lg text-sm transition-colors ${
                    errors.custoAquisicao 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-500/20'
                  } focus:ring-2 focus:outline-none`}
                  style={{ fontSize: isMobile ? '16px' : '14px' }}
                />
              </div>
              {errors.custoAquisicao && <p className="text-xs text-red-600 mt-1">{errors.custoAquisicao}</p>}
            </div>
            
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
                  value={productForm.precoVenda}
                  onChange={(e) => handleUpdateForm('precoVenda', e.target.value)}
                  className={`w-full pl-8 pr-3 py-2.5 border rounded-lg text-sm transition-colors ${
                    errors.precoVenda 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-500/20'
                  } focus:ring-2 focus:outline-none`}
                  style={{ fontSize: isMobile ? '16px' : '14px' }}
                />
              </div>
              {errors.precoVenda && <p className="text-xs text-red-600 mt-1">{errors.precoVenda}</p>}
            </div>
          </div>

          {/* Grid para margem e estoque */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <TrendingUp size={12} className="inline mr-1" />
                Margem
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Automático"
                  value={productForm.margemLucro ? `${productForm.margemLucro}%` : ''}
                  readOnly
                  className="w-full px-3 pr-8 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
                  style={{ fontSize: isMobile ? '16px' : '14px' }}
                />
                <TrendingUp size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Hash size={12} className="inline mr-1" />
                Estoque
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={productForm.estoque}
                onChange={(e) => handleUpdateForm('estoque', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors ${
                  errors.estoque 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 focus:border-green-500 focus:ring-green-500/20'
                } focus:ring-2 focus:outline-none`}
                style={{ fontSize: isMobile ? '16px' : '14px' }}
              />
              {errors.estoque && <p className="text-xs text-red-600 mt-1">{errors.estoque}</p>}
            </div>
          </div>

          {/* Toggle de disponibilidade compacto */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex bg-gray-50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleUpdateForm('disponivel', true)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  productForm.disponivel
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Ativo
              </button>
              <button
                type="button"
                onClick={() => handleUpdateForm('disponivel', false)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  !productForm.disponivel
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Inativo
              </button>
            </div>
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
            {editingProduct && onDelete && (
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
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {editingProduct ? 'Atualizar' : 'Criar Produto'}
          </button>
        </div>
      </div>
    </div>
  );
}