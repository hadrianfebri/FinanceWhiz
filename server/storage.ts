import {
  users,
  transactions,
  categories,
  userSettings,
  posDevices,
  posSyncLogs,
  outlets,
  type User,
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type Category,
  type InsertCategory,
  type UserSettings,
  type InsertUserSettings,
  type UpdateProfileData,
  type PosDevice,
  type InsertPosDevice,
  type PosSyncLog,
  type InsertPosSyncLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sum, count, gte, lte, sql, isNull } from "drizzle-orm";
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
    recentTransactions: any[];
    cashFlowData: { date: Date; balance: number }[];
  }>;

  // Reports
  getFinancialReport(userId: number, startDate: Date, endDate: Date, outletId?: number): Promise<{
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

  // POS Device operations
  getPosDevices(businessId: number): Promise<PosDevice[]>;
  getPosDeviceById(id: number, businessId: number): Promise<PosDevice | undefined>;
  createPosDevice(device: InsertPosDevice): Promise<PosDevice>;
  updatePosDevice(id: number, businessId: number, data: Partial<InsertPosDevice>): Promise<PosDevice>;
  deletePosDevice(id: number, businessId: number): Promise<void>;
  updatePosDeviceStatus(id: number, status: string, lastSync?: Date, todayTransactions?: number): Promise<void>;

  // POS Sync operations
  createSyncLog(log: InsertPosSyncLog): Promise<PosSyncLog>;
  getSyncLogs(posDeviceId: number, limit?: number): Promise<PosSyncLog[]>;
}

