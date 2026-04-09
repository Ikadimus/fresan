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
  ArrowRightLeft,
  FileText,
  PenTool,
  Trash2,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SignaturePad from 'react-signature-pad-wrapper';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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
  MaintenanceType,
  MaintenancePart,
  MaintenanceService,
  SignedDocument,
  GeneratorStatus,
  Rental,
  ChecklistResult,
  MaintenanceEvent,
  DocType,
  Client
} from './types';
import { 
  mockGenerators, 
  mockChecklistTemplates, 
  mockEmployees, 
  mockRentals,
  mockClients
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rig' | 'checklists' | 'employees' | 'rentals' | 'documentation'>('dashboard');
  const [checklistSubTab, setChecklistSubTab] = useState<'config' | 'history'>('config');
  const [rentalSubTab, setRentalSubTab] = useState<'active' | 'clients' | 'history'>('active');
  const [docFilter, setDocFilter] = useState<DocType | 'Todos'>('Todos');
  
  const [generators, setGenerators] = useState<Generator[]>(mockGenerators);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(mockChecklistTemplates);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [rentals, setRentals] = useState<Rental[]>(mockRentals);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [signedDocuments, setSignedDocuments] = useState<SignedDocument[]>([
    {
      id: 'DOC-SIMULATED',
      date: new Date().toISOString(),
      generatorId: 'GEN-001',
      technicianName: 'Ricardo Lima',
      responsibleName: 'Marcos Silva',
      technicianSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      responsibleSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      title: 'Manutenção Corretiva e Checklist - Cummins C150',
      docType: 'Relatório',
      maintenanceDetails: {
        id: 'MNT-SIM',
        date: new Date().toISOString(),
        description: 'Troca de sensor de pressão de óleo e revisão geral do sistema elétrico.',
        technician: 'Ricardo Lima',
        type: 'Corretiva',
        cost: 1550,
        parts: [
          { id: 'p1', name: 'Sensor de Pressão de Óleo', value: 450 },
          { id: 'p2', name: 'Filtro de Óleo', value: 150 }
        ],
        services: [
          { id: 's1', name: 'Mão de obra especializada', value: 950 }
        ]
      },
      fullChecklist: {
        id: 'CHK-SIM',
        generatorId: 'GEN-001',
        templateId: 'tmpl-3',
        date: new Date().toISOString(),
        employeeId: 'emp-3',
        answers: {
          'q9': 'true', 'q10': 'true', 'q11': 'true', 'q12': 'false', 'q13': 'true',
          'q14': '26.5', 'q15': '85', 'q16': 'true', 'q17': 'true', 'q18': 'true',
          'q19': '60', 'q20': '220', 'q21': '1250', 'q22': 'true',
          'q23': 'Equipamento operando em perfeitas condições após a troca do sensor.'
        }
      }
    },
    {
      id: 'DOC-1',
      date: new Date(Date.now() - 86400000).toISOString(),
      generatorId: 'GEN-001',
      technicianName: 'Ricardo Lima',
      responsibleName: 'Marcos Silva',
      technicianSignature: '',
      responsibleSignature: '',
      title: 'Checklist de Entrega - Cummins C150',
      docType: 'Checklist'
    },
    {
      id: 'DOC-2',
      date: new Date(Date.now() - 172800000).toISOString(),
      generatorId: 'GEN-003',
      technicianName: 'João Silva',
      responsibleName: 'Ana Oliveira',
      technicianSignature: '',
      responsibleSignature: '',
      title: 'Relatório Técnico: Preventiva Mensal',
      docType: 'Relatório'
    },
    {
      id: 'DOC-3',
      date: new Date(Date.now() - 259200000).toISOString(),
      generatorId: 'GEN-002',
      technicianName: 'Carlos Souza',
      responsibleName: 'Pedro Santos',
      technicianSignature: '',
      responsibleSignature: '',
      title: 'Orçamento: Troca de Bateria',
      docType: 'Orçamento'
    }
  ]);
  const [selectedGenerator, setSelectedGenerator] = useState<Generator | null>(null);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

  // New feature states
  const [showNewGeneratorForm, setShowNewGeneratorForm] = useState(false);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [showEditTemplateForm, setShowEditTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [showNewRentalForm, setShowNewRentalForm] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showRentalDetailModal, setShowRentalDetailModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<SignedDocument | null>(null);

  const [showChecklistSelector, setShowChecklistSelector] = useState(false);
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [currentChecklistTemplate, setCurrentChecklistTemplate] = useState<ChecklistTemplate | null>(null);
  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, string>>({});
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('Preventiva');
  const [maintenanceParts, setMaintenanceParts] = useState<MaintenancePart[]>([]);
  const [maintenanceServices, setMaintenanceServices] = useState<MaintenanceService[]>([]);
  const [maintenanceDescription, setMaintenanceDescription] = useState('');
  
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureData, setSignatureData] = useState<{
    technicianName: string;
    responsibleName: string;
    checklistResult?: ChecklistResult;
    maintenanceDetails?: MaintenanceEvent;
    title: string;
  } | null>(null);

  const technicianSigRef = React.useRef<SignaturePad>(null);
  const responsibleSigRef = React.useRef<SignaturePad>(null);

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

  const handleSaveSignature = () => {
    if (!technicianSigRef.current || !responsibleSigRef.current || !signatureData || !selectedGenerator) return;

    const techSig = technicianSigRef.current.toDataURL('image/png');
    const respSig = responsibleSigRef.current.toDataURL('image/png');

    const newDoc: SignedDocument = {
      id: `DOC-${Date.now()}`,
      date: new Date().toISOString(),
      generatorId: selectedGenerator.id,
      technicianName: signatureData.technicianName,
      responsibleName: signatureData.responsibleName,
      technicianSignature: techSig,
      responsibleSignature: respSig,
      checklistId: signatureData.checklistResult?.id,
      maintenanceId: signatureData.maintenanceDetails?.id,
      fullChecklist: signatureData.checklistResult,
      maintenanceDetails: signatureData.maintenanceDetails,
      title: signatureData.title,
      docType: signatureData.checklistResult ? 'Checklist' : (signatureData.maintenanceDetails?.type === 'Corretiva' ? 'Orçamento' : 'Relatório')
    };

    setSignedDocuments([newDoc, ...signedDocuments]);
    setShowSignatureModal(false);
    setSignatureData(null);
    alert('Documento assinado e salvo com sucesso! Você pode baixá-lo na aba de Documentação ou no Histórico de Checklists.');
  };

  const generatePDF = async (doc: SignedDocument) => {
    const elementId = `pdf-content-${doc.id}`;
    const element = document.getElementById(elementId);
    
    if (!element) {
      console.error('PDF element not found:', elementId);
      alert('Erro interno: Elemento do PDF não encontrado.');
      return;
    }

    try {
      // Wait a bit for any pending renders
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: 800, // Fixed width for consistent rendering
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Sanitize filename
      const safeTitle = doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `Relatorio_${safeTitle}_${format(new Date(doc.date), 'ddMMyyyy')}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Erro detalhado ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Por favor, tente novamente ou use a visualização em tela.');
    }
  };

  const renderDocumentation = () => {
    const filteredDocs = signedDocuments.filter(doc => 
      docFilter === 'Todos' || doc.docType === docFilter
    );

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-zinc-900">Documentação</h2>
            <div className="flex bg-zinc-100 p-1 rounded-xl">
              {(['Todos', 'Checklist', 'Relatório', 'Orçamento'] as const).map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setDocFilter(filter)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${docFilter === filter ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <History size={20} />
                Histórico de Documentos
              </h3>
              <div className="space-y-4">
                {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                  <div key={doc.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-brand-primary/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-brand-primary border border-zinc-100">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900">{doc.title}</h4>
                        <p className="text-xs text-zinc-500">Gerador: {doc.generatorId} • {format(new Date(doc.date), "dd/MM/yyyy HH:mm")}</p>
                        {doc.maintenanceDetails && (
                          <p className="text-[10px] text-brand-primary font-bold mt-1">
                            {doc.maintenanceDetails.parts?.length || 0} Peças • {doc.maintenanceDetails.services?.length || 0} Serviços • R$ {doc.maintenanceDetails.cost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => generatePDF(doc)}
                        className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors text-brand-primary flex items-center gap-1 text-xs font-bold"
                      >
                        <FileText size={16} />
                        Baixar PDF
                      </button>
                      <button 
                        onClick={() => setViewingDocument(doc)}
                        className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  {/* Hidden PDF Template - Fixed visibility for html2canvas */}
                  <div className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1]">
                    <div id={`pdf-content-${doc.id}`} className="w-[210mm] p-10 bg-white text-zinc-900 font-sans">
                      {/* PDF Header */}
                      <div className="flex justify-between items-start border-b-2 border-brand-primary pb-6 mb-8">
                        <div className="flex items-center gap-4">
                          <FresanLogo size={60} />
                          <div>
                            <h1 className="text-3xl font-black tracking-tighter text-brand-secondary">Fresan</h1>
                            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest -mt-1">Geradores</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <h2 className="text-xl font-bold text-zinc-900">Relatório Técnico</h2>
                          <p className="text-sm text-zinc-500">Documento: {doc.id}</p>
                          <p className="text-sm text-zinc-500">Data: {format(new Date(doc.date), "dd/MM/yyyy HH:mm")}</p>
                        </div>
                      </div>

                      {/* Info Section */}
                      <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1">Informações do Equipamento</h3>
                          <p className="text-sm"><strong>Gerador:</strong> {doc.generatorId}</p>
                          <p className="text-sm"><strong>Modelo:</strong> {generators.find(g => g.id === doc.generatorId)?.model || 'N/A'}</p>
                          <p className="text-sm"><strong>Série:</strong> {generators.find(g => g.id === doc.generatorId)?.serialNumber || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1">Tipo de Atendimento</h3>
                          <p className="text-sm font-bold text-brand-primary">{doc.title}</p>
                          <p className="text-sm"><strong>Técnico:</strong> {doc.technicianName}</p>
                        </div>
                      </div>

                      {/* Maintenance Details if any */}
                      {doc.maintenanceDetails && (
                        <div className="mb-8">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1 mb-4">Serviços e Peças</h3>
                          <div className="border border-zinc-100 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-zinc-50">
                                <tr>
                                  <th className="px-4 py-2 font-bold">Descrição</th>
                                  <th className="px-4 py-2 font-bold text-right">Valor</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100">
                                {doc.maintenanceDetails.parts?.map(p => (
                                  <tr key={p.id}>
                                    <td className="px-4 py-2">Peça: {p.name}</td>
                                    <td className="px-4 py-2 text-right">R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                  </tr>
                                ))}
                                {doc.maintenanceDetails.services?.map(s => (
                                  <tr key={s.id}>
                                    <td className="px-4 py-2">Serviço: {s.name}</td>
                                    <td className="px-4 py-2 text-right">R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                  </tr>
                                ))}
                                <tr className="bg-zinc-50 font-bold">
                                  <td className="px-4 py-2">TOTAL</td>
                                  <td className="px-4 py-2 text-right text-brand-primary">
                                    R$ {doc.maintenanceDetails.cost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                            <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Relato de Execução</p>
                            <p className="text-sm text-zinc-700">{doc.maintenanceDetails.description}</p>
                          </div>
                        </div>
                      )}

                      {/* Checklist if any */}
                      {doc.fullChecklist && (
                        <div className="mb-8">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1 mb-4">Questionário Técnico</h3>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            {templates.find(t => t.id === doc.fullChecklist?.templateId)?.questions.map(q => (
                              <div key={q.id} className="flex justify-between border-b border-zinc-50 py-1">
                                <span className="text-xs text-zinc-600">{q.text}</span>
                                <span className="text-xs font-bold text-zinc-900">
                                  {doc.fullChecklist?.answers[q.id] === 'true' ? 'SIM' : 
                                   doc.fullChecklist?.answers[q.id] === 'false' ? 'NÃO' : 
                                   doc.fullChecklist?.answers[q.id] || '-'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Signatures */}
                      <div className="grid grid-cols-2 gap-12 mt-16">
                        <div className="text-center">
                          <div className="border-b border-zinc-300 mb-2 min-h-[60px] flex items-center justify-center">
                            <img src={doc.technicianSignature} alt="Assinatura Técnico" className="max-h-16" />
                          </div>
                          <p className="text-sm font-bold text-zinc-900">{doc.technicianName}</p>
                          <p className="text-xs text-zinc-500">Técnico Fresan</p>
                        </div>
                        <div className="text-center">
                          <div className="border-b border-zinc-300 mb-2 min-h-[60px] flex items-center justify-center">
                            <img src={doc.responsibleSignature} alt="Assinatura Responsável" className="max-h-16" />
                          </div>
                          <p className="text-sm font-bold text-zinc-900">{doc.responsibleName}</p>
                          <p className="text-xs text-zinc-500">Responsável Cliente</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-20 pt-6 border-t border-zinc-100 text-center">
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                          Fresan Geradores - Documento Gerado Eletronicamente via GeroControl
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Técnico</span>
                      <span className="text-xs text-zinc-700">{doc.technicianName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Responsável</span>
                      <span className="text-xs text-zinc-700">{doc.responsibleName}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-4">
                    <FileText size={32} />
                  </div>
                  <p className="text-zinc-500 font-medium">Nenhum documento assinado ainda.</p>
                  <p className="text-xs text-zinc-400 mt-1">Gere documentos a partir de checklists ou manutenções.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-brand-secondary text-white border-none shadow-xl shadow-brand-secondary/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PenTool size={20} className="text-brand-primary" />
              Nova Assinatura
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Para assinar um novo documento, selecione um gerador e inicie um processo de checklist ou manutenção.
            </p>
            <button 
              onClick={() => setActiveTab('rig')}
              className="w-full py-3 bg-brand-primary text-brand-secondary rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform"
            >
              Ir para Geradores
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

  const renderDocumentViewModal = () => (
    <AnimatePresence>
      {viewingDocument && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-secondary/90 backdrop-blur-md"
            onClick={() => setViewingDocument(null)}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-brand-primary border border-zinc-100">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">{viewingDocument.title}</h2>
                  <p className="text-xs text-zinc-500">Documento: {viewingDocument.id} • {format(new Date(viewingDocument.date), "dd/MM/yyyy HH:mm")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => generatePDF(viewingDocument)}
                  className="flex items-center gap-2 bg-brand-primary text-brand-secondary px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                >
                  <FileText size={18} />
                  Baixar PDF
                </button>
                <button onClick={() => setViewingDocument(null)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1">Informações do Equipamento</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Gerador</p>
                      <p className="text-sm font-bold text-zinc-900">{viewingDocument.generatorId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Modelo</p>
                      <p className="text-sm font-bold text-zinc-900">{generators.find(g => g.id === viewingDocument.generatorId)?.model || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Série</p>
                      <p className="text-sm font-bold text-zinc-900">{generators.find(g => g.id === viewingDocument.generatorId)?.serialNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Potência</p>
                      <p className="text-sm font-bold text-zinc-900">{generators.find(g => g.id === viewingDocument.generatorId)?.powerKva || 'N/A'} kVA</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1">Responsáveis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Técnico</p>
                      <p className="text-sm font-bold text-zinc-900">{viewingDocument.technicianName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Responsável Cliente</p>
                      <p className="text-sm font-bold text-zinc-900">{viewingDocument.responsibleName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance Details */}
              {viewingDocument.maintenanceDetails && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1">Serviços e Peças</h3>
                  <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th className="px-6 py-3 font-bold text-zinc-900">Descrição</th>
                          <th className="px-6 py-3 font-bold text-zinc-900 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {viewingDocument.maintenanceDetails.parts?.map(p => (
                          <tr key={p.id}>
                            <td className="px-6 py-3 text-zinc-600">Peça: {p.name}</td>
                            <td className="px-6 py-3 text-right font-medium text-zinc-900">R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                        {viewingDocument.maintenanceDetails.services?.map(s => (
                          <tr key={s.id}>
                            <td className="px-6 py-3 text-zinc-600">Serviço: {s.name}</td>
                            <td className="px-6 py-3 text-right font-medium text-zinc-900">R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                        <tr className="bg-zinc-50 font-bold">
                          <td className="px-6 py-3 text-zinc-900">TOTAL</td>
                          <td className="px-6 py-3 text-right text-brand-primary">
                            R$ {viewingDocument.maintenanceDetails.cost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Relato de Execução</p>
                    <p className="text-sm text-zinc-700 leading-relaxed">{viewingDocument.maintenanceDetails.description}</p>
                  </div>
                </div>
              )}

              {/* Checklist Answers */}
              {viewingDocument.fullChecklist && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1">Questionário Técnico</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                    {templates.find(t => t.id === viewingDocument.fullChecklist?.templateId)?.questions.map(q => (
                      <div key={q.id} className="flex justify-between items-center border-b border-zinc-50 py-2">
                        <span className="text-sm text-zinc-600">{q.text}</span>
                        <span className={`text-sm font-bold ${
                          viewingDocument.fullChecklist?.answers[q.id] === 'true' ? 'text-emerald-600' : 
                          viewingDocument.fullChecklist?.answers[q.id] === 'false' ? 'text-rose-600' : 
                          'text-zinc-900'
                        }`}>
                          {viewingDocument.fullChecklist?.answers[q.id] === 'true' ? 'SIM' : 
                           viewingDocument.fullChecklist?.answers[q.id] === 'false' ? 'NÃO' : 
                           viewingDocument.fullChecklist?.answers[q.id] || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                <div className="space-y-4 text-center">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Assinatura do Técnico</p>
                  <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex items-center justify-center min-h-[120px]">
                    <img src={viewingDocument.technicianSignature} alt="Assinatura Técnico" className="max-h-24" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{viewingDocument.technicianName}</p>
                    <p className="text-xs text-zinc-500">Técnico Fresan</p>
                  </div>
                </div>
                <div className="space-y-4 text-center">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Assinatura do Responsável</p>
                  <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex items-center justify-center min-h-[120px]">
                    <img src={viewingDocument.responsibleSignature} alt="Assinatura Responsável" className="max-h-24" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{viewingDocument.responsibleName}</p>
                    <p className="text-xs text-zinc-500">Responsável Cliente</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderNewGeneratorForm = () => (
    <AnimatePresence>
      {showNewGeneratorForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-secondary/90 backdrop-blur-md"
            onClick={() => setShowNewGeneratorForm(false)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl z-10 overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Novo Gerador</h3>
              <button onClick={() => setShowNewGeneratorForm(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Modelo</label>
                  <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" placeholder="Ex: Cummins C150" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Nº de Série</label>
                  <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" placeholder="Ex: SN-123456" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Potência (kVA)</label>
                  <input type="number" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" placeholder="Ex: 150" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Ano</label>
                  <input type="number" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" placeholder="Ex: 2023" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase">Localização Atual</label>
                <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" placeholder="Ex: Pátio Central" />
              </div>
              <button 
                onClick={() => setShowNewGeneratorForm(false)}
                className="w-full py-3 bg-brand-primary text-brand-secondary rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform mt-4"
              >
                Cadastrar Gerador
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderNewTemplateForm = () => (
    <AnimatePresence>
      {showNewTemplateForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-secondary/90 backdrop-blur-md"
            onClick={() => setShowNewTemplateForm(false)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl z-10 overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Novo Modelo de Checklist</h3>
              <button onClick={() => setShowNewTemplateForm(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase">Nome do Modelo</label>
                <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" placeholder="Ex: Checklist de Entrega" />
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <p className="text-xs text-zinc-500 italic">Após criar o modelo, você poderá adicionar e editar as perguntas na tela de gerenciamento.</p>
              </div>
              <button 
                onClick={() => setShowNewTemplateForm(false)}
                className="w-full py-3 bg-brand-primary text-brand-secondary rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform mt-4"
              >
                Criar Modelo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderEditTemplateForm = () => (
    <AnimatePresence>
      {showEditTemplateForm && editingTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-secondary/90 backdrop-blur-md"
            onClick={() => setShowEditTemplateForm(false)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Editar Perguntas</h3>
                <p className="text-xs text-zinc-500">{editingTemplate.name}</p>
              </div>
              <button onClick={() => setShowEditTemplateForm(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {editingTemplate.questions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-100">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      defaultValue={q.text}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-zinc-900 p-0"
                    />
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                        {q.type}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 text-zinc-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                <Plus size={18} />
                Adicionar Pergunta
              </button>
            </div>
            <div className="p-6 border-t border-zinc-100">
              <button 
                onClick={() => setShowEditTemplateForm(false)}
                className="w-full py-3 bg-brand-primary text-brand-secondary rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform"
              >
                Salvar Alterações
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderNewRentalForm = () => (
    <AnimatePresence>
      {showNewRentalForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-secondary/90 backdrop-blur-md"
            onClick={() => setShowNewRentalForm(false)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl z-10 overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Nova Locação</h3>
              <button onClick={() => setShowNewRentalForm(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase">Cliente</label>
                <select className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none">
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase">Gerador</label>
                <select className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none">
                  <option value="">Selecione um gerador disponível</option>
                  {generators.filter(g => g.status === 'Disponível').map(g => <option key={g.id} value={g.id}>{g.model} ({g.id})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Data Início</label>
                  <input type="date" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Valor Mensal</label>
                  <input type="number" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" placeholder="R$ 0,00" />
                </div>
              </div>
              <button 
                onClick={() => setShowNewRentalForm(false)}
                className="w-full py-3 bg-brand-primary text-brand-secondary rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform mt-4"
              >
                Confirmar Locação
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderNewClientForm = () => (
    <AnimatePresence>
      {showNewClientForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-secondary/90 backdrop-blur-md"
            onClick={() => setShowNewClientForm(false)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl z-10 overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Novo Cliente</h3>
              <button onClick={() => setShowNewClientForm(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase">Nome / Razão Social</label>
                <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase">CNPJ</label>
                <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" placeholder="00.000.000/0000-00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">E-mail</label>
                  <input type="email" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Telefone</label>
                  <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase">Endereço</label>
                <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
              </div>
              <button 
                onClick={() => setShowNewClientForm(false)}
                className="w-full py-3 bg-brand-primary text-brand-secondary rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform mt-4"
              >
                Cadastrar Cliente
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderRentalDetailModal = () => (
    <AnimatePresence>
      {showRentalDetailModal && selectedRental && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-secondary/90 backdrop-blur-md"
            onClick={() => setShowRentalDetailModal(false)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl z-10 overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Detalhes da Locação</h3>
              <button onClick={() => setShowRentalDetailModal(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-zinc-900">{selectedRental.companyName}</h4>
                  <p className="text-sm text-zinc-500">Contrato #{selectedRental.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Equipamento</p>
                  <p className="text-sm font-bold text-zinc-900">{generators.find(g => g.id === selectedRental.generatorId)?.model || selectedRental.generatorId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Status</p>
                  <Badge status={selectedRental.status} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Data de Início</p>
                  <p className="text-sm font-bold text-zinc-900">{format(new Date(selectedRental.startDate), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Valor Mensal</p>
                  <p className="text-sm font-bold text-brand-primary">R$ {selectedRental.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                <h5 className="text-xs font-bold text-zinc-900 uppercase">Dados do Cliente</h5>
                {clients.find(c => c.id === selectedRental.clientId) ? (
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-600"><strong>CNPJ:</strong> {clients.find(c => c.id === selectedRental.clientId)?.cnpj}</p>
                    <p className="text-xs text-zinc-600"><strong>Endereço:</strong> {clients.find(c => c.id === selectedRental.clientId)?.address}</p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">Dados do cliente não encontrados.</p>
                )}
              </div>

              <button 
                onClick={() => setShowRentalDetailModal(false)}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderSignatureModal = () => (
    <AnimatePresence>
      {showSignatureModal && signatureData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-secondary/90 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Assinatura de Documento</h2>
              <button onClick={() => setShowSignatureModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                  <FileText size={18} className="text-brand-primary" />
                  {signatureData.title}
                </h3>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-600">
                  <p><strong>Gerador:</strong> {selectedGenerator?.model} ({selectedGenerator?.id})</p>
                  <p><strong>Data:</strong> {format(new Date(), "dd/MM/yyyy")}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Técnico</label>
                  <input 
                    type="text"
                    value={signatureData.technicianName}
                    onChange={(e) => setSignatureData({ ...signatureData, technicianName: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:border-brand-primary outline-none"
                    placeholder="Nome do técnico..."
                  />
                  <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 h-40">
                    <SignaturePad 
                      ref={technicianSigRef}
                      options={{ penColor: 'black' }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => technicianSigRef.current?.clear()} className="text-[10px] font-bold text-brand-primary uppercase">Limpar Assinatura</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Responsável (Cliente)</label>
                  <input 
                    type="text"
                    value={signatureData.responsibleName}
                    onChange={(e) => setSignatureData({ ...signatureData, responsibleName: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:border-brand-primary outline-none"
                    placeholder="Nome do responsável..."
                  />
                  <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 h-40">
                    <SignaturePad 
                      ref={responsibleSigRef}
                      options={{ penColor: 'black' }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => responsibleSigRef.current?.clear()} className="text-[10px] font-bold text-brand-primary uppercase">Limpar Assinatura</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex gap-3">
              <button 
                onClick={() => setShowSignatureModal(false)}
                className="flex-1 py-3 border border-zinc-200 text-zinc-600 rounded-xl font-bold text-sm hover:bg-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveSignature}
                className="flex-1 py-3 bg-brand-primary text-brand-secondary rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-transform"
              >
                Finalizar e Salvar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderMaintenanceForm = () => (
    <AnimatePresence>
      {showMaintenanceForm && selectedGenerator && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMaintenanceForm(false)}
            className="absolute inset-0 bg-brand-secondary/80 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Registrar Manutenção</h2>
              <button onClick={() => setShowMaintenanceForm(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tipo de Manutenção</label>
                <select 
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value as MaintenanceType)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-brand-primary transition-colors"
                >
                  <option value="Preventiva">Preventiva</option>
                  <option value="Corretiva">Corretiva</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Descrição</label>
                <textarea 
                  value={maintenanceDescription}
                  onChange={(e) => setMaintenanceDescription(e.target.value)}
                  placeholder="Descreva o serviço realizado..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-brand-primary transition-colors min-h-[100px]"
                />
              </div>

              {maintenanceType === 'Corretiva' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Peças e Valores</label>
                      <button 
                        onClick={() => setMaintenanceParts([...maintenanceParts, { id: Date.now().toString(), name: '', value: 0 }])}
                        className="text-[10px] font-bold text-brand-primary uppercase flex items-center gap-1"
                      >
                        <Plus size={12} /> Adicionar Peça
                      </button>
                    </div>
                    {maintenanceParts.map((part, idx) => (
                      <div key={part.id} className="flex gap-2">
                        <input 
                          placeholder="Nome da peça"
                          className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={part.name}
                          onChange={(e) => {
                            const newParts = [...maintenanceParts];
                            newParts[idx].name = e.target.value;
                            setMaintenanceParts(newParts);
                          }}
                        />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">R$</span>
                          <input 
                            type="number"
                            className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                            value={part.value}
                            onChange={(e) => {
                              const newParts = [...maintenanceParts];
                              newParts[idx].value = Number(e.target.value);
                              setMaintenanceParts(newParts);
                            }}
                          />
                        </div>
                        <button 
                          onClick={() => setMaintenanceParts(maintenanceParts.filter((_, i) => i !== idx))}
                          className="p-2 text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Serviços e Valores</label>
                      <button 
                        onClick={() => setMaintenanceServices([...maintenanceServices, { id: Date.now().toString(), name: '', value: 0 }])}
                        className="text-[10px] font-bold text-brand-primary uppercase flex items-center gap-1"
                      >
                        <Plus size={12} /> Adicionar Serviço
                      </button>
                    </div>
                    {maintenanceServices.map((service, idx) => (
                      <div key={service.id} className="flex gap-2">
                        <input 
                          placeholder="Descrição do serviço"
                          className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={service.name}
                          onChange={(e) => {
                            const newServices = [...maintenanceServices];
                            newServices[idx].name = e.target.value;
                            setMaintenanceServices(newServices);
                          }}
                        />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">R$</span>
                          <input 
                            type="number"
                            className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                            value={service.value}
                            onChange={(e) => {
                              const newServices = [...maintenanceServices];
                              newServices[idx].value = Number(e.target.value);
                              setMaintenanceServices(newServices);
                            }}
                          />
                        </div>
                        <button 
                          onClick={() => setMaintenanceServices(maintenanceServices.filter((_, i) => i !== idx))}
                          className="p-2 text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex justify-between items-center">
                    <span className="text-sm font-bold text-brand-secondary">Total Estimado</span>
                    <span className="text-lg font-black text-brand-primary">
                      R$ {(
                        maintenanceParts.reduce((acc, p) => acc + p.value, 0) + 
                        maintenanceServices.reduce((acc, s) => acc + s.value, 0)
                      ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex gap-3">
              <button 
                onClick={() => setShowMaintenanceForm(false)}
                className="flex-1 py-3 border border-zinc-200 text-zinc-600 rounded-xl font-bold text-sm hover:bg-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  const total = maintenanceParts.reduce((acc, p) => acc + p.value, 0) + maintenanceServices.reduce((acc, s) => acc + s.value, 0);
                  const newMaintenance: MaintenanceEvent = {
                    id: `MNT-${Date.now()}`,
                    date: new Date().toISOString(),
                    description: maintenanceDescription,
                    technician: 'Ricardo Lima',
                    type: maintenanceType,
                    cost: total > 0 ? total : undefined,
                    parts: maintenanceParts,
                    services: maintenanceServices
                  };
                  
                  const updatedGenerators = generators.map(g => {
                    if (g.id === selectedGenerator.id) {
                      return {
                        ...g,
                        maintenanceHistory: [newMaintenance, ...g.maintenanceHistory]
                      };
                    }
                    return g;
                  });
                  
                  setGenerators(updatedGenerators);
                  setSelectedGenerator({
                    ...selectedGenerator,
                    maintenanceHistory: [newMaintenance, ...selectedGenerator.maintenanceHistory]
                  });
                  
                  setSignatureData({
                    technicianName: 'Ricardo Lima',
                    responsibleName: '',
                    maintenanceDetails: newMaintenance,
                    title: `Manutenção ${maintenanceType} - ${selectedGenerator.model}`
                  });
                  
                  setShowMaintenanceForm(false);
                  setShowSignatureModal(true);
                }}
                className="flex-1 py-3 bg-brand-primary text-brand-secondary rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-transform"
              >
                Salvar e Assinar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderChecklistForm = () => (
    <AnimatePresence>
      {showChecklistForm && currentChecklistTemplate && selectedGenerator && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-secondary/80 backdrop-blur-sm"
            onClick={() => setShowChecklistForm(false)}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">{currentChecklistTemplate.name}</h2>
                <p className="text-xs text-zinc-500">Gerador: {selectedGenerator.model} ({selectedGenerator.id})</p>
              </div>
              <button onClick={() => setShowChecklistForm(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {currentChecklistTemplate.questions.map((q) => (
                <div key={q.id} className="space-y-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <label className="text-sm font-bold text-zinc-700 block">{q.text}</label>
                  
                  {q.type === 'boolean' && (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setChecklistAnswers({ ...checklistAnswers, [q.id]: 'true' })}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                          checklistAnswers[q.id] === 'true' 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'bg-white border-zinc-200 text-zinc-400 hover:border-emerald-200'
                        }`}
                      >
                        SIM
                      </button>
                      <button 
                        onClick={() => setChecklistAnswers({ ...checklistAnswers, [q.id]: 'false' })}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                          checklistAnswers[q.id] === 'false' 
                            ? 'bg-rose-500 border-rose-500 text-white' 
                            : 'bg-white border-zinc-200 text-zinc-400 hover:border-rose-200'
                        }`}
                      >
                        NÃO
                      </button>
                    </div>
                  )}

                  {q.type === 'number' && (
                    <input 
                      type="number" 
                      value={checklistAnswers[q.id] || ''}
                      onChange={(e) => setChecklistAnswers({ ...checklistAnswers, [q.id]: e.target.value })}
                      className="w-full bg-white border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-primary outline-none transition-all"
                      placeholder="Digite o valor numérico..."
                    />
                  )}

                  {q.type === 'text' && (
                    <textarea 
                      value={checklistAnswers[q.id] || ''}
                      onChange={(e) => setChecklistAnswers({ ...checklistAnswers, [q.id]: e.target.value })}
                      className="w-full bg-white border-2 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-primary outline-none transition-all min-h-[100px]"
                      placeholder="Descreva detalhadamente..."
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-zinc-100 bg-zinc-50">
              <button 
                onClick={() => {
                  const mockResult: ChecklistResult = {
                    id: `CHK-${Date.now()}`,
                    generatorId: selectedGenerator.id,
                    templateId: currentChecklistTemplate.id,
                    date: new Date().toISOString(),
                    employeeId: 'EMP-1',
                    answers: checklistAnswers
                  };
                  
                  setSignatureData({
                    technicianName: 'Ricardo Lima',
                    responsibleName: '',
                    checklistResult: mockResult,
                    title: currentChecklistTemplate.name
                  });
                  setShowChecklistForm(false);
                  setShowSignatureModal(true);
                }}
                className="w-full py-4 bg-brand-primary text-brand-secondary rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Avançar para Assinatura
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderChecklistSelector = () => (
    <AnimatePresence>
      {showChecklistSelector && selectedGenerator && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowChecklistSelector(false)}
            className="absolute inset-0 bg-brand-secondary/80 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Escolher Checklist</h2>
              <button onClick={() => setShowChecklistSelector(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-3">
              {templates.map(tmpl => (
                <button 
                  key={tmpl.id}
                  onClick={() => {
                    setCurrentChecklistTemplate(tmpl);
                    setChecklistAnswers({});
                    setShowChecklistSelector(false);
                    setShowChecklistForm(true);
                  }}
                  className="w-full p-4 flex items-center justify-between bg-zinc-50 hover:bg-brand-primary/5 border border-zinc-100 hover:border-brand-primary/30 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-zinc-400 group-hover:text-brand-primary border border-zinc-100">
                      <ClipboardCheck size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-zinc-900">{tmpl.name}</p>
                      <p className="text-xs text-zinc-500">{tmpl.questions.length} itens</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-300 group-hover:text-brand-primary" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

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
                        <button 
                          onClick={() => setShowChecklistSelector(true)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 bg-brand-primary text-brand-secondary rounded-xl text-sm font-bold transition-colors shadow-sm"
                        >
                          <ClipboardCheck size={16} />
                          Novo Checklist
                        </button>
                        <button 
                          onClick={() => setShowMaintenanceForm(true)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-sm font-medium transition-colors"
                        >
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
        <h2 className="text-2xl font-bold text-zinc-900">Modelos de Checklist</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tmpl) => (
          <Card key={tmpl.id} className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-zinc-50 rounded-xl text-zinc-600">
                <ClipboardCheck size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingTemplate(tmpl);
                    setShowEditTemplateForm(true);
                  }}
                  className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900"
                  title="Editar Perguntas"
                >
                  <Settings size={18} />
                </button>
              </div>
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

            <button 
              onClick={() => {
                setEditingTemplate(tmpl);
                setShowEditTemplateForm(true);
              }}
              className="mt-6 w-full py-2.5 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white rounded-xl text-sm font-bold transition-all"
            >
              Ver / Editar Perguntas
            </button>
          </Card>
        ))}
        
        <button 
          onClick={() => setShowNewTemplateForm(true)}
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 rounded-2xl hover:border-zinc-400 hover:bg-zinc-50 transition-all group"
        >
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
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-zinc-900">Locações</h2>
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            <button 
              onClick={() => setRentalSubTab('active')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${rentalSubTab === 'active' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Ativas
            </button>
            <button 
              onClick={() => setRentalSubTab('clients')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${rentalSubTab === 'clients' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Clientes
            </button>
            <button 
              onClick={() => setRentalSubTab('history')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${rentalSubTab === 'history' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Histórico
            </button>
          </div>
        </div>
      </div>

      {rentalSubTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.filter(r => r.status === 'Ativo').map((rental) => {
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
                  <button 
                    onClick={() => {
                      setSelectedRental(rental);
                      setShowRentalDetailModal(true);
                    }}
                    className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-900 font-bold text-xs flex items-center gap-1"
                  >
                    Detalhes
                    <ChevronRight size={14} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {rentalSubTab === 'clients' && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">CNPJ</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-bold">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">{client.name}</p>
                        <p className="text-xs text-zinc-500">{client.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{client.cnpj}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-900">{client.phone}</p>
                    <p className="text-xs text-zinc-500">{client.email}</p>
                  </td>
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
      )}

      {rentalSubTab === 'history' && (
        <div className="space-y-4">
          {rentals.filter(r => r.status === 'Finalizado').map((rental) => {
            const gen = generators.find(g => g.id === rental.generatorId);
            return (
              <Card key={rental.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-50 rounded-xl text-zinc-400">
                    <History size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">{rental.companyName}</h4>
                    <p className="text-xs text-zinc-500">Gerador: {gen?.model || rental.generatorId} • Período: {format(new Date(rental.startDate), "dd/MM/yyyy")} até {rental.endDate ? format(new Date(rental.endDate), "dd/MM/yyyy") : 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Valor Total</p>
                  <p className="text-sm font-bold text-zinc-900">R$ {rental.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</p>
                </div>
              </Card>
            );
          })}
          {rentals.filter(r => r.status === 'Finalizado').length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-6">
                <History size={40} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Nenhum histórico de locação</h3>
              <p className="text-zinc-500 mt-2">As locações finalizadas aparecerão aqui.</p>
            </div>
          )}
        </div>
      )}
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
            <NavItem 
              icon={FileText} 
              label="Documentação" 
              active={activeTab === 'documentation'} 
              onClick={() => setActiveTab('documentation')} 
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
                {activeTab === 'documentation' && 'Documentação'}
              </p>
            </div>
            
            {activeTab !== 'dashboard' && (
              <div className="hidden sm:block">
                <button 
                  onClick={() => {
                    if (activeTab === 'rig') setShowNewGeneratorForm(true);
                    if (activeTab === 'checklists') setShowNewTemplateForm(true);
                    if (activeTab === 'rentals') {
                      if (rentalSubTab === 'clients') setShowNewClientForm(true);
                      else setShowNewRentalForm(true);
                    }
                  }}
                  className="flex items-center gap-2 bg-brand-primary text-brand-secondary px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
                >
                  <Plus size={18} />
                  {activeTab === 'rig' ? 'Novo Gerador' : 
                   activeTab === 'checklists' ? 'Novo Modelo' :
                   activeTab === 'rentals' ? (rentalSubTab === 'clients' ? 'Novo Cliente' : 'Nova Locação') :
                   activeTab === 'employees' ? 'Novo Funcionário' : 
                   activeTab === 'documentation' ? 'Novo Documento' : 'Ação Rápida'}
                </button>
              </div>
            )}
          </div>

          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'rig' && renderRIG()}
          {activeTab === 'checklists' && renderChecklists()}
          {activeTab === 'employees' && renderEmployees()}
          {activeTab === 'rentals' && renderRentals()}
          {activeTab === 'documentation' && renderDocumentation()}
          {renderSignatureModal()}
          {renderMaintenanceForm()}
          {renderChecklistSelector()}
          {renderNewGeneratorForm()}
          {renderNewTemplateForm()}
          {renderEditTemplateForm()}
          {renderNewRentalForm()}
          {renderNewClientForm()}
          {renderRentalDetailModal()}
          {renderChecklistForm()}
          {renderDocumentViewModal()}
        </div>
      </main>
    </div>
  );
}
