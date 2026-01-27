
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  ListTodo, 
  History, 
  PieChart,
  Menu,
  X,
  CreditCard,
  Target,
  CircleDollarSign,
  Layers
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AccountsView } from './components/AccountsView';
import { TransactionsView } from './components/TransactionsView';
import { ExchangeView } from './components/ExchangeView';
import { CategoriesView } from './components/CategoriesView';
import { useFinanceData } from './hooks/useFinanceData';

const Logo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'lg' }) => (
  <div className="flex items-center gap-2">
    <div className={`relative ${size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'} flex items-center justify-center`}>
      <div className="absolute inset-0 bg-indigo-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
      <div className="absolute inset-0 bg-indigo-400 rounded-xl -rotate-6 group-hover:-rotate-3 transition-transform duration-300 opacity-50"></div>
      <div className="relative text-white z-10">
        <Layers className={size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
      </div>
    </div>
    <div className="flex flex-col leading-tight">
      <span className={`${size === 'lg' ? 'text-xl font-black' : 'text-lg font-bold'} text-white tracking-tight`}>Finance<span className="text-indigo-400">Flow</span></span>
      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Asset Pro</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'transactions' | 'exchange' | 'entities'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const financeData = useFinanceData();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Contas', icon: Wallet },
    { id: 'transactions', label: 'Lançamentos', icon: History },
    { id: 'exchange', label: 'Câmbio', icon: ArrowLeftRight },
    { id: 'entities', label: 'Categorias & Fontes', icon: ListTodo },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <Logo size="sm" />
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-slate-800 rounded-xl"
        >
          {isSidebarOpen ? <X className="w-6 h-6 text-indigo-400" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r border-slate-900
      `}>
        <div className="p-8 hidden md:block group">
          <Logo size="lg" />
        </div>

        <nav className="mt-4 px-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300
                ${activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' 
                  : 'hover:bg-slate-900 hover:text-white'}
              `}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
              <span className="font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-10 left-0 w-full px-8">
          <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800/50 backdrop-blur-md">
            <p className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Gestão Multi-Moeda</p>
            <div className="flex justify-between items-center text-sm font-bold text-white">
              <div className="flex gap-2 items-center">
                 <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[11px] text-indigo-400 border border-indigo-500/20 font-black">R$</div>
                 <span className="text-slate-400 font-medium">BRL</span>
              </div>
              <div className="w-px h-4 bg-slate-800 mx-2"></div>
              <div className="flex gap-2 items-center">
                 <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[11px] text-indigo-400 border border-indigo-500/20 font-black">€</div>
                 <span className="text-slate-400 font-medium">EUR</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-10 lg:p-14 bg-[#fcfdfe]">
        <div className="max-w-7xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="animate-in slide-in-from-left duration-500">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Visualizando sua saúde financeira em múltiplas frentes.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="px-5 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                 <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live Updates</span>
               </div>
            </div>
          </header>

          <div className="animate-in fade-in zoom-in-95 duration-700">
            {activeTab === 'dashboard' && <Dashboard data={financeData} />}
            {activeTab === 'accounts' && <AccountsView data={financeData} />}
            {activeTab === 'transactions' && <TransactionsView data={financeData} />}
            {activeTab === 'exchange' && <ExchangeView data={financeData} />}
            {activeTab === 'entities' && <CategoriesView data={financeData} />}
          </div>
        </div>
      </main>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
