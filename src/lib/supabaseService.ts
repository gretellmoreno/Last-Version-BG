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
  CashClosurePreview,
  Advance,
  AppointmentDetails,
  CancelAppointmentResponse,
  CreateClientResponse,
  CreateProfessionalResponse,
  CreateServiceResponse,
  CreateProductResponse
} from '../types'

// === CLIENTES ===
export const clientService = {
  // Encontrar ou criar cliente
  async findOrCreate(params: {
    salonId: string
    name: string
    phone: string
    email?: string
  }): Promise<RPCResponse<{ client_id: string }>> {
    try {
      const { data, error } = await supabase.rpc('find_or_create_client', {
        p_salon_id: params.salonId,
        p_name: params.name,
        p_phone: params.phone,
        p_email: params.email || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || { client_id: null }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao encontrar/criar cliente: ${err}` }
    }
  },

  // Listar clientes
  async list(salonId: string, search?: string): Promise<RPCResponse<Client[]>> {
    try {
      const { data, error } = await supabase.rpc('list_clients', {
        p_salon_id: salonId,
        p_search: search || null
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
  }): Promise<RPCResponse<CreateClientResponse>> {
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
      
      return { data: data || { success: false, client: null }, error: null }
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
        p_client_id: clientId,
        p_salon_id: salonId
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
        p_salon_id: salonId
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
  }): Promise<RPCResponse<CreateProfessionalResponse>> {
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
      
      return { data: data || { success: false, professional: null }, error: null }
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
        p_professional_id: professionalId,
        p_salon_id: salonId
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
  async getAvailability(professionalId: string, date: string, totalDuration: number): Promise<RPCResponse<any>> {
    try {
      console.log('🕐 Buscando disponibilidade:', { professionalId, date, totalDuration });

      const { data, error } = await supabase.rpc('get_availability', {
        p_professional_id: professionalId,
        p_target_date: date,
        p_total_duration: totalDuration
      });

      console.log('📅 Resposta da disponibilidade:', { data, error });

      if (error) {
        // Se a função não existe, retornar horários padrão
        const isPGRST202 = typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'PGRST202';
        if (isPGRST202) {
          console.log('🔄 Função get_availability não encontrada, gerando horários padrão');
          const defaultTimes = this.generateDefaultTimeSlots();
          return { data: defaultTimes, error: null };
        }
        return { data: null, error: error.message }
      }
      return { data: data, error: null }
    } catch (err) {
      console.error('❌ Exceção na disponibilidade:', err);
      // Em caso de erro, gerar horários padrão
      console.log('🔄 Gerando horários padrão devido à exceção');
      const defaultTimes = this.generateDefaultTimeSlots();
      return { data: defaultTimes, error: null };
    }
  },

  // Gerar horários padrão quando a função RPC não existir
  generateDefaultTimeSlots(): string[] {
    const slots = [];
    // Gerar horários de 8:00 às 22:00 com intervalos de 15 minutos
    for (let hour = 8; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 22 && minute > 0) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
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
  }): Promise<RPCResponse<CreateServiceResponse>> {
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
      
      return { data: data || { success: false, service: null }, error: null }
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
        p_service_id: params.serviceId,
        p_salon_id: params.salonId,
        p_name: params.name,
        p_price: params.price,
        p_commission_rate: params.commissionRate,
        p_estimated_time: params.estimatedTime,
        p_active: params.active,
        p_description: params.description || null
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
  }): Promise<RPCResponse<CreateProductResponse>> {
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
      
      return { data: data || { success: false, product: null }, error: null }
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
        p_product_id: params.productId,
        p_salon_id: params.salonId,
        p_name: params.name,
        p_price: params.price,
        p_cost_price: params.costPrice,
        p_profit_margin: params.profitMargin,
        p_stock: params.stock,
        p_description: params.description || null
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
        p_salon_id: params.salonId,
        p_professional_filter_id: params.professionalId || null,
        p_date_from: params.dateFrom || null,
        p_date_to: params.dateTo || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || [], error: null }
    } catch (err) {
      return { data: null, error: `Erro ao listar agendamentos: ${err}` }
    }
  },

  // Criar agendamento (Abrir a Comanda)
  async create(params: {
    salonId: string
    clientId: string
    professionalId: string
    date: string
    startTime: string
    services: Array<{
      service_id: string
      custom_price?: number
      custom_time?: number
    }>
    notes?: string
  }): Promise<RPCResponse<AppointmentDetails>> {
    try {
      console.log('🆕 Criando novo agendamento (comanda):', params);
      
      // Adicionar parâmetros obrigatórios que podem estar faltando
      const rpcParams = {
        p_salon_id: params.salonId,
        p_client_id: params.clientId,
        p_professional_id: params.professionalId,
        p_date: params.date,
        p_start_time: params.startTime,
        p_services_json: params.services,
        p_status: 'agendado', // Parâmetro obrigatório que estava faltando
        p_notes: params.notes || null
      };

      console.log('📞 Chamando RPC create_appointment com parâmetros:', rpcParams);
      
      const { data, error } = await supabase.rpc('create_appointment', rpcParams);
      
      console.log('📥 Resposta da RPC:', { data, error });
      
      if (error) {
        console.error('❌ Erro na RPC:', error);
        return { data: null, error: error.message }
      }
      
      console.log('✅ Agendamento criado com sucesso:', data);
      return { data: data || { success: false, appointment: null }, error: null }
    } catch (err) {
      console.error('❌ Exceção capturada:', err);
      return { data: null, error: `Erro ao criar agendamento: ${err}` }
    }
  },

  // Atualizar horário do agendamento (arrastar ou redimensionar)
  async updateTime(params: {
    appointmentId: string
    salonId: string
    newDate: string
    newStartTime: string
    newEndTime: string
    newProfessionalId: string
  }): Promise<RPCResponse<any>> {
    try {
      const { data, error } = await supabase.rpc('update_appointment_time', {
        p_appointment_id: params.appointmentId,
        p_salon_id: params.salonId,
        p_new_date: params.newDate,
        p_new_start_time: params.newStartTime,
        p_new_end_time: params.newEndTime,
        p_new_professional_id: params.newProfessionalId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao atualizar horário do agendamento: ${err}` }
    }
  },

  // Atualizar agendamento (método genérico para outras atualizações)
  async update(appointmentId: string, params: {
    start_time?: string
    end_time?: string
    professional_id?: string
    status?: string
    notes?: string
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('update_appointment', {
        p_appointment_id: appointmentId,
        p_start_time: params.start_time || null,
        p_end_time: params.end_time || null,
        p_professional_id: params.professional_id || null,
        p_status: params.status || null,
        p_notes: params.notes || null
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao atualizar agendamento: ${err}` }
    }
  },

  // Cancelar agendamento
  async cancel(appointmentId: string, salonId: string): Promise<RPCResponse<CancelAppointmentResponse>> {
    try {
      const { data, error } = await supabase.rpc('cancel_appointment', {
        p_appointment_id: appointmentId,
        p_salon_id: salonId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || { success: false, appointment: null }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao cancelar agendamento: ${err}` }
    }
  },

  // Obter detalhes específicos de um agendamento
  async getDetails(appointmentId: string, salonId: string): Promise<RPCResponse<AppointmentDetails>> {
    try {
      const { data, error } = await supabase.rpc('get_appointment_details', {
        p_appointment_id: appointmentId,
        p_salon_id: salonId
      })
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || { success: false, appointment: null }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao obter detalhes do agendamento: ${err}` }
    }
  },

  // ===== NOVO MODELO DE COMANDA =====

  // Adicionar serviço a uma comanda existente
  async addServiceToComanda(params: {
    appointmentId: string
    salonId: string
    serviceId: string
    customPrice?: number
    customTime?: number
  }): Promise<RPCResponse<AppointmentDetails>> {
    try {
      const { data, error } = await supabase.rpc('add_service_to_comanda', {
        p_appointment_id: params.appointmentId,
        p_salon_id: params.salonId,
        p_service_id: params.serviceId,
        p_custom_price: params.customPrice || null,
        p_custom_time: params.customTime || null
      });
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || { success: false, appointment: null }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao adicionar serviço à comanda: ${err}` }
    }
  },

  // Remover serviço de uma comanda existente
  async removeServiceFromComanda(params: {
    appointmentServiceId: string
    salonId: string
  }): Promise<RPCResponse<AppointmentDetails>> {
    try {
      const { data, error } = await supabase.rpc('remove_service_from_comanda', {
        p_appointment_service_id: params.appointmentServiceId,
        p_salon_id: params.salonId
      });
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || { success: false, appointment: null }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao remover serviço da comanda: ${err}` }
    }
  },

  // Finalizar comanda (finalizar e pagar)
  async finalizeComanda(params: {
    appointmentId: string
    salonId: string
    paymentMethodId: string
  }): Promise<RPCResponse<AppointmentDetails>> {
    try {
      const { data, error } = await supabase.rpc('finalize_comanda', {
        p_appointment_id: params.appointmentId,
        p_salon_id: params.salonId,
        p_payment_method_id: params.paymentMethodId
      });
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || { success: false, appointment: null }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao finalizar comanda: ${err}` }
    }
  },

  // Atualizar item da comanda (serviço ou produto)
  async updateComandaItem(params: {
    salonId: string
    appointmentId: string
    itemType: 'service' | 'product'
    itemRecordId: string
    customPrice?: number
    quantity?: number
    paymentMethodId?: string
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('update_comanda_item', {
        p_salon_id: params.salonId,
        p_appointment_id: params.appointmentId,
        p_item_type: params.itemType,
        p_item_record_id: params.itemRecordId,
        p_custom_price: params.customPrice || null,
        p_quantity: params.quantity || null,
        p_payment_method_id: params.paymentMethodId || null
      });
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data?.[0] || { success: false }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao atualizar item da comanda: ${err}` }
    }
  },

  // Atualizar agendamento (função legada - manter para compatibilidade)
  async updateAppointment(params: {
    appointmentId: string
    salonId: string
    newStatus?: string
    newNotes?: string
    newClientId?: string
    servicesToAdd?: Array<{
      service_id: string
      custom_price?: number
    }>
    servicesToRemove?: Array<{
      appointment_service_id: string
    }>
    productsToAdd?: Array<{
      product_id: string
      quantity: number
    }>
    productsToRemove?: Array<{
      product_sale_id: string
    }>
  }): Promise<RPCResponse<AppointmentDetails>> {
    try {
      // Preparar parâmetros da RPC (só enviar os que foram fornecidos)
      const rpcParams: any = {
        p_appointment_id: params.appointmentId,
        p_salon_id: params.salonId,
        p_new_status: params.newStatus || null,
        p_new_notes: params.newNotes || null,
        p_services_to_add: params.servicesToAdd || null,
        p_services_to_remove: params.servicesToRemove || null,
        p_products_to_add: params.productsToAdd || null,
        p_products_to_remove: params.productsToRemove || null
      };

      // Só incluir p_new_client_id se foi fornecido
      if (params.newClientId) {
        rpcParams.p_new_client_id = params.newClientId;
      }
      // Não enviar p_new_client_id se não foi fornecido (deixar undefined)

      console.log('🔧 Parâmetros RPC finais:', rpcParams);

      const { data, error } = await supabase.rpc('update_appointment', rpcParams);
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data: data || { success: false, appointment: null }, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao atualizar agendamento: ${err}` }
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
      });
      
      if (error) {
        console.error('Erro ao listar métodos de pagamento:', error);
        return { data: null, error: error.message };
      }
      
      // Mapear os dados retornados para o formato esperado
      const formattedMethods = (data || []).map((method: any) => ({
        id: method.id,
        name: method.name,
        fee: method.fee || 0,
        value: 0
      }));
      
      return { data: formattedMethods, error: null };
    } catch (err) {
      return { data: null, error: `Erro ao listar métodos de pagamento: ${err}` };
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
        p_salon_id: params.salonId,
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
        p_payment_method_id: params.paymentMethodId,
        p_salon_id: params.salonId,
        p_name: params.name,
        p_fee: params.fee
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
  // Obter dados do dashboard financeiro
  async getFinancialDashboard(params: {
    salonId: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<RPCResponse<{
    success: boolean;
    dashboard: {
      summary: {
        total_services_revenue: number;
        total_products_revenue: number;
        total_gross_revenue: number;
        total_net_profit: number;
        salon_profit_from_services: number;
        total_commissions: number;
        salon_profit_from_products: number;
      };
    };
  }>> {
    try {
      const { data, error } = await supabase.rpc('get_financial_dashboard', {
        p_salon_id: params.salonId,
        p_date_from: params.dateFrom,
        p_date_to: params.dateTo
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || null, error: null };
    } catch (err) {
      return { data: null, error: `Erro ao obter dados do dashboard: ${err}` };
    }
  },

  // Listar atendimentos para o relatório financeiro
  async listAppointments(params: {
    salonId: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<RPCResponse<any[]>> {
    try {
      const { data, error } = await supabase.rpc('list_financial_appointments', {
        p_salon_id: params.salonId,
        p_date_from: params.dateFrom,
        p_date_to: params.dateTo
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: `Erro ao listar atendimentos: ${err}` };
    }
  },

  // Listar vendas de produtos para o relatório financeiro
  async listProductSales(params: {
    salonId: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<RPCResponse<any[]>> {
    try {
      const { data, error } = await supabase.rpc('list_financial_product_sales', {
        p_salon_id: params.salonId,
        p_date_from: params.dateFrom,
        p_date_to: params.dateTo
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: `Erro ao listar vendas de produtos: ${err}` };
    }
  },

  // Obter fluxo de caixa diário
  async getDailyCashFlow(params: {
    salonId: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<RPCResponse<{
    success: boolean;
    cash_flow: Array<{
      day: string;
      revenue: number;
      expense: number;
      result: number;
    }>;
  }>> {
    try {
      const { data, error } = await supabase.rpc('get_daily_cash_flow', {
        p_salon_id: params.salonId,
        p_date_from: params.dateFrom,
        p_date_to: params.dateTo
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || { success: false, cash_flow: [] }, error: null };
    } catch (err) {
      return { data: null, error: `Erro ao obter fluxo de caixa diário: ${err}` };
    }
  },

  // Pré-visualização do fechamento de caixa (sem salvar)
  async getCashClosurePreview(params: {
    salonId: string
    professionalId: string
    dateFrom: string
    dateTo: string
  }): Promise<RPCResponse<CashClosurePreview>> {
    try {
      const { data, error } = await supabase.rpc('get_cash_closure_preview', {
        p_salon_id: params.salonId,
        p_professional_id: params.professionalId,
        p_date_from: params.dateFrom,
        p_date_to: params.dateTo
      })
      if (error) {
        return { data: null, error: error.message }
      }
      return { data: data || null, error: null }
    } catch (err) {
      return { data: null, error: `Erro ao obter pré-visualização: ${err}` }
    }
  },

  // Finalizar fechamento de caixa
  async finalizeCashClosure(params: {
    salonId: string
    professionalId: string
    startDate: string
    endDate: string
    advanceIdsToDiscount: string[]
  }): Promise<RPCResponse<{ 
    id: string;  // UUID do fechamento
    resumo: {
      fees: number;      // Total das taxas
      commissions: number; // Total das comissões
      net_total: number;   // Total líquido
    }; 
    closed_at: string;  // Timestamp do fechamento
  }>> {
    try {
      console.log('✅ finalizeCashClosure - Parâmetros:', params);
      
      const { data, error } = await supabase.rpc('finalize_cash_closure', {
        p_salon_id: params.salonId,
        p_professional_id: params.professionalId,
        p_start_date: params.startDate,
        p_end_date: params.endDate,
        p_advance_ids_to_discount: params.advanceIdsToDiscount
      })
      
      console.log('✅ finalizeCashClosure - Resposta:', { data, error });
      
      if (error) {
        console.error('❌ finalizeCashClosure - Erro:', error);
        return { data: null, error: error.message }
      }
      
      // Verificar se temos dados de retorno
      if (data && data.length > 0) {
        const result = data[0];
        return { 
          data: { 
            id: result.cash_closure_id,
            resumo: {
              fees: result.resumo.fees,
              commissions: result.resumo.commissions,
              net_total: result.resumo.net_total
            },
            closed_at: result.closed_at
          }, 
          error: null 
        }
      } else {
        return { data: null, error: 'Nenhum dado retornado pelo fechamento' }
      }
    } catch (err) {
      console.error('❌ finalizeCashClosure - Erro capturado:', err);
      return { data: null, error: `Erro ao finalizar fechamento: ${err}` }
    }
  },

  // Fechar caixa (função antiga - manter para compatibilidade)
  async closeCash(params: {
    salonId: string
    professionalId: string
    dateFrom: string
    dateTo: string
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('close_cash', {
        p_salon_id: params.salonId,
        p_professional_id: params.professionalId,
        p_date_from: params.dateFrom,
        p_date_to: params.dateTo
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
    salonId: string,
    professionalId?: string
  }): Promise<RPCResponse<Advance[]>> {
    try {
      console.log('listAdvances - Parâmetros:', params);
      
      const { data, error } = await supabase.rpc('list_advances', {
        salon_id: params.salonId,
        professional_id: params.professionalId || null
      });
      
      console.log('listAdvances - Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error('listAdvances - Erro do Supabase:', error);
        return { data: null, error: error.message };
      }
      
      console.log('listAdvances - Dados retornados:', data);
      return { data: data || [], error: null };
    } catch (err: any) {
      console.error('listAdvances - Erro capturado:', err);
      const errorMessage = err?.message || err?.toString() || 'Erro desconhecido';
      return { data: null, error: `Erro ao listar vales: ${errorMessage}` };
    }
  },

  // Marcar vales como descontados
  async markAdvancesAsDiscounted(params: {
    salonId: string;
    advanceIds: string[];
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('mark_advances_as_discounted', {
        p_salon_id: params.salonId,
        p_advance_ids: params.advanceIds
      });
      
      if (error) {
        return { data: null, error: error.message };
      }
      
      return { data: data?.[0] || { success: false }, error: null };
    } catch (err) {
      return { data: null, error: `Erro ao marcar vales como descontados: ${err}` };
    }
  },

  // Deletar vale
  async deleteAdvance(params: {
    advanceId: string;
    salonId: string;
  }): Promise<RPCResponse<RPCSuccessResponse>> {
    try {
      console.log('deleteAdvance - Parâmetros:', params);
      
      const { data, error } = await supabase.rpc('delete_advance', {
        p_advance_id: params.advanceId,
        p_salon_id: params.salonId
      });
      
      console.log('deleteAdvance - Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error('deleteAdvance - Erro do Supabase:', error);
        return { data: null, error: error.message };
      }
      
      console.log('deleteAdvance - Sucesso:', data);
      return { data: data?.[0] || { success: false }, error: null };
    } catch (err) {
      console.error('deleteAdvance - Erro capturado:', err);
      return { data: null, error: `Erro ao deletar vale: ${err}` };
    }
  },

  // Listar atendimentos para o relatório financeiro
  async getFinancialAppointments(params: {
    salonId: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<RPCResponse<{
    appointment_datetime: string;
    professional_name: string;
    client_name: string;
    payment_method_name: string;
    total_value: number;
    salon_profit: number;
    professional_profit: number;
  }[]>> {
    try {
      const { data, error } = await supabase.rpc('get_financial_appointments', {
        p_salon_id: params.salonId,
        p_date_from: params.dateFrom,
        p_date_to: params.dateTo
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: `Erro ao listar atendimentos: ${err}` };
    }
  },

  // Listar vendas de produtos para o relatório financeiro
  async getFinancialProductSales(params: {
    salonId: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<RPCResponse<{
    sale_date: string;
    product_name: string;
    sale_source: string;
    client_name: string;
    payment_method_name: string;
    quantity: number;
    total_value: number;
    profit: number;
  }[]>> {
    try {
      const { data, error } = await supabase.rpc('get_financial_product_sales', {
        p_salon_id: params.salonId,
        p_date_from: params.dateFrom,
        p_date_to: params.dateTo
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: `Erro ao listar vendas de produtos: ${err}` };
    }
  }
}

// === UTILITÁRIOS ===
export const utilityService = {
  // Obter contexto do usuário
  async getUserContext(): Promise<RPCResponse<any>> {
    try {
      const { data, error } = await supabase.rpc('load_initial_data')
      
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

// === VENDA DIRETA ===
export async function createDirectSale({
  salonId,
  clientId,
  paymentMethodId,
  products
}: {
  salonId: string;
  clientId: string | null;
  paymentMethodId: string;
  products: { product_id: string; quantity: number; unit_price: number }[];
}): Promise<RPCResponse<any>> {
  try {
    const { data, error } = await supabase.rpc('create_direct_sale', {
      p_salon_id: salonId,
      p_client_id: clientId,
      p_payment_method_id: paymentMethodId,
      p_products_json: products
    });
    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: `Erro ao criar venda direta: ${err}` };
  }
}

// === Link de Agendamento ===
export const linkAgendamentoService = {
  // Obter configurações do link
  getConfig: async (salonId: string) => {
    try {
      const { data, error } = await supabase
        .from('link_agendamento_config')
        .select('*')
        .eq('salon_id', salonId)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: `Erro ao obter configurações: ${err}` };
    }
  },

  // Salvar configurações do link
  saveConfig: async (salonId: string, config: any) => {
    try {
      const { data, error } = await supabase
        .from('link_agendamento_config')
        .upsert({
          salon_id: salonId,
          ...config,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: `Erro ao salvar configurações: ${err}` };
    }
  }
};

// Exportar todas as funções organizadas
export const supabaseService = {
  clients: clientService,
  professionals: professionalService,
  services: serviceService,
  products: productService,
  appointments: appointmentService,
  paymentMethods: paymentMethodService,
  finance: financeService,
  utilities: utilityService,
  linkAgendamento: linkAgendamentoService
}