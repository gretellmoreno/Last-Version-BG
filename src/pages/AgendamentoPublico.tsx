import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabaseService } from '../lib/supabaseService';
import { salonService } from '../lib/salonService';
import { LinkAgendamentoConfig } from '../types';
import { Loader2, Calendar, User, Scissors, Phone, Mail, ChevronLeft, ChevronRight, Check, ArrowLeft, Search, ChevronDown } from 'lucide-react';
import { useSalonSlug, useIsMainDomain } from '../hooks/useSubdomain';
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt } from 'react-icons/fa';
import { AiFillInstagram } from 'react-icons/ai';

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
  const salonSlug = useSalonSlug();
  const isMainDomain = useIsMainDomain();
  
  // Para compatibilidade: aceita salonId por query param (método antigo)
  const salonIdFromQuery = searchParams.get('salonId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<LinkAgendamentoConfig | null>(null);
  const [salonData, setSalonData] = useState<any>(null);
  
  // Estados do wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>('services');
  const [bookingData, setBookingData] = useState<PublicBookingData>({ services: [], professionals: [] });
  
  // Estados das seleções
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  
  // Estados do cliente
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Estados de processamento
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');

  // Estado para busca de serviços
  const [searchTerm, setSearchTerm] = useState('');

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

  // Função para calcular data mínima (considerando antecedência)
  const getMinDate = () => {
    const now = new Date();
    const minAdvanceMinutes = config?.tempo_minimo_antecedencia || 60;
    const minDate = new Date(now.getTime() + minAdvanceMinutes * 60000);
    return minDate.toISOString().split('T')[0];
  };

  // Função para calcular data máxima (considerando período máximo)
  const getMaxDate = () => {
    const now = new Date();
    const maxDays = config?.periodo_maximo_agendamento || 7;
    const maxDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);
    return maxDate.toISOString().split('T')[0];
  };

  // Buscar disponibilidade quando data for selecionada
  useEffect(() => {
    if (selectedDate && selectedProfessional && selectedServices.length > 0) {
      loadAvailability();
    }
  }, [selectedDate, selectedProfessional, selectedServices]);

  const loadAvailability = async () => {
    if (!selectedDate || !selectedProfessional || !salonData?.id) return;

    setLoadingTimes(true);
    
    try {
      // Calcular duração total
      const totalDuration = selectedServices.reduce((total, serviceId) => {
        const service = bookingData.services.find(s => s.id === serviceId);
        return total + (service?.estimated_time || 0);
      }, 0);

      const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

      const { data, error } = await supabaseService.professionals.getAvailability(
        selectedProfessional,
        dateStr,
        totalDuration
      );

      if (error) {
        console.warn('⚠️ Erro ao buscar disponibilidade:', error);
        setAvailableTimes([]);
      } else if (Array.isArray(data)) {
        setAvailableTimes(data);
      } else {
        setAvailableTimes([]);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar disponibilidade:', err);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  // Função para calcular totais
  const calculateTotals = () => {
    const services = selectedServices.map(id => bookingData.services.find(s => s.id === id)).filter(Boolean) as Service[];
    const totalPrice = services.reduce((total, service) => total + service.price, 0);
    const totalDuration = services.reduce((total, service) => total + service.estimated_time, 0);
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
        setCompletionMessage(data.message || 'Agendamento confirmado com sucesso! Nos vemos em breve!');
        setIsCompleted(true);
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
      case 'services':
        return selectedServices.length > 0;
      case 'professional':
        return selectedProfessional !== '';
      case 'datetime':
        return selectedDate && selectedTime;
      case 'client':
        return clientName.trim() !== '' && clientPhone.trim() !== '';
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canGoNext()) return;
    
    switch (currentStep) {
      case 'services':
        setCurrentStep('professional');
        break;
      case 'professional':
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
      case 'professional':
        setCurrentStep('services');
        break;
      case 'datetime':
        setCurrentStep('professional');
        break;
      case 'client':
        setCurrentStep('datetime');
        break;
      case 'confirmation':
        setCurrentStep('client');
        break;
    }
  };

  // Função para formatizar telefone
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
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

  // Determina a cor do título baseada na cor primária
  const getTitleColor = () => {
    if (!primaryColor) return '#000000'; // Fallback preto
    return isLightColor(primaryColor) ? '#000000' : '#FFFFFF';
  };

  // Componente auxiliar para exibição de preços
  const PriceDisplay = ({ service, className = "" }: { service: Service; className?: string }) => {
    // Primeiro, formata o preço para o padrão brasileiro.
    const formattedPrice = `R$ ${service.price.toFixed(2).replace('.', ',')}`;

    // Determina a cor do texto baseada na cor primária
    const getTextColor = () => {
      if (!primaryColor) return '#374151'; // Fallback cinza escuro
      return isLightColor(primaryColor) ? '#374151' : '#F9FAFB';
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

  // Filtrar e agrupar serviços
  const filteredServices = bookingData.services.filter(service => 
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

  // MOBILE-ONLY: Layout especial para a primeira etapa (serviços)
  if ((currentStep as string) === 'services') {
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
          {/* Foto do salão */}
          <div className="flex items-center justify-center mb-4">
            {config?.foto_perfil_url ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg bg-white">
                <img 
                  src={config.foto_perfil_url} 
                  alt="Foto do salão" 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div 
                className="w-20 h-20 rounded-full border-3 border-white shadow-lg flex items-center justify-center bg-white/90"
                style={{ borderColor: 'var(--cor-primaria)' }}
              >
                <User size={40} style={{ color: getTitleColor() }} />
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

        {/* Barra de Pesquisa com layout mais compacto */}
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
            <div className="p-4">
            
            {filteredServices.length === 0 ? (
              <div className="text-center py-8">
                <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Nenhum serviço encontrado.' : 'Nenhum serviço disponível no momento.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                                  {Object.entries(groupedServices).map(([category, services]) => (
                    <div key={category}>
                      {/* Lista de serviços da categoria */}
                    <div className="space-y-0">
                      {services.map((service, index) => {
                        const isSelected = selectedServices.includes(service.id);
                        const isLast = index === services.length - 1;
                        
                        return (
                          <button
                            key={service.id}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 mb-2 ${
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
                                isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                              }`}
                              style={isSelected ? {
                                backgroundColor: 'var(--cor-primaria)',
                                borderColor: 'var(--cor-primaria)'
                              } : {}}>
                                {isSelected && (
                                  <Check className="w-3 h-3" style={{ color: isLightColor(primaryColor) ? '#000000' : '#FFFFFF' }} />
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

                  {/* Botão avançar */}
          <button
            onClick={goNext}
            disabled={!canGoNext()}
            className={`mt-6 w-full max-w-md py-4 rounded-2xl text-lg font-bold shadow-lg transition-all duration-300 ${
              canGoNext()
                ? 'hover:shadow-xl transform hover:scale-105'
                : 'cursor-not-allowed opacity-50'
            }`}
            style={{
              backgroundColor: canGoNext() ? 'var(--cor-primaria)' : '#E5E7EB',
              color: canGoNext() ? (isLightColor(primaryColor) ? '#000000' : '#FFFFFF') : '#9CA3AF',
              boxShadow: canGoNext() ? `0 10px 25px ${primaryColor}40` : 'none'
            }}
          >
            Avançar
          </button>
      </div>
    );
  }

  return (
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
        <div className="bg-transparent backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/30">
          
          {/* Etapa 1: Seleção de Serviços */}
          {(currentStep as string) === 'services' && (
            <div>
              <h2 className="text-xl font-semibold mb-6" style={{ color: getTitleColor() }}>
                Selecione os serviços desejados
              </h2>
              
              {bookingData.services.length === 0 ? (
                <div className="text-center py-8">
                  <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookingData.services.map((service) => {
                    const isSelected = selectedServices.includes(service.id);
                    
                    return (
                      <button
                        key={service.id}
                        className={`w-full text-left border-2 rounded-lg p-3 transition-all duration-200 ${
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
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium mb-1" style={{ color: getTitleColor() }}>{service.name}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm" style={{ color: getTitleColor() }}>
                                {service.estimated_time} min
                              </span>
                              {config.mostrar_precos && (
                                <span className="text-sm" style={{ color: getTitleColor() }}>
                                  {service.price_display_mode === 'from' ? 'A partir de ' : ''}
                                  {service.price_display_mode !== 'hidden' ? `R$ ${service.price.toFixed(2).replace('.', ',')}` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                            }`}
                            style={isSelected ? {
                              backgroundColor: 'var(--cor-primaria)',
                              borderColor: 'var(--cor-primaria)'
                            } : {}}>
                              {isSelected && (
                                <Check className="w-3 h-3" style={{ color: isLightColor(primaryColor) ? '#000000' : '#FFFFFF' }} />
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
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
            <div>
              
              {bookingData.professionals.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum profissional disponível no momento.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookingData.professionals.map((professional) => (
                    <div
                      key={professional.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedProfessional === professional.id 
                          ? 'border-gray-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={selectedProfessional === professional.id ? {
                        borderColor: 'var(--cor-primaria)',
                        backgroundColor: `${primaryColor}10`
                      } : {}}
                      onClick={() => setSelectedProfessional(professional.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {(professional as any).url_foto ? (
                          <img
                            src={(professional as any).url_foto}
                            alt={professional.name}
                            className="w-10 h-10 rounded-full object-cover border-2"
                            style={{ borderColor: 'var(--cor-primaria)' }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: professional.color || '#6366f1' }}
                          >
                            {professional.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium" style={{ color: getTitleColor() }}>{professional.name}</h3>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedProfessional === professional.id 
                            ? 'border-gray-300' 
                            : 'border-gray-300'
                        }`}
                        style={selectedProfessional === professional.id ? {
                          backgroundColor: 'var(--cor-primaria)',
                          borderColor: 'var(--cor-primaria)'
                        } : {}}>
                          {selectedProfessional === professional.id && (
                            <Check className="w-3 h-3 text-white mx-auto mt-0.5" />
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
              {/* Header com mês/ano */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold" style={{ color: getTitleColor() }}>
                    {selectedDate ? selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronDown className="w-4 h-4" style={{ color: getTitleColor() }} />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeft className="w-4 h-4" style={{ color: getTitleColor() }} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronRight className="w-4 h-4" style={{ color: getTitleColor() }} />
                  </button>
                </div>
              </div>

              {/* Calendário */}
              <div className="mb-6">
                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium py-2" style={{ color: getTitleColor() }}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grid do calendário */}
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const currentDate = selectedDate || new Date();
                    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                    const startDate = new Date(firstDay);
                    startDate.setDate(startDate.getDate() - firstDay.getDay());
                    
                    const days = [];
                    for (let i = 0; i < 42; i++) {
                      const date = new Date(startDate);
                      date.setDate(startDate.getDate() + i);
                      
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                      const isSelected = selectedDate && 
                        selectedDate.getDate() === date.getDate() &&
                        selectedDate.getMonth() === date.getMonth() &&
                        selectedDate.getFullYear() === date.getFullYear();
                      const isDisabled = date < new Date();
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      days.push(
                        <button
                          key={i}
                          disabled={isDisabled}
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedDate(date);
                              setSelectedTime('');
                            }
                          }}
                          className={`aspect-square rounded-full border-2 transition-all focus:outline-none focus:ring-2 ${
                            isSelected 
                              ? 'text-white' 
                              : isDisabled 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : isToday
                                  ? 'border-gray-400 text-gray-700'
                                  : 'text-gray-700 hover:border-gray-300'
                          }`}
                          style={{
                            ...(isSelected ? {
                              backgroundColor: 'var(--cor-primaria)',
                              borderColor: 'var(--cor-primaria)'
                            } : {}),
                            '--tw-ring-color': 'var(--cor-primaria)',
                            opacity: isCurrentMonth ? 1 : 0.3
                          } as React.CSSProperties}
                        >
                          {date.getDate()}
                        </button>
                      );
                    }
                    return days;
                  })()}
                </div>
              </div>

              {/* Data selecionada */}
              {selectedDate && (
                <div className="mb-6">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <span className="text-sm font-medium" style={{ color: getTitleColor() }}>
                      Para: {selectedDate.toLocaleDateString('pt-BR', { 
                        weekday: 'short', 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Seletor de Horário */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: getTitleColor() }}>
                    Horários disponíveis
                  </label>
                  {loadingTimes ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--cor-primaria)' }} />
                      <span className="ml-2" style={{ color: getTitleColor() }}>Carregando horários...</span>
                    </div>
                  ) : availableTimes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 border rounded-lg text-center transition-colors ${
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
            <div>
              <h2 className="text-xl font-semibold mb-6" style={{ color: getTitleColor() }}>
                Seus dados para o agendamento
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: getTitleColor() }}>
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'var(--cor-primaria)' } as React.CSSProperties}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: getTitleColor() }}>
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'var(--cor-primaria)' } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Etapa 5: Confirmação */}
          {(currentStep as string) === 'confirmation' && (
            <div>
              <h2 className="text-xl font-semibold mb-6" style={{ color: getTitleColor() }}>
                Confirme seu agendamento
              </h2>
              
              <div className="space-y-4">
                {/* Resumo dos serviços */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center" style={{ color: getTitleColor() }}>
                    <Scissors className="w-5 h-5 mr-2" style={{ color: 'var(--cor-primaria)' }} />
                    Serviços
                  </h3>
                  {calculateTotals().services.map((service) => (
                    <div key={service.id} className="flex justify-between text-sm mb-2">
                      <span>{service.name} ({service.estimated_time} min)</span>
                      {config.mostrar_precos && (
                        <PriceDisplay service={service} className="text-right" />
                      )}
                    </div>
                  ))}
                                      <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                      <span>Total: {calculateTotals().totalDuration} min</span>
                      {config.mostrar_precos && (
                        <span>R$ {calculateTotals().totalPrice.toFixed(2).replace('.', ',')}</span>
                      )}
                    </div>
                </div>

                {/* Profissional */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center" style={{ color: getTitleColor() }}>
                    <User className="w-5 h-5 mr-2" style={{ color: 'var(--cor-primaria)' }} />
                    Profissional
                  </h3>
                  <p>{bookingData.professionals.find(p => p.id === selectedProfessional)?.name}</p>
                </div>

                {/* Data e Horário */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center" style={{ color: getTitleColor() }}>
                    <Calendar className="w-5 h-5 mr-2" style={{ color: 'var(--cor-primaria)' }} />
                    Data e Horário
                  </h3>
                  <p>
                    {selectedDate?.toLocaleDateString('pt-BR')} às {selectedTime}
                  </p>
                </div>

                {/* Dados do cliente */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center" style={{ color: getTitleColor() }}>
                    <Phone className="w-5 h-5 mr-2" style={{ color: 'var(--cor-primaria)' }} />
                    Seus dados
                  </h3>
                  <p>{clientName}</p>
                  <p>{clientPhone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={goBack}
              disabled={(currentStep as string) === 'services'}
              className={`flex items-center px-4 py-2 rounded-lg ${
                (currentStep as string) === 'services' 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>

            {(currentStep as string) === 'confirmation' ? (
              <button
                onClick={createAppointment}
                disabled={isCreating}
                className="px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                style={{
                  backgroundColor: 'var(--cor-primaria)',
                  color: isLightColor(primaryColor) ? '#000000' : '#FFFFFF'
                }}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  'Confirmar Agendamento'
                )}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!canGoNext()}
                className={`flex items-center px-6 py-2 rounded-lg ${
                  canGoNext() 
                    ? 'hover:opacity-90' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                style={canGoNext() ? { 
                  backgroundColor: 'var(--cor-primaria)',
                  color: isLightColor(primaryColor) ? '#000000' : '#FFFFFF'
                } : {}}
              >
                Avançar
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 