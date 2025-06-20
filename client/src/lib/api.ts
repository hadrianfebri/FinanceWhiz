import { apiRequest } from "./queryClient";

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  transactions: T[];
  total: number;
}

export interface DashboardStats {
  cashBalance: number;
  weeklyIncome: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  recentTransactions: any[];
  cashFlowData: { date: string; balance: number }[];
}

export interface FinancialReport {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  incomeByCategory: { category: string; amount: number }[];
  expensesByCategory: { category: string; amount: number; percentage: number }[];
}

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  }

  async register(userData: any) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  }

  async getCurrentUser() {
    const response = await fetch('/api/auth/me', {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch user');
    }

    return response.json();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch('/api/dashboard/stats', {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  }

  async getTransactions(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    categoryId?: number;
    type?: string;
    search?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`/api/transactions?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return response.json();
  }

  async createTransaction(data: FormData) {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create transaction');
    }

    return response.json();
  }

  async updateTransaction(id: number, data: FormData) {
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update transaction');
    }

    return response.json();
  }

  async deleteTransaction(id: number) {
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete transaction');
    }

    return response.json();
  }

  async getCategories() {
    const response = await fetch('/api/categories', {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  async getFinancialReport(startDate: string, endDate: string): Promise<FinancialReport> {
    const response = await fetch(`/api/reports/financial?startDate=${startDate}&endDate=${endDate}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch financial report');
    }

    return response.json();
  }

  async updateProfile(data: any) {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  }

  async changePassword(data: any) {
    const response = await fetch('/api/profile/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    return response.json();
  }

  async getUserSettings() {
    const response = await fetch('/api/settings', {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    return response.json();
  }

  async updateUserSettings(data: any) {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update settings');
    }

    return response.json();
  }

  async processReceipt(file: File) {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch('/api/ai/process-receipt', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to process receipt');
    }

    return response.json();
  }

  async getAIInsights() {
    const response = await fetch('/api/ai/insights', {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI insights');
    }

    return response.json();
  }

  logout() {
    localStorage.removeItem('auth_token');
  }
}

export const api = new ApiClient();
