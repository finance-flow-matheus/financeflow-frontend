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
        balance: parseFloat(a.balance) || 0,
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
        amount: parseFloat(t.amount) || 0,
        description: t.description || '',
        date: t.date,
        accountId: t.account_id ? t.account_id.toString() : '',
        categoryId: t.category_id ? t.category_id.toString() : undefined,
        incomeSourceId: t.income_source_id ? t.income_source_id.toString() : undefined
      })));

      setExchangeOperations(exchangesData.map((e: any) => ({
        id: e.id.toString(),
        sourceAccountId: (e.from_account_id || e.source_account_id).toString(),
        sourceAmount: parseFloat(e.from_amount || e.source_amount) || 0,
        destinationAccountId: (e.to_account_id || e.destination_account_id).toString(),
        destinationAmount: parseFloat(e.to_amount || e.destination_amount) || 0,
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
      
      const totalBalance = filteredAccounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
      
      const monthlyTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return accIds.includes(t.accountId) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      let monthlyIncome = monthlyTransactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);

      let monthlyExpense = monthlyTransactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);

      // Add exchange operations to income/expense
      const monthlyExchanges = exchangeOperations.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      monthlyExchanges.forEach(e => {
        // If this account is the source (money leaving), count as expense
        if (accIds.includes(e.sourceAccountId)) {
          monthlyExpense += e.sourceAmount || 0;
        }
        // If this account is the destination (money entering), count as income
        if (accIds.includes(e.destinationAccountId)) {
          monthlyIncome += e.destinationAmount || 0;
        }
      });

      return { 
        totalBalance: totalBalance || 0, 
        monthlyIncome: monthlyIncome || 0, 
        monthlyExpense: monthlyExpense || 0 
      };
    };

    return {
      brl: calculateStats(a => a.currency === Currency.BRL && !a.isInvestment),
      eur: calculateStats(a => a.currency === Currency.EUR && !a.isInvestment),
      investment: calculateStats(a => !!a.isInvestment)
    };
  }, [accounts, transactions, exchangeOperations]);

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
          accountId: parseInt(t.accountId),
          categoryId: t.categoryId ? parseInt(t.categoryId) : null,
          incomeSourceId: t.incomeSourceId ? parseInt(t.incomeSourceId) : null
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
          accountId: parseInt(t.accountId),
          categoryId: t.categoryId ? parseInt(t.categoryId) : null,
          incomeSourceId: t.incomeSourceId ? parseInt(t.incomeSourceId) : null
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
      // Get account details to determine currencies
      const fromAccount = accounts.find(a => a.id === op.sourceAccountId);
      const toAccount = accounts.find(a => a.id === op.destinationAccountId);
      
      if (!fromAccount || !toAccount) {
        console.error('Accounts not found');
        return;
      }

      // Calculate exchange rate
      const exchangeRate = op.destinationAmount / op.sourceAmount;

      const response = await fetch(`${API_URL}/exchanges`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fromAccountId: op.sourceAccountId,
          toAccountId: op.destinationAccountId,
          fromAmount: op.sourceAmount,
          toAmount: op.destinationAmount,
          fromCurrency: fromAccount.currency,
          toCurrency: toAccount.currency,
          exchangeRate: exchangeRate,
          date: op.date
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error from server:', error);
        alert('Erro ao registrar operação: ' + (error.error || 'Erro desconhecido'));
        return;
      }
      
      await fetchData();
    } catch (error) {
      console.error('Error registering exchange:', error);
      alert('Erro ao registrar operação de câmbio/transferência');
    }
  };

  const updateAccount = async (id: string, acc: Partial<Account>) => {
    try {
      await fetch(`${API_URL}/accounts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: acc.name,
          currency: acc.currency,
          type: acc.isInvestment ? 'investment' : 'checking'
        })
      });
      await fetchData();
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const updateCategory = async (id: string, cat: Partial<Category>) => {
    try {
      await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: cat.name,
          type: cat.type === TransactionType.INCOME ? 'income' : 'expense',
          color: '#6366f1'
        })
      });
      await fetchData();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const updateIncomeSource = async (id: string, source: Partial<IncomeSource>) => {
    try {
      await fetch(`${API_URL}/income-sources/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: source.name,
          description: ''
        })
      });
      await fetchData();
    } catch (error) {
      console.error('Error updating income source:', error);
    }
  };

  const updateExchange = async (id: string, op: Omit<ExchangeOperation, 'id'>) => {
    try {
      const fromAccount = accounts.find(a => a.id === op.sourceAccountId);
      const toAccount = accounts.find(a => a.id === op.destinationAccountId);
      
      if (!fromAccount || !toAccount) {
        console.error('Accounts not found');
        return;
      }

      const exchangeRate = op.destinationAmount / op.sourceAmount;

      const response = await fetch(`${API_URL}/exchanges/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fromAccountId: op.sourceAccountId,
          toAccountId: op.destinationAccountId,
          fromAmount: op.sourceAmount,
          toAmount: op.destinationAmount,
          fromCurrency: fromAccount.currency,
          toCurrency: toAccount.currency,
          exchangeRate: exchangeRate,
          date: op.date
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error from server:', error);
        alert('Erro ao atualizar operação: ' + (error.error || 'Erro desconhecido'));
        return;
      }
      
      await fetchData();
    } catch (error) {
      console.error('Error updating exchange:', error);
      alert('Erro ao atualizar operação de câmbio/transferência');
    }
  };

  const deleteExchange = async (id: string) => {
    try {
      await fetch(`${API_URL}/exchanges/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await fetchData();
    } catch (error) {
      console.error('Error deleting exchange:', error);
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
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    registerExchange,
    updateExchange,
    deleteExchange
  };
};
