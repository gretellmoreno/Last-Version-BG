import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Scissors from 'lucide-react/dist/esm/icons/scissors';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
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
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateSalonPayload>({
    ownerEmail: '',
    ownerPassword: '',
    ownerName: '',
    salonName: '',
    subdomain: '',
    phone: ''
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Detectar rolagem com transição mais suave
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const threshold = 50; // Começar o efeito após 50px de rolagem
      
      if (scrollTop > threshold) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
      
      // Limpar timeout anterior
      clearTimeout(scrollTimeout);
      
      // Resetar após 300ms sem rolagem (mais tempo para transição suave)
      scrollTimeout = setTimeout(() => {
        if (window.pageYOffset <= threshold) {
          setIsScrolling(false);
        }
      }, 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

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
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar erros ao começar a digitar
    if (error) setError(null);
  };

  const validateStep = (step: number): string | null => {
    switch (step) {
      case 1:
        if (!formData.ownerName) return 'Nome do proprietário é obrigatório';
        if (!formData.salonName) return 'Nome do salão é obrigatório';
        break;
      case 2:
        if (!formData.subdomain) return 'Link do sistema é obrigatório';
        if (formData.subdomain.length < 3) return 'Link do sistema deve ter pelo menos 3 caracteres';
        if (!formData.phone) return 'WhatsApp é obrigatório';
        if (formData.phone.replace(/\D/g, '').length < 10) return 'WhatsApp deve ter pelo menos 10 dígitos';
        break;
      case 3:
        if (!formData.ownerEmail) return 'E-mail é obrigatório';
        if (!formData.ownerEmail.includes('@')) return 'E-mail inválido';
        if (!formData.ownerPassword) return 'Senha é obrigatória';
        if (formData.ownerPassword.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
        if (!confirmPassword) return 'Confirme sua senha';
        if (formData.ownerPassword !== confirmPassword) return 'As senhas não coincidem';
        break;
    }
    return null;
  };

  const handleNextStep = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateStep(currentStep);
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
        
        // --- MELHORIA: Login automático mais robusto ---
        try {
          console.log('🔐 Iniciando login automático...');
          
          // 1. Tentar fazer login com as credenciais fornecidas
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: formData.ownerEmail,
            password: formData.ownerPassword
          });
          
          // 2. Verificar se o login foi bem-sucedido
          if (authError) {
            console.error('❌ Erro no login automático:', authError);
            throw authError;
          }
          
          // 3. Verificar se temos uma sessão válida
          if (authData.user && authData.session) {
            console.log('✅ Login automático realizado com sucesso!');
            console.log('👤 Usuário logado:', authData.user.email);
            
            // 4. Redirecionar para a agenda após a tela de sucesso ser exibida
            setTimeout(() => {
              console.log('🚀 Redirecionando para /agenda...');
              navigate('/agenda', { replace: true });
            }, 3000); // 3 segundos para mostrar a tela de sucesso
            
          } else if (authData.user && !authData.session) {
            // 5. Caso de confirmação de e-mail necessária
            console.log('📧 Usuário criado mas precisa confirmar e-mail');
            setError('Cadastro realizado! Por favor, verifique seu e-mail para confirmar sua conta.');
            setSuccess(false);
            
          } else {
            // 6. Caso inesperado
            throw new Error('Ocorreu um erro inesperado durante o login automático.');
          }
          
        } catch (loginErr) {
          console.error('💥 Erro inesperado no login automático:', loginErr);
          
          // Fallback: redirecionar para a URL do salão se disponível
          if (data.salonUrl) {
            console.log('🔄 Fallback: redirecionando para URL do salão...');
            setTimeout(() => {
              window.location.href = data.salonUrl!;
            }, 2000);
          } else {
            // Se não há URL do salão, redirecionar para agenda
            setTimeout(() => {
              navigate('/agenda', { replace: true });
            }, 2000);
          }
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

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Olá, vamos começar?';
      case 2:
        return 'Configure seu salão';
      case 3:
        return 'Crie sua conta';
      default:
        return '';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return 'Nos fale sobre você';
      case 2:
        return 'Dados do seu negócio';
      case 3:
        return 'Dados de acesso';
      default:
        return '';
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Salão Criado com Sucesso! 🥳</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header integrado com logo */}
      <header className={`bg-white z-50 transition-all duration-500 ease-in-out ${
        isScrolling 
          ? 'shadow-xl backdrop-blur-lg bg-white/90' 
          : 'shadow-none backdrop-blur-none bg-white'
      }`}>
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <img 
              src="/logos/logo-bela-gestao.png" 
              alt="BelaGestão" 
              className="w-24 h-20"
            />
          </div>
        </div>
      </header>

      {/* Conteúdo principal - ajustado para ficar mais próximo do topo */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getStepTitle()}
            </h2>
            <p className="text-gray-600">
              {getStepSubtitle()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <form onSubmit={currentStep === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
              {/* Step 1: Dados Pessoais */}
              {currentStep === 1 && (
                <>
                  <div>
                    <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Qual é o seu nome? *
                    </label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="Ex: João da Silva"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#31338D] focus:border-transparent text-sm"
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#31338D] focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 2: Dados do Negócio */}
              {currentStep === 2 && (
                <>
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
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-[#31338D] focus:border-transparent text-sm"
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
                      Qual é o número do seu WhatsApp? *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(41) 99999-8888"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#31338D] focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 3: Dados de Acesso */}
              {currentStep === 3 && (
                <>
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#31338D] focus:border-transparent text-sm"
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#31338D] focus:border-transparent text-sm"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Digite a senha novamente"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#31338D] focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-xs">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm"
                  >
                    Voltar
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 bg-[#31338D] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#2A2B7A] focus:ring-2 focus:ring-[#31338D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm flex items-center justify-center space-x-2 ${currentStep > 1 ? 'flex-1' : 'w-full'}`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Criando salão...</span>
                    </>
                  ) : (
                    <>
                      <span>{currentStep === 3 ? 'Confirmar' : 'Próximo'}</span>
                      {currentStep < 3 && <ArrowRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-3 mt-6">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  step === currentStep
                    ? 'bg-[#31338D] shadow-md'
                    : step < currentStep
                    ? 'bg-[#31338D]/60'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingApp; 