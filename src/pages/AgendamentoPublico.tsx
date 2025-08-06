import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabaseService } from '../lib/supabaseService';
import { salonService } from '../lib/salonService';
import { LinkAgendamentoConfig } from '../types';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import User from 'lucide-react/dist/esm/icons/user';
import Scissors from 'lucide-react/dist/esm/icons/scissors';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Mail from 'lucide-react/dist/esm/icons/mail';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Check from 'lucide-react/dist/esm/icons/check';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Search from 'lucide-react/dist/esm/icons/search';
import X from 'lucide-react/dist/esm/icons/x';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Menu from 'lucide-react/dist/esm/icons/menu';
import { useSalonSlug, useIsMainDomain } from '../hooks/useSubdomain';
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt } from 'react-icons/fa';
import { AiFillInstagram } from 'react-icons/ai';
import { DEFAULT_PROFESSIONAL_COLOR } from '../utils/colorUtils';



// Tipos para o wizard
type WizardStep = 'services' | 'professional' | 'datetime' | 'client' | 'confirmation';

interface Service {
  id: string;
  name: string;
  price: number;
  estimated_time: number;
  category?: string;
  price_display_mode?: 'normal' | 'from' | 'hidden';
}

interface Professional {
  id: string;
  name: string;
  color?: string;
  url_foto?: string;
}

interface PublicBookingData {
  services: Service[];
  professionals: Professional[];
}

