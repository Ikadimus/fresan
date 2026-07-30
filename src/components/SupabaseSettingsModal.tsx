import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, X, Key, ExternalLink, Code } from 'lucide-react';
import { supabaseService, SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from '../lib/supabase';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess?: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess
}) => {
  const [status, setStatus] = useState<{ loading: boolean; ok: boolean; message: string }>({
    loading: false,
    ok: isSupabaseConfigured,
    message: isSupabaseConfigured ? 'Chaves detectadas' : 'Supabase não configurado no .env'
  });

  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'guide'>('status');

  useEffect(() => {
    if (isOpen) {
      testConnection();
    }
  }, [isOpen]);

  const testConnection = async () => {
    setStatus({ loading: true, ok: false, message: 'Testando conexão...' });
    const res = await supabaseService.checkConnection();
    setStatus({ loading: false, ok: res.ok, message: res.message });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-100">
        
        {/* Header */}
        <div className="p-6 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <Database size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                Integração Supabase
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30">
                  PostgreSQL
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80">Banco de dados relacional e tempo real</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Status da Conexão
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Code size={14} />
            Script SQL das Tabelas
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Key size={14} />
            Como Configurar
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {activeTab === 'status' && (
            <div className="space-y-6">
              <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
                status.ok 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}>
                {status.loading ? (
                  <RefreshCw className="animate-spin text-emerald-600 shrink-0 mt-0.5" size={20} />
                ) : status.ok ? (
                  <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                ) : (
                  <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-sm">
                    {status.loading ? 'Verificando status...' : status.ok ? 'Supabase Conectado!' : 'Modo Demonstração (Sem Supabase Direct)'}
                  </h4>
                  <p className="text-xs mt-1 opacity-90 leading-relaxed">
                    {status.message}
                  </p>
                </div>
                <button
                  onClick={testConnection}
                  disabled={status.loading}
                  className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw size={12} className={status.loading ? 'animate-spin' : ''} />
                  Testar Novamente
                </button>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 space-y-4">
                <h4 className="font-black text-xs uppercase tracking-wider text-zinc-500">
                  Variáveis de Ambiente Recomendadas (.env)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                      SUPABASE URL
                    </label>
                    <code className="block p-3 bg-zinc-900 text-emerald-400 rounded-xl text-xs font-mono break-all">
                      {import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrgihnukvweexaojbcwm.supabase.co'}
                    </code>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                      SUPABASE PUBLISHABLE / ANON KEY
                    </label>
                    <code className="block p-3 bg-zinc-900 text-emerald-400 rounded-xl text-xs font-mono break-all">
                      {import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_VI7LVzSSpXWrxOq50cRX0g_LJstKQyc'}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">Script de Criação de Tabelas</h4>
                  <p className="text-xs text-zinc-500">Execute este código no SQL Editor do seu projeto Supabase</p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  {copiedSql ? <Check size={16} /> : <Copy size={16} />}
                  {copiedSql ? 'Copiado!' : 'Copiar SQL'}
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 p-4">
                <pre className="text-xs font-mono text-emerald-300 overflow-x-auto max-h-[300px] leading-relaxed">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-sm text-zinc-700 leading-relaxed">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                <ExternalLink className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h5 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">Passo a Passo Rápido</h5>
                  <p className="text-xs text-emerald-800 mt-1">
                    Como conectar o projeto Fresan Geradores ao seu próprio banco de dados Supabase em 3 minutos:
                  </p>
                </div>
              </div>

              <ol className="space-y-3 list-decimal list-inside text-xs font-medium text-zinc-600">
                <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  Acesse <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline">supabase.com</a> e crie um novo projeto gratuito.
                </li>
                <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  No menu lateral do Supabase, clique em <strong>SQL Editor</strong> e cole o código da aba <strong>Script SQL das Tabelas</strong>. Clique em <strong>Run</strong>.
                </li>
                <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  Vá em <strong>Project Settings &gt; API</strong> no Supabase e copie a <strong>Project URL</strong> e a chave <strong>anon / public</strong>.
                </li>
                <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  Adicione essas chaves às variáveis de ambiente do seu ambiente AI Studio ou arquivo <code className="bg-zinc-200 text-zinc-900 px-1 py-0.5 rounded font-mono text-[11px]">.env.example</code>.
                </li>
              </ol>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-zinc-900 text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition-all"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
