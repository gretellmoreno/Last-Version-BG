import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Clock from 'lucide-react/dist/esm/icons/clock';
import User from 'lucide-react/dist/esm/icons/user';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Scissors from 'lucide-react/dist/esm/icons/scissors';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Search from 'lucide-react/dist/esm/icons/search';
import { supabaseService } from '../lib/supabaseService';
import { salonService } from '../lib/salonService';
import { useSalonSlug, useIsMainDomain } from '../hooks/useSubdomain';

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  status: string;
  client_name: string;
  professional_name: string;
  professional_photo_url?: string;
  services: { name: string; price: number }[];
  total_value: number;
}

interface AppointmentsData {
  atuais: Appointment[];
  passados: Appointment[];
  can_client_cancel?: boolean;
}

export default function MeusAgendamentos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const salonSlug = useSalonSlug();
  const isMainDomain = useIsMainDomain();
  
  const [activeTab, setActiveTab] = useState<'atuais' | 'passados'>('atuais');
  const [appointmentsData, setAppointmentsData] = useState<AppointmentsData>({ atuais: [], passados: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salonData, setSalonData] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [canClientCancel, setCanClientCancel] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  // Estados para entrada do telefone
  const [showPhoneInput, setShowPhoneInput] = useState(false); // Começa false, será definido após verificar localStorage
  const [clientPhone, setClientPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    const loadSalonData = async () => {
      setLoading(true);
      setError(null);

      try {
        let currentSalonId: string | null = null;
        const salonIdFromQuery = searchParams.get('salonId');

        // Buscar salão por query param ou subdomínio
        if (salonIdFromQuery) {
          currentSalonId = salonIdFromQuery;
        } else if (salonSlug && !isMainDomain) {
          const salonResponse = await salonService.getSalonBySlug(salonSlug);
          if (salonResponse.success && salonResponse.salon) {
            currentSalonId = salonResponse.salon.id;
            setSalonData(salonResponse.salon);
          } else {
            setError('Salão não encontrado');
            setLoading(false);
            return;
          }
        } else {
          setError('ID do salão não fornecido');
          setLoading(false);
          return;
        }

        setSalonId(currentSalonId);

        // Carregar configurações
        const { data: configData, error: configError } = await supabaseService.linkAgendamento.getConfig(currentSalonId);
        if (configData) {
          setConfig(configData);
        }

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar informações');
      } finally {
        setLoading(false);
      }
    };

    loadSalonData();
  }, [searchParams, salonSlug, isMainDomain]);

  // useEffect para verificar localStorage e decidir o fluxo
  useEffect(() => {
    if (!salonId) return; // Aguarda o salonId estar disponível

    const checkSavedPhoneAndLoadAppointments = async () => {
      try {
        console.log('🔍 Verificando dados salvos no localStorage...');
        
        // Verificar se temos dados do cliente salvos
        const savedDataString = localStorage.getItem('belaGestao_clientData');
        let savedPhone = '';
        
        if (savedDataString) {
          try {
            const savedData = JSON.parse(savedDataString);
            savedPhone = savedData.phone || '';
            console.log('📱 Telefone encontrado no localStorage:', savedPhone);
          } catch (e) {
            console.warn('⚠️ Erro ao parsear dados do localStorage:', e);
          }
        }

        if (savedPhone) {
          // Temos telefone salvo - ir direto para buscar agendamentos
          console.log('✅ Telefone encontrado, buscando agendamentos automaticamente...');
          setClientPhone(savedPhone);
          setShowPhoneInput(false);
          setIsAutoLoading(true);
          
          // Buscar agendamentos automaticamente
          await handleSearchAppointments(savedPhone);
          setIsAutoLoading(false);
        } else {
          // Não temos telefone salvo - mostrar tela de entrada
          console.log('❌ Nenhum telefone encontrado, mostrando tela de entrada...');
          setShowPhoneInput(true);
        }
      } catch (err) {
        console.error('💥 Erro ao verificar dados salvos:', err);
        setShowPhoneInput(true); // Fallback para tela de entrada
      }
    };

    checkSavedPhoneAndLoadAppointments();
  }, [salonId]); // Executa quando salonId estiver disponível

  const formatPhone = useCallback((value: string) => {
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
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatPhone(value);
    setClientPhone(formattedValue);
    setPhoneError(null);
  }, [formatPhone]);

  const handleSearchAppointments = useCallback(async (phoneToSearch?: string) => {
    const phoneToUse = phoneToSearch || clientPhone;
    
    if (!phoneToUse || !salonId) return;

    // Validar telefone (pelo menos 10 dígitos)
    const phoneNumbers = phoneToUse.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      setPhoneError('Digite um telefone válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Buscando agendamentos para:', { salonId, clientPhone: phoneToUse });
      
      const { data, error } = await supabaseService.linkAgendamento.getPublicAppointmentsByPhone({
        salonId,
        clientPhone: phoneNumbers // Enviar apenas números
      });

      if (error) {
        console.error('❌ Erro ao buscar agendamentos:', error);
        setError('Erro ao buscar agendamentos. Verifique o telefone e tente novamente.');
      } else {
        console.log('✅ Agendamentos encontrados:', data);
        console.log('📊 Estrutura dos dados:', {
          atuais: data?.atuais?.length || 0,
          passados: data?.passados?.length || 0
        });
        
        // Log detalhado dos agendamentos para debug
        if (data && data.atuais && data.atuais.length > 0) {
          console.log('📅 Agendamentos atuais:', data.atuais.map((a: any) => ({
            id: a.id,
            date: a.date,
            time: a.start_time,
            client: a.client_name
          })));
        }
        
        if (data && data.passados && data.passados.length > 0) {
          console.log('📅 Agendamentos passados:', data.passados.map((a: any) => ({
            id: a.id,
            date: a.date,
            time: a.start_time,
            client: a.client_name
          })));
        }
        
        setAppointmentsData(data || { atuais: [], passados: [] });
        setCanClientCancel(data?.can_client_cancel || false);
        setShowPhoneInput(false);
      }
    } catch (err) {
      console.error('💥 Erro inesperado ao buscar agendamentos:', err);
      setError('Erro inesperado ao buscar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [clientPhone, salonId]);

  const goBack = useCallback(() => {
    // Sempre voltar para a página de agendamento, independente do estado atual
    navigate('/agendamento', { replace: true });
  }, [navigate]);

  const formatDate = useCallback((date: string) => {
    // Garantir que a data seja interpretada corretamente
    // Adicionar 'T00:00:00' para forçar interpretação local
    const dateObj = new Date(date + 'T00:00:00');
    
    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      console.error('❌ Data inválida:', date);
      return 'Data inválida';
    }
    
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const formatTime = useCallback((time: string) => {
    return time.substring(0, 5); // HH:MM
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'agendado': return 'text-green-600 bg-green-100';
      case 'cancelado': return 'text-red-600 bg-red-100';
      case 'concluido': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'agendado': return 'Confirmado';
      case 'cancelado': return 'Cancelado';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  }, []);

  const handleCancelAppointment = useCallback(async (appointment: Appointment) => {
    // Abrir modal de confirmação
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  }, []);

  const confirmCancelAppointment = useCallback(async () => {
    if (!salonId || !appointmentToCancel) return;

    // Pegar telefone do localStorage
    const savedDataString = localStorage.getItem('belaGestao_clientData');
    const savedData = savedDataString ? JSON.parse(savedDataString) : null;
    const clientPhone = savedData?.phone || '';

    if (!clientPhone) {
      alert('Erro: Telefone do cliente não encontrado');
      return;
    }

    setCancellingAppointment(appointmentToCancel.id);

    try {
      console.log('❌ Cancelando agendamento:', appointmentToCancel.id);
      
      const { data, error } = await supabaseService.linkAgendamento.cancelPublicAppointment({
        appointmentId: appointmentToCancel.id,
        salonId,
        clientPhone
      });

      if (error) {
        console.error('❌ Erro ao cancelar agendamento:', error);
        alert('Erro ao cancelar agendamento. Tente novamente.');
      } else {
        console.log('✅ Agendamento cancelado com sucesso');
        
        // Fechar modal e recarregar os agendamentos
        setShowCancelModal(false);
        setAppointmentToCancel(null);
        await handleSearchAppointments();
      }
    } catch (err) {
      console.error('💥 Erro inesperado ao cancelar agendamento:', err);
      alert('Erro inesperado ao cancelar agendamento');
    } finally {
      setCancellingAppointment(null);
    }
  }, [salonId, appointmentToCancel, handleSearchAppointments]);

  // Cores do tema com memoização
  const themeColors = useMemo(() => ({
    primaryColor: config?.cor_primaria || '#6366f1',
    secondaryColor: config?.cor_secundaria || '#4f46e5'
  }), [config?.cor_primaria, config?.cor_secundaria]);

  // Filtrar agendamentos por tipo com memoização e ordenação
  const currentAppointments = useMemo(() => {
    const appointments = activeTab === 'atuais' ? appointmentsData.atuais : appointmentsData.passados;
    
    // Ordenar por data e hora
    return appointments.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.start_time);
      const dateB = new Date(b.date + 'T' + b.start_time);
      
      // Para agendamentos atuais: ordem cronológica (mais próximos primeiro)
      // Para agendamentos passados: ordem cronológica reversa (mais recentes primeiro)
      if (activeTab === 'atuais') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  }, [appointmentsData, activeTab]);

  if (loading || isAutoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.primaryColor }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">
            {isAutoLoading ? 'Carregando seus agendamentos...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !showPhoneInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar agendamentos
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: `linear-gradient(135deg, ${themeColors.primaryColor} 0%, ${themeColors.secondaryColor} 100%)` 
    }}>
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goBack}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <h1 className="text-xl font-bold text-white text-center flex-1 mr-10">
            Meus Agendamentos
          </h1>
        </div>

        {/* Tela de entrada do telefone */}
        {showPhoneInput ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                             <div className="text-center mb-6">
                 <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                 <h2 className="text-xl font-semibold text-gray-900 mb-2">
                   Digite seu telefone
                 </h2>
                 <p className="text-gray-600 text-sm">
                   Para visualizar seus agendamentos, informe o número de telefone usado no cadastro
                 </p>
               </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de telefone
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      phoneError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    maxLength={15}
                  />
                  {phoneError && (
                    <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                  )}
                </div>

                <button
                  onClick={() => handleSearchAppointments()}
                  disabled={!clientPhone || loading}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Buscando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Search className="w-5 h-5 mr-2" />
                      Buscar Agendamentos
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1 max-w-sm mx-auto mb-6">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('atuais')}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'atuais'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      activeTab === 'atuais' ? 'bg-purple-600' : 'bg-white/50'
                    }`} />
                    <span>Atuais</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('passados')}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'passados'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      activeTab === 'passados' ? 'bg-gray-600' : 'bg-white/50'
                    }`} />
                    <span>Passados</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-6">
              {currentAppointments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-12 h-12 text-white/60" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Nenhum agendamento encontrado
                  </h3>
                  <p className="text-white/70 text-sm">
                    {activeTab === 'atuais' 
                      ? 'Você não possui agendamentos futuros no momento.'
                      : 'Você não possui agendamentos passados.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                                    {currentAppointments.map((appointment, index) => {
                    // Log para debug
                    console.log(`📅 Agendamento ${index + 1}:`, {
                      id: appointment.id,
                      date: appointment.date,
                      formattedDate: formatDate(appointment.date),
                      time: appointment.start_time,
                      client: appointment.client_name
                    });
                    
                    return (
                      <div
                        key={appointment.id}
                        className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20"
                      >
                        {/* Profissional e Data/Hora */}
                        <div className="flex items-center justify-between mb-3">
                          {/* Profissional */}
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10  bg-purple-100 flex items-center justify-center overflow-hidden">
                              {appointment.professional_photo_url ? (
                                <img 
                                  src={appointment.professional_photo_url} 
                                  alt={appointment.professional_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-3 h-3 text-purple-600" />
                              )}
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                              {appointment.professional_name}
                            </span>
                          </div>

                          {/* Data e Hora */}
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDate(appointment.date)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTime(appointment.start_time)}
                            </p>
                          </div>
                        </div>

                        {/* Serviços e Botão Cancelar */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 flex-1">
                            {appointment.services.map((service, index) => (
                              <div key={index} className="text-sm">
                                <span className="text-gray-700">{service.name}</span>
                              </div>
                            ))}
                          </div>

                          {/* Botão de Cancelar (apenas para agendamentos atuais) */}
                          {activeTab === 'atuais' && canClientCancel && (
                            <button
                              onClick={() => handleCancelAppointment(appointment)}
                              disabled={cancellingAppointment === appointment.id}
                              className="ml-3 py-1 px-3 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {cancellingAppointment === appointment.id ? (
                                <span className="flex items-center">
                                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                                  ...
                                </span>
                              ) : (
                                'Cancelar'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal de Confirmação de Cancelamento */}
        {showCancelModal && appointmentToCancel && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cancelar Agendamento
                </h3>
                <p className="text-gray-600 text-sm">
                  Tem certeza que deseja cancelar este agendamento?
                </p>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Data:</strong> {formatDate(appointmentToCancel.date)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Horário:</strong> {formatTime(appointmentToCancel.start_time)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Profissional:</strong> {appointmentToCancel.professional_name}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setAppointmentToCancel(null);
                  }}
                  disabled={cancellingAppointment === appointmentToCancel.id}
                  className="flex-1 py-3 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Não, manter
                </button>
                <button
                  onClick={confirmCancelAppointment}
                  disabled={cancellingAppointment === appointmentToCancel.id}
                  className="flex-1 py-3 px-4 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancellingAppointment === appointmentToCancel.id ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Cancelando...
                    </span>
                  ) : (
                    'Sim, cancelar'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 