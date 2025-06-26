import { useState } from 'react'
import { supabaseService } from './supabaseService'
import { RPCResponse } from './supabase'

// Hook para gerenciar estado de loading e erro
export const useSupabase = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeRPC = async <T>(
    rpcFunction: () => Promise<RPCResponse<T>>
  ): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await rpcFunction()
      
      if (result.error) {
        setError(result.error)
        return null
      }
      
      return result.data
    } catch (err) {
      setError(`Erro inesperado: ${err}`)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    executeRPC,
    clearError: () => setError(null),
    
    // Serviços disponíveis
    clients: supabaseService.clients,
    professionals: supabaseService.professionals,
    services: supabaseService.services,
    products: supabaseService.products,
    appointments: supabaseService.appointments,
    paymentMethods: supabaseService.paymentMethods,
    finance: supabaseService.finance,
    utilities: supabaseService.utilities
  }
} 