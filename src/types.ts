export type GeneratorStatus = 'Disponível' | 'Alugado' | 'Manutenção';

export type MaintenanceType = 'Preventiva' | 'Corretiva';
export type DocType = 'Checklist' | 'Relatório' | 'Orçamento';

export interface MaintenancePart {
  id: string;
  name: string;
  value: number;
}

export interface MaintenanceService {
  id: string;
  name: string;
  value: number;
}

export interface MaintenanceEvent {
  id: string;
  date: string;
  description: string;
  technician: string;
  type: MaintenanceType;
  cost?: number;
  parts?: MaintenancePart[];
  services?: MaintenanceService[];
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

export interface SignedDocument {
  id: string;
  date: string;
  generatorId: string;
  checklistId?: string;
  maintenanceId?: string;
  technicianName: string;
  responsibleName: string;
  technicianSignature: string; // base64
  responsibleSignature: string; // base64
  fullChecklist?: ChecklistResult;
  maintenanceDetails?: MaintenanceEvent;
  title: string;
  docType: DocType;
}

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
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
  clientId: string;
  startDate: string;
  endDate?: string;
  status: 'Ativo' | 'Finalizado';
  value?: number;
}
