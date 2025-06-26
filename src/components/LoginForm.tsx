import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signIn, loading } = useAuth();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-premium-lg rounded-2xl p-8 border border-gray-100">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">BelaGestão</h1>
            <p className="text-gray-600">Entre na sua conta</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    block w-full pl-10 pr-3 py-3 
                    border border-gray-300 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    placeholder-gray-400 text-sm
                    transition-all duration-200
                    bg-gray-50 focus:bg-white
                  "
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    block w-full pl-10 pr-12 py-3 
                    border border-gray-300 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    placeholder-gray-400 text-sm
                    transition-all duration-200
                    bg-gray-50 focus:bg-white
                  "
                  placeholder="Sua senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
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
              disabled={loading}
              className="
                w-full flex items-center justify-center py-3 px-4
                bg-gradient-to-r from-indigo-600 to-indigo-700
                text-white font-semibold rounded-xl
                hover:from-indigo-700 hover:to-indigo-800
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                shadow-lg hover:shadow-xl
                transform hover:translate-y-[-1px]
              "
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Rodapé */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Sistema de Gestão para Salões de Beleza
            </p>
            <p className="text-xs text-gray-400 mt-1">
              © 2024 BelaGestão. Todos os direitos reservados.
            </p>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Problemas para acessar? Entre em contato com o suporte
          </p>
        </div>
      </div>
    </div>
  );
} 