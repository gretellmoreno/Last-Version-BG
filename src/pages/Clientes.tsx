import React, { useState, useEffect } from 'react';
import { Search, User, AlertCircle, Loader2, Edit3, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import ClientModal from '../components/ClientModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useClient } from '../contexts/ClientContext';
import { Client } from '../types';

export default function Clientes({ onToggleMobileSidebar, isMobile: isMobileProp }: { onToggleMobileSidebar?: () => void; isMobile?: boolean } = {}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [internalIsMobile, setInternalIsMobile] = useState(false);
  
  const { 
    clients, 
    loading, 
    error, 
    searchTerm, 
    setSearchTerm,
    addClient, 
    updateClient, 
    removeClient 
  } = useClient();

  // Detectar se é mobile (fallback se não vier via props)
  useEffect(() => {
    const checkMobile = () => {
      setInternalIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isMobile = isMobileProp !== undefined ? isMobileProp : internalIsMobile;

  const handleNewClient = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => {
    let success = false;
    
    if (editingClient) {
      success = await updateClient(editingClient.id, {
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
        cpf: clientData.cpf,
        birth_date: clientData.birth_date
      });
    } else {
      // Criar objeto com tipos corretos para addClient
      const clientToAdd = {
        ...clientData,
        salon_id: '', // Será preenchido pelo context
        updated_at: new Date().toISOString()
      };
      success = await addClient(clientToAdd);
    }
    
    if (success) {
      setIsModalOpen(false);
      setEditingClient(null);
    }
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      const success = await removeClient(clientToDelete.id);
      if (success) {
        setDeleteModalOpen(false);
        setClientToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const handleMenuClick = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  // Componente de loading responsivo
  const LoadingState = () => (
    <div className={`${isMobile ? 'p-6' : 'px-6 py-12'} text-center`}>
      <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-500">Carregando clientes...</p>
    </div>
  );

  // Estado vazio responsivo
  const EmptyState = () => (
    <div className={`${isMobile ? 'p-6' : 'px-6 py-12'} text-center`}>
      <User size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
      </h3>
      <p className="text-gray-500 mb-4">
        {searchTerm 
          ? 'Tente buscar com outros termos.' 
          : 'Comece adicionando seu primeiro cliente.'
        }
      </p>
      {!searchTerm && (
        <button
          onClick={handleNewClient}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Cadastrar Primeiro Cliente
        </button>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full">
      <Header 
        title="Clientes" 
        onAddClick={handleNewClient}
        onMenuClick={handleMenuClick}
      />
      
      <div className="flex-1 bg-gray-50 overflow-hidden">
        {/* Mensagem de erro */}
        {error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Barra de busca */}
        <div className="p-4 md:p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Busque por nome, telefone, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              style={isMobile ? { fontSize: '16px' } : {}}
              disabled={loading}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 pt-2 overflow-hidden">
          {loading ? (
            <LoadingState />
          ) : clients.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {isMobile ? (
                // Cards para mobile - compactos como outras páginas
                <div className="space-y-1.5 h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin pr-1 pb-6">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleEditClient(client)}
                      className="relative bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer active:scale-95"
                    >
                      {/* Ponto colorido no canto superior direito */}
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500"></div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={14} className="text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-xs truncate">
                            {client.name}
                          </h3>
                          <p className="text-gray-500 text-xs truncate">
                            {client.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Cards para desktop - compactos como outras páginas
                <div className="grid grid-cols-2 gap-3 h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin pr-1 pb-6">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleEditClient(client)}
                      className="relative bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer"
                    >
                      {/* Ponto colorido no canto superior direito */}
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500"></div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 font-medium text-xs">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-xs truncate">
                            {client.name}
                          </h3>
                          <p className="text-gray-500 text-xs truncate">
                            {client.phone}
                          </p>
                          {client.email && (
                            <p className="text-gray-400 text-xs truncate">
                              {client.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de cadastro/edição */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        editingClient={editingClient}
        onDelete={editingClient ? () => handleDeleteClick(editingClient) : undefined}
        loading={loading}
        isMobile={isMobile}
      />

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir cliente?"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        loading={loading}
      />
    </div>
  );
}