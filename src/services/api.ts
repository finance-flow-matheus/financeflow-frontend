
import { User } from '../types.ts';

/**
 * API Service — resolução de URL do backend.
 * No Vite, apenas import.meta.env.VITE_* é substituído em tempo de build.
 * Process.env e window.VITE_* NÃO funcionam após o bundling.
 */
const BASE_URL: string = import.meta.env.VITE_API_URL || 'https://web-production-cce50.up.railway.app/api';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('ff_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
          ...options.headers,
        },
      });

      if (response.status === 401) {
        console.warn("[FinanceFlow] Session expired or unauthorized. Clearing local storage.");
        localStorage.removeItem('ff_token');
        localStorage.removeItem('ff_current_user');
        if (!window.location.pathname.includes('auth')) {
          window.location.reload();
        }
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Server Error: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      // Log estruturado para debug profissional
      console.groupCollapsed(`%c[API Error] %c${options.method || 'GET'} ${endpoint}`, "color: #ef4444; font-weight: bold", "color: #64748b; font-weight: normal");
      console.error("URL:", url);
      console.error("Message:", error.message);
      console.groupEnd();
      throw error;
    }
  },

  auth: {
    login: (credentials: any) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (user: any) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(user) }),
    validateToken: () => api.request('/auth/validate', { method: 'GET' }),
  },

  transactions: {
    getAll: () => api.request('/transactions'),
    create: (data: any) => api.request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.request(`/transactions/${id}`, { method: 'DELETE' }),
  },

  accounts: {
    getAll: () => api.request('/accounts'),
    create: (data: any) => api.request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.request(`/accounts/${id}`, { method: 'DELETE' }),
  },

  entities: {
    getCategories: () => api.request('/categories'),
    getSources: () => api.request('/sources'),
    createCategory: (data: any) => api.request('/categories', { method: 'POST', body: JSON.stringify(data) }),
    updateCategory: (id: string, data: any) => api.request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCategory: (id: string) => api.request(`/categories/${id}`, { method: 'DELETE' }),
    createSource: (data: any) => api.request('/sources', { method: 'POST', body: JSON.stringify(data) }),
    updateSource: (id: string, data: any) => api.request(`/sources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSource: (id: string) => api.request(`/sources/${id}`, { method: 'DELETE' }),
  },

  budgets: {
    getAll: () => api.request('/budgets'),
    create: (data: any) => api.request('/budgets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.request(`/budgets/${id}`, { method: 'DELETE' }),
  },

  goals: {
    getAll: () => api.request('/goals'),
    create: (data: any) => api.request('/goals', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => api.request(`/goals/${id}`, { method: 'DELETE' }),
  },

  exchange: {
    getAll: () => api.request('/exchange'),
    create: (data: any) => api.request('/exchange', { method: 'POST', body: JSON.stringify(data) }),
  },

  assets: {
    getAll: () => api.request('/assets'),
    create: (data: any) => api.request('/assets', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => api.request(`/assets/${id}`, { method: 'DELETE' }),
  },

  liabilities: {
    getAll: () => api.request('/liabilities'),
    create: (data: any) => api.request('/liabilities', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => api.request(`/liabilities/${id}`, { method: 'DELETE' }),
  }
};
