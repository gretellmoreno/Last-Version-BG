import React, { useState } from 'react';
import Scissors from 'lucide-react/dist/esm/icons/scissors';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import { supabase } from '../lib/supabase';

interface CreateSalonPayload {
  ownerEmail: string;
  ownerPassword: string;
  ownerName: string;
  salonName: string;
  subdomain: string;
  phone: string;
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
    ownerName: '',
    salonName: '',
    subdomain: '',
    phone: ''
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

  // Função para formatar telefone
  const formatPhone = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'subdomain') {
      const normalized = normalizeSubdomain(value);
      setFormData(prev => ({ ...prev, [name]: normalized }));
    } else if (name === 'phone') {
      const formatted = formatPhone(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar erros ao começar a digitar
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.ownerName) return 'Nome do proprietário é obrigatório';
    if (!formData.ownerEmail) return 'E-mail é obrigatório';
    if (!formData.ownerEmail.includes('@')) return 'E-mail inválido';
    if (!formData.ownerPassword) return 'Senha é obrigatória';
    if (formData.ownerPassword.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (!formData.salonName) return 'Nome do salão é obrigatório';
    if (!formData.subdomain) return 'Link do sistema é obrigatório';
    if (formData.subdomain.length < 3) return 'Link do sistema deve ter pelo menos 3 caracteres';
    if (!formData.phone) return 'WhatsApp é obrigatório';
    if (formData.phone.replace(/\D/g, '').length < 10) return 'WhatsApp deve ter pelo menos 10 dígitos';
    
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
        
        // Fazer login automático após criação do salão
        try {
          console.log('🔐 Fazendo login automático...');
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: formData.ownerEmail,
            password: formData.ownerPassword
          });
          
          if (authError) {
            console.error('❌ Erro no login automático:', authError);
            // Se falhar o login automático, redirecionar normalmente
            setTimeout(() => {
              if (data.salonUrl) {
                window.location.href = data.salonUrl;
              }
            }, 2000);
          } else {
            console.log('✅ Login automático realizado com sucesso!');
            // Redirecionar imediatamente após login bem-sucedido
            setTimeout(() => {
              if (data.salonUrl) {
                window.location.href = data.salonUrl;
              }
            }, 1000);
          }
        } catch (loginErr) {
          console.error('💥 Erro inesperado no login automático:', loginErr);
          // Fallback: redirecionar normalmente
          setTimeout(() => {
            if (data.salonUrl) {
              window.location.href = data.salonUrl;
            }
          }, 2000);
        }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Salão Criado com Sucesso! 🎉</h2>
          <p className="text-sm text-gray-600 mb-4">
            Seu salão foi configurado e você será logado automaticamente...
          </p>
          <div className="flex items-center justify-center space-x-2 text-purple-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span className="text-xs">Fazendo login automático...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">BelaGestão</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Olá, vamos começar?
          </h2>
          <p className="text-gray-600">
            Configure seu salão em poucos segundos
          </p>
        </div>

        <div className="bg-white rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Proprietário(a) *
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                placeholder="Ex: João da Silva"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="salonName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Salão *
              </label>
              <input
                type="text"
                id="salonName"
                name="salonName"
                value={formData.salonName}
                onChange={handleInputChange}
                placeholder="Ex: Salão da Maria"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-1">
                Link do Sistema *
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="subdomain"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleInputChange}
                  placeholder="salao-da-maria"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  required
                />
                <div className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg text-gray-500 text-xs flex items-center">
                  .belagestao.com
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Este será o endereço do seu salão online
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp*
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(41) 99999-8888"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Seu E-mail *
              </label>
              <input
                type="email"
                id="ownerEmail"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="ownerPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <input
                type="password"
                id="ownerPassword"
                name="ownerPassword"
                value={formData.ownerPassword}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando salão...</span>
                </div>
              ) : (
                'Criar Meu Salão'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            Ao criar sua conta, você aceita nossos termos de serviço e política de privacidade
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketingApp; 