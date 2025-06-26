import React, { useState, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import ServiceSelection from './booking/ServiceSelection';
import ServiceConfirmation from './booking/ServiceConfirmation';
import DateTimeSelection from './booking/DateTimeSelection';
import ClientSelection from './booking/ClientSelection';
import ClientForm from './booking/ClientForm';

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

  const handleContinueFromConfirmation = useCallback(() => {
    if (hasPreselectedDateTime) {
      console.log('Agendamento finalizado!');
      onClose();
    } else {
      setCurrentStep('datetime');
    }
  }, [hasPreselectedDateTime, onClose]);

  const handleFinishBooking = useCallback(() => {
    console.log('Agendamento finalizado!');
    onClose();
  }, [onClose]);

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

  const handleUpdateClientForm = useCallback((field: keyof ClientFormData, value: string) => {
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

  // Early return se modal não estiver aberto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal com tamanhos diferentes baseado no conteúdo */}
      <div className={`
        absolute bg-white rounded-lg shadow-xl flex flex-col mx-auto
        ${showClientSelection && !showClientForm 
          ? 'inset-x-4 inset-y-8 max-w-4xl' 
          : currentStep === 'confirmation'
          ? 'inset-x-8 inset-y-12 max-w-3xl'
          : currentStep === 'datetime'
          ? 'inset-x-12 inset-y-16 max-w-2xl'  // Modal mais compacto para datetime
          : 'inset-4 max-w-6xl' 
        }
      `}>
        {/* Header do modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">Novo Agendamento</h1>
            {selectedTime && selectedProfessional && (
              <div className="text-sm text-gray-500">
                {selectedDate.toLocaleDateString('pt-BR')} às {selectedTime} - {selectedProfessional}
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo do modal */}
        <div className="flex-1 overflow-hidden">
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