import { Generator, ChecklistTemplate, Employee, Rental } from '../types';

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
      { id: 'm1', date: '2025-12-15', description: 'Troca de óleo e filtros', technician: 'João Silva', cost: 1200 },
      { id: 'm2', date: '2025-06-10', description: 'Revisão preventiva semestral', technician: 'Carlos Souza', cost: 800 }
    ],
    locationHistory: [
      { id: 'lh1', date: '2026-01-10', location: 'Obra Central - Construtora ABC', company: 'Construtora ABC', type: 'Entrega' },
      { id: 'lh2', date: '2025-12-10', location: 'Pátio Central', type: 'Retirada' }
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
      { id: 'm3', date: '2026-03-20', description: 'Reparo no alternador', technician: 'Ricardo Lima' }
    ],
    locationHistory: []
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
  }
];

export const mockEmployees: Employee[] = [
  { id: 'emp-1', name: 'João Silva', role: 'Técnico', email: 'joao@gerocontrol.com' },
  { id: 'emp-2', name: 'Carlos Souza', role: 'Técnico', email: 'carlos@gerocontrol.com' },
  { id: 'emp-3', name: 'Ricardo Lima', role: 'Admin', email: 'ricardo@gerocontrol.com' }
];

export const mockRentals: Rental[] = [
  {
    id: 'rent-1',
    generatorId: 'GEN-001',
    companyName: 'Construtora ABC',
    startDate: '2026-01-10',
    status: 'Ativo'
  }
];
