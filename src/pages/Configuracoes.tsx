import React, { useState, useEffect, useRef } from 'react';
import Settings from 'lucide-react/dist/esm/icons/settings';
import User from 'lucide-react/dist/esm/icons/user';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Building from 'lucide-react/dist/esm/icons/building';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import Save from 'lucide-react/dist/esm/icons/save';
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Plus from 'lucide-react/dist/esm/icons/plus';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import Bell from 'lucide-react/dist/esm/icons/bell';
import Header from '../components/Header';
import TaxaModal from '../components/TaxaModal';
import { TaxasProvider, useTaxas } from '../contexts/TaxasContext';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useProfessional, ProfessionalProvider } from '../contexts/ProfessionalContext';
import { supabaseService } from '../lib/supabaseService';

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
    nome: '',
    email: '',
    empresa: '',
    novaSenha: ''
  });

  // Estados para horários de atendimento
  const [selectedProfissional, setSelectedProfissional] = useState('');
  const [horariosAtendimento, setHorariosAtendimento] = useState([
    { wday: 1, diaSemana: 'Segunda-feira', ativo: true, turnos: [{ inicio: '', fim: '' }] },
    { wday: 2, diaSemana: 'Terça-feira', ativo: true, turnos: [{ inicio: '', fim: '' }] },
    { wday: 3, diaSemana: 'Quarta-feira', ativo: true, turnos: [{ inicio: '', fim: '' }] },
    { wday: 4, diaSemana: 'Quinta-feira', ativo: true, turnos: [{ inicio: '', fim: '' }] },
    { wday: 5, diaSemana: 'Sexta-feira', ativo: true, turnos: [{ inicio: '', fim: '' }] },
    { wday: 6, diaSemana: 'Sábado', ativo: true, turnos: [{ inicio: '', fim: '' }] },
    { wday: 7, diaSemana: 'Domingo', ativo: false, turnos: [{ inicio: '', fim: '' }] },
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
  const [lembreteSaudacao, setLembreteSaudacao] = useState('');
  const [lembreteDespedida, setLembreteDespedida] = useState('');
  const [mostrarValorServico, setMostrarValorServico] = useState(false);
  const [modoAvancadoLembrete, setModoAvancadoLembrete] = useState(false);
  const [lembreteMensagem, setLembreteMensagem] = useState('');
  const [showVariaveisModal, setShowVariaveisModal] = useState(false);
  const [showVariaveisLembrete, setShowVariaveisLembrete] = useState(false);
  const [lembretePreview, setLembretePreview] = useState('');

  // Função para gerar preview substituindo variáveis por exemplos
  function gerarPreviewLembrete(msg: string) {
    if (!msg) return '';
    return msg
      .replace(/#\{cliente\}/g, 'Michele')
      .replace(/#\{data_horario\}/g, '(Hoje) 20 de Julho às 08:00')
      .replace(/#\{profissional\}/g, 'João')
      .replace(/#\{servico\}/g, 'Corte Cabelo');
  }

  // Atualizar preview sempre que a mensagem mudar
  useEffect(() => {
    setLembretePreview(gerarPreviewLembrete(lembreteMensagem));
  }, [lembreteMensagem]);

  const { currentSalon } = useApp();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const { professionals } = useProfessional();

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Carregue apenas o e-mail do usuário e nome do salão
  useEffect(() => {
    async function loadUserAndSalon() {
      if (!user?.id || !currentSalon?.id) return;
      const { data: userDataDb } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single();
      const { data: salonDataDb } = await supabase
        .from('salons')
        .select('name')
        .eq('id', currentSalon.id)
        .single();
      setUserData({
        nome: userDataDb?.name || '',
        email: userDataDb?.email || '',
        empresa: salonDataDb?.name || '',
        novaSenha: ''
      });
    }
    loadUserAndSalon();
  }, [user?.id, currentSalon?.id]);

  // Carregar taxas de pagamento ao abrir a aba 'taxas'
  useEffect(() => {
    async function loadPaymentMethods() {
      if (activeTab === 'taxas' && currentSalon?.id) {
        const { data, error } = await supabase
          .rpc('list_payment_methods', { salon_id: currentSalon.id });
        if (error) {
          toast.error('Erro ao carregar as formas de pagamento.');
          setPaymentMethods([]);
        } else {
          setPaymentMethods(data || []);
        }
      }
    }
    loadPaymentMethods();
  }, [activeTab, currentSalon?.id]);

  // Carregar horários ao selecionar profissional
  useEffect(() => {
    async function loadProfSchedule() {
      if (!currentSalon?.id || !selectedProfissional) return;
      const { data, error } = await supabase.rpc('list_professional_schedule', {
        p_salon_id: currentSalon.id,
        p_professional_id: selectedProfissional
      });
      if (error) {
        toast.error('Erro ao carregar horários do profissional.');
        return;
      }
      // Mapear resposta para o estado local
      const diasPadrao = [
        { wday: 1, diaSemana: 'Segunda-feira' },
        { wday: 2, diaSemana: 'Terça-feira' },
        { wday: 3, diaSemana: 'Quarta-feira' },
        { wday: 4, diaSemana: 'Quinta-feira' },
        { wday: 5, diaSemana: 'Sexta-feira' },
        { wday: 6, diaSemana: 'Sábado' },
        { wday: 7, diaSemana: 'Domingo' },
      ];
      setHorariosAtendimento(
        diasPadrao.map((dia) => {
          const found = data.find((d: any) => d.wday === dia.wday);
          if (!found) {
            return { ...dia, ativo: false, turnos: [{ inicio: '', fim: '' }] };
          }
          return {
            ...dia,
            ativo: found.work,
            turnos: [
              { inicio: found.start_time_1 || '', fim: found.end_time_1 || '' },
              ...(found.start_time_2 || found.end_time_2 ? [{ inicio: found.start_time_2 || '', fim: found.end_time_2 || '' }] : [])
            ]
          };
        })
      );
    }
    loadProfSchedule();
  }, [selectedProfissional, currentSalon?.id]);

  // Salvar horários (ao clicar em Salvar ou ao editar campo)
  const handleSaveHorarios = async () => {
    if (!currentSalon?.id || !selectedProfissional) return;
    
    try {
      // Montar o JSON com os horários no formato esperado pelo backend
      const hoursData = horariosAtendimento.map((dia) => {
        const turno1 = dia.turnos[0];
        const turno2 = dia.turnos[1];
        
        return {
          wday: dia.wday,
          work: dia.ativo,
          start_time_1: dia.ativo && turno1?.inicio ? turno1.inicio : null,
          end_time_1: dia.ativo && turno1?.fim ? turno1.fim : null,
          start_time_2: dia.ativo && turno2?.inicio ? turno2.inicio : null,
          end_time_2: dia.ativo && turno2?.fim ? turno2.fim : null
        };
      });

      console.log('📅 Enviando horários para o backend:', hoursData);

      const { data, error } = await supabase.rpc('set_business_hours', {
        p_salon_id: currentSalon.id,
        p_professional_id: selectedProfissional,
        p_hours_data: hoursData
      });

      if (error) {
        console.error('❌ Erro ao salvar horários:', error);
        toast.error('Erro ao salvar horários.');
        return;
      }

      // Verificar resposta do backend
      if (data && typeof data === 'object') {
        if (data.success === true) {
          toast.success(data.message || 'Horários salvos com sucesso!');
        } else {
          toast.error(data.message || 'Erro ao salvar horários.');
        }
      } else {
        // Fallback para compatibilidade
        toast.success('Horários salvos com sucesso!');
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao salvar horários:', error);
      toast.error('Erro inesperado ao salvar horários.');
    }
  };

  // Remover horário de um dia
  const handleRemoverDia = async (diaIndex: number) => {
    if (!currentSalon?.id || !selectedProfissional) return;
    const dia = horariosAtendimento[diaIndex];
    try {
      await supabase.rpc('delete_professional_schedule', {
        salon_id: currentSalon.id,
        professional_id: selectedProfissional,
        wday: dia.wday
      });
      // Atualize o estado local para refletir remoção
      setHorariosAtendimento((prev) => prev.map((d, idx) => idx === diaIndex ? { ...d, ativo: false, turnos: [{ inicio: '', fim: '' }] } : d));
      toast.success('Horário removido!');
    } catch (error) {
      toast.error('Erro ao remover horário.');
    }
  };

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

  // Atualize o handleSaveUserData para salvar apenas users.email e não salons.email
  const handleSaveUserData = async () => {
    try {
      // 1. Atualizar nome e email do usuário (informativo)
      const { error: userError } = await supabase
        .from('users')
        .update({ name: userData.nome, email: userData.email })
        .eq('id', user?.id);
      // 2. Atualizar nome da empresa (salão)
      const { error: salonError } = await supabase
        .from('salons')
        .update({ name: userData.empresa })
        .eq('id', currentSalon?.id);
      // 3. Atualizar e-mail e senha no Supabase Auth
      const updateAuthData: { email: string; password?: string } = { email: userData.email };
      if (userData.novaSenha && userData.novaSenha.length > 0) {
        updateAuthData.password = userData.novaSenha;
      }
      const { error: authError } = await supabase.auth.updateUser(updateAuthData);
      if (userError || salonError || authError) {
        showSuccessModal('Erro ao salvar dados!');
      } else {
        showSuccessModal('Dados salvos com sucesso!');
      }
    } catch (error) {
      showSuccessModal('Erro inesperado ao salvar dados!');
    }
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
      { wday: 1, diaSemana: 'Segunda-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
      { wday: 2, diaSemana: 'Terça-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
      { wday: 3, diaSemana: 'Quarta-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
      { wday: 4, diaSemana: 'Quinta-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
      { wday: 5, diaSemana: 'Sexta-feira', ativo: true, turnos: [{ inicio: '08:00', fim: '18:00' }] },
      { wday: 6, diaSemana: 'Sábado', ativo: true, turnos: [{ inicio: '08:00', fim: '16:00' }] },
      { wday: 7, diaSemana: 'Domingo', ativo: false, turnos: [{ inicio: '08:00', fim: '16:00' }] },
    ]);
  };

  const getProfissionalName = (id: string) => {
    const prof = profissionais.find(p => p.id === id);
    return prof ? prof.nome : 'Profissional não encontrado';
  };

  const handleEditTaxa = (taxa: any) => {
    setEditingTaxa({
      id: taxa.id,
      nome: taxa.name || taxa.nome || '',
      taxa: taxa.fee ?? taxa.taxa ?? 0,
      ativo: taxa.ativo !== undefined ? taxa.ativo : true
    });
    setShowTaxaModal(true);
  };

  const handleAddTaxa = () => {
    setEditingTaxa({ id: '', nome: '', taxa: 0, ativo: true });
    setShowTaxaModal(true);
  };

  const handleSaveTaxa = async (taxaData: any) => {
    try {
      if (!currentSalon?.id) return;
      if (!taxaData.id) {
        // Criar nova taxa
        const { data, error } = await supabase.rpc('create_payment_method', {
          salon_id: currentSalon.id,
          name: taxaData.nome,
          fee: taxaData.taxa
        });
        if (error || !data[0]?.success) {
          toast.error('Erro ao criar a forma de pagamento.');
        } else {
          toast.success('Forma de pagamento criada com sucesso!');
          setShowTaxaModal(false);
          setEditingTaxa(null);
          // Recarregar lista
          const { data: list, error: listError } = await supabase.rpc('list_payment_methods', { salon_id: currentSalon.id });
          setPaymentMethods(listError ? [] : list || []);
        }
      } else {
        // Editar taxa existente
        const { data, error } = await supabase.rpc('update_payment_method', {
          p_payment_method_id: taxaData.id,
          p_salon_id: currentSalon.id,
          p_name: taxaData.nome,
          p_fee: taxaData.taxa
        });
        if (error || !data[0]?.success) {
          toast.error('Erro ao atualizar a forma de pagamento.');
        } else {
          toast.success('Forma de pagamento atualizada com sucesso!');
          setShowTaxaModal(false);
          setEditingTaxa(null);
          // Recarregar lista
          const { data: list, error: listError } = await supabase.rpc('list_payment_methods', { salon_id: currentSalon.id });
          setPaymentMethods(listError ? [] : list || []);
        }
      }
    } catch (error) {
      toast.error('Erro inesperado ao salvar taxa.');
    }
  };

  const handleDeleteTaxa = async (taxa: any) => {
    if (!currentSalon?.id) return;
    if (!confirm('Tem certeza que deseja excluir esta taxa?')) return;
    try {
      const { data, error } = await supabase.rpc('delete_payment_method', {
        p_payment_method_id: taxa.id,
        p_salon_id: currentSalon.id
      });
      if (error || !data[0]?.success) {
        toast.error('Erro ao excluir a forma de pagamento.');
      } else {
        toast.success('Forma de pagamento excluída com sucesso!');
        // Recarregar lista
        const { data: list, error: listError } = await supabase.rpc('list_payment_methods', { salon_id: currentSalon.id });
        setPaymentMethods(listError ? [] : list || []);
      }
    } catch (error) {
      toast.error('Erro inesperado ao excluir taxa.');
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

  // Adicione no início do componente:
  const lembreteTextareaRef = useRef<HTMLTextAreaElement>(null);
  function inserirVariavelLembrete(variavel: string) {
    if (!lembreteTextareaRef.current) return;
    const textarea = lembreteTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textoAntes = lembreteMensagem.substring(0, start);
    const textoDepois = lembreteMensagem.substring(end);
    setLembreteMensagem(textoAntes + variavel + textoDepois);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + variavel.length;
    }, 0);
  }

  // Remover o useEffect duplicado e garantir apenas UM carregamento robusto:
  useEffect(() => {
    async function loadReminderTemplate() {
      if (activeTab === 'lembrete' && currentSalon?.id) {
        const { data, error } = await supabase.rpc('get_reminder_template', { p_salon_id: currentSalon.id });
        if (!error && data) {
          if (Array.isArray(data) && data[0]?.message) {
            setLembreteMensagem(data[0].message);
          } else if (data.message) {
            setLembreteMensagem(data.message);
          } else {
            setLembreteMensagem('');
          }
        } else {
          setLembreteMensagem('');
        }
      }
    }
    loadReminderTemplate();
  }, [activeTab, currentSalon?.id]);

  const handleSaveLembrete = async () => {
    if (!currentSalon?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('upsert_reminder_template', {
        p_salon_id: currentSalon.id,
        p_message: lembreteMensagem
      });
      
      if (error) {
        console.error('❌ Erro na RPC upsert_reminder_template:', error);
        toast.error('Erro ao salvar mensagem do lembrete');
        return;
      }
      
      // Verificar a resposta do backend
      if (data && typeof data === 'object') {
        if (data.success === true) {
          toast.success(data.message || 'Salvo!');
        } else {
          toast.error(data.message || 'Erro ao salvar mensagem do lembrete');
        }
      } else {
        // Fallback para compatibilidade com versão anterior
        toast.success('Mensagem do lembrete salva com sucesso!');
      }
    } catch (err) {
      console.error('💥 Erro inesperado ao salvar lembrete:', err);
      toast.error('Erro inesperado ao salvar mensagem do lembrete');
    }
  };

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
                      {/* Email do usuário */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          <Mail size={16} className="inline mr-1" />
                          E-mail do usuário (login)
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 focus:ring-0 focus:border-gray-200 cursor-not-allowed"
                          placeholder="E-mail de login"
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
                    <div className="flex items-center mb-6">
                      <CreditCard className="mr-3 text-green-600" size={20} />
                      {!isMobile && <h3 className="text-lg font-semibold text-gray-900">Taxas de Pagamento</h3>}
                      {!isMobile && (
                        <button
                          onClick={handleAddTaxa}
                          className="ml-auto flex items-center px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-base shadow-sm hover:bg-green-700 transition-all duration-200"
                        >
                          <Plus size={16} className="mr-2" />
                          Nova Taxa
                        </button>
                      )}
                      {isMobile && (
                        <button
                          onClick={handleAddTaxa}
                          className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl font-bold text-base shadow-sm hover:bg-green-700 transition-all duration-200"
                        >
                          <Plus size={18} className="mr-2" />
                          Nova Taxa
                        </button>
                      )}
                    </div>
                    {isMobile ? (
                      <div className="space-y-2">
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm mb-0.5">{method.name}</h4>
                              <p className="text-xs text-gray-500">Taxa: {method.fee}%</p>
                              <span className="inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ativo</span>
                            </div>
                            <div className="flex flex-col space-y-1 items-end ml-2">
                              <button onClick={() => handleEditTaxa(method)} className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                                <Edit3 size={18} />
                              </button>
                              <button onClick={() => handleDeleteTaxa(method)} className="p-2 text-red-600 hover:bg-red-100 rounded">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MÉTODO DE PAGAMENTO</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TAXA (%)</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AÇÕES</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {paymentMethods.map((method) => (
                              <tr key={method.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{method.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{method.fee}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className="inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ativo</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                                  <button onClick={() => handleEditTaxa(method)} className="text-blue-600 hover:text-blue-900"><Edit3 size={16} /></button>
                                  <button onClick={() => handleDeleteTaxa(method)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
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
                    <div className="mb-6 relative">
                      {/* <label className="block text-sm font-medium text-gray-700 mb-2"> */}
                      {/*   <UserCheck size={16} className="inline mr-2" /> */}
                      {/*   Selecione o Profissional */}
                      {/* </label> */}
                      <select
                        value={selectedProfissional}
                        onChange={e => setSelectedProfissional(e.target.value)}
                        className="w-full mb-4 px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 appearance-none pr-10"
                        style={{ backgroundImage: 'none' }}
                      >
                        <option value="">Selecione um profissional</option>
                        {professionals.map(prof => (
                          <option key={prof.id} value={prof.id}>
                            {prof.name}
                          </option>
                        ))}
                      </select>
                      {/* Ícone customizado de seta */}
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Conteúdo dos horários */}
                    {selectedProfissional && (
                        <div className="space-y-4">
                        {horariosAtendimento.map((dia, diaIndex) => (
                          <div key={dia.diaSemana} className="mb-4 bg-white rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                checked={dia.ativo}
                                onChange={(e) => handleDiaAtivoChange(diaIndex, e.target.checked)}
                                className="mr-2"
                              />
                              <span className="font-semibold text-gray-900">{dia.diaSemana}</span>
                            </div>
                            {dia.ativo && (
                              <div className={isMobile ? 'flex flex-col gap-2' : 'flex items-center gap-4'}>
                                {/* Turno 1 */}
                                <div className={isMobile ? 'flex gap-2 items-center' : 'flex gap-2 items-center'}>
                                  <span>Início 1</span>
                                  <input
                                    type="time"
                                    value={dia.turnos[0].inicio}
                                    onChange={(e) => handleTurnoChange(diaIndex, 0, 'inicio', e.target.value)}
                                    className="border rounded px-2 py-1"
                                  />
                                  <span>Fim 1</span>
                                  <input
                                    type="time"
                                    value={dia.turnos[0].fim}
                                    onChange={(e) => handleTurnoChange(diaIndex, 0, 'fim', e.target.value)}
                                    className="border rounded px-2 py-1"
                                  />
                                </div>
                                {/* Turno 2 (se existir) */}
                                {dia.turnos.length === 2 && (
                                  <div className={isMobile ? 'flex flex-col gap-1 items-start' : 'flex gap-2 items-center'}>
                                    <div className={isMobile ? 'flex gap-2 items-center' : 'flex gap-2 items-center'}>
                                      <span>Início 2</span>
                                      <input
                                        type="time"
                                        value={dia.turnos[1].inicio}
                                        onChange={(e) => handleTurnoChange(diaIndex, 1, 'inicio', e.target.value)}
                                        className="border rounded px-2 py-1"
                                      />
                                      <span>Fim 2</span>
                                      <input
                                        type="time"
                                        value={dia.turnos[1].fim}
                                        onChange={(e) => handleTurnoChange(diaIndex, 1, 'fim', e.target.value)}
                                        className="border rounded px-2 py-1"
                                      />
                                      {!isMobile && (
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveTurno(diaIndex, 1)}
                                          className="text-purple-600 hover:underline ml-2"
                                        >
                                          Remover Turno 2
                                        </button>
                                      )}
                                    </div>
                                    {isMobile && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveTurno(diaIndex, 1)}
                                        className="text-purple-600 hover:underline ml-2 text-sm"
                                      >
                                        Remover Turno 2
                                      </button>
                                    )}
                                  </div>
                                )}
                                {/* Botão de adicionar turno (só se houver 1 turno) */}
                                {dia.turnos.length === 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddTurno(diaIndex)}
                                    className="text-purple-600 ml-2"
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                            )}
                            {dia.ativo && (
                              <button
                                type="button"
                                onClick={() => handleRemoverDia(diaIndex)}
                                className="ml-2 text-red-600 hover:underline text-xs"
                              >
                                Remover Dia
                              </button>
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
                  <div className="max-w-md mx-auto w-full px-2 py-4 sm:px-6 sm:py-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">Lembrete Whats</h3>
                    {/* Preview dinâmico */}
                    <div className="bg-gray-100 rounded-lg p-3 text-gray-700 text-sm border border-gray-200 mb-2 whitespace-pre-line">
                      {lembretePreview}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Mensagem do Lembrete</label>
                      <textarea
                        ref={lembreteTextareaRef}
                        value={lembreteMensagem}
                        onChange={e => setLembreteMensagem(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg min-h-[100px] text-base sm:text-lg"
                        placeholder={
                          'Ex: Oi #{cliente}, tudo bem?\nEste é um lembrete para o seu atendimento, dia #{data_horario}.\nProfissional: #{profissional}\nServiço: #{servico}\nObrigado.'
                        }
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium text-xs shadow-sm hover:bg-purple-200 transition-all border border-purple-200"
                          onClick={() => inserirVariavelLembrete('#{cliente}')}
                        >
                          Cliente
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium text-xs shadow-sm hover:bg-purple-200 transition-all border border-purple-200"
                          onClick={() => inserirVariavelLembrete('#{data_horario}')}
                        >
                          Data/Horário
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium text-xs shadow-sm hover:bg-purple-200 transition-all border border-purple-200"
                          onClick={() => inserirVariavelLembrete('#{profissional}')}
                        >
                          Profissional
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium text-xs shadow-sm hover:bg-purple-200 transition-all border border-purple-200"
                          onClick={() => inserirVariavelLembrete('#{servico}')}
                        >
                          Serviço
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleSaveLembrete}
                        className="w-full flex items-center justify-center px-8 py-3 bg-purple-600 text-white rounded-xl font-bold text-base shadow-md hover:bg-purple-700 transition-all duration-200"
                      >
                        <Save size={18} className="mr-2" />
                        Salvar
                      </button>
                    </div>
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
    <ProfessionalProvider>
      <TaxasProvider>
        <ConfiguracoesContent {...props} />
      </TaxasProvider>
    </ProfessionalProvider>
  );
}