export class DatabaseStorage implements IStorage {
  private async withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        if (error.message?.includes('endpoint is disabled') && attempt < maxRetries) {
          console.log(`Database endpoint disabled, retry ${attempt}/${maxRetries} in 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  async getUserById(id: number): Promise<User | undefined> {
    return await this.withRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await this.withRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    });
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
    outletId?: number;
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
    if (filters.outletId) {
      conditions.push(eq(transactions.outletId, filters.outletId));
    }

    // Get transactions with relationships
    const transactionResults = await db.query.transactions.findMany({
      where: and(...conditions),
      with: {
        category: true,
        outlet: true,
        vendor: true,
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

    // Get all transactions with categories to calculate exact totals
    const allTransactionsWithCategories = await db
      .select({
        transaction: transactions,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(asc(transactions.date));

    // Calculate exact cash balance matching other pages
    let cashBalance = 0;
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const row of allTransactionsWithCategories) {
      const amount = parseFloat(row.transaction.amount);
      if (row.transaction.type === 'income') {
        cashBalance += amount;
        totalIncome += amount;
      } else {
        cashBalance -= amount;
        totalExpenses += amount;
      }
    }

    // Get weekly stats - exactly matching the same calculation method
    const weeklyTransactions = await db
      .select({
        transaction: transactions,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.userId, userId), gte(transactions.date, weekAgo)));

    let weeklyIncome = 0;
    let weeklyExpenses = 0;

    for (const row of weeklyTransactions) {
      const amount = parseFloat(row.transaction.amount);
      if (row.transaction.type === 'income') {
        weeklyIncome += amount;
      } else {
        weeklyExpenses += amount;
      }
    }

    const weeklyProfit = weeklyIncome - weeklyExpenses;

    // Get recent transactions with category names
    const recentTransactions = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        type: transactions.type,
        date: transactions.date,
        categoryName: categories.name,
        outletId: transactions.outletId
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(5);

    // Generate cash flow data for last 7 days with correct running balance
    const cashFlowData = [];
    let runningBalance = 0;

    // First calculate the balance up to a week ago
    const transactionsBeforeWeek = allTransactionsWithCategories.filter(row => {
      const transactionDate = new Date(row.transaction.date);
      return transactionDate < weekAgo;
    });

    for (const row of transactionsBeforeWeek) {
      const amount = parseFloat(row.transaction.amount);
      if (row.transaction.type === 'income') {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }
    }

    // Calculate balance for each day
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayTransactions = allTransactionsWithCategories.filter(row => {
        const transactionDate = new Date(row.transaction.date);
        return transactionDate >= dayStart && transactionDate < dayEnd;
      });

      let dayBalance = runningBalance;
      for (const row of dayTransactions) {
        const amount = parseFloat(row.transaction.amount);
        if (row.transaction.type === 'income') {
          dayBalance += amount;
        } else {
          dayBalance -= amount;
        }
      }

      cashFlowData.push({ date: dayStart, balance: dayBalance });
      runningBalance = dayBalance;
    }

    return {
      cashBalance: Math.round(cashBalance),
      weeklyIncome: Math.round(weeklyIncome),
      weeklyExpenses: Math.round(weeklyExpenses),
      weeklyProfit: Math.round(weeklyProfit),
      recentTransactions,
      cashFlowData,
    };
  }

  async getFinancialReport(userId: number, startDate: Date, endDate: Date, outletId?: number) {
    const conditions = [
      eq(transactions.userId, userId),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    ];

    // Add outlet filter conditions
    if (outletId === 0) {
      // Filter for "pusat" transactions (null outletId)
      conditions.push(sql`${transactions.outletId} IS NULL`);
    } else if (outletId && outletId > 0) {
      // Filter for specific outlet
      conditions.push(eq(transactions.outletId, outletId));
    }
    // If outletId is undefined, show all transactions (no additional filter)

    const reportTransactions = await db
      .select({
        transaction: transactions,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions));

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

  // POS Device operations
  async getPosDevices(businessId: number): Promise<PosDevice[]> {
    const result = await db
      .select({
        id: posDevices.id,
        businessId: posDevices.businessId,
        outletId: posDevices.outletId,
        name: posDevices.name,
        type: posDevices.type,
        location: posDevices.location,
        apiUrl: posDevices.apiUrl,
        apiKey: posDevices.apiKey,
        status: posDevices.status,
        lastSync: posDevices.lastSync,
        todayTransactions: posDevices.todayTransactions,
        isActive: posDevices.isActive,
        createdAt: posDevices.createdAt,
        updatedAt: posDevices.updatedAt,
        outletName: outlets.name,
      })
      .from(posDevices)
      .leftJoin(outlets, eq(posDevices.outletId, outlets.id))
      .where(and(
        eq(posDevices.businessId, businessId),
        eq(posDevices.isActive, true)
      ))
      .orderBy(desc(posDevices.createdAt));
    
    return result as PosDevice[];
  }

  async getPosDeviceById(id: number, businessId: number): Promise<PosDevice | undefined> {
    const [device] = await db
      .select()
      .from(posDevices)
      .where(and(
        eq(posDevices.id, id),
        eq(posDevices.businessId, businessId),
        eq(posDevices.isActive, true)
      ));
    return device || undefined;
  }

  async createPosDevice(deviceData: InsertPosDevice): Promise<PosDevice> {
    const [device] = await db
      .insert(posDevices)
      .values({
        ...deviceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return device;
  }

  async updatePosDevice(id: number, businessId: number, data: Partial<InsertPosDevice>): Promise<PosDevice> {
    const [device] = await db
      .update(posDevices)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(posDevices.id, id),
        eq(posDevices.businessId, businessId)
      ))
      .returning();

    if (!device) {
      throw new Error("POS device not found");
    }

    return device;
  }

  async deletePosDevice(id: number, businessId: number): Promise<void> {
    await db
      .update(posDevices)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(posDevices.id, id),
        eq(posDevices.businessId, businessId)
      ));
  }

  async updatePosDeviceStatus(id: number, status: string, lastSync?: Date, todayTransactions?: number): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (lastSync) updateData.lastSync = lastSync;
    if (todayTransactions !== undefined) updateData.todayTransactions = todayTransactions;

    await db
      .update(posDevices)
      .set(updateData)
      .where(eq(posDevices.id, id));
  }

  // POS Sync operations
  async createSyncLog(logData: InsertPosSyncLog): Promise<PosSyncLog> {
    const [log] = await db
      .insert(posSyncLogs)
      .values({
        ...logData,
        createdAt: new Date(),
      })
      .returning();
    return log;
  }

  async getSyncLogs(posDeviceId: number, limit: number = 10): Promise<PosSyncLog[]> {
    return await db
      .select()
      .from(posSyncLogs)
      .where(eq(posSyncLogs.posDeviceId, posDeviceId))
      .orderBy(desc(posSyncLogs.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
