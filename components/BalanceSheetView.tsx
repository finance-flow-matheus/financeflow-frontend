import React, { useState, useEffect } from 'react';
import { Asset, Liability, Currency } from '../types';

interface BalanceSheetViewProps {
  token: string;
}

const BalanceSheetView: React.FC<BalanceSheetViewProps> = ({ token }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Asset | Liability | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    value: '',
    currency: 'BRL',
    purchaseDate: '',
    description: '',
    interestRate: '',
    dueDate: '',
    monthlyPayment: '',
  });

  useEffect(() => {
    fetchAssets();
    fetchLiabilities();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assets`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error('Erro ao buscar ativos:', error);
    }
  };

  const fetchLiabilities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/liabilities`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setLiabilities(data);
    } catch (error) {
      console.error('Erro ao buscar passivos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = activeTab === 'assets' 
      ? `${import.meta.env.VITE_API_URL}/api/assets`
      : `${import.meta.env.VITE_API_URL}/api/liabilities`;

    const payload = activeTab === 'assets'
      ? {
          name: formData.name,
          type: formData.type,
          value: parseFloat(formData.value),
          currency: formData.currency,
          purchaseDate: formData.purchaseDate || null,
          description: formData.description || null,
        }
      : {
          name: formData.name,
          type: formData.type,
          amount: parseFloat(formData.value),
          currency: formData.currency,
          interestRate: formData.interestRate ? parseFloat(formData.interestRate) : null,
          dueDate: formData.dueDate || null,
          monthlyPayment: formData.monthlyPayment ? parseFloat(formData.monthlyPayment) : null,
          description: formData.description || null,
        };

    try {
      if (editingItem) {
        await fetch(`${url}/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      
      fetchAssets();
      fetchLiabilities();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleDelete = async (id: string, type: 'assets' | 'liabilities') => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return;
    
    const url = type === 'assets'
      ? `${import.meta.env.VITE_API_URL}/api/assets/${id}`
      : `${import.meta.env.VITE_API_URL}/api/liabilities/${id}`;

    try {
      await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchAssets();
      fetchLiabilities();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleEdit = (item: Asset | Liability, type: 'assets' | 'liabilities') => {
    setActiveTab(type);
    setEditingItem(item);
    
    if (type === 'assets') {
      const asset = item as Asset;
      setFormData({
        name: asset.name,
        type: asset.type,
        value: asset.value.toString(),
        currency: asset.currency,
        purchaseDate: asset.purchaseDate?.split('T')[0] || '',
        description: asset.description || '',
        interestRate: '',
        dueDate: '',
        monthlyPayment: '',
      });
    } else {
      const liability = item as Liability;
      setFormData({
        name: liability.name,
        type: liability.type,
        value: liability.amount.toString(),
        currency: liability.currency,
        purchaseDate: '',
        description: liability.description || '',
        interestRate: liability.interestRate?.toString() || '',
        dueDate: liability.dueDate?.split('T')[0] || '',
        monthlyPayment: liability.monthlyPayment?.toString() || '',
      });
    }
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      value: '',
      currency: 'BRL',
      purchaseDate: '',
      description: '',
      interestRate: '',
      dueDate: '',
      monthlyPayment: '',
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const getTotalAssets = () => assets.reduce((sum, a) => sum + a.value, 0);
  const getTotalLiabilities = () => liabilities.reduce((sum, l) => sum + l.amount, 0);
  const getNetWorth = () => getTotalAssets() - getTotalLiabilities();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">📋 Balanço Patrimonial</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? '❌ Cancelar' : `➕ Novo ${activeTab === 'assets' ? 'Ativo' : 'Passivo'}`}
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl shadow-md p-6">
          <div className="text-sm text-green-600 font-medium mb-1">Total de Ativos</div>
          <div className="text-3xl font-bold text-green-700">
            R$ {getTotalAssets().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-red-50 rounded-xl shadow-md p-6">
          <div className="text-sm text-red-600 font-medium mb-1">Total de Passivos</div>
          <div className="text-3xl font-bold text-red-700">
            R$ {getTotalLiabilities().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className={`${getNetWorth() >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-xl shadow-md p-6`}>
          <div className={`text-sm font-medium mb-1 ${getNetWorth() >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            Patrimônio Líquido
          </div>
          <div className={`text-3xl font-bold ${getNetWorth() >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            R$ {getNetWorth().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('assets');
            setShowForm(false);
            setEditingItem(null);
          }}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'assets'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          💎 Ativos ({assets.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('liabilities');
            setShowForm(false);
            setEditingItem(null);
          }}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'liabilities'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📊 Passivos ({liabilities.length})
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingItem ? 'Editar' : 'Novo'} {activeTab === 'assets' ? 'Ativo' : 'Passivo'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione...</option>
                  {activeTab === 'assets' ? (
                    <>
                      <option value="property">Imóvel</option>
                      <option value="vehicle">Veículo</option>
                      <option value="equipment">Equipamento</option>
                      <option value="other">Outro</option>
                    </>
                  ) : (
                    <>
                      <option value="mortgage">Hipoteca</option>
                      <option value="loan">Empréstimo</option>
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="financing">Financiamento</option>
                      <option value="other">Outro</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeTab === 'assets' ? 'Valor' : 'Valor da Dívida'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moeda *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="BRL">BRL (R$)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              
              {activeTab === 'assets' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Compra</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxa de Juros (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pagamento Mensal</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthlyPayment}
                      onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingItem ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {activeTab === 'assets' ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{asset.name}</div>
                    {asset.description && <div className="text-xs text-gray-500">{asset.description}</div>}
                  </td>
                  <td className="px-6 py-4 text-gray-700 capitalize">{asset.type.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    {asset.currency === 'BRL' ? 'R$' : '€'} {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleEdit(asset, 'assets')} className="text-blue-600 hover:text-blue-700 mr-3">✏️</button>
                    <button onClick={() => handleDelete(asset.id, 'assets')} className="text-red-600 hover:text-red-700">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assets.length === 0 && (
            <div className="text-center py-12 text-gray-500">Nenhum ativo cadastrado</div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Juros</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mensal</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {liabilities.map((liability) => (
                <tr key={liability.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{liability.name}</div>
                    {liability.description && <div className="text-xs text-gray-500">{liability.description}</div>}
                  </td>
                  <td className="px-6 py-4 text-gray-700 capitalize">{liability.type.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-right font-semibold text-red-600">
                    {liability.currency === 'BRL' ? 'R$' : '€'} {liability.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    {liability.interestRate ? `${liability.interestRate}%` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    {liability.monthlyPayment 
                      ? `${liability.currency === 'BRL' ? 'R$' : '€'} ${liability.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleEdit(liability, 'liabilities')} className="text-blue-600 hover:text-blue-700 mr-3">✏️</button>
                    <button onClick={() => handleDelete(liability.id, 'liabilities')} className="text-red-600 hover:text-red-700">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {liabilities.length === 0 && (
            <div className="text-center py-12 text-gray-500">Nenhum passivo cadastrado</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceSheetView;
