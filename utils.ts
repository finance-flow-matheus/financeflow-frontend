// Formatar valores monetários no padrão brasileiro
export const formatCurrency = (value: number, currency: 'BRL' | 'EUR' = 'BRL'): string => {
  const symbol = currency === 'BRL' ? 'R$' : '€';
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  
  return `${symbol} ${formatted}`;
};

// Formatar número sem símbolo de moeda
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
