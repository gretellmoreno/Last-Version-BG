import { Cliente, Profissional, Servico, Produto, Agendamento } from '../types';

export const clientes: Cliente[] = [
  {
    id: '1',
    nome: 'ana',
    telefone: '(11) 21212-1212',
    email: ''
  },
  {
    id: '2',
    nome: 'Teste',
    telefone: '(11) 98584-8252',
    email: ''
  }
];

export const profissionais: Profissional[] = [
  {
    id: '1',
    nome: '[Exemplo] Carmen',
    funcao: 'Cabeleireira',
    telefone: '(41) 99537-4716',
    email: 'Sua na segmento demonstrada da carmela',
    online: true
  },
  {
    id: '2',
    nome: '[Exemplo] João',
    funcao: 'Manicure',
    telefone: '(11) 98556-7483',
    email: 'joaosilva0152@gmail.com',
    online: true
  },
  {
    id: '3',
    nome: '[Exemplo] Paula',
    funcao: 'Manicure',
    telefone: '(11) 21252-2444',
    email: '',
    online: false
  }
];

export const servicos: Servico[] = [
  {
    id: '1',
    nome: '[Exemplo] Corte Feminino',
    preco: 85.00,
    duracao: 1,
    comissao: 50
  },
  {
    id: '2',
    nome: '[Exemplo] Pedicure',
    preco: 25.00,
    duracao: 30,
    comissao: 60
  },
  {
    id: '3',
    nome: '[Exemplo] Progressiva',
    preco: 180.00,
    duracao: 4,
    comissao: 40
  }
];

export const agendamentos: Agendamento[] = [
  {
    id: '1',
    clienteNome: '[Exemplo] Pedicure . [Exemplo] Corte Feminino',
    servicoNome: 'Cliente',
    profissionalId: '1',
    horario: '10:00',
    data: '2025-06-24'
  },
  {
    id: '2',
    clienteNome: '[Exemplo] Progressiva . [Exemplo] Pedicure',
    servicoNome: 'Cliente',
    profissionalId: '1',
    horario: '13:00',
    data: '2025-06-24'
  },
  {
    id: '3',
    clienteNome: '[Exemplo] Pedicure . [Exemplo] Corte Feminino',
    servicoNome: 'Cliente',
    profissionalId: '2',
    horario: '09:00',
    data: '2025-06-24'
  },
  {
    id: '4',
    clienteNome: '[Exemplo] Corte Feminino',
    servicoNome: 'ana',
    profissionalId: '2',
    horario: '14:00',
    data: '2025-06-24'
  },
  {
    id: '5',
    clienteNome: '[Exemplo] Pedicure . [Exemplo] Corte Feminino',
    servicoNome: 'Cliente',
    profissionalId: '2',
    horario: '15:00',
    data: '2025-06-24'
  },
  {
    id: '6',
    clienteNome: '[Exemplo] Pedicure',
    servicoNome: 'Cliente',
    profissionalId: '3',
    horario: '10:00',
    data: '2025-06-24'
  },
  {
    id: '7',
    clienteNome: '[Exemplo] Pedicure . [Exemplo] Corte Feminino',
    servicoNome: 'Cliente',
    profissionalId: '3',
    horario: '13:00',
    data: '2025-06-24'
  },
  {
    id: '8',
    clienteNome: '[Exemplo] Pedicure . [Exemplo] Corte Feminino',
    servicoNome: 'Cliente',
    profissionalId: '3',
    horario: '15:00',
    data: '2025-06-24'
  }
];