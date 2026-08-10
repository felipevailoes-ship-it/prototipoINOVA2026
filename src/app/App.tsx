// LatiControl — Protótipo Completo B2B2C
// Painel Web (Administrador) + App Mobile (Promotor de Vendas)

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Bell, Users, Settings, ChevronLeft, Plus, Eye, EyeOff, Phone, MapPin,
  Edit2, LogOut, MessageSquare, Search, Tag, User, X, Package, Check,
  AlertCircle, ChevronDown, Clipboard, ShoppingBag, Store,
  LayoutDashboard, KeyRound, Layers, AlertTriangle, Send, Clock,
  Building2, Shield, CheckCircle2, XCircle, ChevronRight, Filter,
  Monitor, Smartphone, BarChart3, ArrowRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

type LotStatus = "Aguardando Distribuição" | "Em Ponto de Venda" | "Esgotado" | "Recolhido / Inativo";
type ExpiryStatus = "verde" | "amarelo" | "vermelho";
type AccessGroup = "Administrador" | "Promotor de Vendas";
type ProductCategory = "Limpeza" | "Alimentos perecíveis" | "Alimentos não perecíveis" | "Higiene" | "Outros";
type ProductUnit = "un" | "litro" | "kg" | "g" | "ml" | "pacote" | "caixa";

interface Colaborador { id: string; name: string; cpf: string; phone: string; role: string; status: "Ativo" | "Inativo"; createdAt: string; }
interface Usuario { id: string; colaboradorId: string; email: string; password: string; group: AccessGroup; status: "Ativo" | "Inativo"; createdAt: string; }
interface Client { id: string; name: string; address: string; contact: string; contactName: string; promotorId: string; notes: string; status: "Ativo" | "Inativo"; createdAt: string; }
interface Product { id: string; name: string; brand: string; category: ProductCategory; unit: ProductUnit; status: "Ativo" | "Inativo"; createdAt: string; }
interface Lot { id: string; productId: string; clientId?: string; lotNumber: string; quantity: number; manufactureDate: string; expiryDate: string; status: LotStatus; notes: string; createdAt: string; }
interface ObservacaoVisita { id: string; lotId?: string; clientId?: string; colaboradorId: string; createdAt: string; observation: string; }

type MobileScreen = { name: "alertas" } | { name: "meusclientes" } | { name: "clientedetail"; clientId: string } | { name: "lotedetail"; lotId: string } | { name: "configuracoes" };

// ═══════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════

const SEED_COLABORADORES: Colaborador[] = [
  { id: "col1", name: "João Silva", cpf: "123.456.789-00", phone: "(11) 99823-4521", role: "Promotor de Vendas", status: "Ativo", createdAt: "2026-01-05" },
  { id: "col2", name: "Maria Santos", cpf: "987.654.321-00", phone: "(11) 97711-0034", role: "Promotor de Vendas", status: "Ativo", createdAt: "2026-01-05" },
  { id: "col3", name: "Carlos Mendes", cpf: "456.123.789-00", phone: "(11) 94433-8812", role: "Supervisor", status: "Ativo", createdAt: "2025-12-01" },
  { id: "col4", name: "Ana Pereira", cpf: "789.456.123-00", phone: "(11) 98765-4321", role: "Gerente Comercial", status: "Inativo", createdAt: "2025-10-15" },
];

const SEED_USUARIOS: Usuario[] = [
  { id: "u1", colaboradorId: "col3", email: "admin@laticontrol.com", password: "admin123", group: "Administrador", status: "Ativo", createdAt: "2025-12-01" },
  { id: "u2", colaboradorId: "col1", email: "joao.silva@laticontrol.com", password: "123456", group: "Promotor de Vendas", status: "Ativo", createdAt: "2026-01-05" },
  { id: "u3", colaboradorId: "col2", email: "maria.santos@laticontrol.com", password: "123456", group: "Promotor de Vendas", status: "Ativo", createdAt: "2026-01-05" },
];

const SEED_CLIENTS: Client[] = [
  { id: "c1", name: "Mercado São João", address: "Rua das Flores, 142 — Centro", contact: "(11) 99823-4521", contactName: "Antônio Ferreira", promotorId: "col1", notes: "Preferência por entregas às terças e quintas.", status: "Ativo", createdAt: "2026-01-10" },
  { id: "c2", name: "Supermercado Família", address: "Av. Brasil, 2050 — Jardim América", contact: "(11) 97711-0034", contactName: "Roseli Nunes", promotorId: "col1", notes: "Solicitar fatura quinzenal.", status: "Ativo", createdAt: "2026-02-03" },
  { id: "c3", name: "Mercearia Bonfim", address: "Rua Ipiranga, 88 — Vila Nova", contact: "(11) 94433-8812", contactName: "Jorge Bonfim", promotorId: "col2", notes: "", status: "Ativo", createdAt: "2026-03-15" },
  { id: "c4", name: "Empório do Bairro", address: "Rua Sete de Setembro, 310", contact: "(11) 98881-2200", contactName: "Marina Costa", promotorId: "col2", notes: "Cliente pausado por reforma.", status: "Inativo", createdAt: "2025-11-20" },
  { id: "c5", name: "Atacadão Centro", address: "Rod. Anhanguera, km 14 — Lote 22", contact: "(11) 93300-7755", contactName: "Fábio Meireles", promotorId: "col1", notes: "Compras em volume. Negociar desconto acima de 200 un.", status: "Ativo", createdAt: "2026-04-07" },
];

const SEED_PRODUCTS: Product[] = [
  { id: "p1", name: "Detergente Ypê 500ml", brand: "Ypê", category: "Limpeza", unit: "un", status: "Ativo", createdAt: "2026-01-05" },
  { id: "p2", name: "Leite Integral Parmalat 1L", brand: "Parmalat", category: "Alimentos perecíveis", unit: "litro", status: "Ativo", createdAt: "2026-01-05" },
  { id: "p3", name: "Arroz Tio João 5kg", brand: "Tio João", category: "Alimentos não perecíveis", unit: "kg", status: "Ativo", createdAt: "2026-01-10" },
  { id: "p4", name: "Sabonete Dove 90g", brand: "Dove", category: "Higiene", unit: "un", status: "Ativo", createdAt: "2026-01-12" },
  { id: "p5", name: "Amaciante Comfort 2L", brand: "Comfort", category: "Limpeza", unit: "litro", status: "Ativo", createdAt: "2026-02-01" },
  { id: "p6", name: "Biscoito Oreo 144g", brand: "Nabisco", category: "Alimentos não perecíveis", unit: "pacote", status: "Ativo", createdAt: "2026-03-08" },
];

// Today = 2026-08-08
const SEED_LOTS: Lot[] = [
  { id: "l1", productId: "p2", clientId: "c1", lotNumber: "PMT-2026-0342", quantity: 48, manufactureDate: "2026-07-15", expiryDate: "2026-08-15", status: "Em Ponto de Venda", notes: "Verificar temperatura.", createdAt: "2026-07-20" },
  { id: "l2", productId: "p1", clientId: "c1", lotNumber: "YPE-2026-1811", quantity: 72, manufactureDate: "2026-06-10", expiryDate: "2026-09-10", status: "Em Ponto de Venda", notes: "", createdAt: "2026-06-25" },
  { id: "l3", productId: "p3", clientId: "c2", lotNumber: "TJ-2026-4407", quantity: 120, manufactureDate: "2026-04-15", expiryDate: "2026-10-15", status: "Em Ponto de Venda", notes: "", createdAt: "2026-04-20" },
  { id: "l4", productId: "p2", clientId: "c2", lotNumber: "PMT-2026-0519", quantity: 36, manufactureDate: "2026-07-28", expiryDate: "2026-08-18", status: "Em Ponto de Venda", notes: "Segundo lote do mês.", createdAt: "2026-08-01" },
  { id: "l5", productId: "p4", clientId: "c3", lotNumber: "DVE-2026-0088", quantity: 24, manufactureDate: "2026-05-28", expiryDate: "2026-08-28", status: "Em Ponto de Venda", notes: "", createdAt: "2026-06-01" },
  { id: "l6", productId: "p5", clientId: "c3", lotNumber: "CMF-2026-2234", quantity: 18, manufactureDate: "2026-06-01", expiryDate: "2026-09-01", status: "Em Ponto de Venda", notes: "Verificar posição na gôndola.", createdAt: "2026-06-10" },
  { id: "l7", productId: "p6", clientId: "c5", lotNumber: "ORE-2026-7712", quantity: 200, manufactureDate: "2026-05-05", expiryDate: "2026-08-05", status: "Em Ponto de Venda", notes: "URGENTE: produto já vencido.", createdAt: "2026-05-10" },
  { id: "l8", productId: "p1", clientId: "c5", lotNumber: "YPE-2026-2095", quantity: 144, manufactureDate: "2026-07-20", expiryDate: "2026-11-20", status: "Em Ponto de Venda", notes: "", createdAt: "2026-07-25" },
  { id: "l9", productId: "p2", clientId: undefined, lotNumber: "PMT-2026-0601", quantity: 60, manufactureDate: "2026-07-25", expiryDate: "2026-09-20", status: "Aguardando Distribuição", notes: "Aguardando definição de rota.", createdAt: "2026-08-01" },
  { id: "l10", productId: "p6", clientId: "c2", lotNumber: "ORE-2026-5544", quantity: 80, manufactureDate: "2026-04-10", expiryDate: "2026-07-15", status: "Esgotado", notes: "Produto esgotado conforme esperado.", createdAt: "2026-04-15" },
];

