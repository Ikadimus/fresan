import { Generator, ChecklistTemplate, Employee, Rental, Client, InventoryPart, StockMovement, RoutineMaintenanceItem } from '../types';

export const mockGenerators: Generator[] = [
  {
    id: 'GEN-001',
    model: 'Cummins C150D6 (150 kVA)',
    serialNumber: 'CUM-2023-8821',
    status: 'Alugado',
    currentLocation: 'Obra Shopping Boulevard - SP',
    powerKva: 150,
    year: 2023,
    maintenanceHistory: [
      {
        id: 'MNT-101',
        date: '2026-06-15T10:00:00.000Z',
        description: 'Revisão preventiva de 250h - Troca de óleo 15W40 e filtro lubrificante',
        technician: 'Carlos Eduardo',
        type: 'Preventiva',
        cost: 650,
        parts: [
          { id: 'p1', name: 'Óleo Motor 15W40 (20L)', value: 380 },
          { id: 'p2', name: 'Filtro de Óleo LF16015', value: 120 }
        ],
        services: [
          { id: 's1', name: 'Mão de obra preventiva', value: 150 }
        ]
      }
    ],
    locationHistory: [
      {
        id: 'LOC-101',
        date: '2026-07-01T08:00:00.000Z',
        location: 'Obra Shopping Boulevard - SP',
        company: 'Construtora Metropolitana SA',
        type: 'Entrega'
      }
    ],
    hourMeterHistory: [
      { id: 'HM-1', date: '2026-06-15T10:00:00.000Z', value: 1240, technician: 'Carlos Eduardo' },
      { id: 'HM-2', date: '2026-08-01T14:00:00.000Z', value: 1480, technician: 'Ricardo Lima' }
    ]
  },
  {
    id: 'GEN-002',
    model: 'Scania DC09 260 kVA',
    serialNumber: 'SCA-2022-4419',
    status: 'Disponível',
    currentLocation: 'Pátio Central - Setor B',
    powerKva: 260,
    year: 2022,
    maintenanceHistory: [
      {
        id: 'MNT-102',
        date: '2024-07-20T09:30:00.000Z',
        description: 'Instalação de Bateria 12V 150Ah e teste de partida em carga',
        technician: 'Ricardo Lima',
        type: 'Preventiva',
        cost: 1250,
        parts: [
          { id: 'p3', name: 'Bateria 12V 150Ah Selada', value: 1150 }
        ]
      }
    ],
    locationHistory: [
      {
        id: 'LOC-102',
        date: '2026-07-15T16:00:00.000Z',
        location: 'Pátio Central - Setor B',
        company: 'Fresan Base',
        type: 'Retirada'
      }
    ],
    hourMeterHistory: [
      { id: 'HM-3', date: '2026-07-15T16:00:00.000Z', value: 2310, technician: 'Ricardo Lima' }
    ]
  },
  {
    id: 'GEN-003',
    model: 'MWM 4.10TCA 80 kVA',
    serialNumber: 'MWM-2024-1102',
    status: 'Manutenção',
    currentLocation: 'Oficina Central Fresan',
    powerKva: 80,
    year: 2024,
    maintenanceHistory: [
      {
        id: 'MNT-103',
        date: '2026-08-10T11:00:00.000Z',
        description: 'Troca de solenoide de corte de combustível e limpeza de bicos',
        technician: 'Marcos Silva',
        type: 'Corretiva',
        cost: 490,
        parts: [
          { id: 'p4', name: 'Solenoide de Parada 12V', value: 290 }
        ],
        services: [
          { id: 's2', name: 'Diagnóstico elétrico', value: 200 }
        ]
      }
    ],
    locationHistory: [
      {
        id: 'LOC-103',
        date: '2026-08-10T09:00:00.000Z',
        location: 'Oficina Central Fresan',
        type: 'Movimentação'
      }
    ],
    hourMeterHistory: [
      { id: 'HM-4', date: '2026-08-10T09:00:00.000Z', value: 620, technician: 'Marcos Silva' }
    ]
  }
];

