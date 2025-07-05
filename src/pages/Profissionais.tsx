import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, User, UserPlus, Loader2, Users, Receipt, DollarSign } from 'lucide-react';
import { Professional } from '../types';
import { useProfessional } from '../contexts/ProfessionalContext';
import ProfessionalModal from '../components/ProfessionalModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ValesSection from '../components/financeiro/ValesSection';
import FechamentoCaixaSection from '../components/financeiro/FechamentoCaixaSection';
import Header from '../components/Header';

const Profissionais: React.FC<{ onToggleMobileSidebar?: () => void; isMobile?: boolean }> = ({ onToggleMobileSidebar, isMobile: isMobileProp }) => {
  const { professionals, loading, error, addProfessional, updateProfessional, removeProfessional } = useProfessional();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);
  const [isMobile, setIsMobile] = useState(isMobileProp || false);
  const [activeTab, setActiveTab] = useState<'profissionais' | 'vales' | 'fechamento'>('profissionais');

  useEffect(() => {
    if (isMobileProp !== undefined) {
      setIsMobile(isMobileProp);
      return;
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobileProp]);

  const handleAddProfessional = async (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => {
    const success = await addProfessional(professionalData);
    if (success) {
      setIsModalOpen(false);
      setEditingProfessional(null);
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

  const handleDeleteClick = (professional: Professional) => {
    setProfessionalToDelete(professional);
    setIsModalOpen(false); // Fechar o modal de edição
    setEditingProfessional(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProfessional(null);
  };

  const handleMenuClick = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  const handleNewProfessional = () => {
    setEditingProfessional(null);
    setIsModalOpen(true);
  };

  // Funções mockadas para Vales (você pode implementar com contexto próprio)
  const mockVales = [
    {
      id: '1',
      data: '2024-01-15',
      profissionalId: 'prof1',
      profissionalNome: 'Carmen Silva',
      valor: 50.00,
      status: 'pendente' as const,
      observacoes: 'Vale para almoço'
    },
    {
      id: '2', 
      data: '2024-01-10',
      profissionalId: 'prof2',
      profissionalNome: 'Ana Santos',
      valor: 100.00,
      status: 'descontado' as const,
      observacoes: 'Adiantamento salário'
    }
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  // Funções para Fechamento de Caixa (mockadas)
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [periodFilter, setPeriodFilter] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [hasSearched, setHasSearched] = useState(false);
  
  const mockServicos = [
    {
      data: '15/01/2024',
      cliente: 'Maria Silva',
      servico: 'Corte e Escova',
      valorBruto: 80.00,
      taxa: -4.00,
      comissao: 50,
      valorLiquido: 38.00
    }
  ];

  const formatPeriodDisplay = () => {
    if (periodFilter.start === periodFilter.end) {
      return formatDate(periodFilter.start);
    }
    return `${formatDate(periodFilter.start)} - ${formatDate(periodFilter.end)}`;
  };

  const getProfessionalName = (professionalId: string) => {
    const prof = professionals.find(p => p.id === professionalId);
    return prof ? prof.name : 'Profissional não encontrado';
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vales':
        return (
          <ValesSection
            vales={mockVales}
            loading={false}
            error={null}
            onNewVale={() => console.log('Novo vale')}
            onEditVale={(vale) => console.log('Editar vale', vale)}
            onDeleteVale={(vale) => console.log('Deletar vale', vale)}
            formatDate={formatDate}
          />
        );
      
      case 'fechamento':
        return (
          <FechamentoCaixaSection
            selectedProfessional={selectedProfessional}
            periodFilter={periodFilter}
            hasSearched={hasSearched}
            canSearch={!!selectedProfessional}
            servicosParaFechamento={mockServicos}
            totalLiquidoFechamento={38.00}
            profissionais={professionals}
            onProfessionalChange={setSelectedProfessional}
            onPeriodModalOpen={() => console.log('Abrir modal período')}
            onBuscar={() => setHasSearched(true)}
            onHistoricoModalOpen={() => console.log('Abrir histórico')}
            onFechamentoCaixaModalOpen={() => console.log('Fechar caixa')}
            formatPeriodDisplay={formatPeriodDisplay}
            getProfessionalName={getProfessionalName}
          />
        );
      
      default:
        return (
          <div className={`${isMobile ? 'space-y-2' : 'space-y-4'}`}>
            {/* Mensagem de erro */}
            {error && (
              <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${isMobile ? 'text-sm' : ''}`}>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Content */}
            {professionals.length === 0 ? (
              <div className={`bg-white rounded-lg shadow-sm text-center ${isMobile ? 'p-6' : 'p-8'}`}>
                <User className={`text-gray-400 mx-auto mb-4 ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`} />
                <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  Nenhum profissional cadastrado
                </h3>
                <p className={`text-gray-500 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                  Comece adicionando seus profissionais à equipe
                </p>
                <button
                  onClick={handleNewProfessional}
                  className={`bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center space-x-2 transition-colors mx-auto ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'}`}
                >
                  <UserPlus className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                  <span>{isMobile ? 'Adicionar' : 'Adicionar Primeiro Profissional'}</span>
                </button>
              </div>
            ) : (
              <>
                {isMobile ? (
                  // Cards para mobile - igual aos serviços
                  <div className="space-y-1.5 h-[calc(100vh-150px)] overflow-y-auto scrollbar-thin pr-1 pb-6">
                    {professionals.map((professional) => (
                      <div
                        key={professional.id}
                        onClick={() => openEditModal(professional)}
                        className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-2 hover:shadow-md hover:border-pink-200 transition-all duration-200 cursor-pointer active:scale-95"
                      >
                        {/* Ponto colorido no canto superior direito */}
                        <div 
                          className="absolute top-2 right-2 w-2 h-2 rounded-full"
                          style={{ backgroundColor: professional.color }}
                        ></div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            <h3 className="font-bold text-gray-900 text-sm truncate">
                              {professional.name}
                            </h3>
                            <span className="text-gray-400">•</span>
                            <p className="font-medium text-gray-600 text-xs truncate">
                              {professional.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Tabela para desktop - como serviços
                  <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Profissional
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cargo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Telefone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {professionals.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center">
                              <p className="text-gray-500">Nenhum profissional encontrado</p>
                            </td>
                          </tr>
                        ) : (
                          professionals.map((professional) => (
                            <tr 
                              key={professional.id} 
                              onClick={() => openEditModal(professional)}
                              className="hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div 
                                    className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-xs overflow-hidden"
                                    style={{ backgroundColor: professional.photo ? 'transparent' : professional.color }}
                                  >
                                    {professional.photo ? (
                                      <img
                                        src={professional.photo}
                                        alt={professional.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span>{professional.name.charAt(0).toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <span className="text-sm font-medium text-gray-900">
                                      {professional.name}
                                    </span>
                                    {professional.email && (
                                      <p className="text-xs text-gray-500">{professional.email}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-600">
                                  {professional.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-600">
                                  {professional.phone}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  professional.active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {professional.active ? 'Ativo' : 'Inativo'}
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
        );
    }
  };

  // Função para obter título dinâmico
  const getPageTitle = () => {
    switch (activeTab) {
      case 'vales':
        return 'Vales';
      case 'fechamento':
        return 'Fechamento de Caixa';
      default:
        return 'Profissionais';
    }
  };

  // Função para obter handler de adicionar baseado na aba
  const getAddClickHandler = () => {
    switch (activeTab) {
      case 'profissionais':
        return handleNewProfessional;
      case 'vales':
        return () => console.log('Novo vale');
      case 'fechamento':
        return undefined; // Fechamento não tem botão adicionar
      default:
        return undefined;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <Header 
        title={getPageTitle()}
        onAddClick={getAddClickHandler()}
        onMenuClick={handleMenuClick}
      />
      
      <div className="flex-1 bg-gray-50 overflow-hidden">
        <div className={`flex-1 overflow-hidden ${isMobile ? 'p-3' : 'p-4 md:p-6'}`}>
                    {/* Tabs de navegação */}
          <div className={`${isMobile ? 'border-b border-gray-200 bg-white p-2 mb-3' : 'bg-white rounded-xl shadow-sm border border-gray-200 mb-4'}`}>
            {isMobile ? (
              <nav className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('profissionais')}
                  className={`flex-1 py-2.5 px-2 font-medium text-sm flex items-center justify-center space-x-1 transition-all duration-200 rounded-lg ${
                    activeTab === 'profissionais'
                      ? 'text-pink-600 bg-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                  }`}
                >
                  <Users size={14} />
                  <span>Profissionais</span>
                </button>
                <button
                  onClick={() => setActiveTab('vales')}
                  className={`flex-1 py-2.5 px-2 font-medium text-sm flex items-center justify-center space-x-1 transition-all duration-200 rounded-lg ${
                    activeTab === 'vales'
                      ? 'text-pink-600 bg-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                  }`}
                >
                  <Receipt size={14} />
                  <span>Vales</span>
                </button>
                <button
                  onClick={() => setActiveTab('fechamento')}
                  className={`flex-1 py-2.5 px-1 font-medium text-xs flex items-center justify-center space-x-1 transition-all duration-200 rounded-lg ${
                    activeTab === 'fechamento'
                      ? 'text-pink-600 bg-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                  }`}
                >
                  <DollarSign size={14} />
                  <span>Fechamento</span>
                </button>
              </nav>
            ) : (
              <div className="border-b border-gray-200">
                <nav className="flex justify-start px-6">
                  <button
                    onClick={() => setActiveTab('profissionais')}
                    className={`flex items-center space-x-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'profissionais'
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Users size={16} />
                    <span>Profissionais</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('vales')}
                    className={`flex items-center space-x-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'vales'
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Receipt size={16} />
                    <span>Vales</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('fechamento')}
                    className={`flex items-center space-x-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'fechamento'
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <DollarSign size={16} />
                    <span>Fechamento de Caixa</span>
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Conteúdo das tabs */}
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      <ProfessionalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={editingProfessional ? handleEditProfessional : handleAddProfessional}
        editingProfessional={editingProfessional}
        onDelete={editingProfessional ? () => handleDeleteClick(editingProfessional) : undefined}
        isMobile={isMobile}
      />

      <DeleteConfirmationModal
        isOpen={!!professionalToDelete}
        onClose={() => setProfessionalToDelete(null)}
        onConfirm={handleDeleteProfessional}
        title="Excluir profissional?"
        message="Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default Profissionais;