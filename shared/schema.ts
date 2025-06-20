import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  timestamp,
  boolean,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: varchar("role", { length: 20 }).notNull().default("owner"), // owner, finance, manager
  outletId: integer("outlet_id"), // null for owner/finance, specific outlet for manager
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Multi-outlet support
export const outlets = pgTable("outlets", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  managerId: integer("manager_id"), // reference to user with manager role
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  outletId: integer("outlet_id").references(() => outlets.id), // null for general business transactions
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  notes: text("notes"),
  type: text("type").notNull(), // 'income' or 'expense'
  date: timestamp("date").notNull(),
  receiptUrl: text("receipt_url"),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: varchar("recurring_frequency", { length: 20 }), // monthly, weekly
  vendorId: integer("vendor_id"), // for expense tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  emailNotifications: boolean("email_notifications").default(true),
  dailyReminders: boolean("daily_reminders").default(true),
  weeklyReports: boolean("weekly_reports").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payroll Management
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => users.id).notNull(),
  outletId: integer("outlet_id").references(() => outlets.id),
  name: text("name").notNull(),
  position: text("position"),
  email: text("email"),
  phone: text("phone"),
  baseSalary: decimal("base_salary", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payrolls = pgTable("payrolls", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  outletId: integer("outlet_id").references(() => outlets.id),
  baseSalary: decimal("base_salary", { precision: 15, scale: 2 }).notNull(),
  bonus: decimal("bonus", { precision: 15, scale: 2 }).default("0"),
  deduction: decimal("deduction", { precision: 15, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  payPeriod: varchar("pay_period", { length: 20 }).notNull(), // "2025-01", "2025-02"
  payDate: timestamp("pay_date"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, paid
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor & Supplier Management
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  paymentTerms: integer("payment_terms").default(30), // days
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  outletId: integer("outlet_id").references(() => outlets.id),
  invoiceNumber: text("invoice_number"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("unpaid"), // unpaid, paid, overdue
  paidDate: timestamp("paid_date"),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }),
  invoiceUrl: text("invoice_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tax Management
export const taxReports = pgTable("tax_reports", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => users.id).notNull(),
  period: varchar("period", { length: 20 }).notNull(), // "2025-01", "2025-Q1"
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).notNull(),
  taxableIncome: decimal("taxable_income", { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).notNull().default("0.005"), // 0.5% PPh Final
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, submitted, paid
  submissionDate: timestamp("submission_date"),
  paymentDate: timestamp("payment_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// POS Integration
export const posTransactions = pgTable("pos_transactions", {
  id: serial("id").primaryKey(),
  outletId: integer("outlet_id").references(() => outlets.id).notNull(),
  posTransactionId: text("pos_transaction_id"), // external POS system ID
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  customerCount: integer("customer_count").default(1),
  transactionTime: timestamp("transaction_time").notNull(),
  cashierName: text("cashier_name"),
  items: jsonb("items"), // product details
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  syncedToAccounting: boolean("synced_to_accounting").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Insights and Notifications
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // cashflow_prediction, anomaly_detection, trend_analysis
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // low, medium, high, critical
  actionRequired: boolean("action_required").default(false),
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata"), // additional data for the insight
  generatedAt: timestamp("generated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // invoice_due, payroll_reminder, tax_deadline
  title: text("title").notNull(),
  message: text("message").notNull(),
  actionUrl: text("action_url"),
  isRead: boolean("is_read").default(false),
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  transactions: many(transactions),
  categories: many(categories),
  settings: one(userSettings),
  outlets: many(outlets),
  employees: many(employees),
  vendors: many(vendors),
  taxReports: many(taxReports),
  aiInsights: many(aiInsights),
  notifications: many(notifications),
}));

export const outletsRelations = relations(outlets, ({ one, many }) => ({
  business: one(users, { fields: [outlets.businessId], references: [users.id] }),
  manager: one(users, { fields: [outlets.managerId], references: [users.id] }),
  transactions: many(transactions),
  employees: many(employees),
  payrolls: many(payrolls),
  invoices: many(invoices),
  posTransactions: many(posTransactions),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  business: one(users, { fields: [employees.businessId], references: [users.id] }),
  outlet: one(outlets, { fields: [employees.outletId], references: [outlets.id] }),
  payrolls: many(payrolls),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  business: one(users, { fields: [vendors.businessId], references: [users.id] }),
  invoices: many(invoices),
  transactions: many(transactions),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  vendor: one(vendors, { fields: [invoices.vendorId], references: [vendors.id] }),
  outlet: one(outlets, { fields: [invoices.outletId], references: [outlets.id] }),
}));

export const taxReportsRelations = relations(taxReports, ({ one }) => ({
  business: one(users, { fields: [taxReports.businessId], references: [users.id] }),
}));

export const posTransactionsRelations = relations(posTransactions, ({ one }) => ({
  outlet: one(outlets, { fields: [posTransactions.outletId], references: [outlets.id] }),
}));

export const aiInsightsRelations = relations(aiInsights, ({ one }) => ({
  business: one(users, { fields: [aiInsights.businessId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserSchema = createSelectSchema(users);

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectTransactionSchema = createSelectSchema(transactions);

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const selectCategorySchema = createSelectSchema(categories);

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserSettingsSchema = createSelectSchema(userSettings);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

// Additional schemas for API
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(8),
});

export const updateProfileSchema = z.object({
  businessName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