export const mockInventoryParts: InventoryPart[] = [
  {
    id: 'PART-001',
    name: 'Bateria 12V 100Ah Moura / Heliar Heavy Duty',
    sku: 'BAT-100AH',
    category: 'Baterias',
    quantity: 8,
    minQuantity: 3,
    unit: 'un',
    unitCost: 750.00,
    location: 'Prateleira A1 - Baterias',
    supplier: 'Distribuidora Moura SP',
    notes: 'Bateria recomendada para geradores até 150 kVA. Validade recomendada de troca: 2 anos.'
  },
  {
    id: 'PART-002',
    name: 'Bateria 12V 150Ah Estacionária Selada',
    sku: 'BAT-150AH',
    category: 'Baterias',
    quantity: 2,
    minQuantity: 3,
    unit: 'un',
    unitCost: 1150.00,
    location: 'Prateleira A2 - Baterias Pesadas',
    supplier: 'Distribuidora Heliar SP',
    notes: 'Bateria para geradores acima de 200 kVA. Troca preventiva a cada 24 meses.'
  },
  {
    id: 'PART-003',
    name: 'Óleo Lubrificante Motor 15W40 CI-4 (Balde 20L)',
    sku: 'LUB-15W40-20L',
    category: 'Lubrificantes',
    quantity: 12,
    minQuantity: 4,
    unit: 'un',
    unitCost: 380.00,
    location: 'Área de Lubrificantes - Palete 01',
    supplier: 'Petronas / Shell Distribuição',
    notes: 'Utilizado em revisões de 250h ou 6 meses.'
  },
  {
    id: 'PART-004',
    name: 'Filtro de Óleo Lubrificante Cummins LF16015',
    sku: 'FLT-OIL-LF16015',
    category: 'Filtros',
    quantity: 10,
    minQuantity: 4,
    unit: 'un',
    unitCost: 120.00,
    location: 'Gaveta B3 - Filtros Cummins',
    supplier: 'Fleetguard Brasil',
    notes: 'Troca a cada troca de óleo (250 horas).'
  },
  {
    id: 'PART-005',
    name: 'Filtro Separador de Água / Racor R90P',
    sku: 'FLT-COMB-R90P',
    category: 'Filtros',
    quantity: 1,
    minQuantity: 3,
    unit: 'un',
    unitCost: 145.00,
    location: 'Gaveta B4 - Filtros Combustível',
    supplier: 'Parker Racor',
    notes: 'Item crítico para evitar contaminação por diesel com água.'
  },
  {
    id: 'PART-006',
    name: 'Filtro de Ar Primário AF25125',
    sku: 'FLT-AR-AF25125',
    category: 'Filtros',
    quantity: 4,
    minQuantity: 2,
    unit: 'un',
    unitCost: 230.00,
    location: 'Prateleira C1 - Filtros de Ar',
    supplier: 'Donaldson Brasil',
    notes: 'Troca a cada 500h ou 12 meses.'
  },
  {
    id: 'PART-007',
    name: 'Aditivo Líquido Arrefecimento Radiador Orgânico 5L',
    sku: 'ARREF-ORG-5L',
    category: 'Arrefecimento',
    quantity: 6,
    minQuantity: 2,
    unit: 'un',
    unitCost: 95.00,
    location: 'Prateleira D2 - Arrefecimento',
    supplier: 'Tirreno Química',
    notes: 'Diluição 50/50 com água desmineralizada. Troca anual.'
  },
  {
    id: 'PART-008',
    name: 'Correia Poli-V do Alternador / Bomba d\'Água 8PK1420',
    sku: 'COR-8PK1420',
    category: 'Correias',
    quantity: 5,
    minQuantity: 2,
    unit: 'un',
    unitCost: 110.00,
    location: 'Gaveta E1 - Correias',
    supplier: 'Continental ContiTech',
    notes: 'Inspeção a cada 250h, troca preventiva a cada 24 meses / 1000h.'
  },
  {
    id: 'PART-009',
    name: 'Regulador Automático de Tensão AVR SX460',
    sku: 'EL-AVR-SX460',
    category: 'Elétrica',
    quantity: 3,
    minQuantity: 1,
    unit: 'un',
    unitCost: 420.00,
    location: 'Armário Elétrico - Gaveta 1',
    supplier: 'Stamford Brasil',
    notes: 'Componente de reposição rápida para alternadores sem escova.'
  },
  {
    id: 'PART-010',
    name: 'Solenoide de Parada 12V Tipo Woodward',
    sku: 'EL-SOL-12V',
    category: 'Elétrica',
    quantity: 0,
    minQuantity: 2,
    unit: 'un',
    unitCost: 290.00,
    location: 'Armário Elétrico - Gaveta 2',
    supplier: 'AutoDiesel Peças',
    notes: 'Item em falta no estoque! Necessita pedido urgente.'
  }
];

