
import { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api.ts';
import { 
  Account, Category, IncomeSource, Transaction, ExchangeOperation, 
  Currency, TransactionType, DashboardStats, Budget, Goal, Liability, Asset 
} from '../types.ts';

export const useFinanceData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [exchangeOperations, setExchangeOperations] = useState<ExchangeOperation[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [accs, cats, srcs, trans, bdgts, gls, exch, assts, liabs] = await Promise.all([
        api.accounts.getAll(),
        api.entities.getCategories(),
        api.entities.getSources(),
        api.transactions.getAll(),
        api.budgets.getAll().catch(() => []), 
        api.goals.getAll().catch(() => []),
        api.exchange.getAll().catch(() => []),
        api.assets.getAll().catch(() => []),
        api.liabilities.getAll().catch(() => [])
      ]);
      
      setAccounts(accs);
      setCategories(cats);
      setIncomeSources(srcs);
      setTransactions(trans);
      setBudgets(bdgts);
      setGoals(gls);
      setExchangeOperations(exch);
      setAssets(assts);
      setLiabilities(liabs);

    } catch (err: any) {
      setError('Falha ao conectar com o servidor no Railway. Verifique sua conexão.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    if (token) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [loadData]);

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

  // Accounts Mutations
  const addAccount = async (acc: Omit<Account, 'id'>) => {
    await api.accounts.create(acc);
    await loadData();
  };

  const updateAccount = async (id: string, updated: Partial<Account>) => {
    await api.accounts.update(id, updated);
    await loadData();
  };

  const deleteAccount = async (id: string) => {
    await api.accounts.delete(id);
    await loadData();
  };

  // Transactions Mutations
  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    await api.transactions.create(t);
    await loadData();
  };

  const updateTransaction = async (id: string, updated: Partial<Transaction>) => {
    await api.transactions.update(id, updated);
    await loadData();
  };

  const deleteTransaction = async (id: string) => {
    await api.transactions.delete(id);
    await loadData();
  };

  // Budget & Goals Mutations
  const addBudget = async (b: Omit<Budget, 'id'>) => {
    await api.budgets.create(b);
    await loadData();
  };

  const deleteBudget = async (id: string) => {
    await api.budgets.delete(id);
    await loadData();
  };

  const addGoal = async (g: Omit<Goal, 'id'>) => {
    await api.goals.create(g);
    await loadData();
  };

  const deleteGoal = async (id: string) => {
    await api.goals.delete(id);
    await loadData();
  };

  // Categories & Sources Mutations
  const addCategory = async (c: Omit<Category, 'id'>) => {
    await api.entities.createCategory(c);
    await loadData();
  };

  const updateCategory = async (id: string, updated: Partial<Category>) => {
    await api.entities.updateCategory(id, updated);
    await loadData();
  };

  const deleteCategory = async (id: string) => {
    await api.entities.deleteCategory(id);
    await loadData();
  };

  const addIncomeSource = async (s: Omit<IncomeSource, 'id'>) => {
    await api.entities.createSource(s);
    await loadData();
  };

  const updateIncomeSource = async (id: string, updated: Partial<IncomeSource>) => {
    await api.entities.updateSource(id, updated);
    await loadData();
  };

  const deleteIncomeSource = async (id: string) => {
    await api.entities.deleteSource(id);
    await loadData();
  };

  // Exchange Mutations
  const registerExchange = async (op: Omit<ExchangeOperation, 'id'>) => {
    await api.exchange.create(op);
    await loadData();
  };

  // Assets & Liabilities Mutations
  const addAsset = async (a: Omit<Asset, 'id'>) => {
    await api.assets.create(a);
    await loadData();
  };

  const deleteAsset = async (id: string) => {
    await api.assets.delete(id);
    await loadData();
  };

  const addLiability = async (l: Omit<Liability, 'id'>) => {
    await api.liabilities.create(l);
    await loadData();
  };

  const deleteLiability = async (id: string) => {
    await api.liabilities.delete(id);
    await loadData();
  };

  // Budget update
  const updateBudget = async (id: string, updated: Partial<Budget>) => {
    await api.budgets.update(id, updated);
    await loadData();
  };

  return {
    loading, error,
    accounts, categories, incomeSources, transactions, budgets, goals, liabilities, assets, exchangeOperations, stats,
    addAccount, updateAccount, deleteAccount,
    addTransaction, updateTransaction, deleteTransaction,
    addBudget, updateBudget, deleteBudget,
    addGoal, deleteGoal,
    addCategory, updateCategory, deleteCategory,
    addIncomeSource, updateIncomeSource, deleteIncomeSource,
    registerExchange,
    addAsset, deleteAsset,
    addLiability, deleteLiability,
    refresh: loadData
  };
};
