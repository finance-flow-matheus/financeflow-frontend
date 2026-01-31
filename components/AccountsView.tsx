
import React, { useState } from 'react';
import { Plus, Trash2, Landmark, ShieldCheck, Edit2 } from 'lucide-react';
import { Currency } from '../types';

export const AccountsView: React.FC<{ data: any }> = ({ data }) => {
  const { accounts, addAccount, updateAccount, deleteAccount } = data;
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', currency: Currency.BRL, balance: 0, isInvestment: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount(formData);
    setFormData({ name: '', currency: Currency.BRL, balance: 0, isInvestment: false });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Adicionar Conta
        </button>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (editingId) {
            updateAccount(editingId, formData);
            setEditingId(null);
          } else {
            addAccount(formData);
            setIsAdding(false);
          }
          setFormData({ name: '', currency: Currency.BRL, balance: 0, isInvestment: false });
        }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nome do Banco/Conta</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Itaú, Revolut, XP Investimentos"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Moeda</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value as Currency })}
              >
                <option value={Currency.BRL}>Real (BRL)</option>
                <option value={Currency.EUR}>Euro (EUR)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Saldo Inicial</label>
              <input 
                type="number" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.balance}
                onChange={e => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isInvestment"
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={formData.isInvestment}
              onChange={e => setFormData({ ...formData, isInvestment: e.target.checked })}
            />
            <label htmlFor="isInvestment" className="text-sm font-medium text-slate-700">Esta conta é uma Reserva / Investimento</label>
          </div>
          <div className="mt-8 flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium">{editingId ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-xl font-medium">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc: any) => (
          <div key={acc.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-2xl ${acc.isInvestment ? 'bg-indigo-50 text-indigo-600' : (acc.currency === Currency.BRL ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600')}`}>
                {acc.isInvestment ? <ShieldCheck className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{acc.name}</h4>
                <p className="text-sm text-slate-500">
                  {acc.currency} {acc.isInvestment && <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tighter">Investimento</span>}
                </p>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {acc.currency === Currency.BRL ? 'R$' : '€'} {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="absolute top-6 right-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditingId(acc.id);
                  setFormData({ name: acc.name, currency: acc.currency, balance: acc.balance, isInvestment: acc.isInvestment });
                  setIsAdding(false);
                }}
                className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => deleteAccount(acc.id)}
                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
