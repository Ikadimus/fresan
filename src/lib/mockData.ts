import { Generator, ChecklistTemplate, Employee, Rental, Client } from '../types';

export const mockGenerators: Generator[] = [];

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

export const mockRentals: Rental[] = [];

export const mockClients: Client[] = [];