export const mockStockMovements: StockMovement[] = [
  {
    id: 'MOV-1',
    partId: 'PART-001',
    partName: 'Bateria 12V 100Ah Moura / Heliar Heavy Duty',
    type: 'Entrada',
    quantity: 10,
    date: '2026-07-10T10:00:00.000Z',
    reason: 'Compra de lote para reposição NF-45290',
    technician: 'Administrador',
    unitCost: 750.00
  },
  {
    id: 'MOV-2',
    partId: 'PART-003',
    partName: 'Óleo Lubrificante Motor 15W40 CI-4 (Balde 20L)',
    type: 'Saída',
    quantity: 1,
    date: '2026-06-15T10:00:00.000Z',
    reason: 'Revisão preventiva de 250h',
    technician: 'Carlos Eduardo',
    generatorId: 'GEN-001'
  },
  {
    id: 'MOV-3',
    partId: 'PART-004',
    partName: 'Filtro de Óleo Lubrificante Cummins LF16015',
    type: 'Saída',
    quantity: 1,
    date: '2026-06-15T10:00:00.000Z',
    reason: 'Revisão preventiva de 250h',
    technician: 'Carlos Eduardo',
    generatorId: 'GEN-001'
  },
  {
    id: 'MOV-4',
    partId: 'PART-010',
    partName: 'Solenoide de Parada 12V Tipo Woodward',
    type: 'Saída',
    quantity: 1,
    date: '2026-08-10T11:00:00.000Z',
    reason: 'Troca emergencial gerador GEN-003',
    technician: 'Marcos Silva',
    generatorId: 'GEN-003'
  }
];