export default function AgendamentoPublico() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const salonSlug = useSalonSlug();
  const isMainDomain = useIsMainDomain();
  
  // Para compatibilidade: aceita salonId por query param (método antigo)
  const salonIdFromQuery = searchParams.get('salonId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<LinkAgendamentoConfig | null>(null);
  const [salonData, setSalonData] = useState<any>(null);
  
  // Estados do wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>('professional');
  const [bookingData, setBookingData] = useState<PublicBookingData>({ services: [], professionals: [] });
  
  // Estados das seleções
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Estado para o calendário customizado
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  
  // Estados do cliente
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Estados de processamento
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Estado para busca de serviços
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para serviços específicos do profissional
  const [servicesForProfessional, setServicesForProfessional] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  
  // Estados para configurações da agenda
  const [agendaConfig, setAgendaConfig] = useState<any>(null);

  // Seleção automática quando há apenas um profissional
  useEffect(() => {
    if (bookingData.professionals.length === 1 && !selectedProfessional) {
      setSelectedProfessional(bookingData.professionals[0].id);
    }
  }, [bookingData.professionals, selectedProfessional]);

  useEffect(() => {
    const loadSalonAndConfig = async () => {
      setLoading(true);
      setError(null);

      try {
        let salonId: string | null = null;

        // Prioridade 1: Se tem query parameter (compatibilidade)
        if (salonIdFromQuery) {
          salonId = salonIdFromQuery;
        }
        // Prioridade 2: Se tem subdomínio, buscar salão
        else if (salonSlug && !isMainDomain) {
          console.log('🔍 Carregando salão pelo subdomínio:', salonSlug);
          const salonResponse = await salonService.getSalonBySlug(salonSlug);
          
          if (salonResponse.success && salonResponse.salon) {
            salonId = salonResponse.salon.id;
            setSalonData(salonResponse.salon);
            console.log('✅ Salão carregado para agendamento público:', salonResponse.salon.name);
          } else {
            setError('Salão não encontrado');
            setLoading(false);
            return;
          }
        }
        // Caso contrário, erro
        else {
        setError('ID do salão não fornecido');
        setLoading(false);
        return;
      }

        // Carregar configurações do agendamento usando nova RPC
        const { data: configData, error: configError } = await supabaseService.linkAgendamento.getConfig(salonId);
        
        if (configError) {
          setError(configError);
          return;
        }

        if (configData) {
          setConfig(configData);
          setAgendaConfig(configData); // Armazenar configurações da agenda
          
          // Verificar se o agendamento online está ativo
          if (!configData.ativo) {
            setError('Agendamento online não está disponível no momento');
            return;
          }
        } else {
          setError('Configurações de agendamento não encontradas');
          return;
        }

        // Carregar informações para agendamento público (serviços e profissionais)
        const { data: bookingInfo, error: bookingError } = await supabaseService.linkAgendamento.getPublicBookingInfo(salonId);
        
        if (bookingError) {
          setError(bookingError);
          return;
        }

        if (bookingInfo) {
          setBookingData(bookingInfo);
        }



      } catch (err) {
        console.error('💥 Erro ao carregar agendamento público:', err);
        setError('Erro ao carregar página de agendamento');
      } finally {
        setLoading(false);
      }
    };

    loadSalonAndConfig();
  }, [salonSlug, isMainDomain, salonIdFromQuery]);

  // Este useEffect roda uma vez quando a página carrega
  useEffect(() => {
    try {
      const savedDataString = localStorage.getItem('belaGestao_clientData');
      if (savedDataString) {
        const savedData = JSON.parse(savedDataString);
        if (savedData.name) {
          setClientName(savedData.name);
        }
        if (savedData.phone) {
          setClientPhone(savedData.phone);
        }
      }
    } catch (e) {
      console.warn("Não foi possível carregar os dados do cliente do localStorage:", e);
    }
  }, []); // O array vazio [] garante que ele rode apenas uma vez

  // useEffect para carregar dados quando entrar na etapa de cliente
  useEffect(() => {
    if (currentStep === 'client') {
      try {
        const savedDataString = localStorage.getItem('belaGestao_clientData');
        if (savedDataString) {
          const savedData = JSON.parse(savedDataString);
          if (savedData.name) {
            setClientName(savedData.name);
          }
          if (savedData.phone) {
            setClientPhone(savedData.phone);
          }
        }
      } catch (e) {
        console.warn("Erro ao carregar dados do cliente:", e);
      }
    }
  }, [currentStep]);

  // useEffect para buscar serviços específicos do profissional
  useEffect(() => {
    const fetchServicesForProfessional = async () => {
      console.log('🔍 === BUSCANDO SERVIÇOS DO PROFISSIONAL ===');
      console.log('  - selectedProfessional:', selectedProfessional);
      
      // Garante que só executa se um profissional foi selecionado
      if (!selectedProfessional) {
        console.log('❌ Nenhum profissional selecionado, limpando serviços');
        setServicesForProfessional([]);
        return;
      }

      setIsLoadingServices(true);
      try {
        console.log('📞 Chamando listServicesForProfessional...');
        // Chama a nova função RPC do backend
        const { data, error } = await supabaseService.linkAgendamento.listServicesForProfessional(selectedProfessional, salonData?.id || '');
        
        console.log('📥 Resposta da listServicesForProfessional:');
        console.log('  - data:', data);
        console.log('  - error:', error);
        
        if (error) {
          console.error('❌ Erro ao buscar serviços do profissional:', error);
          setServicesForProfessional([]);
        } else {
          console.log('✅ Serviços carregados com sucesso:');
          if (data && Array.isArray(data)) {
            data.forEach((service, index) => {
              console.log(`  Serviço ${index + 1}:`, {
                id: service.id,
                name: service.name,
                estimated_time: service.estimated_time,
                price: service.price
              });
            });
          }
          setServicesForProfessional(data || []);
        }
      } catch (err) {
        console.error('💥 Erro inesperado ao buscar serviços do profissional:', err);
        setServicesForProfessional([]);
      } finally {
        setIsLoadingServices(false);
        console.log('🏁 === FIM DA BUSCA DE SERVIÇOS ===');
      }
    };

    fetchServicesForProfessional();
  }, [selectedProfessional]); // Dependência: roda de novo se o profissional mudar

  // Limpar serviços selecionados quando o profissional mudar
  useEffect(() => {
    setSelectedServices([]);
  }, [selectedProfessional]);

  // Função para calcular data mínima (considerando antecedência)
  const getMinDate = () => {
    const now = new Date();
    const minAdvanceMinutes = agendaConfig?.tempo_minimo_antecedencia || 60;
    const minDate = new Date(now.getTime() + minAdvanceMinutes * 60000);
    return minDate.toISOString().split('T')[0];
  };

  // Função para calcular data máxima (considerando período máximo)
  const getMaxDate = () => {
    const now = new Date();
    const maxDays = agendaConfig?.periodo_maximo_agendamento || 7;
    const maxDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);
    return maxDate.toISOString().split('T')[0];
  };

  // Função para calcular a data/hora mínima permitida
  const getMinDateTime = () => {
    const now = new Date();
    const minAdvanceMinutes = agendaConfig?.tempo_minimo_antecedencia || 60;
    return new Date(now.getTime() + minAdvanceMinutes * 60000);
  };

  // Buscar disponibilidade quando data for selecionada
  useEffect(() => {
    console.log('🔄 === useEffect PARA loadAvailability ===');
    console.log('  - selectedDate:', selectedDate);
    console.log('  - selectedProfessional:', selectedProfessional);
    console.log('  - selectedServices.length:', selectedServices.length);
    console.log('  - Condição atendida:', selectedDate && selectedProfessional && selectedServices.length > 0);
    
    if (selectedDate && selectedProfessional && selectedServices.length > 0) {
      console.log('✅ Todas as condições atendidas, chamando loadAvailability');
      loadAvailability();
    } else {
      console.log('❌ Condições não atendidas:');
      if (!selectedDate) console.log('  - selectedDate está vazio');
      if (!selectedProfessional) console.log('  - selectedProfessional está vazio');
      if (selectedServices.length === 0) console.log('  - selectedServices está vazio');
    }
  }, [selectedDate, selectedProfessional, selectedServices]);

  const loadAvailability = async () => {
    console.log('🚀 === INÍCIO DA FUNÇÃO loadAvailability ===');
    console.log('📋 Estado atual:');
    console.log('  - selectedDate:', selectedDate);
    console.log('  - selectedProfessional:', selectedProfessional);
    console.log('  - salonData?.id:', salonData?.id);
    console.log('  - selectedServices:', selectedServices);
    console.log('  - servicesForProfessional.length:', servicesForProfessional.length);

    if (!selectedDate || !selectedProfessional || !salonData?.id) {
      console.log('❌ Condições não atendidas, saindo da função');
      return;
    }

    setLoadingTimes(true);
    
    try {
      // Calcular duração total
      console.log('🔢 === CÁLCULO DA DURAÇÃO TOTAL ===');
      let totalDuration = 0;
      
      selectedServices.forEach((serviceId, index) => {
        const service = servicesForProfessional.find(s => s.id === serviceId);
        console.log(`📊 Serviço ${index + 1}:`);
        console.log(`  - ID: ${serviceId}`);
        console.log(`  - Encontrado: ${service ? 'SIM' : 'NÃO'}`);
        if (service) {
          console.log(`  - Nome: ${service.name}`);
          console.log(`  - estimated_time: ${service.estimated_time}`);
          console.log(`  - Tipo do estimated_time: ${typeof service.estimated_time}`);
        }
        const estimatedTime = service?.estimated_time || 0;
        totalDuration += estimatedTime;
        console.log(`  - Duração acumulada: ${totalDuration}`);
      });

      console.log('🎯 === PARÂMETROS FINAIS ===');
      console.log('  - selectedProfessional:', selectedProfessional);
      console.log('  - selectedDate:', selectedDate.toISOString().split('T')[0]);
      console.log('  - totalDuration:', totalDuration);
      console.log('  - agendaConfig?.intervalo_tempo:', agendaConfig?.intervalo_tempo);

      const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

      console.log('📞 === CHAMANDO get_availability ===');
      const { data, error } = await supabaseService.professionals.getAvailability(
        selectedProfessional,
        dateStr,
        totalDuration,
        agendaConfig?.intervalo_tempo // Novo parâmetro: intervalo de horários
      );

      console.log('📅 === RESPOSTA DA get_availability ===');
      console.log('  - data:', data);
      console.log('  - error:', error);
      console.log('  - tipo do data:', typeof data);
      console.log('  - é array?', Array.isArray(data));

      if (error) {
        console.warn('⚠️ Erro ao buscar disponibilidade:', error);
        setAvailableTimes([]);
      } else if (Array.isArray(data)) {
        console.log('✅ Horários disponíveis:', data);
        setAvailableTimes(data);
      } else {
        console.log('⚠️ Resposta inesperada da API:', data);
        setAvailableTimes([]);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar disponibilidade:', err);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
      console.log('🏁 === FIM DA FUNÇÃO loadAvailability ===');
    }
  };

  // Função para calcular totais
  const calculateTotals = () => {
    console.log('🧮 === CALCULANDO TOTAIS ===');
    console.log('  - selectedServices:', selectedServices);
    console.log('  - servicesForProfessional.length:', servicesForProfessional.length);
    
    const services = selectedServices.map(id => servicesForProfessional.find(s => s.id === id)).filter(Boolean) as Service[];
    console.log('  - services encontrados:', services.length);
    
    const totalPrice = services.reduce((total, service) => total + service.price, 0);
    const totalDuration = services.reduce((total, service) => total + service.estimated_time, 0);
    
    console.log('  - totalPrice:', totalPrice);
    console.log('  - totalDuration:', totalDuration);
    
    services.forEach((service, index) => {
      console.log(`    Serviço ${index + 1}: ${service.name} - ${service.estimated_time}min`);
    });
    
    return { totalPrice, totalDuration, services };
  };

  // Função para criar agendamento
  const createAppointment = async () => {
    if (!salonData?.id || !selectedProfessional || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      return;
    }

    setIsCreating(true);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabaseService.linkAgendamento.createPublicAppointment({
        salonId: salonData.id,
        professionalId: selectedProfessional,
        serviceIds: selectedServices,
        date: dateStr,
        startTime: selectedTime + ':00',
        clientName: clientName,
        clientPhone: clientPhone
      });

      if (error) {
        alert(`Erro ao criar agendamento: ${error}`);
        return;
      }

      if (data?.success) {
        // ---> INÍCIO DA NOVA LÓGICA <---
        try {
          const clientData = {
            name: clientName,
            phone: clientPhone
          };
          // Salva os dados como um objeto JSON stringificado
          localStorage.setItem('belaGestao_clientData', JSON.stringify(clientData));
          
          // Log de sucesso do agendamento
          console.log('✅ Agendamento criado com sucesso');
        } catch (e) {
          console.warn("Não foi possível salvar os dados do cliente no localStorage:", e);
        }
        // ---> FIM DA NOVA LÓGICA <---

        setShowSuccessModal(true);
        
        // Redirecionar após 800ms (menos de 1 segundo)
        setTimeout(() => {
          // Redirecionar para a página principal do agendamento público
          // Limpar todos os parâmetros e voltar ao início
          const baseUrl = window.location.origin + window.location.pathname;
          window.location.href = baseUrl;
        }, 800);
      } else {
        alert(data?.message || 'Erro desconhecido ao criar agendamento');
      }
    } catch (err) {
      console.error('❌ Erro ao criar agendamento:', err);
      alert('Erro inesperado ao criar agendamento');
    } finally {
      setIsCreating(false);
    }
  };

  // Navegação do wizard
  const canGoNext = () => {
    switch (currentStep) {
      case 'professional':
        return selectedProfessional !== '';
      case 'services':
        return selectedServices.length > 0;
      case 'datetime':
        return selectedDate && selectedTime;
      case 'client':
        return clientName.trim() !== '' && clientPhone.trim() !== '';
      case 'confirmation':
        return true; // Sempre pode avançar na confirmação
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canGoNext()) return;
    
    switch (currentStep) {
      case 'professional':
        setCurrentStep('services');
        break;
      case 'services':
        setCurrentStep('datetime');
        break;
      case 'datetime':
        setCurrentStep('client');
        break;
      case 'client':
        setCurrentStep('confirmation');
        break;
    }
  };

  const goBack = () => {
    switch (currentStep) {
      case 'services':
        setCurrentStep('professional');
        break;
      case 'datetime':
        setCurrentStep('services');
        break;
      case 'client':
        setCurrentStep('datetime');
        break;
      case 'confirmation':
        setCurrentStep('client');
        break;
    }
  };

  // Função para formatizar telefone com máscara
  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else if (limitedNumbers.length <= 10) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setClientPhone(formatted);
  };

  // Cores dinâmicas do banco de dados
  const primaryColor = config?.cor_primaria || '#8B5CF6';
  const secondaryColor = config?.cor_secundaria || '#A855F7';
  
  // Nome do salão: priorizar dados do salão carregado, senão usar configuração
  const salonDisplayName = config?.nome_exibicao || salonData?.public_display_name || salonData?.name || 'Salão';
  
  // Links sociais com lógica dinâmica
  const whatsappNumber = config?.whatsapp ? config.whatsapp.replace(/\D/g, '') : '';
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '';
  
  const instagramUsername = config?.instagram ? config.instagram.replace('@', '').trim() : '';
  const instagramLink = instagramUsername ? `https://www.instagram.com/${instagramUsername}` : '';
  
  // Debug para verificar se os dados estão chegando
  console.log('🔍 Debug Instagram:', { 
    configInstagram: config?.instagram, 
    instagramUsername, 
    instagramLink 
  });
  
  // Debug para verificar se o componente está sendo renderizado
  console.log('🔍 Renderizando seção de botões sociais');
  
  // Função para determinar se uma cor é clara ou escura
  // Função melhorada para calcular contraste e garantir legibilidade
  const getContrastColor = (backgroundColor: string) => {
    try {
      // Remove o # se presente
      const hex = backgroundColor.replace('#', '');
      // Verifica se é um hex válido
      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        return '#000000'; // Fallback preto se inválido
      }
      
      // Converte para RGB
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Calcula a luminância relativa (fórmula WCAG)
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      
      // Retorna branco para fundos escuros, preto para fundos claros
      // Usa um threshold mais conservador para garantir legibilidade
      return luminance > 0.6 ? '#000000' : '#FFFFFF';
    } catch (error) {
      return '#000000'; // Fallback preto em caso de erro
    }
  };

  // Função auxiliar para obter cor de contraste para botões
  const getButtonTextColor = () => {
    return getContrastColor(primaryColor);
  };

  // Função melhorada para calcular contraste e garantir legibilidade
  const isLightColor = (color: string) => {
    try {
      // Remove o # se presente
      const hex = color.replace('#', '');
      // Verifica se é um hex válido
      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        return true; // Fallback para cores claras se inválido
      }
      // Converte para RGB
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      // Calcula a luminância
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5;
    } catch (error) {
      return true; // Fallback para cores claras em caso de erro
    }
  };

  // Determina a cor do título baseada na cor primária - agora usando a função melhorada
  const getTitleColor = () => {
    if (!primaryColor) return '#000000'; // Fallback preto
    return getContrastColor(primaryColor);
  };

  // Componente auxiliar para exibição de preços
  const PriceDisplay = ({ service, className = "" }: { service: Service; className?: string }) => {
    // Primeiro, formata o preço para o padrão brasileiro.
    const formattedPrice = `R$ ${service.price.toFixed(2).replace('.', ',')}`;

    // Determina a cor do texto baseada na cor primária - agora usando a função melhorada
    const getTextColor = () => {
      if (!primaryColor) return '#374151'; // Fallback cinza escuro
      return getContrastColor(primaryColor);
    };

    // Agora, usa um switch para decidir o que renderizar
    switch (service.price_display_mode) {
      
      case 'from':
        // Se o modo for 'from', exibe "A partir de R$ XX,XX"
        return (
          <span className={`font-semibold ${className}`} style={{ color: getTextColor() }}>
            A partir de {formattedPrice}
          </span>
        );

      case 'hidden':
        // Se o modo for 'hidden', não renderiza nada.
        return null; 

      case 'normal':
      default:
        // Para 'normal' ou qualquer outro caso, exibe o preço normal.
        return (
          <span className={`font-semibold ${className}`} style={{ color: getTextColor() }}>
            {formattedPrice}
          </span>
        );
    }
  };
  
  const encodedAddress = config?.endereco ? encodeURIComponent(config.endereco) : '';
  const mapsLink = encodedAddress ? `https://www.google.com/maps/search/?api=1&query=${encodedAddress}` : '';

  // Função para agrupar serviços por categoria
  const groupServicesByCategory = (services: Service[]) => {
    const grouped: { [key: string]: Service[] } = {};
    
    services.forEach(service => {
      // Tentar extrair categoria do nome do serviço
      let category = 'Outros';
      
      // Lógica para detectar categoria baseada no nome
      const name = service.name.toLowerCase();
      if (name.includes('manutenção') || name.includes('manutencao')) {
        category = 'Manutenção';
      } else if (name.includes('corte') || name.includes('cabelo')) {
        category = 'Corte';
      } else if (name.includes('coloração') || name.includes('coloracao') || name.includes('tintura')) {
        category = 'Coloração';
      } else if (name.includes('tratamento') || name.includes('hidratação') || name.includes('hidratacao')) {
        category = 'Tratamento';
      } else if (name.includes('escova') || name.includes('penteado')) {
        category = 'Escova';
      } else if (name.includes('unha') || name.includes('nail')) {
        category = 'Unhas';
      }
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });
    
    return grouped;
  };

  // Função para gerar os dias do calendário
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    
    // Dia da semana do primeiro dia (0 = domingo, 1 = segunda, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Adicionar dias vazios do mês anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar todos os dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      
      // Verificar se a data está dentro do período permitido
      const minDate = new Date(getMinDate());
      const maxDate = new Date(getMaxDate());
      
      // Se a data está fora do período permitido, adicionar como null
      if (date < minDate || date > maxDate) {
        days.push(null);
      } else {
        days.push(date);
      }
    }
    
    return days;
  };

  // Função para gerar os dias do calendário customizado
  const getCustomCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    
    // Dia da semana do primeiro dia (0 = domingo, 1 = segunda, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Adicionar dias vazios do mês anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar todos os dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      
      // Verificar se a data está dentro do período permitido
      const minDate = new Date(getMinDate());
      const maxDate = new Date(getMaxDate());
      
      // Se a data está fora do período permitido, adicionar como null
      if (date < minDate || date > maxDate) {
        days.push(null);
      } else {
        days.push(date);
      }
    }
    
    return days;
  };

  // Filtrar e agrupar serviços
  const filteredServices = servicesForProfessional.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const groupedServices = groupServicesByCategory(filteredServices);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: 'var(--cor-primaria)' }} />
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-4">{error || 'Erro desconhecido'}</p>
          {salonSlug && (
            <p className="text-sm text-gray-500">
              Subdomínio: {salonSlug}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Agendamento Confirmado!
          </h1>
          <p className="text-gray-600 mb-6">
            {completionMessage}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-white px-6 py-2 rounded-lg transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--cor-primaria)'
            }}
          >
            Fazer novo agendamento
          </button>
        </div>
      </div>
    );
  }

  // MOBILE-ONLY: Layout especial para a primeira etapa (profissionais)
  if ((currentStep as string) === 'professional') {
    return (
      <div 
        className="min-h-screen flex flex-col items-center px-4 pt-6 pb-6"
        style={{
          maxWidth: 480,
          margin: '0 auto',
          '--cor-primaria': primaryColor || '#E9D8FD',
          '--cor-secundaria': secondaryColor || '#FFFFFF',
          backgroundImage: 'linear-gradient(to bottom, var(--cor-primaria), var(--cor-secundaria))',
        } as React.CSSProperties}
      >
        {/* Cabeçalho Compacto */}
        <div className="w-full max-w-md mb-4">
          {/* Menu Button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => {
                const currentParams = new URLSearchParams();
                if (salonSlug) {
                  navigate('/meus-agendamentos');
                } else if (salonData?.id) {
                  currentParams.set('salonId', salonData.id);
                  navigate(`/meus-agendamentos?${currentParams.toString()}`);
                }
              }}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/20"
              title="Meus Agendamentos"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>

        {/* Foto do salão */}
          <div className="flex items-center justify-center mb-4">
            {config?.foto_perfil_url ? (
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/40 shadow-xl bg-white/95 backdrop-blur-sm">
                <img 
                  src={config.foto_perfil_url} 
                  alt="Foto do salão" 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div 
                className="w-32 h-32 rounded-full border-2 border-white/40 shadow-xl flex items-center justify-center bg-white/95 backdrop-blur-sm"
                style={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}
              >
                <User size={64} style={{ color: getTitleColor() }} />
              </div>
          )}
        </div>

        {/* Nome do salão */}
            <h1
              className="text-2xl font-bold text-center mb-3"
              style={{ color: getTitleColor() }}
            >
              {salonDisplayName}
            </h1>

          {/* Botões sociais compactos com funcionalidade completa */}
          <div className="flex items-center justify-center gap-3 mb-4">
          {whatsappLink && (
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border border-white/20"
              >
                <FaWhatsapp className="w-5 h-5 text-green-500" />
            </a>
          )}
            {/* Instagram - sempre mostrar, mesmo sem link */}
            <a 
              href={instagramLink || '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border border-white/20"
              onClick={!instagramLink ? (e) => e.preventDefault() : undefined}
            >
              <FaInstagram className="w-5 h-5 text-pink-500" />
            </a>
          {mapsLink && (
              <a 
                href={mapsLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border border-white/20"
              >
                <FaMapMarkerAlt className="w-5 h-5 text-blue-500" />
            </a>
          )}
            
        </div>
        </div>

        {/* Título da seção */}
        <div className="w-full max-w-md mb-4">
          <h2 className="text-xl font-semibold text-white mb-2 text-center">Selecione o profissional</h2>
          
        </div>

        {/* Card de profissionais */}
        <div className="w-full max-w-md">
          {bookingData.professionals.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum profissional disponível no momento.</p>
            </div>
                        ) : (
                <div className="space-y-3">
                  {bookingData.professionals.map((professional) => (
                    <div
                      key={professional.id}
                      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl ${
                        selectedProfessional === professional.id 
                          ? 'shadow-xl' 
                          : 'shadow-lg'
                      }`}
                      style={selectedProfessional === professional.id ? {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)'
                      } : {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(15px)',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
                      }}
                      onClick={() => {
                        setSelectedProfessional(professional.id);
                        // Avançar automaticamente após um pequeno delay para feedback visual
                        setTimeout(() => {
                          goNext();
                        }, 300);
                      }}
                    >
                      <div className="flex items-center p-4">
                        {/* Avatar do profissional */}
                        <div className="flex-shrink-0 mr-4">
                          {professional.url_foto ? (
                            <img
                              src={professional.url_foto}
                              alt={professional.name}
                              className="w-12 h-12 rounded-full object-cover border-2"
                              style={{ 
                                borderColor: selectedProfessional === professional.id ? primaryColor : 'rgba(255, 255, 255, 0.4)',
                                boxShadow: selectedProfessional === professional.id ? `0 0 12px ${primaryColor}30` : '0 2px 8px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg"
                              style={{ 
                                backgroundColor: selectedProfessional === professional.id ? primaryColor : (professional.color || DEFAULT_PROFESSIONAL_COLOR),
                                boxShadow: selectedProfessional === professional.id ? `0 0 12px ${primaryColor}30` : '0 2px 8px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              {professional.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        {/* Nome do profissional */}
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-semibold text-lg truncate"
                            style={{ 
                              color: '#FFFFFF'
                            }}
                          >
                            {professional.name}
                          </h3>
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

  // MOBILE-ONLY: Layout especial para a segunda etapa (serviços)
  if ((currentStep as string) === 'services') {
    return (
      <div 
        className="min-h-screen flex flex-col items-center px-4 pt-6 pb-24"
        style={{
          maxWidth: 480,
          margin: '0 auto',
          '--cor-primaria': primaryColor || '#E9D8FD',
          '--cor-secundaria': secondaryColor || '#FFFFFF',
          backgroundImage: 'linear-gradient(to bottom, var(--cor-primaria), var(--cor-secundaria))',
        } as React.CSSProperties}
      >
        {/* Cabeçalho com botão voltar */}
        <div className="w-full max-w-md mb-4">
          <div className="flex items-center justify-start mb-4">
            <button
              onClick={goBack}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Voltar</span>
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="w-full max-w-md mb-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Qual o Serviço procurado?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm rounded-full border border-white/20 shadow-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
              style={{
                '--tw-ring-color': 'var(--cor-primaria)'
              } as React.CSSProperties}
            />
          </div>
        </div>

                  {/* Card de serviços */}
          <div className="w-full max-w-md bg-transparent backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden">
          <div className="p-4 pb-6">
            
            {isLoadingServices ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
                <p className="text-gray-500">Buscando serviços...</p>
              </div>
            ) : filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Nenhum serviço encontrado.' : 'Este profissional não tem serviços disponíveis para agendamento online.'}
                </p>
            </div>
          ) : (
              <div className="space-y-2 sm:space-y-3">
                                  {Object.entries(groupedServices).map(([category, services]) => (
                    <div key={category}>
                      {/* Lista de serviços da categoria */}
                    <div className="space-y-2">
                      {services.map((service, index) => {
                const isSelected = selectedServices.includes(service.id);
                        
                return (
                          <button
                    key={service.id}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 min-h-[60px] ${
                              isSelected 
                                ? 'border-white shadow-sm' 
                                : 'border-white/20 hover:border-white/40'
                            }`}
                            style={isSelected ? {
                              borderColor: '#FFFFFF',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            } : {
                              backgroundColor: 'transparent'
                            }}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedServices(prev => prev.filter(id => id !== service.id));
                      } else {
                        setSelectedServices(prev => [...prev, service.id]);
                      }
                    }}
                  >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1" style={{ color: getTitleColor() }}>{service.name}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs" style={{ color: getTitleColor() }}>
                                    {service.estimated_time} min
                                  </span>
                      {config.mostrar_precos && (
                                    <span className="text-xs" style={{ color: getTitleColor() }}>
                                      {service.price_display_mode === 'from' ? 'A partir de ' : ''}
                                      {service.price_display_mode !== 'hidden' ? `R$ ${service.price.toFixed(2).replace('.', ',')}` : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3 ${
                                isSelected ? 'border-white bg-white' : 'border-white/30'
                              }`}
                              style={isSelected ? {
                                backgroundColor: '#FFFFFF',
                                borderColor: '#FFFFFF'
                              } : {}}>
                        {isSelected && (
                                  <Check className="w-3 h-3 text-gray-900" />
                        )}
                      </div>
                    </div>
                          </button>
                );
              })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        </div>

        {/* Botão avançar flutuante - só aparece quando há serviços selecionados */}
        {selectedServices.length > 0 && (
          <div className="fixed bottom-6 left-4 right-4 z-50">
            <button
              onClick={goNext}
              className="w-full py-4 rounded-2xl text-lg font-bold shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-105 bg-white text-gray-900"
            >
              Avançar
            </button>
          </div>
        )}
      </div>
    );
  }

  // MOBILE-ONLY: Layout especial para a terceira etapa (data e horário)
  if ((currentStep as string) === 'datetime') {
    return (
      <div 
        className="min-h-screen flex flex-col items-center px-4 pt-6 pb-6"
        style={{
          maxWidth: 480,
          margin: '0 auto',
          '--cor-primaria': primaryColor || '#E9D8FD',
          '--cor-secundaria': secondaryColor || '#FFFFFF',
          backgroundImage: 'linear-gradient(to bottom, var(--cor-primaria), var(--cor-secundaria))',
        } as React.CSSProperties}
      >
        {/* Cabeçalho com botão voltar e calendário */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Voltar</span>
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔍 Clique no botão calendário detectado');
                setShowCustomCalendar(true);
              }}
              className={`flex items-center space-x-2 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-300 ${
                selectedDate ? 'px-3 py-2' : 'p-2'
              }`}
              style={{ color: getTitleColor() }}
              type="button"
            >
              <Calendar className="w-5 h-5 flex-shrink-0" />
              {selectedDate && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {selectedDate.toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </span>
              )}
            </button>
          </div>
        </div>

                  {/* Seletor de Data Sutil */}
        <div className="w-full max-w-md mb-6">
          {/* Datas horizontais */}
          <div className="flex space-x-3 overflow-x-auto scrollbar-hide -webkit-overflow-scrolling-touch">
            {(() => {
              const days = [];
              const minDate = new Date(getMinDate());
              const maxDate = new Date(getMaxDate());
              const today = new Date();
              
              // Gerar até 14 dias, mas respeitando as configurações
              for (let i = 0; i < 14; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                
                // Verificar se a data está dentro do período permitido
                if (date >= minDate && date <= maxDate) {
                  const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                  const isToday = i === 0;
                  
                  // Obter o dia da semana em português
                  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                  const dayOfWeek = dayNames[date.getDay()];
                  
                  days.push(
                    <div key={i} className="flex-shrink-0 flex flex-col items-center">
                      {/* Dia da semana */}
                      <div className="text-xs font-medium mb-1" style={{ color: getTitleColor() }}>
                        {dayOfWeek}
                      </div>
                      
                      {/* Data */}
                      <button
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime('');
                        }}
                        className={`w-14 h-14 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center ${
                          isSelected 
                            ? 'border-white bg-white text-purple-600' 
                            : 'border-white/30 hover:border-white/50'
                        }`}
                        style={isSelected ? {
                          borderColor: '#FFFFFF',
                          backgroundColor: '#FFFFFF',
                          color: primaryColor
                        } : {
                          color: getTitleColor()
                        }}
                      >
                        <span className="text-sm font-medium">
                          {date.getDate().toString().padStart(2, '0')}
                        </span>
                        {isToday && (
                          <span className="text-xs opacity-70">Hoje</span>
                        )}
                      </button>
                    </div>
                  );
                }
              }
              
              return days;
            })()}
          </div>
        </div>

        {/* Seletor de Horário */}
        {selectedDate && (
          <div className="w-full max-w-md mb-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: getTitleColor() }}>
              Horário disponível
            </h3>
            
            {loadingTimes ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: 'var(--cor-primaria)' }} />
                <p className="text-sm text-gray-500">Carregando horários...</p>
              </div>
            ) : (() => {
              const filteredTimes = availableTimes.filter(time => {
                if (!selectedDate) return true;
                
                const timeDate = new Date(selectedDate);
                const [hours, minutes] = time.split(':').map(Number);
                timeDate.setHours(hours, minutes, 0, 0);
                
                const minDateTime = getMinDateTime();
                return timeDate >= minDateTime;
              });
              
              if (filteredTimes.length === 0) {
                return (
                  <div className="text-center py-4">
                    <Clock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {availableTimes.length > 0 
                        ? 'Nenhum horário disponível devido ao tempo mínimo de antecedência.' 
                        : 'Nenhum horário disponível para esta data.'
                      }
                    </p>
                  </div>
                );
              }
              
              return (
                <div className="grid grid-cols-4 gap-1">
                  {filteredTimes.map((time) => (
                                          <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          // Verificar dados salvos e avançar automaticamente
                          setTimeout(() => {
                            // Verificar se já temos dados do cliente salvos
                            try {
                              const savedDataString = localStorage.getItem('belaGestao_clientData');
                              if (savedDataString) {
                                const savedData = JSON.parse(savedDataString);
                                if (savedData.name && savedData.phone) {
                                  // Dados já salvos, ir direto para confirmação
                                  setClientName(savedData.name);
                                  setClientPhone(savedData.phone);
                                  setCurrentStep('confirmation');
                                  return;
                                }
                              }
                            } catch (e) {
                              console.warn("Erro ao verificar dados salvos:", e);
                            }
                            // Dados não salvos, ir para etapa de cliente
                            setCurrentStep('client');
                          }, 300);
                        }}
                        className={`py-2 px-2 rounded-lg border-2 transition-all duration-200 text-xs font-medium ${
                          selectedTime === time 
                            ? 'border-white bg-white' 
                            : 'border-white/30 hover:border-white/50'
                        }`}
                        style={selectedTime === time ? {
                          borderColor: '#FFFFFF',
                          backgroundColor: '#FFFFFF',
                          color: primaryColor
                        } : {
                          color: getTitleColor()
                        }}
                      >
                        {time}
                      </button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}



        {/* Modal do Calendário Customizado */}
        {showCustomCalendar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
              {/* Cabeçalho do calendário */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Selecione uma data</h3>
                <button
                  onClick={() => setShowCustomCalendar(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Navegação do mês */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    const newDate = new Date(calendarMonth);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCalendarMonth(newDate);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <h4 className="text-base font-medium text-gray-900">
                  {calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h4>
                <button
                  onClick={() => {
                    const newDate = new Date(calendarMonth);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCalendarMonth(newDate);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid do calendário */}
              <div className="grid grid-cols-7 gap-1">
                {getCustomCalendarDays().map((day, index) => {
                  if (!day) {
                    return <div key={index} className="h-10" />;
                  }
                  
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
                  const isAvailable = day >= new Date();
                  const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                  
                  return (
                    <button
                      key={index}
                      disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedDate(day);
                          setSelectedTime('');
                          setShowCustomCalendar(false);
                        }
                      }}
                      className={`h-10 rounded-full text-sm font-medium transition-all ${
                        isSelected 
                          ? 'bg-purple-600 text-white' 
                          : isToday 
                            ? 'border-2 border-purple-600 text-purple-600' 
                            : !isCurrentMonth 
                              ? 'text-gray-300' 
                              : isAvailable 
                                ? 'hover:bg-gray-100 text-gray-900' 
                                : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Debug para verificar o estado
  console.log('🔍 Estado showCustomCalendar:', showCustomCalendar);

  return (
    <>
      {/* Etapa 5: Confirmação - Layout especial */}
      {(currentStep as string) === 'confirmation' ? (
        <div 
          className="min-h-screen flex flex-col items-center px-4 pt-6 pb-6"
          style={{
            maxWidth: 480,
            margin: '0 auto',
            '--cor-primaria': primaryColor || '#E9D8FD',
            '--cor-secundaria': secondaryColor || '#FFFFFF',
            backgroundImage: 'linear-gradient(to bottom, var(--cor-primaria), var(--cor-secundaria))',
          } as React.CSSProperties}
        >
          {/* Header com botão voltar */}
          <div className="w-full max-w-md mb-4">
            <div className="flex items-center justify-start">
              <button
                onClick={goBack}
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Voltar</span>
              </button>
            </div>
          </div>

          {/* Título */}
          <div className="w-full max-w-md mb-4">
            <h2 className="text-xl font-semibold text-white text-center">
              Confirme seu agendamento
            </h2>
          </div>
            
          {/* Card de confirmação transparente */}
          <div className="w-full max-w-md bg-transparent backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden">
            <div className="p-6">
              <div className="space-y-6">
                {/* Data e Horário */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/70 mb-1">
                      Data e Hora
                    </div>
                    <div className="text-base font-semibold text-white">
                      {selectedDate && (() => {
                        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                        const dayName = dayNames[selectedDate.getDay()];
                        const day = selectedDate.getDate().toString().padStart(2, '0');
                        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                        return `${dayName}, ${day}/${month} às ${selectedTime}`;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Profissional */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/70 mb-1">
                      Profissional
                    </div>
                    <div className="text-base font-semibold text-white">
                      {bookingData.professionals.find(p => p.id === selectedProfessional)?.name}
                    </div>
                  </div>
                </div>

                {/* Serviços */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/70 mb-1">
                      Serviços
                    </div>
                    <div className="text-base font-semibold text-white">
                      {selectedServices.map((serviceId, index) => {
                        const service = servicesForProfessional.find(s => s.id === serviceId);
                        if (!service) return null;
                        
                        return (
                          <span key={serviceId}>
                            {service.name}
                            {index < selectedServices.length - 1 && <span className="text-white/50">, </span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botão confirmar */}
          <div className="w-full max-w-md mt-6">
            <button
              onClick={createAppointment}
              disabled={isCreating}
              className="w-full py-4 rounded-2xl text-lg font-bold shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-105 bg-white text-gray-900"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                'Confirmar'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="min-h-screen font-sans"
          style={{
            '--cor-primaria': primaryColor || '#E9D8FD',
            '--cor-secundaria': secondaryColor || '#FFFFFF',
            backgroundImage: 'linear-gradient(to bottom, var(--cor-primaria), var(--cor-secundaria))',
          } as React.CSSProperties}
        >
          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-transparent backdrop-blur-sm rounded-lg shadow-sm p-6">
              
              {/* Etapa 1: Seleção de Serviços */}
              {(currentStep as string) === 'services' && (
            <div>
              <h2 className="text-xl font-semibold mb-6" style={{ color: getTitleColor() }}>
                Selecione os serviços desejados
              </h2>
              
              {isLoadingServices ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
                  <p className="text-gray-500">Buscando serviços...</p>
                </div>
              ) : servicesForProfessional.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {servicesForProfessional.map((service) => {
                    const isSelected = selectedServices.includes(service.id);
                    
                    return (
                      <button
                        key={service.id}
                        className={`w-full text-left border-2 rounded-lg p-3 transition-all duration-200 min-h-[60px] ${
                          isSelected 
                            ? 'border-purple-200 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        style={isSelected ? {
                          borderColor: 'var(--cor-primaria)',
                          backgroundColor: `${primaryColor}10`
                        } : {}}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedServices(prev => prev.filter(id => id !== service.id));
                          } else {
                            setSelectedServices(prev => [...prev, service.id]);
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm" style={{ color: getTitleColor() }}>{service.name}</h3>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-xs" style={{ color: getTitleColor() }}>
                                {service.estimated_time} min
                              </span>
                              {config.mostrar_precos && (
                                <span className="text-xs" style={{ color: getTitleColor() }}>
                                  {service.price_display_mode === 'from' ? 'A partir de ' : ''}
                                  {service.price_display_mode !== 'hidden' ? `R$ ${service.price.toFixed(2).replace('.', ',')}` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                            }`}
                            style={isSelected ? {
                              backgroundColor: 'var(--cor-primaria)',
                              borderColor: 'var(--cor-primaria)'
                            } : {}}>
                              {isSelected && (
                                <Check className="w-2.5 h-2.5" style={{ color: getContrastColor(primaryColor) }} />
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Este profissional não tem serviços disponíveis para agendamento online.
                  </p>
                </div>
              )}

              {selectedServices.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Total de serviços: {selectedServices.length}</span>
                    <span>Duração estimada: {calculateTotals().totalDuration} min</span>
                    {config.mostrar_precos && (
                      <span>Total: R$ {calculateTotals().totalPrice.toFixed(2).replace('.', ',')}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Etapa 2: Seleção de Profissional */}
          {(currentStep as string) === 'professional' && (
            <div className="min-h-screen flex flex-col">
              {/* Header com botão voltar */}
              <div className="flex items-center mb-6">
                <button 
                  onClick={goBack}
                  className="flex items-center text-white hover:text-gray-200 transition-colors mr-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Voltar</span>
                </button>
              </div>

              {/* Título da seção */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Selecione o profissional</h2>
                <p className="text-sm text-white/70">Escolha o profissional que irá realizar seu serviço</p>
              </div>

              {bookingData.professionals.length === 0 ? (
                <div className="text-center py-8 flex-1 flex items-center justify-center">
                  <div>
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum profissional disponível no momento.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  {bookingData.professionals.map((professional, index) => (
                    <div
                      key={professional.id}
                      className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                        selectedProfessional === professional.id 
                          ? 'shadow-lg' 
                          : 'shadow-sm hover:shadow-md'
                      }`}
                      style={selectedProfessional === professional.id ? {
                        backgroundColor: `${primaryColor}20`,
                        border: `2px solid ${primaryColor}`
                      } : {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '2px solid rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)'
                      }}
                      onClick={() => {
                        setSelectedProfessional(professional.id);
                        // Avançar automaticamente após um pequeno delay para feedback visual
                        setTimeout(() => {
                          goNext();
                        }, 300);
                      }}
                    >
                      {/* Indicador de seleção */}
                      {selectedProfessional === professional.id && (
                        <div 
                          className="absolute top-0 left-0 w-1 h-full"
                          style={{ backgroundColor: primaryColor }}
                        />
                      )}
                      
                      <div className="flex items-center p-6">
                        {/* Avatar do profissional */}
                        <div className="flex-shrink-0 mr-4">
                          {(professional as any).url_foto ? (
                            <img
                              src={(professional as any).url_foto}
                              alt={professional.name}
                              className="w-16 h-16 rounded-full object-cover border-2"
                              style={{ 
                                borderColor: selectedProfessional === professional.id ? primaryColor : 'rgba(255, 255, 255, 0.3)'
                              }}
                            />
                          ) : (
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-medium text-xl"
                              style={{ 
                                backgroundColor: selectedProfessional === professional.id ? primaryColor : (professional.color || DEFAULT_PROFESSIONAL_COLOR)
                              }}
                            >
                              {professional.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        {/* Informações do profissional */}
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-semibold text-xl truncate mb-1"
                            style={{ 
                              color: selectedProfessional === professional.id ? primaryColor : '#FFFFFF'
                            }}
                          >
                            {professional.name}
                          </h3>
                          <p className="text-sm opacity-70 text-white/80">
                            Profissional
                          </p>
                        </div>
                        
                        {/* Ícone de seleção */}
                        <div className="flex-shrink-0 ml-3">
                          {selectedProfessional === professional.id ? (
                            <div 
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: primaryColor }}
                            >
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full border-2 border-white/30 opacity-50" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Etapa 3: Seleção de Data e Horário */}
          {(currentStep as string) === 'datetime' && (
            <div>
                {/* Calendário Compacto */}
                                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          const newDate = new Date(currentMonth);
                          newDate.setMonth(newDate.getMonth() - 1);
                          setCurrentMonth(newDate);
                        }}
                        className="p-1 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <ChevronLeft className="w-3 h-3" style={{ color: getTitleColor() }} />
                      </button>
                      <h3 className="text-sm font-semibold" style={{ color: getTitleColor() }}>
                        {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        onClick={() => {
                          const newDate = new Date(currentMonth);
                          newDate.setMonth(newDate.getMonth() + 1);
                          setCurrentMonth(newDate);
                        }}
                        className="p-1 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <ChevronRight className="w-3 h-3" style={{ color: getTitleColor() }} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Dias da semana */}
                  <div className="grid grid-cols-7 gap-0 mb-0.5">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                      <div key={day} className="text-center text-xs font-medium py-0.5" style={{ color: getTitleColor() }}>
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Grid do calendário */}
                  <div className="grid grid-cols-7 gap-0">
                    {getCalendarDays().map((day, index) => {
                      if (!day) {
                        return <div key={index} className="h-6" />;
                      }
                      
                      const isToday = day.toDateString() === new Date().toDateString();
                      const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
                      const isAvailable = Array.from({ length: 30 }).some((_, i) => {
                        const availableDate = new Date();
                        availableDate.setDate(availableDate.getDate() + i);
                        return availableDate.toDateString() === day.toDateString();
                      });
                      const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                      
                    return (
                      <button
                          key={index}
                          disabled={!isAvailable}
                        onClick={() => {
                            if (isAvailable) {
                              setSelectedDate(day);
                          setSelectedTime('');
                            }
                          }}
                          className={`h-6 rounded-full text-xs font-medium transition-all ${
                            isSelected 
                              ? 'text-white' 
                              : isToday 
                                ? 'border border-gray-400' 
                                : !isCurrentMonth 
                                  ? 'text-gray-400' 
                                  : isAvailable 
                                    ? 'hover:bg-white/20' 
                                    : 'text-gray-400 cursor-not-allowed'
                          }`}
                          style={isSelected ? {
                            backgroundColor: 'var(--cor-primaria)'
                          } : {}}
                        >
                          {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Seletor de Horário */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: getTitleColor() }}>
                    Horário disponível
                  </label>
                  {loadingTimes ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--cor-primaria)' }} />
                      <span className="ml-2 text-gray-600">Carregando horários...</span>
                    </div>
                  ) : availableTimes.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => {
                            setSelectedTime(time);
                            // Verificar dados salvos e avançar automaticamente
                            setTimeout(() => {
                              // Verificar se já temos dados do cliente salvos
                              try {
                                const savedDataString = localStorage.getItem('belaGestao_clientData');
                                if (savedDataString) {
                                  const savedData = JSON.parse(savedDataString);
                                  if (savedData.name && savedData.phone) {
                                    // Dados já salvos, ir direto para confirmação
                                    setClientName(savedData.name);
                                    setClientPhone(savedData.phone);
                                    setCurrentStep('confirmation');
                                    return;
                                  }
                                }
                              } catch (e) {
                                console.warn("Erro ao verificar dados salvos:", e);
                              }
                              // Dados não salvos, ir para etapa de cliente
                              setCurrentStep('client');
                            }, 300);
                          }}
                          className={`p-1.5 border rounded-md text-center transition-colors text-xs ${
                            selectedTime === time
                              ? 'text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={selectedTime === time ? {
                            backgroundColor: 'var(--cor-primaria)',
                            borderColor: 'var(--cor-primaria)'
                          } : {}}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 py-4">
                      Nenhum horário disponível para esta data. Tente outra data.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

                    {/* Etapa 4: Dados do Cliente */}
          {(currentStep as string) === 'client' && (
            <div className="min-h-screen">
              {/* Header com botão voltar */}
              <div className="flex items-center px-2 py-3">
                <button
                  onClick={goBack}
                  className="flex items-center text-white hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Voltar</span>
                </button>
              </div>

              {/* Conteúdo principal */}
              <div className="px-4 py-6">
                <h2 className="text-xl font-semibold mb-6 text-white">
                  Seus dados
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="block w-full border border-white/30 rounded-lg px-3 py-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={handlePhoneChange}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      className="block w-full border border-white/30 rounded-lg px-3 py-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Botão para limpar dados salvos */}
                  {(clientName || clientPhone) && (
                    <div className="text-center pt-2">
                      <button 
                        onClick={() => {
                          setClientName('');
                          setClientPhone('');
                          localStorage.removeItem('belaGestao_clientData');
                        }} 
                        className="text-sm text-white/80 hover:text-white transition-colors underline"
                      >
                        Não é você? Limpar dados
                      </button>
                    </div>
                  )}
                </div>

                {/* Botão avançar */}
                <div className="mt-8 px-4">
                  <button
                    onClick={goNext}
                    disabled={!canGoNext()}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      canGoNext() 
                        ? 'hover:opacity-90' 
                        : 'bg-white/20 text-white/50 cursor-not-allowed'
                    }`}
                    style={canGoNext() ? { 
                      backgroundColor: 'var(--cor-primaria)',
                      color: getContrastColor(primaryColor)
                    } : {}}
                  >
                    Avançar
                  </button>
                </div>
              </div>
            </div>
          )}




        </div>
      </main>
      </div>
      )}

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl transform transition-all duration-300">
            {/* Ícone de Sucesso */}
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Título */}
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Agendamento Confirmado!
            </h3>

            {/* Mensagem */}
            <p className="text-sm text-gray-600">
              Seu agendamento foi realizado com sucesso. Nos vemos em breve!
            </p>
          </div>
        </div>
      )}
    </>
  );
} 