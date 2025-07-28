import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function DefinirSenha() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Detectar sessão e usuário
  useEffect(() => {
    let isSubscribed = true;

    const initializeSession = async () => {
      try {
        // Primeiro, verificar se há tokens na URL
        const hash = window.location.hash;
        if (hash) {
          console.log('🔗 Hash detectado na URL:', hash);
          
          // Limpar a URL para evitar problemas
          window.history.replaceState({}, document.title, '/definir-senha');
        }

        // Verificar sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
          return;
        }

        if (session?.user) {
          console.log('✅ Sessão encontrada:', session.user.email);
          if (isSubscribed) {
            setUser(session.user);
          }
        } else {
          console.log('❌ Nenhuma sessão encontrada, redirecionando para login');
          if (isSubscribed) {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('💥 Erro ao inicializar sessão:', err);
      }
    };

    // Inicializar sessão
    initializeSession();

    // Escutar mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);
      
      if (!isSubscribed) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          console.log('✅ Usuário autenticado:', session.user.email);
          setUser(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('❌ Usuário deslogado, redirecionando');
        navigate('/login');
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Validação do formulário
  const isFormValid = () => {
    return formData.password.length >= 6 && 
           formData.password === formData.confirmPassword;
  };

  // Submeter nova senha
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Atualizando senha do usuário...');
      
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        setError(error.message || 'Erro ao definir senha');
        return;
      }

      console.log('✅ Senha definida com sucesso!');
      toast.success('Senha definida com sucesso! Bem-vindo ao sistema!');
      
      // Redirecionar para o dashboard
      navigate('/agenda');
      
    } catch (err) {
      console.error('💥 Erro inesperado:', err);
      setError('Erro inesperado ao definir senha');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto não detecta usuário
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando convite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Definir Senha</h2>
          <p className="text-gray-600">
            Olá, <span className="font-semibold">{user?.email}</span>! 
            <br />Defina sua senha para acessar o sistema.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nova Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Digite sua nova senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Confirme sua nova senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={!isFormValid() || loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
              isFormValid() && !loading
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Definindo senha...
              </div>
            ) : (
              'Definir Senha e Acessar'
            )}
          </button>
        </form>

        {/* Requisitos da senha */}
        <div className="text-xs text-gray-500 text-center">
          <p>A senha deve ter no mínimo 6 caracteres</p>
        </div>
      </div>
    </div>
  );
} 