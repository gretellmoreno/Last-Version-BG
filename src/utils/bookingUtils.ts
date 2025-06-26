import { Agendamento, Servico, Profissional, Cliente } from '../types';

// Função para calcular horário de fim baseado na duração dos serviços
export const calculateEndTime = (startTime: string, services: Servico[]): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  
  // Somar duração de todos os serviços
  const totalDuration = services.reduce((total, service) => total + service.duracao, 0);
  
  const endMinutes = startMinutes + totalDuration;
  const endHours = Math.floor(endMinutes / 60);
  const remainingMinutes = endMinutes % 60;
  
  return `${endHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
};

// Função para formatar duração em texto
export const formatDuration = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  }
  return `${minutes}min`;
};

// Função para verificar se um horário está ocupado
export const isTimeSlotOccupied = (
  agendamentos: Agendamento[],
  profissionalId: string,
  data: string,
  horarioInicio: string,
  horarioFim: string
): boolean => {
  return agendamentos.some(agendamento => {
    if (agendamento.profissionalId !== profissionalId || agendamento.data !== data) {
      return false;
    }

    const agendamentoInicio = timeToMinutes(agendamento.horarioInicio);
    const agendamentoFim = timeToMinutes(agendamento.horarioFim);
    const novoInicio = timeToMinutes(horarioInicio);
    const novoFim = timeToMinutes(horarioFim);

    // Verifica se há sobreposição
    return (novoInicio < agendamentoFim && novoFim > agendamentoInicio);
  });
};

// Função auxiliar para converter horário em minutos
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Função para criar um novo agendamento
export const createBooking = (
  cliente: Cliente | null,
  servicos: Servico[],
  profissional: Profissional,
  data: Date,
  horario: string
): Agendamento => {
  const horarioFim = calculateEndTime(horario, servicos);
  const total = servicos.reduce((sum, service) => sum + service.preco, 0);
  
  return {
    id: Date.now().toString(),
    clienteId: cliente?.id || 'sem-reserva',
    clienteNome: cliente?.nome || 'Sem reserva',
    servicoIds: servicos.map(s => s.id),
    servicoNomes: servicos.map(s => s.nome),
    profissionalId: profissional.id,
    profissionalNome: profissional.nome,
    horarioInicio: horario,
    horarioFim,
    data: data.toISOString().split('T')[0],
    preco: total,
    status: 'agendado'
  };
};