import React, { useState } from 'react';
import Scissors from 'lucide-react/dist/esm/icons/scissors';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Users from 'lucide-react/dist/esm/icons/users';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';

interface CreateSalonPayload {
  ownerEmail: string;
  ownerPassword: string;
  salonName: string;
  subdomain: string;
}

interface CreateSalonResponse {
  success: boolean;
  message: string;
  salonUrl?: string;
}

const MarketingApp: React.FC = () => {
  const [formData, setFormData] = useState<CreateSalonPayload>({
    ownerEmail: '',
    ownerPassword: '',
    salonName: '',
    subdomain: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Função para normalizar o subdomínio
  const normalizeSubdomain = (value: string): string => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início e fim
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'subdomain') {
      const normalized = normalizeSubdomain(value);
      setFormData(prev => ({ ...prev, [name]: normalized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar erros ao começar a digitar
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.ownerEmail) return 'E-mail é obrigatório';
    if (!formData.ownerEmail.includes('@')) return 'E-mail inválido';
    if (!formData.ownerPassword) return 'Senha é obrigatória';
    if (formData.ownerPassword.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (!formData.salonName) return 'Nome do salão é obrigatório';
    if (!formData.subdomain) return 'Subdomínio é obrigatório';
    if (formData.subdomain.length < 3) return 'Subdomínio deve ter pelo menos 3 caracteres';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/criar-salao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(formData)
      });
      
      const data: CreateSalonResponse = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(true);
        // Redirecionar após 2 segundos
        setTimeout(() => {
          if (data.salonUrl) {
            window.location.href = data.salonUrl;
          }
        }, 2000);
      } else {
        setError(data.message || 'Erro desconhecido ao criar salão');
      }
    } catch (err) {
      console.error('Erro ao criar salão:', err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Salão Criado com Sucesso! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Seu salão foi configurado e você será redirecionado em instantes...
          </p>
          <div className="flex items-center justify-center space-x-2 text-indigo-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <span className="text-sm">Redirecionando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="relative bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                BelaGestão
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Marketing Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Gerencie seu salão de beleza com{' '}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  facilidade
                </span>
              </h2>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Sistema completo de gestão para salões de beleza. Agendamentos, clientes, profissionais e muito mais em uma plataforma moderna e intuitiva.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Agendamentos Online</h3>
                  <p className="text-gray-600 text-sm">Permita que seus clientes agendem serviços 24/7</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gestão de Clientes</h3>
                  <p className="text-gray-600 text-sm">Mantenha histórico completo de cada cliente</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Interface Moderna</h3>
                  <p className="text-gray-600 text-sm">Design intuitivo e responsivo para todos dispositivos</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Fácil de Usar</h3>
                  <p className="text-gray-600 text-sm">Configure seu salão em poucos minutos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Crie seu salão agora</h3>
              <p className="text-gray-600 mt-2">Configure sua conta em menos de 2 minutos</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="salonName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Salão *
                </label>
                <input
                  type="text"
                  id="salonName"
                  name="salonName"
                  value={formData.salonName}
                  onChange={handleInputChange}
                  placeholder="Ex: Salão da Maria"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomínio *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleInputChange}
                    placeholder="salao-da-maria"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <div className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 text-sm flex items-center">
                    .localhost:5173
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Este será o endereço do seu salão online
                </p>
              </div>

              <div>
                <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Seu E-mail *
                </label>
                <input
                  type="email"
                  id="ownerEmail"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="ownerPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  id="ownerPassword"
                  name="ownerPassword"
                  value={formData.ownerPassword}
                  onChange={handleInputChange}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Criando salão...</span>
                  </div>
                ) : (
                  'Criar Meu Salão'
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-6">
              Ao criar sua conta, você aceita nossos termos de serviço e política de privacidade
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingApp; 