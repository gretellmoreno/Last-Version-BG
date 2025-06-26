import React, { useState, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import ServiceSelection from './booking/ServiceSelection';
import ServiceConfirmation from './booking/ServiceConfirmation';
import DateTimeSelection from './booking/DateTimeSelection';
import ClientSelection from './booking/ClientSelection';
import ClientForm from './booking/ClientForm';
import { useBooking } from '../contexts/BookingContext';
import { useService } from '../contexts/ServiceContext';
import { useProfessional } from '../contexts/ProfessionalContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedTime?: string;
  selectedProfessional?: string;
}

interface ClientFormData {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  ano: string;
}

interface ServiceProfessional {
  serviceId: string;
  professionalId: string;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  selectedTime, 
  selectedProfessional 
}: BookingModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'service' | 'confirmation' | 'datetime'>('service');
  const [showClientSelection, setShowClientSelection] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [serviceProfessionals, setServiceProfessionals] = useState<ServiceProfessional[]>([]);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  // Hooks dos contextos
  const { addAgendamento, loading: bookingLoading, error: bookingError } = useBooking();
  const { servicos } = useService();
  const { professionals } = useProfessional();
  
  // Estados para seleção de data e horário
  const [bookingDate, setBookingDate] = useState(selectedDate);
  const [bookingTime, setBookingTime] = useState<string>('');
  
  // Estado do formulário de cliente
  const [clientForm, setClientForm] = useState<ClientFormData>({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    ano: ''
  });

  // Memoizar se tem data/horário pré-selecionados
  const hasPreselectedDateTime = useMemo(() => 
    Boolean(selectedTime && selectedProfessional), 
    [selectedTime, selectedProfessional]
  );

  // Effect para pré-selecionar profissional quando modal é aberto via agenda
  React.useEffect(() => {
    if (selectedProfessional && selectedServices.length > 0) {
      const prof = professionals?.find(p => p.name.replace('[Exemplo] ', '') === selectedProfessional);
      if (prof) {
        // Pré-selecionar o profissional para todos os serviços selecionados
        const newServiceProfessionals = selectedServices.map(serviceId => ({
          serviceId,
          professionalId: prof.id
        }));
        setServiceProfessionals(newServiceProfessionals);
      }
    }
  }, [selectedProfessional, selectedServices, professionals]);

  // Effect para resetar quando modal abrir
  React.useEffect(() => {
    if (isOpen) {
      setBookingTime(selectedTime || '');
    }
  }, [isOpen, selectedTime]);

  // Callbacks otimizados para evitar re-renders
  const toggleService = useCallback((serviceId: string) => {
    setSelectedServices(prev => {
      const newSelectedServices = prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      
      // Se removeu um serviço, remove também sua seleção de profissional
      if (prev.includes(serviceId)) {
        setServiceProfessionals(current => current.filter(sp => sp.serviceId !== serviceId));
      }
      
      // Se há serviços selecionados, vai direto para confirmação
      if (newSelectedServices.length > 0) {
        setCurrentStep('confirmation');
      }
      
      return newSelectedServices;
    });
  }, []);

  // Função para criar o agendamento
  const createAgendamento = useCallback(async () => {
    if (!selectedClient || selectedServices.length === 0 || serviceProfessionals.length === 0) {
      return;
    }

    setIsCreatingAppointment(true);

    try {
      // Calcular duração total dos serviços
      const selectedServiceObjects = servicos.filter(s => selectedServices.includes(s.id));
      const totalDuration = selectedServiceObjects.reduce((total, service) => total + service.duracao, 0);
      
      // Calcular preço total
      const totalPrice = selectedServiceObjects.reduce((total, service) => total + service.preco, 0);
      
      // Usar data e horário selecionados (ou pré-selecionados)
      const finalDate = bookingDate;
      const finalTime = bookingTime || selectedTime;
      
      if (!finalTime) {
        console.error('Horário não selecionado');
        return;
      }

      // Calcular horário de fim
      const [hours, minutes] = finalTime.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + totalDuration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

      // Pegar profissional (usar o primeiro selecionado ou encontrar por nome)
      let professionalId = serviceProfessionals[0]?.professionalId;
      let professionalName = '';
      
      if (selectedProfessional) {
        const prof = professionals?.find(p => p.name.replace('[Exemplo] ', '') === selectedProfessional);
        if (prof) {
          professionalId = prof.id;
          professionalName = prof.name;
        }
      } else if (professionalId) {
        const prof = professionals?.find(p => p.id === professionalId);
        if (prof) {
          professionalName = prof.name;
        }
      }

      if (!professionalId) {
        console.error('Profissional não selecionado');
        return;
      }

      const newAgendamento = {
        id: Date.now().toString(),
        clienteId: selectedClient.id,
        clienteNome: selectedClient.nome === 'Sem reserva' ? 'Sem reserva' : selectedClient.nome,
        servicoIds: selectedServices,
        servicoNomes: selectedServiceObjects.map(s => s.nome),
        profissionalId: professionalId,
        profissionalNome: professionalName,
        horarioInicio: finalTime,
        horarioFim: endTime,
        data: finalDate.toISOString().split('T')[0],
        preco: totalPrice,
        status: 'agendado' as const,
        observacoes: ''
      };

      const success = await addAgendamento(newAgendamento);
      
      if (success) {
        // Reset do modal
        setSelectedServices([]);
        setCurrentStep('service');
        setShowClientSelection(false);
        setShowClientForm(false);
        setSelectedClient(null);
        setServiceProfessionals([]);
        setBookingTime('');
        
        onClose();
      } else {
        console.error('Erro ao criar agendamento:', bookingError);
      }
    } catch (error) {
      console.error('Erro inesperado ao criar agendamento:', error);
    } finally {
      setIsCreatingAppointment(false);
    }
  }, [
    selectedClient, 
    selectedServices, 
    serviceProfessionals, 
    servicos, 
    bookingDate, 
    bookingTime, 
    selectedTime, 
    selectedProfessional, 
    professionals, 
    addAgendamento,
    bookingError,
    onClose
  ]);

  const handleContinueFromConfirmation = useCallback(async () => {
    if (hasPreselectedDateTime) {
      await createAgendamento();
    } else {
      setCurrentStep('datetime');
    }
  }, [hasPreselectedDateTime, createAgendamento]);

  const handleFinishBooking = useCallback(async () => {
    await createAgendamento();
  }, [createAgendamento]);

  const handleBackToServices = useCallback(() => {
    setCurrentStep('service');
  }, []);

  const handleUpdateServiceProfessionals = useCallback((professionals: ServiceProfessional[]) => {
    setServiceProfessionals(professionals);
  }, []);

  const handleSelectClient = useCallback((client: any) => {
    setSelectedClient(client);
    setShowClientSelection(false);
  }, []);

  const handleUpdateClientForm = useCallback((field: string, value: string) => {
    setClientForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveClient = useCallback(() => {
    if (clientForm.nome.trim() === '' || clientForm.telefone.trim() === '') return;
    
    const newClient = {
      id: Date.now().toString(),
      nome: clientForm.nome,
      sobrenome: clientForm.sobrenome,
      email: clientForm.email,
      telefone: clientForm.telefone,
      dataNascimento: clientForm.dataNascimento,
      ano: clientForm.ano
    };
    
    setSelectedClient(newClient);
    setShowClientForm(false);
    setShowClientSelection(false);
  }, [clientForm]);

  const handleShowClientSelection = useCallback(() => {
    setShowClientSelection(true);
  }, []);

  const handleShowClientForm = useCallback(() => {
    setShowClientForm(true);
  }, []);

  const handleCancelClientForm = useCallback(() => {
    setShowClientForm(false);
  }, []);

  // Função para resetar o modal
  const resetModal = useCallback(() => {
    setSelectedServices([]);
    setCurrentStep('service');
    setShowClientSelection(false);
    setShowClientForm(false);
    setSelectedClient(null);
    setServiceProfessionals([]);
    setBookingTime('');
    setClientForm({
      nome: '',
      sobrenome: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      ano: ''
    });
  }, []);

  // Função de fechar que inclui reset
  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  // Early return se modal não estiver aberto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      {/* Painel lateral direito */}
      <div className="absolute right-0 top-0 h-full w-2/3 max-w-4xl bg-white shadow-xl flex flex-col">
        {/* Header do modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Novo Agendamento</h1>
          
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Card de informações pré-selecionadas */}
        {selectedTime && selectedProfessional && (
          <div className="mx-4 mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold text-base">
                    {selectedProfessional.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{selectedProfessional}</p>
                  <p className="text-xs text-gray-500">Profissional</p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">{selectedDate.toLocaleDateString('pt-BR')}</p>
                <p className="text-xs text-gray-500">Data</p>
              </div>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">{selectedTime}</p>
                <p className="text-xs text-gray-500">Horário</p>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo do modal */}
        <div className={`flex-1 overflow-hidden ${selectedTime && selectedProfessional ? 'mt-0' : ''}`}>
          {showClientForm ? (
            <ClientForm
              clientForm={clientForm}
              onUpdateForm={handleUpdateClientForm}
              onSave={handleSaveClient}
              onCancel={handleCancelClientForm}
            />
          ) : showClientSelection ? (
            <ClientSelection
              selectedServices={selectedServices}
              onSelectClient={handleSelectClient}
              onShowForm={handleShowClientForm}
              onToggleService={toggleService}
            />
          ) : currentStep === 'datetime' ? (
            <DateTimeSelection
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              serviceProfessionals={serviceProfessionals}
              bookingDate={bookingDate}
              bookingTime={bookingTime}
              onDateChange={setBookingDate}
              onTimeChange={setBookingTime}
              onShowClientSelection={handleShowClientSelection}
              onFinish={handleFinishBooking}
              isLoading={isCreatingAppointment || bookingLoading}
            />
          ) : currentStep === 'confirmation' ? (
            <ServiceConfirmation
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              serviceProfessionals={serviceProfessionals}
              onShowClientSelection={handleShowClientSelection}
              onBackToServices={handleBackToServices}
              onUpdateServiceProfessionals={handleUpdateServiceProfessionals}
              onContinue={handleContinueFromConfirmation}
              hasPreselectedDateTime={hasPreselectedDateTime}
              isLoading={isCreatingAppointment || bookingLoading}
            />
          ) : (
            <ServiceSelection
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              onToggleService={toggleService}
              onShowClientSelection={handleShowClientSelection}
            />
          )}
        </div>
      </div>
    </div>
  );
}