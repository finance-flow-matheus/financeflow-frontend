import React, { useState, useEffect } from 'react';
import { FinancialMetrics } from '../types';

interface MetricsViewProps {
  token: string;
}

const MetricsView: React.FC<MetricsViewProps> = ({ token }) => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/metrics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando métricas...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Nenhuma métrica disponível</div>
      </div>
    );
  }

  const getStatusColor = (value: number, threshold: number, inverse: boolean = false) => {
    if (inverse) {
      return value < threshold ? 'text-green-600' : 'text-red-600';
    }
    return value >= threshold ? 'text-green-600' : value >= threshold * 0.5 ? 'text-yellow-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">📊 Indicadores Financeiros</h2>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Métricas Mensais */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Resumo Mensal</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Receitas</div>
            <div className="text-2xl font-bold text-green-700">
              R$ {metrics.monthly.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium">Despesas</div>
            <div className="text-2xl font-bold text-red-700">
              R$ {metrics.monthly.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className={`${metrics.monthly.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg p-4`}>
            <div className={`text-sm font-medium ${metrics.monthly.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              Saldo
            </div>
            <div className={`text-2xl font-bold ${metrics.monthly.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              R$ {metrics.monthly.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Taxa de Poupança</div>
            <div className={`text-2xl font-bold ${getStatusColor(parseFloat(metrics.monthly.savingsRate), 20)}`}>
              {metrics.monthly.savingsRate}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Meta: ≥ 20%</div>
          </div>
        </div>
      </div>

      {/* Patrimônio Líquido por Moeda */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Patrimônio Líquido</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(metrics.byCurrency).map(([currency, data]) => (
            <div key={currency} className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-3">{currency}</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Ativos</span>
                  <span className="font-semibold text-green-600">
                    {currency === 'BRL' ? 'R$' : '€'} {data.totalAssets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Passivos</span>
                  <span className="font-semibold text-red-600">
                    {currency === 'BRL' ? 'R$' : '€'} {data.totalLiabilities.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Patrimônio Líquido</span>
                    <span className={`text-lg font-bold ${data.netWorth >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {currency === 'BRL' ? 'R$' : '€'} {data.netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Índice de Endividamento</span>
                  <span className={`font-semibold ${getStatusColor(data.debtRatio, 40, true)}`}>
                    {data.debtRatio.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reserva de Emergência */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🏦 Reserva de Emergência</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Meses de Cobertura</div>
            <div className={`text-4xl font-bold ${getStatusColor(parseFloat(metrics.emergencyFund.months), 6)}`}>
              {metrics.emergencyFund.months} meses
            </div>
            <div className="text-xs text-gray-500 mt-2">Meta: 6-12 meses</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Valor Disponível</div>
            <div className="text-4xl font-bold text-blue-600">
              R$ {metrics.emergencyFund.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        
        {/* Barra de Progresso */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{Math.min(100, (parseFloat(metrics.emergencyFund.months) / 6) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                parseFloat(metrics.emergencyFund.months) >= 6
                  ? 'bg-green-600'
                  : parseFloat(metrics.emergencyFund.months) >= 3
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (parseFloat(metrics.emergencyFund.months) / 6) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Explicações dos Indicadores */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">ℹ️ Sobre os Indicadores</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Taxa de Poupança:</strong> Percentual da renda que você está economizando. Meta ideal: ≥ 20%</p>
          <p><strong>Patrimônio Líquido:</strong> Total de ativos menos total de passivos. Quanto maior, melhor!</p>
          <p><strong>Índice de Endividamento:</strong> Percentual do patrimônio comprometido com dívidas. Meta: {'<'} 40%</p>
          <p><strong>Reserva de Emergência:</strong> Quantos meses você consegue viver sem renda. Meta: 6-12 meses</p>
        </div>
      </div>
    </div>
  );
};

export default MetricsView;
