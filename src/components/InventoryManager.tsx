import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertTriangle, 
  Package, 
  Trash2, 
  Edit, 
  History, 
  DollarSign, 
  CheckCircle2, 
  X, 
  Wrench,
  Layers,
  ArrowRightLeft,
  Truck,
  Building2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  InventoryPart, 
  StockMovement, 
  InventoryCategory, 
  InventoryUnit, 
  Generator, 
  Employee 
} from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InventoryManagerProps {
  parts: InventoryPart[];
  movements: StockMovement[];
  generators: Generator[];
  currentUser: Employee | null;
  onSavePart: (part: InventoryPart) => Promise<void> | void;
  onDeletePart: (id: string) => Promise<void> | void;
  onSaveMovement: (movement: StockMovement, updatedPart?: InventoryPart) => Promise<void> | void;
}

const CATEGORIES: InventoryCategory[] = [
  'Baterias',
  'Filtros',
  'Lubrificantes',
  'Correias',
  'Arrefecimento',
  'Elétrica',
  'Mecânica',
  'Outros'
];

const UNITS: { value: InventoryUnit; label: string }[] = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'kg', label: 'Quilogramas (kg)' },
  { value: 'kit', label: 'Kit Completo' },
  { value: 'm', label: 'Metros (m)' },
  { value: 'cx', label: 'Caixa (cx)' }
];

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  parts,
  movements,
  generators,
  currentUser,
  onSavePart,
  onDeletePart,
  onSaveMovement
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'movements'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modal States
  const [showPartModal, setShowPartModal] = useState(false);
  const [editingPart, setEditingPart] = useState<InventoryPart | null>(null);

  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedPartForMovement, setSelectedPartForMovement] = useState<InventoryPart | null>(null);

  // Part Form Fields
  const [partName, setPartName] = useState('');
  const [partSku, setPartSku] = useState('');
  const [partCategory, setPartCategory] = useState<InventoryCategory>('Baterias');
  const [partQuantity, setPartQuantity] = useState<string>('0');
  const [partMinQuantity, setPartMinQuantity] = useState<string>('2');
  const [partUnit, setPartUnit] = useState<InventoryUnit>('un');
  const [partUnitCost, setPartUnitCost] = useState<string>('0');
  const [partLocation, setPartLocation] = useState('');
  const [partSupplier, setPartSupplier] = useState('');
  const [partNotes, setPartNotes] = useState('');

  // Movement Form Fields
  const [movementType, setMovementType] = useState<'Entrada' | 'Saída' | 'Ajuste'>('Entrada');
  const [movementQty, setMovementQty] = useState<string>('1');
  const [movementReason, setMovementReason] = useState('');
  const [movementGeneratorId, setMovementGeneratorId] = useState('');
  const [movementUnitCost, setMovementUnitCost] = useState('');

  // Filtered Parts
  const filteredParts = parts.filter(part => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      part.name.toLowerCase().includes(term) ||
      part.sku.toLowerCase().includes(term) ||
      part.location.toLowerCase().includes(term) ||
      (part.supplier && part.supplier.toLowerCase().includes(term));

    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    const isLow = part.quantity <= part.minQuantity;
    const matchesLowStock = !onlyLowStock || isLow;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Calculate Metrics
  const totalItemsCount = parts.length;
  const totalStockQuantity = parts.reduce((acc, p) => acc + p.quantity, 0);
  const totalStockValue = parts.reduce((acc, p) => acc + (p.quantity * p.unitCost), 0);
  const lowStockParts = parts.filter(p => p.quantity <= p.minQuantity);
  const lowStockCount = lowStockParts.length;

  const openNewPartModal = () => {
    setEditingPart(null);
    setPartName('');
    setPartSku(`SKU-${Date.now().toString().slice(-4)}`);
    setPartCategory('Baterias');
    setPartQuantity('1');
    setPartMinQuantity('2');
    setPartUnit('un');
    setPartUnitCost('0');
    setPartLocation('');
    setPartSupplier('');
    setPartNotes('');
    setShowPartModal(true);
  };

  const openEditPartModal = (part: InventoryPart) => {
    setEditingPart(part);
    setPartName(part.name);
    setPartSku(part.sku);
    setPartCategory(part.category);
    setPartQuantity(part.quantity.toString());
    setPartMinQuantity(part.minQuantity.toString());
    setPartUnit(part.unit);
    setPartUnitCost(part.unitCost.toString());
    setPartLocation(part.location);
    setPartSupplier(part.supplier || '');
    setPartNotes(part.notes || '');
    setShowPartModal(true);
  };

  const handleSavePartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim() || !partSku.trim()) return;

    const newPart: InventoryPart = {
      id: editingPart ? editingPart.id : `PART-${Date.now()}`,
      name: partName.trim(),
      sku: partSku.trim().toUpperCase(),
      category: partCategory,
      quantity: Math.max(0, Number(partQuantity) || 0),
      minQuantity: Math.max(0, Number(partMinQuantity) || 0),
      unit: partUnit,
      unitCost: Math.max(0, Number(partUnitCost) || 0),
      location: partLocation.trim() || 'Almoxarifado Central',
      supplier: partSupplier.trim() || undefined,
      notes: partNotes.trim() || undefined,
      createdAt: editingPart?.createdAt || new Date().toISOString()
    };

    await onSavePart(newPart);
    setShowPartModal(false);
  };

  const openMovementModal = (part: InventoryPart, defaultType: 'Entrada' | 'Saída' = 'Entrada') => {
    setSelectedPartForMovement(part);
    setMovementType(defaultType);
    setMovementQty('1');
    setMovementReason(defaultType === 'Entrada' ? 'Reposição de estoque / Compra' : 'Aplicação em gerador / Manutenção');
    setMovementGeneratorId('');
    setMovementUnitCost(part.unitCost.toString());
    setShowMovementModal(true);
  };

  const handleSaveMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartForMovement) return;
    const qty = Number(movementQty);
    if (!qty || qty <= 0) return;

    let newQuantity = selectedPartForMovement.quantity;
    if (movementType === 'Entrada') {
      newQuantity += qty;
    } else if (movementType === 'Saída') {
      if (qty > selectedPartForMovement.quantity) {
        alert('Atenção: A quantidade de saída é maior que o saldo em estoque atual!');
      }
      newQuantity = Math.max(0, newQuantity - qty);
    } else if (movementType === 'Ajuste') {
      newQuantity = qty;
    }

    const movement: StockMovement = {
      id: `MOV-${Date.now()}`,
      partId: selectedPartForMovement.id,
      partName: selectedPartForMovement.name,
      type: movementType,
      quantity: qty,
      date: new Date().toISOString(),
      reason: movementReason.trim() || (movementType === 'Entrada' ? 'Entrada de material' : 'Saída de material'),
      technician: currentUser?.name || 'Técnico Responsável',
      generatorId: movementGeneratorId || undefined,
      unitCost: Number(movementUnitCost) || selectedPartForMovement.unitCost
    };

    const updatedPart: InventoryPart = {
      ...selectedPartForMovement,
      quantity: newQuantity,
      unitCost: movementType === 'Entrada' && Number(movementUnitCost) > 0 ? Number(movementUnitCost) : selectedPartForMovement.unitCost
    };

    await onSaveMovement(movement, updatedPart);
    setShowMovementModal(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
            <Boxes className="text-brand-primary" size={28} />
            Estoque de Peças e Consumíveis
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Controle de baterias, filtros, lubrificantes, componentes elétricos e reposições da frota
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveSubTab(activeSubTab === 'catalog' ? 'movements' : 'catalog')}
            className="px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold text-zinc-700 flex items-center gap-2 transition-all shadow-sm"
          >
            <History size={16} className="text-zinc-500" />
            {activeSubTab === 'catalog' ? 'Ver Histórico de Movimentações' : 'Voltar ao Catálogo de Peças'}
          </button>

          <button 
            onClick={openNewPartModal}
            className="px-4 py-2.5 bg-brand-primary text-brand-secondary rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-md shadow-brand-primary/20"
          >
            <Plus size={16} />
            Cadastrar Nova Peça
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Itens Cadastrados</p>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{totalItemsCount}</p>
            <p className="text-[11px] text-zinc-500">{totalStockQuantity} unidades no galpão</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Valor em Estoque</p>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">
              R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">Patrimônio em peças</p>
          </div>
        </div>

        <div 
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
            lowStockCount > 0 
              ? onlyLowStock 
                ? 'bg-amber-500 text-white border-amber-600 shadow-md' 
                : 'bg-amber-50/80 border-amber-200 hover:border-amber-300' 
              : 'bg-white border-zinc-100'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            lowStockCount > 0 
              ? onlyLowStock 
                ? 'bg-white/20 text-white' 
                : 'bg-amber-100 text-amber-700' 
              : 'bg-zinc-50 text-zinc-400'
          }`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${onlyLowStock ? 'text-amber-100' : 'text-zinc-400'}`}>
              Estoque Baixo
            </p>
            <p className={`text-2xl font-black mt-0.5 ${onlyLowStock ? 'text-white' : lowStockCount > 0 ? 'text-amber-700' : 'text-zinc-900'}`}>
              {lowStockCount} {lowStockCount === 1 ? 'item' : 'itens'}
            </p>
            <p className={`text-[11px] font-medium ${onlyLowStock ? 'text-amber-100' : 'text-amber-600'}`}>
              {onlyLowStock ? 'Filtro ativado (Clique p/ limpar)' : 'Abaixo do mínimo'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Movimentações</p>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">{movements.length}</p>
            <p className="text-[11px] text-zinc-500">Registros no histórico</p>
          </div>
        </div>
      </div>

      {/* Main Content Area: Catalog View vs Movements History View */}
      {activeSubTab === 'catalog' ? (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-3 pl-2">
              <Search size={18} className="text-zinc-400 shrink-0" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome da peça, código SKU, fornecedor ou prateleira..."
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 outline-none cursor-pointer"
              >
                <option value="all">Todas as Categorias</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <button
                onClick={() => setOnlyLowStock(!onlyLowStock)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  onlyLowStock 
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                <AlertTriangle size={14} />
                Estoque Crítico ({lowStockCount})
              </button>
            </div>
          </div>

          {/* Parts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredParts.map((part) => {
              const isLow = part.quantity <= part.minQuantity;
              const isOut = part.quantity === 0;

              return (
                <div 
                  key={part.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm flex flex-col justify-between hover:border-brand-primary/40 ${
                    isOut 
                      ? 'border-red-200 bg-red-50/20' 
                      : isLow 
                        ? 'border-amber-200' 
                        : 'border-zinc-100'
                  }`}
                >
                  <div>
                    {/* Top Row: Category & Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                        {part.category}
                      </span>

                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertCircle size={12} /> Esgotado
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <AlertTriangle size={12} /> Repor Estoque
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Em Dia
                        </span>
                      )}
                    </div>

                    {/* Part Title & SKU */}
                    <h3 className="font-bold text-zinc-900 text-base leading-snug line-clamp-2">
                      {part.name}
                    </h3>
                    <p className="text-xs font-mono font-medium text-zinc-500 mt-1">
                      SKU: <span className="text-zinc-800 font-bold">{part.sku}</span>
                    </p>

                    {/* Stock Level Bar */}
                    <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-zinc-500 font-medium">Saldo Atual:</span>
                        <span className="font-black text-sm text-zinc-900">
                          {part.quantity} {part.unit}
                        </span>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isOut 
                              ? 'bg-red-500' 
                              : isLow 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, Math.max(8, (part.quantity / Math.max(part.minQuantity * 2, 10)) * 100))}%` 
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-1">
                        <span>Mínimo: {part.minQuantity} {part.unit}</span>
                        <span>Custo: R$ {part.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {part.unit}</span>
                      </div>
                    </div>

                    {/* Meta info: location & notes */}
                    <div className="mt-3 space-y-1 text-xs text-zinc-600">
                      {part.location && (
                        <p className="flex items-center gap-1 text-[11px] text-zinc-500">
                          <span className="font-bold text-zinc-400 uppercase text-[9px]">Local:</span> 
                          {part.location}
                        </p>
                      )}
                      {part.supplier && (
                        <p className="flex items-center gap-1 text-[11px] text-zinc-500">
                          <span className="font-bold text-zinc-400 uppercase text-[9px]">Fornecedor:</span> 
                          {part.supplier}
                        </p>
                      )}
                      {part.notes && (
                        <p className="text-[11px] text-zinc-500 italic line-clamp-1 mt-1">
                          "{part.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => openMovementModal(part, 'Entrada')}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Registrar Entrada de Estoque (Compra)"
                      >
                        <ArrowDownRight size={14} /> + Entrada
                      </button>
                      <button 
                        onClick={() => openMovementModal(part, 'Saída')}
                        className="px-2.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Registrar Saída (Uso em Gerador / Manutenção)"
                      >
                        <ArrowUpRight size={14} /> - Saída
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => openEditPartModal(part)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                        title="Editar Detalhes da Peça"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir a peça "${part.name}" do estoque?`)) {
                            onDeletePart(part.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Peça"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredParts.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl border border-zinc-100 p-12 text-center">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 mx-auto mb-4">
                  <Package size={32} />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Nenhuma peça encontrada</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                  {searchTerm || categoryFilter !== 'all' || onlyLowStock 
                    ? 'Tente remover os filtros ou buscar por outros termos.' 
                    : 'Cadastre a primeira peça de reposição (como baterias ou filtros) usando o botão acima.'}
                </p>
                {onlyLowStock && (
                  <button 
                    onClick={() => setOnlyLowStock(false)}
                    className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-800 rounded-xl transition-colors"
                  >
                    Mostrar Todas as Peças
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Movements History Table */
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-zinc-900 text-base flex items-center gap-2">
                <History size={18} className="text-brand-primary" />
                Histórico de Movimentações de Estoque
              </h3>
              <p className="text-xs text-zinc-500">Registro cronológico de entradas, saídas e trocas</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="bg-zinc-50 text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Peça</th>
                  <th className="py-3 px-4">Qtd</th>
                  <th className="py-3 px-4">Motivo / Destino</th>
                  <th className="py-3 px-4">Técnico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {movements.map((mov) => {
                  const isEntry = mov.type === 'Entrada';
                  const isExit = mov.type === 'Saída';
                  const gen = generators.find(g => g.id === mov.generatorId);

                  return (
                    <tr key={mov.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-medium text-zinc-900 whitespace-nowrap">
                        {format(new Date(mov.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                          isEntry 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : isExit 
                              ? 'bg-amber-50 text-amber-800 border border-amber-100' 
                              : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {isEntry && <ArrowDownRight size={12} />}
                          {isExit && <ArrowUpRight size={12} />}
                          {mov.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900">
                        {mov.partName}
                      </td>
                      <td className="py-3.5 px-4 font-black text-zinc-900 whitespace-nowrap">
                        <span className={isEntry ? 'text-emerald-600' : 'text-amber-600'}>
                          {isEntry ? '+' : '-'}{mov.quantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-600">
                        <p>{mov.reason}</p>
                        {gen && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                            Gerador: {gen.model} ({gen.id})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-zinc-500 whitespace-nowrap">
                        {mov.technician}
                      </td>
                    </tr>
                  );
                })}

                {movements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-zinc-400">
                      Nenhuma movimentação de estoque registrada até o momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New / Edit Part */}
      <AnimatePresence>
        {showPartModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowPartModal(false)}
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
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">
                      {editingPart ? 'Editar Peça' : 'Cadastrar Nova Peça no Estoque'}
                    </h3>
                    <p className="text-xs text-zinc-500">Preencha as especificações técnicas e limites de estoque</p>
                  </div>
                </div>
                <button onClick={() => setShowPartModal(false)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSavePartSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Nome da Peça / Componente *</label>
                  <input 
                    type="text" 
                    required
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="Ex: Bateria 12V 100Ah Moura / Heliar"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Código / SKU *</label>
                    <input 
                      type="text" 
                      required
                      value={partSku}
                      onChange={(e) => setPartSku(e.target.value)}
                      placeholder="Ex: BAT-100AH"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono focus:bg-white focus:border-brand-primary outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Categoria *</label>
                    <select
                      value={partCategory}
                      onChange={(e) => setPartCategory(e.target.value as InventoryCategory)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Qtd Atual *</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      value={partQuantity}
                      onChange={(e) => setPartQuantity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Estoque Mínimo *</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      value={partMinQuantity}
                      onChange={(e) => setPartMinQuantity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Unidade</label>
                    <select
                      value={partUnit}
                      onChange={(e) => setPartUnit(e.target.value as InventoryUnit)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none cursor-pointer"
                    >
                      {UNITS.map(u => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Custo Unitário (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={partUnitCost}
                      onChange={(e) => setPartUnitCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Localização / Gaveta</label>
                    <input 
                      type="text" 
                      value={partLocation}
                      onChange={(e) => setPartLocation(e.target.value)}
                      placeholder="Ex: Prateleira A1 - Baterias"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Fornecedor Principal (Opcional)</label>
                  <input 
                    type="text" 
                    value={partSupplier}
                    onChange={(e) => setPartSupplier(e.target.value)}
                    placeholder="Ex: Distribuidora Moura SP / Fleetguard"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Observações / Recomendações</label>
                  <textarea 
                    value={partNotes}
                    onChange={(e) => setPartNotes(e.target.value)}
                    rows={2}
                    placeholder="Ex: Validade recomendada de troca: 2 anos (24 meses)."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-100 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowPartModal(false)}
                    className="flex-1 py-3 border border-zinc-200 text-zinc-700 font-bold text-sm rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-brand-primary text-brand-secondary font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform shadow-md shadow-brand-primary/20"
                  >
                    {editingPart ? 'Salvar Alterações' : 'Cadastrar Peça'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Movement (Entrada / Saída) */}
      <AnimatePresence>
        {showMovementModal && selectedPartForMovement && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowMovementModal(false)}
              className="absolute inset-0 bg-brand-secondary/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    Registrar Movimentação de Estoque
                  </h3>
                  <p className="text-xs text-zinc-500">{selectedPartForMovement.name} ({selectedPartForMovement.sku})</p>
                </div>
                <button onClick={() => setShowMovementModal(false)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveMovementSubmit} className="p-6 space-y-4">
                {/* Movement Type Radio Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('Entrada');
                      setMovementReason('Reposição de estoque / Compra NF');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      movementType === 'Entrada'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <ArrowDownRight size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Entrada (+)</p>
                      <p className="text-[10px] text-zinc-500">Compra / Adição</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('Saída');
                      setMovementReason('Uso em manutenção preventiva/corretiva');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      movementType === 'Saída'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <ArrowUpRight size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Saída (-)</p>
                      <p className="text-[10px] text-zinc-500">Uso em gerador</p>
                    </div>
                  </button>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Saldo Atual em Estoque:</span>
                  <span className="font-black text-sm text-zinc-900">
                    {selectedPartForMovement.quantity} {selectedPartForMovement.unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Quantidade *</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={movementQty}
                      onChange={(e) => setMovementQty(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-base font-black text-zinc-900 focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Custo Unitário (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={movementUnitCost}
                      onChange={(e) => setMovementUnitCost(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>

                {movementType === 'Saída' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Gerador de Destino (Opcional)</label>
                    <select
                      value={movementGeneratorId}
                      onChange={(e) => setMovementGeneratorId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none cursor-pointer"
                    >
                      <option value="">Nenhum / Uso Geral na Oficina</option>
                      {generators.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.model} ({g.id}) - {g.status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Motivo / Descrição *</label>
                  <input 
                    type="text" 
                    required
                    value={movementReason}
                    onChange={(e) => setMovementReason(e.target.value)}
                    placeholder="Ex: Troca preventiva de rotina, NF de compra, etc."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-100 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowMovementModal(false)}
                    className="flex-1 py-3 border border-zinc-200 text-zinc-700 font-bold text-sm rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-brand-primary text-brand-secondary font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform shadow-md shadow-brand-primary/20"
                  >
                    Confirmar Movimentação
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
