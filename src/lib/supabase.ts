import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL 
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY 

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para as funções RPC
export interface RPCResponse<T = any> {
  data: T | null
  error: string | null
}

// Base para todas as funções RPC que retornam success/id
export interface RPCSuccessResponse {
  success: boolean
  id?: string
  appointment_id?: string
  service_id?: string
  client_id?: string
  advance_id?: string
} 