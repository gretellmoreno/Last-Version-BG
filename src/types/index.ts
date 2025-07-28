export interface Cliente {
  id: string;
  nome: string;
  sobrenome?: string;
  telefone: string;
  email?: string;
  dataNascimento?: string;
  ano?: string;
}

export interface Profissional {
  id: string;
  nome: string;
  sobrenome?: string;
  funcao: string;
  telefone: string;
  telefoneAdicional?: string;
  email?: string;
  pais?: string;
  dataNascimento?: string;
  ano?: string;
  corCalendario?: string;
  online: boolean;
}

export interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  comissao: number;
}

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  custoAquisicao?: number;
  estoque: number;
}

export interface Taxa {
  id: string;
  nome: string;
  taxa: number;
  ativo: boolean;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  servicoIds: string[];
  servicoNomes: string[];
  profissionalId: string;
  profissionalNome: string;
  horarioInicio: string;
  horarioFim: string;
  data: string;
  preco: number;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
}

export type MenuItem = {
  id: string;
  name: string;
  icon: string;
};

export interface BookingData {
  cliente: Cliente | null;
  servicos: Servico[];
  profissional: Profissional;
  data: Date;
  horario: string;
  total: number;
}

// === NOVOS TIPOS PARA INTEGRAÇÃO COM SUPABASE ===

// Tipos baseados nas tabelas do Supabase
export interface Client {
  id: string;
  salon_id: string;
  name: string;
  phone: string;
  email: string;
  cpf: string;
  birth_date: string;
  created_at: string;
  updated_at: string;
}

export interface Professional {
  id: string;
  salon_id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  color: string;
  commission_rate: number;
  active: boolean;
  available_online: boolean;
  photo?: string; // URL ou base64 da foto
  url_foto?: string | null; // URL pública da foto de perfil
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  price: number;
  estimated_time: number;
  commission_rate: number;
  description?: string;
  active: boolean;
  available_online: boolean;
  price_display_mode: 'normal' | 'from' | 'hidden';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  salon_id: string;
  name: string;
  price: number;
  cost_price: number;
  profit_margin: number;
  stock: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  client_id: string;
  professional_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  fee: number;
  value: number;
}

export interface ProductSale {
  id: string;
  salon_id: string;
  client_id: string;
  product_id: string;
  quantity: number;
  payment_method_id: string;
  unit_price: number;
  gross_total: number;
  net_profit: number;
  professional_id?: string;
  created_at: string;
}

export interface CashClosure {
  id: string;
  salon_id: string;
  professional_id: string;
  professional_name: string;
  date: string;
  payment_method_id: string;
  payment_method_name: string;
  services: Array<{
    date: string;
    client_name: string | null;
    service_name: string;
    gross_value: number;
    fee: number;
    commission: number;
    net_value: number;
  }>;
}

export interface CashClosurePreview {
  preview: {
    services: Array<{
      appointment_id: string;
      date: string;
      client: string;
      service: string;
      grossValue: number;
      feeValue: number;
      commissionValue: number;
      netValue: number;
    }>;
    advancesList: Array<{
      id: string;
      value: number;
      created_at: string;
    }>;
    resumo: {
      fees: number;      // Total das taxas
      commissions: number; // Total das comissões
      net_total: number;   // Total líquido
    };
  };
}

export interface Advance {
  id: string;
  salon_id: string;
  professional_id: string;
  value: number;
  created_at: string;
  updated_at: string;
  discounted?: boolean;
}

// Interface para eventos do calendário
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  client: string;
  service: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration?: number;
  }>;
  status: string;
  professionalName?: string;
  appointmentData: any; // Mudado para aceitar o novo formato de appointment
}

// Novo tipo para o retorno detalhado do agendamento
export interface AppointmentDetails {
  success: boolean;
  appointment: {
    id: string;
    date: string;
    notes: string | null;
    client: {
      id: string;
      name: string;
    };
    status: string;
    end_time: string | null;
    services: Array<{
      id: string;
      name: string;
      price: number;
      duration: number;
      appointment_service_id?: string;
    }>;
    products?: Array<{
      id: string;
      product_name: string;
      name?: string;
      quantity: number;
      unit_price: number;
    }>;
    start_time: string;
    professional: {
      id: string;
      name: string;
      color: string;
    };
  };
}

// Tipo para resposta de cancelamento de agendamento
export interface CancelAppointmentResponse {
  success: boolean;
  appointment: {
    id: string;
    date: string;
    notes: string | null;
    client: {
      id: string;
      name: string;
    };
    status: string;
    end_time: string | null;
    services: Array<{
      id: string;
      name: string;
      price: number;
      duration: number;
      appointment_service_id?: string;
    }>;
    products?: Array<{
      id: string;
      product_name: string;
      name?: string;
      quantity: number;
      unit_price: number;
    }>;
    start_time: string;
    professional: {
      id: string;
      name: string;
      color: string;
    };
  };
}

// Tipos para respostas de criação otimizadas
export interface CreateClientResponse {
  success: boolean;
  client: Client;
}

export interface CreateProfessionalResponse {
  success: boolean;
  professional: Professional;
}

export interface CreateServiceResponse {
  success: boolean;
  service: Service;
}

export interface CreateProductResponse {
  success: boolean;
  product: Product;
}

export interface LinkAgendamentoConfig {
  id?: string;
  salon_id?: string;
  ativo: boolean;
  nome_exibicao?: string | null;
  foto_perfil_url?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  endereco?: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  logotipo_url?: string | null;
  mensagem_boas_vindas: string;
  mostrar_precos: boolean;
  mostrar_duracao_servicos: boolean;
  intervalo_tempo: number;
  tempo_minimo_antecedencia: number;
  periodo_maximo_agendamento: number;
  permitir_cancelamento_cliente: boolean;
  horario_funcionamento?: any;
  notificar_via_whatsapp: boolean;
  notificar_via_email: boolean;
  template_confirmacao: string;
  template_lembrete: string;
  configuracoes_extras?: any;
  created_at?: string;
  updated_at?: string;
  
  // Campos legados para compatibilidade (deprecated)
  corPrimaria?: string;
  corSecundaria?: string;
  logotipo?: string;
  mensagemBoasVindas?: string;
  mostrarPrecos?: boolean;
  mostrarDuracaoServicos?: boolean;
}

export interface Database {
  public: {
    Tables: {
      link_agendamento_config: {
        Row: {
          id: string;
          salon_id: string;
          cor_primaria: string;
          cor_secundaria: string;
          logotipo: string | null;
          mensagem_boas_vindas: string;
          mostrar_precos: boolean;
          mostrar_duracao_servicos: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          cor_primaria?: string;
          cor_secundaria?: string;
          logotipo?: string | null;
          mensagem_boas_vindas?: string;
          mostrar_precos?: boolean;
          mostrar_duracao_servicos?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          cor_primaria?: string;
          cor_secundaria?: string;
          logotipo?: string | null;
          mensagem_boas_vindas?: string;
          mostrar_precos?: boolean;
          mostrar_duracao_servicos?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}