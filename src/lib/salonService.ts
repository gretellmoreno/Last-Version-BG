import { supabase } from './supabase';

interface SalonData {
  id: string;
  name: string;
  subdomain: string;
  public_profile_photo_url: string | null;
  public_display_name: string | null;
}

interface SalonResponse {
  success: boolean;
  salon?: SalonData;
  error?: string;
}

export const salonService = {
  // Buscar salão pelo subdomínio usando RPC
  async getSalonBySlug(subdomain: string): Promise<SalonResponse> {
    try {
      console.log('🔍 Buscando salão pelo subdomínio:', subdomain);
      
      const { data, error } = await supabase.rpc('get_salon_by_subdomain', {
        p_subdomain: subdomain
      });

      if (error) {
        console.error('❌ Erro RPC ao buscar salão:', error);
        return {
          success: false,
          error: error.message || 'Salão não encontrado'
        };
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('❌ Salão não encontrado para subdomínio:', subdomain);
        return {
          success: false,
          error: 'Salão não encontrado'
        };
      }

      const salon = data[0]; // RPC retorna array, pegar primeiro elemento
      console.log('✅ Salão encontrado:', salon.name);
      return {
        success: true,
        salon: salon
      };

    } catch (err) {
      console.error('💥 Erro inesperado ao buscar salão:', err);
      return {
        success: false,
        error: 'Erro inesperado ao buscar salão'
      };
    }
  },

  // Verificar se subdomínio está disponível
  async isSlugAvailable(subdomain: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('get_salon_by_subdomain', {
        p_subdomain: subdomain
      });

      // Se houve erro ou não encontrou dados, subdomínio está disponível
      return error !== null || !data || !Array.isArray(data) || data.length === 0;
    } catch {
      return true;
    }
  },

  // Buscar configurações públicas do salão (para páginas públicas)
  async getPublicSalonConfig(subdomain: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_salon_by_subdomain', {
        p_subdomain: subdomain
      });

      if (error || !data || !Array.isArray(data) || data.length === 0) {
        return null;
      }

      const salon = data[0]; // RPC retorna array, pegar primeiro elemento
      return {
        id: salon.id,
        name: salon.name,
        subdomain: salon.subdomain,
        displayName: salon.public_display_name || salon.name,
        profilePhotoUrl: salon.public_profile_photo_url
      };

    } catch {
      return null;
    }
  }
}; 