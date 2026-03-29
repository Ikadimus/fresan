import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  ClipboardCheck, 
  Users, 
  Truck, 
  Settings, 
  Plus, 
  Search, 
  ChevronRight, 
  History, 
  Wrench, 
  MapPin, 
  CheckCircle2,
  Menu,
  X,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { 
  Generator, 
  ChecklistTemplate, 
  Employee, 
  Rental, 
  GeneratorStatus
} from './types';
import { 
  mockGenerators, 
  mockChecklistTemplates, 
  mockEmployees, 
  mockRentals 
} from './lib/mockData';

// --- Components ---

const FresanLogo = ({ size = 36 }: { size?: number }) => (
  <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* Hexagon Background */}
      <path 
        d="M50 5 L90 28 L90 72 L50 95 L10 72 L10 28 Z" 
        fill="#f2a900" 
      />
      {/* Inner Dark Hexagon */}
      <path 
        d="M50 15 L80 32 L80 68 L50 85 L20 68 L20 32 Z" 
        fill="#1a1a1a" 
      />
      {/* Lightning Bolt */}
      <path 
        d="M55 25 L35 55 L50 55 L45 75 L65 45 L50 45 Z" 
        fill="#ffffff" 
      />
    </svg>
  </div>
);

const NavItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative ${
      active 
        ? 'text-brand-primary' 
        : 'text-zinc-400 hover:text-white'
    }`}
  >
    <Icon size={18} />
    <span className="font-medium text-sm whitespace-nowrap">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-nav-indicator"
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-primary rounded-full"
      />
    )}
  </button>
);

const Card = ({ 
  children, 
  className = "", 
  onClick 
}: { 
  children: React.ReactNode, 
  className?: string,
  onClick?: () => void,
  key?: string | number
}) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 ${className} ${onClick ? 'cursor-pointer' : ''}`}
  >
    {children}
  </div>
);