const SEED_OBSERVATIONS: ObservacaoVisita[] = [
  { id: "obs1", lotId: "l1", colaboradorId: "col1", createdAt: "2026-08-08T09:15:00", observation: "Antônio informou que o leite está com baixa rotatividade. Propus reorganização na gôndola para maior visibilidade." },
  { id: "obs2", lotId: "l1", colaboradorId: "col1", createdAt: "2026-08-06T14:30:00", observation: "Liguei para o Antônio, não atendeu. Tentarei novamente amanhã." },
  { id: "obs3", lotId: "l4", colaboradorId: "col1", createdAt: "2026-08-07T11:00:00", observation: "Roseli confirmou interesse em reposição. Aguardando autorização do comprador." },
  { id: "obs4", clientId: "c1", colaboradorId: "col1", createdAt: "2026-08-05T10:00:00", observation: "Visita de rotina completa. Gôndola em bom estado. Gerente satisfeito com o posicionamento dos produtos." },
  { id: "obs5", lotId: "l7", colaboradorId: "col1", createdAt: "2026-08-07T16:00:00", observation: "Fábio confirmou que biscoito já venceu. Solicitei ao Admin o recolhimento formal do lote." },
  { id: "obs6", lotId: "l5", colaboradorId: "col2", createdAt: "2026-08-06T10:00:00", observation: "Jorge aprovou campanha de higiene. Pediu mais 24 unidades de sabonete para o próximo mês." },
  { id: "obs7", clientId: "c3", colaboradorId: "col2", createdAt: "2026-08-04T09:00:00", observation: "Visita regular. Mercearia com bom fluxo. Posição dos produtos bem mantida." },
];

// ═══════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════

const TODAY = new Date("2026-08-08");

function getDaysLeft(expiryDate: string): number {
  if (!expiryDate) return 999;
  return Math.floor((new Date(expiryDate).getTime() - TODAY.getTime()) / 86400000);
}

function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const d = getDaysLeft(expiryDate);
  if (d > 30) return "verde";
  if (d >= 15) return "amarelo";
  return "vermelho";
}

function fmt(s: string) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

function fmtDT(s: string) {
  if (!s) return "";
  return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function uid() { return Math.random().toString(36).slice(2, 9); }
function nowISO() { return new Date("2026-08-08T" + new Date().toTimeString().slice(0, 8)).toISOString().slice(0, 19); }
function todayStr() { return "2026-08-08"; }

// ═══════════════════════════════════════════════════════
// SHARED UI PRIMITIVES
// ═══════════════════════════════════════════════════════

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh] ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${value ? "bg-emerald-500" : "bg-slate-300"}`}>
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${value ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function FormField({ label, value, onChange, type = "text", placeholder = "", multiline, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; multiline?: boolean; options?: string[]; required?: boolean;
}) {
  const cls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {options ? (
        <div className="relative">
          <select value={value} onChange={e => onChange(e.target.value)} className={cls + " appearance-none pr-8"}>
            <option value="">Selecione...</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      ) : multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + " resize-none"} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function ExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const st = getExpiryStatus(expiryDate);
  const days = getDaysLeft(expiryDate);
  const cfg = {
    verde: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    amarelo: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
    vermelho: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
  }[st];
  const label = days < 0 ? `${Math.abs(days)}d vencido` : `${days}d`;
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold font-mono ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
}

function LotStatusBadge({ status }: { status: LotStatus }) {
  const cfg: Record<LotStatus, string> = {
    "Aguardando Distribuição": "bg-slate-100 text-slate-600",
    "Em Ponto de Venda": "bg-blue-100 text-blue-700",
    "Esgotado": "bg-emerald-100 text-emerald-700",
    "Recolhido / Inativo": "bg-red-100 text-red-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cfg[status]}`}>{status}</span>;
}

function StatusBadge({ active }: { active: boolean }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}><span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />{active ? "Ativo" : "Inativo"}</span>;
}

function SaveBtn({ onPress, label = "Salvar" }: { onPress: () => void; label?: string }) {
  return <button onClick={onPress} className="w-full bg-blue-600 text-white font-semibold rounded-xl py-3 text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors">{label}</button>;
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400"><Icon size={36} strokeWidth={1.2} /><p className="text-sm text-center max-w-[180px]">{text}</p></div>;
}

// ═══════════════════════════════════════════════════════
// WEB ADMIN — SIDEBAR
// ═══════════════════════════════════════════════════════

type WebPage = "dashboard" | "colaboradores" | "usuarios" | "clientes" | "produtos" | "lotes";

const WEB_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "colaboradores", label: "Colaboradores", icon: Users },
  { id: "usuarios", label: "Usuários do Sistema", icon: KeyRound },
  { id: "clientes", label: "Clientes", icon: Building2 },
  { id: "produtos", label: "Produtos", icon: Tag },
  { id: "lotes", label: "Controle de Lotes", icon: Layers },
] as const;

