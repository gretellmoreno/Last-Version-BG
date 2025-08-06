import React, { useState, useEffect } from 'react';
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import User from 'lucide-react/dist/esm/icons/user';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Users from 'lucide-react/dist/esm/icons/users';
import Receipt from 'lucide-react/dist/esm/icons/receipt';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import { toast } from 'react-hot-toast';
import { Professional } from '../types';
import { useProfessional, ProfessionalProvider } from '../contexts/ProfessionalContext';
import { useFinanceiro, FinanceiroProvider } from '../contexts/FinanceiroContext';
import ProfessionalModal from '../components/ProfessionalModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ValesSection from '../components/financeiro/ValesSection';
import FechamentoCaixaSection from '../components/financeiro/FechamentoCaixaSection';
import ValeModal from '../components/ValeModal';
import Header from '../components/Header';
import HistoricoFechamentoModal from '../components/HistoricoFechamentoModal';
import PeriodFilterModal from '../components/PeriodFilterModal';
import { supabaseService } from '../lib/supabaseService';
import { getTodayLocal, formatDateForDisplay } from '../utils/dateUtils';
import { DEFAULT_PROFESSIONAL_COLOR } from '../utils/colorUtils';
import ProfessionalSuccessModal from '../components/ProfessionalSuccessModal';
import { useAuth } from '../contexts/AuthContext';

