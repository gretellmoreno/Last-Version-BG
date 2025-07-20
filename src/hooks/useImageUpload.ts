import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UseImageUploadReturn {
  uploading: boolean;
  error: string | null;
  uploadImage: (file: File, path: string) => Promise<string | null>;
  deleteImage: (path: string) => Promise<boolean>;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      setUploading(true);
      setError(null);

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo deve ser uma imagem');
      }

      // Validar tamanho do arquivo (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 2MB');
      }

      // Upload para o bucket 'images'
      const { data, error } = await supabase.storage
        .from('images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Gerar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer upload da imagem';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (path: string): Promise<boolean> => {
    try {
      setError(null);
      const { error } = await supabase.storage
        .from('images')
        .remove([path]);

      if (error) {
        throw error;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar imagem';
      setError(message);
      return false;
    }
  };

  return {
    uploading,
    error,
    uploadImage,
    deleteImage
  };
} 