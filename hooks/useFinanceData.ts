import { useState, useEffect, useMemo } from 'react';
import { 
  Account, 
  Category, 
  IncomeSource, 
  Transaction, 
  ExchangeOperation, 
  Currency, 
  TransactionType,
  DashboardStats 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('ff_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const useFinanceData = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeOperations, setExchangeOperations] = useState<ExchangeOperation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      const [accountsRes, categoriesRes, sourcesRes, transactionsRes, exchangesRes] = await Promise.all([
        fetch(`${API_URL}/accounts`, { headers }),
        fetch(`${API_URL}/categories`, { headers }),
        fetch(`${API_URL}/income-sources`, { headers }),
        fetch(`${API_URL}/transactions`, { headers }),
        fetch(`${API_URL}/exchanges`, { headers })
      ]);

      const accountsData = await accountsRes.json();
      const categoriesData = await categoriesRes.json();
      const sourcesData = await sourcesRes.json();
      const transactionsData = await transactionsRes.json();
      const exchangesData = await exchangesRes.json();

      // Transform API data to frontend format
      setAccounts(accountsData.map((a: any) => ({
        id: a.id.toString(),
        name: a.name,
        currency: a.currency as Currency,
        balance: a.balance,
        isInvestment: false
      })));

      setCategories(categoriesData.map((c: any) => ({
        id: c.id.toString(),
        name: c.name,
        type: c.type === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE
      })));

      setIncomeSources(sourcesData.map((s: any) => ({
        id: s.id.toString(),
        name: s.name
      })));

      setTransactions(transactionsData.map((t: any) => ({
        id: t.id.toString(),
        type: t.type === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE,
        amount: t.amount,
        description: t.description || '',
        date: t.date,
        accountId: t.account_id.toString(),
        categoryId: t.category_id?.toString(),
        incomeSourceId: t.income_source_id?.toString()
      })));

      setExchangeOperations(exchangesData.map((e: any) => ({
        id: e.id.toString(),
        sourceAccountId: e.source_account_id.toString(),
        sourceAmount: e.source_amount,
        destinationAccountId: e.destination_account_id.toString(),
        destinationAmount: e.destination_amount,
        date: e.date
      })));

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Derived Statistics
  const stats = useMemo<DashboardStats>(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const calculateStats = (filterFn: (a: Account) => boolean) => {
      const filteredAccounts = accounts.filter(filterFn);
      const accIds = filteredAccounts.map(a => a.id);
      
      const totalBalance = filteredAccounts.reduce((acc, curr) => acc + curr.balance, 0);
      
      const monthlyTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return accIds.includes(t.accountId) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((acc, curr) => acc + curr.amount, 0);

      const monthlyExpense = monthlyTransactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((acc, curr) => acc + curr.amount, 0);

      return { totalBalance, monthlyIncome, monthlyExpense };
    };

    return {
      brl: calculateStats(a => a.currency === Currency.BRL && !a.isInvestment),
      eur: calculateStats(a => a.currency === Currency.EUR && !a.isInvestment),
      investment: calculateStats(a => !!a.isInvestment)
    };
  }, [accounts, transactions]);

  // Actions
  const addAccount = async (acc: Omit<Account, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/accounts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: acc.name,
          currency: acc.currency,
          balance: acc.balance
        })
      });
      const data = await response.json();
      await fetchData();
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await fetch(`${API_URL}/accounts/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await fetchData();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const addCategory = async (cat: Omit<Category, 'id'>) => {
    try {
      await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: cat.name,
          type: cat.type === TransactionType.INCOME ? 'income' : 'expense',
          color: '#3b82f6'
        })
      });
      await fetchData();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await fetch(`${API_URL}/categories/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const addIncomeSource = async (src: Omit<IncomeSource, 'id'>) => {
    try {
      await fetch(`${API_URL}/income-sources`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: src.name,
          description: ''
        })
      });
      await fetchData();
    } catch (error) {
      console.error('Error adding income source:', error);
    }
  };

  const deleteIncomeSource = async (id: string) => {
    try {
      await fetch(`${API_URL}/income-sources/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await fetchData();
    } catch (error) {
      console.error('Error deleting income source:', error);
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    try {
      await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: t.type === TransactionType.INCOME ? 'income' : 'expense',
          amount: t.amount,
          description: t.description,
          date: t.date,
          account_id: parseInt(t.accountId),
          category_id: t.categoryId ? parseInt(t.categoryId) : null,
          income_source_id: t.incomeSourceId ? parseInt(t.incomeSourceId) : null
        })
      });
      await fetchData();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const updateTransaction = async (id: string, t: Omit<Transaction, 'id'>) => {
    try {
      await fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: t.type === TransactionType.INCOME ? 'income' : 'expense',
          amount: t.amount,
          description: t.description,
          date: t.date,
          account_id: parseInt(t.accountId),
          category_id: t.categoryId ? parseInt(t.categoryId) : null,
          income_source_id: t.incomeSourceId ? parseInt(t.incomeSourceId) : null
        })
      });
      await fetchData();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await fetch(`${API_URL}/transactions/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const registerExchange = async (op: Omit<ExchangeOperation, 'id'>) => {
    try {
      await fetch(`${API_URL}/exchanges`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          source_account_id: parseInt(op.sourceAccountId),
          source_amount: op.sourceAmount,
          destination_account_id: parseInt(op.destinationAccountId),
          destination_amount: op.destinationAmount,
          date: op.date,
          notes: ''
        })
      });
      await fetchData();
    } catch (error) {
      console.error('Error registering exchange:', error);
    }
  };

  return {
    accounts,
    categories,
    incomeSources,
    transactions,
    exchangeOperations,
    stats,
    loading,
    addAccount,
    deleteAccount,
    addCategory,
    deleteCategory,
    addIncomeSource,
    deleteIncomeSource,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    registerExchange
  };
};
