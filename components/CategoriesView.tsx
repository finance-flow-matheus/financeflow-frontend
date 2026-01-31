
import React, { useState } from 'react';
import { Plus, Trash2, Tag, Briefcase, Edit2, Check, X } from 'lucide-react';
import { TransactionType } from '../types';

export const CategoriesView: React.FC<{ data: any }> = ({ data }) => {
  const { categories, incomeSources, addCategory, updateCategory, deleteCategory, addIncomeSource, updateIncomeSource, deleteIncomeSource } = data;
  
  const [newCat, setNewCat] = useState({ name: '', type: TransactionType.EXPENSE });
  const [newSrc, setNewSrc] = useState({ name: '' });
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingCatData, setEditingCatData] = useState({ name: '', type: TransactionType.EXPENSE });
  const [editingSrc, setEditingSrc] = useState<string | null>(null);
  const [editingSrcData, setEditingSrcData] = useState({ name: '' });

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
              {editingCat === c.id ? (
                <>
                  <div className="flex items-center gap-2 flex-1">
                    <input 
                      type="text" 
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editingCatData.name}
                      onChange={e => setEditingCatData({ ...editingCatData, name: e.target.value })}
                    />
                    <select 
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editingCatData.type}
                      onChange={e => setEditingCatData({ ...editingCatData, type: e.target.value as TransactionType })}
                    >
                      <option value={TransactionType.EXPENSE}>Despesa</option>
                      <option value={TransactionType.INCOME}>Receita</option>
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        updateCategory(c.id, editingCatData);
                        setEditingCat(null);
                      }}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEditingCat(null)}
                      className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${c.type === TransactionType.INCOME ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="font-medium text-slate-700">{c.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.type}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => {
                        setEditingCat(c.id);
                        setEditingCatData({ name: c.name, type: c.type });
                      }}
                      className="p-2 text-slate-300 hover:text-indigo-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteCategory(c.id)} className="p-2 text-slate-300 hover:text-rose-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
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
              {editingSrc === s.id ? (
                <>
                  <input 
                    type="text" 
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editingSrcData.name}
                    onChange={e => setEditingSrcData({ name: e.target.value })}
                  />
                  <div className="flex gap-1 ml-2">
                    <button 
                      onClick={() => {
                        updateIncomeSource(s.id, editingSrcData);
                        setEditingSrc(null);
                      }}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEditingSrc(null)}
                      className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => {
                        setEditingSrc(s.id);
                        setEditingSrcData({ name: s.name });
                      }}
                      className="p-2 text-slate-300 hover:text-indigo-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteIncomeSource(s.id)} className="p-2 text-slate-300 hover:text-rose-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
