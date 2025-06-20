import {
  users,
  transactions,
  categories,
  userSettings,
  type User,
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type Category,
  type InsertCategory,
  type UserSettings,
  type InsertUserSettings,
  type UpdateProfileData,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sum, count, gte, lte, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: UpdateProfileData): Promise<User>;
  changePassword(id: number, newPassword: string): Promise<void>;

  // Transaction operations
  getTransactions(userId: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    categoryId?: number;
    type?: 'income' | 'expense';
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: Transaction[]; total: number }>;
  getTransactionById(id: number, userId: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, userId: number, data: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number, userId: number): Promise<void>;

  // Category operations
  getCategories(userId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, userId: number, data: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number, userId: number): Promise<void>;

  // Dashboard operations
  getDashboardStats(userId: number): Promise<{
    cashBalance: number;
    weeklyIncome: number;
    weeklyExpenses: number;
    weeklyProfit: number;
    recentTransactions: Transaction[];
    cashFlowData: { date: Date; balance: number }[];
  }>;

  // Reports
  getFinancialReport(userId: number, startDate: Date, endDate: Date): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    incomeByCategory: { category: string; amount: number }[];
    expensesByCategory: { category: string; amount: number; percentage: number }[];
  }>;

  // User settings
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...userData, password: hashedPassword })
      .returning();

    // Create default categories
    const defaultCategories = [
      { name: 'Penjualan', type: 'income' as const, userId: user.id },
      { name: 'Jasa', type: 'income' as const, userId: user.id },
      { name: 'Bahan Baku', type: 'expense' as const, userId: user.id },
      { name: 'Operasional', type: 'expense' as const, userId: user.id },
      { name: 'Gaji', type: 'expense' as const, userId: user.id },
      { name: 'Lainnya', type: 'expense' as const, userId: user.id },
    ];

    await db.insert(categories).values(defaultCategories);

    // Create default user settings
    await db.insert(userSettings).values({ userId: user.id });

    return user;
  }

  async updateUser(id: number, data: UpdateProfileData): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async changePassword(id: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async getTransactions(userId: number, filters: {
    startDate?: Date;
    endDate?: Date;
    categoryId?: number;
    type?: 'income' | 'expense';
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ transactions: Transaction[]; total: number }> {
    const conditions = [eq(transactions.userId, userId)];

    if (filters.startDate) {
      conditions.push(gte(transactions.date, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(transactions.date, filters.endDate));
    }
    if (filters.categoryId) {
      conditions.push(eq(transactions.categoryId, filters.categoryId));
    }
    if (filters.type) {
      conditions.push(eq(transactions.type, filters.type));
    }
    if (filters.search) {
      conditions.push(sql`${transactions.description} ILIKE ${'%' + filters.search + '%'}`);
    }

    // Get transactions with relationships
    const transactionResults = await db.query.transactions.findMany({
      where: and(...conditions),
      with: {
        category: true,
      },
      orderBy: desc(transactions.date),
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    });

    const totalResults = await db.select({ count: count() }).from(transactions)
      .where(and(...conditions));

    return {
      transactions: transactionResults,
      total: totalResults[0]?.count || 0
    };
  }

  async getTransactionById(id: number, userId: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return transaction;
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async updateTransaction(id: number, userId: number, data: Partial<InsertTransaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: number, userId: number): Promise<void> {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  }

  async getCategories(userId: number): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.name));
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateCategory(id: number, userId: number, data: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(data)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return category;
  }

  async deleteCategory(id: number, userId: number): Promise<void> {
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }

  async getDashboardStats(userId: number) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all transactions to calculate cash balance
    const allTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(asc(transactions.date));

    let cashBalance = 0;
    for (const transaction of allTransactions) {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'income') {
        cashBalance += amount;
      } else {
        cashBalance -= amount;
      }
    }

    // Get weekly stats
    const weeklyTransactions = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), gte(transactions.date, weekAgo)));

    let weeklyIncome = 0;
    let weeklyExpenses = 0;

    for (const transaction of weeklyTransactions) {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'income') {
        weeklyIncome += amount;
      } else {
        weeklyExpenses += amount;
      }
    }

    const weeklyProfit = weeklyIncome - weeklyExpenses;

    // Get recent transactions
    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(5);

    // Generate cash flow data for last 7 days
    const cashFlowData = [];
    let runningBalance = 0;

    // Calculate balance for each day
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dayStart && transactionDate < dayEnd;
      });

      let dayBalance = runningBalance;
      for (const transaction of dayTransactions) {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'income') {
          dayBalance += amount;
        } else {
          dayBalance -= amount;
        }
      }

      cashFlowData.push({ date: dayStart, balance: dayBalance });
      runningBalance = dayBalance;
    }

    return {
      cashBalance,
      weeklyIncome,
      weeklyExpenses,
      weeklyProfit,
      recentTransactions,
      cashFlowData,
    };
  }

  async getFinancialReport(userId: number, startDate: Date, endDate: Date) {
    const reportTransactions = await db
      .select({
        transaction: transactions,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      ));

    let totalIncome = 0;
    let totalExpenses = 0;
    const incomeByCategory: { [key: string]: number } = {};
    const expensesByCategory: { [key: string]: number } = {};

    for (const row of reportTransactions) {
      const amount = parseFloat(row.transaction.amount);
      const categoryName = row.category?.name || 'Tidak Dikategorikan';

      if (row.transaction.type === 'income') {
        totalIncome += amount;
        incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + amount;
      } else {
        totalExpenses += amount;
        expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + amount;
      }
    }

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    const incomeCategories = Object.entries(incomeByCategory).map(([category, amount]) => ({
      category,
      amount,
    }));

    const expenseCategories = Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }));

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      incomeByCategory: incomeCategories,
      expensesByCategory: expenseCategories,
    };
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async updateUserSettings(userId: number, settingsData: Partial<InsertUserSettings>): Promise<UserSettings> {
    const [settings] = await db
      .update(userSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
    return settings;
  }
}

export const storage = new DatabaseStorage();
