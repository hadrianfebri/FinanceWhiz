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
    return token ? { Authorization: `Bearer ${token}` } : { Authorization: '' };
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

  async getFinancialReport(startDate: string, endDate: string, outletId?: string): Promise<FinancialReport> {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });
    
    if (outletId && outletId !== "all") {
      if (outletId === "pusat") {
        queryParams.append('outlet', '0');
      } else {
        queryParams.append('outlet', outletId);
      }
    }

    const response = await fetch(`/api/reports/financial?${queryParams}`, {
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

  async generateAIInsights(data: any) {
    const response = await fetch('/api/ai/generate-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate AI insights');
    }

    return response.json();
  }

  async sendChatMessage(data: { message: string; context: any }) {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send chat message');
    }

    return response.json();
  }

  async detectFraud(data: any) {
    const response = await fetch('/api/ai/detect-fraud', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to detect fraud');
    }

    return response.json();
  }

  async updateAlertStatus(alertId: number, status: string) {
    const response = await fetch(`/api/ai/alerts/${alertId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update alert status');
    }

    return response.json();
  }

  // SME-specific API methods
  async getOutlets() {
    const response = await fetch('/api/outlets', {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch outlets');
    return response.json();
  }

  async createOutlet(data: any) {
    const response = await fetch('/api/outlets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create outlet');
    return response.json();
  }

  async updateOutlet(id: number, data: any) {
    const response = await fetch(`/api/outlets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update outlet');
    return response.json();
  }

  async deleteOutlet(id: number) {
    const response = await fetch(`/api/outlets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete outlet');
    return response.json();
  }

  async getManagers() {
    const response = await fetch('/api/users/managers', {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch managers');
    return response.json();
  }

  async getNotifications() {
    const response = await fetch('/api/notifications', {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  }

  async getTaxSummary() {
    const response = await fetch('/api/tax/summary', {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch tax summary');
    return response.json();
  }

  async getPendingInvoices() {
    const response = await fetch('/api/invoices/pending', {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch pending invoices');
    return response.json();
  }

  async getPayrollReminders() {
    const response = await fetch('/api/payroll/reminders', {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch payroll reminders');
    return response.json();
  }

  async getEmployees(outletId?: number) {
    const url = outletId ? `/api/employees?outletId=${outletId}` : '/api/employees';
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
  }

  async createEmployee(data: any) {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
  }

  async getVendors() {
    const response = await fetch('/api/vendors', {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch vendors');
    return response.json();
  }

  async createVendor(data: any) {
    const response = await fetch('/api/vendors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create vendor');
    return response.json();
  }

  logout() {
    localStorage.removeItem('auth_token');
  }
}

export const api = new ApiClient();
