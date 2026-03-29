export type GeneratorStatus = 'Disponível' | 'Alugado' | 'Manutenção';

export interface MaintenanceEvent {
  id: string;
  date: string;
  description: string;
  technician: string;
  cost?: number;
}

export interface LocationHistory {
  id: string;
  date: string;
  location: string;
  company?: string;
  type: 'Entrega' | 'Retirada' | 'Movimentação';
}

export interface Generator {
  id: string;
  model: string;
  serialNumber: string;
  status: GeneratorStatus;
  currentLocation: string;
  powerKva: number;
  year: number;
  maintenanceHistory: MaintenanceEvent[];
  locationHistory: LocationHistory[];
}

export type QuestionType = 'boolean' | 'text' | 'number';

export interface ChecklistQuestion {
  id: string;
  text: string;
  type: QuestionType;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  questions: ChecklistQuestion[];
}

export interface ChecklistResult {
  id: string;
  generatorId: string;
  templateId: string;
  date: string;
  employeeId: string;
  answers: Record<string, any>;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Admin' | 'Técnico' | 'Operador';
  email: string;
}

export interface Rental {
  id: string;
  generatorId: string;
  companyName: string;
  startDate: string;
  endDate?: string;
  status: 'Ativo' | 'Finalizado';
}