const Badge = ({ status }: { status: GeneratorStatus | string }) => {
  const colors: Record<string, string> = {
    'Disponível': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Alugado': 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    'Manutenção': 'bg-amber-50 text-amber-700 border-amber-100',
    'Ativo': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Finalizado': 'bg-zinc-50 text-zinc-700 border-zinc-100',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status] || 'bg-zinc-50 text-zinc-700 border-zinc-100'}`}>
      {status}
    </span>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rig' | 'checklists' | 'employees' | 'rentals'>('dashboard');
  const [generators] = useState<Generator[]>(mockGenerators);
  const [templates] = useState<ChecklistTemplate[]>(mockChecklistTemplates);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [rentals] = useState<Rental[]>(mockRentals);
  const [selectedGenerator, setSelectedGenerator] = useState<Generator | null>(null);

  // Stats for Dashboard
  const stats = {
    total: generators.length,
    available: generators.filter(g => g.status === 'Disponível').length,
    rented: generators.filter(g => g.status === 'Alugado').length,
    maintenance: generators.filter(g => g.status === 'Manutenção').length,
  };

  const pieData = [
    { name: 'Disponível', value: stats.available, color: '#10b981' },
    { name: 'Alugado', value: stats.rented, color: '#3b82f6' },
    { name: 'Manutenção', value: stats.maintenance, color: '#f59e0b' },
  ];

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-zinc-50 rounded-lg text-zinc-600">
              <Zap size={20} />
            </div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-900">{stats.total}</h3>
            <p className="text-sm text-zinc-500 mt-1">Geradores cadastrados</p>
          </div>
        </Card>
        <Card className="flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Disponíveis</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-900">{stats.available}</h3>
            <p className="text-sm text-zinc-500 mt-1">Prontos para locação</p>
          </div>
        </Card>
        <Card className="flex flex-col justify-between border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Truck size={20} />
            </div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Alugados</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-900">{stats.rented}</h3>
            <p className="text-sm text-zinc-500 mt-1">Em operação externa</p>
          </div>
        </Card>
        <Card className="flex flex-col justify-between border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Wrench size={20} />
            </div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Manutenção</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-zinc-900">{stats.maintenance}</h3>
            <p className="text-sm text-zinc-500 mt-1">Em reparo ou revisão</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <h4 className="text-lg font-bold text-zinc-900 mb-6">Status da Frota</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8f8f8' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h4 className="text-lg font-bold text-zinc-900 mb-6">Distribuição</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-600">{item.name}</span>
                </div>
                <span className="font-bold text-zinc-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderRIG = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="pl-4 text-zinc-400">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar por modelo, série ou ID..." 
          className="flex-1 py-2 outline-none text-sm text-zinc-900"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {generators.map((gen) => (
          <Card key={gen.id} className="hover:border-brand-primary/30 transition-all cursor-pointer group" onClick={() => setSelectedGenerator(gen)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-600 group-hover:bg-brand-secondary group-hover:text-white transition-colors">
                  <Zap size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-zinc-900">{gen.model}</h3>
                    <Badge status={gen.status} />
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">Série: {gen.serialNumber} • ID: {gen.id}</p>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end gap-1">
                <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                  <MapPin size={14} />
                  <span>{gen.currentLocation}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-xs text-zinc-400 flex items-center gap-1">
                    <History size={12} />
                    <span>{gen.locationHistory.length} Movimentações</span>
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-1">
                    <Wrench size={12} />
                    <span>{gen.maintenanceHistory.length} Manutenções</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:block text-zinc-300 group-hover:text-brand-primary transition-colors">
                <ChevronRight size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Generator Detail Modal */}
      <AnimatePresence>
        {selectedGenerator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGenerator(null)}
              className="absolute inset-0 bg-brand-secondary/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-secondary text-white rounded-xl flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">{selectedGenerator.model}</h2>
                    <p className="text-sm text-zinc-500">RIG: {selectedGenerator.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedGenerator(null)}
                  className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Informações Gerais</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Status</span>
                          <Badge status={selectedGenerator.status} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Série</span>
                          <span className="font-medium text-zinc-900">{selectedGenerator.serialNumber}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Potência</span>
                          <span className="font-medium text-zinc-900">{selectedGenerator.powerKva} kVA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Ano</span>
                          <span className="font-medium text-zinc-900">{selectedGenerator.year}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Localização</span>
                          <span className="font-medium text-zinc-900 text-right">{selectedGenerator.currentLocation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-100">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Ações Rápidas</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <button className="flex items-center gap-2 w-full px-4 py-2.5 bg-brand-primary text-brand-secondary rounded-xl text-sm font-bold transition-colors shadow-sm">
                          <ClipboardCheck size={16} />
                          Novo Checklist
                        </button>
                        <button className="flex items-center gap-2 w-full px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-sm font-medium transition-colors">
                          <Wrench size={16} />
                          Registrar Manutenção
                        </button>
                        <button className="flex items-center gap-2 w-full px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-sm font-medium transition-colors">
                          <ArrowRightLeft size={16} />
                          Movimentar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <History size={14} />
                        Histórico de Movimentação
                      </h4>
                      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-zinc-100">
                        {selectedGenerator.locationHistory.length > 0 ? selectedGenerator.locationHistory.map((lh, idx) => (
                          <div key={lh.id} className="relative flex items-start gap-6">
                            <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center z-10 ${idx === 0 ? 'bg-brand-primary text-brand-secondary' : 'bg-white border-2 border-zinc-100 text-zinc-400'}`}>
                              <MapPin size={16} />
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-zinc-900 text-sm">{lh.location}</h5>
                                <span className="text-[10px] text-zinc-400 font-medium">{format(new Date(lh.date), "dd MMM yyyy", { locale: ptBR })}</span>
                              </div>
                              <p className="text-xs text-zinc-500 mt-1">{lh.type} {lh.company ? `para ${lh.company}` : ''}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-zinc-400 italic pl-12">Nenhum histórico registrado.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Wrench size={14} />
                        Histórico de Manutenção
                      </h4>
                      <div className="space-y-3">
                        {selectedGenerator.maintenanceHistory.length > 0 ? selectedGenerator.maintenanceHistory.map((m) => (
                          <div key={m.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-zinc-900 text-sm">{m.description}</h5>
                                <p className="text-xs text-zinc-500 mt-1">Técnico: {m.technician}</p>
                              </div>
                              <span className="text-[10px] text-zinc-400 font-medium">{format(new Date(m.date), "dd MMM yyyy", { locale: ptBR })}</span>
                            </div>
                            {m.cost && (
                              <div className="mt-2 text-xs font-bold text-brand-primary">
                                R$ {m.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            )}
                          </div>
                        )) : (
                          <p className="text-sm text-zinc-400 italic">Nenhuma manutenção registrada.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderChecklists = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900">Configuração de Checklists</h2>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors">
          <Plus size={18} />
          <span>Novo Modelo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tmpl) => (
          <Card key={tmpl.id} className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-zinc-50 rounded-xl text-zinc-600">
                <ClipboardCheck size={24} />
              </div>
              <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900">
                <Settings size={18} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-zinc-900">{tmpl.name}</h3>
            <p className="text-sm text-zinc-500 mt-1 mb-6">{tmpl.questions.length} perguntas configuradas</p>
            
            <div className="flex-1 space-y-3">
              {tmpl.questions.slice(0, 3).map((q) => (
                <div key={q.id} className="flex items-center gap-3 text-sm text-zinc-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                  <span className="flex-1 truncate">{q.text}</span>
                  <span className="text-[10px] font-bold uppercase text-zinc-400">{q.type}</span>
                </div>
              ))}
              {tmpl.questions.length > 3 && (
                <p className="text-xs text-zinc-400 font-medium">+ {tmpl.questions.length - 3} outras perguntas...</p>
              )}
            </div>

            <button className="mt-6 w-full py-2.5 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white rounded-xl text-sm font-bold transition-all">
              Editar Perguntas
            </button>
          </Card>
        ))}
        
        <button className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 rounded-2xl hover:border-zinc-400 hover:bg-zinc-50 transition-all group">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-600 mb-4">
            <Plus size={24} />
          </div>
          <span className="font-bold text-zinc-500 group-hover:text-zinc-900">Criar Novo Modelo</span>
          <span className="text-xs text-zinc-400 mt-1">Personalize as perguntas do seu jeito</span>
        </button>
      </div>
    </div>
  );

  const renderEmployees = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900">Gestão de Funcionários</h2>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors">
          <Plus size={18} />
          <span>Novo Funcionário</span>
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Cargo</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 font-bold text-xs">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-bold text-zinc-900 text-sm">{emp.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    emp.role === 'Admin' ? 'bg-purple-50 text-purple-600' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {emp.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">{emp.email}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900">
                    <Settings size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const renderRentals = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900">Controle de Locações</h2>
        <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors">
          <Plus size={18} />
          <span>Nova Locação</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rentals.map((rental) => {
          const gen = generators.find(g => g.id === rental.generatorId);
          return (
            <Card key={rental.id} className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <Badge status={rental.status} />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">#{rental.id}</span>
              </div>
              
              <h3 className="text-lg font-bold text-zinc-900 mb-1">{rental.companyName}</h3>
              <p className="text-sm text-zinc-500 mb-6 flex items-center gap-1.5">
                <Truck size={14} />
                Gerador: {gen?.model || rental.generatorId}
              </p>

              <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Início</p>
                  <p className="text-sm font-bold text-zinc-900">{format(new Date(rental.startDate), "dd/MM/yyyy")}</p>
                </div>
                <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-900 font-bold text-xs flex items-center gap-1">
                  Detalhes
                  <ChevronRight size={14} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-brand-secondary border-b border-white/10 px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0 w-64">
            <FresanLogo size={42} />
            <div className="flex flex-col leading-none">
              <h1 className="text-2xl font-black tracking-tighter text-white">Fresan</h1>
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest -mt-1">Geradores</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2 no-scrollbar">
            <NavItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <NavItem 
              icon={Zap} 
              label="Geradores" 
              active={activeTab === 'rig'} 
              onClick={() => setActiveTab('rig')} 
            />
            <NavItem 
              icon={ClipboardCheck} 
              label="Checklists" 
              active={activeTab === 'checklists'} 
              onClick={() => setActiveTab('checklists')} 
            />
            <NavItem 
              icon={Truck} 
              label="Locações" 
              active={activeTab === 'rentals'} 
              onClick={() => setActiveTab('rentals')} 
            />
            <NavItem 
              icon={Users} 
              label="Equipe" 
              active={activeTab === 'employees'} 
              onClick={() => setActiveTab('employees')} 
            />
          </nav>

          {/* User Profile */}
          <div className="flex items-center justify-end gap-3 shrink-0 w-64">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-white">Ricardo Lima</p>
              <p className="text-[10px] text-zinc-400">Admin</p>
            </div>
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-xs border border-white/20">
              RL
            </div>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {activeTab === 'dashboard' && 'Visão Geral'}
                {activeTab === 'rig' && 'Gestão de Ativos'}
                {activeTab === 'checklists' && 'Processos'}
                {activeTab === 'rentals' && 'Operações'}
                {activeTab === 'employees' && 'Equipe'}
              </h2>
              <p className="text-3xl font-black text-zinc-900 tracking-tight">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'rig' && 'Geradores'}
                {activeTab === 'checklists' && 'Checklists'}
                {activeTab === 'rentals' && 'Locações'}
                {activeTab === 'employees' && 'Funcionários'}
              </p>
            </div>
            
            <div className="hidden sm:block">
              <button className="flex items-center gap-2 bg-brand-primary text-brand-secondary px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform">
                <Plus size={18} />
                {activeTab === 'rig' ? 'Novo Gerador' : 
                 activeTab === 'checklists' ? 'Novo Modelo' :
                 activeTab === 'rentals' ? 'Nova Locação' :
                 activeTab === 'employees' ? 'Novo Funcionário' : 'Ação Rápida'}
              </button>
            </div>
          </div>

          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'rig' && renderRIG()}
          {activeTab === 'checklists' && renderChecklists()}
          {activeTab === 'employees' && renderEmployees()}
          {activeTab === 'rentals' && renderRentals()}
        </div>
      </main>
    </div>
  );
}
