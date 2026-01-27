
export enum Currency {
  BRL = 'BRL',
  EUR = 'EUR'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Account {
  id: string;
  name: string;
  currency: Currency;
  balance: number;
  isInvestment?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface IncomeSource {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  incomeSourceId?: string;
  isFixed?: boolean;
}

export interface ExchangeOperation {
  id: string;
  sourceAccountId: string;
  sourceAmount: number;
  destinationAccountId: string;
  destinationAmount: number;
  date: string;
}

export interface DashboardStats {
  brl: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
  };
  eur: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
  };
  investment: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
  };
}
