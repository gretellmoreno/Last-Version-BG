import React, { useState, useMemo, useCallback } from 'react';
import Search from 'lucide-react/dist/esm/icons/search';
import User from 'lucide-react/dist/esm/icons/user';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import { useProfessional } from '../../contexts/ProfessionalContext';

interface ProfessionalSelectionProps {
  selectedServices: string[];
  onSelectProfessional: (professional: any) => void;
  onBack: () => void;
}

export default function ProfessionalSelection({
  selectedServices,
  onSelectProfessional,
  onBack
}: ProfessionalSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { professionals } = useProfessional();

  // Memoizar profissionais filtrados
  const filteredProfessionals = useMemo(() => {
    if (!professionals) return [];
    
    return professionals.filter(professional =>
      professional.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [professionals, searchTerm]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSelectProfessional = useCallback((professional: any) => {
    onSelectProfessional(professional);
  }, [onSelectProfessional]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="mr-3 p-1 hover:bg-gray-100 rounded-md transition-colors"
            title="Voltar"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Selecionar Profissional</h2>
        </div>
        {/* Barra de busca removida */}
      </div>

      {/* Lista de profissionais */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProfessionals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {professionals?.length === 0 
                ? 'Nenhum profissional cadastrado' 
                : searchTerm 
                  ? 'Nenhum profissional encontrado'
                  : 'Carregando profissionais...'
              }
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProfessionals.map((professional) => (
              <div
                key={professional.id}
                onClick={() => handleSelectProfessional(professional)}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {professional.name.replace('[Exemplo] ', '')}
                    </h4>
                    <p className="text-sm text-gray-500">Profissional</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 