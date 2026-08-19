import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Generator, 
  Rental, 
  Client, 
  Employee, 
  SignedDocument, 
  ChecklistTemplate,
  InventoryPart,
  StockMovement,
  RoutineMaintenanceItem
} from '../types';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://zrgihnukvweexaojbcwm.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZ2lobnVrdndlZXhhb2piY3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MjI0NDQsImV4cCI6MjEwMDk5ODQ0NH0.mlPBPQ7k3G7n1F1W09oSob2vdwhgcv9bwKV9kgg5cyg';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// SQL Schema script for user reference / quick setup in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `CREATE TABLE IF NOT EXISTS generators (
  id TEXT PRIMARY KEY,
  model TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  status TEXT NOT NULL,
  current_location TEXT NOT NULL,
  power_kva NUMERIC NOT NULL,
  year INT NOT NULL,
  maintenance_history JSONB DEFAULT '[]'::jsonb,
  location_history JSONB DEFAULT '[]'::jsonb,
  hour_meter_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rentals (
  id TEXT PRIMARY KEY,
  generator_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  client_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  responsible_name TEXT,
  end_date TEXT,
  is_indefinite BOOLEAN DEFAULT false,
  status TEXT NOT NULL,
  value NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signed_documents (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  generator_id TEXT NOT NULL,
  checklist_id TEXT,
  maintenance_id TEXT,
  technician_name TEXT NOT NULL,
  responsible_name TEXT NOT NULL,
  technician_signature TEXT,
  responsible_signature TEXT,
  company_name TEXT,
  full_checklist JSONB,
  maintenance_details JSONB,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_parts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  min_quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'un',
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  location TEXT,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  part_name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  date TEXT NOT NULL,
  reason TEXT NOT NULL,
  technician TEXT NOT NULL,
  generator_id TEXT,
  unit_cost NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routine_maintenance_items (
  id TEXT PRIMARY KEY,
  generator_id TEXT NOT NULL,
  part_name TEXT NOT NULL,
  part_category TEXT NOT NULL,
  interval_months INT,
  interval_hours INT,
  last_replaced_date TEXT NOT NULL,
  last_replaced_hours NUMERIC,
  inventory_part_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE generators ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_maintenance_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all generators" ON generators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all rentals" ON rentals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all signed_documents" ON signed_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all checklist_templates" ON checklist_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all inventory_parts" ON inventory_parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all routine_maintenance_items" ON routine_maintenance_items FOR ALL USING (true) WITH CHECK (true);
`;

// Supabase API Helper Service
export const supabaseService = {
  // Check Connection
  async checkConnection(): Promise<{ ok: boolean; message: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { ok: false, message: 'Supabase não configurado no .env (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)' };
    }
    try {
      const { data, error } = await supabase.from('generators').select('id').limit(1);
      if (error) {
        return { ok: false, message: `Erro ao conectar no Supabase: ${error.message}` };
      }
      return { ok: true, message: 'Conectado com sucesso ao Supabase!' };
    } catch (err: any) {
      return { ok: false, message: err.message || 'Falha ao conectar' };
    }
  },

  // Generators
  async fetchGenerators(): Promise<Generator[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('generators').select('*');
    if (error || !data) return null;
    return data.map((item: any) => ({
      id: item.id,
      model: item.model,
      serialNumber: item.serial_number,
      status: item.status,
      currentLocation: item.current_location,
      powerKva: Number(item.power_kva),
      year: Number(item.year),
      maintenanceHistory: item.maintenance_history || [],
      locationHistory: item.location_history || [],
      hourMeterHistory: item.hour_meter_history || []
    }));
  },

  async saveGenerator(gen: Generator): Promise<boolean> {
    if (!supabase) return false;
    const payload = {
      id: gen.id,
      model: gen.model,
      serial_number: gen.serialNumber,
      status: gen.status,
      current_location: gen.currentLocation,
      power_kva: gen.powerKva,
      year: gen.year,
      maintenance_history: gen.maintenanceHistory,
      location_history: gen.locationHistory,
      hour_meter_history: gen.hourMeterHistory
    };
    const { error } = await supabase.from('generators').upsert(payload);
    return !error;
  },

  // Rentals
  async fetchRentals(): Promise<Rental[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('rentals').select('*');
    if (error || !data) return null;
    return data.map((item: any) => ({
      id: item.id,
      generatorId: item.generator_id,
      companyName: item.company_name,
      clientId: item.client_id,
      startDate: item.start_date,
      responsibleName: item.responsible_name,
      endDate: item.end_date,
      isIndefinite: item.is_indefinite,
      status: item.status,
      value: item.value ? Number(item.value) : undefined
    }));
  },

  async saveRental(rental: Rental): Promise<boolean> {
    if (!supabase) return false;
    const payload = {
      id: rental.id,
      generator_id: rental.generatorId,
      company_name: rental.companyName,
      client_id: rental.clientId,
      start_date: rental.startDate,
      responsible_name: rental.responsibleName,
      end_date: rental.endDate,
      is_indefinite: rental.isIndefinite,
      status: rental.status,
      value: rental.value
    };
    const { error } = await supabase.from('rentals').upsert(payload);
    return !error;
  },

  // Clients
  async fetchClients(): Promise<Client[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('clients').select('*');
    if (error || !data) return null;
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      cnpj: item.cnpj,
      email: item.email,
      phone: item.phone,
      address: item.address
    }));
  },

  async saveClient(client: Client): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('clients').upsert(client);
    return !error;
  },

  // Employees
  async fetchEmployees(): Promise<Employee[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('employees').select('*');
    if (error || !data) return null;
    return data;
  },

  async saveEmployee(emp: Employee): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('employees').upsert(emp);
    return !error;
  },

  async deleteEmployee(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('employees').delete().eq('id', id);
    return !error;
  },

  async deleteGenerator(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('generators').delete().eq('id', id);
    return !error;
  },

  async deleteRental(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('rentals').delete().eq('id', id);
    return !error;
  },

  async deleteClient(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    return !error;
  },

  async deleteSignedDocument(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('signed_documents').delete().eq('id', id);
    return !error;
  },

  // Checklist Templates
  async fetchChecklistTemplates(): Promise<ChecklistTemplate[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('checklist_templates').select('*');
    if (error || !data) return null;
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      questions: item.questions || []
    }));
  },

  async saveChecklistTemplate(template: ChecklistTemplate): Promise<boolean> {
    if (!supabase) return false;
    const payload = {
      id: template.id,
      name: template.name,
      questions: template.questions
    };
    const { error } = await supabase.from('checklist_templates').upsert(payload);
    return !error;
  },

  async deleteChecklistTemplate(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('checklist_templates').delete().eq('id', id);
    return !error;
  },

  // Signed Documents
  async fetchSignedDocuments(): Promise<SignedDocument[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('signed_documents').select('*');
    if (error || !data) return null;
    return data.map((item: any) => ({
      id: item.id,
      date: item.date,
      generatorId: item.generator_id,
      checklistId: item.checklist_id,
      maintenanceId: item.maintenance_id,
      technicianName: item.technician_name,
      responsibleName: item.responsible_name,
      technicianSignature: item.technician_signature,
      responsibleSignature: item.responsible_signature,
      companyName: item.company_name,
      fullChecklist: item.full_checklist,
      maintenanceDetails: item.maintenance_details,
      title: item.title,
      docType: item.doc_type
    }));
  },

  async saveSignedDocument(doc: SignedDocument): Promise<boolean> {
    if (!supabase) return false;
    const payload = {
      id: doc.id,
      date: doc.date,
      generator_id: doc.generatorId,
      checklist_id: doc.checklistId,
      maintenance_id: doc.maintenanceId,
      technician_name: doc.technicianName,
      responsible_name: doc.responsibleName,
      technician_signature: doc.technicianSignature,
      responsible_signature: doc.responsibleSignature,
      company_name: doc.companyName,
      full_checklist: doc.fullChecklist,
      maintenance_details: doc.maintenanceDetails,
      title: doc.title,
      doc_type: doc.docType
    };
    const { error } = await supabase.from('signed_documents').upsert(payload);
    return !error;
  },

  // Inventory Parts
  async fetchInventoryParts(): Promise<InventoryPart[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('inventory_parts').select('*');
    if (error || !data) return null;
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: Number(item.quantity) || 0,
      minQuantity: Number(item.min_quantity) || 0,
      unit: item.unit || 'un',
      unitCost: Number(item.unit_cost) || 0,
      location: item.location || '',
      supplier: item.supplier || '',
      notes: item.notes || '',
      createdAt: item.created_at
    }));
  },

  async saveInventoryPart(part: InventoryPart): Promise<boolean> {
    if (!supabase) return false;
    const payload = {
      id: part.id,
      name: part.name,
      sku: part.sku,
      category: part.category,
      quantity: part.quantity,
      min_quantity: part.minQuantity,
      unit: part.unit,
      unit_cost: part.unitCost,
      location: part.location,
      supplier: part.supplier,
      notes: part.notes
    };
    const { error } = await supabase.from('inventory_parts').upsert(payload);
    return !error;
  },

  async deleteInventoryPart(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('inventory_parts').delete().eq('id', id);
    return !error;
  },

  // Stock Movements
  async fetchStockMovements(): Promise<StockMovement[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('stock_movements').select('*').order('date', { ascending: false });
    if (error || !data) return null;
    return data.map((item: any) => ({
      id: item.id,
      partId: item.part_id,
      partName: item.part_name,
      type: item.type,
      quantity: Number(item.quantity) || 0,
      date: item.date,
      reason: item.reason || '',
      technician: item.technician || '',
      generatorId: item.generator_id,
      unitCost: item.unit_cost ? Number(item.unit_cost) : undefined
    }));
  },

  async saveStockMovement(movement: StockMovement): Promise<boolean> {
    if (!supabase) return false;
    const payload = {
      id: movement.id,
      part_id: movement.partId,
      part_name: movement.partName,
      type: movement.type,
      quantity: movement.quantity,
      date: movement.date,
      reason: movement.reason,
      technician: movement.technician,
      generator_id: movement.generatorId,
      unit_cost: movement.unitCost
    };
    const { error } = await supabase.from('stock_movements').upsert(payload);
    return !error;
  },

  // Routine Maintenance Items (Lembretes de Trocas Rotineiras como Baterias)
  async fetchRoutineItems(): Promise<RoutineMaintenanceItem[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('routine_maintenance_items').select('*');
    if (error || !data) return null;
    return data.map((item: any) => ({
      id: item.id,
      generatorId: item.generator_id,
      partName: item.part_name,
      partCategory: item.part_category,
      intervalMonths: item.interval_months ? Number(item.interval_months) : undefined,
      intervalHours: item.interval_hours ? Number(item.interval_hours) : undefined,
      lastReplacedDate: item.last_replaced_date,
      lastReplacedHours: item.last_replaced_hours ? Number(item.last_replaced_hours) : undefined,
      inventoryPartId: item.inventory_part_id,
      notes: item.notes || ''
    }));
  },

  async saveRoutineItem(item: RoutineMaintenanceItem): Promise<boolean> {
    if (!supabase) return false;
    const payload = {
      id: item.id,
      generator_id: item.generatorId,
      part_name: item.partName,
      part_category: item.partCategory,
      interval_months: item.intervalMonths,
      interval_hours: item.intervalHours,
      last_replaced_date: item.lastReplacedDate,
      last_replaced_hours: item.lastReplacedHours,
      inventory_part_id: item.inventoryPartId,
      notes: item.notes
    };
    const { error } = await supabase.from('routine_maintenance_items').upsert(payload);
    return !error;
  },

  async deleteRoutineItem(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('routine_maintenance_items').delete().eq('id', id);
    return !error;
  }
};
