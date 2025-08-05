import React, { useState, useEffect } from 'react';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Edit from 'lucide-react/dist/esm/icons/edit';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
import TaxaModal from '../TaxaModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { useTaxas } from '../../contexts/TaxasContext';

interface TaxasSectionProps {
  onNewTaxa?: () => void;
}

export default function TaxasSection({ onNewTaxa }: TaxasSectionProps) {
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

  // Chamar onNewTaxa do props se existir, senão usar função local
  const handleNewTaxaClick = () => {
    if (onNewTaxa) {
      onNewTaxa();
    } else {
      handleNewTaxa();
    }
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

  const handleDeleteTaxa = async () => {
    if (editingTaxa) {
      try {
        const success = await removeTaxa(editingTaxa.id);
        if (success) {
          setIsTaxaModalOpen(false);
          setEditingTaxa(null);
        }
      } catch (err) {
        console.error('Erro ao deletar taxa:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 text-center ${isMobile ? 'p-8' : 'p-12'}`}>
        <p className="text-gray-500">Carregando métodos de pagamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 text-center ${isMobile ? 'p-8' : 'p-12'}`}>
        <p className="text-red-500">Erro: {error}</p>
      </div>
    );
  }

  return (
    <>
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
              onClick={handleNewTaxaClick}
              className={`bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${isMobile ? 'px-4 py-2.5 text-sm' : 'px-6 py-3'}`}
            >
              Adicionar Primeiro Método
            </button>
          </div>
        ) : (
          <>
            {isMobile ? (
              // Cards Mobile - Limpos e Clicáveis
              <div className="space-y-1.5 p-4">
                {taxas.map((taxa) => (
                  <div 
                    key={taxa.id} 
                    onClick={() => handleEditTaxa(taxa)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <CreditCard size={16} className="text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900">{taxa.nome}</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Método de pagamento</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          {taxa.taxa.toFixed(2).replace('.', ',')}%
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Taxa</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Cards Desktop - Grid de 2 colunas
              <div className="grid grid-cols-2 gap-4 p-6">
                {taxas.map((taxa) => (
                  <div 
                    key={taxa.id} 
                    onClick={() => handleEditTaxa(taxa)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <CreditCard size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base text-gray-900">{taxa.nome}</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Método de pagamento</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-gray-900">
                          {taxa.taxa.toFixed(2).replace('.', ',')}%
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Taxa</p>
                      </div>
                    </div>
                  </div>
                ))}
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
        onDelete={editingTaxa ? handleDeleteTaxa : undefined}
      />
    </>
  );
}