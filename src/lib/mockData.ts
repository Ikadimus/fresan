import { Generator, ChecklistTemplate, Employee, Rental, Client } from '../types';

export const mockGenerators: Generator[] = [
  {
    id: 'GEN-001',
    model: 'Cummins C150',
    serialNumber: 'SN-123456',
    status: 'Alugado',
    currentLocation: 'Obra Central - Construtora ABC',
    powerKva: 150,
    year: 2022,
    maintenanceHistory: [
      { id: 'm1', date: '2025-12-15', description: 'Troca de óleo e filtros', technician: 'João Silva', cost: 1200, type: 'Preventiva' },
      { id: 'm2', date: '2025-06-10', description: 'Revisão preventiva semestral', technician: 'Carlos Souza', cost: 800, type: 'Preventiva' }
    ],
    locationHistory: [
      { id: 'lh1', date: '2026-01-10', location: 'Obra Central - Construtora ABC', company: 'Construtora ABC', type: 'Entrega' },
      { id: 'lh2', date: '2025-12-10', location: 'Pátio Central', type: 'Retirada' }
    ],
    hourMeterHistory: [
      { id: 'hm1', date: '2026-04-01T10:00:00Z', value: 1200, technician: 'Ricardo Lima' },
      { id: 'hm2', date: '2026-04-10T15:30:00Z', value: 1245, technician: 'João Silva' }
    ]
  },
  {
    id: 'GEN-002',
    model: 'Stemac S250',
    serialNumber: 'SN-789012',
    status: 'Disponível',
    currentLocation: 'Pátio Central',
    powerKva: 250,
    year: 2023,
    maintenanceHistory: [],
    locationHistory: [
      { id: 'lh3', date: '2026-02-01', location: 'Pátio Central', type: 'Movimentação' }
    ],
    hourMeterHistory: [
      { id: 'hm3', date: '2026-03-15T08:00:00Z', value: 850, technician: 'Carlos Souza' }
    ]
  },
  {
    id: 'GEN-003',
    model: 'Caterpillar C32',
    serialNumber: 'SN-345678',
    status: 'Manutenção',
    currentLocation: 'Oficina Interna',
    powerKva: 500,
    year: 2021,
    maintenanceHistory: [
      { id: 'm3', date: '2026-03-20', description: 'Reparo no alternador', technician: 'Ricardo Lima', type: 'Corretiva' }
    ],
    locationHistory: [],
    hourMeterHistory: [
      { id: 'hm4', date: '2026-03-20T14:00:00Z', value: 2100, technician: 'Ricardo Lima' }
    ]
  }
];

export const mockChecklistTemplates: ChecklistTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Checklist de Entrega',
    questions: [
      { id: 'q1', text: 'Nível de óleo está adequado?', type: 'boolean' },
      { id: 'q2', text: 'Nível de combustível (litros)', type: 'number' },
      { id: 'q3', text: 'Estado das baterias (tensão)', type: 'number' },
      { id: 'q4', text: 'Limpeza geral do equipamento', type: 'boolean' },
      { id: 'q5', text: 'Observações adicionais', type: 'text' }
    ]
  },
  {
    id: 'tmpl-2',
    name: 'Checklist de Manutenção Preventiva',
    questions: [
      { id: 'q6', text: 'Filtros substituídos?', type: 'boolean' },
      { id: 'q7', text: 'Vazamentos detectados?', type: 'boolean' },
      { id: 'q8', text: 'Horímetro atual', type: 'number' }
    ]
  },
  {
    id: 'tmpl-3',
    name: 'Checklist Técnico Completo (Padrão Fresan)',
    questions: [
      { id: 'q9', text: 'Nível de Óleo do Motor', type: 'boolean' },
      { id: 'q10', text: 'Nível do Líquido de Arrefecimento', type: 'boolean' },
      { id: 'q11', text: 'Estado das Correias', type: 'boolean' },
      { id: 'q12', text: 'Vazamentos (Óleo, Água, Combustível)', type: 'boolean' },
      { id: 'q13', text: 'Estado da Bateria e Cabos', type: 'boolean' },
      { id: 'q14', text: 'Tensão da Bateria (V)', type: 'number' },
      { id: 'q15', text: 'Nível de Combustível (%)', type: 'number' },
      { id: 'q16', text: 'Estado do Filtro de Ar', type: 'boolean' },
      { id: 'q17', text: 'Funcionamento do Carregador de Bateria', type: 'boolean' },
      { id: 'q18', text: 'Teste de Partida / Funcionamento', type: 'boolean' },
      { id: 'q19', text: 'Frequência (Hz)', type: 'number' },
      { id: 'q20', text: 'Tensão de Saída (V)', type: 'number' },
      { id: 'q21', text: 'Horímetro Atual', type: 'number' },
      { id: 'q22', text: 'Limpeza e Conservação', type: 'boolean' },
      { id: 'q23', text: 'Observações Técnicas', type: 'text' }
    ]
  }
];

export const mockEmployees: Employee[] = [
  { id: 'emp-1', name: 'João Silva', role: 'Técnico', email: 'joao@gerocontrol.com', password: '123' },
  { id: 'emp-2', name: 'Carlos Souza', role: 'Técnico', email: 'carlos@gerocontrol.com', password: '123' },
  { id: 'emp-3', name: 'Ricardo Lima', role: 'Admin', email: 'ricardo@gerocontrol.com', password: '123' },
  { id: 'emp-4', name: 'Usuário Teste', role: 'Admin', email: 'p@p', password: '123' }
];

export const mockRentals: Rental[] = [
  {
    id: 'rent-1',
    generatorId: 'GEN-001',
    companyName: 'Construtora ABC',
    clientId: 'client-1',
    startDate: '2026-01-10',
    status: 'Ativo',
    value: 4500
  }
];

export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Construtora ABC',
    cnpj: '12.345.678/0001-90',
    email: 'contato@abc.com',
    phone: '(11) 98888-7777',
    address: 'Av. Paulista, 1000, São Paulo - SP'
  },
  {
    id: 'client-2',
    name: 'Eventos Prime',
    cnpj: '98.765.432/0001-10',
    email: 'financeiro@prime.com',
    phone: '(11) 97777-6666',
    address: 'Rua Augusta, 500, São Paulo - SP'
  }
];
