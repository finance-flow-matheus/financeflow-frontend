
import React, { useMemo, useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { DashboardStats, Currency, TransactionType, Account, Transaction, Category, IncomeSource, Budget, Goal, Asset, Liability } from '../types.ts';
import { TrendingUp, TrendingDown, DollarSign, Euro, Wallet, Tag, Briefcase, Landmark, Target, AlertCircle, ShieldCheck, Gem, RefreshCw, Calendar } from 'lucide-react';

interface DashboardProps {
  data: {
    stats: DashboardStats;
    transactions: Transaction[];
    categories: Category[];
    incomeSources: IncomeSource[];
    accounts: Account[];
    budgets: Budget[];
    goals: Goal[];
    assets: Asset[];
    liabilities: Liability[];
  };
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

const MONTHS_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { transactions, categories, incomeSources, accounts, budgets, goals, assets, liabilities } = data;
  const [exchangeRate, setExchangeRate] = useState<number>(6.0);
  const [isLoadingRate, setIsLoadingRate] = useState(true);

  // Filtro de Período
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v4/latest/EUR');
        const json = await response.json();
        if (json && json.rates && json.rates.BRL) setExchangeRate(json.rates.BRL);
      } catch (e) { console.error(e); } finally { setIsLoadingRate(false); }
    };
    fetchRate();
  }, []);

  const yearOptions = [now.getFullYear(), now.getFullYear() - 1];

  const netWorthStats = useMemo(() => {
    const totalAssetsBRL = accounts.filter(a => a.currency === Currency.BRL).reduce((acc, curr) => acc + curr.balance, 0) +
                          assets.filter(as => as.currency === Currency.BRL).reduce((acc, curr) => acc + curr.value, 0);
    const totalAssetsEUR = accounts.filter(a => a.currency === Currency.EUR).reduce((acc, curr) => acc + curr.balance, 0) +
                          assets.filter(as => as.currency === Currency.EUR).reduce((acc, curr) => acc + curr.value, 0);
    
    const totalLiabsBRL = liabilities.filter(l => l.currency === Currency.BRL).reduce((acc, curr) => acc + curr.amount, 0);
    const totalLiabsEUR = liabilities.filter(l => l.currency === Currency.EUR).reduce((acc, curr) => acc + curr.amount, 0);

    const netBRL = totalAssetsBRL - totalLiabsBRL;
    const netEUR = totalAssetsEUR - totalLiabsEUR;
    const consolidatedEUR = netEUR + (netBRL / exchangeRate);
    const consolidatedBRL = netBRL + (netEUR * exchangeRate);

    return { netBRL, netEUR, consolidatedEUR, consolidatedBRL };
  }, [accounts, assets, liabilities, exchangeRate]);

  const historyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: d.getMonth(), year: d.getFullYear(), label: `${MONTHS_NAMES[d.getMonth()]}/${d.getFullYear().toString().slice(2)}` });
    }

    const evolution = months.map(m => {
      const endOfMonth = new Date(m.year, m.month + 1, 0, 23, 59, 59);
      const futureTransactions = transactions.filter(t => new Date(t.date) > endOfMonth);
      
      const accBalances = accounts.map(acc => {
        const accFutureTransactions = futureTransactions.filter(ft => ft.accountId === acc.id);
        const netImpact = accFutureTransactions.reduce((accNet, t) => 
          t.type === TransactionType.INCOME ? accNet + t.amount : accNet - t.amount, 0);
        return { ...acc, historicalBalance: acc.balance - netImpact };
      });

      const histAssetsBRL = accBalances.filter(a => a.currency === Currency.BRL).reduce((acc, curr) => acc + curr.historicalBalance, 0) +
                            assets.filter(as => as.currency === Currency.BRL).reduce((acc, curr) => acc + curr.value, 0);
      const histAssetsEUR = accBalances.filter(a => a.currency === Currency.EUR).reduce((acc, curr) => acc + curr.historicalBalance, 0) +
                            assets.filter(as => as.currency === Currency.EUR).reduce((acc, curr) => acc + curr.value, 0);
      
      const histLiabsBRL = liabilities.filter(l => l.currency === Currency.BRL).reduce((acc, curr) => acc + curr.amount, 0);
      const histLiabsEUR = liabilities.filter(l => l.currency === Currency.EUR).reduce((acc, curr) => acc + curr.amount, 0);

      const netBRL = histAssetsBRL - histLiabsBRL;
      const netEUR = histAssetsEUR - histLiabsEUR;
      const consolidatedEUR = netEUR + (netBRL / exchangeRate);
      
      return { 
        name: m.label, 
        patrimonio: Math.round(consolidatedEUR),
        rawBRL: netBRL,
        rawEUR: netEUR
      };
    });

    let firstDataIdx = evolution.findIndex(e => e.patrimonio !== 0);
    if (firstDataIdx === -1) return [];
    return evolution.slice(firstDataIdx);
  }, [accounts, assets, liabilities, transactions, exchangeRate]);

  const filteredStats = useMemo(() => {
    const filterByPeriod = (currency: Currency) => {
      const periodTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        const acc = accounts.find(a => a.id === t.accountId);
        return acc?.currency === currency && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      });

      const income = periodTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
      const expense = periodTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
      const balance = accounts.filter(a => a.currency === currency && !a.isInvestment).reduce((acc, curr) => acc + curr.balance, 0);

      return { income, expense, balance };
    };

    return {
      brl: filterByPeriod(Currency.BRL),
      eur: filterByPeriod(Currency.EUR)
    };
  }, [transactions, accounts, selectedMonth, selectedYear]);

  const getCurrencyData = (currency: Currency) => {
    const balances = accounts.filter(acc => acc.currency === currency).map(acc => ({ name: acc.name, value: acc.balance }));
    const periodTransactions = transactions.filter(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      const d = new Date(t.date);
      return acc?.currency === currency && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const expenseMap = new Map<string, number>();
    periodTransactions.forEach(t => { if (t.type === TransactionType.EXPENSE) expenseMap.set(t.categoryId, (expenseMap.get(t.categoryId) || 0) + t.amount); });
    const expenses = Array.from(expenseMap.entries()).map(([id, value]) => ({ name: categories.find(c => c.id === id)?.name || 'Outros', value }));

    const incomeMap = new Map<string, number>();
    periodTransactions.forEach(t => { if (t.type === TransactionType.INCOME && t.incomeSourceId) incomeMap.set(t.incomeSourceId, (incomeMap.get(t.incomeSourceId) || 0) + t.amount); });
    const incomes = Array.from(incomeMap.entries()).map(([id, value]) => ({ name: incomeSources.find(s => s.id === id)?.name || 'Outros', value }));

    const currencyBudgets = budgets.filter(b => b.currency === currency).map(b => {
      const actual = transactions.reduce((acc, t) => {
        const d = new Date(t.date);
        if (d.getMonth() !== selectedMonth || d.getFullYear() !== selectedYear) return acc;
        const accCurrency = accounts.find(a => a.id === t.accountId)?.currency;
        if (accCurrency !== b.currency) return acc;
        if (b.entityType === 'category' && t.categoryId === b.entityId) return acc + t.amount;
        if (b.entityType === 'source' && t.incomeSourceId === b.entityId) return acc + t.amount;
        return acc;
      }, 0);

      return { 
        ...b, 
        actual, 
        name: b.entityType === 'category' ? categories.find(c => c.id === b.entityId)?.name || 'Desconhecido' : incomeSources.find(s => s.id === b.entityId)?.name || 'Fonte',
        isIncome: b.entityType === 'category' ? categories.find(c => c.id === b.entityId)?.type === TransactionType.INCOME : true
      };
    });

    return { balances, expenses, incomes, budgets: currencyBudgets };
  };

  const brlData = useMemo(() => getCurrencyData(Currency.BRL), [transactions, accounts, categories, incomeSources, budgets, selectedMonth, selectedYear]);
  const eurData = useMemo(() => getCurrencyData(Currency.EUR), [transactions, accounts, categories, incomeSources, budgets, selectedMonth, selectedYear]);

  const emergencyGoal = goals.find(g => g.category === 'emergency');
  const emergencyAccount = emergencyGoal ? accounts.find(a => a.id === emergencyGoal.accountId) : null;
  const emergencyBalance = emergencyAccount?.balance || 0;
  const emergencyProgress = emergencyGoal ? Math.min((emergencyBalance / emergencyGoal.targetAmount) * 100, 100) : 0;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Estatísticas Mensais</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filtrando resultados por período</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-slate-700"
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS_NAMES.map((name, idx) => <option key={name} value={idx}>{name}</option>)}
          </select>
          <select 
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-slate-700"
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Mensal Euro" balance={filteredStats.eur.balance} income={filteredStats.eur.income} expense={filteredStats.eur.expense} currency={Currency.EUR} color="border-blue-500" icon={Euro} />
        <StatCard title="Mensal Real" balance={filteredStats.brl.balance} income={filteredStats.brl.income} expense={filteredStats.brl.expense} currency={Currency.BRL} color="border-emerald-500" icon={DollarSign} />
        
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border-l-4 border-amber-500 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-black text-[9px] uppercase tracking-widest">Reserva de Emergência</h3>
            <div className="p-1 rounded-lg bg-amber-50 text-amber-500"><ShieldCheck className="w-3.5 h-3.5" /></div>
          </div>
          <div className="mb-2">
            <div className="flex justify-between items-end mb-1"><span className="text-xl font-black text-slate-900 tracking-tight">{emergencyGoal ? emergencyProgress.toFixed(0) : '0'}%</span><span className="text-[10px] font-bold text-slate-400">{emergencyGoal ? `${(emergencyAccount?.currency === Currency.BRL ? 'R$' : '€')} ${emergencyBalance.toLocaleString('pt-BR')}` : 'R$ 0,00'}</span></div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${emergencyGoal ? emergencyProgress : 0}%` }} /></div>
          </div>
          <div className="pt-2 border-t border-slate-50 flex justify-between items-center"><span className="text-[9px] font-black text-slate-400 uppercase">{emergencyGoal ? `Meta: ${emergencyAccount?.currency === Currency.BRL ? 'R$' : '€'} ${emergencyGoal.targetAmount.toLocaleString('pt-BR')}` : 'Sem meta'}</span></div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-4 shadow-xl shadow-slate-900/10 border-l-4 border-indigo-500 text-white flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 font-black text-[9px] uppercase tracking-widest">Patrimônio Líquido Atual</h3>
            <div className="p-1 rounded-lg bg-white/10 text-indigo-400">{isLoadingRate ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Gem className="w-3.5 h-3.5" />}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Euro</p>
              <p className="text-sm font-black tracking-tight leading-none">€ {netWorthStats.netEUR.toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Real</p>
              <p className="text-sm font-black tracking-tight leading-none">R$ {netWorthStats.netBRL.toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5 flex flex-col">
            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Global</span>
            <span className="text-[10px] font-bold text-slate-300">
              € {netWorthStats.consolidatedEUR.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} | R$ {netWorthStats.consolidatedBRL.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      <CurrencySection currency={Currency.EUR} currencyData={eurData} selectedMonth={selectedMonth} selectedYear={selectedYear} />
      <CurrencySection currency={Currency.BRL} currencyData={brlData} selectedMonth={selectedMonth} selectedYear={selectedYear} />

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-950 text-indigo-400 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Evolução do Patrimônio Global</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Saldos consolidados em Euro (€)</p>
            </div>
          </div>
        </div>

        <div className="h-[350px] w-full">
          {historyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorPat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  tickFormatter={(val) => `€${val.toLocaleString('pt-BR')}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  formatter={(value: any) => [`€ ${value.toLocaleString('pt-BR')}`, 'Patrimônio']}
                />
                <Area 
                  type="monotone" 
                  dataKey="patrimonio" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorPat)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 font-bold italic">
              Dados insuficientes para gerar a evolução histórica.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, balance, income, expense, currency, color, icon: Icon }: any) => (
  <div className={`bg-white rounded-[2rem] p-4 shadow-sm border-l-4 ${color} border border-slate-100`}>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-slate-400 font-black text-[9px] uppercase tracking-widest">{title}</h3>
      <div className={`p-1 rounded-lg bg-slate-50 text-slate-300`}><Icon className="w-3.5 h-3.5" /></div>
    </div>
    <div className="mb-3">
      <span className="text-xl font-black text-slate-900 tracking-tight">{currency === Currency.BRL ? 'R$' : '€'} {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
    </div>
    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
      <div><p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" />{currency === Currency.BRL ? 'R$' : '€'} {income.toLocaleString('pt-BR')}</p></div>
      <div><p className="text-[11px] font-bold text-rose-500 flex items-center gap-1"><TrendingDown className="w-2.5 h-2.5" />{currency === Currency.BRL ? 'R$' : '€'} {expense.toLocaleString('pt-BR')}</p></div>
    </div>
  </div>
);

const DistributionChart = ({ title, data, icon: Icon, colorClass, currencySymbol }: any) => (
  <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
    <div className="flex items-center gap-2 mb-1"><div className={`p-1.5 rounded-lg ${colorClass}`}><Icon className="w-3.5 h-3.5" /></div><h3 className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{title}</h3></div>
    <div className="h-[280px] w-full relative">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart><Pie data={data} cx="50%" cy="42%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">{data.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} formatter={(value: any, name: any) => [`${currencySymbol} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name]} /><Legend verticalAlign="bottom" align="center" layout="horizontal" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '15px', width: '100%', lineHeight: '14px' }} /></PieChart>
        </ResponsiveContainer>
      ) : ( <div className="h-full flex flex-col items-center justify-center text-slate-300 text-[10px] font-medium italic gap-2"><Icon className="w-8 h-8 opacity-5" /><span>Nenhum registro no período</span></div> )}
    </div>
  </div>
);

const CurrencySection = ({ currency, currencyData, selectedMonth, selectedYear }: { currency: Currency, currencyData: any, selectedMonth: number, selectedYear: number }) => {
  const symbol = currency === Currency.BRL ? 'R$' : '€';
  const accentColor = currency === Currency.BRL ? 'text-emerald-600' : 'text-blue-600';
  const bgAccent = currency === Currency.BRL ? 'bg-emerald-50' : 'bg-blue-50';
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2"><div className={`w-7 h-7 rounded-lg ${bgAccent} flex items-center justify-center font-black text-[10px] ${accentColor}`}>{symbol}</div><h2 className={`text-base font-black ${accentColor} tracking-tight`}>Resultados em {currency === Currency.BRL ? 'Reais' : 'Euros'} ({MONTHS_NAMES[selectedMonth]}/{selectedYear})</h2><div className="flex-1 h-px bg-slate-100 ml-4"></div></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DistributionChart title="Receitas por Fonte" data={currencyData.incomes} icon={Briefcase} colorClass="bg-emerald-50 text-emerald-600" currencySymbol={symbol} />
        <DistributionChart title="Despesas por Categoria" data={currencyData.expenses} icon={Tag} colorClass="bg-rose-50 text-rose-600" currencySymbol={symbol} />
        <DistributionChart title="Saldo por Conta" data={currencyData.balances} icon={Wallet} colorClass="bg-indigo-50 text-indigo-600" currencySymbol={symbol} />
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-2 mb-4"><div className={`p-1.5 rounded-lg bg-amber-50 text-amber-600`}><Target className="w-3.5 h-3.5" /></div><h3 className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Monitoramento Orçamentário</h3></div>
          <div className="flex-1 overflow-y-auto max-h-[280px] space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {currencyData.budgets && currencyData.budgets.length > 0 ? currencyData.budgets.map((b: any) => (
              <div key={b.id} className="space-y-2 p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                <div className="flex justify-between items-end"><div className="flex flex-col"><span className="text-[10px] font-black text-slate-400 uppercase tracking-tight leading-none mb-1">{b.isIncome ? 'Meta' : 'Limite'}</span><span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{b.name}</span></div><div className="text-right"><span className={`text-[11px] font-black ${!b.isIncome && b.actual > b.amount ? 'text-rose-500' : (b.isIncome ? 'text-emerald-500' : 'text-indigo-500')}`}>{Math.min((b.actual / b.amount) * 100, 100).toFixed(0)}%</span><p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{symbol} {b.actual.toLocaleString('pt-BR')} / {b.amount.toLocaleString('pt-BR')}</p></div></div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${b.isIncome ? 'bg-emerald-500' : (!b.isIncome && b.actual > b.amount ? 'bg-rose-500' : 'bg-indigo-500')}`} style={{ width: `${Math.min((b.actual / b.amount) * 100, 100)}%` }} /></div>
              </div>
            )) : <div className="h-full flex flex-col items-center justify-center text-slate-300 text-[10px] font-medium italic gap-2 py-10"><Target className="w-8 h-8 opacity-5" /><span>Sem orçamentos</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
};
