import React from 'react';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  BarChart3, 
  Smartphone, 
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  X
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const [isAnnual, setIsAnnual] = React.useState(true);
  const [isScrolling, setIsScrolling] = React.useState(false);

  // Detectar rolagem com transição mais suave
  React.useEffect(() => {
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

  // Pricing logic
  const plans = [
    {
      name: 'Individual',
      description: 'Até 1 usuário',
      monthlyPrice: 15.84, // Para dar 12x de 9,90 no anual (118.8 anual / 12 = 9.90)
      features: ['50 agendamentos/mês', '500 clientes', '1 GB de armazenamento', 'Suporte via chat + tutoriais', 'Implementação gratuita'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      name: 'Dupla',
      description: 'Até 2 usuários',
      monthlyPrice: 27.5,
      features: ['100 agendamentos/mês', '1.000 clientes', '2 GB de armazenamento', 'Suporte via chat + tutoriais', 'Implementação gratuita'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M17 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 21v-2a4 4 0 0 1 3-3.87" stroke="currentColor" strokeWidth="2"/>
          <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <circle cx="17" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      name: 'Equipe',
      description: 'De 3 a 5 usuários',
      monthlyPrice: 42.5,
      features: ['250 agendamentos/mês', '2.500 clientes', '5 GB de armazenamento', 'Suporte via chat + tutoriais', 'Implementação gratuita'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      name: 'Expansão',
      description: 'De 6 a 10 usuários',
      monthlyPrice: 51.84,
      features: ['500 agendamentos/mês', '5.000 clientes', '10 GB de armazenamento', 'Suporte via chat + tutoriais', 'Implementação gratuita'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  const getPrice = (monthlyPrice: number) => {
    if (isAnnual) {
      const annualTotal = monthlyPrice * 12 * 0.75; // 25% discount
      const installmentPrice = annualTotal / 12;
      return {
        total: annualTotal,
        installment: installmentPrice,
        showInstallment: true
      };
    } else {
      return {
        total: monthlyPrice,
        installment: monthlyPrice,
        showInstallment: false
      };
    }
  };

  const features = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Sistema completo de agendamentos com confirmações automáticas"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Cadastro completo com histórico e preferências"
    },
    {
      icon: CreditCard,
      title: "Controle Financeiro",
      description: "Relatórios de vendas e comissões em tempo real"
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Dashboards com métricas de performance"
    },
    {
      icon: Smartphone,
      title: "App Mobile",
      description: "Acesse tudo pelo celular, onde estiver"
    },
    {
      icon: Zap,
      title: "Automação",
      description: "WhatsApp integrado com lembretes automáticos"
    }
  ];

  const benefits = [
    "Interface intuitiva e fácil de usar",
    "Suporte técnico especializado",
    "Atualizações constantes sem custo adicional",
    "Backup automático na nuvem",
    "Integração com WhatsApp",
    "Relatórios personalizáveis"
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Proprietária",
      salon: "Salão Bella Vita",
      content: "O BelaGestão transformou completamente a organização do meu salão. Agora tenho controle total sobre agendamentos e finanças.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Gerente",
      salon: "Studio Beauty",
      content: "A automação do WhatsApp economizou horas do meu dia. Os clientes adoram receber lembretes automáticos!",
      rating: 5
    },
    {
      name: "Juliana Santos",
      role: "Proprietária", 
      salon: "Espaço Glamour",
      content: "Os relatórios são incríveis! Consigo ver exatamente qual serviço é mais rentável e planejar melhor meu negócio.",
      rating: 5
    },
    {
      name: "Carlos Eduardo",
      role: "Proprietário",
      salon: "Barbearia Moderna",
      content: "Desde que comecei a usar o BelaGestão, minha agenda nunca mais ficou bagunçada. Sistema muito intuitivo!",
      rating: 5
    },
    {
      name: "Fernanda Lima",
      role: "Cabeleireira",
      salon: "Hair Design",
      content: "O app mobile é fantástico! Consigo ver minha agenda e atender clientes mesmo quando estou fora do salão.",
      rating: 5
    },
    {
      name: "Roberto Alves",
      role: "Gerente",
      salon: "Salão Premium",
      content: "A gestão financeira ficou muito mais simples. Consigo acompanhar o faturamento diário em tempo real.",
      rating: 5
    },
    {
      name: "Patrícia Rocha",
      role: "Proprietária",
      salon: "Estúdio Elegance",
      content: "Meus clientes elogiam sempre os lembretes automáticos. Diminuiu muito o número de faltas nos agendamentos.",
      rating: 5
    },
    {
      name: "Diego Martins",
      role: "Barbeiro",
      salon: "Corte & Estilo",
      content: "Sistema muito completo e fácil de usar. Recomendo para todos os profissionais da área!",
      rating: 5
    },
    {
      name: "Camila Santos",
      role: "Esteticista",
      salon: "Clínica Renovar",
      content: "O controle de estoque é perfeito! Nunca mais fiquei sem produtos essenciais para os tratamentos.",
      rating: 5
    }
  ];

  // Video Modal Component
  const VideoModal = () => {
    if (!isVideoModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="relative w-full max-w-4xl mx-4">
          {/* Close button */}
          <button
            onClick={() => setIsVideoModalOpen(false)}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200"
          >
            <X size={32} />
          </button>
          
          {/* Video container */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&rel=0&modestbranding=1"
                title="Como funciona o BelaGestão - COMPLETO!"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            
            {/* Floating create account button */}
            <div className="absolute bottom-6 right-6">
              <button
                onClick={() => window.location.href = 'https://app.belagestao.com'}
                className="bg-[#31338D] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#2A2B7A] transition-colors duration-200 shadow-lg flex items-center space-x-2"
              >
                <Zap size={16} />
                <span>Criar conta grátis</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 bg-white z-50 transition-all duration-500 ease-in-out ${
        isScrolling 
          ? 'shadow-xl backdrop-blur-lg bg-white/90' 
          : 'shadow-none backdrop-blur-none bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="/logos/logo-bela-gestao.png" 
                alt="BelaGestão" 
                className="w-24 h-20"
              />
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#recursos" className="text-gray-600 hover:text-gray-900 font-medium">Recursos</a>
              <a href="#planos" className="text-gray-600 hover:text-gray-900 font-medium">Planos</a>
              <a href="#demonstracoes" className="text-gray-600 hover:text-gray-900 font-medium">Demonstrações</a>
              <a href="#blog" className="text-gray-600 hover:text-gray-900 font-medium">Blog</a>
              <a href="#contato" className="text-gray-600 hover:text-gray-900 font-medium">Trabalhe conosco</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = 'https://app.belagestao.com'}
                className="hidden lg:flex border border-[#31338D] text-[#31338D] bg-white px-6 py-2 rounded-full font-medium hover:bg-[#31338D] hover:text-white transition-all duration-200"
              >
                <span>Já sou cliente</span>
              </button>
              <button
                onClick={() => window.location.href = 'https://app.belagestao.com'}
                className="bg-[#31338D] text-white px-6 py-2 rounded-full font-medium hover:bg-[#2A2B7A] transition-all duration-200 shadow-sm"
              >
                CONHEÇA GRÁTIS
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Tag */}
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#31338D]/20 bg-[#31338D]/5 text-[#31338D] text-sm font-medium mb-8">
              Gestão 360° para salões
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              O sistema #1 para<br />
              <span className="text-[#31338D]">salões de beleza</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Faça parte dos 12.324 profissionais de beleza que transformaram seus<br />
              salões, otimizaram rotinas e aumentaram resultados com o BelaGestão.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => window.location.href = 'https://app.belagestao.com'}
                className="bg-[#31338D] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#2A2B7A] transition-all duration-200 flex items-center space-x-2"
              >
                <Zap size={20} />
                <span>Criar conta grátis</span>
              </button>
              <button 
                onClick={() => setIsVideoModalOpen(true)}
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
              >
                <Play size={20} />
                <span>Veja em ação</span>
              </button>
            </div>

            {/* Dashboard Preview */}
            <div className="relative max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="bg-white rounded-lg px-4 py-1 text-sm text-gray-600">
                        app.belagestao.com
                      </div>
                    </div>
                  </div>
                </div>
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-white p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Calendar */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Agenda</h3>
                        <div className="text-xs text-gray-500">Agosto 2025</div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-[#31338D]/10 rounded-lg p-3 border-l-4 border-[#31338D]">
                          <div className="text-sm font-medium text-gray-900">Maria Silva</div>
                          <div className="text-xs text-gray-600">Corte + Escova - 14:30</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                          <div className="text-sm font-medium text-gray-900">João Santos</div>
                          <div className="text-xs text-gray-600">Barba - 15:00</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                          <div className="text-sm font-medium text-gray-900">Ana Costa</div>
                          <div className="text-xs text-gray-600">Manicure - 16:30</div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Visão Geral</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Faturamento</span>
                            <span className="text-sm font-medium text-green-600">+12%</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">R$ 8.450</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#31338D] h-2 rounded-full w-3/4"></div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Agendamentos Hoje</div>
                          <div className="text-xl font-bold text-gray-900">24</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Clientes Ativos</div>
                          <div className="text-xl font-bold text-gray-900">156</div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile App */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-center">
                      <div className="w-32 h-56 bg-gray-900 rounded-2xl relative overflow-hidden">
                        <div className="absolute inset-2 bg-white rounded-xl">
                          <div className="p-3">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-6 h-6 bg-[#31338D] rounded-lg"></div>
                              <div className="text-xs font-medium">BelaGestão</div>
                            </div>
                            <div className="space-y-2">
                              <div className="bg-gray-100 rounded-lg h-8"></div>
                              <div className="bg-gray-100 rounded-lg h-6"></div>
                              <div className="bg-[#31338D]/20 rounded-lg h-6"></div>
                              <div className="bg-gray-100 rounded-lg h-6"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Somos um sistema tudo-em-um que resolve a sua gestão
              </h2>
            </div>
            
            {/* Right Content */}
            <div className="lg:pt-8">
              <p className="text-lg text-gray-600 leading-relaxed">
                Além de integração entre os módulos, o BelaGestão conta com
                uma assistente virtual guiada por IA que automatiza a sua rotina.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {/* Row 1 */}
            <div className="group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#31338D]/10 transition-colors duration-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-[#31338D] transition-colors duration-200">
                    <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="m3 10 9 5 9-5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 3h8v4H8z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Agenda inteligente</h3>
                  <p className="text-gray-600 text-sm">Acesso na palma da mão</p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#31338D]/10 transition-colors duration-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-[#31338D] transition-colors duration-200">
                    <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2"/>
                    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Atendimentos</h3>
                  <p className="text-gray-600 text-sm">Salvamento na nuvem</p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#31338D]/10 transition-colors duration-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-[#31338D] transition-colors duration-200">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2"/>
                    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Injetáveis</h3>
                  <p className="text-gray-600 text-sm">Planejador digital</p>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#31338D]/10 transition-colors duration-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-[#31338D] transition-colors duration-200">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Odontograma digital</h3>
                  <p className="text-gray-600 text-sm">Tecnologia e segurança</p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#31338D]/10 transition-colors duration-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-[#31338D] transition-colors duration-200">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Prescrição digital</h3>
                  <p className="text-gray-600 text-sm">Agilidade e segurança</p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#31338D]/10 transition-colors duration-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-[#31338D] transition-colors duration-200">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 8h6" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 16h6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Financeiro integrado</h3>
                  <p className="text-gray-600 text-sm">Relatórios em segundos</p>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#31338D]/10 transition-colors duration-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-[#31338D] transition-colors duration-200">
                    <path d="M3 3h18v18H3zM9 9h6v6H9z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 1v6M15 1v6M9 17v6M15 17v6M1 9h6M1 15h6M17 9h6M17 15h6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendas</h3>
                  <p className="text-gray-600 text-sm">Rankings e orçamentos</p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#31338D]/10 transition-colors duration-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-[#31338D] transition-colors duration-200">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73L12 2 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Estoque</h3>
                  <p className="text-gray-600 text-sm">Controle e alertas</p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#31338D]/10 transition-colors duration-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-[#31338D] transition-colors duration-200">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing</h3>
                  <p className="text-gray-600 text-sm">Materiais customizáveis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Tag */}
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#31338D]/20 bg-[#31338D]/5 text-[#31338D] text-sm font-medium mb-8">
              Investimento
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Planos sob<br />
              medida para você
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Opções personalizadas para atender as demandas do seu salão ou consultório.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 font-medium rounded-lg transition-all duration-200 ${
                  !isAnnual 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensal
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 font-medium rounded-lg transition-all duration-200 relative ${
                  isAnnual 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Anual
                {isAnnual && (
                  <span className="absolute -top-2 -right-2 bg-[#31338D] text-white text-xs px-2 py-1 rounded-full">
                    25% OFF
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div key={`plan-${index}`} className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#31338D]/30 group">
                {/* Popular badge for second plan */}
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#31338D] text-white px-4 py-1 rounded-full text-xs font-semibold">
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  {/* Plan name with icon */}
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#31338D] to-[#2A2B7A] rounded-lg flex items-center justify-center">
                      <div className="scale-75">
                        {plan.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-8">{plan.description}</p>
                  
                  {/* Price */}
                  <div className="mb-8">
                    {getPrice(plan.monthlyPrice).showInstallment && (
                      <div className="text-sm text-gray-500 mb-2">12x de</div>
                    )}
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      R$ {getPrice(plan.monthlyPrice).installment.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isAnnual ? '' : 'mensal'}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <div key={`feature-${fIndex}`} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-[#31338D]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={14} className="text-[#31338D]" />
                      </div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button 
                  onClick={() => window.location.href = 'https://app.belagestao.com'}
                  className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    index === 1 
                      ? 'bg-[#31338D] text-white hover:bg-[#2A2B7A] shadow-lg hover:shadow-xl' 
                      : 'bg-gray-50 text-gray-900 hover:bg-[#31338D] hover:text-white border border-gray-200 hover:border-[#31338D]'
                  }`}
                >
                  Assinar agora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Motivos para Assinar */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Tag */}
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-[#31338D]/20 bg-[#31338D]/5 text-[#31338D] text-sm font-medium mb-8">
              Diferenciais
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Motivos para assinar<br />
              o BelaGestão
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Por que o BelaGestão é a escolha certa para seu salão?
            </p>
          </div>

          {/* Infinite Scroll Container with Gradients */}
          <div className="relative overflow-hidden">
            <div className="flex space-x-6" style={{
              animation: 'smoothScroll 60s linear infinite',
              width: 'max-content'
            }}>
              {/* First Set */}
              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Agenda Inteligente
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sistema de agendamento completo com calendário visual, confirmações automáticas via WhatsApp e gestão de horários por profissional
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Gestão de Clientes
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Cadastro completo com histórico de atendimentos, preferências, aniversários e sistema de fidelização para aumentar o retorno
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Controle Financeiro
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Gestão completa de vendas, comissões, relatórios de fechamento de caixa e controle de produtos e serviços
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Relatórios Avançados
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Dashboards com métricas de performance, faturamento por período, ranking de serviços e análise de crescimento
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Smartphone size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  App PWA
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Aplicativo web progressivo que funciona offline, com notificações push e interface otimizada para mobile
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Automação WhatsApp
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Lembretes automáticos, confirmações de agendamento e sistema de marketing direto via WhatsApp integrado
                </p>
              </div>

              {/* Second Set - Duplicate for seamless loop */}
              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Agenda Inteligente
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sistema de agendamento completo com calendário visual, confirmações automáticas via WhatsApp e gestão de horários por profissional
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Gestão de Clientes
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Cadastro completo com histórico de atendimentos, preferências, aniversários e sistema de fidelização para aumentar o retorno
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Controle Financeiro
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Gestão completa de vendas, comissões, relatórios de fechamento de caixa e controle de produtos e serviços
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Relatórios Avançados
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Dashboards com métricas de performance, faturamento por período, ranking de serviços e análise de crescimento
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Smartphone size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  App PWA
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Aplicativo web progressivo que funciona offline, com notificações push e interface otimizada para mobile
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Automação WhatsApp
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Lembretes automáticos, confirmações de agendamento e sistema de marketing direto via WhatsApp integrado
                </p>
              </div>

              {/* Third Set - Additional for perfect seamless loop */}
              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Agenda Inteligente
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sistema de agendamento completo com calendário visual, confirmações automáticas via WhatsApp e gestão de horários por profissional
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Gestão de Clientes
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Cadastro completo com histórico de atendimentos, preferências, aniversários e sistema de fidelização para aumentar o retorno
                </p>
              </div>

              <div className="flex-shrink-0 w-80 bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:border-[#31338D] transition-colors duration-300 group">
                <div className="w-16 h-16 bg-[#31338D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Controle Financeiro
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Gestão completa de vendas, comissões, relatórios de fechamento de caixa e controle de produtos e serviços
                </p>
              </div>
            </div>
            
            {/* Left Fade Gradient */}
            <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none"></div>
            
            {/* Right Fade Gradient */}
            <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none"></div>
          </div>
        </div>

        {/* Global CSS for smooth infinite scroll */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes smoothScroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(calc(-33.333% - 8px));
              }
            }
          `
        }} />
      </section>

      {/* DNA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Inovar está no<br />
            nosso DNA
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estamos sempre evoluindo para oferecer as melhores soluções<br />
            para o seu salão de beleza crescer e se destacar no mercado.
          </p>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#31338D] to-[#2A2B7A] rounded-3xl p-12 lg:p-16 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-white">
                <h2 className="text-4xl lg:text-5xl font-bold mb-12 leading-tight">
                  Teste agora mesmo, sem<br />
                  necessidade de cartão!
                </h2>
                <button 
                  onClick={() => window.location.href = 'https://app.belagestao.com'}
                  className="inline-flex items-center px-8 py-4 bg-white text-[#31338D] rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Zap className="mr-2" size={20} />
                  Teste grátis!
                </button>
              </div>

              {/* Right Content - Dashboard Image Placeholder */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  {/* Browser Header */}
                  <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600">
                      belagestao.com/agenda
                    </div>
                  </div>
                  
                  {/* Dashboard Preview - Replace this div with your actual image */}
                  <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Substitua por sua imagem real aqui</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Milhares de profissionais já transformaram seus salões com o BelaGestão
            </p>
          </div>

          {/* Infinite Scroll Container with Gradients */}
          <div className="relative overflow-hidden">
            <div className="flex space-x-6" style={{
              animation: 'smoothScrollTestimonials 50s linear infinite',
              width: 'max-content'
            }}>
              {/* First Set */}
              {testimonials.map((testimonial, index) => (
                <div key={`first-${index}`} className="flex-shrink-0 w-96 bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-[#31338D] transition-colors duration-300 group">
                  <div className="flex space-x-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 min-h-[4rem]">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-[#31338D] font-medium">{testimonial.salon}</div>
                  </div>
                </div>
              ))}

              {/* Second Set - Duplicate for seamless loop */}
              {testimonials.map((testimonial, index) => (
                <div key={`second-${index}`} className="flex-shrink-0 w-96 bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-[#31338D] transition-colors duration-300 group">
                  <div className="flex space-x-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 min-h-[4rem]">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-[#31338D] font-medium">{testimonial.salon}</div>
                  </div>
                </div>
              ))}

              {/* Third Set - Additional for perfect seamless loop */}
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <div key={`third-${index}`} className="flex-shrink-0 w-96 bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-[#31338D] transition-colors duration-300 group">
                  <div className="flex space-x-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 min-h-[4rem]">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-[#31338D] font-medium">{testimonial.salon}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Left Fade Gradient */}
            <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none"></div>
            
            {/* Right Fade Gradient */}
            <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none"></div>
          </div>
        </div>

        {/* Global CSS for smooth infinite scroll */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes smoothScrollTestimonials {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(calc(-33.333% - 8px));
              }
            }
          `
        }} />
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#31338D]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para transformar seu salão?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se a milhares de profissionais que já revolucionaram seus negócios
          </p>
          <button
            onClick={() => window.location.href = 'https://app.belagestao.com'}
            className="bg-white text-[#31338D] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200"
          >
            Criar Meu Salão - Grátis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img 
              src="/logos/logo-bela-gestao.png" 
              alt="BelaGestão" 
              className="w-20 h-16 mx-auto mb-4"
            />
            <p className="text-gray-400">
              © 2024 BelaGestão. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <VideoModal />
    </div>
  );
};

export default LandingPage; 