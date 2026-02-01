import React, { useState, useEffect } from 'react';
import { FinancialMetrics, FinancialGoal, Budget, CategoryBreakdown } from '../types';

interface AnalyticsDashboardProps {
  token: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ token }) => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'BRL' | 'EUR'>('BRL');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchMetrics(),
        fetchGoals(),
        fetchBudgets(),
        fetchCategoryBreakdown()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/metrics/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/goals`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/budgets/status?month=${currentMonth}&year=${currentYear}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
    }
  };

  const fetchCategoryBreakdown = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/category-breakdown?month=${currentMonth}&year=${currentYear}&type=expense`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setCategoryBreakdown(data);
      }
    } catch (error) {
      console.error('Erro ao buscar breakdown:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando análises...</div>
      </div>
    );
  }

  const currencySymbol = selectedCurrency === 'BRL' ? 'R$' : '€';
  const currencyMetrics = metrics?.byCurrency?.[selectedCurrency] || {
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    debtRatio: 0
  };

  // Calcular insights
  const totalGoals = goals.filter(g => g.currency === selectedCurrency).length;
  const completedGoals = goals.filter(g => g.currency === selectedCurrency && g.status === 'completed').length;
  const goalsCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.limit_amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const savingsRate = parseFloat(metrics?.monthly?.savingsRate || '0');
  const emergencyMonths = parseFloat(metrics?.emergencyFund?.months || '0');

  // Insights inteligentes
  const insights = [];
  
  if (savingsRate < 10) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Taxa de Poupança Baixa',
      message: `Sua taxa de poupança está em ${savingsRate.toFixed(1)}%. Recomendamos pelo menos 20% para construir patrimônio.`
    });
  } else if (savingsRate >= 20) {
    insights.push({
      type: 'success',
      icon: '🎉',
      title: 'Excelente Poupança!',
      message: `Parabéns! Você está poupando ${savingsRate.toFixed(1)}% da sua renda. Continue assim!`
    });
  }

  if (emergencyMonths < 3) {
    insights.push({
      type: 'danger',
      icon: '🚨',
      title: 'Reserva de Emergência Crítica',
      message: `Você tem apenas ${emergencyMonths} meses de reserva. O ideal é ter 6-12 meses.`
    });
  } else if (emergencyMonths >= 6) {
    insights.push({
      type: 'success',
      icon: '✅',
      title: 'Reserva de Emergência Saudável',
      message: `Sua reserva cobre ${emergencyMonths} meses. Você está protegido!`
    });
  }

  if (budgetUtilization > 90) {
    insights.push({
      type: 'warning',
      icon: '📊',
      title: 'Orçamento Quase Esgotado',
      message: `Você já gastou ${budgetUtilization.toFixed(0)}% do seu orçamento mensal. Cuidado!`
    });
  }

  if (currencyMetrics.debtRatio > 40) {
    insights.push({
      type: 'danger',
      icon: '💳',
      title: 'Endividamento Alto',
      message: `Seu índice de endividamento está em ${currencyMetrics.debtRatio.toFixed(1)}%. Priorize pagar dívidas.`
    });
  }

  if (goalsCompletionRate === 100 && totalGoals > 0) {
    insights.push({
      type: 'success',
      icon: '🏆',
      title: 'Todas as Metas Concluídas!',
      message: `Parabéns! Você atingiu todas as suas ${totalGoals} metas financeiras!`
    });
  }

  return (
    <div className="space-y-6">
      {/* Header com seletor de moeda */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Dashboard Analítico</h2>
          <p className="text-gray-500">Visão completa da sua saúde financeira</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCurrency('BRL')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCurrency === 'BRL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🇧🇷 BRL
          </button>
          <button
            onClick={() => setSelectedCurrency('EUR')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCurrency === 'EUR'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🇪🇺 EUR
          </button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Patrimônio Líquido</div>
          <div className="text-3xl font-bold">
            {currencySymbol} {currencyMetrics.netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs opacity-75 mt-2">
            {currencyMetrics.netWorth >= 0 ? '↗️ Positivo' : '↘️ Negativo'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Taxa de Poupança</div>
          <div className="text-3xl font-bold">{savingsRate.toFixed(1)}%</div>
          <div className="text-xs opacity-75 mt-2">
            {savingsRate >= 20 ? '✅ Excelente' : savingsRate >= 10 ? '⚠️ Bom' : '🚨 Baixo'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Metas Concluídas</div>
          <div className="text-3xl font-bold">
            {completedGoals}/{totalGoals}
          </div>
          <div className="text-xs opacity-75 mt-2">
            {goalsCompletionRate.toFixed(0)}% de sucesso
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Reserva de Emergência</div>
          <div className="text-3xl font-bold">{emergencyMonths} meses</div>
          <div className="text-sm opacity-90 mt-1">
            {selectedCurrency === 'EUR' ? '€' : 'R$'} {(metrics?.emergencyFund?.byCurrency?.[selectedCurrency] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs opacity-75 mt-2">
            {emergencyMonths >= 6 ? '✅ Seguro' : emergencyMonths >= 3 ? '⚠️ Moderado' : '🚨 Crítico'}
          </div>
        </div>
      </div>

      {/* Insights Inteligentes */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Insights Inteligentes</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'success'
                    ? 'bg-green-50 border-green-500'
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{insight.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{insight.message}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos de Metas */}
      {goals.filter(g => g.currency === selectedCurrency).length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Progresso das Metas</h3>
          <div className="space-y-4">
            {goals
              .filter(g => g.currency === selectedCurrency)
              .slice(0, 5)
              .map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">{goal.name}</span>
                      <span className="text-gray-600">
                        {currencySymbol} {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /{' '}
                        {currencySymbol} {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          progress >= 100
                            ? 'bg-green-600'
                            : progress >= 75
                            ? 'bg-blue-600'
                            : progress >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">{progress.toFixed(1)}%</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Orçamento vs Realizado */}
      {budgets.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Orçamento Mensal</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Total Gasto / Orçado</span>
              <span className="font-bold">
                R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R${' '}
                {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  budgetUtilization >= 100
                    ? 'bg-red-600'
                    : budgetUtilization >= 80
                    ? 'bg-orange-500'
                    : budgetUtilization >= 60
                    ? 'bg-yellow-500'
                    : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(100, budgetUtilization)}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-600 mt-1">{budgetUtilization.toFixed(0)}% utilizado</div>
          </div>
          <div className="space-y-3">
            {budgets.slice(0, 5).map((budget) => (
              <div key={budget.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: budget.category_color || '#6B7280' }}
                  ></div>
                  <span className="text-gray-700">{budget.category_name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    R$ {(budget.spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R${' '}
                    {parseFloat(budget.limit_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`font-semibold ${
                      (budget.percentage || 0) >= 100
                        ? 'text-red-600'
                        : (budget.percentage || 0) >= 80
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }`}
                  >
                    {(budget.percentage || 0).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribuição de Gastos */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Distribuição de Gastos</h3>
          <div className="space-y-3">
            {categoryBreakdown.slice(0, 6).map((category, index) => {
              const total = categoryBreakdown.reduce((sum, c) => sum + parseFloat(c.total), 0);
              const percentage = (parseFloat(category.total) / total) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || '#6B7280' }}
                      ></div>
                      <span className="font-medium text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-gray-600">
                      R$ {parseFloat(category.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color || '#6B7280'
                      }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💵 Receitas vs Despesas</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Receitas do Mês</span>
              <span className="text-2xl font-bold text-green-600">
                {selectedCurrency === 'BRL' ? 'R$' : '€'} {(metrics?.[selectedCurrency]?.monthly?.income || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Despesas do Mês</span>
              <span className="text-2xl font-bold text-red-600">
                {selectedCurrency === 'BRL' ? 'R$' : '€'} {(metrics?.[selectedCurrency]?.monthly?.expenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Saldo do Mês</span>
                <span
                  className={`text-2xl font-bold ${
                    (metrics?.[selectedCurrency]?.monthly?.balance || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}
                >
                  {selectedCurrency === 'BRL' ? 'R$' : '€'} {(metrics?.[selectedCurrency]?.monthly?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Composição Patrimonial</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Ativos</span>
              <span className="text-xl font-bold text-green-600">
                {currencySymbol} {currencyMetrics.totalAssets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Passivos</span>
              <span className="text-xl font-bold text-red-600">
                {currencySymbol} {currencyMetrics.totalLiabilities.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Patrimônio Líquido</span>
                <span className={`text-xl font-bold ${currencyMetrics.netWorth >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {currencySymbol} {currencyMetrics.netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600 text-center">
              Índice de Endividamento: <span className="font-semibold">{currencyMetrics.debtRatio.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
