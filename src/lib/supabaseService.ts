import { supabase, RPCResponse, RPCSuccessResponse } from './supabase'
import { 
  Client, 
  Professional, 
  Service, 
  Product, 
  Appointment,
  ProductSale,
  PaymentMethod,
  CashClosure,
  Advance
} from '../types'

// === CLIENTES ===
export const clientService = {
  // Listar clientes
  async list(salonId: string, search?: string): Promise<RPCResponse<Client[]>> {
    try {
      const { data, error } = await supabase.rpc('list_clients', {
        salon_id: salonId,
        search: search || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar clientes: ${err}` }
    }
  },

  // Criar cliente
  async create(params: {
    salonId: string
    name: string
    phone: string
    email: string
    cpf: string
    birthDate: string
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('create_client', {
        p_salon_id: params.salonId,
        p_name: params.name,
        p_phone: params.phone,
        p_email: params.email && params.email.trim() ? params.email : null,
        p_cpf: params.cpf && params.cpf.trim() ? params.cpf : null,
        p_birth_date: params.birthDate && params.birthDate.trim() ? params.birthDate : null
      });
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao criar cliente: ${err}` }
    }
  },

  // Atualizar cliente
  async update(params: {
    clientId: string
    salonId: string
    name: string
    phone: string
    email: string
    cpf: string
    birthDate: string
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('update_client', {
        p_client_id: params.clientId,
        p_salon_id: params.salonId,
        p_name: params.name,
        p_phone: params.phone,
        p_email: params.email,
        p_cpf: params.cpf,
        p_birth_date: params.birthDate
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao atualizar cliente: ${err}` }
    }
  },

  // Deletar cliente
  async delete(clientId: string, salonId: string): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('delete_client', {
        client_id: clientId,
        salon_id: salonId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao deletar cliente: ${err}` }
    }
  }
}

// === PROFISSIONAIS ===
export const professionalService = {
  // Listar profissionais
  async list(salonId: string): Promise<RPCResponse<Professional[]>> {
    try {
      const { data, error } = await supabase.rpc('list_professionals', {
        salon_id: salonId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar profissionais: ${err}` }
    }
  },

  // Criar profissional
  async create(params: {
    salonId: string
    name: string
    role: string
    phone: string
    email: string
    color: string
    commissionRate: number
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('create_professional', {
        p_salon_id: params.salonId,
        p_name: params.name,
        p_role: params.role,
        p_phone: params.phone,
        p_email: params.email && params.email.trim() ? params.email : null,
        p_color: params.color,
        p_commission_rate: params.commissionRate,
        p_active: true
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao criar profissional: ${err}` }
    }
  },

  // Atualizar profissional
  async update(params: {
    professionalId: string
    salonId: string
    name: string
    role: string
    phone: string
    email: string
    color: string
    commissionRate: number
    active: boolean
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('update_professional', {
        p_professional_id: params.professionalId,
        p_salon_id: params.salonId,
        p_name: params.name,
        p_role: params.role,
        p_phone: params.phone,
        p_email: params.email,
        p_color: params.color,
        p_commission_rate: params.commissionRate,
        p_active: params.active
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao atualizar profissional: ${err}` }
    }
  },

  // Deletar profissional
  async delete(professionalId: string, salonId: string): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('delete_professional', {
        professional_id: professionalId,
        salon_id: salonId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao deletar profissional: ${err}` }
    }
  },

  // Obter disponibilidade
  async getAvailability(professionalId: string, date: string): Promise<RPCResponse<any>> {
    try {
      const { data, error } = await supabase.rpc('get_availability', {
        professional_id: professionalId,
        date: date
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao obter disponibilidade: ${err}` }
    }
  },

  // Listar horários de funcionamento
  async listBusinessHours(professionalId: string): Promise<RPCResponse<any[]>> {
    try {
      const { data, error } = await supabase.rpc('list_business_hours', {
        professional_id: professionalId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar horários: ${err}` }
    }
  }
}

// === SERVIÇOS ===
export const serviceService = {
  // Listar serviços
  async list(salonId: string): Promise<RPCResponse<Service[]>> {
    try {
      const { data, error } = await supabase.rpc('list_services', {
        salon_id: salonId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar serviços: ${err}` }
    }
  },

  // Criar serviço
  async create(params: {
    salonId: string
    name: string
    price: number
    estimatedTime: number
    commissionRate: number
    description?: string
    active?: boolean
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('create_service', {
        p_salon_id: params.salonId,
        p_name: params.name,
        p_price: params.price,
        p_estimated_time: params.estimatedTime,
        p_commission_rate: params.commissionRate,
        p_description: params.description || null,
        p_active: params.active !== undefined ? params.active : true
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao criar serviço: ${err}` }
    }
  },

  // Atualizar serviço
  async update(params: {
    serviceId: string
    salonId: string
    name: string
    price: number
    commissionRate: number
    estimatedTime: number
    active: boolean
    description?: string
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('update_service', {
        service_id: params.serviceId,
        salon_id: params.salonId,
        name: params.name,
        price: params.price,
        commission_rate: params.commissionRate,
        estimated_time: params.estimatedTime,
        active: params.active,
        description: params.description || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao atualizar serviço: ${err}` }
    }
  }
}

// === PRODUTOS ===
export const productService = {
  // Listar produtos
  async list(salonId: string): Promise<RPCResponse<Product[]>> {
    try {
      const { data, error } = await supabase.rpc('list_products', {
        salon_id: salonId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar produtos: ${err}` }
    }
  },

  // Criar produto
  async create(params: {
    salonId: string
    name: string
    price: number
    costPrice: number
    profitMargin: number
    stock: number
    description?: string
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('create_product', {
        salon_id: params.salonId,
        name: params.name,
        price: params.price,
        cost_price: params.costPrice,
        profit_margin: params.profitMargin,
        stock: params.stock,
        description: params.description || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao criar produto: ${err}` }
    }
  },

  // Atualizar produto
  async update(params: {
    productId: string
    salonId: string
    name: string
    price: number
    costPrice: number
    profitMargin: number
    stock: number
    description?: string
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('update_product', {
        product_id: params.productId,
        salon_id: params.salonId,
        name: params.name,
        price: params.price,
        cost_price: params.costPrice,
        profit_margin: params.profitMargin,
        stock: params.stock,
        description: params.description || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao atualizar produto: ${err}` }
    }
  },

  // Deletar produto
  async delete(productId: string, salonId: string): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('delete_product', {
        product_id: productId,
        salon_id: salonId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao deletar produto: ${err}` }
    }
  },

  // Criar venda de produto
  async createSale(params: {
    salonId: string
    clientId: string
    productId: string
    quantity: number
    paymentMethodId: string
    unitPrice: number
    grossTotal: number
    netProfit: number
    professionalId?: string
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('create_product_sale', {
        salon_id: params.salonId,
        client_id: params.clientId,
        product_id: params.productId,
        quantity: params.quantity,
        payment_method_id: params.paymentMethodId,
        unit_price: params.unitPrice,
        gross_total: params.grossTotal,
        net_profit: params.netProfit,
        professional_id: params.professionalId || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao criar venda: ${err}` }
    }
  },

  // Listar vendas de produtos
  async listSales(params: {
    salonId: string
    dateFrom?: string
    dateTo?: string
  }): Promise<RPCResponse<ProductSale[]>> {
    try {
      const { data, error } = await supabase.rpc('list_product_sales', {
        salon_id: params.salonId,
        date_from: params.dateFrom || null,
        date_to: params.dateTo || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar vendas: ${err}` }
    }
  }
}

// === AGENDAMENTOS ===
export const appointmentService = {
  // Listar agendamentos
  async list(params: {
    salonId: string
    professionalId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<RPCResponse<Appointment[]>> {
    try {
      const { data, error } = await supabase.rpc('list_appointments', {
        salon_id: params.salonId,
        professional_id: params.professionalId || null,
        date_from: params.dateFrom || null,
        date_to: params.dateTo || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar agendamentos: ${err}` }
    }
  },

  // Criar agendamento
  async create(params: {
    salonId: string
    clientId: string
    professionalId: string
    date: string
    startTime: string
    status?: string
    notes?: string
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('create_appointment', {
        p_salon_id: params.salonId,
        p_client_id: params.clientId,
        p_professional_id: params.professionalId,
        p_date: params.date,
        p_start_time: params.startTime,
        p_status: params.status || 'agendado',
        p_notes: params.notes || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao criar agendamento: ${err}` }
    }
  },

  // Cancelar agendamento
  async cancel(appointmentId: string, salonId: string): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('cancel_appointment', {
        p_appointment_id: appointmentId,
        p_salon_id: salonId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao cancelar agendamento: ${err}` }
    }
  }
}

// === MÉTODOS DE PAGAMENTO ===
export const paymentMethodService = {
  // Listar métodos de pagamento
  async list(salonId: string): Promise<RPCResponse<PaymentMethod[]>> {
    try {
      const { data, error } = await supabase.rpc('list_payment_methods', {
        salon_id: salonId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar métodos de pagamento: ${err}` }
    }
  },

  // Criar método de pagamento
  async create(params: {
    salonId: string
    name: string
    fee: number
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('create_payment_method', {
        salon_id: params.salonId,
        name: params.name,
        fee: params.fee
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao criar método de pagamento: ${err}` }
    }
  },

  // Atualizar método de pagamento
  async update(params: {
    paymentMethodId: string
    salonId: string
    name: string
    fee: number
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('update_payment_method', {
        payment_method_id: params.paymentMethodId,
        salon_id: params.salonId,
        name: params.name,
        fee: params.fee
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao atualizar método de pagamento: ${err}` }
    }
  },

  // Deletar método de pagamento
  async delete(paymentMethodId: string, salonId: string): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('delete_payment_method', {
        payment_method_id: paymentMethodId,
        salon_id: salonId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao deletar método de pagamento: ${err}` }
    }
  }
}

// === FINANCEIRO ===
export const financeService = {
  // Fechar caixa
  async closeCash(params: {
    salonId: string
    professionalId: string
    date: string
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('close_cash', {
        salon_id: params.salonId,
        professional_id: params.professionalId,
        date: params.date
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao fechar caixa: ${err}` }
    }
  },

  // Listar fechamentos de caixa
  async listCashClosures(params: {
    salonId: string
    professionalId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<RPCResponse<CashClosure[]>> {
    try {
      const { data, error } = await supabase.rpc('list_cash_closures', {
        salon_id: params.salonId,
        professional_id: params.professionalId || null,
        date_from: params.dateFrom || null,
        date_to: params.dateTo || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar fechamentos: ${err}` }
    }
  },

  // Criar vale
  async createAdvance(params: {
    salonId: string
    professionalId: string
    value: number
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('create_advance', {
        p_salon_id: params.salonId,
        p_professional_id: params.professionalId,
        p_value: params.value
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao criar vale: ${err}` }
    }
  },

  // Listar vales
  async listAdvances(params: {
    salonId: string
    professionalId?: string
  }): Promise<RPCResponse<Advance[]>> {
    try {
      const { data, error } = await supabase.rpc('list_advances', {
        salon_id: params.salonId,
        professional_id: params.professionalId || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar vales: ${err}` }
    }
  }
}

// === UTILITÁRIOS ===
export const utilityService = {
  // Obter contexto do usuário
  async getUserContext(): Promise<RPCResponse<any>> {
    try {
      const { data, error } = await supabase.rpc('get_user_context')
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao obter contexto: ${err}` }
    }
  },

  // Listar funções públicas
  async getPublicFunctions(): Promise<RPCResponse<any[]>> {
    try {
      const { data, error } = await supabase.rpc('get_public_functions')
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar funções: ${err}` }
    }
  }
}

// Exportar todas as funções organizadas
export const supabaseService = {
  clients: clientService,
  professionals: professionalService,
  services: serviceService,
  products: productService,
  appointments: appointmentService,
  paymentMethods: paymentMethodService,
  finance: financeService,
  utilities: utilityService
}