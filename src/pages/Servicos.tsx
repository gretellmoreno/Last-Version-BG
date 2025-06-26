import React, { useState } from 'react';
import { Search, Scissors, Package, MoreVertical } from 'lucide-react';
import Header from '../components/Header';
import ServiceModal from '../components/ServiceModal';
import ProductModal from '../components/ProductModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ActionModal from '../components/ActionModal';
import { useService } from '../contexts/ServiceContext';
import { useProduct } from '../contexts/ProductContext';
import { Servico, Produto } from '../types';

export default function Servicos() {
  const [activeTab, setActiveTab] = useState<'servicos' | 'produtos'>('servicos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Servico | null>(null);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Servico | null>(null);
  const [productToDelete, setProductToDelete] = useState<Produto | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  
  const { servicos, addServico, updateServico, removeServico } = useService();
  const { produtos, addProduto, updateProduto, removeProduto } = useProduct();

  const filteredServicos = servicos.filter(servico =>
    servico.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNew = () => {
    if (activeTab === 'servicos') {
      setEditingService(null);
      setIsServiceModalOpen(true);
    } else {
      setEditingProduct(null);
      setIsProductModalOpen(true);
    }
  };

  const handleEditService = (servico: Servico) => {
    setEditingService(servico);
    setIsServiceModalOpen(true);
    setActionModalOpen(false);
  };

  const handleEditProduct = (produto: Produto) => {
    setEditingProduct(produto);
    setIsProductModalOpen(true);
    setActionModalOpen(false);
  };

  const handleSaveService = (servico: Servico) => {
    if (editingService) {
      updateServico(servico.id, servico);
    } else {
      addServico(servico);
    }
  };

  const handleSaveProduct = (produto: Produto) => {
    if (editingProduct) {
      updateProduto(produto.id, produto);
    } else {
      addProduto(produto);
    }
  };

  const handleDeleteClick = (item: Servico | Produto) => {
    if (activeTab === 'servicos') {
      setServiceToDelete(item as Servico);
    } else {
      setProductToDelete(item as Produto);
    }
    setDeleteModalOpen(true);
    setActionModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      removeServico(serviceToDelete.id);
      setServiceToDelete(null);
    }
    if (productToDelete) {
      removeProduto(productToDelete.id);
      setProductToDelete(null);
    }
    setDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setServiceToDelete(null);
    setProductToDelete(null);
  };

  const handleActionsClick = (item: Servico | Produto) => {
    if (activeTab === 'servicos') {
      setSelectedService(item as Servico);
      setSelectedProduct(null);
    } else {
      setSelectedProduct(item as Produto);
      setSelectedService(null);
    }
    setActionModalOpen(true);
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Serviços e Produtos" 
        action={{
          label: activeTab === 'servicos' ? 'Novo Serviço' : 'Novo Produto',
          onClick: handleNew
        }}
      />
      
      <div className="flex-1 bg-gray-50">
        <div className="border-b border-gray-200 bg-white">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('servicos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm mr-8 ${
                activeTab === 'servicos'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Scissors size={16} />
                <span>Serviços</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('produtos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'produtos'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package size={16} />
                <span>Produtos</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'servicos' && (
            <div className="bg-white rounded-lg shadow-sm">
              {/* Barra de busca */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Buscar Serviços</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Busque por nome do serviço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Lista de serviços em formato tabular */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serviço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duração
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comissão
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {/* Removido "Ações" - apenas espaço vazio */}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServicos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Scissors size={48} className="mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm 
                              ? 'Tente buscar com outros termos.' 
                              : 'Comece adicionando seu primeiro serviço.'
                            }
                          </p>
                          {!searchTerm && (
                            <button
                              onClick={handleNew}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              Cadastrar Primeiro Serviço
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredServicos.map((servico) => (
                        <tr key={servico.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                <Scissors size={20} className="text-indigo-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {servico.nome.replace('[Exemplo] ', '')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                              R$ {servico.preco.toFixed(2).replace('.', ',')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {formatDuration(servico.duracao)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-indigo-600 font-medium">
                              {servico.comissao}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleActionsClick(servico)}
                              className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Ações
                              <MoreVertical size={14} className="ml-1" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'produtos' && (
            <div className="bg-white rounded-lg shadow-sm">
              {/* Barra de busca */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Buscar Produtos</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Busque por nome do produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Lista de produtos em formato tabular */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estoque
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Margem
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {/* Removido "Ações" - apenas espaço vazio */}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProdutos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Package size={48} className="mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm 
                              ? 'Tente buscar com outros termos.' 
                              : 'Comece adicionando seu primeiro produto.'
                            }
                          </p>
                          {!searchTerm && (
                            <button
                              onClick={handleNew}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              Cadastrar Primeiro Produto
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredProdutos.map((produto) => {
                        const margem = produto.custoAquisicao && produto.preco 
                          ? (((produto.preco - produto.custoAquisicao) / produto.preco) * 100).toFixed(1)
                          : '0';
                        
                        return (
                          <tr key={produto.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <Package size={20} className="text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {produto.nome}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">
                                R$ {produto.preco.toFixed(2).replace('.', ',')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">
                                {produto.estoque} und.
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-green-600 font-medium">
                                {margem}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleActionsClick(produto)}
                                className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                Ações
                                <MoreVertical size={14} className="ml-1" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de cadastro/edição de serviços */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={handleSaveService}
        editingService={editingService}
      />

      {/* Modal de cadastro/edição de produtos */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

      {/* Modal de ações */}
      <ActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onEdit={() => {
          if (selectedService) handleEditService(selectedService);
          if (selectedProduct) handleEditProduct(selectedProduct);
        }}
        onDelete={() => {
          if (selectedService) handleDeleteClick(selectedService);
          if (selectedProduct) handleDeleteClick(selectedProduct);
        }}
      />

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Excluir ${activeTab === 'servicos' ? 'serviço' : 'produto'}?`}
        message={`Tem certeza que deseja excluir este ${activeTab === 'servicos' ? 'serviço' : 'produto'}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}