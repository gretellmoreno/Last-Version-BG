import React, { useState, useEffect } from 'react';
import { Settings, User, CreditCard, Clock, Building, Mail, Lock, Eye, EyeOff, Save, Edit3, Trash2, Plus, UserCheck, Bell } from 'lucide-react';
import Header from '../components/Header';
import TaxaModal from '../components/TaxaModal';
import { TaxasProvider, useTaxas } from '../contexts/TaxasContext';

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

function ConfiguracoesContent({ onToggleMobileSidebar }: ConfiguracoesProps) {
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
  const [horariosAtendimento, setHorariosAtendimento] = useState([
    { diaSemana: 'Segunda-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
    { diaSemana: 'Terça-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
    { diaSemana: 'Quarta-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
    { diaSemana: 'Quinta-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
    { diaSemana: 'Sexta-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
    { diaSemana: 'Sábado', ativo: true, turnos: [{ inicio: '08:00', fim: '16:00' }] },
    { diaSemana: 'Domingo', ativo: false, turnos: [{ inicio: '08:00', fim: '16:00' }] },
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

  // Estados para animação de sucesso
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Função para exibir o modal de sucesso:
  const showSuccessModal = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 800);
  };

  // Estados para o novo conteúdo da aba 'lembrete'
  const [lembreteSaudacao, setLembreteSaudacao] = useState('Oi #{cliente}, tudo bem?');
  const [lembreteDespedida, setLembreteDespedida] = useState('Obrigado.');
  const [mostrarValorServico, setMostrarValorServico] = useState(false);
  const [modoAvancadoLembrete, setModoAvancadoLembrete] = useState(false);
  const [lembreteMensagem, setLembreteMensagem] = useState('Oi #{cliente}, tudo bem?\nEste é um lembrete para o seu atendimento, #{data_horario}.\nServiço: #{servico}\nObrigado.');
  const [showVariaveisModal, setShowVariaveisModal] = useState(false);

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
    { id: 'horarios', name: 'Horários de Atendimento', icon: Clock },
    { id: 'lembrete', name: 'Configurar Lembrete', icon: Bell },
  ];

  const handleSaveUserData = () => {
    // Aqui implementaria a lógica para salvar os dados do usuário
    console.log('Salvando dados do usuário:', userData);
    showSuccessModal('Dados salvos com sucesso!');
  };

  const handleSaveHorarios = () => {
    // Aqui implementaria a lógica para salvar os horários do profissional selecionado
    console.log('Salvando horários para profissional:', selectedProfissional, horariosAtendimento);
    alert(`Horários salvos com sucesso para ${getProfissionalName(selectedProfissional)}!`);
  };

  const handleTurnoChange = (diaIndex: number, turnoIndex: number, field: 'inicio' | 'fim', value: string) => {
    const newHorarios = [...horariosAtendimento];
    newHorarios[diaIndex].turnos[turnoIndex][field] = value;
    setHorariosAtendimento(newHorarios);
  };
  const handleAddTurno = (diaIndex: number) => {
    const newHorarios = [...horariosAtendimento];
    newHorarios[diaIndex].turnos.push({ inicio: '', fim: '' });
    setHorariosAtendimento(newHorarios);
  };
  const handleRemoveTurno = (diaIndex: number, turnoIndex: number) => {
    const newHorarios = [...horariosAtendimento];
    newHorarios[diaIndex].turnos.splice(turnoIndex, 1);
    setHorariosAtendimento(newHorarios);
  };
  const handleDiaAtivoChange = (diaIndex: number, value: boolean) => {
    const newHorarios = [...horariosAtendimento];
    newHorarios[diaIndex].ativo = value;
    setHorariosAtendimento(newHorarios);
  };

  // Função para carregar horários do profissional selecionado
  const handleProfissionalChange = (profissionalId: string) => {
    setSelectedProfissional(profissionalId);
    // Aqui carregaria os horários específicos do profissional
    // Por enquanto, usar horários padrão
    setHorariosAtendimento([
      { diaSemana: 'Segunda-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
      { diaSemana: 'Terça-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
      { diaSemana: 'Quarta-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
      { diaSemana: 'Quinta-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
      { diaSemana: 'Sexta-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
      { diaSemana: 'Sábado', ativo: true, turnos: [{ inicio: '08:00', fim: '16:00' }] },
      { diaSemana: 'Domingo', ativo: false, turnos: [{ inicio: '08:00', fim: '16:00' }] },
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

  // Função para inserir variável no cursor do textarea
  function inserirVariavelNoCursor(variavel: string) {
    const textarea = document.getElementById('lembrete-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = lembreteMensagem.substring(0, start);
      const after = lembreteMensagem.substring(end);
      setLembreteMensagem(before + variavel + after);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + variavel.length;
      }, 0);
    } else {
      setLembreteMensagem(lembreteMensagem + variavel);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen page-content">
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
                {/* Removido o título "Configurações do Sistema" */}
                {/* Tabs */}
                {/* Tabs de Navegação (compacto em mobile) */}
                <div className={`bg-gray-100 ${isMobile ? 'p-0.5 mb-2' : 'p-1 mb-6'} rounded-lg`}> 
                  <div className={`grid grid-cols-4 ${isMobile ? 'gap-0.5' : 'gap-1'}`}>
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-center space-x-1 ${isMobile ? 'px-2 py-2 text-xs' : 'px-3 py-2 text-sm'} rounded-md font-medium transition-all duration-200 whitespace-nowrap min-w-0 overflow-hidden text-ellipsis ${
                          activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                      >
                        <tab.icon size={14} />
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
                  <div className={`${isMobile ? 'space-y-4' : 'space-y-8'}`}> {/* menos espaço em mobile */}
                    <div className="flex items-center mb-4 sm:mb-6">
                      <User className="mr-3 text-purple-600" size={22} />
                      <h3 className="text-xl font-bold text-gray-900">Informações Pessoais</h3>
                    </div>
                    <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-6'}`}> {/* menos gap em mobile */}
                      {/* Nome */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nome Completo</label>
                        <input
                          type="text"
                          value={userData.nome}
                          onChange={(e) => setUserData({...userData, nome: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                          placeholder="Digite seu nome completo"
                        />
                      </div>
                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          <Mail size={16} className="inline mr-1" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData({...userData, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                          placeholder="Digite seu email"
                        />
                      </div>
                      {/* Empresa */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          <Building size={16} className="inline mr-1" />
                          Nome da Empresa
                        </label>
                        <input
                          type="text"
                          value={userData.empresa}
                          onChange={(e) => setUserData({...userData, empresa: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                          placeholder="Digite o nome da empresa"
                        />
                      </div>
                    </div>
                    {/* Seção de Alteração de Senha */}
                    <div className={`border-t border-gray-200 ${isMobile ? 'pt-4' : 'pt-6'}`}>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Lock size={20} className="mr-2 text-purple-600" />
                        Alterar Senha
                      </h4>
                      <div className="max-w-md">
                        {/* Nova Senha */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Nova Senha</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={userData.novaSenha}
                              onChange={(e) => setUserData({...userData, novaSenha: e.target.value})}
                              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
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
                    <div className={`flex justify-end border-t border-gray-200 ${isMobile ? 'pt-4' : 'pt-6'}`}>
                      <button
                        onClick={handleSaveUserData}
                        className="flex items-center px-8 py-3 bg-purple-600 text-white rounded-xl font-bold text-base shadow-md hover:bg-purple-700 transition-all duration-200"
                      >
                        <Save size={18} className="mr-2" />
                        Salvar Dados
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab Taxas de Pagamento */}
                {activeTab === 'taxas' && (
                  <div className="space-y-6">
                    <div className={`flex ${isMobile ? 'justify-center mb-2' : 'items-center justify-between mb-6'}`}> 
                      {!isMobile && (
                      <div className="flex items-center">
                        <CreditCard className="mr-3 text-green-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-900">Taxas de Pagamento</h3>
                      </div>
                      )}
                      <button
                        onClick={handleAddTaxa}
                        className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-base shadow-sm hover:bg-green-700 transition-all duration-200 ${isMobile ? 'mx-auto w-full max-w-xs justify-center' : ''}`}
                      >
                        <Plus size={16} className="mr-2" />
                        {isMobile ? 'Agregar Taxa de Pagamento' : 'Nova Taxa'}
                      </button>
                    </div>
                    {/* Lista de Taxas */}
                    {isMobile ? (
                      <div className="space-y-2">
                        {taxas.map((taxa) => (
                          <div key={taxa.id} className="bg-white rounded-xl p-2 border border-gray-100 flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm mb-0.5">{taxa.nome}</h4>
                              <p className="text-xs text-gray-500">Taxa: {taxa.taxa}%</p>
                              {/* Não renderizar o status em mobile */}
                            </div>
                            <div className="flex flex-col space-y-1 items-end ml-2">
                                <button
                                  onClick={() => handleEditTaxa(taxa)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                >
                                <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTaxa(taxa.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                >
                                <Trash2 size={16} />
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MÉTODO DE PAGAMENTO</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TAXA (%)</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AÇÕES</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {taxas.map((taxa) => (
                              <tr key={taxa.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">{taxa.nome}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-900">{taxa.taxa}%</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    taxa.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

                    {/* Filtro de Profissional - sem título */}
                    <div className="mb-6">
                      {/* <label className="block text-sm font-medium text-gray-700 mb-2"> */}
                      {/*   <UserCheck size={16} className="inline mr-2" /> */}
                      {/*   Selecione o Profissional */}
                      {/* </label> */}
                      <select
                        value={selectedProfissional}
                        onChange={(e) => handleProfissionalChange(e.target.value)}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none"
                        style={{ fontSize: isMobile ? '16px' : '14px', backgroundImage: 'none' }}
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
                    {selectedProfissional && (
                        <div className="space-y-4">
                        {horariosAtendimento.map((dia, diaIdx) => (
                          <div key={dia.diaSemana} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center space-x-3 mb-2">
                                <input
                                  type="checkbox"
                                checked={dia.ativo}
                                onChange={e => handleDiaAtivoChange(diaIdx, e.target.checked)}
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                              <span className={`font-medium text-lg ${dia.ativo ? 'text-gray-900' : 'text-gray-400'}`}>{dia.diaSemana}</span>
                              </div>
                            {dia.ativo && (
                              <div className={`${isMobile ? 'ml-0' : 'ml-7'} flex ${isMobile ? 'flex-col gap-y-2' : 'flex-row gap-x-4 gap-y-0'}`}>
                                {dia.turnos.map((turno, turnoIdx) => (
                                  <div key={turnoIdx} className={`flex items-center space-x-2 mb-1 ${isMobile ? '' : 'mb-0'}`}>
                                    <label className="text-xs font-medium text-gray-600">Início {turnoIdx + 1}</label>
                                          <input
                                            type="time"
                                      value={turno.inicio}
                                      onChange={e => handleTurnoChange(diaIdx, turnoIdx, 'inicio', e.target.value)}
                                      className="px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm w-20 sm:w-24"
                                          />
                                    <label className="text-xs font-medium text-gray-600">Fim {turnoIdx + 1}</label>
                                          <input
                                            type="time"
                                      value={turno.fim}
                                      onChange={e => handleTurnoChange(diaIdx, turnoIdx, 'fim', e.target.value)}
                                      className="px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm w-20 sm:w-24"
                                          />
                                    {turnoIdx > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveTurno(diaIdx, turnoIdx)}
                                        className={`ml-1 ${isMobile ? 'p-1' : ''} text-purple-600 hover:text-purple-800 font-bold flex items-center justify-center`}
                                        title="Remover Turno"
                                      >
                                        {isMobile ? <Trash2 size={18} /> : <>Remover Turno {turnoIdx + 1}</>}
                                      </button>
                                    )}
                                    {turnoIdx === dia.turnos.length - 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleAddTurno(diaIdx)}
                                        className="ml-2 text-purple-600 hover:text-purple-800 text-xl font-bold"
                                      >
                                        +
                                      </button>
                                      )}
                                  </div>
                                ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                    )}

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
                )}

                {/* Tab Configurar Lembrete */}
                {activeTab === 'lembrete' && (
                  <div className="space-y-6 max-w-lg mx-auto">
                    {/* Aviso em rosa */}
                    <div className="text-center text-xs text-pink-600 font-semibold mb-2">
                      OBS: Data, horário, e serviço são preenchidos automaticamente com base no agendamento.
                    </div>
                    {/* Modal de variáveis */}
                    {showVariaveisModal && (
                      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs mx-4 p-4 relative animate-fade-in">
                          <h3 className="text-center text-base font-bold text-gray-900 mb-4">Selecione uma variável</h3>
                          <div className="space-y-2 mb-4">
                            <button onClick={() => { inserirVariavelNoCursor('#{cliente}'); setShowVariaveisModal(false); }} className="w-full flex flex-col items-start p-3 rounded-lg hover:bg-purple-50 transition-all border border-gray-100">
                              <span className="font-semibold text-purple-700">#&#123;cliente&#125;</span>
                              <span className="text-xs text-gray-500">Primeiro nome do cliente</span>
                            </button>
                            <button onClick={() => { inserirVariavelNoCursor('#{data_horario}'); setShowVariaveisModal(false); }} className="w-full flex flex-col items-start p-3 rounded-lg hover:bg-purple-50 transition-all border border-gray-100">
                              <span className="font-semibold text-purple-700">#&#123;data_horario&#125;</span>
                              <span className="text-xs text-gray-500">Data e horário do atendimento</span>
                            </button>
                            <button onClick={() => { inserirVariavelNoCursor('#{servico}'); setShowVariaveisModal(false); }} className="w-full flex flex-col items-start p-3 rounded-lg hover:bg-purple-50 transition-all border border-gray-100">
                              <span className="font-semibold text-purple-700">#&#123;servico&#125;</span>
                              <span className="text-xs text-gray-500">Nome do serviço do atendimento</span>
                            </button>
                            <button onClick={() => { inserirVariavelNoCursor('#{valorTotal}'); setShowVariaveisModal(false); }} className="w-full flex flex-col items-start p-3 rounded-lg hover:bg-purple-50 transition-all border border-gray-100">
                              <span className="font-semibold text-purple-700">#&#123;valorTotal&#125;</span>
                              <span className="text-xs text-gray-500">Valor total do atendimento</span>
                            </button>
                            <button onClick={() => { inserirVariavelNoCursor('#{profissional}'); setShowVariaveisModal(false); }} className="w-full flex flex-col items-start p-3 rounded-lg hover:bg-purple-50 transition-all border border-gray-100">
                              <span className="font-semibold text-purple-700">#&#123;profissional&#125;</span>
                              <span className="text-xs text-gray-500">Nome do profissional do atendimento</span>
                            </button>
                          </div>
                          <button onClick={() => setShowVariaveisModal(false)} className="w-full py-3 rounded-xl bg-purple-100 text-purple-700 font-bold text-base shadow hover:bg-purple-200 transition-all duration-200 mt-2">Fechar</button>
                        </div>
                      </div>
                    )}
                    {/* Modo avançado */}
                    {modoAvancadoLembrete ? (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Texto da Mensagem</label>
                          <button className="text-purple-700 font-semibold text-sm hover:underline" onClick={() => setShowVariaveisModal(true)}>Adicionar variáveis</button>
                        </div>
                        <textarea
                          id="lembrete-textarea"
                          value={lembreteMensagem}
                          onChange={e => setLembreteMensagem(e.target.value)}
                          rows={6}
                          className="w-full p-4 border-2 border-purple-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-medium text-gray-900 placeholder-gray-400 mb-2"
                        />
                        <button
                          onClick={() => setModoAvancadoLembrete(false)}
                          className="text-purple-700 font-semibold text-xs hover:underline mb-2"
                        >
                          Voltar para modo simples
                        </button>
                        <button
                          onClick={() => alert('Lembrete salvo!')}
                          className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-lg shadow-md hover:bg-purple-700 transition-all duration-200 mt-2"
                        >
                          Salvar
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Card cinza com exemplo */}
                        <div className="bg-gray-100 rounded-lg p-3 text-gray-700 text-sm border border-gray-200">
                          Oi Michele, tudo bem?<br/>
                          Este é um lembrete para o seu atendimento, dia (Hoje) 20 de Julho às 08:00.<br/>
                          Serviço: Corte Cabelo<br/>
                          Obrigado.
                        </div>
                        {/* Saudação */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Saudação</label>
                          <input
                            type="text"
                            value={lembreteSaudacao}
                            onChange={e => setLembreteSaudacao(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                            placeholder="Oi #{cliente}, tudo bem?"
                          />
                        </div>
                        {/* Despedida + Avançado */}
                        <div className="flex items-center mb-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Despedida</label>
                            <input
                              type="text"
                              value={lembreteDespedida}
                              onChange={e => setLembreteDespedida(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                              placeholder="Obrigado."
                            />
                          </div>
                          <button className="ml-2 text-purple-700 font-semibold text-xs hover:underline" onClick={() => setModoAvancadoLembrete(true)}>Avançado</button>
                        </div>
                        {/* Switch Mostrar Valor */}
                        <div className="flex items-center space-x-3 mb-2">
                          <button
                            type="button"
                            onClick={() => setMostrarValorServico(v => !v)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none ${mostrarValorServico ? 'bg-purple-600' : 'bg-gray-300'}`}
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200 ${mostrarValorServico ? 'translate-x-5' : 'translate-x-1'}`}
                            />
                          </button>
                          <span className="text-sm font-medium text-gray-700 select-none">
                            Mostrar Valor do Serviço: <span className="font-bold">{mostrarValorServico ? 'Sim' : 'Não'}</span>
                          </span>
                        </div>
                        {/* Botão Salvar */}
                        <button
                          onClick={() => alert('Lembrete salvo!')}
                          className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-lg shadow-md hover:bg-purple-700 transition-all duration-200 mt-2"
                        >
                          Salvar
                        </button>
                      </>
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

      {showSuccessAnimation && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-none">
          <div className={`bg-white rounded-2xl shadow-2xl ${isMobile ? 'p-3' : 'p-6'} mx-4 max-w-sm transform transition-all duration-300 scale-100`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900">Salvo com sucesso!</p>
                <p className="text-sm text-gray-600">{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Configuracoes(props: ConfiguracoesProps) {
  return (
    <TaxasProvider>
      <ConfiguracoesContent {...props} />
    </TaxasProvider>
  );
}