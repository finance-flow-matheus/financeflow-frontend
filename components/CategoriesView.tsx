
import React, { useState } from 'react';
import { Plus, Trash2, Tag, Briefcase } from 'lucide-react';
import { TransactionType } from '../types';

export const CategoriesView: React.FC<{ data: any }> = ({ data }) => {
  const { categories, incomeSources, addCategory, deleteCategory, addIncomeSource, deleteIncomeSource } = data;
  
  const [newCat, setNewCat] = useState({ name: '', type: TransactionType.EXPENSE });
  const [newSrc, setNewSrc] = useState({ name: '' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Categories */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Tag className="w-6 h-6 text-indigo-500" />
          Categorias
        </h3>
        
        <form 
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            if (newCat.name) addCategory(newCat);
            setNewCat({ name: '', type: TransactionType.EXPENSE });
          }}
        >
          <input 
            type="text" required placeholder="Nova categoria..."
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            value={newCat.name}
            onChange={e => setNewCat({ ...newCat, name: e.target.value })}
          />
          <select 
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            value={newCat.type}
            onChange={e => setNewCat({ ...newCat, type: e.target.value as TransactionType })}
          >
            <option value={TransactionType.EXPENSE}>Despesa</option>
            <option value={TransactionType.INCOME}>Receita</option>
          </select>
          <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
            <Plus className="w-6 h-6" />
          </button>
        </form>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100">
          {categories.map((c: any) => (
            <div key={c.id} className="p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${c.type === TransactionType.INCOME ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="font-medium text-slate-700">{c.name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.type}</span>
              </div>
              <button onClick={() => deleteCategory(c.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Income Sources */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-500" />
          Fontes de Renda
        </h3>

        <form 
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            if (newSrc.name) addIncomeSource(newSrc);
            setNewSrc({ name: '' });
          }}
        >
          <input 
            type="text" required placeholder="Nova fonte (ex: Empresa A)..."
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            value={newSrc.name}
            onChange={e => setNewSrc({ name: e.target.value })}
          />
          <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
            <Plus className="w-6 h-6" />
          </button>
        </form>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100">
          {incomeSources.map((s: any) => (
            <div key={s.id} className="p-4 flex items-center justify-between group">
              <span className="font-medium text-slate-700">{s.name}</span>
              <button onClick={() => deleteIncomeSource(s.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
