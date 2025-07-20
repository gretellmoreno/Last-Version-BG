import { useReducer, useCallback } from 'react';

// Tipos para o estado do fluxo
interface ServiceProfessional {
  serviceId: string;
  professionalId: string;
}

interface ClientFormData {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  ano: string;
}

type BookingStep = 'service' | 'product' | 'confirmation' | 'datetime';

interface BookingFlowState {
  currentStep: BookingStep;
  showClientSelection: boolean;
  showClientForm: boolean;
  showProfessionalSelection: boolean;
  selectedServices: string[];
  selectedProducts: string[];
  selectedClient: any | null;
  serviceProfessionals: ServiceProfessional[];
  clientForm: ClientFormData;
  bookingDate: Date;
  bookingTime: string;
  isCreatingAppointment: boolean;
}

// Ações possíveis do reducer
type BookingFlowAction =
  | { type: 'SET_STEP'; payload: BookingStep }
  | { type: 'TOGGLE_CLIENT_SELECTION'; payload: boolean }
  | { type: 'TOGGLE_CLIENT_FORM'; payload: boolean }
  | { type: 'TOGGLE_PROFESSIONAL_SELECTION'; payload: boolean }
  | { type: 'TOGGLE_SERVICE'; payload: string }
  | { type: 'TOGGLE_PRODUCT'; payload: string }
  | { type: 'SELECT_CLIENT'; payload: any }
  | { type: 'UPDATE_CLIENT_FORM'; payload: Partial<ClientFormData> }
  | { type: 'SET_SERVICE_PROFESSIONAL'; payload: { serviceId: string; professionalId: string } }
  | { type: 'REMOVE_SERVICE_PROFESSIONAL'; payload: string }
  | { type: 'SET_BOOKING_DATE'; payload: Date }
  | { type: 'SET_BOOKING_TIME'; payload: string }
  | { type: 'SET_CREATING_APPOINTMENT'; payload: boolean }
  | { type: 'RESET_FLOW'; payload: { initialDate: Date; initialTime?: string } };

// Função reducer para gerenciar o estado
function bookingFlowReducer(state: BookingFlowState, action: BookingFlowAction): BookingFlowState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'TOGGLE_CLIENT_SELECTION':
      return { ...state, showClientSelection: action.payload };
    
    case 'TOGGLE_CLIENT_FORM':
      return { ...state, showClientForm: action.payload };
    
    case 'TOGGLE_PROFESSIONAL_SELECTION':
      return { ...state, showProfessionalSelection: action.payload };
    
    case 'TOGGLE_SERVICE':
      const serviceId = action.payload;
      const isRemoving = state.selectedServices.includes(serviceId);
      const newSelectedServices = isRemoving
        ? state.selectedServices.filter(id => id !== serviceId)
        : [...state.selectedServices, serviceId];
      
      // Se removeu um serviço, remove também sua seleção de profissional
      const newServiceProfessionals = isRemoving
        ? state.serviceProfessionals.filter(sp => sp.serviceId !== serviceId)
        : state.serviceProfessionals;
      
      // Se há serviços selecionados, vai para confirmação
      const newStep = newSelectedServices.length > 0 ? 'confirmation' : 'service';
      
      return {
        ...state,
        selectedServices: newSelectedServices,
        serviceProfessionals: newServiceProfessionals,
        currentStep: newStep
      };
    
    case 'TOGGLE_PRODUCT':
      const productId = action.payload;
      const newSelectedProducts = state.selectedProducts.includes(productId)
        ? state.selectedProducts.filter(id => id !== productId)
        : [...state.selectedProducts, productId];
      
      return { ...state, selectedProducts: newSelectedProducts };
    
    case 'SELECT_CLIENT':
      return { 
        ...state, 
        selectedClient: action.payload,
        showClientSelection: false,
        showClientForm: false 
      };
    
    case 'UPDATE_CLIENT_FORM':
      return {
        ...state,
        clientForm: { ...state.clientForm, ...action.payload }
      };
    
    case 'SET_SERVICE_PROFESSIONAL':
      const { serviceId: sId, professionalId } = action.payload;
      const existingIndex = state.serviceProfessionals.findIndex(sp => sp.serviceId === sId);
      
      let newSPs;
      if (existingIndex >= 0) {
        // Atualizar existente
        newSPs = [...state.serviceProfessionals];
        newSPs[existingIndex] = { serviceId: sId, professionalId };
      } else {
        // Adicionar novo
        newSPs = [...state.serviceProfessionals, { serviceId: sId, professionalId }];
      }
      
      return { ...state, serviceProfessionals: newSPs };
    
    case 'REMOVE_SERVICE_PROFESSIONAL':
      return {
        ...state,
        serviceProfessionals: state.serviceProfessionals.filter(sp => sp.serviceId !== action.payload)
      };
    
    case 'SET_BOOKING_DATE':
      return { ...state, bookingDate: action.payload };
    
    case 'SET_BOOKING_TIME':
      return { ...state, bookingTime: action.payload };
    
    case 'SET_CREATING_APPOINTMENT':
      return { ...state, isCreatingAppointment: action.payload };
    
    case 'RESET_FLOW':
      return {
        currentStep: 'service',
        showClientSelection: false,
        showClientForm: false,
        showProfessionalSelection: false,
        selectedServices: [],
        selectedProducts: [],
        selectedClient: null,
        serviceProfessionals: [],
        clientForm: {
          nome: '',
          sobrenome: '',
          email: '',
          telefone: '',
          dataNascimento: '',
          ano: ''
        },
        bookingDate: action.payload.initialDate,
        bookingTime: action.payload.initialTime || '',
        isCreatingAppointment: false
      };
    
    default:
      return state;
  }
}

