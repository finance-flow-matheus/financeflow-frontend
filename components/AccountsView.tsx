
import React, { useState } from 'react';
import { Plus, Trash2, Landmark, ShieldCheck, Edit2, Check, X } from 'lucide-react';
import { Currency, Account } from '../types';

export const AccountsView: React.FC<{ data: any }> = ({ data }) => {
  const { accounts, addAccount, updateAccount, deleteAccount } = data;
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', currency: Currency.BRL, balance: 0, isInvestment: false });
  const [editFormData, setEditFormData] = useState<Account | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount(formData);
    setFormData({ name: '', currency: Currency.BRL, balance: 0, isInvestment: false });
    setIsAdding(false);
  };

  const startEditing = (acc: Account) => {
    setEditingId(acc.id);
    setEditFormData({ ...acc });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editFormData) {
      updateAccount(editingId, editFormData);
      setEditingId(null);
      setEditFormData(null);
    }
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

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-top-2">
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
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium">Salvar</button>
            <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-xl font-medium">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc: Account) => (
          <div key={acc.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group transition-all hover:border-indigo-100">
            {editingId === acc.id && editFormData ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                />
                <div className="flex gap-2">
                  <select 
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    value={editFormData.currency}
                    onChange={e => setEditFormData({ ...editFormData, currency: e.target.value as Currency })}
                  >
                    <option value={Currency.BRL}>BRL</option>
                    <option value={Currency.EUR}>EUR</option>
                  </select>
                  <input 
                    type="number" 
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                    value={editFormData.balance}
                    onChange={e => setEditFormData({ ...editFormData, balance: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={editFormData.isInvestment}
                    onChange={e => setEditFormData({ ...editFormData, isInvestment: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-xs text-slate-500">Investimento</span>
                </div>
                <div className="flex gap-2 justify-end">
                   <button type="submit" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check className="w-5 h-5" /></button>
                   <button type="button" onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-2xl ${acc.isInvestment ? 'bg-indigo-50 text-indigo-600' : (acc.currency === Currency.BRL ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600')}`}>
                    {acc.isInvestment ? <ShieldCheck className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{acc.name}</h4>
                    <p className="text-sm text-slate-500">
                      {acc.currency} {acc.isInvestment && <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tighter">Investimento</span>}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditing(acc)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteAccount(acc.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {acc.currency === Currency.BRL ? 'R$' : '€'} {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
