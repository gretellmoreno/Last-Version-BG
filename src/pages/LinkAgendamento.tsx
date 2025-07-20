import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Share, HelpCircle, ChevronRight, User, Settings, Briefcase, Users, Clock, Shield, QrCode, AlertCircle, X, Camera, MapPin, Plus, Edit3, Trash2, Menu } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useService } from '../contexts/ServiceContext';
import { useProfessional } from '../contexts/ProfessionalContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { formatPhone } from '../utils/phoneUtils';

interface LinkAgendamentoProps {
  onToggleMobileSidebar?: () => void;
  isMobile?: boolean;
}

export default function LinkAgendamento({ onToggleMobileSidebar }: LinkAgendamentoProps) {
  const { currentSalon } = useApp();
  const { services, loading, error, addService, updateService, removeService } = useService();
  const { professionals: professionalsData, loading: professionalsLoading, error: professionalsError } = useProfessional();
  const [isMobile, setIsMobile] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState<'main' | 'config' | 'profile' | 'services' | 'professionals' | 'schedule'>('main');
  const [linkAgendamento, setLinkAgendamento] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    whatsapp: '',
    instagram: '',
    address: ''
  });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpModalContent, setHelpModalContent] = useState({ title: '', content: '' });
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isLinkActive, setIsLinkActive] = useState(false); // Estado do link (ativo/desativado) - será carregado do banco
  const [agendaSettings, setAgendaSettings] = useState({
    subdomain: '',
    slotInterval: '30',
    minBookingNotice: '60',
    maxBookingPeriod: '7',
    allowClientCancellation: true
  });
  const [isAgendaLoading, setIsAgendaLoading] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [showPriceDisplayModal, setShowPriceDisplayModal] = useState(false);
  const [selectedServiceForPrice, setSelectedServiceForPrice] = useState<any>(null);
  const [serviceSettings, setServiceSettings] = useState<{[key: string]: {enabled: boolean, priceDisplay: 'normal' | 'a_partir_de' | 'nao_exibir'}}>({});
  const [professionalSettings, setProfessionalSettings] = useState<{[key: string]: {enabled: boolean}}>({});
  const [minAdvanceTime, setMinAdvanceTime] = useState('60'); // 1 hora como padrão
  const [maxBookingPeriod, setMaxBookingPeriod] = useState('7'); // 7 dias como padrão
  const [allowClientCancellation, setAllowClientCancellation] = useState(true); // Permitir cancelamento como padrão
  const [timeInterval, setTimeInterval] = useState('30'); // 30 minutos como padrão
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Carregar dados do perfil quando a página for aberta
  useEffect(() => {
    if (currentPage === 'profile' && currentSalon?.id) {
      loadProfileData();
    }
  }, [currentPage, currentSalon?.id]);

  // Carregar configurações quando a página de config for aberta
  useEffect(() => {
    if (currentPage === 'config' && currentSalon?.id) {
      loadAgendaSettings();
    }
  }, [currentPage, currentSalon?.id]);

  // Carregar status do agendamento online quando a página principal for aberta
  useEffect(() => {
    if (currentPage === 'main' && currentSalon?.id) {
      loadBookingStatus();
    }
  }, [currentPage, currentSalon?.id]);

  // Carregar status do agendamento online
  const loadBookingStatus = async () => {
    if (!currentSalon?.id) return;

    try {
      console.log('🔍 Carregando status do agendamento online para o salão:', currentSalon.id);
      
      const { data, error } = await supabase
        .from('salons')
        .select('settings')
        .eq('id', currentSalon.id)
        .single();

      if (error) {
        console.error('❌ Erro ao carregar status do agendamento:', error.message);
        return;
      }

      console.log('✅ Status do agendamento carregado:', data);

      if (data && data.settings) {
        // Verificar se online_booking_enabled existe, se não, considerar como false
        const isEnabled = data.settings.online_booking_enabled === true;
        setIsLinkActive(isEnabled);
        console.log('🔍 Status do agendamento online:', isEnabled ? 'ATIVO' : 'INATIVO');
      } else {
        // Se não há settings, considerar como inativo
        setIsLinkActive(false);
        console.log('🔍 Status do agendamento online: INATIVO (sem configurações)');
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar status do agendamento:', error);
    }
  };

  // Carregar configurações da agenda
  const loadAgendaSettings = async () => {
    if (!currentSalon?.id) return;

    try {
      console.log('🔍 Carregando configurações da agenda para o salão:', currentSalon.id);
      
      const { data, error } = await supabase
        .from('salons')
        .select('subdomain, settings')
        .eq('id', currentSalon.id)
        .single();

      if (error) {
        console.error('❌ Erro ao carregar configurações:', error.message);
        return;
      }

      console.log('✅ Configurações carregadas:', data);

      if (data) {
        // Atualizar link de agendamento
        setLinkAgendamento(data.subdomain || '');
        
        // Atualizar configurações se existirem
        if (data.settings) {
          setTimeInterval(String(data.settings.slot_interval || '30'));
          setMinAdvanceTime(String(data.settings.min_booking_notice || '60'));
          setMaxBookingPeriod(String(data.settings.max_booking_period || '7'));
          setAllowClientCancellation(data.settings.allow_client_cancellation !== false);
        }
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar configurações:', error);
    }
  };

  // Abrir modal de ajuda
  const openHelpModal = (title: string, content: string) => {
    console.log('🔍 Abrindo modal de ajuda:', { title, content });
    setHelpModalContent({ title, content });
    setShowHelpModal(true);
  };

  // Mostrar animação de sucesso
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessAnimation(true);
    
    // Esconder a animação após 0.8 segundos
    setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 800);
  };

  // Alternar status do agendamento online no banco de dados
  const toggleBookingStatus = async (novoStatus: boolean) => {
    if (!currentSalon?.id) return;

    try {
      console.log('🔄 Alternando status do agendamento para:', novoStatus ? 'ATIVO' : 'INATIVO');

      // 1. Primeiro, busque o objeto 'settings' atual para não perder os outros valores
      const { data: currentData, error: fetchError } = await supabase
        .from('salons')
        .select('settings')
        .eq('id', currentSalon.id)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar configurações atuais:', fetchError);
        toast.error("Erro ao buscar configurações atuais.");
        return;
      }

      // 2. Crie o novo objeto de settings, mantendo os valores antigos e atualizando apenas o necessário
      const newSettings = {
        ...currentData.settings, // Mantém as configurações existentes
        online_booking_enabled: novoStatus // Atualiza apenas o status de ativação
      };

      console.log('📝 Novas configurações:', newSettings);

      // 3. Faça o UPDATE com o objeto completo
      const { error: updateError } = await supabase
        .from('salons')
        .update({ settings: newSettings })
        .eq('id', currentSalon.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar o status:', updateError);
        toast.error("Erro ao atualizar o status.");
    } else {
        console.log('✅ Status atualizado com sucesso!');
        // Atualize o estado local para a UI refletir a mudança imediatamente
        setIsLinkActive(novoStatus);
        toast.success(`Agendamento online ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao alternar status:', error);
      toast.error('Erro inesperado ao alternar status.');
    }
  };

  // Alternar status do link (interface do usuário)
  const toggleLinkStatus = () => {
    console.log('🔍 toggleLinkStatus chamado, isLinkActive:', isLinkActive);
    if (isLinkActive) {
      // Se está ativo, abre modal de confirmação para desativar
      console.log('🔍 Abrindo modal de desativação');
      setShowDeactivateModal(true);
    } else {
      // Se está desativado, ativa diretamente
      console.log('🔍 Ativando link diretamente');
      toggleBookingStatus(true);
    }
  };

  // Desativar link (chamado pelo modal)
  const deactivateLink = () => {
    console.log('🔍 Desativando link via modal');
    toggleBookingStatus(false);
    setShowDeactivateModal(false);
  };

  // Salvar configurações da agenda
  const saveAgendaSettings = async () => {
    if (!currentSalon?.id) return;

    setIsConfigLoading(true);

    try {
      console.log('💾 Salvando configurações da agenda:', {
        subdomain: linkAgendamento,
        timeInterval,
        minAdvanceTime,
        maxBookingPeriod,
        allowClientCancellation
      });

      // Converter valores para unidades padrão
      const slotIntervalInMinutes = Number(timeInterval);
      const minNoticeInMinutes = Number(minAdvanceTime);
      const maxPeriodInDays = Number(maxBookingPeriod);

      // Montar objeto settings
      const newSettings = {
        slot_interval: slotIntervalInMinutes,
        min_booking_notice: minNoticeInMinutes,
        max_booking_period: maxPeriodInDays,
        allow_client_cancellation: allowClientCancellation
      };

      const { error } = await supabase
        .from('salons')
        .update({
          subdomain: linkAgendamento,
          settings: newSettings
        })
        .eq('id', currentSalon.id);

  if (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        if (error.code === '23505') {
          toast.error('Este link (subdomínio) já está em uso. Tente outro.');
        } else {
          toast.error('Erro ao salvar as configurações.');
        }
      } else {
        console.log('✅ Configurações salvas com sucesso!');
        showSuccessMessage('Configurações salvas com sucesso!');
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao salvar configurações:', error);
      toast.error('Erro inesperado ao salvar configurações.');
    } finally {
      setIsConfigLoading(false);
    }
  };

  const handleUpdateProfile = (field: string, value: string) => {
    if (field === 'whatsapp') {
      // Aplicar máscara no telefone
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
      // Método moderno usando Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(linkAgendamento.trim());
    setIsCopied(true);
        toast.success('Link copiado para a área de transferência!');
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // Fallback para navegadores antigos
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
      console.log('📸 Iniciando upload da foto:', file.name);
      
      // 1. Enviar arquivo para o Storage
      const filePath = `${currentSalon.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('salon-profiles')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Erro no upload da foto:', uploadError);
        toast.error('Falha no upload da foto.');
        return;
      }

      console.log('✅ Arquivo enviado com sucesso:', filePath);

      // 2. Obter a URL pública
      const { data: urlData } = supabase.storage
        .from('salon-profiles')
        .getPublicUrl(filePath);
  
      const publicUrl = urlData.publicUrl;
      console.log('🔗 URL pública gerada:', publicUrl);

      // 3. Salvar a URL no banco de dados
      const { data: updatedData, error: dbError } = await supabase
        .from('salons')
        .update({ public_profile_photo_url: publicUrl })
        .eq('id', currentSalon.id)
        .select('public_display_name, public_whatsapp, public_instagram, public_address, public_profile_photo_url')
        .single();
      
      if (dbError) {
        console.error('❌ Erro ao salvar a referência da foto:', dbError);
        toast.error('Erro ao salvar a referência da foto.');
      } else {
        console.log('✅ Foto do perfil atualizada com sucesso!');
        console.log('📊 Dados atualizados retornados:', updatedData);
        toast.success('Foto do perfil atualizada!');
        
        // Atualizar o estado local com os dados retornados do banco
        if (updatedData) {
          setProfileData({
            name: updatedData.public_display_name || '',
            whatsapp: updatedData.public_whatsapp || '',
            instagram: updatedData.public_instagram || '',
            address: updatedData.public_address || ''
          });
          setProfilePhotoUrl(updatedData.public_profile_photo_url || '');
        }
      }
    } catch (error) {
      console.error('💥 Erro inesperado no upload da foto:', error);
      toast.error('Erro inesperado no upload da foto.');
    } finally {
      setIsPhotoLoading(false);
    }
  };



  const handleShare = () => {
    const linkAgendamento = `https://online.maapp.com.br/${currentSalon?.name?.replace(/\s+/g, '') || 'salon'}`;
    if (navigator.share) {
      navigator.share({
        title: 'Agendamento Online',
        text: 'Agende seu horário conosco!',
        url: linkAgendamento
      });
    } else {
      handleCopyLink();
    }
  };

  const handleMenuClick = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  const handleBack = () => {
    if (currentPage !== 'main') {
      setCurrentPage('main');
    } else if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  // Carregar dados do perfil
  const loadProfileData = async () => {
    if (!currentSalon?.id) return;

    try {
      console.log('🔍 Carregando dados do perfil para o salão:', currentSalon.id);
      
      const { data, error } = await supabase
        .from('salons')
        .select('public_display_name, public_whatsapp, public_instagram, public_address, public_profile_photo_url')
        .eq('id', currentSalon.id)
        .single();

      if (error) {
        console.error('❌ Erro ao carregar o perfil:', error.message);
        return;
      }

      console.log('✅ Dados do perfil carregados:', data);

      if (data) {
        setProfileData({
          name: data.public_display_name || '',
          whatsapp: data.public_whatsapp || '',
          instagram: data.public_instagram || '',
          address: data.public_address || ''
        });
        setProfilePhotoUrl(data.public_profile_photo_url || '');
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar perfil:', error);
    }
  };

  // Salvar dados do perfil
  const saveProfileData = async () => {
    if (!currentSalon?.id) return;

    setIsLoading(true);

    try {
      console.log('💾 Salvando dados do perfil:', profileData);
      
      const { data, error } = await supabase
        .from('salons')
        .update({
          public_display_name: profileData.name,
          public_whatsapp: profileData.whatsapp,
          public_instagram: profileData.instagram,
          public_address: profileData.address
        })
        .eq('id', currentSalon.id)
        .select('public_display_name, public_whatsapp, public_instagram, public_address, public_profile_photo_url')
        .single();
      
      if (error) {
        console.error('❌ Erro ao salvar o perfil:', error);
        toast.error('Erro ao salvar o perfil.');
    } else {
        console.log('✅ Perfil salvo com sucesso!');
        console.log('📊 Dados retornados do banco:', data);
        showSuccessMessage('Perfil atualizado com sucesso!');
        
        // Atualizar o estado local com os dados retornados do banco
        if (data) {
          setProfileData({
            name: data.public_display_name || '',
            whatsapp: data.public_whatsapp || '',
            instagram: data.public_instagram || '',
            address: data.public_address || ''
          });
          setProfilePhotoUrl(data.public_profile_photo_url || '');
        }
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao salvar perfil:', error);
      toast.error('Erro inesperado ao salvar o perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  // Página Principal
  if (currentPage === 'main') {
  return (
    <div className="flex flex-col h-full bg-gray-50 page-content">
      {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Agendamento Online</h1>
            <div className="w-10"></div> {/* Espaçador para centralizar o título */}
          </div>
        </div>

        {/* Banner de Status Compacto */}
        <div className="px-4 mt-4">
          <button
            onClick={toggleLinkStatus}
            className={`w-full rounded-lg p-3 transition-all duration-200 ${
              isLinkActive
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 hover:from-emerald-100 hover:to-green-100'
                : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:from-amber-100 hover:to-orange-100'
            }`}
          >
            <div className="flex items-center justify-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                isLinkActive 
                  ? 'bg-emerald-500 animate-pulse' 
                  : 'bg-amber-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                isLinkActive 
                  ? 'text-emerald-800' 
                  : 'text-amber-800'
              }`}>
                {isLinkActive 
                  ? 'Seu link de agendamento está ativo' 
                  : 'Seu link está inativo. Configure e ative-o.'
                }
              </span>
            </div>
          </button>
        </div>

        {/* Link de Agendamento */}
        <div className="px-4 mt-3">
          <div className={`rounded-lg p-3 ${
            isLinkActive 
              ? 'bg-white border border-gray-200' 
              : 'bg-gray-50 border border-gray-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${
                  isLinkActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {linkAgendamento || 'https://online.maapp.com.br/salon'}
                </p>
              </div>
              <button
                onClick={handleCopyLink}
                disabled={!isLinkActive}
                className={`ml-3 p-2 transition-colors ${
                  !isLinkActive 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : isCopied 
                      ? 'text-green-600 hover:text-green-700' 
                      : 'text-gray-500 hover:text-purple-600'
                }`}
                title={!isLinkActive ? 'Link desativado' : (isCopied ? 'Link copiado!' : 'Copiar link')}
              >
                {isCopied ? (
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                ) : (
                  <Copy size={16} />
            )}
          </button>
            </div>
        </div>
      </div>

        {/* Configurações */}
        <div className="px-4 mt-6">
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Configurações</h2>
            
            <div className="space-y-1">
              {/* Detalhes do Perfil */}
              <button
                onClick={() => setCurrentPage('profile')}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <User size={18} className="text-gray-600" />
            </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Detalhes do Perfil</p>
                    <p className="text-xs text-gray-500">Foto, Nome, Whats de contato, Instagram, e etc</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>

              {/* Configurações da Agenda */}
            <button
                onClick={() => setCurrentPage('config')}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Settings size={18} className="text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Configurações da Agenda</p>
                    <p className="text-xs text-gray-500">Intervalo, tempo de antecedência, política de cancelamento, permitir agendar no feriado, e etc</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
            </button>

              {/* Serviços Disponíveis */}
              <button
                onClick={() => setCurrentPage('services')}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Briefcase size={18} className="text-gray-600" />
          </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Serviços disponíveis para agendamento</p>
        </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>

              {/* Profissionais Disponíveis */}
              <button
                onClick={() => setCurrentPage('professionals')}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Users size={18} className="text-gray-600" />
          </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Profissionais disponíveis para agendamento</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
          </div>

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
      </div>
    );
  }

  // Páginas de Configuração
  return (
    <div className="flex flex-col h-full bg-gray-50 page-content">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
                     <h1 className="text-lg font-bold text-gray-900">
             {currentPage === 'config' && 'Configurações da Agenda'}
             {currentPage === 'profile' && 'Detalhes do Perfil'}
             {currentPage === 'services' && 'Serviços Disponíveis'}
             {currentPage === 'professionals' && 'Profissionais Disponíveis'}
           </h1>
        </div>
      </div>

      {/* Conteúdo das Páginas */}
      <div className="flex-1 p-4 overflow-y-auto">
        {currentPage === 'profile' && (
          <div className="space-y-6 max-w-2xl mx-auto">
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
                
                {/* Botão de adicionar/editar foto */}
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

            {/* Campos do Formulário */}
            <div className="space-y-4">
              {/* Nome */}
              <div className="group">
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome do Estúdio</label>
              <input
                  type="text"
                  placeholder="Digite o nome do seu estúdio..."
                  value={profileData.name}
                  onChange={(e) => handleUpdateProfile('name', e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:border-purple-300"
              />
            </div>

              {/* WhatsApp */}
              <div className="group">
                <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 sm:pl-3">
                    <div className="flex items-center justify-center sm:w-6 sm:h-6 w-7 h-7">
                      <svg className="w-5 h-5 text-green-500 sm:w-4 sm:h-4 w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </div>
                  </div>
              <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={profileData.whatsapp}
                    onChange={(e) => handleUpdateProfile('whatsapp', e.target.value)}
                    className="w-full pl-14 pr-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:border-green-300 sm:text-base text-sm sm:pl-12"
                  />
                </div>
            </div>

              {/* Instagram */}
              <div className="group">
                <label className="block text-xs font-medium text-gray-700 mb-1">Instagram</label>
                  <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 sm:pl-3">
                    <div className="flex items-center justify-center sm:w-6 sm:h-6 w-7 h-7">
                      <svg className="w-5 h-5 text-pink-500 sm:w-4 sm:h-4 w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="@seu_usuario"
                    value={profileData.instagram}
                    onChange={(e) => handleUpdateProfile('instagram', e.target.value)}
                    className="w-full pl-14 pr-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:border-pink-300 sm:text-base text-sm sm:pl-12"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="group">
                <label className="block text-xs font-medium text-gray-700 mb-1">Endereço</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 sm:pl-3">
                    <div className="flex items-center justify-center sm:w-6 sm:h-6 w-7 h-7">
                      <MapPin size={16} className="text-blue-500 sm:w-4 sm:h-4 w-6 h-6" />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Rua, número, bairro, cidade - UF"
                    value={profileData.address}
                    onChange={(e) => handleUpdateProfile('address', e.target.value)}
                    className="w-full pl-14 pr-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 hover:border-blue-300 sm:text-base text-sm sm:pl-12"
                  />
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="pt-4">
                    <button
                onClick={saveProfileData}
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/25'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Salvar Alterações</span>
                  </div>
                )}
                    </button>
            </div>
          </div>
        )}

        {currentPage === 'config' && (
          <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
              
              {/* Link de Agendamento */}
              <div className="group mb-4 sm:mb-6">
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
              <div className="group mb-4 sm:mb-6">
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
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 appearance-none text-center"
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
              <div className="group mb-4 sm:mb-6">
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
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 appearance-none text-center"
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
              <div className="group mb-4 sm:mb-6">
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
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 appearance-none text-center"
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
              <div className="group mb-4 sm:mb-6">
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
                    className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                      allowClientCancellation 
                        ? 'bg-green-500 justify-end' 
                        : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </button>
                  <span className={`ml-3 text-sm font-medium ${
                    allowClientCancellation ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {allowClientCancellation ? 'Ativado' : 'Desativado'}
                  </span>
            </div>

          </div>

              {/* Botão Salvar */}
              <button 
                onClick={saveAgendaSettings}
                disabled={isConfigLoading}
                className={`w-full mt-6 sm:mt-8 py-3 sm:py-4 px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  isConfigLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isConfigLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Salvando...
        </div>
                ) : (
                  'Salvar Configurações'
                )}
              </button>
      </div>
                  </div>
                )}

        {currentPage === 'services' && (
          <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">

              {/* Texto explicativo */}
              <div className="bg-purple-50 rounded-lg p-3 mb-4 text-center">
                <p className="text-xs sm:text-sm text-gray-700 leading-snug">
                  Toque no botão verde na direita da linha habilitar o serviço.<br/>
                  Para mudar o estilo de apresentação do preço do serviço toque no nome.
                </p>
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
                              Exibição do preço: {
                                settings.priceDisplay === 'normal' ? 'Normal' :
                                settings.priceDisplay === 'a_partir_de' ? 'A partir de' :
                                'Não exibir'
                              }
                            </div>
                          </button>
                        </div>
                        {/* Toggle compacto com check */}
                        <button
                          onClick={() => {
                            setServiceSettings(prev => ({
                              ...prev,
                              [serviceId]: {
                                ...prev[serviceId] || { priceDisplay: 'normal' },
                                enabled: !(prev[serviceId]?.enabled ?? true)
                              }
                            }));
                          }}
                          className={`w-8 h-5 sm:w-10 sm:h-6 rounded-full flex items-center p-0.5 transition-colors shadow-sm border border-gray-200 ${
                            settings.enabled 
                              ? 'bg-green-500 justify-end' 
                              : 'bg-gray-300 justify-start'
                          }`}
                        >
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center bg-white shadow-sm transition-all`}>
                            {settings.enabled && (
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

        {currentPage === 'professionals' && (
          <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
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
                        {/* Toggle compacto com check */}
                        <button
                          onClick={() => {
                            setProfessionalSettings(prev => ({
                              ...prev,
                              [professionalId]: {
                                enabled: !(prev[professionalId]?.enabled ?? true)
                              }
                            }));
                          }}
                          className={`w-8 h-5 sm:w-10 sm:h-6 rounded-full flex items-center p-0.5 transition-colors shadow-sm border border-gray-200 ${
                            settings.enabled 
                              ? 'bg-green-500 justify-end' 
                              : 'bg-gray-300 justify-start'
                          }`}
                        >
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center bg-white shadow-sm transition-all`}>
                            {settings.enabled && (
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

        {/* Modal de Ajuda */}
        {showHelpModal && (
          <div className="fixed inset-0 z-[99999] overflow-hidden">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowHelpModal(false)} />
            
            {/* Modal */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-72 max-w-[85vw] z-[100000]">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 text-center">
                  {helpModalContent.title}
                </h3>
              </div>
              
              {/* Conteúdo */}
              <div className="px-4 py-4">
                <p className="text-purple-600 text-sm leading-relaxed">
                  {helpModalContent.content}
                </p>
              </div>
              
              {/* Botão Fechar */}
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
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center">
                    Escolha o modo de exibição do preço
                  </h3>
                </div>
                {/* Opções */}
                <div className="space-y-3 mb-6">
                  {[
                    { value: 'normal', label: 'Normal' },
                    { value: 'a_partir_de', label: 'A partir de' },
                    { value: 'nao_exibir', label: 'Não exibir' }
                  ].map((option) => (
                <button
                      key={option.value}
                      onClick={() => {
                        setServiceSettings(prev => ({
                          ...prev,
                          [serviceId]: {
                            ...prev[serviceId] || { enabled: true },
                            priceDisplay: option.value as 'normal' | 'a_partir_de' | 'nao_exibir'
                          }
                        }));
                        setShowPriceDisplayModal(false);
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
                {/* Botão Fechar */}
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
    </div>
  );
}