function WebSidebar({ page, onPage, onLogout }: { page: WebPage; onPage: (p: WebPage) => void; onLogout: () => void }) {
  return (
    <aside className="w-60 bg-slate-900 flex flex-col shrink-0 h-full">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"><ShoppingBag size={16} className="text-white" /></div>
          <div><p className="text-white font-bold text-sm leading-tight">LatiControl</p><p className="text-slate-400 text-[10px]">Painel Administrativo</p></div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {WEB_NAV.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button key={id} onClick={() => onPage(id as WebPage)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
              <span className="flex-1">{label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <LogOut size={16} /><span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════
// WEB ADMIN — DASHBOARD
// ═══════════════════════════════════════════════════════

function DashboardPage({ colaboradores, clientes, lotes, produtos }: { colaboradores: Colaborador[]; clientes: Client[]; lotes: Lot[]; produtos: Product[]; }) {
  const emPDV = lotes.filter(l => l.status === "Em Ponto de Venda");
  const agDist = lotes.filter(l => l.status === "Aguardando Distribuição");
  const criticos = emPDV.filter(l => getExpiryStatus(l.expiryDate) === "vermelho");
  const atencao = emPDV.filter(l => getExpiryStatus(l.expiryDate) === "amarelo");

  const kpis = [
    { label: "Em Ponto de Venda", value: emPDV.length, color: "border-blue-500", icon: Store, sub: "lotes ativos nos mercados" },
    { label: "Críticos (Vermelho)", value: criticos.length, color: "border-red-500", icon: AlertTriangle, sub: "< 15 dias para vencer" },
    { label: "Atenção (Amarelo)", value: atencao.length, color: "border-amber-400", icon: AlertCircle, sub: "15 a 30 dias para vencer" },
    { label: "Ag. Distribuição", value: agDist.length, color: "border-slate-300", icon: Package, sub: "sem mercado vinculado" },
  ];

  const chartData = colaboradores.filter(c => c.status === "Ativo" && c.role === "Promotor de Vendas").map(col => {
    const myClientIds = clientes.filter(cl => cl.promotorId === col.id).map(cl => cl.id);
    const myLots = emPDV.filter(l => l.clientId && myClientIds.includes(l.clientId));
    return {
      name: col.name.split(" ")[0],
      vermelho: myLots.filter(l => getExpiryStatus(l.expiryDate) === "vermelho").length,
      amarelo: myLots.filter(l => getExpiryStatus(l.expiryDate) === "amarelo").length,
      verde: myLots.filter(l => getExpiryStatus(l.expiryDate) === "verde").length,
    };
  });

  const urgentLots = [...criticos, ...atencao].slice(0, 8);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Visão geral do sistema — 08/08/2026</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(({ label, value, color, icon: Icon, sub }) => (
          <div key={label} className={`bg-white rounded-2xl p-5 border-l-4 ${color} shadow-sm`}>
            <div className="flex items-start justify-between">
              <div><p className="text-3xl font-bold text-slate-800">{value}</p><p className="text-sm font-semibold text-slate-700 mt-1">{label}</p><p className="text-xs text-slate-400 mt-0.5">{sub}</p></div>
              <Icon size={22} className="text-slate-300" strokeWidth={1.5} />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Lotes por Promotor × Validade</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="vermelho" name="Vermelho" fill="#EF4444" radius={[3, 3, 0, 0]} />
              <Bar dataKey="amarelo" name="Amarelo" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="verde" name="Verde" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Alertas Urgentes</h3>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-44">
            {urgentLots.length === 0 ? <p className="text-sm text-slate-400 text-center py-6">Nenhum alerta crítico.</p> : urgentLots.map(lot => {
              const prod = produtos.find(p => p.id === lot.productId);
              const client = clientes.find(c => c.id === lot.clientId);
              const days = getDaysLeft(lot.expiryDate);
              return (
                <div key={lot.id} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${getExpiryStatus(lot.expiryDate) === "vermelho" ? "bg-red-500" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{prod?.name ?? "Produto"}</p>
                    <p className="text-[11px] text-slate-400 truncate">{client?.name ?? "Sem cliente"}</p>
                  </div>
                  <span className={`text-xs font-mono font-bold ${days < 0 ? "text-red-600" : "text-amber-600"}`}>{days < 0 ? `${Math.abs(days)}d venc.` : `${days}d`}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WEB ADMIN — COLABORADORES
// ═══════════════════════════════════════════════════════

const ROLES = ["Administrador", "Gerente Comercial", "Promotor de Vendas", "Supervisor", "Outros"];

function ColaboradoresPage({ data, setData }: { data: Colaborador[]; setData: (d: Colaborador[]) => void }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Colaborador | null | "new">(null);

  const editing = modal !== null && modal !== "new" ? modal as Colaborador : null;
  const [name, setName] = useState(""); const [cpf, setCpf] = useState(""); const [phone, setPhone] = useState(""); const [role, setRole] = useState("");

  const openNew = () => { setName(""); setCpf(""); setPhone(""); setRole(""); setModal("new"); };
  const openEdit = (c: Colaborador) => { setName(c.name); setCpf(c.cpf); setPhone(c.phone); setRole(c.role); setModal(c); };

  const save = () => {
    const item: Colaborador = { id: editing?.id ?? uid(), name, cpf, phone, role, status: editing?.status ?? "Ativo", createdAt: editing?.createdAt ?? todayStr() };
    setData(editing ? data.map(d => d.id === item.id ? item : d) : [...data, item]);
    setModal(null);
  };

  const filtered = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.cpf.includes(search));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-xl font-bold text-slate-800">Colaboradores</h1><p className="text-sm text-slate-500">Pessoas físicas da equipe</p></div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"><Plus size={16} />Novo Colaborador</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou CPF..." className="flex-1 text-sm text-slate-700 focus:outline-none" />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>{["Nome", "CPF", "Telefone", "Cargo / Função", "Cadastro", "Status", "Ações"].map(h => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.cpf}</td>
                <td className="px-4 py-3 text-slate-500">{c.phone}</td>
                <td className="px-4 py-3 text-slate-600">{c.role}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{fmt(c.createdAt)}</td>
                <td className="px-4 py-3"><StatusBadge active={c.status === "Ativo"} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Toggle value={c.status === "Ativo"} onChange={v => setData(data.map(d => d.id === c.id ? { ...d, status: v ? "Ativo" : "Inativo" } : d))} />
                    <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon={Users} text="Nenhum colaborador encontrado." />}
      </div>
      {modal && (
        <Modal title={editing ? "Editar Colaborador" : "Novo Colaborador"} onClose={() => setModal(null)}>
          <FormField label="Nome Completo" value={name} onChange={setName} placeholder="Ex: João Silva" required />
          <FormField label="CPF" value={cpf} onChange={setCpf} placeholder="000.000.000-00" />
          <FormField label="Telefone / WhatsApp" value={phone} onChange={setPhone} placeholder="(11) 99999-0000" type="tel" />
          <FormField label="Cargo / Função" value={role} onChange={setRole} options={ROLES} required />
          <SaveBtn onPress={save} />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WEB ADMIN — USUÁRIOS DO SISTEMA
// ═══════════════════════════════════════════════════════

function UsuariosPage({ data, setData, colaboradores }: { data: Usuario[]; setData: (d: Usuario[]) => void; colaboradores: Colaborador[] }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Usuario | null | "new">(null);
  const editing = modal !== null && modal !== "new" ? modal as Usuario : null;
  const [colId, setColId] = useState(""); const [email, setEmail] = useState(""); const [pwd, setPwd] = useState(""); const [group, setGroup] = useState<AccessGroup>("Promotor de Vendas"); const [showPwd, setShowPwd] = useState(false);

  const openNew = () => { setColId(""); setEmail(""); setPwd(""); setGroup("Promotor de Vendas"); setShowPwd(false); setModal("new"); };
  const openEdit = (u: Usuario) => { setColId(u.colaboradorId); setEmail(u.email); setPwd(u.password); setGroup(u.group); setShowPwd(false); setModal(u); };

  const save = () => {
    const item: Usuario = { id: editing?.id ?? uid(), colaboradorId: colId, email, password: pwd, group, status: editing?.status ?? "Ativo", createdAt: editing?.createdAt ?? todayStr() };
    setData(editing ? data.map(d => d.id === item.id ? item : d) : [...data, item]);
    setModal(null);
  };

  const filtered = data.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || colaboradores.find(c => c.id === u.colaboradorId)?.name.toLowerCase().includes(search.toLowerCase()));

  const groupBadge = (g: AccessGroup) => g === "Administrador"
    ? <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full"><Monitor size={10} />Admin Web</span>
    : <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full"><Smartphone size={10} />Promotor Mobile</span>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-xl font-bold text-slate-800">Usuários do Sistema</h1><p className="text-sm text-slate-500">Credenciais e grupos de acesso</p></div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"><Plus size={16} />Novo Usuário</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por e-mail ou colaborador..." className="flex-1 text-sm text-slate-700 focus:outline-none" />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>{["Colaborador", "E-mail / Login", "Grupo de Acesso", "Cadastro", "Status", "Ações"].map(h => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const col = colaboradores.find(c => c.id === u.colaboradorId);
              return (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">{col?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">{groupBadge(u.group)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmt(u.createdAt)}</td>
                  <td className="px-4 py-3"><StatusBadge active={u.status === "Ativo"} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Toggle value={u.status === "Ativo"} onChange={v => setData(data.map(d => d.id === u.id ? { ...d, status: v ? "Ativo" : "Inativo" } : d))} />
                      <button onClick={() => openEdit(u)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon={KeyRound} text="Nenhum usuário encontrado." />}
      </div>
      {modal && (
        <Modal title={editing ? "Editar Usuário" : "Novo Usuário"} onClose={() => setModal(null)}>
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Colaborador Vinculado <span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={colId} onChange={e => setColId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-8">
                <option value="">Selecione o colaborador...</option>
                {colaboradores.filter(c => c.status === "Ativo").map(c => <option key={c.id} value={c.id}>{c.name} — {c.role}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <FormField label="E-mail / Login" value={email} onChange={setEmail} type="email" placeholder="colaborador@empresa.com" required />
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Senha</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
              <input type={showPwd ? "text" : "password"} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••" className="flex-1 bg-transparent py-2.5 text-sm text-slate-800 focus:outline-none" />
              <button onClick={() => setShowPwd(v => !v)} className="p-1 text-slate-400">{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Grupo de Acesso</label>
            <div className="flex flex-col gap-2">
              {(["Administrador", "Promotor de Vendas"] as AccessGroup[]).map(g => (
                <button key={g} onClick={() => setGroup(g)} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${group === g ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold" : "border-slate-200 bg-white text-slate-600"}`}>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${group === g ? "border-blue-500 bg-blue-500" : "border-slate-300"}`}>{group === g && <Check size={10} strokeWidth={3} className="text-white" />}</span>
                  {g === "Administrador" ? <><Monitor size={15} className="shrink-0" /><span>Administrador <span className="text-xs font-normal">(Acesso Web)</span></span></> : <><Smartphone size={15} className="shrink-0" /><span>Promotor de Vendas <span className="text-xs font-normal">(Acesso Mobile)</span></span></>}
                </button>
              ))}
            </div>
          </div>
          <SaveBtn onPress={save} />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WEB ADMIN — CLIENTES
// ═══════════════════════════════════════════════════════

function ClientesPage({ data, setData, colaboradores }: { data: Client[]; setData: (d: Client[]) => void; colaboradores: Colaborador[] }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Client | null | "new">(null);
  const editing = modal !== null && modal !== "new" ? modal as Client : null;
  const [name, setName] = useState(""); const [address, setAddress] = useState(""); const [contact, setContact] = useState(""); const [contactName, setContactName] = useState(""); const [promotorId, setPromotorId] = useState(""); const [notes, setNotes] = useState("");

  const openNew = () => { setName(""); setAddress(""); setContact(""); setContactName(""); setPromotorId(""); setNotes(""); setModal("new"); };
  const openEdit = (c: Client) => { setName(c.name); setAddress(c.address); setContact(c.contact); setContactName(c.contactName); setPromotorId(c.promotorId); setNotes(c.notes); setModal(c); };

  const save = () => {
    const item: Client = { id: editing?.id ?? uid(), name, address, contact, contactName, promotorId, notes, status: editing?.status ?? "Ativo", createdAt: editing?.createdAt ?? todayStr() };
    setData(editing ? data.map(d => d.id === item.id ? item : d) : [...data, item]);
    setModal(null);
  };

  const promotores = colaboradores.filter(c => c.role === "Promotor de Vendas" && c.status === "Ativo");
  const filtered = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.contactName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-xl font-bold text-slate-800">Clientes</h1><p className="text-sm text-slate-500">Mercados e pontos de venda</p></div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"><Plus size={16} />Novo Cliente</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou responsável..." className="flex-1 text-sm text-slate-700 focus:outline-none" />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>{["Nome / Mercado", "Responsável", "Contato", "Promotor", "Status", "Ações"].map(h => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const promotor = colaboradores.find(col => col.id === c.promotorId);
              return (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3"><p className="font-semibold text-slate-800">{c.name}</p><p className="text-xs text-slate-400 mt-0.5">{c.address}</p></td>
                  <td className="px-4 py-3 text-slate-600">{c.contactName}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{c.contact}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{promotor?.name ?? "Não atribuído"}</span></td>
                  <td className="px-4 py-3"><StatusBadge active={c.status === "Ativo"} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Toggle value={c.status === "Ativo"} onChange={v => setData(data.map(d => d.id === c.id ? { ...d, status: v ? "Ativo" : "Inativo" } : d))} />
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon={Building2} text="Nenhum cliente encontrado." />}
      </div>
      {modal && (
        <Modal title={editing ? "Editar Cliente" : "Novo Cliente"} onClose={() => setModal(null)}>
          <FormField label="Nome do Mercado" value={name} onChange={setName} placeholder="Ex: Supermercado Família" required />
          <FormField label="Endereço Completo" value={address} onChange={setAddress} placeholder="Rua, número, bairro, cidade" />
          <FormField label="Telefone / WhatsApp" value={contact} onChange={setContact} placeholder="(11) 99999-0000" type="tel" />
          <FormField label="Nome do Responsável" value={contactName} onChange={setContactName} placeholder="Nome do gerente/contato" />
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Promotor Responsável <span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={promotorId} onChange={e => setPromotorId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-8">
                <option value="">Selecione o promotor...</option>
                {promotores.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <FormField label="Observações" value={notes} onChange={setNotes} multiline placeholder="Anotações sobre o cliente..." />
          <SaveBtn onPress={save} />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WEB ADMIN — PRODUTOS
// ═══════════════════════════════════════════════════════

const CATEGORIES: ProductCategory[] = ["Limpeza", "Alimentos perecíveis", "Alimentos não perecíveis", "Higiene", "Outros"];
const UNITS: ProductUnit[] = ["un", "litro", "kg", "g", "ml", "pacote", "caixa"];

function ProdutosPage({ data, setData }: { data: Product[]; setData: (d: Product[]) => void }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Product | null | "new">(null);
  const editing = modal !== null && modal !== "new" ? modal as Product : null;
  const [name, setName] = useState(""); const [brand, setBrand] = useState(""); const [category, setCategory] = useState(""); const [unit, setUnit] = useState("");

  const openNew = () => { setName(""); setBrand(""); setCategory(""); setUnit(""); setModal("new"); };
  const openEdit = (p: Product) => { setName(p.name); setBrand(p.brand); setCategory(p.category); setUnit(p.unit); setModal(p); };

  const save = () => {
    const item: Product = { id: editing?.id ?? uid(), name, brand, category: (category || "Outros") as ProductCategory, unit: (unit || "un") as ProductUnit, status: editing?.status ?? "Ativo", createdAt: editing?.createdAt ?? todayStr() };
    setData(editing ? data.map(d => d.id === item.id ? item : d) : [...data, item]);
    setModal(null);
  };

  const filtered = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
  const catColor: Record<string, string> = { "Limpeza": "bg-cyan-100 text-cyan-700", "Alimentos perecíveis": "bg-orange-100 text-orange-700", "Alimentos não perecíveis": "bg-amber-100 text-amber-700", "Higiene": "bg-purple-100 text-purple-700", "Outros": "bg-slate-100 text-slate-600" };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-xl font-bold text-slate-800">Catálogo de Produtos</h1><p className="text-sm text-slate-500">Produtos da empresa — compartilhado com toda a equipe</p></div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"><Plus size={16} />Novo Produto</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou marca..." className="flex-1 text-sm text-slate-700 focus:outline-none" />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>{["Produto", "Marca", "Categoria", "Unidade", "Cadastro", "Status", "Ações"].map(h => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-slate-600">{p.brand}</td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${catColor[p.category] ?? "bg-slate-100 text-slate-600"}`}>{p.category}</span></td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.unit}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{fmt(p.createdAt)}</td>
                <td className="px-4 py-3"><StatusBadge active={p.status === "Ativo"} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Toggle value={p.status === "Ativo"} onChange={v => setData(data.map(d => d.id === p.id ? { ...d, status: v ? "Ativo" : "Inativo" } : d))} />
                    <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon={Tag} text="Nenhum produto encontrado." />}
      </div>
      {modal && (
        <Modal title={editing ? "Editar Produto" : "Novo Produto"} onClose={() => setModal(null)}>
          <FormField label="Nome do Produto" value={name} onChange={setName} placeholder="Ex: Detergente Ypê 500ml" required />
          <FormField label="Marca" value={brand} onChange={setBrand} placeholder="Ex: Ypê" required />
          <FormField label="Categoria" value={category} onChange={setCategory} options={CATEGORIES} required />
          <FormField label="Unidade de Medida" value={unit} onChange={setUnit} options={UNITS} required />
          <SaveBtn onPress={save} />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WEB ADMIN — CONTROLE DE LOTES
// ═══════════════════════════════════════════════════════

type LotFilter = "todos" | LotStatus;

function LotesPage({ data, setData, produtos, clientes, colaboradores }: { data: Lot[]; setData: (d: Lot[]) => void; produtos: Product[]; clientes: Client[]; colaboradores: Colaborador[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LotFilter>("todos");
  const [expiryFilter, setExpiryFilter] = useState<ExpiryStatus | "todos">("todos");
  const [promotorFilter, setPromotorFilter] = useState("");
  const [modal, setModal] = useState<Lot | null | "new">(null);
  const editing = modal !== null && modal !== "new" ? modal as Lot : null;

  const [productId, setProductId] = useState(""); const [clientId, setClientId] = useState(""); const [lotNumber, setLotNumber] = useState(""); const [quantity, setQuantity] = useState(""); const [mfDate, setMfDate] = useState(""); const [expDate, setExpDate] = useState(""); const [manualStatus, setManualStatus] = useState<LotStatus | "auto">("auto"); const [notes, setNotes] = useState("");

  const openNew = () => { setProductId(""); setClientId(""); setLotNumber(""); setQuantity(""); setMfDate(""); setExpDate(""); setManualStatus("auto"); setNotes(""); setModal("new"); };
  const openEdit = (l: Lot) => { setProductId(l.productId); setClientId(l.clientId ?? ""); setLotNumber(l.lotNumber); setQuantity(String(l.quantity)); setMfDate(l.manufactureDate); setExpDate(l.expiryDate); setManualStatus(l.status === "Esgotado" ? "auto" : l.status); setNotes(l.notes); setModal(l); };

  const computedStatus = (): LotStatus => {
    if (manualStatus === "Recolhido / Inativo") return "Recolhido / Inativo";
    return clientId ? "Em Ponto de Venda" : "Aguardando Distribuição";
  };

  const save = () => {
    const status = manualStatus === "Recolhido / Inativo" ? "Recolhido / Inativo" : computedStatus();
    const item: Lot = { id: editing?.id ?? uid(), productId, clientId: clientId || undefined, lotNumber, quantity: Number(quantity) || 0, manufactureDate: mfDate, expiryDate: expDate, status: editing?.status === "Esgotado" ? "Esgotado" : status, notes, createdAt: editing?.createdAt ?? todayStr() };
    setData(editing ? data.map(d => d.id === item.id ? item : d) : [...data, item]);
    setModal(null);
  };

  const promotores = colaboradores.filter(c => c.role === "Promotor de Vendas");

  const filtered = useMemo(() => {
    return data.filter(l => {
      if (statusFilter !== "todos" && l.status !== statusFilter) return false;
      if (expiryFilter !== "todos" && (l.status !== "Em Ponto de Venda" || getExpiryStatus(l.expiryDate) !== expiryFilter)) return false;
      if (promotorFilter) {
        const client = clientes.find(c => c.id === l.clientId);
        if (!client || client.promotorId !== promotorFilter) return false;
      }
      const prod = produtos.find(p => p.id === l.productId);
      if (search && !l.lotNumber.toLowerCase().includes(search.toLowerCase()) && !prod?.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, statusFilter, expiryFilter, promotorFilter, search]);

  const statusTabs: { id: LotFilter; label: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "Em Ponto de Venda", label: "Em PDV" },
    { id: "Aguardando Distribuição", label: "Ag. Distribuição" },
    { id: "Esgotado", label: "Esgotado" },
    { id: "Recolhido / Inativo", label: "Recolhido" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-xl font-bold text-slate-800">Controle de Lotes</h1><p className="text-sm text-slate-500">Lançamento, alocação e monitoramento de validade</p></div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"><Plus size={16} />Novo Lote</button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        {statusTabs.map(t => <button key={t.id} onClick={() => setStatusFilter(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === t.id ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>{t.label} <span className="ml-1 opacity-60">{t.id === "todos" ? data.length : data.filter(l => l.status === t.id).length}</span></button>)}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <select value={expiryFilter} onChange={e => setExpiryFilter(e.target.value as ExpiryStatus | "todos")} className="pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-600 focus:outline-none appearance-none">
              <option value="todos">Validade: Todos</option>
              <option value="vermelho">Crítico (Vermelho)</option>
              <option value="amarelo">Atenção (Amarelo)</option>
              <option value="verde">OK (Verde)</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={promotorFilter} onChange={e => setPromotorFilter(e.target.value)} className="pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-600 focus:outline-none appearance-none">
              <option value="">Todos os Promotores</option>
              {promotores.map(p => <option key={p.id} value={p.id}>{p.name.split(" ")[0]}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nº do lote ou produto..." className="flex-1 text-sm text-slate-700 focus:outline-none" />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>{["Produto", "Nº Lote", "Cliente", "Promotor", "Validade", "Alerta", "Status", "Ações"].map(h => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(l => {
              const prod = produtos.find(p => p.id === l.productId);
              const client = clientes.find(c => c.id === l.clientId);
              const promotor = colaboradores.find(c => c.id === client?.promotorId);
              const showExpiry = l.status === "Em Ponto de Venda";
              return (
                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800 max-w-[180px] truncate">{prod?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{l.lotNumber}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[130px] truncate">{client?.name ?? <span className="text-slate-400 italic">Sem cliente</span>}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{promotor?.name.split(" ")[0] ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono">{fmt(l.expiryDate)}</td>
                  <td className="px-4 py-3">{showExpiry ? <ExpiryBadge expiryDate={l.expiryDate} /> : <span className="text-xs text-slate-300">—</span>}</td>
                  <td className="px-4 py-3"><LotStatusBadge status={l.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(l)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      {l.status !== "Recolhido / Inativo" && l.status !== "Esgotado" && (
                        <button onClick={() => setData(data.map(d => d.id === l.id ? { ...d, status: "Recolhido / Inativo" } : d))} className="text-[11px] font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">Recolher</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon={Layers} text="Nenhum lote encontrado." />}
      </div>
      {modal && (
        <Modal title={editing ? "Editar Lote" : "Novo Lote"} onClose={() => setModal(null)} wide>
          <div className="grid grid-cols-2 gap-x-4">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Produto <span className="text-red-500">*</span></label>
              <div className="relative mb-4">
                <select value={productId} onChange={e => setProductId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-8">
                  <option value="">Selecione o produto...</option>
                  {produtos.filter(p => p.status === "Ativo").map(p => <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Cliente / Mercado <span className="text-slate-400 text-[10px] normal-case">(opcional)</span></label>
              <div className="relative mb-4">
                <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-8">
                  <option value="">Nenhum (Aguardando Distribuição)</option>
                  {clientes.filter(c => c.status === "Ativo").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {clientId && <div className="mb-4 -mt-2 flex items-center gap-1.5 text-xs text-blue-600"><CheckCircle2 size={13} />Status automático: <strong>Em Ponto de Venda</strong></div>}
              {!clientId && <div className="mb-4 -mt-2 flex items-center gap-1.5 text-xs text-slate-500"><Package size={13} />Status automático: <strong>Aguardando Distribuição</strong></div>}
            </div>
            <FormField label="Número do Lote" value={lotNumber} onChange={setLotNumber} placeholder="Ex: PMT-2026-0342" />
            <FormField label="Quantidade" value={quantity} onChange={setQuantity} type="number" placeholder="0" />
            <FormField label="Data de Fabricação" value={mfDate} onChange={setMfDate} type="date" />
            <div>
              <FormField label="Data de Validade" value={expDate} onChange={setExpDate} type="date" />
              {expDate && <div className="mb-4 -mt-2"><ExpiryBadge expiryDate={expDate} /></div>}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Ação de Inativação Manual</label>
            <button onClick={() => setManualStatus(s => s === "Recolhido / Inativo" ? "auto" : "Recolhido / Inativo")} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${manualStatus === "Recolhido / Inativo" ? "border-red-400 bg-red-50 text-red-700 font-semibold" : "border-slate-200 bg-white text-slate-600"}`}>
              <XCircle size={14} />Marcar como Recolhido / Inativo
            </button>
          </div>
          <FormField label="Observações" value={notes} onChange={setNotes} multiline placeholder="Anotações sobre este lote..." />
          <SaveBtn onPress={save} />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WEB ADMIN APP
// ═══════════════════════════════════════════════════════

function WebAdminApp({ colaboradores, setColaboradores, usuarios, setUsuarios, clientes, setClientes, produtos, setProdutos, lotes, setLotes, onBack }: {
  colaboradores: Colaborador[]; setColaboradores: (d: Colaborador[]) => void;
  usuarios: Usuario[]; setUsuarios: (d: Usuario[]) => void;
  clientes: Client[]; setClientes: (d: Client[]) => void;
  produtos: Product[]; setProdutos: (d: Product[]) => void;
  lotes: Lot[]; setLotes: (d: Lot[]) => void;
  onBack: () => void;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState<WebPage>("dashboard");
  const [email, setEmail] = useState("admin@laticontrol.com");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = () => {
    if (!email || !pwd) { setLoginError("Preencha e-mail e senha."); return; }
    const user = usuarios.find(u => u.email === email && u.password === pwd && u.group === "Administrador" && u.status === "Ativo");
    if (!user) { setLoginError("Credenciais inválidas ou sem acesso ao Painel Web."); return; }
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><ShoppingBag size={28} className="text-white" /></div>
          <h1 className="text-2xl font-bold text-white">LatiControl</h1>
          <p className="text-slate-400 text-sm mt-1">Painel Administrativo</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <FormField label="E-mail" value={email} onChange={v => { setEmail(v); setLoginError(""); }} type="email" placeholder="admin@empresa.com" />
          <div className="mb-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Senha</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
              <input type={showPwd ? "text" : "password"} value={pwd} onChange={e => { setPwd(e.target.value); setLoginError(""); }} placeholder="••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} className="flex-1 bg-transparent py-2.5 text-sm text-slate-800 focus:outline-none" />
              <button onClick={() => setShowPwd(v => !v)} className="p-1 text-slate-400">{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
          </div>
          {loginError && <p className="text-red-500 text-xs mb-3">{loginError}</p>}
          <p className="text-xs text-slate-400 mb-4">Dica: <span className="font-mono">admin@laticontrol.com</span> / <span className="font-mono">admin123</span></p>
          <SaveBtn onPress={handleLogin} label="Entrar no Painel" />
          <button onClick={onBack} className="w-full mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors">← Voltar à seleção</button>
        </div>
      </div>
    </div>
  );

  const pageMap: Record<WebPage, React.ReactNode> = {
    dashboard: <DashboardPage colaboradores={colaboradores} clientes={clientes} lotes={lotes} produtos={produtos} />,
    colaboradores: <ColaboradoresPage data={colaboradores} setData={setColaboradores} />,
    usuarios: <UsuariosPage data={usuarios} setData={setUsuarios} colaboradores={colaboradores} />,
    clientes: <ClientesPage data={clientes} setData={setClientes} colaboradores={colaboradores} />,
    produtos: <ProdutosPage data={produtos} setData={setProdutos} />,
    lotes: <LotesPage data={lotes} setData={setLotes} produtos={produtos} clientes={clientes} colaboradores={colaboradores} />,
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "'Figtree', sans-serif" }}>
      <WebSidebar page={page} onPage={setPage} onLogout={() => setIsLoggedIn(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
          <p className="text-sm text-slate-500">{WEB_NAV.find(n => n.id === page)?.label}</p>
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">← Seletor de Interface</button>
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"><User size={12} className="text-white" /></div>
              <span className="text-xs font-semibold text-slate-700">Carlos Mendes</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 font-semibold px-1.5 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{pageMap[page]}</main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MOBILE — SHARED COMPONENTS
// ═══════════════════════════════════════════════════════

function MobileHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-slate-800 text-white px-3 py-3 shrink-0">
      {onBack && <button onClick={onBack} className="p-1.5 rounded-lg active:bg-white/10 transition-colors"><ChevronLeft size={20} /></button>}
      <span className="flex-1 text-base font-semibold truncate">{title}</span>
      {right}
    </div>
  );
}

function MobileBottomNav({ active, onTab, urgentCount }: { active: string; onTab: (t: string) => void; urgentCount: number }) {
  return (
    <div className="flex bg-slate-800 shrink-0">
      {[
        { id: "alertas", label: "Alertas", Icon: Bell },
        { id: "meusclientes", label: "Meus Clientes", Icon: Store },
        { id: "configuracoes", label: "Config.", Icon: Settings },
      ].map(({ id, label, Icon }) => (
        <button key={id} onClick={() => onTab(id)} className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${active === id ? "text-blue-400" : "text-slate-400"}`}>
          <div className="relative">
            <Icon size={21} strokeWidth={active === id ? 2.5 : 1.8} />
            {id === "alertas" && urgentCount > 0 && <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">{urgentCount}</span>}
          </div>
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}

function ObservationTimeline({ observations, colaboradores }: { observations: ObservacaoVisita[]; colaboradores: Colaborador[] }) {
  const sorted = [...observations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (sorted.length === 0) return <p className="text-xs text-slate-400 text-center py-4">Nenhuma observação registrada.</p>;
  return (
    <div className="flex flex-col">
      {sorted.map((obs, i) => {
        const col = colaboradores.find(c => c.id === obs.colaboradorId);
        return (
          <div key={obs.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              {i < sorted.length - 1 && <div className="w-px flex-1 bg-slate-100 my-1" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold text-slate-700">{col?.name ?? "Promotor"}</span>
                <span className="text-[10px] text-slate-400">{fmtDT(obs.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{obs.observation}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MOBILE — SCREENS
// ═══════════════════════════════════════════════════════

function AlertasScreen({ lots, clients, products, colaboradores, loggedInColId, navigate, addObs }: {
  lots: Lot[]; clients: Client[]; products: Product[]; colaboradores: Colaborador[];
  loggedInColId: string; navigate: (s: MobileScreen) => void;
  addObs: (obs: Omit<ObservacaoVisita, "id">) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [obsModal, setObsModal] = useState<{ lot: Lot; client: Client } | null>(null);
  const [obsText, setObsText] = useState("");

  const myClientIds = clients.filter(c => c.promotorId === loggedInColId).map(c => c.id);
  const myActiveLots = lots.filter(l => l.status === "Em Ponto de Venda" && l.clientId && myClientIds.includes(l.clientId));

  const criticalLots = myActiveLots.filter(l => getExpiryStatus(l.expiryDate) !== "verde");
  const displayLots = showAll ? myActiveLots : criticalLots;

  const sorted = [...displayLots].sort((a, b) => getDaysLeft(a.expiryDate) - getDaysLeft(b.expiryDate));

  const grouped = sorted.reduce<Record<string, Lot[]>>((acc, lot) => {
    const key = lot.clientId!;
    if (!acc[key]) acc[key] = [];
    acc[key].push(lot);
    return acc;
  }, {});

  const urgentCount = criticalLots.filter(l => getExpiryStatus(l.expiryDate) === "vermelho").length;

  const sendObs = () => {
    if (!obsText.trim() || !obsModal) return;
    addObs({ lotId: obsModal.lot.id, colaboradorId: loggedInColId, createdAt: nowISO(), observation: obsText.trim() });
    setObsText("");
    setObsModal(null);
  };

  return (
    <div className="flex flex-col h-full">
      <MobileHeader title="Central de Alertas" right={
        <button onClick={() => setShowAll(v => !v)} className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${showAll ? "bg-white/20 text-white" : "text-slate-300"}`}>{showAll ? "Críticos" : "Todos"}</button>
      } />
      {urgentCount > 0 && !showAll && (
        <div className="bg-red-500 px-4 py-2 flex items-center gap-2 shrink-0">
          <AlertTriangle size={13} className="text-white shrink-0" />
          <p className="text-white text-xs font-semibold">{urgentCount} lote{urgentCount > 1 ? "s" : ""} em estado crítico</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <CheckCircle2 size={40} strokeWidth={1.2} className="text-emerald-400" />
            <p className="text-sm text-center px-8">Nenhum alerta {showAll ? "" : "crítico"} no momento. Sua rota está sob controle!</p>
          </div>
        ) : (
          <div className="p-3 flex flex-col gap-3">
            {Object.entries(grouped).map(([clientId, clientLots]) => {
              const client = clients.find(c => c.id === clientId);
              if (!client) return null;
              const worst = clientLots.reduce<ExpiryStatus>((acc, l) => {
                const s = getExpiryStatus(l.expiryDate);
                if (s === "vermelho") return "vermelho";
                if (s === "amarelo" && acc !== "vermelho") return "amarelo";
                return acc;
              }, "verde");
              const dotColor = { verde: "bg-emerald-400", amarelo: "bg-amber-400", vermelho: "bg-red-500" }[worst];
              return (
                <div key={clientId} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <button onClick={() => navigate({ name: "clientedetail", clientId })} className="w-full flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 active:bg-slate-50 text-left">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{client.name}</p>
                      <p className="text-xs text-slate-400">{client.contactName} · {client.contact}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  </button>
                  {clientLots.map(lot => {
                    const prod = products.find(p => p.id === lot.productId);
                    return (
                      <div key={lot.id} className="px-4 py-3 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{prod?.name ?? "Produto"}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{lot.lotNumber}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <ExpiryBadge expiryDate={lot.expiryDate} />
                              <span className="text-xs text-slate-400">Vence {fmt(lot.expiryDate)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button onClick={() => navigate({ name: "lotedetail", lotId: lot.id })} className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-xl active:bg-blue-100">Ver lote</button>
                            <button onClick={() => setObsModal({ lot, client })} className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl active:bg-slate-200 flex items-center gap-1 justify-center"><MessageSquare size={11} />Obs.</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {obsModal && (
        <div className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end" onClick={e => e.target === e.currentTarget && setObsModal(null)}>
          <div className="bg-white rounded-t-2xl shadow-2xl">
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Registrar Observação</h2>
              <button onClick={() => setObsModal(null)} className="p-1 text-slate-400"><X size={16} /></button>
            </div>
            <div className="px-4 pt-3 pb-4">
              <div className="bg-slate-50 rounded-xl p-3 mb-3 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">{obsModal.client.name}</p>
                <p className="font-mono mt-0.5">{obsModal.lot.lotNumber}</p>
              </div>
              <textarea value={obsText} onChange={e => setObsText(e.target.value)} placeholder="Descreva o que foi observado na visita..." rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-3" />
              <button onClick={sendObs} disabled={!obsText.trim()} className="w-full bg-blue-600 text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-40 active:bg-blue-700 flex items-center justify-center gap-2"><Send size={15} />Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MeusClientesScreen({ clients, lots, loggedInColId, navigate }: { clients: Client[]; lots: Lot[]; loggedInColId: string; navigate: (s: MobileScreen) => void }) {
  const myClients = clients.filter(c => c.promotorId === loggedInColId);

  const getWorst = (clientId: string): ExpiryStatus => {
    const active = lots.filter(l => l.clientId === clientId && l.status === "Em Ponto de Venda");
    if (active.some(l => getExpiryStatus(l.expiryDate) === "vermelho")) return "vermelho";
    if (active.some(l => getExpiryStatus(l.expiryDate) === "amarelo")) return "amarelo";
    return "verde";
  };

  const dotColor = { verde: "bg-emerald-400", amarelo: "bg-amber-400", vermelho: "bg-red-500" };

  return (
    <div className="flex flex-col h-full">
      <MobileHeader title="Meus Clientes" />
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {myClients.length === 0 ? <EmptyState icon={Store} text="Nenhum cliente atribuído ao seu perfil." /> : myClients.map(client => {
          const worst = getWorst(client.id);
          const activeCount = lots.filter(l => l.clientId === client.id && l.status === "Em Ponto de Venda").length;
          return (
            <button key={client.id} onClick={() => navigate({ name: "clientedetail", clientId: client.id })} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-slate-100 active:shadow-none active:bg-slate-50 transition-all text-left w-full">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${client.status === "Inativo" ? "bg-slate-100" : "bg-blue-50"}`}>
                <Store size={18} className={client.status === "Inativo" ? "text-slate-400" : "text-blue-500"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{client.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{client.address}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <button onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(client.contact); }} className="flex items-center gap-1 text-xs text-blue-500">
                    <Phone size={11} /><span className="font-mono">{client.contact}</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {client.status === "Inativo" ? <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded">Inativo</span> : <span className={`w-2.5 h-2.5 rounded-full ${dotColor[worst]}`} />}
                {activeCount > 0 && <span className="text-[10px] text-slate-400">{activeCount} lote{activeCount > 1 ? "s" : ""}</span>}
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ClienteDetailScreen({ clientId, clients, lots, products, observations, colaboradores, loggedInColId, navigate, onBack, addObs }: {
  clientId: string; clients: Client[]; lots: Lot[]; products: Product[];
  observations: ObservacaoVisita[]; colaboradores: Colaborador[];
  loggedInColId: string; navigate: (s: MobileScreen) => void; onBack: () => void;
  addObs: (obs: Omit<ObservacaoVisita, "id">) => void;
}) {
  const client = clients.find(c => c.id === clientId);
  const [obsText, setObsText] = useState("");
  const [sending, setSending] = useState(false);

  if (!client) return null;

  const clientLots = lots.filter(l => l.clientId === clientId && l.status === "Em Ponto de Venda");
  const lotIds = lots.filter(l => l.clientId === clientId).map(l => l.id);
  const clientObs = observations.filter(o => o.clientId === clientId || (o.lotId && lotIds.includes(o.lotId)));

  const sendObs = () => {
    if (!obsText.trim()) return;
    addObs({ clientId, colaboradorId: loggedInColId, createdAt: nowISO(), observation: obsText.trim() });
    setObsText("");
    setSending(false);
  };

  const expBg = { verde: "bg-emerald-50 text-emerald-700", amarelo: "bg-amber-50 text-amber-700", vermelho: "bg-red-50 text-red-700" };

  return (
    <div className="flex flex-col h-full">
      <MobileHeader title={client.name} onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        {client.status === "Inativo" && (
          <div className="bg-orange-50 border-b border-orange-100 px-4 py-2.5 flex items-center gap-2">
            <AlertCircle size={13} className="text-orange-500 shrink-0" />
            <p className="text-xs font-semibold text-orange-700">Este cliente está inativado pelo Administrador</p>
          </div>
        )}
        <div className="bg-white border-b border-slate-100 px-4 py-4">
          <div className="flex flex-col gap-2">
            {client.address && <div className="flex items-start gap-2"><MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" /><span className="text-sm text-slate-600">{client.address}</span></div>}
            {client.contactName && <div className="flex items-center gap-2"><User size={13} className="text-slate-400 shrink-0" /><span className="text-sm text-slate-600">{client.contactName}</span></div>}
            {client.contact && <div className="flex items-center gap-2"><Phone size={13} className="text-slate-400 shrink-0" /><span className="text-sm text-slate-600 font-mono">{client.contact}</span><button onClick={() => navigator.clipboard?.writeText(client.contact)} className="ml-auto p-0.5 text-blue-400"><Clipboard size={12} /></button></div>}
          </div>
        </div>
        <div className="p-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">Lotes Ativos ({clientLots.length})</p>
          {clientLots.length === 0 ? <p className="text-xs text-slate-400 text-center py-4">Nenhum lote ativo neste cliente.</p> : (
            <div className="flex flex-col gap-2 mb-4">
              {clientLots.sort((a, b) => getDaysLeft(a.expiryDate) - getDaysLeft(b.expiryDate)).map(lot => {
                const prod = products.find(p => p.id === lot.productId);
                const st = getExpiryStatus(lot.expiryDate);
                return (
                  <button key={lot.id} onClick={() => navigate({ name: "lotedetail", lotId: lot.id })} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3 text-left w-full active:bg-slate-50">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${expBg[st]}`}><Package size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{prod?.name ?? "Produto"}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{lot.lotNumber}</p>
                      <div className="flex items-center gap-2 mt-1.5"><ExpiryBadge expiryDate={lot.expiryDate} /><span className="text-xs text-slate-400">{lot.quantity} {prod?.unit}</span></div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
          <div className="mb-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Histórico de Observações</p>
              <button onClick={() => setSending(v => !v)} className="text-xs font-semibold text-blue-600 flex items-center gap-1"><MessageSquare size={11} />Adicionar</button>
            </div>
            {sending && (
              <div className="mb-3 bg-white rounded-2xl border border-blue-100 p-3">
                <textarea value={obsText} onChange={e => setObsText(e.target.value)} placeholder="Descreva o que foi observado na visita..." rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-2" />
                <button onClick={sendObs} disabled={!obsText.trim()} className="w-full bg-blue-600 text-white font-semibold rounded-xl py-2.5 text-sm disabled:opacity-40 flex items-center justify-center gap-2 active:bg-blue-700"><Send size={14} />Registrar Observação</button>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <ObservationTimeline observations={clientObs} colaboradores={colaboradores} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoteDetailScreen({ lotId, lots, products, clients, observations, colaboradores, loggedInColId, onBack, updateLot, addObs }: {
  lotId: string; lots: Lot[]; products: Product[]; clients: Client[];
  observations: ObservacaoVisita[]; colaboradores: Colaborador[];
  loggedInColId: string; onBack: () => void;
  updateLot: (l: Lot) => void; addObs: (obs: Omit<ObservacaoVisita, "id">) => void;
}) {
  const lot = lots.find(l => l.id === lotId);
  const [obsText, setObsText] = useState("");
  const [confirm, setConfirm] = useState(false);

  if (!lot) return null;
  const prod = products.find(p => p.id === lot.productId);
  const client = clients.find(c => c.id === lot.clientId);
  const lotObs = observations.filter(o => o.lotId === lotId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const markEsgotado = () => {
    updateLot({ ...lot, status: "Esgotado" });
    setConfirm(false);
  };

  const sendObs = () => {
    if (!obsText.trim()) return;
    addObs({ lotId, colaboradorId: loggedInColId, createdAt: nowISO(), observation: obsText.trim() });
    setObsText("");
  };

  const expiryStatus = getExpiryStatus(lot.expiryDate);
  const expBg = { verde: "from-emerald-50 to-white", amarelo: "from-amber-50 to-white", vermelho: "from-red-50 to-white" }[expiryStatus];

  return (
    <div className="flex flex-col h-full">
      <MobileHeader title={prod?.name ?? "Lote"} onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        {client?.status === "Inativo" && (
          <div className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-center gap-2">
            <AlertCircle size={13} className="text-orange-500 shrink-0" />
            <p className="text-xs font-semibold text-orange-700">Cliente "{client.name}" está inativado</p>
          </div>
        )}
        <div className={`bg-gradient-to-b ${expBg} border-b border-slate-100 px-4 py-4`}>
          <div className="flex items-center gap-3 mb-4">
            <ExpiryBadge expiryDate={lot.expiryDate} />
            <LotStatusBadge status={lot.status} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Nº do Lote", value: lot.lotNumber, mono: true },
              { label: "Quantidade", value: `${lot.quantity} ${prod?.unit ?? "un"}` },
              { label: "Fabricação", value: fmt(lot.manufactureDate) },
              { label: "Validade", value: fmt(lot.expiryDate) },
              { label: "Produto", value: prod?.name },
              { label: "Cliente", value: client?.name ?? "Sem cliente" },
              { label: "Categoria", value: prod?.category },
              { label: "Marca", value: prod?.brand },
            ].map(({ label, value, mono }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className={`text-sm text-slate-800 mt-0.5 font-medium truncate ${mono ? "font-mono" : ""}`}>{value ?? "—"}</p>
              </div>
            ))}
          </div>
          {lot.notes && <div className="bg-white/80 rounded-xl p-3"><p className="text-xs text-slate-500">{lot.notes}</p></div>}
        </div>
        {lot.status === "Em Ponto de Venda" && (
          <div className="px-4 py-4 bg-white border-b border-slate-100">
            {!confirm ? (
              <button onClick={() => setConfirm(true)} className="w-full bg-emerald-600 text-white font-bold rounded-2xl py-3.5 text-sm flex items-center justify-center gap-2 active:bg-emerald-700 shadow-sm">
                <CheckCircle2 size={18} />Marcar como Esgotado
              </button>
            ) : (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
                <p className="text-sm font-semibold text-emerald-800 mb-3 text-center">Confirmar baixa do lote?</p>
                <p className="text-xs text-emerald-600 mb-4 text-center">Esta ação indica que o produto foi 100% vendido na gôndola e removerá o lote dos alertas ativos.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 active:bg-slate-50">Cancelar</button>
                  <button onClick={markEsgotado} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold active:bg-emerald-700">Confirmar</button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="p-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observações ({lotObs.length})</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-3">
            <ObservationTimeline observations={lotObs} colaboradores={colaboradores} />
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Nova Observação</p>
            <textarea value={obsText} onChange={e => setObsText(e.target.value)} placeholder="Registre o que observou sobre este lote na visita..." rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-2" />
            <button onClick={sendObs} disabled={!obsText.trim()} className="w-full bg-blue-600 text-white font-semibold rounded-xl py-2.5 text-sm disabled:opacity-40 flex items-center justify-center gap-2 active:bg-blue-700 transition-colors"><Send size={14} />Registrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfiguracoesScreen({ loggedInColId, colaboradores, onLogout }: { loggedInColId: string; colaboradores: Colaborador[]; onLogout: () => void }) {
  const col = colaboradores.find(c => c.id === loggedInColId);
  return (
    <div className="flex flex-col h-full">
      <MobileHeader title="Configurações" />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center"><User size={26} className="text-blue-600" /></div>
          <div>
            <p className="text-base font-bold text-slate-800">{col?.name ?? "Promotor"}</p>
            <p className="text-sm text-slate-500">{col?.role}</p>
            <span className="mt-1 inline-block text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">Promotor de Vendas (Mobile)</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
          {[{ icon: Phone, label: "Telefone", info: col?.phone ?? "—" }, { icon: Shield, label: "CPF", info: col?.cpf ?? "—" }, { icon: Clock, label: "Acesso criado em", info: "05/01/2026" }].map(({ icon: Icon, label, info }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 last:border-0">
              <Icon size={16} className="text-slate-400 shrink-0" /><span className="flex-1 text-sm font-medium text-slate-700">{label}</span><span className="text-xs text-slate-400 font-mono">{info}</span>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-xs text-amber-700">
          <p className="font-semibold mb-1">Alteração de senha</p>
          <p>Para alterar sua senha, entre em contato com o Administrador do sistema.</p>
        </div>
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-semibold rounded-xl py-3 text-sm border border-red-100 active:bg-red-100 transition-colors"><LogOut size={16} />Sair da conta</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MOBILE APP
// ═══════════════════════════════════════════════════════

function MobileApp({ colaboradores, usuarios, clientes, produtos, lotes, setLotes, observations, setObservations, onBack }: {
  colaboradores: Colaborador[]; usuarios: Usuario[]; clientes: Client[];
  produtos: Product[]; lotes: Lot[]; setLotes: (d: Lot[]) => void;
  observations: ObservacaoVisita[]; setObservations: (d: ObservacaoVisita[]) => void;
  onBack: () => void;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("alertas");
  const [screenStack, setScreenStack] = useState<MobileScreen[]>([{ name: "alertas" }]);
  const [email, setEmail] = useState("joao.silva@laticontrol.com");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loginError, setLoginError] = useState("");

  const screen = screenStack[screenStack.length - 1];
  const loggedInUser = usuarios.find(u => u.id === loggedInUserId);
  const loggedInColId = loggedInUser?.colaboradorId ?? "";

  const navigate = (s: MobileScreen) => setScreenStack(prev => [...prev, s]);
  const goBack = () => setScreenStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  const goTab = (tab: string) => { setActiveTab(tab); setScreenStack([{ name: tab as MobileScreen["name"] }]); };

  const handleLogin = () => {
    if (!email || !pwd) { setLoginError("Preencha e-mail e senha."); return; }
    const user = usuarios.find(u => u.email === email && u.password === pwd && u.group === "Promotor de Vendas" && u.status === "Ativo");
    if (!user) { setLoginError("Credenciais inválidas ou sem acesso ao App Mobile."); return; }
    setLoggedInUserId(user.id);
    setIsLoggedIn(true);
  };

  const addObs = (obs: Omit<ObservacaoVisita, "id">) => setObservations([...observations, { ...obs, id: uid() }]);
  const updateLot = (l: Lot) => setLotes(lotes.map(x => x.id === l.id ? l : x));

  const urgentCount = useMemo(() => {
    const myClientIds = clientes.filter(c => c.promotorId === loggedInColId).map(c => c.id);
    return lotes.filter(l => l.status === "Em Ponto de Venda" && l.clientId && myClientIds.includes(l.clientId) && getExpiryStatus(l.expiryDate) === "vermelho").length;
  }, [lotes, clientes, loggedInColId]);

  if (!isLoggedIn) return (
    <div className="flex flex-col h-full bg-slate-800">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg"><ShoppingBag size={32} className="text-white" /></div>
        <h1 className="text-2xl font-bold text-white mb-1">LatiControl</h1>
        <p className="text-slate-400 text-sm mb-10">App do Promotor de Vendas</p>
        <div className="w-full bg-white rounded-2xl p-5 shadow-xl">
          <FormField label="E-mail" value={email} onChange={v => { setEmail(v); setLoginError(""); }} type="email" placeholder="promotor@empresa.com" />
          <div className="mb-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Senha</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3">
              <input type={showPwd ? "text" : "password"} value={pwd} onChange={e => { setPwd(e.target.value); setLoginError(""); }} placeholder="••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} className="flex-1 bg-transparent py-2.5 text-sm text-slate-800 focus:outline-none" />
              <button onClick={() => setShowPwd(v => !v)} className="p-1 text-slate-400">{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          {loginError && <p className="text-red-500 text-xs mb-3 mt-1">{loginError}</p>}
          <p className="text-xs text-slate-400 mb-4">Dica: <span className="font-mono">joao.silva@laticontrol.com</span> / <span className="font-mono">123456</span></p>
          <SaveBtn onPress={handleLogin} label="Entrar no App" />
          <button onClick={onBack} className="w-full mt-3 text-sm text-slate-400 text-center">← Voltar à seleção</button>
        </div>
      </div>
    </div>
  );

  const renderScreen = () => {
    const common = { lots: lotes, products: produtos, clients: clientes, colaboradores, observations, loggedInColId };
    switch (screen.name) {
      case "alertas": return <AlertasScreen {...common} navigate={navigate} addObs={addObs} />;
      case "meusclientes": return <MeusClientesScreen {...common} navigate={navigate} />;
      case "clientedetail": return <ClienteDetailScreen {...common} clientId={(screen as { name: "clientedetail"; clientId: string }).clientId} navigate={navigate} onBack={goBack} addObs={addObs} />;
      case "lotedetail": return <LoteDetailScreen {...common} lotId={(screen as { name: "lotedetail"; lotId: string }).lotId} onBack={goBack} updateLot={updateLot} addObs={addObs} />;
      case "configuracoes": return <ConfiguracoesScreen loggedInColId={loggedInColId} colaboradores={colaboradores} onLogout={() => setIsLoggedIn(false)} />;
    }
  };

  return (
    <>
      <div className="flex-1 overflow-hidden relative">{renderScreen()}</div>
      <MobileBottomNav active={activeTab} onTab={goTab} urgentCount={urgentCount} />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// INTERFACE SELECTOR
// ═══════════════════════════════════════════════════════

function InterfaceSelector({ onSelect }: { onSelect: (v: "web" | "mobile") => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl"><ShoppingBag size={30} className="text-white" /></div>
        <h1 className="text-3xl font-bold text-white mb-2">LatiControl</h1>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">Plataforma de gestão de validade de lotes em pontos de venda</p>
      </div>
      <p className="text-slate-500 text-xs uppercase tracking-widest mb-6 font-semibold">Selecione o ambiente para demonstração</p>
      <div className="flex gap-4 w-full max-w-2xl">
        <button onClick={() => onSelect("web")} className="flex-1 group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 rounded-2xl p-6 text-left transition-all duration-200">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors"><Monitor size={24} className="text-purple-300" /></div>
          <h2 className="text-white font-bold text-lg mb-1">Painel Web</h2>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">Gestão completa de colaboradores, usuários, clientes, produtos e lotes. Acesso do Administrador.</p>
          <div className="flex flex-col gap-1.5 mb-5">
            {["Dashboard com KPIs e gráficos", "CRUD completo de todas entidades", "Filtros avançados no controle de lotes", "Soft delete com toggle Ativo/Inativo"].map(f => (
              <p key={f} className="text-xs text-slate-400 flex items-center gap-2"><Check size={11} className="text-purple-400 shrink-0" />{f}</p>
            ))}
          </div>
          <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold group-hover:translate-x-1 transition-transform"><span>Acessar Painel</span><ArrowRight size={16} /></div>
        </button>
        <button onClick={() => onSelect("mobile")} className="flex-1 group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 rounded-2xl p-6 text-left transition-all duration-200">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors"><Smartphone size={24} className="text-blue-300" /></div>
          <h2 className="text-white font-bold text-lg mb-1">App Mobile</h2>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">Interface do Promotor de Vendas em campo. Monitoramento de alertas, visitas e baixa de estoque.</p>
          <div className="flex flex-col gap-1.5 mb-5">
            {["Central de alertas por urgência", "Carteira de clientes atribuída", "Botão 'Marcar como Esgotado'", "Timeline de observações de campo"].map(f => (
              <p key={f} className="text-xs text-slate-400 flex items-center gap-2"><Check size={11} className="text-blue-400 shrink-0" />{f}</p>
            ))}
          </div>
          <div className="flex items-center gap-2 text-blue-300 text-sm font-semibold group-hover:translate-x-1 transition-transform"><span>Acessar App Mobile</span><ArrowRight size={16} /></div>
        </button>
      </div>
      <p className="text-slate-600 text-xs mt-8">MVP Fase 1 — Protótipo de validação</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════

export default function App() {
  const [view, setView] = useState<"selector" | "web" | "mobile">("selector");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(SEED_COLABORADORES);
  const [usuarios, setUsuarios] = useState<Usuario[]>(SEED_USUARIOS);
  const [clientes, setClientes] = useState<Client[]>(SEED_CLIENTS);
  const [produtos, setProdutos] = useState<Product[]>(SEED_PRODUCTS);
  const [lotes, setLotes] = useState<Lot[]>(SEED_LOTS);
  const [observations, setObservations] = useState<ObservacaoVisita[]>(SEED_OBSERVATIONS);

  if (view === "selector") return (
    <div style={{ fontFamily: "'Figtree', sans-serif" }}>
      <InterfaceSelector onSelect={setView} />
    </div>
  );

  if (view === "web") return (
    <div style={{ fontFamily: "'Figtree', sans-serif" }}>
      <WebAdminApp
        colaboradores={colaboradores} setColaboradores={setColaboradores}
        usuarios={usuarios} setUsuarios={setUsuarios}
        clientes={clientes} setClientes={setClientes}
        produtos={produtos} setProdutos={setProdutos}
        lotes={lotes} setLotes={setLotes}
        onBack={() => setView("selector")}
      />
    </div>
  );

  // Mobile — phone frame
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", fontFamily: "'Figtree', sans-serif" }}>
      <div className="relative w-[390px] h-[844px] bg-[#EEF2F7] rounded-[44px] shadow-2xl overflow-hidden border-[6px] border-slate-900 flex flex-col">
        <div className="bg-slate-800 px-6 pt-3 pb-1 flex items-center justify-between shrink-0">
          <span className="text-white text-xs font-semibold font-mono">9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5 items-end">{[3, 5, 7, 9].map((h, i) => <div key={i} className="w-[3px] rounded-sm bg-white" style={{ height: h }} />)}</div>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><path d="M7.5 2.2C9.7 2.2 11.7 3.1 13.1 4.6L14.5 3.1C12.7 1.2 10.2 0 7.5 0 4.8 0 2.3 1.2.5 3.1L1.9 4.6C3.3 3.1 5.3 2.2 7.5 2.2Z" fill="white" /><path d="M7.5 5.5C9 5.5 10.3 6.1 11.3 7.1L12.7 5.6C11.3 4.3 9.5 3.5 7.5 3.5 5.5 3.5 3.7 4.3 2.3 5.6L3.7 7.1C4.7 6.1 6 5.5 7.5 5.5Z" fill="white" /><circle cx="7.5" cy="9.5" r="1.5" fill="white" /></svg>
            <div className="flex items-center gap-0.5"><div className="w-5 h-2.5 border border-white/60 rounded-sm flex items-center px-0.5"><div className="w-3 h-1.5 bg-white rounded-[2px]" /></div></div>
          </div>
        </div>
        <MobileApp
          colaboradores={colaboradores} usuarios={usuarios} clientes={clientes}
          produtos={produtos} lotes={lotes} setLotes={setLotes}
          observations={observations} setObservations={setObservations}
          onBack={() => setView("selector")}
        />
      </div>
    </div>
  );
}
