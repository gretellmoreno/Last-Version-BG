import React, { useState } from 'react';
import { Search, User, AlertCircle, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import ClientModal from '../components/ClientModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useClient } from '../contexts/ClientContext';
import { Client } from '../types';

export default function Clientes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
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
      success = await updateClient(editingClient.id, clientData);
    } else {
      success = await addClient(clientData);
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

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Clientes" 
        subtitle="Gerencie seus clientes e histórico de visitas"
        action={{
          label: 'Novo Cliente',
          onClick: handleNewClient
        }}
      />
      
      <div className="flex-1 bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Buscar Clientes</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Busque por nome, telefone, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 m-6 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">Carregando clientes...</p>
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
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
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-indigo-600 font-medium text-sm">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {client.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{client.phone}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{client.email || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{client.cpf || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleEditClient(client)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                            disabled={loading}
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(client)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                            disabled={loading}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de cadastro/edição */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        editingClient={editingClient}
        loading={loading}
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