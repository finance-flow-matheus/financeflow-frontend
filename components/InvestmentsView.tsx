import React, { useState, useEffect } from 'react';
import { Investment, Currency } from '../types';

interface InvestmentsViewProps {
  token: string;
}

const InvestmentsView: React.FC<InvestmentsViewProps> = ({ token }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [allocation, setAllocation] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'stocks',
    amount: '',
    currentValue: '',
    currency: 'BRL',
    purchaseDate: '',
    broker: '',
    notes: '',
  });

  useEffect(() => {
    fetchInvestments();
    fetchAllocation();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/investments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setInvestments(data);
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
    }
  };

  const fetchAllocation = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/investments/allocation`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAllocation(data);
    } catch (error) {
      console.error('Erro ao buscar alocação:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      type: formData.type,
      amount: parseFloat(formData.amount),
      currentValue: parseFloat(formData.currentValue) || parseFloat(formData.amount),
      currency: formData.currency,
      purchaseDate: formData.purchaseDate,
      broker: formData.broker || null,
      notes: formData.notes || null,
    };

    try {
      if (editingInvestment) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/investments/${editingInvestment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${import.meta.env.VITE_API_URL}/api/investments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      
      fetchInvestments();
      fetchAllocation();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este investimento?')) return;
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/investments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchInvestments();
      fetchAllocation();
    } catch (error) {
      console.error('Erro ao deletar investimento:', error);
    }
  };

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      type: investment.type,
      amount: investment.amount.toString(),
      currentValue: investment.currentValue.toString(),
      currency: investment.currency,
      purchaseDate: investment.purchaseDate.split('T')[0],
      broker: investment.broker || '',
      notes: investment.notes || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'stocks',
      amount: '',
      currentValue: '',
      currency: 'BRL',
      purchaseDate: '',
      broker: '',
      notes: '',
    });
    setEditingInvestment(null);
    setShowForm(false);
  };

  const calculateReturn = (investment: Investment) => {
    const returnValue = investment.currentValue - investment.amount;
    const returnPercentage = (returnValue / investment.amount) * 100;
    return { value: returnValue, percentage: returnPercentage };
  };

  const getTotalValue = () => {
    return investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  };

  const getTotalInvested = () => {
    return investments.reduce((sum, inv) => sum + inv.amount, 0);
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      stocks: '📈 Ações',
      bonds: '📊 Títulos',
      real_estate: '🏠 Imóveis',
      crypto: '₿ Criptomoedas',
      funds: '💼 Fundos',
      other: '📦 Outros',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      stocks: 'bg-blue-100 text-blue-700',
      bonds: 'bg-green-100 text-green-700',
      real_estate: 'bg-purple-100 text-purple-700',
      crypto: 'bg-orange-100 text-orange-700',
      funds: 'bg-indigo-100 text-indigo-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const totalValue = getTotalValue();
  const totalInvested = getTotalInvested();
  const totalReturn = totalValue - totalInvested;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">💼 Carteira de Investimentos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? '❌ Cancelar' : '➕ Novo Investimento'}
        </button>
      </div>

      {/* Resumo da Carteira */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Valor Total</div>
          <div className="text-2xl font-bold text-blue-600">
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Total Investido</div>
          <div className="text-2xl font-bold text-gray-700">
            R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Retorno (R$)</div>
          <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalReturn >= 0 ? '+' : ''}R$ {totalReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Retorno (%)</div>
          <div className={`text-2xl font-bold ${totalReturnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalReturnPercentage >= 0 ? '+' : ''}{totalReturnPercentage.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Alocação de Ativos */}
      {allocation.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Alocação de Ativos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {allocation.map((item) => {
              const percentage = totalValue > 0 ? (parseFloat(item.total) / totalValue) * 100 : 0;
              return (
                <div key={item.type} className="text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(item.type)}`}>
                    {getTypeLabel(item.type)}
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mt-2">{percentage.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">
                    R$ {parseFloat(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}
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
                  placeholder="Ex: Ações PETR4"
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
                  <option value="stocks">Ações</option>
                  <option value="bonds">Títulos</option>
                  <option value="real_estate">Imóveis</option>
                  <option value="crypto">Criptomoedas</option>
                  <option value="funds">Fundos</option>
                  <option value="other">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Investido *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Atual</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Compra *</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corretora</label>
                <input
                  type="text"
                  value={formData.broker}
                  onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: XP Investimentos"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Notas adicionais sobre o investimento"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingInvestment ? 'Atualizar' : 'Adicionar'}
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

      {/* Lista de Investimentos */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Investido</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Atual</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Retorno</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {investments.map((investment) => {
                const returns = calculateReturn(investment);
                return (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{investment.name}</div>
                      {investment.broker && (
                        <div className="text-xs text-gray-500">{investment.broker}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeColor(investment.type)}`}>
                        {getTypeLabel(investment.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {investment.currency === 'BRL' ? 'R$' : '€'} {investment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {investment.currency === 'BRL' ? 'R$' : '€'} {investment.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${returns.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {returns.value >= 0 ? '+' : ''}{investment.currency === 'BRL' ? 'R$' : '€'} {returns.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${returns.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {returns.percentage >= 0 ? '+' : ''}{returns.percentage.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEdit(investment)}
                        className="text-blue-600 hover:text-blue-700 mr-3"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(investment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {investments.length === 0 && !showForm && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum investimento cadastrado</h3>
          <p className="text-gray-500 mb-4">Comece a construir sua carteira de investimentos!</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Adicionar Primeiro Investimento
          </button>
        </div>
      )}
    </div>
  );
};

export default InvestmentsView;
