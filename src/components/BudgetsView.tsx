
import React, { useState } from 'react';
import { Plus, Trash2, Target, Edit2, Check, X, Tag, Briefcase, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Currency, TransactionType, Category, IncomeSource, Budget, Transaction } from '../types';

export const BudgetsView: React.FC<{ data: any }> = ({ data }) => {
  const { categories, incomeSources, budgets, transactions, accounts, addBudget, updateBudget, deleteBudget } = data;
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    entityId: '',
    entityType: 'category' as 'category' | 'source',
    amount: 0,
    currency: Currency.BRL
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Budget | null>(null);

  // Helper robusto para extrair mês e ano sem problemas de fuso horário
  const getDateInfo = (dateStr: string) => {
    const [year, month] = dateStr.split('-').map(Number);
    return { month: month - 1, year };
  };

  // Helper para cálculo do realizado no mês atual
  const getActualAmount = (budget: Budget) => {
    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    return transactions.reduce((acc: number, t: Transaction) => {
      // Usamos a mesma lógica do Dashboard para garantir consistência
      const { month, year } = getDateInfo(t.date);
      const isSamePeriod = month === currMonth && year === currYear;
      
      if (!isSamePeriod) return acc;

      const accCurrency = accounts.find((a: any) => a.id === t.accountId)?.currency;
      if (accCurrency !== budget.currency) return acc;

      if (budget.entityType === 'category' && t.categoryId === budget.entityId) {
        return acc + t.amount;
      }

      if (budget.entityType === 'source' && t.incomeSourceId === budget.entityId) {
        return acc + t.amount;
      }

      return acc;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entityId) return;
    addBudget(formData);
    setFormData({ entityId: '', entityType: 'category', amount: 0, currency: Currency.BRL });
    setIsAdding(false);
  };

  const startEdit = (b: Budget) => {
    setEditingId(b.id);
    setEditFormData({ ...b });
  };

  const handleUpdate = () => {
    if (editingId && editFormData) {
      updateBudget(editingId, editFormData);
      setEditingId(null);
      setEditFormData(null);
    }
  };

  const getEntityInfo = (b: Budget) => {
    if (b.entityType === 'category') {
      const cat = categories.find((c: Category) => String(c.id) === String(b.entityId));
      return {
        name: cat?.name || 'Categoria Removida',
        type: cat?.type || TransactionType.EXPENSE
      };
    }
    return {
      name: incomeSources.find((s: IncomeSource) => String(s.id) === String(b.entityId))?.name || 'Fonte Removida',
      type: TransactionType.INCOME
    };
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Planejamento Mensal</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Metas vs Realizado (Mês Atual)</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Orçamento
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Alvo</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                value={formData.entityType}
                onChange={e => setFormData({ ...formData, entityType: e.target.value as any, entityId: '' })}
              >
                <option value="category">Categoria</option>
                <option value="source">Fonte de Renda</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Item</label>
              <select 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                value={formData.entityId}
                onChange={e => setFormData({ ...formData, entityId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {formData.entityType === 'category' 
                  ? categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name} ({c.type === TransactionType.INCOME ? 'Receita' : 'Despesa'})</option>)
                  : incomeSources.map((s: IncomeSource) => <option key={s.id} value={s.id}>{s.name}</option>)
                }
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Valor Mensal</label>
              <input 
                type="number" step="0.01" required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={formData.amount || ''}
                onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Moeda</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value as Currency })}
              >
                <option value={Currency.BRL}>Real (BRL)</option>
                <option value={Currency.EUR}>Euro (EUR)</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20">Salvar Planejamento</button>
            <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Item / Categoria</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Moeda</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Planejado</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Realizado</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progresso</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {budgets.map((b: Budget) => {
              const { name, type } = getEntityInfo(b);
              const actual = getActualAmount(b);
              const percent = Math.min((actual / (b.amount || 1)) * 100, 100);
              const isIncome = type === TransactionType.INCOME;
              const isOver = !isIncome && actual > b.amount;
              // Se budget não tem currency, usar BRL como padrão
              const budgetCurrency = b.currency || Currency.BRL;
              const symbol = budgetCurrency === Currency.BRL ? 'R$' : '€';

              return (
                <tr key={b.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.entityType === 'category' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {b.entityType === 'category' ? <Tag className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {isIncome ? 'Meta de Receita' : 'Limite de Gasto'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${budgetCurrency === Currency.BRL ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {budgetCurrency}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {editingId === b.id ? (
                      <input 
                        type="number" step="0.01"
                        className="w-24 px-2 py-1 border border-slate-200 rounded font-bold text-sm"
                        value={editFormData?.amount}
                        onChange={e => setEditFormData(prev => prev ? {...prev, amount: parseFloat(e.target.value)} : null)}
                      />
                    ) : (
                      <span className="font-black text-slate-900 text-sm">
                        {symbol} {b.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={`text-sm font-black ${isOver ? 'text-rose-600' : (isIncome ? 'text-emerald-600' : 'text-slate-700')}`}>
                        {symbol} {actual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      {isOver && <span className="text-[9px] font-bold text-rose-500 uppercase flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" /> Excedido</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-full max-w-[150px] space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                        <span>{percent.toFixed(0)}%</span>
                        {isIncome && actual >= b.amount && <span className="text-emerald-500">Concluído</span>}
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${isIncome ? 'bg-emerald-500' : (isOver ? 'bg-rose-500' : 'bg-indigo-500')}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-1">
                      {editingId === b.id ? (
                        <>
                          <button onClick={handleUpdate} className="p-2 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(b)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deleteBudget(b.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {budgets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">
                  Nenhum planejamento mensal definido. Comece criando um novo acima.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resumo de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600"><TrendingUp className="w-6 h-6" /></div>
             <h3 className="font-black text-emerald-900 uppercase tracking-tight">Metas de Receita</h3>
           </div>
           <p className="text-xs text-emerald-700 font-medium leading-relaxed">Acompanhe quanto das suas metas de ganho mensal você já atingiu no mês vigente em cada moeda.</p>
        </div>
        <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600"><TrendingDown className="w-6 h-6" /></div>
             <h3 className="font-black text-rose-900 uppercase tracking-tight">Limites de Gasto</h3>
           </div>
           <p className="text-xs text-rose-700 font-medium leading-relaxed">Cuidado com as categorias em vermelho! Elas indicam que você ultrapassou o teto planejado para o período.</p>
        </div>
      </div>
    </div>
  );
};
