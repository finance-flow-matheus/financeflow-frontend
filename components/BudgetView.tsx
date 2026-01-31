import React, { useState, useEffect } from 'react';
import { Budget, Category } from '../types';

interface BudgetViewProps {
  token: string;
}

const BudgetView: React.FC<BudgetViewProps> = ({ token }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    limitAmount: '',
    currency: 'BRL' as 'BRL' | 'EUR',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setCategories(data.filter((c: Category) => c.type === 'EXPENSE' || c.type === 'expense'));
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/budgets/status?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: formData.categoryId,
          month: selectedMonth,
          year: selectedYear,
          limitAmount: parseFloat(formData.limitAmount),
          currency: formData.currency,
        }),
      });
      
      fetchBudgets();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      limitAmount: '',
      currency: 'BRL',
    });
    setShowForm(false);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-orange-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  const getTotalBudget = () => budgets.reduce((sum, b) => sum + parseFloat(b.limit_amount), 0);
  const getTotalSpent = () => budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const getTotalRemaining = () => getTotalBudget() - getTotalSpent();

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">💰 Orçamento Mensal</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? '❌ Cancelar' : '➕ Definir Orçamento'}
        </button>
      </div>

      {/* Seletor de Mês/Ano */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl shadow-md p-6">
          <div className="text-sm text-blue-600 font-medium mb-1">Orçamento Total</div>
          <div className="text-3xl font-bold text-blue-700">
            R$ {getTotalBudget().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl shadow-md p-6">
          <div className="text-sm text-orange-600 font-medium mb-1">Total Gasto</div>
          <div className="text-3xl font-bold text-orange-700">
            R$ {getTotalSpent().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className={`${getTotalRemaining() >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-xl shadow-md p-6`}>
          <div className={`text-sm font-medium mb-1 ${getTotalRemaining() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Restante
          </div>
          <div className={`text-3xl font-bold ${getTotalRemaining() >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            R$ {getTotalRemaining().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Definir Orçamento</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limite *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limitAmount}
                  onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moeda *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'BRL' | 'EUR' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="BRL">🇧🇷 Real (BRL)</option>
                  <option value="EUR">🇪🇺 Euro (EUR)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Salvar Orçamento
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

      {/* Lista de Orçamentos */}
      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = budget.percentage || 0;
          return (
            <div key={budget.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: budget.category_color || '#6B7280' }}
                  ></div>
                  <h3 className="text-lg font-semibold text-gray-800">{budget.category_name}</h3>
                </div>
                <div className={`text-2xl font-bold ${getStatusColor(percentage)}`}>
                  {percentage.toFixed(0)}%
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${getProgressBarColor(percentage)}`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Gasto: </span>
                    <span className="font-semibold text-gray-800">
                      R$ {(budget.spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Limite: </span>
                    <span className="font-semibold text-gray-800">
                      R$ {parseFloat(budget.limit_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Restante:</span>
                  <span className={`font-bold ${(budget.remaining || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {(budget.remaining || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && !showForm && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum orçamento definido</h3>
          <p className="text-gray-500 mb-4">
            Defina orçamentos para {months[selectedMonth - 1]} de {selectedYear}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Definir Primeiro Orçamento
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetView;
