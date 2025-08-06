import React, { useState, useEffect } from 'react';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import { useAuth } from '../contexts/AuthContext';
import { useSalonSlug, useIsMainDomain } from '../hooks/useSubdomain';
import { salonService } from '../lib/salonService';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [salonData, setSalonData] = useState<any>(null);
  const [loadingSalon, setLoadingSalon] = useState(false);
  
  const { signIn, loading } = useAuth();
  const salonSlug = useSalonSlug();
  const isMainDomain = useIsMainDomain();

  // Carregar dados do salão se estiver em subdomínio
  useEffect(() => {
    const loadSalonData = async () => {
      if (salonSlug && !isMainDomain) {
        setLoadingSalon(true);
        try {
          const response = await salonService.getSalonBySlug(salonSlug);
          if (response.success && response.salon) {
            setSalonData(response.salon);
          }
        } catch (err) {
          console.error('Erro ao carregar dados do salão para login:', err);
        } finally {
          setLoadingSalon(false);
        }
      }
    };

    loadSalonData();
  }, [salonSlug, isMainDomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    const result = await signIn(email, password);
    
    if (!result.success) {
      setError(result.error || 'Erro ao fazer login');
    }
  };

  // Determinar título e subtítulo baseado no contexto
  const getHeaderInfo = () => {
    if (loadingSalon) {
      return {
        title: 'Carregando...',
        subtitle: 'Verificando salão'
      };
    }

    if (salonData) {
      const displayName = salonData.public_display_name || salonData.name;
      return {
        title: displayName,
        subtitle: 'Faça login para acessar o sistema'
      };
    }

    // Domínio principal ou sem dados do salão
    return {
      title: 'BelaGestão',
      subtitle: 'Entre na sua conta'
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
      <div className="w-full max-w-sm">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            {salonData?.public_profile_photo_url ? (
              <div className="w-20 h-20 overflow-hidden mx-auto mb-6">
                <img 
                  src={salonData.public_profile_photo_url} 
                  alt="Logo do salão"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <img 
                  src="/logos/logo-bela-gestao.png" 
                  alt="BelaGestão" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {salonData ? (salonData.public_display_name || salonData.name) : 'BelaGestão'}
            </h1>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  block w-full px-4 py-3 
                  border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#31338D] focus:border-transparent
                  placeholder-gray-400 text-sm
                  transition-all duration-200
                  bg-gray-50 focus:bg-white
                "
                placeholder="Email"
                disabled={loading || loadingSalon}
              />
            </div>

            {/* Campo Senha */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  block w-full px-4 py-3 
                  border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#31338D] focus:border-transparent
                  placeholder-gray-400 text-sm
                  transition-all duration-200
                  bg-gray-50 focus:bg-white
                "
                placeholder="Senha"
                disabled={loading || loadingSalon}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading || loadingSalon}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 animate-fadeIn">
                <p className="text-sm text-red-700 text-center">{error}</p>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading || loadingSalon}
              className="
                w-full py-3 px-4
                bg-[#31338D] text-white font-semibold rounded-xl
                hover:bg-[#2A2B7A] focus:outline-none focus:ring-2 focus:ring-[#31338D] focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              {(loading || loadingSalon) ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  {loadingSalon ? 'Carregando...' : 'Entrando...'}
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 