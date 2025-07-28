import React, { useState, useEffect } from 'react';
import { Scissors, Package, Edit3, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import ServiceModal from '../components/ServiceModal';
import ProductModal from '../components/ProductModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

import { useService, ServiceProvider } from '../contexts/ServiceContext';
import { useProduct, ProductProvider } from '../contexts/ProductContext';
import { Service, Product, Servico, Produto } from '../types';

function ServicosContent({ onToggleMobileSidebar }: { onToggleMobileSidebar?: () => void } = {}) {
  const [activeTab, setActiveTab] = useState<'servicos' | 'produtos'>('servicos');

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  
  const { services, addService, updateService, removeService } = useService();
  const { products, addProduct, updateProduct, removeProduct } = useProduct();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredServices = services || [];

  const filteredProducts = products || [];

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
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
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

  const handleMenuClick = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 page-content">
      <Header 
        title="Serviços e Produtos" 
        onAddClick={handleNew}
        onMenuClick={handleMenuClick}
      />
      
      <div className="flex-1 bg-gray-50 min-h-0">
        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white p-2">
          <nav className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('servicos')}
              className={`flex-1 ${isMobile ? 'py-2.5 px-2' : 'py-2.5 px-4'} font-medium ${isMobile ? 'text-xs' : 'text-sm'} flex items-center justify-center ${isMobile ? 'space-x-1' : 'space-x-2'} transition-all duration-200 rounded-lg ${
                activeTab === 'servicos'
                  ? 'text-purple-600 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
              }`}
            >
              <Scissors size={isMobile ? 14 : 16} />
                <span>Serviços</span>
            </button>
            <button
              onClick={() => setActiveTab('produtos')}
              className={`flex-1 ${isMobile ? 'py-2.5 px-2' : 'py-2.5 px-4'} font-medium ${isMobile ? 'text-xs' : 'text-sm'} flex items-center justify-center ${isMobile ? 'space-x-1' : 'space-x-2'} transition-all duration-200 rounded-lg ${
                activeTab === 'produtos'
                  ? 'text-green-600 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
              }`}
            >
              <Package size={isMobile ? 14 : 16} />
                <span>Produtos</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          {/* Serviços */}
          {activeTab === 'servicos' && (
            <>
              {isMobile ? (
                // Cards para mobile
                <div className="space-y-1.5 h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin pr-1 pb-6">
                  {filteredServices.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                      <p className="text-gray-500">Nenhum serviço encontrado</p>
                    </div>
                  ) : (
                    filteredServices.map((service) => (
                      <div 
                        key={service.id} 
                        onClick={() => handleEditService(service)}
                        className="relative bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer active:scale-95"
                      >
                        
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex-1 pr-4">
                            <h3 className="font-medium text-gray-900 text-xs">{service.name}</h3>
                </div>
              </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          <div>
                            <p className="font-semibold text-xs text-gray-900">
                              R$ {service.price.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-gray-600">{formatDuration(service.estimated_time)}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-purple-600">{service.commission_rate}%</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Tabela para desktop
                <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServices.length === 0 ? (
                      <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                          <p className="text-gray-500">Nenhum serviço encontrado</p>
                        </td>
                      </tr>
                    ) : (
                      filteredServices.map((service) => (
                          <tr 
                            key={service.id} 
                            onClick={() => handleEditService(service)}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <Scissors className="h-4 w-4 text-purple-600" />
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
                              <span className="text-sm text-purple-600 font-medium">
                              {service.commission_rate}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              )}
            </>
          )}

          {/* Produtos */}
          {activeTab === 'produtos' && (
            <>
              {isMobile ? (
                // Cards para mobile
                <div className="space-y-1.5 h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin pr-1 pb-6">
                  {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                      <p className="text-gray-500">Nenhum produto encontrado</p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        onClick={() => handleEditProduct(product)}
                        className="relative bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md hover:border-green-200 transition-all duration-200 cursor-pointer active:scale-95"
                      >
                        
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex-1 pr-4">
                            <h3 className="font-medium text-gray-900 text-xs">{product.name}</h3>
                </div>
              </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          <div>
                            <p className="font-semibold text-xs text-gray-900">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-gray-600">{product.stock} und.</p>
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-green-600">{product.profit_margin.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Tabela para desktop
                <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                          <p className="text-gray-500">Nenhum produto encontrado</p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                          <tr 
                            key={product.id} 
                            onClick={() => handleEditProduct(product)}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Package className="h-4 w-4 text-green-600" />
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
                              <span className="text-sm text-green-600 font-medium">
                                {product.profit_margin.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modais */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={(servico) => handleSaveService(convertServicoToService(servico))}
        editingService={editingService ? convertServiceToServico(editingService) : null}
        onDelete={editingService ? () => handleDeleteClick(editingService) : undefined}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={(produto) => handleSaveProduct(convertProdutoToProduct(produto))}
        editingProduct={editingProduct ? convertProductToProduto(editingProduct) : null}
        onDelete={editingProduct ? () => handleDeleteClick(editingProduct) : undefined}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Excluir ${activeTab === 'servicos' ? 'Serviço' : 'Produto'}`}
        message={`Tem certeza que deseja excluir este ${activeTab === 'servicos' ? 'serviço' : 'produto'}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}

export default function Servicos(props: { onToggleMobileSidebar?: () => void }) {
  return (
    <ServiceProvider>
      <ProductProvider>
        <ServicosContent {...props} />
      </ProductProvider>
    </ServiceProvider>
  );
}