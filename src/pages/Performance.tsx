import React, { useState, useEffect } from 'react';
import { TrendingUp, Building, UserCheck, Users, Calendar, BarChart3, DollarSign, Clock, Target } from 'lucide-react';
import Header from '../components/Header';
import PeriodFilterModal from '../components/PeriodFilterModal';

interface PerformanceProps {
  onToggleMobileSidebar?: () => void;
}

interface EstatisticaEmpresa {
  receita: number;
  despesa: number;
  lucro: number;
  dias: number;
  atendimentos: number;
  clientesAtendidos: number;
  horasAtendidas: number;
}

interface ClienteRanking {
  posicao: number;
  nome: string;
  receita: number;
  visitas: number;
  frequencia: string;
}

interface Funcionario {
  id: string;
  nome: string;
}

export default function Performance({ onToggleMobileSidebar }: PerformanceProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('empresa');
  const [periodoSelecionado, setPeriodoSelecionado] = useState('hoje');
  const [tipoRelatorio, setTipoRelatorio] = useState('receita');
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState('');
  
  // Estados de período para cada seção
  const [periodFilterEmpresa, setPeriodFilterEmpresa] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [periodFilterFuncionarios, setPeriodFilterFuncionarios] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [periodFilterClientes, setPeriodFilterClientes] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lista mock de funcionários
  const funcionarios: Funcionario[] = [
    { id: '1', nome: 'Carmen Silva' },
    { id: '2', nome: 'Ana Santos' },
    { id: '3', nome: 'João Pereira' },
    { id: '4', nome: 'Maria Oliveira' }
  ];

  // Dados mock
  const estatisticasEmpresa: EstatisticaEmpresa = {
    receita: 0,
    despesa: 0,
    lucro: 0,
    dias: 1,
    atendimentos: 0,
    clientesAtendidos: 0,
    horasAtendidas: 0
  };

  const dadosClientes = {
    receita: [
      { posicao: 1, nome: 'Bianca', receita: 70.00, visitas: 8, frequencia: 'Semanal' },
      { posicao: 2, nome: 'Vinicius', receita: 35.00, visitas: 5, frequencia: 'Quinzenal' },
      { posicao: 3, nome: 'Gretell', receita: 35.00, visitas: 4, frequencia: 'Mensal' },
      { posicao: 4, nome: 'Ana Costa', receita: 28.50, visitas: 3, frequencia: 'Esporádica' },
      { posicao: 5, nome: 'João Silva', receita: 25.00, visitas: 2, frequencia: 'Esporádica' },
    ],
    visitas: [
      { posicao: 1, nome: 'Bianca', receita: 70.00, visitas: 8, frequencia: 'Semanal' },
      { posicao: 2, nome: 'Vinicius', receita: 35.00, visitas: 5, frequencia: 'Quinzenal' },
      { posicao: 3, nome: 'Gretell', receita: 35.00, visitas: 4, frequencia: 'Mensal' },
      { posicao: 4, nome: 'Ana Costa', receita: 28.50, visitas: 3, frequencia: 'Esporádica' },
      { posicao: 5, nome: 'João Silva', receita: 25.00, visitas: 2, frequencia: 'Esporádica' },
    ],
    frequencia: [
      { posicao: 1, nome: 'Bianca', receita: 70.00, visitas: 8, frequencia: 'Semanal' },
      { posicao: 2, nome: 'Vinicius', receita: 35.00, visitas: 5, frequencia: 'Quinzenal' },
      { posicao: 3, nome: 'Gretell', receita: 35.00, visitas: 4, frequencia: 'Mensal' },
      { posicao: 4, nome: 'Ana Costa', receita: 28.50, visitas: 3, frequencia: 'Esporádica' },
      { posicao: 5, nome: 'João Silva', receita: 25.00, visitas: 2, frequencia: 'Esporádica' },
    ]
  };

  const handleMenuClick = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const formatPeriodDisplay = (period: { start: string; end: string }) => {
    if (period.start === period.end) {
      return formatDate(period.start);
    }
    return `${formatDate(period.start)} - ${formatDate(period.end)}`;
  };

  const handlePeriodApply = (startDate: string, endDate: string) => {
    if (activeTab === 'empresa') {
      setPeriodFilterEmpresa({ start: startDate, end: endDate });
    } else if (activeTab === 'funcionarios') {
      setPeriodFilterFuncionarios({ start: startDate, end: endDate });
    } else if (activeTab === 'clientes') {
      setPeriodFilterClientes({ start: startDate, end: endDate });
    }
  };

  const getCurrentPeriodFilter = () => {
    if (activeTab === 'empresa') return periodFilterEmpresa;
    if (activeTab === 'funcionarios') return periodFilterFuncionarios;
    return periodFilterClientes;
  };

  const getPeriodoTexto = () => {
    switch (periodoSelecionado) {
      case 'hoje':
        return '07/07/2025 - 07/07/2025';
      case 'mes-atual':
        return '01/07/2025 - 07/07/2025';
      case 'semana-atual':
        return '30/06/2025 - 07/07/2025';
      case 'mes-passado':
        return '01/06/2025 - 30/06/2025';
      default:
        return '07/07/2025 - 07/07/2025';
    }
  };

  const getMetricaLabel = () => {
    switch (tipoRelatorio) {
      case 'receita':
        return 'Receita';
      case 'visitas':
        return 'Visitas';
      case 'frequencia':
        return 'Frequência';
      default:
        return 'Receita';
    }
  };

  const getValorMetrica = (cliente: ClienteRanking) => {
    switch (tipoRelatorio) {
      case 'receita':
        return formatCurrency(cliente.receita);
      case 'visitas':
        return `${cliente.visitas} visitas`;
      case 'frequencia':
        return cliente.frequencia;
      default:
        return formatCurrency(cliente.receita);
    }
  };

  const melhoresClientes = dadosClientes[tipoRelatorio as keyof typeof dadosClientes] || dadosClientes.receita;

  const tabs = [
    { id: 'empresa', name: 'Empresa', icon: Building, color: 'from-blue-500 to-blue-600' },
    { id: 'funcionarios', name: 'Funcionários', icon: UserCheck, color: 'from-purple-500 to-purple-600' },
    { id: 'clientes', name: 'Clientes', icon: Users, color: 'from-green-500 to-green-600' }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen">
      <Header 
        title="Performance" 
        onMenuClick={handleMenuClick}
      />
      
      <div className="flex-1 bg-gray-50 overflow-hidden">
        <div className="h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin">
          <div className="p-4 md:p-6">
            
            {/* Tabs Principais */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-gray-200`}>
                <div className="flex items-center mb-4">
                  <TrendingUp className="mr-3 text-emerald-600" size={24} />
                  <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                    Performance da Empresa
                  </h2>
                </div>
                
                {/* Navigation Tabs - Design Simples como na segunda imagem */}
                <div className="bg-gray-100 p-1 rounded-lg">
                  <div className="grid grid-cols-3 gap-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                      >
                        <tab.icon size={16} />
                        <span className={isMobile ? 'hidden sm:inline' : ''}>{tab.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Conteúdo das Tabs */}
              <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                
                {/* Tab Empresa */}
                {activeTab === 'empresa' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Building className="mr-3 text-blue-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-900">Performance da Empresa</h3>
                      </div>
                      
                      {/* Botão de Período */}
                      <button
                        onClick={() => setIsPeriodModalOpen(true)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-left bg-white hover:bg-gray-50 transition-colors text-sm"
                      >
                        <span className="text-gray-700">{formatPeriodDisplay(periodFilterEmpresa)}</span>
                      </button>
                    </div>

                    {/* Resumo do Esforço Expandido */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-6">Resumo esforço do período</h4>
                      <div className={`grid gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar size={20} className="text-purple-600" />
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-purple-600">{estatisticasEmpresa.dias}</span>
                            <p className="text-sm text-gray-700">dias</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Target size={20} className="text-purple-600" />
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-purple-600">{estatisticasEmpresa.atendimentos}</span>
                            <p className="text-sm text-gray-700">atendimentos</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users size={20} className="text-purple-600" />
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-purple-600">{estatisticasEmpresa.clientesAtendidos}</span>
                            <p className="text-sm text-gray-700">clientes atendidos</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock size={20} className="text-purple-600" />
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-purple-600">{estatisticasEmpresa.horasAtendidas}h</span>
                            <p className="text-sm text-gray-700">horas atendidas</p>
                          </div>
                        </div>

                        {/* Métricas Adicionais */}
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <DollarSign size={20} className="text-purple-600" />
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-purple-600">R$ 0</span>
                            <p className="text-sm text-gray-700">receita total</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BarChart3 size={20} className="text-purple-600" />
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-purple-600">R$ 0</span>
                            <p className="text-sm text-gray-700">ticket médio</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUp size={20} className="text-purple-600" />
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-purple-600">0%</span>
                            <p className="text-sm text-gray-700">crescimento</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <UserCheck size={20} className="text-purple-600" />
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-purple-600">0</span>
                            <p className="text-sm text-gray-700">novos clientes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Funcionários */}
                {activeTab === 'funcionarios' && (
                  <div className="space-y-6">
                    <div className="flex items-center mb-6">
                      <UserCheck className="mr-3 text-purple-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">Performance dos Funcionários</h3>
                    </div>

                    {/* Filtros - Funcionário e Período */}
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} mb-6`}>
                      {/* Filtro de Funcionário */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Funcionário
                        </label>
                        <select
                          value={selectedFuncionario}
                          onChange={(e) => setSelectedFuncionario(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                          style={{ fontSize: isMobile ? '16px' : '14px' }}
                        >
                          <option value="">Selecione um funcionário</option>
                          {funcionarios.map((funcionario) => (
                            <option key={funcionario.id} value={funcionario.id}>
                              {funcionario.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Período */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Período
                        </label>
                        <button
                          onClick={() => setIsPeriodModalOpen(true)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-left bg-white hover:bg-gray-50 transition-colors"
                          style={{ fontSize: isMobile ? '16px' : '14px' }}
                        >
                          <span className="text-gray-700">{formatPeriodDisplay(periodFilterFuncionarios)}</span>
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo dos funcionários */}
                    {selectedFuncionario ? (
                      <div className="space-y-6">
                        {/* Layout como na segunda imagem */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Balanço Financeiro do Funcionário */}
                          <div className="bg-gray-50 rounded-xl p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-6">Balanço financeiro no período</h4>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-green-600 mb-2">
                                R$ 140,00
                              </p>
                              <p className="text-sm text-gray-600">receita bruta esperada</p>
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-blue-600 text-sm flex items-center justify-center space-x-1">
                                  <span>Valor com base nos atendimentos realizados pelo profissional no período selecionado.</span>
                                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-xs font-bold">?</span>
                                  </div>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Resumo do Esforço do Funcionário */}
                          <div className="bg-gray-50 rounded-xl p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-6">Resumo esforço do período</h4>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Calendar size={20} className="text-purple-600" />
                                </div>
                                <span className="text-2xl font-bold text-purple-600">30</span>
                                <span className="text-gray-700">dias</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Target size={20} className="text-purple-600" />
                                </div>
                                <span className="text-2xl font-bold text-purple-600">3</span>
                                <span className="text-gray-700">atendimentos</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Users size={20} className="text-purple-600" />
                                </div>
                                <span className="text-2xl font-bold text-purple-600">3</span>
                                <span className="text-gray-700">clientes atendidos</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Clock size={20} className="text-purple-600" />
                                </div>
                                <span className="text-2xl font-bold text-purple-600">2:00</span>
                                <span className="text-gray-700">horas atendidas</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <UserCheck size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Selecione um funcionário
                        </h3>
                        <p className="text-gray-500">
                          Escolha um funcionário para visualizar suas estatísticas de performance
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Clientes */}
                {activeTab === 'clientes' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Users className="mr-3 text-green-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-900">Melhores Clientes</h3>
                      </div>

                      {/* Botão de Período para Clientes */}
                      <button
                        onClick={() => setIsPeriodModalOpen(true)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-left bg-white hover:bg-gray-50 transition-colors text-sm"
                      >
                        <span className="text-gray-700">{formatPeriodDisplay(periodFilterClientes)}</span>
                      </button>
                    </div>

                    {/* Filtro tipo de relatório */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-gray-100 p-1 rounded-lg">
                        <div className="flex gap-1">
                          {[
                            { value: 'receita', label: 'Receita' },
                            { value: 'visitas', label: 'Visitas' },
                            { value: 'frequencia', label: 'Frequência' }
                          ].map((tipo) => (
                            <button
                              key={tipo.value}
                              onClick={() => setTipoRelatorio(tipo.value)}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                tipoRelatorio === tipo.value
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                              }`}
                            >
                              {tipo.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cards de estatísticas compactos */}
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} mb-6`}>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                          <Users size={18} className="text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">Total Clientes</p>
                            <p className="text-lg font-semibold text-gray-900">0</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                          <UserCheck size={18} className="text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Novos Clientes</p>
                            <p className="text-lg font-semibold text-gray-900">0</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lista de melhores clientes */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-4 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-900">
                          Ranking por {getMetricaLabel()}
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {melhoresClientes.map((cliente) => (
                          <div key={cliente.posicao} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-green-600">
                                    {cliente.posicao}º
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{cliente.nome}</p>
                                  <p className="text-sm text-gray-500">{cliente.frequencia}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">
                                  {getValorMetrica(cliente)}
                                </p>
                                {tipoRelatorio === 'receita' && (
                                  <p className="text-sm text-gray-500">
                                    {cliente.visitas} visitas
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Período */}
      <PeriodFilterModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onApply={handlePeriodApply}
        currentPeriod={getCurrentPeriodFilter()}
      />
    </div>
  );
} 