import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { Produto } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (produto: Produto) => void;
  editingProduct?: Produto | null;
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
  editingProduct
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
  }, [editingProduct, isOpen]);

  const handleUpdateForm = (field: keyof ProductFormData, value: string | boolean) => {
    setProductForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Calcular margem automaticamente quando custo ou preço mudam
      if (field === 'custoAquisicao' || field === 'precoVenda') {
        const custo = parseFloat(field === 'custoAquisicao' ? value as string : prev.custoAquisicao) || 0;
        const preco = parseFloat(field === 'precoVenda' ? value as string : prev.precoVenda) || 0;
        
        if (custo > 0 && preco > 0) {
          const margem = ((preco - custo) / preco) * 100;
          newForm.margemLucro = margem.toFixed(2);
        } else {
          newForm.margemLucro = '';
        }
      }
      
      return newForm;
    });
  };

  const isFormValid = () => {
    return productForm.nome.trim() !== '' && 
           productForm.custoAquisicao.trim() !== '' &&
           productForm.precoVenda.trim() !== '' &&
           productForm.estoque.trim() !== '';
  };

  const handleSave = () => {
    if (!isFormValid()) return;
    
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

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal - tamanho similar ao da imagem */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
              <Package size={14} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Novo Produto</h2>
              <p className="text-xs text-gray-500">Preencha os dados do produto</p>
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
              placeholder="Digite o nome do produto"
              value={productForm.nome}
              onChange={(e) => handleUpdateForm('nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Custo de Aquisição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custo de Aquisição (R$)
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
                value={productForm.custoAquisicao}
                onChange={(e) => handleUpdateForm('custoAquisicao', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Preço de Venda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço de Venda (R$)
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
                value={productForm.precoVenda}
                onChange={(e) => handleUpdateForm('precoVenda', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Margem de Lucro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Margem de Lucro (%)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                %
              </span>
              <input
                type="text"
                placeholder="Calculado automaticamente..."
                value={productForm.margemLucro}
                readOnly
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              A margem é calculada automaticamente com base no preço de venda e custo de aquisição
            </p>
          </div>

          {/* Estoque */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estoque
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="Quantidade em estoque..."
                min="0"
                value={productForm.estoque}
                onChange={(e) => handleUpdateForm('estoque', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col">
                <button 
                  type="button"
                  onClick={() => {
                    const currentValue = parseInt(productForm.estoque) || 0;
                    handleUpdateForm('estoque', (currentValue + 1).toString());
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xs leading-none"
                >
                  ▲
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const currentValue = parseInt(productForm.estoque) || 0;
                    if (currentValue > 0) {
                      handleUpdateForm('estoque', (currentValue - 1).toString());
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xs leading-none"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              placeholder="Descreva o produto... (opcional)"
              rows={3}
              value={productForm.observacoes}
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
                  checked={productForm.disponivel === true}
                  onChange={() => handleUpdateForm('disponivel', true)}
                  className="sr-only"
                />
                <div className={`
                  flex items-center px-4 py-2 rounded-md border text-sm cursor-pointer transition-colors
                  ${productForm.disponivel === true
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    productForm.disponivel === true ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  Sim
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="disponivel"
                  checked={productForm.disponivel === false}
                  onChange={() => handleUpdateForm('disponivel', false)}
                  className="sr-only"
                />
                <div className={`
                  flex items-center px-4 py-2 rounded-md border text-sm cursor-pointer transition-colors
                  ${productForm.disponivel === false
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    productForm.disponivel === false ? 'bg-red-500' : 'bg-gray-300'
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
                ? 'bg-green-600 text-white hover:bg-green-700'
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