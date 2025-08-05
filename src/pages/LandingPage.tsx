import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Settings, 
  Smartphone, 
  Zap, 
  Shield, 
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
  Play
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agendamento Inteligente",
      description: "Sistema de agendamento completo com calendário visual, confirmações automáticas e lembretes personalizados."
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Cadastro completo de clientes, histórico de atendimentos e sistema de fidelidade integrado."
    },
    {
      icon: DollarSign,
      title: "Controle Financeiro",
      description: "Gestão completa de vendas, comissões, taxas e relatórios financeiros detalhados."
    },
    {
      icon: Settings,
      title: "Configurações Avançadas",
      description: "Personalização completa do sistema, horários de funcionamento e configurações de pagamento."
    },
    {
      icon: Smartphone,
      title: "App Mobile",
      description: "Acesso via PWA com funcionalidades offline e sincronização automática de dados."
    },
    {
      icon: Zap,
      title: "Performance Otimizada",
      description: "Sistema rápido e responsivo, otimizado para funcionar em qualquer dispositivo."
    }
  ];

  const benefits = [
    "Agendamento online 24/7",
    "Gestão completa de clientes",
    "Relatórios financeiros detalhados",
    "Sistema de comissões",
    "Lembretes automáticos",
    "App mobile nativo",
    "Suporte técnico especializado",
    "Atualizações gratuitas"
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      salon: "Salão Elegance",
      text: "O BelaGestão revolucionou meu salão. Agora consigo gerenciar tudo de forma muito mais eficiente.",
      rating: 5
    },
    {
      name: "João Santos",
      salon: "Beauty Studio",
      text: "Sistema completo e fácil de usar. Os clientes adoram o agendamento online!",
      rating: 5
    },
    {
      name: "Ana Costa",
      salon: "Hair & Beauty",
      text: "Excelente para controle financeiro. Os relatórios são muito detalhados e úteis.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">BelaGestão</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Entrar
              </Link>
              <Link 
                to="/register"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sistema Completo para
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              {" "}Salões de Beleza
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Gerencie seu salão de forma inteligente com agendamentos online, controle financeiro, 
            gestão de clientes e muito mais. Tudo em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/register"
              className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <span>Começar Agora</span>
              <ArrowRight size={20} />
            </Link>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium">
              <Play size={20} />
              <span>Ver Demonstração</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para seu salão
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sistema completo com todas as funcionalidades essenciais para gerenciar 
              seu negócio de forma profissional e eficiente.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon size={24} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Por que escolher o BelaGestão?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Desenvolvido especificamente para salões de beleza, nosso sistema oferece 
                todas as ferramentas necessárias para impulsionar seu negócio.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Resultados Comprovados
                </h3>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-purple-600">500+</div>
                    <div className="text-sm text-gray-600">Salões Ativos</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">50k+</div>
                    <div className="text-sm text-gray-600">Agendamentos</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">98%</div>
                    <div className="text-sm text-gray-600">Satisfação</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Salões que confiam no BelaGestão para gerenciar seus negócios
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.salon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para transformar seu salão?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Comece hoje mesmo e veja a diferença que o BelaGestão pode fazer no seu negócio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Começar Grátis
            </Link>
            <Link 
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="text-xl font-bold">BelaGestão</span>
              </div>
              <p className="text-gray-400">
                Sistema completo para gerenciamento de salões de beleza.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Recursos</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Demonstração</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Documentação</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreiras</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BelaGestão. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 