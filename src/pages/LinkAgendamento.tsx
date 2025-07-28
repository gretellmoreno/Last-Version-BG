import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Share, HelpCircle, ChevronRight, User, Settings, Briefcase, Users, Clock, Shield, QrCode, AlertCircle, X, Camera, MapPin, Plus, Edit3, Trash2, Menu, Globe, Link, Phone } from 'lucide-react';
import { SketchPicker } from 'react-color';
import { useApp } from '../contexts/AppContext';
import { useService, ServiceProvider } from '../contexts/ServiceContext';
import { useProfessional, ProfessionalProvider } from '../contexts/ProfessionalContext';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../lib/supabaseService';
import toast from 'react-hot-toast';
import { formatPhone } from '../utils/phoneUtils';
import Header from '../components/Header';

interface LinkAgendamentoProps {
  onToggleMobileSidebar?: () => void;
  isMobile?: boolean;
}

function LinkAgendamentoContent({ onToggleMobileSidebar }: LinkAgendamentoProps) {
  const { currentSalon } = useApp();
  const { services, loading, error, addService, updateService, removeService, setServices } = useService();
  const { professionals: professionalsData, loading: professionalsLoading, error: professionalsError, setProfessionals } = useProfessional();
  const [isMobile, setIsMobile] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('link');
  const [linkAgendamento, setLinkAgendamento] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    whatsapp: '',
    instagram: '',
    address: ''
  });
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#4f46e5');
  const [showPrimaryColorPicker, setShowPrimaryColorPicker] = useState(false);
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpModalContent, setHelpModalContent] = useState({ title: '', content: '' });
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [isAgendaLoading, setIsAgendaLoading] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [showPriceDisplayModal, setShowPriceDisplayModal] = useState(false);
  const [selectedServiceForPrice, setSelectedServiceForPrice] = useState<any>(null);
  const [serviceSettings, setServiceSettings] = useState<{[key: string]: {enabled: boolean, priceDisplay: 'normal' | 'from' | 'hidden'}}>({});
  const [professionalSettings, setProfessionalSettings] = useState<{[key: string]: {enabled: boolean}}>({});
  const [minAdvanceTime, setMinAdvanceTime] = useState('60');
  const [maxBookingPeriod, setMaxBookingPeriod] = useState('7');
  const [allowClientCancellation, setAllowClientCancellation] = useState(true);
  const [timeInterval, setTimeInterval] = useState('30');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const priceDisplayOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'from', label: 'A partir de' },
    { value: 'hidden', label: 'Não exibir' }
  ];

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Carregar dados conforme a aba ativa
  useEffect(() => {
    if (!currentSalon?.id) return;
    
    if (activeTab === 'link') {
      loadBookingStatus();
      loadBasicConfig();
    } else if (activeTab === 'profile') {
      loadProfileData();
    } else if (activeTab === 'config') {
      loadAgendaSettings();
    }
  }, [activeTab, currentSalon?.id]);

  // Atualizar tabs
  const tabs = [
    { id: 'link', name: 'Link de Agendamento', icon: Link },
    { id: 'profile', name: 'Detalhes do Perfil', icon: User },
    { id: 'config', name: 'Configurações da Agenda', icon: Settings },
    { id: 'disponibilidade', name: 'Disponibilidade', icon: Briefcase },
  ];

  // Carregar configuração básica (link e status)
  const loadBasicConfig = async () => {
    if (!currentSalon?.id) return;

    try {
      const { data: agendamentoConfig } = await supabaseService.linkAgendamento.getConfig(currentSalon.id);
      const { data: salonData } = await supabase
        .from('salons')
        .select('subdomain')
        .eq('id', currentSalon.id)
        .single();

      if (salonData) {
        setLinkAgendamento(salonData.subdomain || '');
      }
    } catch (error) {
      console.error('Erro ao carregar configuração básica:', error);
    }
  };

  // Carregar status do agendamento online
  const loadBookingStatus = async () => {
    if (!currentSalon?.id) return;

    try {
      const { data, error } = await supabaseService.linkAgendamento.getConfig(currentSalon.id);

      if (error) {
        console.error('❌ Erro ao carregar status do agendamento:', error);
        return;
      }

      if (data) {
        setIsLinkActive(data.ativo);
      } else {
        setIsLinkActive(false);
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar status do agendamento:', error);
    }
  };

  // Carregar configurações da agenda
  const loadAgendaSettings = async () => {
    if (!currentSalon?.id) return;

    try {
      const { data: agendamentoConfig, error: agendamentoError } = await supabaseService.linkAgendamento.getConfig(currentSalon.id);
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('subdomain')
        .eq('id', currentSalon.id)
        .single();

      if (salonData) {
        setLinkAgendamento(salonData.subdomain || '');
      }
      
      if (agendamentoConfig) {
        setSettings(agendamentoConfig);
        setTimeInterval(String(agendamentoConfig.intervalo_tempo || '30'));
        setMinAdvanceTime(String(agendamentoConfig.tempo_minimo_antecedencia || '60'));
        setMaxBookingPeriod(String(agendamentoConfig.periodo_maximo_agendamento || '7'));
        setAllowClientCancellation(agendamentoConfig.permitir_cancelamento_cliente !== false);
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar configurações:', error);
    }
  };

  // Carregar dados do perfil
  const loadProfileData = async () => {
    if (!currentSalon?.id) return;

    try {
      const { data, error } = await supabaseService.linkAgendamento.getConfig(currentSalon.id);

      if (error) {
        console.error('❌ Erro ao carregar o perfil:', error);
        return;
      }

      if (data) {
        setProfileData({
          name: data.nome_exibicao || '',
          whatsapp: data.whatsapp || '',
          instagram: data.instagram || '',
          address: data.endereco || ''
        });
        setProfilePhotoUrl(data.foto_perfil_url || '');
        setPrimaryColor(data.cor_primaria || '#6366f1');
        setSecondaryColor(data.cor_secundaria || '#4f46e5');
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar perfil:', error);
    }
  };

  // Abrir modal de ajuda
  const openHelpModal = (title: string, content: string) => {
    setHelpModalContent({ title, content });
    setShowHelpModal(true);
  };

  // Mostrar animação de sucesso
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 800);
  };

  // Alternar status do agendamento online
  const toggleBookingStatus = async (novoStatus: boolean) => {
    if (!currentSalon?.id) return;

    try {
      const { data, error } = await supabaseService.linkAgendamento.toggleStatus(currentSalon.id, novoStatus);

      if (error) {
        console.error('❌ Erro ao atualizar o status:', error);
        toast.error("Erro ao atualizar o status.");
        return;
      }

      if (data && data.success) {
        setIsLinkActive(novoStatus);
        toast.success(`Agendamento online ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
      } else {
        toast.error(data?.message || "Erro ao atualizar o status.");
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao alternar status:', error);
      toast.error('Erro inesperado ao alternar status.');
    }
  };

  // Alternar status do link
  const toggleLinkStatus = () => {
    if (isLinkActive) {
      setShowDeactivateModal(true);
    } else {
      toggleBookingStatus(true);
    }
  };

  // Desativar link
  const deactivateLink = () => {
    toggleBookingStatus(false);
    setShowDeactivateModal(false);
  };

  // Salvar configurações da agenda
  const saveAgendaSettings = async () => {
    if (!currentSalon?.id) return;

    setIsConfigLoading(true);

    try {
      const slotIntervalInMinutes = Number(timeInterval);
      const minNoticeInMinutes = Number(minAdvanceTime);
      const maxPeriodInDays = Number(maxBookingPeriod);

      const agendamentoConfig = {
        ...settings,
        intervalo_tempo: slotIntervalInMinutes,
        tempo_minimo_antecedencia: minNoticeInMinutes,
        periodo_maximo_agendamento: maxPeriodInDays,
        permitir_cancelamento_cliente: allowClientCancellation
      };

      const { data: configResult, error: configError } = await supabaseService.linkAgendamento.saveConfig(currentSalon.id, agendamentoConfig);

      const { error: salonError } = await supabase
        .from('salons')
        .update({ subdomain: linkAgendamento })
        .eq('id', currentSalon.id);

      if (configError) {
        console.error('❌ Erro ao salvar configurações de agendamento:', configError);
        toast.error('Erro ao salvar configurações de agendamento.');
        return;
      }

      if (salonError) {
        console.error('❌ Erro ao salvar subdomínio:', salonError);
        if (salonError.code === '23505') {
          toast.error('Este link (subdomínio) já está em uso. Tente outro.');
        } else {
          toast.error('Erro ao salvar o subdomínio.');
        }
        return;
      }

      showSuccessMessage('Configurações salvas com sucesso!');
      setSettings(agendamentoConfig);

    } catch (error) {
      console.error('💥 Erro inesperado ao salvar configurações:', error);
      toast.error('Erro inesperado ao salvar configurações.');
    } finally {
      setIsConfigLoading(false);
    }
  };

  const handleUpdateProfile = (field: string, value: string) => {
    if (field === 'whatsapp') {
      const formattedPhone = formatPhone(value);
      setProfileData(prev => ({
        ...prev,
        [field]: formattedPhone
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCopyLink = async () => {
    if (!linkAgendamento.trim()) {
      toast.error('Digite um link primeiro!');
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(linkAgendamento.trim());
        setIsCopied(true);
        toast.success('Link copiado para a área de transferência!');
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = linkAgendamento.trim();
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setIsCopied(true);
          toast.success('Link copiado para a área de transferência!');
          setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
          toast.error('Erro ao copiar link. Tente novamente.');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      toast.error('Erro ao copiar link. Tente novamente.');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentSalon?.id) return;

    setIsPhotoLoading(true);

    try {
      const filePath = `${currentSalon.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('salon-profiles')
        .upload(filePath, file);

      if (uploadError) {
        toast.error('Falha no upload da foto.');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('salon-profiles')
        .getPublicUrl(filePath);
  
      const publicUrl = urlData.publicUrl;

      const { data, error: dbError } = await supabaseService.linkAgendamento.saveConfig(currentSalon.id, {
        foto_perfil_url: publicUrl
      });
      
      if (dbError) {
        toast.error('Erro ao salvar a referência da foto.');
      } else if (data && data.success) {
        toast.success('Foto do perfil atualizada!');
        setProfilePhotoUrl(publicUrl);
      } else {
        toast.error(data?.message || 'Erro ao salvar a foto.');
      }
    } catch (error) {
      toast.error('Erro inesperado no upload da foto.');
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const handleMenuClick = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  // Salvar dados do perfil
  const saveProfileData = async () => {
    if (!currentSalon?.id) return;

    setIsLoading(true);

    try {
      const profileConfig = {
        nome_exibicao: profileData.name,
        whatsapp: profileData.whatsapp,
        instagram: profileData.instagram,
        endereco: profileData.address,
        foto_perfil_url: profilePhotoUrl,
        cor_primaria: primaryColor,
        cor_secundaria: secondaryColor
      };

      const { data, error } = await supabaseService.linkAgendamento.saveConfig(currentSalon.id, profileConfig);
      
      if (error) {
        toast.error('Erro ao salvar o perfil.');
        return;
      }

      if (data && data.success) {
        showSuccessMessage('Perfil atualizado com sucesso!');
      } else {
        toast.error(data?.message || 'Erro ao salvar o perfil.');
      }
    } catch (error) {
      toast.error('Erro inesperado ao salvar o perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar disponibilidade online de serviços (COM RESPOSTA ROBUSTA DO BACKEND)
  async function toggleServiceAvailability(serviceId: string, newStatus: boolean) {
    if (!currentSalon?.id) return;

    const currentAvailability = services.find(s => s.id === serviceId)?.available_online || false;

    // Opcional: Para uma resposta visual instantânea, mantemos a atualização otimista
    setServices(currentServices => 
      currentServices.map(service => 
        service.id === serviceId 
          ? { ...service, available_online: newStatus } 
          : service
      )
    );

    // Atualizar também o serviceSettings para manter consistência
    setServiceSettings(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        enabled: newStatus
      }
    }));

    try {
      // CHAMA A FUNÇÃO NO BACKEND
      const { data, error } = await supabaseService.services.updateOnlineAvailability(
        serviceId, 
        currentSalon.id, 
        newStatus
      );

      // VERIFICAÇÃO DE ERRO REAL
      if (error) {
        console.error("Falha ao atualizar a disponibilidade do serviço, revertendo UI:", error);
        // Reverte a UI para o estado original em caso de erro
        setServices(currentServices => 
          currentServices.map(service => 
            service.id === serviceId 
              ? { ...service, available_online: currentAvailability } 
              : service
          )
        );
        setServiceSettings(prev => ({
          ...prev,
          [serviceId]: {
            ...prev[serviceId],
            enabled: currentAvailability
          }
        }));
        toast.error('Erro ao atualizar o serviço. Tente novamente.');
        return;
      }

      // SUCESSO: ATUALIZA O ESTADO COM OS DADOS FRESCOS VINDOS DO BANCO
      // A resposta 'data' agora é um array com o serviço atualizado
      if (data && data.length > 0) {
        const updatedServiceFromServer = data[0];
        setServices(currentServices => 
          currentServices.map(service => 
            service.id === updatedServiceFromServer.id ? updatedServiceFromServer : service
          )
        );
        toast.success('Status do serviço atualizado!');
      } else {
        // Caso a resposta não contenha dados, mantém a atualização otimista
        toast.success('Status do serviço atualizado!');
      }

    } catch (err) {
      console.error("Erro inesperado ao atualizar serviço, revertendo UI:", err);
      // Reverte a UI também em caso de erros de rede, etc.
      setServices(currentServices => 
        currentServices.map(service => 
          service.id === serviceId 
            ? { ...service, available_online: currentAvailability } 
            : service
        )
      );
        setServiceSettings(prev => ({
          ...prev,
          [serviceId]: {
            ...prev[serviceId],
          enabled: currentAvailability
          }
        }));
      toast.error('Erro inesperado ao atualizar serviço.');
    }
  }

  // Função para atualizar modo de exibição de preço
  type PriceDisplayMode = 'normal' | 'from' | 'hidden';
  async function updatePriceDisplayMode(serviceId: string, newMode: PriceDisplayMode) {
    if (!currentSalon?.id) return;
    const { error } = await supabase
      .from('services')
      .update({ price_display_mode: newMode })
      .eq('id', serviceId);
    if (error) {
      toast.error('Erro ao atualizar o modo de exibição.');
    } else {
      if (typeof setServices === 'function') {
        setServices((currentList: any[]) =>
          currentList.map(service =>
            service.id === serviceId ? { ...service, price_display_mode: newMode } : service
          )
        );
      }
      setServiceSettings(prev => ({
        ...prev,
        [serviceId]: {
          ...prev[serviceId],
          priceDisplay: newMode
        }
      }));
      setShowPriceDisplayModal(false);
    }
  }

  // Função utilitária para traduzir o modo de exibição
  function getPriceDisplayLabel(mode: PriceDisplayMode) {
    switch (mode) {
      case 'normal': return 'Normal';
      case 'from': return 'A partir de';
      case 'hidden': return 'Não exibir';
      default: return 'Normal';
    }
  }

  // Função para atualizar disponibilidade online de profissionais (COM RESPOSTA ROBUSTA DO BACKEND)
  async function toggleProfessionalAvailability(professionalId: string, newStatus: boolean) {
    if (!currentSalon?.id) return;

    const currentAvailability = professionalsData.find(p => p.id === professionalId)?.available_online || false;

    // Opcional: Para uma resposta visual instantânea, mantemos a atualização otimista
    setProfessionals(currentList =>
      currentList.map(professional =>
        professional.id === professionalId 
          ? { ...professional, available_online: newStatus } 
          : professional
      )
    );

    // Atualizar também o professionalSettings para manter consistência
    setProfessionalSettings(prev => ({
      ...prev,
      [professionalId]: {
        ...prev[professionalId],
        enabled: newStatus
      }
    }));

    try {
      // CHAMA A FUNÇÃO NO BACKEND
      const { data, error } = await supabaseService.professionals.updateOnlineAvailability(
        professionalId,
        currentSalon.id,
        newStatus
      );

      // VERIFICAÇÃO DE ERRO REAL
      if (error) {
        console.error("Falha ao atualizar a disponibilidade do profissional, revertendo UI:", error);
        // Reverte a UI para o estado original em caso de erro
        setProfessionals(currentList =>
          currentList.map(professional =>
            professional.id === professionalId 
              ? { ...professional, available_online: currentAvailability } 
              : professional
          )
        );
        setProfessionalSettings(prev => ({
          ...prev,
          [professionalId]: {
            ...prev[professionalId],
            enabled: currentAvailability
          }
        }));
        toast.error('Erro ao atualizar profissional. Tente novamente.');
        return;
      }

      // SUCESSO: ATUALIZA O ESTADO COM OS DADOS FRESCOS VINDOS DO BANCO
      // A resposta 'data' agora é um array com o profissional atualizado
      if (data && data.length > 0) {
        const updatedProfessionalFromServer = data[0];
        setProfessionals(currentList =>
          currentList.map(professional =>
            professional.id === updatedProfessionalFromServer.id ? updatedProfessionalFromServer : professional
          )
        );
        toast.success('Status do profissional atualizado!');
      } else {
        // Caso a resposta não contenha dados, mantém a atualização otimista
        toast.success('Status do profissional atualizado!');
      }

    } catch (err) {
      console.error("Erro inesperado ao atualizar profissional, revertendo UI:", err);
      // Reverte a UI também em caso de erros de rede, etc.
      setProfessionals(currentList =>
        currentList.map(professional =>
          professional.id === professionalId 
            ? { ...professional, available_online: currentAvailability } 
            : professional
        )
      );
      setProfessionalSettings(prev => ({
        ...prev,
        [professionalId]: {
          ...prev[professionalId],
          enabled: currentAvailability
        }
      }));
      toast.error('Erro inesperado ao atualizar profissional.');
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen page-content">
      <Header 
        title="Link de Agendamento" 
        onMenuClick={handleMenuClick}
      />
      
      <div className="flex-1 bg-gray-50 overflow-hidden">
        <div className="h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin">
          <div className="p-4 md:p-6">
            {/* Container Principal com Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-gray-200`}>
                {/* Tabs de Navegação */}
                <div className={`bg-gray-100 ${isMobile ? 'p-0.5 mb-2' : 'p-1 mb-6'} rounded-lg`}>
                  <div className={`grid grid-cols-4 ${isMobile ? 'gap-0.5' : 'gap-1'}`}>
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-center space-x-1 ${isMobile ? 'px-2 py-2 text-xs' : 'px-3 py-2 text-sm'} rounded-md font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                          activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                      >
                        <tab.icon size={14} />
                        <span className={isMobile ? 'hidden sm:inline' : ''}>{tab.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Conteúdo das Tabs */}
              <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                {/* Tab Link de Agendamento */}
                {activeTab === 'link' && (
                  <div className="flex flex-col gap-4 items-start w-full">
                    {/* Campo do link */}
                    <div className="w-full max-w-md">
                      <div className="relative flex-1 min-w-0">
                        <input
                          type="text"
                          value={`${linkAgendamento || 'seusalao'}.belagestao.com/agendamento`}
                          readOnly
                          className="w-full px-4 py-2 pr-9 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:ring-0 focus:border-gray-200 cursor-default text-sm min-w-0"
                          style={{ minWidth: 0 }}
                        />
                        <button
                          onClick={handleCopyLink}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-purple-600 transition-colors"
                          title={isCopied ? 'Link copiado!' : 'Copiar link'}
                          tabIndex={-1}
                          type="button"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    {/* Switch + badge em linha separada no mobile, lado a lado no desktop */}
                    <div className={`flex ${isMobile ? 'flex-row w-full max-w-md justify-between' : 'items-center gap-3'} mt-1`}>
                      <button
                        onClick={toggleLinkStatus}
                        className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors border ${isLinkActive ? 'bg-green-500 border-green-400 justify-end' : 'bg-gray-300 border-gray-200 justify-start'}`}
                        aria-label="Ativar/desativar link de agendamento"
                        type="button"
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm transition-all"></div>
                      </button>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${isLinkActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{isLinkActive ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                )}

                {/* Tab Detalhes do Perfil */}
                {activeTab === 'profile' && (
                  <div className={`${isMobile ? 'space-y-4' : 'space-y-8'}`}>
                    <div className="flex items-center mb-4 sm:mb-6">
                      <User className="mr-3 text-purple-600" size={22} />
                      <h3 className="text-xl font-bold text-gray-900">Detalhes do Perfil</h3>
                    </div>

                    {/* Foto do Perfil */}
                    <div className="flex justify-center mb-6">
                      <div className="relative group">
                        {isPhotoLoading ? (
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          </div>
                        ) : profilePhotoUrl ? (
                          <div className="relative">
                            <img
                              src={profilePhotoUrl}
                              alt="Foto de Perfil"
                              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                              <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                            <User size={36} className="text-white" />
                          </div>
                        )}
                        
                        <div className="absolute -bottom-1 -right-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="profile-photo-upload"
                            disabled={isPhotoLoading}
                          />
                          <label
                            htmlFor="profile-photo-upload"
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 ${
                              isPhotoLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 cursor-pointer'
                            }`}
                            title={isPhotoLoading ? "Carregando..." : "Adicionar Foto"}
                          >
                            {isPhotoLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Camera size={16} className="text-white" />
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-6'}`}>
                      {/* Nome */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nome do Estúdio</label>
                        <input
                          type="text"
                          placeholder="Digite o nome do seu estúdio..."
                          value={profileData.name}
                          onChange={(e) => handleUpdateProfile('name', e.target.value)}
                          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:border-purple-300"
                        />
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp</label>
                        <div className="relative">
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                              <Phone className="text-white" size={18} />
                            </div>
                          </div>
                        <input
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={profileData.whatsapp}
                          onChange={(e) => handleUpdateProfile('whatsapp', e.target.value)}
                            className="w-full pl-14 pr-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:border-green-300"
                        />
                        </div>
                      </div>

                      {/* Instagram */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Instagram</label>
                        <div className="relative">
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-pink-400 flex items-center justify-center shadow-md">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white" width="18" height="18"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line></svg>
                            </div>
                          </div>
                        <input
                          type="text"
                          placeholder="@seu_usuario"
                          value={profileData.instagram}
                          onChange={(e) => handleUpdateProfile('instagram', e.target.value)}
                            className="w-full pl-14 pr-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:border-pink-300"
                        />
                        </div>
                      </div>

                      {/* Endereço */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Endereço</label>
                        <div className="relative">
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                              <MapPin className="text-white" size={18} />
                            </div>
                          </div>
                        <input
                          type="text"
                          placeholder="Rua, número, bairro, cidade - UF"
                          value={profileData.address}
                          onChange={(e) => handleUpdateProfile('address', e.target.value)}
                            className="w-full pl-14 pr-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:border-blue-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seletor de Cores */}
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Cores do Tema</h4>
                      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
                        {/* Cor Primária */}
                        <div className="relative">
                          <label className="block text-xs font-medium text-gray-600 mb-2">Cor Primária</label>
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                              style={{ backgroundColor: primaryColor }}
                              onClick={() => setShowPrimaryColorPicker(!showPrimaryColorPicker)}
                            />
                            <div className="flex-1">
                              <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                placeholder="#6366f1"
                              />
                            </div>
                          </div>
                          {showPrimaryColorPicker && (
                            <div className="absolute z-10 mt-2">
                              <div
                                className="fixed inset-0"
                                onClick={() => setShowPrimaryColorPicker(false)}
                              />
                              <SketchPicker
                                color={primaryColor}
                                onChange={(color) => setPrimaryColor(color.hex)}
                              />
                            </div>
                          )}
                        </div>

                        {/* Cor Secundária */}
                        <div className="relative">
                          <label className="block text-xs font-medium text-gray-600 mb-2">Cor Secundária</label>
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                              style={{ backgroundColor: secondaryColor }}
                              onClick={() => setShowSecondaryColorPicker(!showSecondaryColorPicker)}
                            />
                            <div className="flex-1">
                              <input
                                type="text"
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                placeholder="#4f46e5"
                              />
                            </div>
                          </div>
                          {showSecondaryColorPicker && (
                            <div className="absolute z-10 mt-2">
                              <div
                                className="fixed inset-0"
                                onClick={() => setShowSecondaryColorPicker(false)}
                              />
                              <SketchPicker
                                color={secondaryColor}
                                onChange={(color) => setSecondaryColor(color.hex)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botão Salvar */}
                    <div className={`flex justify-end border-t border-gray-200 ${isMobile ? 'pt-4' : 'pt-6'}`}>
                      <button
                        onClick={saveProfileData}
                        disabled={isLoading}
                        className="flex items-center px-8 py-3 bg-purple-600 text-white rounded-xl font-bold text-base shadow-md hover:bg-purple-700 transition-all duration-200"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Settings size={18} className="mr-2" />
                            Salvar Perfil
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab Configurações da Agenda */}
                {activeTab === 'config' && (
                  <div className={`${isMobile ? 'space-y-4' : 'space-y-8'}`}>
                    <div className="flex items-center mb-4 sm:mb-6">
                      <Settings className="mr-3 text-purple-600" size={22} />
                      <h3 className="text-xl font-bold text-gray-900">Configurações da Agenda</h3>
                    </div>

                    <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
                      {/* Link de Agendamento */}
                      <div className="group">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Link de Agendamento</label>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openHelpModal('Link de Agendamento', 'Este é o link que seus clientes usarão para acessar a página de agendamento online. Você pode personalizar este link conforme sua preferência.');
                            }}
                            className="text-gray-400 hover:text-purple-500 transition-colors p-1 rounded-full hover:bg-purple-50"
                          >
                            <HelpCircle size={16} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={linkAgendamento}
                          onChange={(e) => setLinkAgendamento(e.target.value)}
                          placeholder="Cole ou digite seu link de agendamento aqui"
                          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:border-purple-300"
                        />
                      </div>
              
                      {/* Intervalo de Horários */}
                      <div className="group">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Intervalo de Horários</label>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openHelpModal('Intervalo de Horários', 'Refere-se a como a listagem de horários aparecerá para o seu cliente.');
                            }}
                            className="text-gray-400 hover:text-purple-500 transition-colors p-1 rounded-full hover:bg-purple-50"
                          >
                            <HelpCircle size={16} />
                          </button>
                        </div>
                        <select 
                          value={timeInterval}
                          onChange={(e) => setTimeInterval(e.target.value)}
                          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 appearance-none"
                          style={{ backgroundImage: 'none' }}
                        >
                          <option value="15">De 15 em 15 minutos</option>
                          <option value="30">De 30 em 30 minutos</option>
                          <option value="45">De 45 em 45 minutos</option>
                          <option value="60">De 1 em 1 hora</option>
                          <option value="75">De 1h15 em 1h15</option>
                          <option value="90">De 1h30 em 1h30</option>
                          <option value="120">De 2 em 2 horas</option>
                        </select>
                      </div>

                      {/* Tempo de Antecedência Mínimo */}
                      <div className="group">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Tempo de Antecedência Mínimo</label>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openHelpModal('Tempo de Antecedência Mínimo', 'Refere-se a quantidade de tempo minima permitida que antecede um atendimento. Isso serve para prevenir que clientes reserve algum horário muito "em cima" da hora.');
                            }}
                            className="text-gray-400 hover:text-purple-500 transition-colors p-1 rounded-full hover:bg-purple-50"
                          >
                            <HelpCircle size={16} />
                          </button>
                        </div>
                        <select 
                          value={minAdvanceTime}
                          onChange={(e) => setMinAdvanceTime(e.target.value)}
                          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 appearance-none"
                          style={{ backgroundImage: 'none' }}
                        >
                          <option value="15">15 minutos antes</option>
                          <option value="30">30 minutos antes</option>
                          <option value="60">1 hora antes</option>
                          <option value="120">2 horas antes</option>
                          <option value="240">4 horas antes</option>
                          <option value="480">8 horas antes</option>
                          <option value="720">12 horas antes</option>
                          <option value="1440">1 dia antes</option>
                          <option value="2880">2 dias antes</option>
                          <option value="4320">3 dias antes</option>
                          <option value="5760">4 dias antes</option>
                          <option value="7200">5 dias antes</option>
                          <option value="8640">6 dias antes</option>
                          <option value="10080">7 dias antes</option>
                        </select>
                      </div>

                      {/* Período Máximo de Agendamento */}
                      <div className="group">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Período Máximo de Agendamento</label>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openHelpModal('Período Máximo de Agendamento', 'Define até quando no futuro os clientes podem fazer agendamentos. Isso ajuda a controlar o planejamento do seu negócio.');
                            }}
                            className="text-gray-400 hover:text-purple-500 transition-colors p-1 rounded-full hover:bg-purple-50"
                          >
                            <HelpCircle size={16} />
                          </button>
                        </div>
                        <select 
                          value={maxBookingPeriod}
                          onChange={(e) => setMaxBookingPeriod(e.target.value)}
                          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 appearance-none"
                          style={{ backgroundImage: 'none' }}
                        >
                          <option value="2">Até 2 dias</option>
                          <option value="3">Até 3 dias</option>
                          <option value="4">Até 4 dias</option>
                          <option value="5">Até 5 dias</option>
                          <option value="7">Até 7 dias</option>
                          <option value="15">Até 15 dias</option>
                          <option value="30">Até 1 mês</option>
                          <option value="60">Até 2 meses</option>
                          <option value="90">Até 3 meses</option>
                        </select>
                      </div>

                      {/* Permitir Cancelamento pelo Cliente */}
                      <div className="group col-span-full">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Permitir Cancelamento pelo Cliente</label>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openHelpModal('Permitir Cancelamento pelo Cliente', 'Aqui você define se permitirá seu cliente realizar o cancelamento. Com essa opção irá aparecer um botão de "Cancelar" quando seu cliente agendar.');
                            }}
                            className="text-gray-400 hover:text-purple-500 transition-colors p-1 rounded-full hover:bg-purple-50"
                          >
                            <HelpCircle size={16} />
                          </button>
                        </div>
                        <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                          <button 
                            onClick={() => setAllowClientCancellation(!allowClientCancellation)}
                            className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors border ${
                              allowClientCancellation 
                                ? 'bg-green-500 border-green-400 justify-end' 
                                : 'bg-gray-300 border-gray-200 justify-start'
                            }`}
                          >
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm transition-all"></div>
                          </button>
                          <span className={`ml-3 text-sm font-medium ${
                            allowClientCancellation ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {allowClientCancellation ? 'Ativado' : 'Desativado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botão Salvar */}
                    <div className={`flex justify-end border-t border-gray-200 ${isMobile ? 'pt-4' : 'pt-6'}`}>
                      <button 
                        onClick={saveAgendaSettings}
                        disabled={isConfigLoading}
                        className="flex items-center px-8 py-3 bg-purple-600 text-white rounded-xl font-bold text-base shadow-md hover:bg-purple-700 transition-all duration-200"
                      >
                        {isConfigLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Settings size={18} className="mr-2" />
                            Salvar Configurações
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab Disponibilidade */}
                {activeTab === 'disponibilidade' && (
                  <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
                    {/* Serviços */}
                    <div>
                      <div className="flex items-center mb-4 sm:mb-6">
                        <Briefcase className="mr-3 text-purple-600" size={22} />
                        <h3 className="text-xl font-bold text-gray-900">Serviços Disponíveis</h3>
                      </div>
                      {loading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-gray-500 font-medium">Carregando serviços...</p>
                        </div>
                      ) : error ? (
                        <div className="text-center py-12">
                          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar serviços</h3>
                          <p className="text-gray-500 mb-6">{error}</p>
                          <button 
                            onClick={() => window.location.reload()}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                          >
                            Tentar Novamente
                          </button>
                        </div>
                      ) : services.length === 0 ? (
                        <div className="text-center py-12">
                          <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço configurado</h3>
                          <p className="text-gray-500 mb-6">Configure os serviços que estarão disponíveis para agendamento online</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {services.map((service) => {
                            const serviceId = service.id;
                            const settings = serviceSettings[serviceId] || { enabled: true, priceDisplay: 'normal' as const };
                            return (
                              <div
                                key={service.id}
                                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-200 transition-all duration-300"
                              >
                                <div className="flex-1">
                                  <button
                                    onClick={() => {
                                      setSelectedServiceForPrice(service);
                                      setShowPriceDisplayModal(true);
                                    }}
                                    className="text-left w-full p-1 sm:p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                  >
                                    <div className="text-base font-semibold text-gray-900">
                                      {service.name} - R$ {service.price.toFixed(2).replace('.', ',')}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      Exibição do preço: {getPriceDisplayLabel(service.price_display_mode)}
                                    </div>
                                  </button>
                                </div>
                                <button
                                  onClick={async () => {
                                    const isOnline = service.available_online;
                                    const newStatus = !isOnline;
                                    await toggleServiceAvailability(service.id, newStatus);
                                  }}
                                  className={`w-8 h-5 sm:w-10 sm:h-6 rounded-full flex items-center p-0.5 transition-colors shadow-sm border border-gray-200 ${
                                    service.available_online 
                                      ? 'bg-green-500 justify-end' 
                                      : 'bg-gray-300 justify-start'
                                  }`}
                                >
                                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center bg-white shadow-sm transition-all`}>
                                    {service.available_online && (
                                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {/* Profissionais */}
                    <div className="mt-10">
                      <div className="flex items-center mb-4 sm:mb-6">
                        <Users className="mr-3 text-purple-600" size={22} />
                        <h3 className="text-xl font-bold text-gray-900">Profissionais Disponíveis</h3>
                      </div>
                      {professionalsLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-gray-500 font-medium">Carregando profissionais...</p>
                        </div>
                      ) : professionalsError ? (
                        <div className="text-center py-12">
                          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar profissionais</h3>
                          <p className="text-gray-500 mb-6">{professionalsError}</p>
                          <button 
                            onClick={() => window.location.reload()}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                          >
                            Tentar Novamente
                          </button>
                        </div>
                      ) : professionalsData.length === 0 ? (
                        <div className="text-center py-12">
                          <Users size={48} className="mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum profissional configurado</h3>
                          <p className="text-gray-500 mb-6">Cadastre os profissionais que estarão disponíveis para agendamento online</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {professionalsData.map((professional) => {
                            const professionalId = professional.id;
                            const settings = professionalSettings[professionalId] || { enabled: true };
                            const isOnline = professional.available_online;
                            return (
                              <div
                                key={professional.id}
                                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-200 transition-all duration-300"
                              >
                                <div className="flex items-center space-x-3">
                                  <div 
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm"
                                    style={{ backgroundColor: professional.color || '#8B5CF6' }}
                                  >
                                    {professional.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-base font-semibold text-gray-900">
                                      {professional.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {professional.role || 'Profissional'}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={async () => {
                                    const newStatus = !isOnline;
                                    await toggleProfessionalAvailability(professional.id, newStatus);
                                  }}
                                  className={`w-8 h-5 sm:w-10 sm:h-6 rounded-full flex items-center p-0.5 transition-colors shadow-sm border border-gray-200 ${
                                    isOnline ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'
                                  }`}
                                >
                                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center bg-white shadow-sm transition-all`}>
                                    {isOnline && (
                                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Modal de Desativação */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-[999999] overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDeactivateModal(false)} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-72 max-w-[85vw] z-[1000000]">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 text-center">Alerta</h3>
            </div>
            <div className="px-4 py-4">
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                Tem certeza que deseja desativar seu agendamento online?
              </p>
              <p className="text-gray-500 text-xs text-center mt-2">
                Esta ação irá desativar temporariamente o acesso público ao seu link de agendamento.
              </p>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex space-x-2">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Não
              </button>
              <button
                onClick={deactivateLink}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ajuda */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[99999] overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowHelpModal(false)} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-72 max-w-[85vw] z-[100000]">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 text-center">
                {helpModalContent.title}
              </h3>
            </div>
            <div className="px-4 py-4">
              <p className="text-purple-600 text-sm leading-relaxed">
                {helpModalContent.content}
              </p>
            </div>
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exibição de Preço */}
      {showPriceDisplayModal && (() => {
        const serviceId = selectedServiceForPrice?.id || 'default';
        const settings = serviceSettings[serviceId] || { enabled: true, priceDisplay: 'normal' as const };
        
        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-[90vw] max-w-xs sm:max-w-sm mx-auto animate-fade-in">
              <div className="mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center">
                  Escolha o modo de exibição do preço
                </h3>
              </div>
              <div className="space-y-3 mb-6">
                {priceDisplayOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={async () => {
                      await updatePriceDisplayMode(serviceId, option.value as PriceDisplayMode);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 text-base font-medium focus:outline-none
                      ${settings.priceDisplay === option.value
                        ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700'}
                    `}
                  >
                    <span className="font-semibold">{option.label}</span>
                    <span className="ml-2">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200
                        ${settings.priceDisplay === option.value
                          ? 'border-purple-500 bg-purple-500 shadow-md'
                          : 'border-gray-300 bg-white'}
                      `}>
                        {settings.priceDisplay === option.value && (
                          <span className="w-2.5 h-2.5 rounded-full bg-white block"></span>
                        )}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowPriceDisplayModal(false)}
                className="w-full py-3 rounded-xl font-bold text-base bg-purple-600 text-white shadow-md hover:bg-purple-700 transition-all duration-200 mt-2"
              >
                Fechar
              </button>
            </div>
          </div>
        );
      })()}

      {/* Animação de Sucesso */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm transform transition-all duration-300 scale-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900">Salvo com sucesso!</p>
                <p className="text-sm text-gray-600">{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LinkAgendamento(props: LinkAgendamentoProps) {
  return (
    <ServiceProvider>
      <ProfessionalProvider>
        <LinkAgendamentoContent {...props} />
      </ProfessionalProvider>
    </ServiceProvider>
  );
}