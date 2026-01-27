
import React, { useState } from 'react';
import { Plus, Search, Filter, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Repeat } from 'lucide-react';
import { TransactionType, Currency } from '../types';

export const TransactionsView: React.FC<{ data: any }> = ({ data }) => {
  const { transactions, accounts, categories, incomeSources, addTransaction } = data;
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    categoryId: '',
    incomeSourceId: '',
    isFixed: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({ ...formData, type });
    setFormData({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      accountId: '',
      categoryId: '',
      incomeSourceId: '',
      isFixed: false
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar lançamentos..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-5 h-5" />
          Novo Lançamento
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4 p-1 bg-slate-50 rounded-2xl w-fit">
              <button 
                type="button"
                onClick={() => setType(TransactionType.EXPENSE)}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-rose-600 shadow-sm font-bold' : 'text-slate-500'}`}
              >
                <TrendingDown className="w-4 h-4" /> Despesa
              </button>
              <button 
                type="button"
                onClick={() => setType(TransactionType.INCOME)}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'text-slate-500'}`}
              >
                <TrendingUp className="w-4 h-4" /> Receita
              </button>
            </div>

            <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
              <input 
                type="checkbox" 
                id="isFixed"
                className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                checked={formData.isFixed}
                onChange={e => setFormData({ ...formData, isFixed: e.target.checked })}
              />
              <label htmlFor="isFixed" className="text-sm font-bold text-indigo-700 flex items-center gap-2 cursor-pointer">
                <Repeat className="w-4 h-4" /> Fixa / Recorrente
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição</label>
              <input 
                type="text" required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Ex: Aluguel, Supermercado, Salário Mensal"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Valor</label>
              <input 
                type="number" step="0.01" required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.amount || ''}
                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Conta</label>
              <select 
                required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.accountId}
                onChange={e => setFormData({...formData, accountId: e.target.value})}
              >
                <option value="">Selecione a conta</option>
                {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Categoria</label>
              <select 
                required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Selecione a categoria</option>
                {categories.filter((c: any) => c.type === type).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {type === TransactionType.INCOME && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fonte de Renda</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.incomeSourceId}
                  onChange={e => setFormData({...formData, incomeSourceId: e.target.value})}
                >
                  <option value="">Selecione a fonte</option>
                  {incomeSources.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Data</label>
              <input 
                type="date" required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">Salvar Lançamento</button>
            <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Conta</th>
              <th className="px-6 py-4 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length > 0 ? transactions.map((t: any) => {
              const acc = accounts.find((a: any) => a.id === t.accountId);
              const cat = categories.find((c: any) => c.id === t.categoryId);
              return (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{t.description}</span>
                        {t.isFixed && (
                          <div className="group/hint relative">
                            <Repeat className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/hint:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">Lançamento Fixo</span>
                          </div>
                        )}
                      </div>
                      {t.incomeSourceId && (
                        <span className="text-[10px] text-slate-400 font-medium">Fonte: {incomeSources.find((s: any) => s.id === t.incomeSourceId)?.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">
                      {cat?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{acc?.name}</td>
                  <td className={`px-6 py-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {t.type === TransactionType.INCOME ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {acc?.currency === Currency.BRL ? 'R$' : '€'} {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Nenhum lançamento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