const ProfissionaisContent: React.FC<{ onToggleMobileSidebar?: () => void; isMobile?: boolean }> = ({ onToggleMobileSidebar, isMobile: isMobileProp }) => {
  const { professionals, loading, error, addProfessional, updateProfessional, removeProfessional } = useProfessional();
  const { removeVale } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);
  const [isMobile, setIsMobile] = useState(isMobileProp || false);
  const [activeTab, setActiveTab] = useState<'profissionais' | 'vales' | 'fechamento'>('profissionais');
  
  // Estados para o modal de sucesso
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newProfessionalInfo, setNewProfessionalInfo] = useState<{ name: string; email: string } | null>(null);

  // Estados para ValeModal
  const [isValeModalOpen, setIsValeModalOpen] = useState(false);
  const [editingVale, setEditingVale] = useState<any>(null);
  
  // Estado para controlar modal de histórico
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Estado para modal de período
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const { isAdmin } = useAuth();

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

  const handleAddProfessional = async (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'> & { url_foto?: string | null }) => {
    const success = await addProfessional(professionalData);
    if (success) {
      toast.success('Funcionário criado e convidado com sucesso!');
      setIsModalOpen(false); // Fecha o modal de criação
      setNewProfessionalInfo({ name: professionalData.name, email: professionalData.email });
      setIsSuccessModalOpen(true); // Abre o modal de sucesso
    } else {
      toast.error('Erro ao criar funcionário.');
    }
  };

  const handleEditProfessional = async (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'> & { url_foto?: string | null }) => {
    if (!editingProfessional) return;
    const success = await updateProfessional(editingProfessional.id, professionalData);
    if (success) {
      toast.success('Funcionário atualizado com sucesso!');
      setIsModalOpen(false);
      setEditingProfessional(null);
    } else {
      toast.error('Erro ao atualizar funcionário.');
    }
  };

  const handleDeleteProfessional = async () => {
    if (!professionalToDelete) return;
    
    const success = await removeProfessional(professionalToDelete.id);
    if (success) {
      setProfessionalToDelete(null);
    }
  };

  const openModalForNew = () => {
    setEditingProfessional(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (professional: Professional) => {
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
  const mockVales = [];

  const formatDate = (dateStr: string) => {
    return formatDateForDisplay(dateStr);
  };

  // Funções para Fechamento de Caixa
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [periodFilter, setPeriodFilter] = useState(() => {
    const today = getTodayLocal();
    return {
      start: today,
      end: today
    };
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [canConfirmClosure, setCanConfirmClosure] = useState(false);
  
  // Dados padrão vazios para quando não há pré-visualização
  const defaultServicos: any[] = [];
  const defaultTotal = 0;

  // Função para mapear os dados da API para o formato esperado pelo componente
  const mapApiDataToComponent = (apiData: any) => {
    if (!apiData?.preview?.services) {
      console.log('❌ Nenhum serviço encontrado em preview:', apiData);
      return defaultServicos;
    }
    
    console.log('✅ Mapeando serviços da API:', apiData.preview.services);
    
    return apiData.preview.services.map((service: any) => ({
      data: service.date.split('T')[0], // Garante que a data está no formato YYYY-MM-DD
      cliente: service.client || null,
      servico: service.service,
      valorBruto: service.grossValue,
      taxa: service.feeValue,
      comissao: service.commissionValue,
      valorLiquido: service.netValue,
      appointment_id: service.appointment_id
    }));
  };

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

  const onBuscar = async () => {
    if (!selectedProfessional) return;
    
    setIsLoadingPreview(true);
    setHasSearched(false);
    setCanConfirmClosure(false);
    setPreviewData(null);
    
    const salonId = professionals.find(p => p.id === selectedProfessional)?.salon_id || '';
    const dateFrom = periodFilter.start.split('T')[0]; // Garante que a data está no formato YYYY-MM-DD
    const dateTo = (periodFilter.end || periodFilter.start).split('T')[0]; // Garante que a data está no formato YYYY-MM-DD
    
    try {
      console.log('Enviando requisição com parâmetros:', {
        salonId,
        professionalId: selectedProfessional,
        dateFrom,
        dateTo
      });

      const result = await supabaseService.finance.getCashClosurePreview({
        salonId,
        professionalId: selectedProfessional,
        dateFrom,
        dateTo
      });
      
      console.log('Resposta completa da API:', JSON.stringify(result, null, 2));
      
      if (result.error) {
        alert(`Erro ao buscar dados: ${result.error}`);
      } else if (result.data) {
        console.log('Dados recebidos:', JSON.stringify(result.data, null, 2));
        setPreviewData(result.data);
        setCanConfirmClosure(true);
      } else {
        alert('Nenhum dado retornado pela API');
      }
      
      setHasSearched(true);
    } catch (err) {
      console.error('Erro na chamada da API:', err);
      alert('Erro inesperado ao buscar dados');
      setHasSearched(true);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleConfirmarFechamento = () => {
    console.log('🧹 Profissionais: handleConfirmarFechamento iniciado');
    console.log('🧹 Estados antes da limpeza:', {
      previewData: !!previewData,
      hasSearched,
      canConfirmClosure,
      selectedProfessional
    });
    
    // Resetar todos os estados relacionados ao fechamento
    setPreviewData(null);
    setHasSearched(false);
    setCanConfirmClosure(false);
    setSelectedProfessional('');
    setPeriodFilter({
      start: getTodayLocal(),
      end: getTodayLocal()
    });
    
    console.log('🧹 Profissionais: Estados limpos com sucesso');
    // Não abrir o modal de histórico automaticamente - deixar o usuário escolher
    // setIsHistoricoModalOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vales':
        return (
          <ValesSection
            onNewVale={handleNewVale}
            onEditVale={handleEditVale}
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
            servicosParaFechamento={(() => {
              const servicos = previewData ? mapApiDataToComponent(previewData) : defaultServicos;
              console.log('🔍 Profissionais: servicosParaFechamento calculado:', {
                previewData: !!previewData,
                previewDataContent: previewData,
                servicosLength: servicos.length,
                servicos: servicos,
                hasSearched,
                defaultServicos
              });
              return servicos;
            })()}
            totalLiquidoFechamento={(() => {
              if (!previewData) return defaultTotal;
              const servicos = mapApiDataToComponent(previewData);
              const total = servicos.reduce((total: number, servico: any) => total + servico.valorLiquido, 0);
              console.log('✅ Profissionais: Calculando total líquido:', {
                servicos: servicos.length,
                valoresLiquidos: servicos.map((s: any) => s.valorLiquido),
                totalCalculado: total
              });
              return total;
            })()}
            isLoadingPreview={isLoadingPreview}
            canConfirmClosure={canConfirmClosure}
            setCanConfirmClosure={setCanConfirmClosure}
            profissionais={professionals}
            onProfessionalChange={setSelectedProfessional}
            onPeriodModalOpen={() => setIsPeriodModalOpen(true)}
            onBuscar={onBuscar}
            onConfirmarFechamento={handleConfirmarFechamento}
            onHistoricoModalOpen={() => setIsHistoricoModalOpen(true)}
            formatPeriodDisplay={formatPeriodDisplay}
            getProfessionalName={getProfessionalName}
            previewData={previewData}
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
                  /* Cards horizontais para mobile - padronizado com serviços/produtos */
                  <div className="space-y-1.5 h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin pr-1 pb-6">
                    {professionals.map((professional) => (
                      <div
                        key={professional.id}
                        onClick={() => openModalForEdit(professional)}
                        className="relative bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md hover:border-pink-200 transition-all duration-200 cursor-pointer active:scale-95"
                      >
                        
                        <div className="flex items-center space-x-3">
                                                    {professional.url_foto ? (
                            <img
                              src={professional.url_foto}
                              alt={professional.name}
                              className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-200"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: professional.color || DEFAULT_PROFESSIONAL_COLOR }}>
                              {professional.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{professional.name}</h4>
                            <p className="text-sm text-gray-500">{professional.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Tabela para desktop - como serviços */
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Profissional
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Cargo
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Telefone
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {professionals.map((professional) => (
                          <tr key={professional.id} onClick={() => openModalForEdit(professional)} className="hover:bg-gray-50 cursor-pointer">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                {professional.url_foto ? (
                                  <img
                                    src={professional.url_foto}
                                    alt={professional.name}
                                    className="w-12 h-12 rounded-2xl object-cover border-2 border-pink-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
                                    style={{ backgroundColor: professional.color || DEFAULT_PROFESSIONAL_COLOR }}>
                                    {professional.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span>{professional.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{professional.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{professional.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{professional.active ? 'Ativo' : 'Convite pendente'}</td>
                          </tr>
                        ))}
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
        return handleNewVale;
      case 'fechamento':
        return undefined; // Fechamento não tem botão adicionar
      default:
        return undefined;
    }
  };

  // Handlers para ValeModal
  const handleNewVale = () => {
    setEditingVale(null);
    setIsValeModalOpen(true);
  };

  const handleEditVale = (vale: any) => {
    setEditingVale(vale);
    setIsValeModalOpen(true);
  };

  const handleSaveVale = async (vale: any) => {
    console.log('Salvando vale:', vale);
    // Aqui você pode implementar a lógica de salvar
    setIsValeModalOpen(false);
  };

  const handleDeleteVale = async (vale: any) => {
    try {
      const success = await removeVale(vale.id);
      if (success) {
        toast.success('Vale excluído com sucesso!');
      } else {
        toast.error('Erro ao excluir vale. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir vale:', error);
      toast.error('Erro ao excluir vale. Tente novamente.');
    }
  };

  const handleCloseValeModal = () => {
    setIsValeModalOpen(false);
    setEditingVale(null);
  };

  // Função para aplicar período selecionado
  const handleApplyPeriod = (period: { start: string; end: string }) => {
    console.log('✅ Profissionais: Aplicando período:', period);
    setPeriodFilter(period);
    setHasSearched(false); // Reset busca quando mudar período
  };

  // Dados mockados para histórico de fechamentos
  const mockHistoricoFechamentos = [
    {
      id: '1',
      data: '15/01/2024',
      hora: '18:30',
      profissionalNome: 'Carmen Silva',
      servicos: [
        {
          data: '15/01/2024',
          cliente: 'Maria Silva',
          servico: 'Corte e Escova',
          valorBruto: 80.00,
          taxa: -4.00,
          comissao: 40.00,
          valorLiquido: 36.00
        },
        {
          data: '15/01/2024',
          cliente: 'Ana Santos',
          servico: 'Manicure',
          valorBruto: 25.00,
          taxa: -1.25,
          comissao: 12.50,
          valorLiquido: 11.25
        }
      ],
      totalLiquido: 47.25
    },
    {
      id: '2',
      data: '10/01/2024',
      hora: '19:15',
      profissionalNome: 'Carmen Silva',
      servicos: [
        {
          data: '10/01/2024',
          cliente: 'João Oliveira',
          servico: 'Corte Masculino',
          valorBruto: 35.00,
          taxa: -1.75,
          comissao: 17.50,
          valorLiquido: 15.75
        }
      ],
      totalLiquido: 15.75
    }
  ];

  // Função para mudar de aba e resetar histórico
  const handleTabChange = (tab: 'profissionais' | 'vales' | 'fechamento') => {
    setActiveTab(tab);
    // Reset histórico quando sair da aba fechamento
    if (tab !== 'fechamento') {
      setIsHistoricoModalOpen(false);
      setIsHistoryOpen(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden page-content h-screen">
      <Header
        title={getPageTitle()}
        onMenuClick={handleMenuClick}
        onAddClick={getAddClickHandler()}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 h-full">
        {/* Tabs */}
        <div className="bg-gray-100 p-1 rounded-lg mb-6">
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handleTabChange('profissionais')}
              className={`flex items-center justify-center space-x-1 px-3 py-2 text-sm rounded-md font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                activeTab === 'profissionais'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Users size={16} />
              <span>Profissionais</span>
            </button>
            <button
              onClick={() => handleTabChange('vales')}
              className={`flex items-center justify-center space-x-1 px-3 py-2 text-sm rounded-md font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                activeTab === 'vales'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Receipt size={16} />
              <span>Vales</span>
            </button>
            <button
              onClick={() => handleTabChange('fechamento')}
              className={`flex items-center justify-center space-x-1 px-3 py-2 text-sm rounded-md font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                activeTab === 'fechamento'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <DollarSign size={16} />
              <span>Fechamento</span>
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        {renderTabContent()}
      </div>

      {/* Modais */}
      <ProfessionalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={editingProfessional ? handleEditProfessional : handleAddProfessional}
        editingProfessional={editingProfessional}
        onDelete={editingProfessional ? () => handleDeleteClick(editingProfessional) : undefined}
        isMobile={isMobile}
      />

      <ProfessionalSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        professionalName={newProfessionalInfo?.name || ''}
        professionalEmail={newProfessionalInfo?.email || ''}
      />

      {professionalToDelete && (
        <DeleteConfirmationModal
          isOpen={!!professionalToDelete}
          onClose={() => setProfessionalToDelete(null)}
          onConfirm={handleDeleteProfessional}
          title="Excluir Profissional"
          message={`Tem certeza que deseja excluir o profissional ${professionalToDelete.name}?`}
        />
      )}

      {isValeModalOpen && (
        <ValeModal
          isOpen={isValeModalOpen}
          onClose={handleCloseValeModal}
          onSave={handleSaveVale}
          editingVale={editingVale}
          onDelete={editingVale ? () => {
            handleDeleteVale(editingVale);
            handleCloseValeModal();
          } : undefined}
        />
      )}

      {isPeriodModalOpen && (
        <PeriodFilterModal
          isOpen={isPeriodModalOpen}
          onClose={() => setIsPeriodModalOpen(false)}
          onApply={handleApplyPeriod}
          currentPeriod={periodFilter}
        />
      )}

      {isHistoricoModalOpen && (
        <HistoricoFechamentoModal
          isOpen={isHistoricoModalOpen}
          onClose={() => setIsHistoricoModalOpen(false)}
          professionalId={selectedProfessional}
        />
      )}
    </div>
  );
};

export default function Profissionais(props: { onToggleMobileSidebar?: () => void; isMobile?: boolean }) {
  return (
    <ProfessionalProvider>
      <FinanceiroProvider>
        <ProfissionaisContent {...props} />
      </FinanceiroProvider>
    </ProfessionalProvider>
  );
}