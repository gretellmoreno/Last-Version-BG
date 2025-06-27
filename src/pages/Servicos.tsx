import React, { useState } from 'react';
import { Search, Scissors, Package, MoreVertical } from 'lucide-react';
import Header from '../components/Header';
import ServiceModal from '../components/ServiceModal';
import ProductModal from '../components/ProductModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ActionModal from '../components/ActionModal';
import { useService } from '../contexts/ServiceContext';
import { useProduct } from '../contexts/ProductContext';
import { Service, Product, Servico, Produto } from '../types';

export default function Servicos() {
  const [activeTab, setActiveTab] = useState<'servicos' | 'produtos'>('servicos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { services, addService, updateService, removeService } = useService();
  const { products, addProduct, updateProduct, removeProduct } = useProduct();

  const filteredServices = services?.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleNew = () => {
    if (activeTab === 'servicos') {
      setEditingService(null);
      setIsServiceModalOpen(true);
    } else {
      setEditingProduct(null);
      setIsProductModalOpen(true);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
    setActionModalOpen(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
    setActionModalOpen(false);
  };

  const handleSaveService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => {
    if (editingService) {
      await updateService(editingService.id, service);
    } else {
      await addService(service);
    }
    setIsServiceModalOpen(false);
  };

  const handleSaveProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, product);
    } else {
      await addProduct(product);
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteClick = (item: Service | Product) => {
    if (activeTab === 'servicos') {
      setServiceToDelete(item as Service);
    } else {
      setProductToDelete(item as Product);
    }
    setDeleteModalOpen(true);
    setActionModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (serviceToDelete) {
      await removeService(serviceToDelete.id);
      setServiceToDelete(null);
    }
    if (productToDelete) {
      await removeProduct(productToDelete.id);
      setProductToDelete(null);
    }
    setDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setServiceToDelete(null);
    setProductToDelete(null);
  };

  const handleActionsClick = (item: Service | Product) => {
    if (activeTab === 'servicos') {
      setSelectedService(item as Service);
      setSelectedProduct(null);
    } else {
      setSelectedProduct(item as Product);
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

  const convertServicoToService = (servico: Servico): Omit<Service, 'id' | 'created_at' | 'updated_at' | 'salon_id'> => ({
    name: servico.nome,
    price: servico.preco,
    estimated_time: servico.duracao,
    commission_rate: servico.comissao,
    active: true,
    description: ''
  });

  const convertProdutoToProduct = (produto: Produto): Omit<Product, 'id' | 'created_at' | 'updated_at' | 'salon_id'> => ({
    name: produto.nome,
    price: produto.preco,
    cost_price: produto.custoAquisicao || 0,
    profit_margin: produto.custoAquisicao ? ((produto.preco - produto.custoAquisicao) / produto.preco) * 100 : 0,
    stock: produto.estoque,
    description: ''
  });

  const convertServiceToServico = (service: Service): Servico => ({
    id: service.id,
    nome: service.name,
    preco: service.price,
    duracao: service.estimated_time,
    comissao: service.commission_rate
  });

  const convertProductToProduto = (product: Product): Produto => ({
    id: product.id,
    nome: product.name,
    preco: product.price,
    custoAquisicao: product.cost_price,
    estoque: product.stock
  });

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Serviços e Produtos" 
        onAddClick={handleNew}
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
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <p className="text-gray-500">Nenhum serviço encontrado</p>
                        </td>
                      </tr>
                    ) : (
                      filteredServices.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Scissors className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="ml-4">
                              <span className="text-sm font-medium text-gray-900">
                                  {service.name}
                              </span>
                                {service.description && (
                                  <p className="text-xs text-gray-500">{service.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                              R$ {service.price.toFixed(2).replace('.', ',')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {formatDuration(service.estimated_time)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-indigo-600 font-medium">
                              {service.commission_rate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleActionsClick(service)}
                              className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <MoreVertical size={16} className="text-gray-500" />
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
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <p className="text-gray-500">Nenhum produto encontrado</p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-indigo-600" />
                                </div>
                              <div className="ml-4">
                                <span className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </span>
                                {product.description && (
                                  <p className="text-xs text-gray-500">{product.description}</p>
                                )}
                              </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">
                              {product.stock} und.
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-indigo-600 font-medium">
                              {product.profit_margin}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                              onClick={() => handleActionsClick(product)}
                                className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              >
                              <MoreVertical size={16} className="text-gray-500" />
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
        </div>
      </div>

      {/* Modais */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={(servico) => handleSaveService(convertServicoToService(servico))}
        editingService={editingService ? convertServiceToServico(editingService) : null}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={(produto) => handleSaveProduct(convertProdutoToProduct(produto))}
        editingProduct={editingProduct ? convertProductToProduto(editingProduct) : null}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Excluir ${activeTab === 'servicos' ? 'Serviço' : 'Produto'}`}
        message={`Tem certeza que deseja excluir este ${activeTab === 'servicos' ? 'serviço' : 'produto'}? Esta ação não pode ser desfeita.`}
      />

      <ActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onEdit={activeTab === 'servicos' ? handleEditService : handleEditProduct}
        onDelete={handleDeleteClick}
        item={selectedService || selectedProduct}
        type={activeTab === 'servicos' ? 'service' : 'product'}
      />
    </div>
  );
}