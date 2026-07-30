import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Generator, Rental, Client, Employee, SignedDocument, ChecklistTemplate } from '../types';

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

ALTER TABLE generators ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select generators" ON generators;
DROP POLICY IF EXISTS "Allow public insert generators" ON generators;
DROP POLICY IF EXISTS "Allow public update generators" ON generators;
DROP POLICY IF EXISTS "Allow public delete generators" ON generators;
CREATE POLICY "Allow public select generators" ON generators FOR SELECT USING (true);
CREATE POLICY "Allow public insert generators" ON generators FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update generators" ON generators FOR UPDATE USING (true);
CREATE POLICY "Allow public delete generators" ON generators FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select rentals" ON rentals;
DROP POLICY IF EXISTS "Allow public insert rentals" ON rentals;
DROP POLICY IF EXISTS "Allow public update rentals" ON rentals;
DROP POLICY IF EXISTS "Allow public delete rentals" ON rentals;
CREATE POLICY "Allow public select rentals" ON rentals FOR SELECT USING (true);
CREATE POLICY "Allow public insert rentals" ON rentals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update rentals" ON rentals FOR UPDATE USING (true);
CREATE POLICY "Allow public delete rentals" ON rentals FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select clients" ON clients;
DROP POLICY IF EXISTS "Allow public insert clients" ON clients;
DROP POLICY IF EXISTS "Allow public update clients" ON clients;
DROP POLICY IF EXISTS "Allow public delete clients" ON clients;
CREATE POLICY "Allow public select clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update clients" ON clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete clients" ON clients FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select employees" ON employees;
DROP POLICY IF EXISTS "Allow public insert employees" ON employees;
DROP POLICY IF EXISTS "Allow public update employees" ON employees;
DROP POLICY IF EXISTS "Allow public delete employees" ON employees;
CREATE POLICY "Allow public select employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow public insert employees" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update employees" ON employees FOR UPDATE USING (true);
CREATE POLICY "Allow public delete employees" ON employees FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select signed_documents" ON signed_documents;
DROP POLICY IF EXISTS "Allow public insert signed_documents" ON signed_documents;
DROP POLICY IF EXISTS "Allow public update signed_documents" ON signed_documents;
CREATE POLICY "Allow public select signed_documents" ON signed_documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert signed_documents" ON signed_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update signed_documents" ON signed_documents FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public select checklist_templates" ON checklist_templates;
DROP POLICY IF EXISTS "Allow public insert checklist_templates" ON checklist_templates;
DROP POLICY IF EXISTS "Allow public update checklist_templates" ON checklist_templates;
CREATE POLICY "Allow public select checklist_templates" ON checklist_templates FOR SELECT USING (true);
CREATE POLICY "Allow public insert checklist_templates" ON checklist_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update checklist_templates" ON checklist_templates FOR UPDATE USING (true);
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
  }
};
