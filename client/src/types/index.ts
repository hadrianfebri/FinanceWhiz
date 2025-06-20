export interface User {
  id: number;
  businessName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Transaction {
  id: number;
  userId: number;
  categoryId: number;
  amount: string;
  description: string;
  notes?: string;
  type: 'income' | 'expense';
  date: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  userId: number;
  createdAt: string;
}

export interface DashboardData {
  cashBalance: number;
  weeklyIncome: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  recentTransactions: Transaction[];
  cashFlowData: { date: string; balance: number }[];
}

export interface TransactionFormData {
  type: 'income' | 'expense';
  description: string;
  amount: number;
  categoryId: number;
  date: string;
  notes?: string;
  receipt?: File;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  businessName: string;
  email: string;
  password: string;
}
