
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Wallet, ArrowLeftRight, ListTodo, History, Menu, X,
  Target, Layers, Flag, Scale, LogOut, RefreshCw, Server, Cloud
} from 'lucide-react';
import { Dashboard } from './components/Dashboard.tsx';
import { AccountsView } from './components/AccountsView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { ExchangeView } from './components/ExchangeView.tsx';
import { CategoriesView } from './components/CategoriesView.tsx';
import { BudgetsView } from './components/BudgetsView.tsx';
import { GoalsView } from './components/GoalsView.tsx';
import { NetWorthView } from './components/NetWorthView.tsx';
import { AuthView } from './components/AuthView.tsx';
import { useFinanceData } from './hooks/useFinanceData.ts';
import { User } from './types.ts';

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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ff_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'transactions' | 'exchange' | 'entities' | 'budgets' | 'goals' | 'networth'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { loading, error, refresh, ...financeData } = useFinanceData();

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ff_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ff_current_user');
      localStorage.removeItem('ff_token');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Contas', icon: Wallet },
    { id: 'transactions', label: 'Lançamentos', icon: History },
    { id: 'exchange', label: 'Transferir / Câmbio', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Orçamentos', icon: Target },
    { id: 'goals', label: 'Metas & Objetivos', icon: Flag },
    { id: 'networth', label: 'Patrimônio', icon: Scale },
    { id: 'entities', label: 'Categorias & Fontes', icon: ListTodo },
  ];

  if (!currentUser) {
    return <AuthView onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <Logo size="sm" />
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 rounded-xl">
          {isSidebarOpen ? <X className="w-6 h-6 text-indigo-400" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r border-slate-900 flex flex-col
      `}>
        <div className="p-8 hidden md:block group">
          <Logo size="lg" />
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto pt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
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

        <div className="p-6 mt-auto">
          <div className="p-4 bg-slate-900/50 rounded-[2rem] border border-slate-800/50 backdrop-blur-md shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/20 flex-shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black text-white truncate leading-none mb-1">{currentUser.name}</p>
                <p className="text-[10px] font-bold text-slate-500 truncate">{currentUser.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-50/10 rounded-xl transition-all group/logout">
                <LogOut className="w-4 h-4 group-hover/logout:scale-110 transition-transform" />
              </button>
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
              <div className="flex items-center gap-2 mt-1">
                 <Cloud className="w-4 h-4 text-indigo-400" />
                 <p className="text-slate-500 font-medium text-sm">
                    Sincronizado com Railway Cloud (PostgreSQL)
                 </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                onClick={() => refresh()}
                className="p-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"
                title="Sincronizar agora"
               >
                 <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
               </button>
               <div className="px-5 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : error ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                 <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                   {loading ? 'Sincronizando...' : error ? 'Erro de Conexão' : 'Servidor Online'}
                 </span>
               </div>
            </div>
          </header>

          {loading && !financeData.accounts.length ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-300 gap-4">
               <div className="relative">
                  <Server className="w-16 h-16 text-indigo-100" />
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
               </div>
               <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Estabelecendo conexão segura com Railway...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-100 p-10 rounded-[3rem] text-center space-y-4">
               <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto"><Server className="w-8 h-8" /></div>
               <h3 className="text-xl font-black text-rose-900">Erro de Comunicação</h3>
               <p className="text-rose-700 font-medium max-w-md mx-auto">Não foi possível alcançar o servidor no Railway. Verifique se o backend está ativo e se a variável VITE_API_URL está correta no Vercel.</p>
               <button onClick={() => refresh()} className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-rose-600/20">Tentar Reconectar</button>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-700">
              {activeTab === 'dashboard' && <Dashboard data={{...financeData, exchanges: financeData.exchangeOperations} as any} />}
              {activeTab === 'accounts' && <AccountsView data={financeData as any} />}
              {activeTab === 'transactions' && <TransactionsView data={financeData as any} />}
              {activeTab === 'exchange' && <ExchangeView data={financeData as any} />}
              {activeTab === 'entities' && <CategoriesView data={financeData as any} />}
              {activeTab === 'budgets' && <BudgetsView data={financeData as any} />}
              {activeTab === 'goals' && <GoalsView data={financeData as any} />}
              {activeTab === 'networth' && <NetWorthView data={financeData as any} />}
            </div>
          )}
        </div>
      </main>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

export default App;
