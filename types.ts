
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
  color?: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  description?: string;
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
  isRecurring?: boolean;
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

// ========== NOVOS TIPOS ==========

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  deadline?: string;
  category?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'bonds' | 'real_estate' | 'crypto' | 'funds' | 'other';
  amount: number;
  currentValue: number;
  currency: Currency;
  purchaseDate: string;
  broker?: string;
  notes?: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'property' | 'vehicle' | 'equipment' | 'other';
  value: number;
  currency: Currency;
  purchaseDate?: string;
  description?: string;
  createdAt: string;
}

export interface Liability {
  id: string;
  name: string;
  type: 'mortgage' | 'loan' | 'credit_card' | 'financing' | 'other';
  amount: number;
  interestRate?: number;
  dueDate?: string;
  monthlyPayment?: number;
  currency: Currency;
  description?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName?: string;
  categoryColor?: string;
  month: number;
  year: number;
  limitAmount: number;
  currency: Currency;
  spent?: number;
  remaining?: number;
  percentage?: number;
}

export interface RecurringTransaction {
  id: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
}

export interface Achievement {
  id: string;
  achievementType: string;
  unlockedAt: string;
  streakCount: number;
}

export interface FinancialMetrics {
  byCurrency: {
    [key: string]: {
      totalAssets: number;
      totalLiabilities: number;
      netWorth: number;
      debtRatio: number;
    };
  };
  monthly: {
    income: number;
    expenses: number;
    balance: number;
    savingsRate: string;
  };
  emergencyFund: {
    months: string;
    amount: number;
  };
}

export interface CategoryBreakdown {
  name: string;
  color: string;
  total: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  type: TransactionType;
  total: number;
}
