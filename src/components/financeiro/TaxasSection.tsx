import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit, Trash2, Edit3 } from 'lucide-react';
import TaxaModal from '../TaxaModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { useTaxas } from '../../contexts/TaxasContext';

export default function TaxasSection() {
  const [isTaxaModalOpen, setIsTaxaModalOpen] = useState(false);
  const [editingTaxa, setEditingTaxa] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taxaToDelete, setTaxaToDelete] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const { taxas, loading, error, addTaxa, updateTaxa, removeTaxa } = useTaxas();

  const handleNewTaxa = () => {
    setEditingTaxa(null);
    setIsTaxaModalOpen(true);
  };

  const handleEditTaxa = (taxa: any) => {
    setEditingTaxa(taxa);
    setIsTaxaModalOpen(true);
  };

  const handleSaveTaxa = async (taxa: any) => {
    try {
      let success = false;
    if (editingTaxa) {
        success = await updateTaxa(taxa.id, taxa);
    } else {
        success = await addTaxa(taxa);
      }
      
      if (success) {
        setIsTaxaModalOpen(false);
        setEditingTaxa(null);
      }
    } catch (err) {
      console.error('Erro ao salvar taxa:', err);
    }
  };

  const handleDeleteClick = (taxa: any) => {
    setTaxaToDelete(taxa);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taxaToDelete) {
      try {
        const success = await removeTaxa(taxaToDelete.id);
        if (success) {
      setDeleteModalOpen(false);
      setTaxaToDelete(null);
        }
      } catch (err) {
        console.error('Erro ao deletar taxa:', err);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setTaxaToDelete(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              Taxas de Pagamento
            </h2>
            <p className={`text-gray-600 mt-1 ${isMobile ? 'text-sm' : ''}`}>
              Configure métodos de pagamento e suas taxas
            </p>
          </div>
        </div>
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 text-center ${isMobile ? 'p-8' : 'p-12'}`}>
          <p className="text-gray-500">Carregando métodos de pagamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              Taxas de Pagamento
            </h2>
            <p className={`text-gray-600 mt-1 ${isMobile ? 'text-sm' : ''}`}>
              Configure métodos de pagamento e suas taxas
            </p>
          </div>
        </div>
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 text-center ${isMobile ? 'p-8' : 'p-12'}`}>
          <p className="text-red-500">Erro: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da seção responsivo */}
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-4' : ''}`}>
        <div>
          <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Taxas de Pagamento
          </h2>
          <p className={`text-gray-600 mt-1 ${isMobile ? 'text-sm' : ''}`}>
            Configure métodos de pagamento e suas taxas
          </p>
        </div>
        <button
          onClick={handleNewTaxa}
          className={`flex items-center space-x-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl ${isMobile ? 'px-4 py-2.5 text-sm' : 'px-6 py-3'}`}
        >
          <Plus size={isMobile ? 18 : 20} />
          <span className="font-semibold">{isMobile ? 'Novo Método' : 'Novo Método de Pagamento'}</span>
        </button>
      </div>

      {/* Lista de métodos de pagamento responsiva */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {taxas.length === 0 ? (
          <div className={`text-center ${isMobile ? 'p-8' : 'p-12'}`}>
            <CreditCard size={isMobile ? 40 : 48} className="mx-auto text-gray-400 mb-4" />
            <h3 className={`font-semibold text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
              Nenhum método cadastrado
            </h3>
            <p className={`text-gray-600 mb-6 ${isMobile ? 'text-sm' : ''}`}>
              Comece adicionando seu primeiro método de pagamento.
            </p>
            <button
              onClick={handleNewTaxa}
              className={`bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${isMobile ? 'px-4 py-2.5 text-sm' : 'px-6 py-3'}`}
            >
              Adicionar Primeiro Método
            </button>
          </div>
        ) : (
          <>
            {isMobile ? (
              /* Cards Mobile */
              <div className="divide-y divide-gray-200">
                {taxas.map((taxa) => (
                  <div key={taxa.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <CreditCard size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{taxa.nome}</p>
                          <p className="text-xs text-gray-500">Método de pagamento</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          {taxa.taxa.toFixed(2).replace('.', ',')}%
                        </p>
                        <p className="text-xs text-gray-500">Taxa</p>
                      </div>
                    </div>
                    
                    {/* Botões de ação */}
                    <div className="flex justify-end space-x-2 mt-3">
                      <button 
                        onClick={() => handleEditTaxa(taxa)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={14} />
                        <span className="text-sm font-medium">Editar</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(taxa)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                        <span className="text-sm font-medium">Excluir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Tabela Desktop */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Taxa (%)
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {taxas.map((taxa) => (
                      <tr key={taxa.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <CreditCard size={16} className="text-indigo-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{taxa.nome}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 font-semibold">
                            {taxa.taxa.toFixed(2).replace('.', ',')}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleEditTaxa(taxa)}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(taxa)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de cadastro/edição */}
      <TaxaModal
        isOpen={isTaxaModalOpen}
        onClose={() => setIsTaxaModalOpen(false)}
        onSave={handleSaveTaxa}
        editingTaxa={editingTaxa}
      />

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir método de pagamento?"
        message="Tem certeza que deseja excluir este método de pagamento? Esta ação não pode ser desfeita."
      />
    </div>
  );
}