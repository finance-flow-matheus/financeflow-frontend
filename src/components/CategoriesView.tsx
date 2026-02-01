
import React, { useState } from 'react';
import { Plus, Trash2, Tag, Briefcase, Edit2, Check, X } from 'lucide-react';
import { TransactionType, Category, IncomeSource } from '../types';

export const CategoriesView: React.FC<{ data: any }> = ({ data }) => {
  const { categories, incomeSources, addCategory, updateCategory, deleteCategory, addIncomeSource, updateIncomeSource, deleteIncomeSource } = data;
  
  const [newCat, setNewCat] = useState({ name: '', type: TransactionType.EXPENSE });
  const [newSrc, setNewSrc] = useState({ name: '' });
  
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatFormData, setEditCatFormData] = useState<Category | null>(null);

  const [editingSrcId, setEditingSrcId] = useState<string | null>(null);
  const [editSrcFormData, setEditSrcFormData] = useState<IncomeSource | null>(null);

  const startEditCat = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditCatFormData({ ...cat });
  };

  const startEditSrc = (src: IncomeSource) => {
    setEditingSrcId(src.id);
    setEditSrcFormData({ ...src });
  };

  const handleUpdateCat = () => {
    if (editingCatId && editCatFormData) {
      updateCategory(editingCatId, editCatFormData);
      setEditingCatId(null);
      setEditCatFormData(null);
    }
  };

  const handleUpdateSrc = () => {
    if (editingSrcId && editSrcFormData) {
      updateIncomeSource(editingSrcId, editSrcFormData);
      setEditingSrcId(null);
      setEditSrcFormData(null);
    }
  };

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

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {categories.map((c: Category) => (
            <div key={c.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
              {editingCatId === c.id && editCatFormData ? (
                <div className="flex gap-2 w-full">
                  <input 
                    className="flex-1 px-3 py-1 border rounded-lg text-sm"
                    value={editCatFormData.name}
                    onChange={e => setEditCatFormData({...editCatFormData, name: e.target.value})}
                  />
                  <select 
                    className="px-3 py-1 border rounded-lg text-sm"
                    value={editCatFormData.type}
                    onChange={e => setEditCatFormData({...editCatFormData, type: e.target.value as TransactionType})}
                  >
                    <option value={TransactionType.EXPENSE}>EXP</option>
                    <option value={TransactionType.INCOME}>INC</option>
                  </select>
                  <button onClick={handleUpdateCat} className="text-emerald-500"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingCatId(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${c.type === TransactionType.INCOME ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="font-medium text-slate-700">{c.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEditCat(c)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteCategory(c.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
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

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {incomeSources.map((s: IncomeSource) => (
            <div key={s.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
              {editingSrcId === s.id && editSrcFormData ? (
                <div className="flex gap-2 w-full">
                  <input 
                    className="flex-1 px-3 py-1 border rounded-lg text-sm"
                    value={editSrcFormData.name}
                    onChange={e => setEditSrcFormData({...editSrcFormData, name: e.target.value})}
                  />
                  <button onClick={handleUpdateSrc} className="text-emerald-500"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingSrcId(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEditSrc(s)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteIncomeSource(s.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
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
