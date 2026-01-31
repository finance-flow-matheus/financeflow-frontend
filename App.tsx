
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  ListTodo, 
  History,
  Menu,
  X,
  Layers,
  LogOut,
  TrendingUp,
  Target,
  PieChart,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AccountsView } from './components/AccountsView';
import { TransactionsView } from './components/TransactionsView';
import { ExchangeView } from './components/ExchangeView';
import { CategoriesView } from './components/CategoriesView';
import { AuthScreen } from './components/AuthScreen';
import { ResetPassword } from './components/ResetPassword';
import MetricsView from './components/MetricsView';
import GoalsView from './components/GoalsView';
import InvestmentsView from './components/InvestmentsView';
import BalanceSheetView from './components/BalanceSheetView';
import BudgetView from './components/BudgetView';
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
      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Multi-Currency</span>
    </div>
  </div>
);

type TabType = 'dashboard' | 'metrics' | 'goals' | 'investments' | 'balance' | 'budget' | 'accounts' | 'transactions' | 'exchange' | 'entities';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [token, setToken] = useState<string>('');
  
  useEffect(() => {
    // Check if it's a password reset page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('token')) {
      setIsResetPassword(true);
      return;
    }

    const savedToken = localStorage.getItem('ff_token');
    const savedUser = localStorage.getItem('ff_user');
    if (savedToken && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const handleLogin = (newToken: string, userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    setIsAuthenticated(false);
    setUser(null);
    setToken('');
  };

  const financeData = useFinanceData();

  if (isResetPassword) {
    return <ResetPassword onSuccess={() => {
      setIsResetPassword(false);
      window.history.replaceState({}, '', '/');
    }} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (financeData.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'metrics' as TabType, label: 'Indicadores', icon: BarChart3 },
    { id: 'goals' as TabType, label: 'Metas', icon: Target },
    { id: 'investments' as TabType, label: 'Investimentos', icon: TrendingUp },
    { id: 'balance' as TabType, label: 'Balanço Patrimonial', icon: PieChart },
    { id: 'budget' as TabType, label: 'Orçamento', icon: DollarSign },
    { id: 'accounts' as TabType, label: 'Contas', icon: Wallet },
    { id: 'transactions' as TabType, label: 'Lançamentos', icon: History },
    { id: 'exchange' as TabType, label: 'Câmbio', icon: ArrowLeftRight },
    { id: 'entities' as TabType, label: 'Categorias & Fontes', icon: ListTodo },
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

        <nav className="pt-20 md:pt-0 md:mt-4 px-6 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 text-left group
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                  : 'hover:bg-slate-900 hover:text-white'}
              `}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-900">
          <div className="bg-slate-900 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-slate-400 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-slate-500">
                {activeTab === 'metrics' && 'Acompanhe seus indicadores financeiros'}
                {activeTab === 'goals' && 'Defina e acompanhe suas metas financeiras'}
                {activeTab === 'investments' && 'Gerencie sua carteira de investimentos'}
                {activeTab === 'balance' && 'Visualize seus ativos e passivos'}
                {activeTab === 'budget' && 'Controle seus gastos por categoria'}
                {activeTab === 'dashboard' && 'Gerencie suas finanças em Real e Euro com facilidade.'}
                {activeTab === 'accounts' && 'Gerencie suas contas bancárias'}
                {activeTab === 'transactions' && 'Registre suas receitas e despesas'}
                {activeTab === 'exchange' && 'Realize operações de câmbio'}
                {activeTab === 'entities' && 'Organize suas categorias e fontes de renda'}
              </p>
            </div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'dashboard' && <Dashboard data={financeData} />}
            {activeTab === 'metrics' && <MetricsView token={token} />}
            {activeTab === 'goals' && <GoalsView token={token} />}
            {activeTab === 'investments' && <InvestmentsView token={token} />}
            {activeTab === 'balance' && <BalanceSheetView token={token} />}
            {activeTab === 'budget' && <BudgetView token={token} />}
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
