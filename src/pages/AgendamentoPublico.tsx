import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabaseService } from '../lib/supabaseService';
import { LinkAgendamentoConfig } from '../types';
import { Loader2 } from 'lucide-react';

export default function AgendamentoPublico() {
  const [searchParams] = useSearchParams();
  const salonId = searchParams.get('salonId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<LinkAgendamentoConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      if (!salonId) {
        setError('ID do salão não fornecido');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabaseService.linkAgendamento.getConfig(salonId);
        
        if (error) {
          setError(error);
          return;
        }

        if (data) {
          setConfig(data);
        } else {
          setError('Configurações não encontradas');
        }
      } catch (err) {
        setError('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [salonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600">{error || 'Erro desconhecido'}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        '--cor-primaria': config.corPrimaria,
        '--cor-secundaria': config.corSecundaria,
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            {config.logotipo && (
              <img
                src={config.logotipo}
                alt="Logotipo"
                className="h-12 w-12 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agendamento Online</h1>
              <p className="text-gray-600">{config.mensagemBoasVindas}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TODO: Implementar fluxo de agendamento */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600">
            Em breve você poderá fazer seu agendamento aqui!
          </p>
        </div>
      </main>
    </div>
  );
} 