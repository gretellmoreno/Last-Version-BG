import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://akulirqbzymflognlaoh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdWxpcnFienltZmxvZ25sYW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzA2NDcsImV4cCI6MjA2NTk0NjY0N30.zT9djIhPW6X_UOlaR2-BpHB4UJBG6N1CjYZR1_X4Gzc'

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