export const mockRoutineMaintenanceItems: RoutineMaintenanceItem[] = [
  {
    id: 'ROUT-1',
    generatorId: 'GEN-001',
    partName: 'Bateria 12V 100Ah (Troca a cada 2 anos)',
    partCategory: 'Baterias',
    intervalMonths: 24,
    lastReplacedDate: '2024-09-15T00:00:00.000Z',
    inventoryPartId: 'PART-001',
    notes: 'Substituição preventiva da bateria para evitar falhas no arranque.'
  },
  {
    id: 'ROUT-2',
    generatorId: 'GEN-001',
    partName: 'Óleo Motor 15W40 + Filtro de Óleo',
    partCategory: 'Lubrificantes',
    intervalMonths: 6,
    intervalHours: 250,
    lastReplacedDate: '2026-06-15T00:00:00.000Z',
    lastReplacedHours: 1240,
    inventoryPartId: 'PART-003',
    notes: 'Troca de 20L de óleo 15W40 e elemento filtrante.'
  },
  {
    id: 'ROUT-3',
    generatorId: 'GEN-001',
    partName: 'Líquido de Arrefecimento / Aditivo Radiador',
    partCategory: 'Arrefecimento',
    intervalMonths: 12,
    lastReplacedDate: '2025-08-20T00:00:00.000Z',
    inventoryPartId: 'PART-007',
    notes: 'Limpeza do sistema de arrefecimento e abastecimento com aditivo 50%.'
  },
  {
    id: 'ROUT-4',
    generatorId: 'GEN-002',
    partName: 'Bateria 12V 150Ah (Troca a cada 2 anos)',
    partCategory: 'Baterias',
    intervalMonths: 24,
    lastReplacedDate: '2024-07-20T00:00:00.000Z', // Venceu em 20/07/2026 -> Alerta Crítico!
    inventoryPartId: 'PART-002',
    notes: 'Atenção: Bateria atingiu 24 meses de uso. Necessário agendar troca urgente.'
  },
  {
    id: 'ROUT-5',
    generatorId: 'GEN-002',
    partName: 'Filtro Separador Racor & Filtro de Combustível',
    partCategory: 'Filtros',
    intervalMonths: 6,
    intervalHours: 250,
    lastReplacedDate: '2026-02-10T00:00:00.000Z',
    lastReplacedHours: 2100,
    inventoryPartId: 'PART-005',
    notes: 'Prevenção contra borra de diesel e água no sistema de injeção.'
  },
  {
    id: 'ROUT-6',
    generatorId: 'GEN-003',
    partName: 'Bateria 12V 100Ah (Troca a cada 2 anos)',
    partCategory: 'Baterias',
    intervalMonths: 24,
    lastReplacedDate: '2025-05-10T00:00:00.000Z',
    inventoryPartId: 'PART-001',
    notes: 'Bateria nova instalada no primeiro comissionamento.'
  },
  {
    id: 'ROUT-7',
    generatorId: 'GEN-003',
    partName: 'Correia do Alternador e Bomba',
    partCategory: 'Correias',
    intervalMonths: 24,
    intervalHours: 1000,
    lastReplacedDate: '2024-10-01T00:00:00.000Z',
    lastReplacedHours: 100,
    inventoryPartId: 'PART-008',
    notes: 'Inspeção periódica de tensão e fissuras na borracha.'
  }
];

export const mockChecklistTemplates: ChecklistTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Checklist de Entrega / Inspeção Padrão',
    questions: [
      { id: 'q1', text: 'Nível de óleo do motor adequado?', type: 'boolean' },
      { id: 'q2', text: 'Nível de combustível (L)', type: 'number' },
      { id: 'q3', text: 'Tensão das baterias (V)', type: 'number' },
      { id: 'q4', text: 'Limpeza e conservação geral', type: 'boolean' },
      { id: 'q5', text: 'Observações adicionais', type: 'text' }
    ]
  }
];

export const mockEmployees: Employee[] = [
  { id: 'emp-1', name: 'Administrador', role: 'Admin', email: 'admin@fresan.com', password: '123' },
  { id: 'emp-2', name: 'Técnico Responsável', role: 'Técnico', email: 'tecnico@fresan.com', password: '123' }
];

export const mockRentals: Rental[] = [
  {
    id: 'RENT-001',
    generatorId: 'GEN-001',
    companyName: 'Construtora Metropolitana SA',
    clientId: 'cli-1',
    startDate: '2026-07-01',
    endDate: '2026-09-01',
    responsibleName: 'Eng. Roberto Alves',
    status: 'Ativo',
    value: 4800
  }
];

export const mockClients: Client[] = [
  {
    id: 'cli-1',
    name: 'Construtora Metropolitana SA',
    cnpj: '12.345.678/0001-90',
    email: 'compras@metropolitana.com.br',
    phone: '(11) 98765-4321',
    address: 'Av. Brigadeiro Faria Lima, 2000 - SP'
  },
  {
    id: 'cli-2',
    name: 'Shopping Plaza Sul',
    cnpj: '98.765.432/0001-10',
    email: 'manutencao@plazasul.com.br',
    phone: '(11) 91234-5678',
    address: 'Av. Prof. Abraão de Morais, 1200 - SP'
  }
];


