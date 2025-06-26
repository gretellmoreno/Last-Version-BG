import React, { useState } from 'react';
import { CreditCard, Plus, Edit, Trash2 } from 'lucide-react';
import TaxaModal from '../TaxaModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { useTaxas } from '../../contexts/TaxasContext';

export default function TaxasSection() {
  const [isTaxaModalOpen, setIsTaxaModalOpen] = useState(false);
  const [editingTaxa, setEditingTaxa] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taxaToDelete, setTaxaToDelete] = useState<any>(null);
  
  const { taxas, addTaxa, updateTaxa, removeTaxa } = useTaxas();

  const handleNewTaxa = () => {
    setEditingTaxa(null);
    setIsTaxaModalOpen(true);
  };

  const handleEditTaxa = (taxa: any) => {
    setEditingTaxa(taxa);
    setIsTaxaModalOpen(true);
  };

  const handleSaveTaxa = (taxa: any) => {
    if (editingTaxa) {
      updateTaxa(taxa.id, taxa);
    } else {
      addTaxa(taxa);
    }
  };

  const handleDeleteClick = (taxa: any) => {
    setTaxaToDelete(taxa);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taxaToDelete) {
      removeTaxa(taxaToDelete.id);
      setDeleteModalOpen(false);
      setTaxaToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setTaxaToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Taxas de Pagamento</h2>
          <p className="text-gray-600 mt-1">Configure métodos de pagamento e suas taxas</p>
        </div>
        <button
          onClick={handleNewTaxa}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="font-semibold">Novo Método de Pagamento</span>
        </button>
      </div>

      {/* Lista de métodos de pagamento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {taxas.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum método cadastrado</h3>
            <p className="text-gray-600 mb-6">Comece adicionando seu primeiro método de pagamento.</p>
            <button
              onClick={handleNewTaxa}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Adicionar Primeiro Método
            </button>
          </div>
        ) : (
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
              <tbody className="bg-white divide-y divide-gray-200">
                {taxas.map((taxa) => (
                  <tr key={taxa.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <CreditCard size={20} className="text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {taxa.nome.replace('[Exemplo]', '')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {taxa.taxa.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEditTaxa(taxa)}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(taxa)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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