import React, { useState, useEffect } from 'react';
import { Settings, User, CreditCard, Clock, Building, Mail, Lock, Eye, EyeOff, Save, Edit3, Trash2, Plus, UserCheck } from 'lucide-react';
import Header from '../components/Header';
import TaxaModal from '../components/TaxaModal';
import { useTaxas } from '../contexts/TaxasContext';

interface ConfiguracoesProps {
  onToggleMobileSidebar?: () => void;
}

interface HorarioAtendimento {
  diaSemana: string;
  ativo: boolean;
  horarioInicio: string;
  horarioFim: string;
  temAlmoco: boolean;
  almocoInicio: string;
  almocoFim: string;
}

interface Profissional {
  id: string;
  nome: string;
}

export default function Configuracoes({ onToggleMobileSidebar }: ConfiguracoesProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('usuario');
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Estados para dados do usuário
  const [userData, setUserData] = useState({
    nome: 'João Silva',
    email: 'joao@belagestao.com',
    empresa: 'Salão Bella Vista',
    novaSenha: ''
  });

  // Estados para horários de atendimento
  const [selectedProfissional, setSelectedProfissional] = useState('');
  const [horariosAtendimento, setHorariosAtendimento] = useState<HorarioAtendimento[]>([
    { diaSemana: 'Segunda-feira', ativo: true, horarioInicio: '08:00', horarioFim: '18:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
    { diaSemana: 'Terça-feira', ativo: true, horarioInicio: '08:00', horarioFim: '18:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
    { diaSemana: 'Quarta-feira', ativo: true, horarioInicio: '08:00', horarioFim: '18:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
    { diaSemana: 'Quinta-feira', ativo: true, horarioInicio: '08:00', horarioFim: '18:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
    { diaSemana: 'Sexta-feira', ativo: true, horarioInicio: '08:00', horarioFim: '18:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
    { diaSemana: 'Sábado', ativo: true, horarioInicio: '08:00', horarioFim: '16:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
    { diaSemana: 'Domingo', ativo: false, horarioInicio: '08:00', horarioFim: '16:00', temAlmoco: false, almocoInicio: '', almocoFim: '' }
  ]);

  // Lista mock de profissionais
  const profissionais: Profissional[] = [
    { id: '1', nome: 'Carmen Silva' },
    { id: '2', nome: 'Ana Santos' },
    { id: '3', nome: 'João Pereira' },
    { id: '4', nome: 'Maria Oliveira' }
  ];

  // Context das taxas (migrado do financeiro)
  const { taxas } = useTaxas();
  const [showTaxaModal, setShowTaxaModal] = useState(false);
  const [editingTaxa, setEditingTaxa] = useState<any>(null);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuClick = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  const tabs = [
    { id: 'usuario', name: 'Dados do Usuário', icon: User },
    { id: 'taxas', name: 'Taxas de Pagamento', icon: CreditCard },
    { id: 'horarios', name: 'Horários de Atendimento', icon: Clock }
  ];

  const handleSaveUserData = () => {
    // Aqui implementaria a lógica para salvar os dados do usuário
    console.log('Salvando dados do usuário:', userData);
    alert('Dados salvos com sucesso!');
  };

  const handleSaveHorarios = () => {
    // Aqui implementaria a lógica para salvar os horários do profissional selecionado
    console.log('Salvando horários para profissional:', selectedProfissional, horariosAtendimento);
    alert(`Horários salvos com sucesso para ${getProfissionalName(selectedProfissional)}!`);
  };

  const handleHorarioChange = (index: number, field: string, value: any) => {
    const newHorarios = [...horariosAtendimento];
    newHorarios[index] = { ...newHorarios[index], [field]: value };
    setHorariosAtendimento(newHorarios);
  };

  // Função para carregar horários do profissional selecionado
  const handleProfissionalChange = (profissionalId: string) => {
    setSelectedProfissional(profissionalId);
    // Aqui carregaria os horários específicos do profissional
    // Por enquanto, usar horários padrão
    setHorariosAtendimento([
      { diaSemana: 'Segunda-feira', ativo: true, horarioInicio: '08:00', horarioFim: '18:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
      { diaSemana: 'Terça-feira', ativo: true, horarioInicio: '08:00', horarioFim: '18:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
      { diaSemana: 'Quarta-feira', ativo: true, horarioInicio: '08:00', horarioFim: '18:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
      { diaSemana: 'Quinta-feira', ativo: true, horarioInicio: '08:00', horarioFim: '18:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
      { diaSemana: 'Sexta-feira', ativo: true, horarioInicio: '08:00', horarioFim: '18:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
      { diaSemana: 'Sábado', ativo: true, horarioInicio: '08:00', horarioFim: '16:00', temAlmoco: false, almocoInicio: '', almocoFim: '' },
      { diaSemana: 'Domingo', ativo: false, horarioInicio: '08:00', horarioFim: '16:00', temAlmoco: false, almocoInicio: '', almocoFim: '' }
    ]);
  };

  const getProfissionalName = (id: string) => {
    const prof = profissionais.find(p => p.id === id);
    return prof ? prof.nome : 'Profissional não encontrado';
  };

  const handleEditTaxa = (taxa: any) => {
    setEditingTaxa(taxa);
    setShowTaxaModal(true);
  };

  const handleAddTaxa = () => {
    setEditingTaxa(null);
    setShowTaxaModal(true);
  };

  const handleSaveTaxa = async (taxaData: any) => {
    try {
      // Temporariamente usando console.log até termos as funções corretas do contexto
      console.log('Salvando taxa:', taxaData);
      setShowTaxaModal(false);
      setEditingTaxa(null);
    } catch (error) {
      console.error('Erro ao salvar taxa:', error);
    }
  };

  const handleDeleteTaxa = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta taxa?')) {
      try {
        // Temporariamente usando console.log até termos as funções corretas do contexto
        console.log('Deletando taxa:', id);
      } catch (error) {
        console.error('Erro ao deletar taxa:', error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <Header 
        title="Configurações" 
        onMenuClick={handleMenuClick}
      />
      
      <div className="flex-1 bg-gray-50 overflow-hidden">
        <div className="h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin">
          <div className="p-4 md:p-6">
            {/* Tabs de Navegação */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-gray-200`}>
                <div className="flex items-center mb-4">
                  <Settings className="mr-3 text-gray-600" size={24} />
                  <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                    Configurações do Sistema
                  </h2>
                </div>
                
                {/* Tabs */}
                <div className="bg-gray-100 p-1 rounded-lg mb-6">
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
                {/* Tab Dados do Usuário */}
                {activeTab === 'usuario' && (
                  <div className="space-y-6">
                    <div className="flex items-center mb-6">
                      <User className="mr-3 text-blue-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
                    </div>

                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
                      {/* Nome */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          value={userData.nome}
                          onChange={(e) => setUserData({...userData, nome: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail size={16} className="inline mr-1" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData({...userData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Empresa */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Building size={16} className="inline mr-1" />
                          Nome da Empresa
                        </label>
                        <input
                          type="text"
                          value={userData.empresa}
                          onChange={(e) => setUserData({...userData, empresa: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Seção de Alteração de Senha */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Lock size={20} className="mr-2" />
                        Alterar Senha
                      </h4>
                      
                      <div className="max-w-md">
                        {/* Nova Senha */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nova Senha
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={userData.novaSenha}
                              onChange={(e) => setUserData({...userData, novaSenha: e.target.value})}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Digite sua nova senha"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3"
                            >
                              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botão Salvar */}
                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSaveUserData}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Save size={16} className="mr-2" />
                        Salvar Dados
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab Taxas de Pagamento */}
                {activeTab === 'taxas' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <CreditCard className="mr-3 text-green-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-900">Taxas de Pagamento</h3>
                      </div>
                      <button
                        onClick={handleAddTaxa}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <Plus size={16} className="mr-2" />
                        Nova Taxa
                      </button>
                    </div>

                    {/* Lista de Taxas */}
                    {isMobile ? (
                      <div className="space-y-3">
                        {taxas.map((taxa) => (
                          <div key={taxa.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">{taxa.nome}</h4>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditTaxa(taxa)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTaxa(taxa.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Taxa: {taxa.taxa}%
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              taxa.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {taxa.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Método de Pagamento
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Taxa (%)
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {taxas.map((taxa) => (
                              <tr key={taxa.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">
                                    {taxa.nome}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-900">
                                    {taxa.taxa}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    taxa.ativo
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {taxa.ativo ? 'Ativo' : 'Inativo'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditTaxa(taxa)}
                                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded"
                                    >
                                      <Edit3 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTaxa(taxa.id)}
                                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Horários de Atendimento */}
                {activeTab === 'horarios' && (
                  <div className="space-y-6">
                    <div className="flex items-center mb-6">
                      <Clock className="mr-3 text-purple-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">Horários de Atendimento</h3>
                    </div>

                    {/* Filtro de Profissional */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <UserCheck size={16} className="inline mr-2" />
                        Selecione o Profissional
                      </label>
                      <select
                        value={selectedProfissional}
                        onChange={(e) => handleProfissionalChange(e.target.value)}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                        style={{ fontSize: isMobile ? '16px' : '14px' }}
                      >
                        <option value="">Selecione um profissional</option>
                        {profissionais.map((profissional) => (
                          <option key={profissional.id} value={profissional.id}>
                            {profissional.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Conteúdo dos horários */}
                    {selectedProfissional ? (
                      <div className="space-y-6">
                        {/* Informação do profissional selecionado */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-purple-700 text-sm">
                            Configurando horários para: <strong>{getProfissionalName(selectedProfissional)}</strong>
                          </p>
                        </div>

                        <div className="space-y-4">
                          {horariosAtendimento.map((horario, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              {/* Cabeçalho do dia */}
                              <div className="flex items-center space-x-3 mb-4">
                                <input
                                  type="checkbox"
                                  checked={horario.ativo}
                                  onChange={(e) => handleHorarioChange(index, 'ativo', e.target.checked)}
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className={`font-medium text-lg ${horario.ativo ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {horario.diaSemana}
                                </span>
                                {!horario.ativo && (
                                  <span className="text-sm text-gray-400 italic ml-2">- Fechado</span>
                                )}
                              </div>
                              
                              {/* Configurações do horário quando ativo */}
                              {horario.ativo && (
                                <div className="space-y-3 ml-7">
                                  {/* Layout Ultra Compacto - Tudo em uma linha */}
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="space-y-3">
                                      {/* Linha Principal: Início + Fim + Pausa */}
                                      <div className={`grid gap-4 items-end ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Início
                                          </label>
                                          <input
                                            type="time"
                                            value={horario.horarioInicio}
                                            onChange={(e) => handleHorarioChange(index, 'horarioInicio', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Fim
                                          </label>
                                          <input
                                            type="time"
                                            value={horario.horarioFim}
                                            onChange={(e) => handleHorarioChange(index, 'horarioFim', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                          />
                                        </div>
                                        <div className="flex items-center space-x-2 pb-2">
                                          <input
                                            type="checkbox"
                                            checked={horario.temAlmoco}
                                            onChange={(e) => handleHorarioChange(index, 'temAlmoco', e.target.checked)}
                                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                          />
                                          <label className="text-sm font-medium text-gray-700">
                                            🍽️ Tem pausa para almoço?
                                          </label>
                                        </div>
                                      </div>
                                      
                                      {/* Linha de Almoço (condicional) */}
                                      {horario.temAlmoco && (
                                        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} bg-orange-50 p-3 rounded-lg border border-orange-200`}>
                                          <div>
                                            <label className="block text-sm font-medium text-orange-700 mb-1">
                                              Início do Almoço
                                            </label>
                                            <input
                                              type="time"
                                              value={horario.almocoInicio}
                                              onChange={(e) => handleHorarioChange(index, 'almocoInicio', e.target.value)}
                                              className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white"
                                              placeholder="Ex: 12:00"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-orange-700 mb-1">
                                              Fim do Almoço
                                            </label>
                                            <input
                                              type="time"
                                              value={horario.almocoFim}
                                              onChange={(e) => handleHorarioChange(index, 'almocoFim', e.target.value)}
                                              className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white"
                                              placeholder="Ex: 13:00"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Botão Salvar Horários */}
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                          <button
                            onClick={handleSaveHorarios}
                            className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                          >
                            <Save size={16} className="mr-2" />
                            Salvar Horários
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <UserCheck size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Selecione um profissional
                        </h3>
                        <p className="text-gray-500">
                          Escolha um profissional para configurar seus horários de atendimento
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Taxa */}
      {showTaxaModal && (
        <TaxaModal
          isOpen={showTaxaModal}
          onClose={() => {
            setShowTaxaModal(false);
            setEditingTaxa(null);
          }}
          onSave={handleSaveTaxa}
          editingTaxa={editingTaxa}
        />
      )}
    </div>
  );
} 