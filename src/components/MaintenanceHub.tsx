import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Battery, 
  Droplets, 
  Filter as FilterIcon, 
  Zap, 
  RefreshCw, 
  Boxes, 
  Trash2, 
  Edit, 
  X, 
  ChevronRight, 
  FileText, 
  DollarSign, 
  ArrowRight,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Generator, 
  RoutineMaintenanceItem, 
  InventoryPart, 
  InventoryCategory, 
  MaintenanceEvent, 
  MaintenanceType, 
  StockMovement, 
  Employee 
} from '../types';
import { format, addMonths, differenceInDays, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MaintenanceHubProps {
  generators: Generator[];
  routineItems: RoutineMaintenanceItem[];
  inventoryParts: InventoryPart[];
  currentUser: Employee | null;
  onSaveRoutineItem: (item: RoutineMaintenanceItem) => Promise<void> | void;
  onDeleteRoutineItem: (id: string) => Promise<void> | void;
  onRecordMaintenance: (
    generatorId: string, 
    maintenance: MaintenanceEvent, 
    usedPartId?: string, 
    usedPartQty?: number
  ) => Promise<void> | void;
  onSelectGenerator: (gen: Generator) => void;
}

const CATEGORIES: InventoryCategory[] = [
  'Baterias',
  'Lubrificantes',
  'Filtros',
  'Arrefecimento',
  'Correias',
  'Elétrica',
  'Mecânica',
  'Outros'
];

export const MaintenanceHub: React.FC<MaintenanceHubProps> = ({
  generators,
  routineItems,
  inventoryParts,
  currentUser,
  onSaveRoutineItem,
  onDeleteRoutineItem,
  onRecordMaintenance,
  onSelectGenerator
}) => {
  const [activeTab, setActiveTab] = useState<'reminders' | 'history'>('reminders');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'soon' | 'ok'>('all');
  const [generatorFilter, setGeneratorFilter] = useState<string>('all');

  // Modals
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineMaintenanceItem | null>(null);

  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedRoutineForRenew, setSelectedRoutineForRenew] = useState<RoutineMaintenanceItem | null>(null);

  const [showQuickMaintenanceModal, setShowQuickMaintenanceModal] = useState(false);

  // Form Fields for Routine Item
  const [routineGeneratorId, setRoutineGeneratorId] = useState('');
  const [routinePartName, setRoutinePartName] = useState('');
  const [routineCategory, setRoutineCategory] = useState<InventoryCategory>('Baterias');
  const [routineMonths, setRoutineMonths] = useState<string>('24');
  const [routineHours, setRoutineHours] = useState<string>('');
  const [routineLastDate, setRoutineLastDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [routineLastHours, setRoutineLastHours] = useState<string>('');
  const [routinePartId, setRoutinePartId] = useState<string>('');
  const [routineNotes, setRoutineNotes] = useState('');

  // Form Fields for Renew Cycle
  const [renewDate, setRenewDate] = useState(new Date().toISOString().split('T')[0]);
  const [renewHours, setRenewHours] = useState('');
  const [renewTechnician, setRenewTechnician] = useState(currentUser?.name || 'Técnico Responsável');
  const [renewDeductStock, setRenewDeductStock] = useState(true);
  const [renewSelectedPartId, setRenewSelectedPartId] = useState('');
  const [renewCost, setRenewCost] = useState('0');
  const [renewNotes, setRenewNotes] = useState('');

  // Helper calculation for routine items status
  const calculateRoutineStatus = (item: RoutineMaintenanceItem) => {
    const lastDate = new Date(item.lastReplacedDate);
    const months = item.intervalMonths || 24;
    const dueDate = addMonths(lastDate, months);
    const today = new Date();
    const daysRemaining = differenceInDays(dueDate, today);
    const totalDaysInInterval = differenceInDays(dueDate, lastDate) || (months * 30);
    const daysElapsed = differenceInDays(today, lastDate);

    const progressPercentage = Math.min(100, Math.max(0, (daysElapsed / totalDaysInInterval) * 100));

    // Also check hours if configured
    const gen = generators.find(g => g.id === item.generatorId);
    const latestHourMeter = gen?.hourMeterHistory && gen.hourMeterHistory.length > 0
      ? gen.hourMeterHistory[gen.hourMeterHistory.length - 1].value
      : null;

    let hoursRemaining: number | null = null;
    let isHoursCritical = false;
    if (item.intervalHours && latestHourMeter !== null && item.lastReplacedHours !== undefined) {
      const hoursElapsed = latestHourMeter - item.lastReplacedHours;
      hoursRemaining = item.intervalHours - hoursElapsed;
      if (hoursRemaining <= 0) isHoursCritical = true;
    }

    const isCritical = daysRemaining <= 0 || isHoursCritical;
    const isSoon = !isCritical && (daysRemaining <= 30 || (hoursRemaining !== null && hoursRemaining <= 30));
    const isOk = !isCritical && !isSoon;

    return {
      dueDate,
      daysRemaining,
      daysElapsed,
      progressPercentage,
      latestHourMeter,
      hoursRemaining,
      isCritical,
      isSoon,
      isOk,
      urgency: isCritical ? 'critical' : isSoon ? 'soon' : 'ok'
    };
  };

  // Filtered Routines
  const enrichedRoutines = routineItems.map(item => ({
    item,
    status: calculateRoutineStatus(item),
    generator: generators.find(g => g.id === item.generatorId),
    inventoryPart: inventoryParts.find(p => p.id === item.inventoryPartId)
  }));

  const filteredRoutines = enrichedRoutines.filter(({ item, status, generator }) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      item.partName.toLowerCase().includes(term) ||
      (generator && generator.model.toLowerCase().includes(term)) ||
      (generator && generator.id.toLowerCase().includes(term)) ||
      (generator && generator.serialNumber.toLowerCase().includes(term));

    const matchesCategory = categoryFilter === 'all' || item.partCategory === categoryFilter;
    const matchesGenerator = generatorFilter === 'all' || item.generatorId === generatorFilter;
    const matchesUrgency = urgencyFilter === 'all' || status.urgency === urgencyFilter;

    return matchesSearch && matchesCategory && matchesGenerator && matchesUrgency;
  });

  // Global KPI Counts
  const totalRoutines = routineItems.length;
  const criticalCount = enrichedRoutines.filter(r => r.status.isCritical).length;
  const soonCount = enrichedRoutines.filter(r => r.status.isSoon).length;
  const okCount = enrichedRoutines.filter(r => r.status.isOk).length;

  // Flattened All Maintenances from all generators for the history tab
  const allMaintenances: { event: MaintenanceEvent; generator: Generator }[] = [];
  generators.forEach(gen => {
    (gen.maintenanceHistory || []).forEach(m => {
      allMaintenances.push({ event: m, generator: gen });
    });
  });
  allMaintenances.sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

  const filteredHistory = allMaintenances.filter(({ event, generator }) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      event.description.toLowerCase().includes(term) ||
      event.technician.toLowerCase().includes(term) ||
      generator.model.toLowerCase().includes(term) ||
      generator.id.toLowerCase().includes(term) ||
      (event.parts && event.parts.some(p => p.name.toLowerCase().includes(term)));

    const matchesGenerator = generatorFilter === 'all' || generator.id === generatorFilter;
    return matchesSearch && matchesGenerator;
  });

  const openNewRoutineModal = () => {
    setEditingRoutine(null);
    setRoutineGeneratorId(generators[0]?.id || '');
    setRoutinePartName('Bateria 12V 100Ah (Troca a cada 2 anos)');
    setRoutineCategory('Baterias');
    setRoutineMonths('24');
    setRoutineHours('');
    setRoutineLastDate(new Date().toISOString().split('T')[0]);
    setRoutineLastHours('');
    const matchingPart = inventoryParts.find(p => p.category === 'Baterias');
    setRoutinePartId(matchingPart?.id || '');
    setRoutineNotes('Substituição preventiva da bateria a cada 2 anos para garantir partida confiável.');
    setShowRoutineModal(true);
  };

  const openEditRoutineModal = (item: RoutineMaintenanceItem) => {
    setEditingRoutine(item);
    setRoutineGeneratorId(item.generatorId);
    setRoutinePartName(item.partName);
    setRoutineCategory(item.partCategory);
    setRoutineMonths(item.intervalMonths?.toString() || '24');
    setRoutineHours(item.intervalHours?.toString() || '');
    setRoutineLastDate(item.lastReplacedDate.split('T')[0]);
    setRoutineLastHours(item.lastReplacedHours?.toString() || '');
    setRoutinePartId(item.inventoryPartId || '');
    setRoutineNotes(item.notes || '');
    setShowRoutineModal(true);
  };

  const handleSaveRoutineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineGeneratorId || !routinePartName.trim()) return;

    const newItem: RoutineMaintenanceItem = {
      id: editingRoutine ? editingRoutine.id : `ROUT-${Date.now()}`,
      generatorId: routineGeneratorId,
      partName: routinePartName.trim(),
      partCategory: routineCategory,
      intervalMonths: routineMonths ? Number(routineMonths) : undefined,
      intervalHours: routineHours ? Number(routineHours) : undefined,
      lastReplacedDate: new Date(routineLastDate).toISOString(),
      lastReplacedHours: routineLastHours ? Number(routineLastHours) : undefined,
      inventoryPartId: routinePartId || undefined,
      notes: routineNotes.trim() || undefined
    };

    await onSaveRoutineItem(newItem);
    setShowRoutineModal(false);
  };

  const openRenewModal = (item: RoutineMaintenanceItem) => {
    setSelectedRoutineForRenew(item);
    setRenewDate(new Date().toISOString().split('T')[0]);
    const gen = generators.find(g => g.id === item.generatorId);
    const latestHour = gen?.hourMeterHistory && gen.hourMeterHistory.length > 0 
      ? gen.hourMeterHistory[gen.hourMeterHistory.length - 1].value 
      : 0;
    setRenewHours(latestHour ? latestHour.toString() : '');
    setRenewTechnician(currentUser?.name || 'Técnico Responsável');
    setRenewSelectedPartId(item.inventoryPartId || '');
    const part = inventoryParts.find(p => p.id === item.inventoryPartId);
    setRenewCost(part ? part.unitCost.toString() : '0');
    setRenewDeductStock(Boolean(item.inventoryPartId));
    setRenewNotes(`Troca periódica de ${item.partName} realizada com sucesso.`);
    setShowRenewModal(true);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoutineForRenew) return;

    const costNum = Number(renewCost) || 0;
    const usedPart = inventoryParts.find(p => p.id === renewSelectedPartId);

    // 1. Build Maintenance Event for Generator History
    const maintenanceEvent: MaintenanceEvent = {
      id: `MNT-${Date.now()}`,
      date: new Date(renewDate).toISOString(),
      description: renewNotes.trim() || `Substituição e renovação periódica: ${selectedRoutineForRenew.partName}`,
      technician: renewTechnician.trim() || 'Técnico Responsável',
      type: 'Preventiva',
      cost: costNum > 0 ? costNum : undefined,
      parts: usedPart ? [
        {
          id: usedPart.id,
          name: usedPart.name,
          value: usedPart.unitCost
        }
      ] : undefined
    };

    // 2. Call handler to save maintenance on generator & optionally deduct stock
    await onRecordMaintenance(
      selectedRoutineForRenew.generatorId,
      maintenanceEvent,
      renewDeductStock && renewSelectedPartId ? renewSelectedPartId : undefined,
      1
    );

    // 3. Update Routine Item with new lastReplacedDate and hours (Reset cycle)
    const updatedRoutine: RoutineMaintenanceItem = {
      ...selectedRoutineForRenew,
      lastReplacedDate: new Date(renewDate).toISOString(),
      lastReplacedHours: renewHours ? Number(renewHours) : selectedRoutineForRenew.lastReplacedHours,
      inventoryPartId: renewSelectedPartId || selectedRoutineForRenew.inventoryPartId
    };

    await onSaveRoutineItem(updatedRoutine);
    setShowRenewModal(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
            <Wrench className="text-brand-primary" size={28} />
            Central de Manutenções & Trocas Rotineiras
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Gerenciamento de trocas preventivas periódicas (baterias a cada 2 anos, óleos, filtros) e histórico da frota
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm flex">
            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'reminders'
                  ? 'bg-brand-primary text-brand-secondary shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Clock size={15} />
              Lembretes de Trocas ({criticalCount > 0 && <span className="bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">{criticalCount}</span>})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-brand-primary text-brand-secondary shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <FileText size={15} />
              Histórico Geral ({allMaintenances.length})
            </button>
          </div>

          <button 
            onClick={openNewRoutineModal}
            className="px-4 py-2.5 bg-brand-primary text-brand-secondary rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-md shadow-brand-primary/20 shrink-0"
          >
            <Plus size={16} />
            Novo Lembrete de Peça
          </button>
        </div>
      </div>

      {/* KPI Alert Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setUrgencyFilter('critical')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
            criticalCount > 0 
              ? urgencyFilter === 'critical'
                ? 'bg-red-600 text-white border-red-700 shadow-md'
                : 'bg-red-50 border-red-200 hover:border-red-300'
              : 'bg-white border-zinc-100'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            criticalCount > 0 
              ? urgencyFilter === 'critical' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
              : 'bg-zinc-50 text-zinc-400'
          }`}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${urgencyFilter === 'critical' ? 'text-red-100' : 'text-zinc-400'}`}>
              Trocas Vencidas
            </p>
            <p className={`text-2xl font-black mt-0.5 ${urgencyFilter === 'critical' ? 'text-white' : criticalCount > 0 ? 'text-red-600' : 'text-zinc-900'}`}>
              {criticalCount} {criticalCount === 1 ? 'item' : 'itens'}
            </p>
            <p className={`text-[11px] font-medium ${urgencyFilter === 'critical' ? 'text-red-100' : 'text-red-500'}`}>
              {criticalCount > 0 ? 'Exige troca imediata' : 'Nenhum atraso'}
            </p>
          </div>
        </div>

        <div 
          onClick={() => setUrgencyFilter('soon')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
            soonCount > 0 
              ? urgencyFilter === 'soon'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                : 'bg-amber-50 border-amber-200 hover:border-amber-300'
              : 'bg-white border-zinc-100'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            soonCount > 0 
              ? urgencyFilter === 'soon' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
              : 'bg-zinc-50 text-zinc-400'
          }`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${urgencyFilter === 'soon' ? 'text-amber-100' : 'text-zinc-400'}`}>
              Vencendo em Breve
            </p>
            <p className={`text-2xl font-black mt-0.5 ${urgencyFilter === 'soon' ? 'text-white' : soonCount > 0 ? 'text-amber-700' : 'text-zinc-900'}`}>
              {soonCount} {soonCount === 1 ? 'item' : 'itens'}
            </p>
            <p className={`text-[11px] font-medium ${urgencyFilter === 'soon' ? 'text-amber-100' : 'text-amber-600'}`}>
              Próximos 30 dias / 30h
            </p>
          </div>
        </div>

        <div 
          onClick={() => setUrgencyFilter('ok')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
            urgencyFilter === 'ok' ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'bg-white border-zinc-100'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            urgencyFilter === 'ok' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${urgencyFilter === 'ok' ? 'text-emerald-100' : 'text-zinc-400'}`}>
              Em Dia (Conforme)
            </p>
            <p className={`text-2xl font-black mt-0.5 ${urgencyFilter === 'ok' ? 'text-white' : 'text-zinc-900'}`}>
              {okCount}
            </p>
            <p className={`text-[11px] font-medium ${urgencyFilter === 'ok' ? 'text-emerald-100' : 'text-emerald-600'}`}>
              Dentro do prazo seguro
            </p>
          </div>
        </div>

        <div 
          onClick={() => setUrgencyFilter('all')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
            urgencyFilter === 'all' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-100'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            urgencyFilter === 'all' ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-700'
          }`}>
            <Wrench size={24} />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${urgencyFilter === 'all' ? 'text-zinc-300' : 'text-zinc-400'}`}>
              Total de Planos
            </p>
            <p className={`text-2xl font-black mt-0.5 ${urgencyFilter === 'all' ? 'text-white' : 'text-zinc-900'}`}>
              {totalRoutines}
            </p>
            <p className={`text-[11px] ${urgencyFilter === 'all' ? 'text-zinc-300' : 'text-zinc-500'}`}>
              Rotinas cadastradas
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab 1: Reminders & Routine Maintenance */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-3 pl-2">
              <Search size={18} className="text-zinc-400 shrink-0" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por componente (Bateria, Óleo, Filtros) ou gerador..."
                className="w-full py-1 text-sm text-zinc-900 outline-none bg-transparent"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-zinc-400 hover:text-zinc-600 p-1">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 md:border-l border-zinc-100 pt-2 md:pt-0 md:pl-3">
              <select
                value={generatorFilter}
                onChange={(e) => setGeneratorFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 outline-none cursor-pointer"
              >
                <option value="all">Todos os Geradores</option>
                {generators.map(g => (
                  <option key={g.id} value={g.id}>{g.model} ({g.id})</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 outline-none cursor-pointer"
              >
                <option value="all">Todas as Categorias</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {urgencyFilter !== 'all' && (
                <button 
                  onClick={() => setUrgencyFilter('all')}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <X size={12} /> Limpar Filtro de Urgência
                </button>
              )}
            </div>
          </div>

          {/* Routine Reminders Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRoutines.map(({ item, status, generator, inventoryPart }) => {
              const isBattery = item.partCategory === 'Baterias';
              const isOil = item.partCategory === 'Lubrificantes';
              const isFilter = item.partCategory === 'Filtros';
              const isCooling = item.partCategory === 'Arrefecimento';

              return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-3xl border p-5 shadow-sm transition-all flex flex-col justify-between hover:border-brand-primary/40 ${
                    status.isCritical 
                      ? 'border-red-200 bg-red-50/15' 
                      : status.isSoon 
                        ? 'border-amber-200 bg-amber-50/10' 
                        : 'border-zinc-100'
                  }`}
                >
                  <div>
                    {/* Header Row: Generator Tag & Urgency Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        {generator ? (
                          <div 
                            onClick={() => onSelectGenerator(generator)}
                            className="cursor-pointer group flex items-center gap-1.5 text-xs font-bold text-zinc-800 hover:text-brand-primary transition-colors"
                          >
                            <Zap size={14} className="text-brand-primary" />
                            <span>{generator.model}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">({generator.id})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">Gerador não identificado</span>
                        )}
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {generator?.currentLocation || 'Local não informado'} • Status: <span className="font-bold text-zinc-700">{generator?.status}</span>
                        </p>
                      </div>

                      {status.isCritical ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200 flex items-center gap-1.5 shrink-0 animate-pulse">
                          <AlertCircle size={14} /> TROCA VENCIDA!
                        </span>
                      ) : status.isSoon ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 shrink-0">
                          <AlertTriangle size={14} /> ATENÇÃO / PRÓXIMO
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5 shrink-0">
                          <CheckCircle2 size={14} /> EM DIA
                        </span>
                      )}
                    </div>

                    {/* Component Name & Category */}
                    <div className="flex items-center gap-3 mt-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isBattery ? 'bg-blue-50 text-blue-600' :
                        isOil ? 'bg-amber-50 text-amber-600' :
                        isFilter ? 'bg-purple-50 text-purple-600' :
                        isCooling ? 'bg-cyan-50 text-cyan-600' :
                        'bg-zinc-100 text-zinc-700'
                      }`}>
                        {isBattery ? <Battery size={20} /> :
                         isOil ? <Droplets size={20} /> :
                         isFilter ? <FilterIcon size={20} /> :
                         <Wrench size={20} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-zinc-900 truncate">
                            {item.partName}
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {item.partCategory} • Intervalo: {item.intervalMonths ? `${item.intervalMonths} meses (${(item.intervalMonths / 12).toFixed(1).replace('.0', '')} anos)` : ''} {item.intervalHours ? `ou ${item.intervalHours}h` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Timing Details */}
                    <div className="mt-4 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-medium">Ciclo de Vida da Peça:</span>
                        <span className={`font-black ${
                          status.isCritical ? 'text-red-600' : status.isSoon ? 'text-amber-700' : 'text-zinc-900'
                        }`}>
                          {status.daysRemaining <= 0 
                            ? `Vencido há ${Math.abs(status.daysRemaining)} dias!` 
                            : `Vence em ${status.daysRemaining} dias`}
                        </span>
                      </div>

                      {/* Visual bar */}
                      <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            status.isCritical ? 'bg-red-500' : status.isSoon ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, status.progressPercentage))}%` }}
                        />
                      </div>

                      {/* Dates Summary */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500 pt-1 border-t border-zinc-100/80">
                        <div>
                          <span className="text-zinc-400 font-medium">Última Troca:</span>
                          <p className="font-bold text-zinc-800">
                            {format(new Date(item.lastReplacedDate), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                          {item.lastReplacedHours !== undefined && (
                            <p className="text-[10px] text-zinc-400 font-mono">Horímetro: {item.lastReplacedHours}h</p>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-zinc-400 font-medium">Vencimento Previsto:</span>
                          <p className={`font-bold ${status.isCritical ? 'text-red-600 font-black' : 'text-zinc-800'}`}>
                            {format(status.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                          {status.hoursRemaining !== null && (
                            <p className="text-[10px] text-zinc-400 font-mono">
                              {status.hoursRemaining <= 0 ? 'Horas esgotadas!' : `Restam ${status.hoursRemaining}h`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Linked Inventory Part Status */}
                    <div className="mt-3 flex items-center justify-between text-xs px-1">
                      <div className="flex items-center gap-1.5 text-zinc-600">
                        <Boxes size={14} className="text-zinc-400" />
                        {inventoryPart ? (
                          <span>
                            Estoque Disponível: <strong className={inventoryPart.quantity <= inventoryPart.minQuantity ? 'text-amber-700 font-black' : 'text-zinc-900 font-bold'}>{inventoryPart.quantity} {inventoryPart.unit}</strong>
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">Peça não vinculada ao estoque</span>
                        )}
                      </div>

                      {item.notes && (
                        <span className="text-[11px] text-zinc-400 italic truncate max-w-[180px]" title={item.notes}>
                          "{item.notes}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <button 
                      onClick={() => openRenewModal(item)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                        status.isCritical
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 hover:scale-[1.02]'
                          : status.isSoon
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 hover:scale-[1.02]'
                            : 'bg-brand-primary text-brand-secondary hover:scale-[1.02]'
                      }`}
                    >
                      <RefreshCw size={14} />
                      Registrar Troca / Renovar Ciclo
                    </button>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => openEditRoutineModal(item)}
                        className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                        title="Editar Configurações da Rotina"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir o lembrete de "${item.partName}"?`)) {
                            onDeleteRoutineItem(item.id);
                          }
                        }}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Lembrete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRoutines.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl border border-zinc-100 p-12 text-center">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 mx-auto mb-4">
                  <Clock size={32} />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Nenhum lembrete de manutenção encontrado</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                  Cadastre lembretes preventivos periódicos para baterias (2 anos), óleos, filtros e outros consumíveis essenciais.
                </p>
                <button 
                  onClick={openNewRoutineModal}
                  className="mt-4 px-4 py-2.5 bg-brand-primary text-brand-secondary rounded-xl text-xs font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Plus size={16} /> Cadastrar Lembrete de Bateria / Peça
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Tab 2: General Fleet Maintenance History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-zinc-900 text-base flex items-center gap-2">
                <FileText size={18} className="text-brand-primary" />
                Histórico Consolidado de Manutenções da Frota
              </h3>
              <p className="text-xs text-zinc-500">Todas as intervenções preventivas e corretivas executadas nos geradores</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200">
                <Search size={16} className="text-zinc-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar no histórico..."
                  className="bg-transparent text-xs text-zinc-900 outline-none w-44"
                />
              </div>

              <select
                value={generatorFilter}
                onChange={(e) => setGeneratorFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 outline-none cursor-pointer"
              >
                <option value="all">Todos os Geradores</option>
                {generators.map(g => (
                  <option key={g.id} value={g.id}>{g.model} ({g.id})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="bg-zinc-50 text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Gerador</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Descrição do Serviço & Peças</th>
                  <th className="py-3 px-4">Técnico</th>
                  <th className="py-3 px-4 text-right">Custo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredHistory.map(({ event, generator }) => (
                  <tr key={event.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-medium text-zinc-900 whitespace-nowrap">
                      {format(new Date(event.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div 
                        onClick={() => onSelectGenerator(generator)}
                        className="cursor-pointer hover:text-brand-primary transition-colors"
                      >
                        <p className="font-bold text-zinc-900 text-xs">{generator.model}</p>
                        <span className="text-[10px] text-zinc-400 font-mono">ID: {generator.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        event.type === 'Preventiva'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-800 border border-amber-100'
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-800">
                      <p className="font-medium">{event.description}</p>
                      {event.parts && event.parts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.parts.map(p => (
                            <span key={p.id} className="bg-zinc-100 text-zinc-600 text-[10px] font-mono px-1.5 py-0.5 rounded">
                              {p.name} {p.value > 0 ? `(R$ ${p.value.toFixed(2)})` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-600 whitespace-nowrap">
                      {event.technician}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-zinc-900 text-right whitespace-nowrap">
                      {event.cost ? `R$ ${event.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                  </tr>
                ))}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-zinc-400">
                      Nenhuma manutenção encontrada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New / Edit Routine Maintenance Item */}
      <AnimatePresence>
        {showRoutineModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowRoutineModal(false)}
              className="absolute inset-0 bg-brand-secondary/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">
                      {editingRoutine ? 'Editar Plano de Troca' : 'Novo Lembrete de Troca Rotineira'}
                    </h3>
                    <p className="text-xs text-zinc-500">Configure a periodicidade (ex: Baterias a cada 2 anos, óleos a cada 6 meses)</p>
                  </div>
                </div>
                <button onClick={() => setShowRoutineModal(false)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveRoutineSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
                {/* Generator Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Gerador Alvo *</label>
                  <select
                    required
                    value={routineGeneratorId}
                    onChange={(e) => setRoutineGeneratorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:bg-white focus:border-brand-primary outline-none cursor-pointer"
                  >
                    <option value="">Selecione o gerador...</option>
                    {generators.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.model} ({g.id}) - {g.currentLocation}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Part Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Nome da Peça / Componente de Troca *</label>
                  <input 
                    type="text" 
                    required
                    value={routinePartName}
                    onChange={(e) => setRoutinePartName(e.target.value)}
                    placeholder="Ex: Bateria 12V 100Ah (Troca a cada 2 anos)"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Categoria *</label>
                    <select
                      value={routineCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as InventoryCategory;
                        setRoutineCategory(newCat);
                        if (newCat === 'Baterias') setRoutineMonths('24');
                        if (newCat === 'Lubrificantes') { setRoutineMonths('6'); setRoutineHours('250'); }
                        if (newCat === 'Arrefecimento') setRoutineMonths('12');
                      }}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Vincular Peça do Estoque</label>
                    <select
                      value={routinePartId}
                      onChange={(e) => setRoutinePartId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none cursor-pointer"
                    >
                      <option value="">Nenhuma / Gerenciar Avulso</option>
                      {inventoryParts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Saldo: {p.quantity} {p.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preset intervals */}
                <div className="space-y-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase">Atalhos de Periodicidade Recomendada:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRoutineMonths('24');
                        setRoutineHours('');
                        setRoutinePartName('Bateria 12V (Troca a cada 2 anos)');
                        setRoutineCategory('Baterias');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 transition-colors"
                    >
                      ⚡ Bateria: 2 Anos (24 Meses)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRoutineMonths('6');
                        setRoutineHours('250');
                        setRoutinePartName('Óleo Motor 15W40 + Filtro de Óleo');
                        setRoutineCategory('Lubrificantes');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 transition-colors"
                    >
                      🛢️ Óleo & Filtro: 6 Meses / 250h
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRoutineMonths('12');
                        setRoutineHours('500');
                        setRoutinePartName('Aditivo de Arrefecimento / Radiador');
                        setRoutineCategory('Arrefecimento');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 transition-colors"
                    >
                      💧 Arrefecimento: 12 Meses
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Intervalo em Meses *</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={routineMonths}
                      onChange={(e) => setRoutineMonths(e.target.value)}
                      placeholder="Ex: 24 (2 anos)"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:bg-white focus:border-brand-primary outline-none"
                    />
                    <p className="text-[10px] text-zinc-400">Ex: 24 meses = 2 anos</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Intervalo em Horas (Opcional)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={routineHours}
                      onChange={(e) => setRoutineHours(e.target.value)}
                      placeholder="Ex: 250 ou 500"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:bg-white focus:border-brand-primary outline-none"
                    />
                    <p className="text-[10px] text-zinc-400">Controle por horímetro</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Data da Última Troca *</label>
                    <input 
                      type="date" 
                      required
                      value={routineLastDate}
                      onChange={(e) => setRoutineLastDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Horímetro na Última Troca</label>
                    <input 
                      type="number" 
                      min="0"
                      value={routineLastHours}
                      onChange={(e) => setRoutineLastHours(e.target.value)}
                      placeholder="Ex: 1200"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Observações / Recomendações</label>
                  <textarea 
                    value={routineNotes}
                    onChange={(e) => setRoutineNotes(e.target.value)}
                    rows={2}
                    placeholder="Instruções de instalação, torque, testes de carga, etc."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-100 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowRoutineModal(false)}
                    className="flex-1 py-3 border border-zinc-200 text-zinc-700 font-bold text-sm rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-brand-primary text-brand-secondary font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform shadow-md shadow-brand-primary/20"
                  >
                    {editingRoutine ? 'Salvar Alterações' : 'Criar Lembrete'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Renew Cycle / Record Replacement */}
      <AnimatePresence>
        {showRenewModal && selectedRoutineForRenew && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowRenewModal(false)}
              className="absolute inset-0 bg-brand-secondary/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <RefreshCw size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">
                      Registrar Troca e Renovar Ciclo
                    </h3>
                    <p className="text-xs text-zinc-500">{selectedRoutineForRenew.partName}</p>
                  </div>
                </div>
                <button onClick={() => setShowRenewModal(false)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRenewSubmit} className="p-6 space-y-4">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Ao confirmar, a data da última troca será atualizada para hoje (reiniciando o ciclo de {selectedRoutineForRenew.intervalMonths} meses), será registrado o histórico no gerador e dada baixa automática no estoque de peças se selecionado.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Data da Nova Troca *</label>
                    <input 
                      type="date" 
                      required
                      value={renewDate}
                      onChange={(e) => setRenewDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Horímetro Atual (h)</label>
                    <input 
                      type="number" 
                      value={renewHours}
                      onChange={(e) => setRenewHours(e.target.value)}
                      placeholder="Ex: 1480"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Técnico Responsável *</label>
                  <input 
                    type="text" 
                    required
                    value={renewTechnician}
                    onChange={(e) => setRenewTechnician(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none"
                  />
                </div>

                {/* Stock deduction toggle */}
                <div className="space-y-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700 flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={renewDeductStock}
                        onChange={(e) => setRenewDeductStock(e.target.checked)}
                        className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer"
                      />
                      Dar baixa de 1 unidade no Estoque de Peças
                    </label>
                  </div>

                  {renewDeductStock && (
                    <div className="pt-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Peça correspondente do estoque:</label>
                      <select
                        value={renewSelectedPartId}
                        onChange={(e) => {
                          setRenewSelectedPartId(e.target.value);
                          const p = inventoryParts.find(item => item.id === e.target.value);
                          if (p) setRenewCost(p.unitCost.toString());
                        }}
                        className="w-full mt-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:border-brand-primary outline-none"
                      >
                        <option value="">Selecione a peça...</option>
                        {inventoryParts.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Saldo: {p.quantity} {p.unit} • R$ {p.unitCost.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Custo Total da Troca (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={renewCost}
                    onChange={(e) => setRenewCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Observações da Troca</label>
                  <textarea 
                    value={renewNotes}
                    onChange={(e) => setRenewNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-100 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowRenewModal(false)}
                    className="flex-1 py-3 border border-zinc-200 text-zinc-700 font-bold text-sm rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform shadow-md shadow-emerald-600/20"
                  >
                    Confirmar Troca e Renovar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
