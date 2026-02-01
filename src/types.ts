
export enum Currency {
  BRL = 'BRL',
  EUR = 'EUR'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
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

export interface Budget {
  id: string;
  entityId: string; // ID da Categoria ou Fonte
  entityType: 'category' | 'source';
  amount: number;
  currency: Currency;
}

export type GoalCategory = 'travel' | 'house' | 'emergency' | 'car' | 'education' | 'other';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  deadline?: string;
  accountId: string;
  category: GoalCategory;
}

export type LiabilityCategory = 'loan' | 'credit_card' | 'mortgage' | 'other';

export interface Liability {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  category: LiabilityCategory;
}

export type AssetCategory = 'property' | 'vehicle' | 'jewelry' | 'equipment' | 'other';

export interface Asset {
  id: string;
  name: string;
  value: number;
  currency: Currency;
  category: AssetCategory;
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
