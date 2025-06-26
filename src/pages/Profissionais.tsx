import React, { useState } from 'react';
import { useProfessional } from '../contexts/ProfessionalContext';
import { Professional } from '../types';
import ProfessionalModal from '../components/ProfessionalModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { User, Trash2, Edit3, UserPlus, Loader2 } from 'lucide-react';

const Profissionais: React.FC = () => {
  const { 
    professionals, 
    loading, 
    error, 
    addProfessional, 
    updateProfessional, 
    removeProfessional 
  } = useProfessional();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);

  const handleAddProfessional = async (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => {
    const success = await addProfessional(professionalData);
    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleEditProfessional = async (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => {
    if (!editingProfessional) return;
    
    const success = await updateProfessional(editingProfessional.id, professionalData);
    if (success) {
      setIsModalOpen(false);
      setEditingProfessional(null);
    }
  };

  const handleDeleteProfessional = async () => {
    if (!professionalToDelete) return;
    
    const success = await removeProfessional(professionalToDelete.id);
    if (success) {
      setProfessionalToDelete(null);
    }
  };

  const openEditModal = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProfessional(null);
  };

  if (loading && professionals.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
          <span className="text-gray-700">Carregando profissionais...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profissionais</h1>
            <p className="text-gray-600">Gerencie sua equipe de profissionais</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Profissional</span>
          </button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Lista de Profissionais */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="grid gap-4">
            {professionals.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum profissional cadastrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece adicionando seus profissionais à equipe
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center space-x-2 transition-colors mx-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Adicionar Primeiro Profissional</span>
                </button>
              </div>
            ) : (
              professionals.map((professional) => (
                <div
                  key={professional.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: professional.color }}
                    >
                      {professional.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{professional.name}</h3>
                      <p className="text-sm text-gray-600">{professional.role}</p>
                      <p className="text-sm text-gray-500">{professional.phone}</p>
                      {professional.email && (
                        <p className="text-sm text-gray-500">{professional.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right mr-4">
                      <p className="text-sm font-medium text-gray-900">
                        {professional.commission_rate}% comissão
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          professional.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {professional.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <button
                      onClick={() => openEditModal(professional)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-300 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setProfessionalToDelete(professional)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-gray-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Profissional */}
      <ProfessionalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={editingProfessional ? handleEditProfessional : handleAddProfessional}
        editingProfessional={editingProfessional}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmationModal
        isOpen={!!professionalToDelete}
        onClose={() => setProfessionalToDelete(null)}
        onConfirm={handleDeleteProfessional}
        title="Excluir Profissional"
        message={`Tem certeza que deseja excluir o profissional "${professionalToDelete?.name}"? Esta ação não pode ser desfeita.`}
        loading={loading}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
            <span className="text-gray-700">Processando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profissionais;