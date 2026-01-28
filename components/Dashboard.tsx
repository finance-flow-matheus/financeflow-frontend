
import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import { DashboardStats, Currency, TransactionType, Account } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Euro, Wallet, Tag, Briefcase, Landmark } from 'lucide-react';
import { formatCurrency } from '../utils';

interface DashboardProps {
  data: any; // Result from useFinanceData
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { stats, transactions, categories, incomeSources, accounts } = data;

  // Chart Data: Balance by Account
  const balanceByAccount = useMemo(() => {
    return accounts.map((acc: Account) => ({
      name: acc.name,
      value: acc.balance,
      currency: acc.currency
    }));
  }, [accounts]);

  // Chart Data: Expense by Category
  const expenseByCategory = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const map = new Map<string, number>();
    
    transactions.forEach((t: any) => {
      const d = new Date(t.date);
      if (t.type === TransactionType.EXPENSE && d.getMonth() === currentMonth) {
        map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
      }
    });

    return Array.from(map.entries()).map(([id, value]) => ({
      name: categories.find((c: any) => c.id === id)?.name || 'Outros',
      value
    }));
  }, [transactions, categories]);

  // Chart Data: Income by Source
  const incomeBySource = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const map = new Map<string, number>();
    
    transactions.forEach((t: any) => {
      const d = new Date(t.date);
      if (t.type === TransactionType.INCOME && d.getMonth() === currentMonth && t.incomeSourceId) {
        map.set(t.incomeSourceId, (map.get(t.incomeSourceId) || 0) + t.amount);
      }
    });

    return Array.from(map.entries()).map(([id, value]) => ({
      name: incomeSources.find((s: any) => s.id === id)?.name || 'Outros',
      value
    }));
  }, [transactions, incomeSources]);

  // Mock data for Balance Evolution (Last 6 months)
  const balanceEvolution = [
    { name: 'Jan', BRL: 8000, EUR: 400, Invest: 20000 },
    { name: 'Fev', BRL: 9200, EUR: 450, Invest: 21000 },
    { name: 'Mar', BRL: 8700, EUR: 420, Invest: 22000 },
    { name: 'Abr', BRL: 9500, EUR: 480, Invest: 23500 },
    { name: 'Mai', BRL: 10200, EUR: 510, Invest: 24200 },
    { name: 'Jun', BRL: 10000, EUR: 500, Invest: 25000 },
  ];

  const StatCard = ({ title, balance, income, expense, currency, color, icon: Icon = DollarSign }: any) => (
    <div className={`bg-white rounded-3xl p-6 shadow-sm border-l-8 ${color} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-xl bg-slate-100 text-slate-600`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold text-slate-900">
          {formatCurrency(balance, currency)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mb-1 uppercase tracking-tighter">
            <TrendingUp className="w-3 h-3" />
            <span>Entradas</span>
          </div>
          <p className="text-lg font-bold text-slate-800">
            {formatCurrency(income, currency)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-rose-500 text-xs font-semibold mb-1 uppercase tracking-tighter">
            <TrendingDown className="w-3 h-3" />
            <span>Saídas</span>
          </div>
          <p className="text-lg font-bold text-slate-800">
            {formatCurrency(expense, currency)}
          </p>
        </div>
      </div>
    </div>
  );

  const DistributionChart = ({ title, data, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{title}</h3>
      </div>
      <div className="h-[240px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any, name: any, props: any) => {
                  const currency = props.payload.currency;
                  const symbol = currency === Currency.EUR ? '€' : (currency === Currency.BRL ? 'R$' : '');
                  return [`${symbol} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name];
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
            Sem dados para exibir
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Consolidated Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Consolidado Real" 
          balance={stats.brl.totalBalance}
          income={stats.brl.monthlyIncome}
          expense={stats.brl.monthlyExpense}
          currency={Currency.BRL}
          color="border-emerald-500"
          icon={DollarSign}
        />
        <StatCard 
          title="Consolidado Euro" 
          balance={stats.eur.totalBalance}
          income={stats.eur.monthlyIncome}
          expense={stats.eur.monthlyExpense}
          currency={Currency.EUR}
          color="border-blue-500"
          icon={Euro}
        />
        <StatCard 
          title="Reserva / Investimento" 
          balance={stats.investment.totalBalance}
          income={stats.investment.monthlyIncome}
          expense={stats.investment.monthlyExpense}
          currency={Currency.BRL} // Assuming investment summary is usually viewed in BRL for now
          color="border-indigo-500"
          icon={Landmark}
        />
      </div>

      {/* Distribution Section (Rosca Charts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DistributionChart 
          title="Saldo por Conta" 
          data={balanceByAccount} 
          icon={Wallet} 
          colorClass="bg-indigo-100 text-indigo-600"
        />
        <DistributionChart 
          title="Despesas por Categoria" 
          data={expenseByCategory} 
          icon={Tag} 
          colorClass="bg-rose-100 text-rose-600"
        />
        <DistributionChart 
          title="Receitas por Fonte" 
          data={incomeBySource} 
          icon={Briefcase} 
          colorClass="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 gap-8">
        {/* Balance Evolution */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-tight">Evolução Histórica do Saldo</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceEvolution}>
                <defs>
                  <linearGradient id="colorBRL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEUR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="BRL" 
                  name="Total em Reais (R$)"
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorBRL)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="EUR" 
                  name="Total em Euros (€)"
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorEUR)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
