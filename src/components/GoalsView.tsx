
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Target, 
  Plane, 
  Home, 
  Car, 
  GraduationCap, 
  ShieldAlert, 
  MoreHorizontal,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Coins
} from 'lucide-react';
import { Goal, GoalCategory, Account, Currency } from '../types';

export const GoalsView: React.FC<{ data: any }> = ({ data }) => {
  const { goals, accounts, addGoal, deleteGoal } = data;
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: 0,
    deadline: '',
    accountId: '',
    category: 'other' as GoalCategory
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId || !formData.name || formData.targetAmount <= 0) return;
    addGoal(formData);
    setFormData({ name: '', targetAmount: 0, deadline: '', accountId: '', category: 'other' });
    setIsAdding(false);
  };

  const getCategoryIcon = (cat: GoalCategory) => {
    switch (cat) {
      case 'travel': return <Plane className="w-5 h-5" />;
      case 'house': return <Home className="w-5 h-5" />;
      case 'car': return <Car className="w-5 h-5" />;
      case 'education': return <GraduationCap className="w-5 h-5" />;
      case 'emergency': return <ShieldAlert className="w-5 h-5" />;
      default: return <MoreHorizontal className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (cat: GoalCategory) => {
    switch (cat) {
      case 'travel': return 'Viagem';
      case 'house': return 'Moradia';
      case 'car': return 'Veículo';
      case 'education': return 'Educação';
      case 'emergency': return 'Reserva';
      default: return 'Outros';
    }
  };

  const calculateMonthlyTarget = (target: number, current: number, deadlineStr: string | undefined) => {
    if (!deadlineStr) return null;
    
    const now = new Date();
    const deadline = new Date(deadlineStr);
    const remaining = target - current;

    if (remaining <= 0) return 0;

    // Diferença em meses
    const diffMonths = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
    
    // Se o prazo for este mês ou já passou, o valor mensal é o total restante
    const months = Math.max(diffMonths, 1);
    
    return {
      monthlyValue: remaining / months,
      monthsRemaining: months
    };
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Metas & Objetivos</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Transformando sonhos em números</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nova Meta
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Objetivo</label>
              <input 
                type="text" required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Viagem para o Japão, Reserva de 6 meses"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
              <select 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as GoalCategory })}
              >
                <option value="emergency">Reserva de Emergência</option>
                <option value="travel">Viagem</option>
                <option value="house">Casa / Imóvel</option>
                <option value="car">Carro / Veículo</option>
                <option value="education">Educação</option>
                <option value="other">Outro Objetivo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Valor Alvo</label>
              <input 
                type="number" step="0.01" required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={formData.targetAmount || ''}
                onChange={e => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) })}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Conta Relacionada</label>
              <select 
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                value={formData.accountId}
                onChange={e => setFormData({ ...formData, accountId: e.target.value })}
              >
                <option value="">Selecione a conta...</option>
                {accounts.map((a: Account) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data Limite (Essencial para cálculo mensal)</label>
              <input 
                type="date"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20">Criar Objetivo</button>
            <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-bold">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {goals.map((goal: Goal) => {
          const account = accounts.find((a: Account) => a.id === goal.accountId);
          const currentAmount = account?.balance || 0;
          const progress = Math.min((currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = progress >= 100;
          const symbol = account?.currency === Currency.BRL ? 'R$' : '€';
          const remaining = Math.max(goal.targetAmount - currentAmount, 0);
          
          const monthlyPlan = calculateMonthlyTarget(goal.targetAmount, currentAmount, goal.deadline);

          return (
            <div key={goal.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative group overflow-hidden flex flex-col h-full">
              {/* Background Accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-110 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>

              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {getCategoryIcon(goal.category)}
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none">{goal.name}</h4>
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{getCategoryLabel(goal.category)} • {account?.name}</p>
              </div>

              <div className="space-y-2 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-slate-900">
                    {progress.toFixed(0)}%
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Progresso</p>
                    <p className="text-sm font-bold text-slate-700">
                      {symbol} {currentAmount.toLocaleString('pt-BR')} / {goal.targetAmount.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500 shadow-lg shadow-indigo-500/30'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Monthly Savings Plan Card - NEW */}
              {!isCompleted && monthlyPlan && (
                <div className="mb-8 p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Coins className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Plano de Economia</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xl font-black text-indigo-900 leading-none">
                        {symbol} {monthlyPlan.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase mt-1">Por Mês</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-indigo-900 leading-none">
                        {monthlyPlan.monthsRemaining}
                      </p>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase mt-1">Meses Restantes</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <TrendingUp className="w-3 h-3" /> Faltam
                  </div>
                  <p className="font-black text-slate-900">{symbol} {remaining.toLocaleString('pt-BR')}</p>
                </div>
                <div className="space-y-1 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" /> Prazo
                  </div>
                  <p className="font-black text-slate-900">
                    {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                  </p>
                </div>
              </div>

              {isCompleted ? (
                <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Objetivo Atingido! Parabéns!</span>
                </div>
              ) : remaining > currentAmount && (
                <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Mantenha o Foco no Plano!</span>
                </div>
              )}
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="lg:col-span-3 py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
            <Target className="w-16 h-16 mb-4 opacity-10" />
            <p className="font-bold text-lg">Nenhuma meta definida ainda.</p>
            <p className="text-sm">Comece a planejar seus sonhos clicando em "Nova Meta".</p>
          </div>
        )}
      </div>

      {/* Dica do Especialista */}
      <div className="bg-indigo-900 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">O Poder da Reserva de Emergência</h3>
            <p className="text-indigo-200 font-medium leading-relaxed">
              Especialistas recomendam guardar entre 6 a 12 meses do seu custo de vida mensal em uma conta de alta liquidez. Comece criando uma meta de "Reserva de Emergência" atrelada à sua conta de investimentos.
            </p>
          </div>
          <button className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black hover:bg-indigo-50 transition-colors whitespace-nowrap">
            Saber Mais
          </button>
        </div>
      </div>
    </div>
  );
};
