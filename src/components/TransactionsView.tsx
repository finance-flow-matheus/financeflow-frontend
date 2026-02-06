
import React, { useState } from 'react';
import { Plus, Search, Filter, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Repeat, Edit2, Trash2, Check, X } from 'lucide-react';
import { TransactionType, Currency, Transaction } from '../types';

export const TransactionsView: React.FC<{ data: any }> = ({ data }) => {
  const { transactions, accounts, categories, incomeSources, addTransaction, updateTransaction, deleteTransaction } = data;
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
  const [editFormData, setEditFormData] = useState<Transaction | null>(null);

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

  const startEditing = (t: Transaction) => {
    setEditingId(t.id);
    setEditFormData({ ...t });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editFormData) {
      updateTransaction(editingId, editFormData);
      setEditingId(null);
      setEditFormData(null);
    }
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

      {(isAdding || editingId) && (
        <form onSubmit={editingId ? handleUpdate : handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
            <div className="flex gap-4 p-1 bg-slate-50 rounded-2xl w-fit">
              <button 
                type="button"
                onClick={() => editingId ? setEditFormData(prev => prev ? {...prev, type: TransactionType.EXPENSE} : null) : setType(TransactionType.EXPENSE)}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${(editingId ? editFormData?.type : type) === TransactionType.EXPENSE ? 'bg-white text-rose-600 shadow-sm font-bold' : 'text-slate-500'}`}
              >
                <TrendingDown className="w-4 h-4" /> Despesa
              </button>
              <button 
                type="button"
                onClick={() => editingId ? setEditFormData(prev => prev ? {...prev, type: TransactionType.INCOME} : null) : setType(TransactionType.INCOME)}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${(editingId ? editFormData?.type : type) === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'text-slate-500'}`}
              >
                <TrendingUp className="w-4 h-4" /> Receita
              </button>
            </div>

            <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
              <input 
                type="checkbox" 
                id="isFixed"
                className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                checked={editingId ? editFormData?.isFixed : formData.isFixed}
                onChange={e => editingId ? setEditFormData(prev => prev ? {...prev, isFixed: e.target.checked} : null) : setFormData({ ...formData, isFixed: e.target.checked })}
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
                value={editingId ? editFormData?.description : formData.description}
                onChange={e => editingId ? setEditFormData(prev => prev ? {...prev, description: e.target.value} : null) : setFormData({...formData, description: e.target.value})}
                placeholder="Ex: Aluguel, Supermercado, Salário Mensal"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Valor</label>
              <input 
                type="number" step="0.01" required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={editingId ? editFormData?.amount : formData.amount || ''}
                onChange={e => editingId ? setEditFormData(prev => prev ? {...prev, amount: parseFloat(e.target.value)} : null) : setFormData({...formData, amount: parseFloat(e.target.value)})}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Conta</label>
              <select 
                required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={editingId ? editFormData?.accountId : formData.accountId}
                onChange={e => editingId ? setEditFormData(prev => prev ? {...prev, accountId: e.target.value} : null) : setFormData({...formData, accountId: e.target.value})}
              >
                <option value="">Selecione a conta</option>
                {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Categoria</label>
              <select 
                required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={editingId ? editFormData?.categoryId : formData.categoryId}
                onChange={e => editingId ? setEditFormData(prev => prev ? {...prev, categoryId: e.target.value} : null) : setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Selecione a categoria</option>
                {categories.filter((c: any) => c.type === (editingId ? editFormData?.type : type)).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {(editingId ? editFormData?.type : type) === TransactionType.INCOME && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fonte de Renda</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editingId ? editFormData?.incomeSourceId : formData.incomeSourceId}
                  onChange={e => editingId ? setEditFormData(prev => prev ? {...prev, incomeSourceId: e.target.value} : null) : setFormData({...formData, incomeSourceId: e.target.value})}
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
                value={editingId ? editFormData?.date : formData.date}
                onChange={e => editingId ? setEditFormData(prev => prev ? {...prev, date: e.target.value} : null) : setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
              {editingId ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
            </button>
            <button 
              type="button" 
              onClick={() => { setIsAdding(false); setEditingId(null); setEditFormData(null); }} 
              className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Conta</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-center">Ações</th>
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
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEditing(t)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteTransaction(t.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Nenhum lançamento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {transactions.length > 0 ? transactions.map((t: any) => {
          const acc = accounts.find((a: any) => a.id === t.accountId);
          const cat = categories.find((c: any) => c.id === t.categoryId);
          return (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{t.description}</span>
                    {t.isFixed && <Repeat className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <div className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</div>
                </div>
                <div className={`text-lg font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <div className="flex items-center gap-1">
                    {t.type === TransactionType.INCOME ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {acc?.currency === Currency.BRL ? 'R$' : '€'} {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                <span className="px-2 py-1 bg-slate-100 rounded-lg font-medium">{cat?.name}</span>
                <span>•</span>
                <span>{acc?.name}</span>
              </div>
              {t.incomeSourceId && (
                <div className="text-xs text-slate-400 mb-3">Fonte: {incomeSources.find((s: any) => s.id === t.incomeSourceId)?.name}</div>
              )}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button 
                  onClick={() => startEditing(t)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-indigo-600 bg-indigo-50 rounded-xl font-medium text-sm"
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
                <button 
                  onClick={() => deleteTransaction(t.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-rose-600 bg-rose-50 rounded-xl font-medium text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-400 italic">
            Nenhum lançamento encontrado.
          </div>
        )}
      </div>
    </div>
  );
};
