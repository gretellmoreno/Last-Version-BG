import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    salonName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de registro
    console.log('Registro:', formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const features = [
    "Agendamento online 24/7",
    "Gestão completa de clientes",
    "Relatórios financeiros detalhados",
    "App mobile nativo",
    "Suporte técnico especializado",
    "Atualizações gratuitas"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">BelaGestão</span>
            </Link>
            <Link 
              to="/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Formulário */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={20} className="mr-2" />
                Voltar para página inicial
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Comece sua jornada
              </h1>
              <p className="text-gray-600">
                Crie sua conta e transforme seu salão em um negócio digital
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Salão
                </label>
                <input
                  type="text"
                  value={formData.salonName}
                  onChange={(e) => handleInputChange('salonName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Ex: Salão Elegance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Digite a senha novamente"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showConfirmPassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  Concordo com os{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                    Política de Privacidade
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors"
              >
                Criar Conta Grátis
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  Fazer login
                </Link>
              </p>
            </div>
          </div>

          {/* Benefícios */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tudo que você precisa para seu salão
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                O BelaGestão oferece todas as ferramentas necessárias para 
                transformar seu salão em um negócio digital e profissional.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">
                Comece grátis hoje
              </h3>
              <p className="text-purple-100">
                Teste todas as funcionalidades por 14 dias sem compromisso. 
                Não é necessário cartão de crédito.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 