// Hook customizado para gerenciar o fluxo de booking
export const useBookingFlow = (initialDate: Date, initialTime?: string) => {
  const [state, dispatch] = useReducer(bookingFlowReducer, {
    currentStep: 'service',
    showClientSelection: false,
    showClientForm: false,
    showProfessionalSelection: false,
    selectedServices: [],
    selectedProducts: [],
    selectedClient: null,
    serviceProfessionals: [],
    clientForm: {
      nome: '',
      sobrenome: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      ano: ''
    },
    bookingDate: initialDate,
    bookingTime: initialTime || '',
    isCreatingAppointment: false
  });

  // Actions com useCallback para performance
  const actions = {
    setStep: useCallback((step: BookingStep) => 
      dispatch({ type: 'SET_STEP', payload: step }), []),
    
    toggleClientSelection: useCallback((show: boolean) => 
      dispatch({ type: 'TOGGLE_CLIENT_SELECTION', payload: show }), []),
    
    toggleClientForm: useCallback((show: boolean) => 
      dispatch({ type: 'TOGGLE_CLIENT_FORM', payload: show }), []),
    
    toggleProfessionalSelection: useCallback((show: boolean) => 
      dispatch({ type: 'TOGGLE_PROFESSIONAL_SELECTION', payload: show }), []),
    
    toggleService: useCallback((serviceId: string) => 
      dispatch({ type: 'TOGGLE_SERVICE', payload: serviceId }), []),
    
    toggleProduct: useCallback((productId: string) => 
      dispatch({ type:'TOGGLE_PRODUCT', payload: productId }), []),
    
    selectClient: useCallback((client: any) => 
      dispatch({ type: 'SELECT_CLIENT', payload: client }), []),
    
    updateClientForm: useCallback((updates: Partial<ClientFormData>) => 
      dispatch({ type: 'UPDATE_CLIENT_FORM', payload: updates }), []),
    
    setServiceProfessional: useCallback((serviceId: string, professionalId: string) => 
      dispatch({ type: 'SET_SERVICE_PROFESSIONAL', payload: { serviceId, professionalId } }), []),
    
    removeServiceProfessional: useCallback((serviceId: string) => 
      dispatch({ type: 'REMOVE_SERVICE_PROFESSIONAL', payload: serviceId }), []),
    
    setBookingDate: useCallback((date: Date) => 
      dispatch({ type: 'SET_BOOKING_DATE', payload: date }), []),
    
    setBookingTime: useCallback((time: string) => 
      dispatch({ type: 'SET_BOOKING_TIME', payload: time }), []),
    
    setCreatingAppointment: useCallback((creating: boolean) => 
      dispatch({ type: 'SET_CREATING_APPOINTMENT', payload: creating }), []),
    
    resetFlow: useCallback((initialDate: Date, initialTime?: string) => 
      dispatch({ type: 'RESET_FLOW', payload: { initialDate, initialTime } }), [])
  };

  return {
    state,
    actions
  };
}; 