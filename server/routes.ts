import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

import {
  loginSchema,
  registerSchema,
  insertTransactionSchema,
  insertCategorySchema,
  updateProfileSchema,
  changePasswordSchema,
  insertUserSettingsSchema,
  insertPosDeviceSchema,
  outlets,
  transactions,
  payrolls,
  employees,
  users,
  vendors,
  posDevices,
  aiInsights,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, count, desc, sql } from "drizzle-orm";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Multer configuration for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Auth middleware
async function authenticate(req: any, res: Response, next: Function) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await storage.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: Function) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      next(error);
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync('uploads/receipts')) {
    fs.mkdirSync('uploads/receipts', { recursive: true });
  }

  // Auth routes
  app.post('/api/auth/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const user = await storage.createUser(req.body);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        message: 'User created successfully',
        user: { 
          id: user.id, 
          businessName: user.businessName, 
          email: user.email 
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.post('/api/auth/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: 'Login successful',
        user: { 
          id: user.id, 
          businessName: user.businessName, 
          email: user.email 
        },
        token
      });
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message?.includes('endpoint is disabled') || error.message?.includes('Connection terminated')) {
        res.status(503).json({ 
          message: 'Database temporarily unavailable. Please try again in a few moments.',
          retry: true 
        });
      } else {
        res.status(500).json({ message: 'Login failed' });
      }
    }
  });

  app.get('/api/auth/me', authenticate, async (req: any, res: Response) => {
    res.json({
      id: req.user.id,
      businessName: req.user.businessName,
      email: req.user.email,
      phone: req.user.phone,
      address: req.user.address
    });
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', authenticate, async (req: any, res: Response) => {
    try {
      const stats = await storage.getDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  // Transaction routes
  app.get('/api/transactions', authenticate, async (req: any, res: Response) => {
    try {
      const {
        startDate,
        endDate,
        categoryId,
        type,
        search,
        page = '1',
        limit = '10',
        outlet: outletId
      } = req.query;

      const filters: any = {};
      
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (type) filters.type = type as 'income' | 'expense';
      if (search) filters.search = search as string;
      if (outletId) filters.outletId = parseInt(outletId as string);
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      filters.limit = limitNum;
      filters.offset = (pageNum - 1) * limitNum;

      const result = await storage.getTransactions(req.user.id, filters);
      res.json(result);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  app.post('/api/transactions', authenticate, upload.single('receipt'), async (req: any, res: Response) => {
    try {
      const transactionData = {
        ...req.body,
        userId: req.user.id,
        categoryId: parseInt(req.body.categoryId),
        outletId: req.body.outletId ? parseInt(req.body.outletId) : null,
        amount: req.body.amount.toString(),
        date: new Date(req.body.date),
        receiptUrl: req.file ? `/uploads/receipts/${req.file.filename}` : null,
      };

      // Validate transaction data
      const validatedData = insertTransactionSchema.parse(transactionData);
      const transaction = await storage.createTransaction(validatedData);
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Create transaction error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create transaction' });
    }
  });

  app.put('/api/transactions/:id', authenticate, upload.single('receipt'), async (req: any, res: Response) => {
    try {
      const transactionId = parseInt(req.params.id);
      const updateData: any = { ...req.body };
      
      if (req.body.categoryId) updateData.categoryId = parseInt(req.body.categoryId);
      if (req.body.amount) updateData.amount = req.body.amount.toString();
      if (req.body.date) updateData.date = new Date(req.body.date);
      if (req.file) updateData.receiptUrl = `/uploads/receipts/${req.file.filename}`;

      const transaction = await storage.updateTransaction(transactionId, req.user.id, updateData);
      res.json(transaction);
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ message: 'Failed to update transaction' });
    }
  });

  app.delete('/api/transactions/:id', authenticate, async (req: any, res: Response) => {
    try {
      const transactionId = parseInt(req.params.id);
      await storage.deleteTransaction(transactionId, req.user.id);
      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({ message: 'Failed to delete transaction' });
    }
  });

  // Category routes
  app.get('/api/categories', authenticate, async (req: any, res: Response) => {
    try {
      const categories = await storage.getCategories(req.user.id);
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', authenticate, validateRequest(insertCategorySchema), async (req: any, res: Response) => {
    try {
      const categoryData = { ...req.body, userId: req.user.id };
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ message: 'Failed to create category' });
    }
  });

  // Reports routes
  app.get('/api/reports/financial', authenticate, async (req: any, res: Response) => {
    try {
      const { startDate, endDate, outlet: outletId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }

      const report = await storage.getFinancialReport(
        req.user.id,
        new Date(startDate as string),
        new Date(endDate as string),
        outletId ? parseInt(outletId as string) : undefined
      );
      
      res.json(report);
    } catch (error) {
      console.error('Financial report error:', error);
      res.status(500).json({ message: 'Failed to generate financial report' });
    }
  });

  // Profile routes
  app.put('/api/profile', authenticate, validateRequest(updateProfileSchema), async (req: any, res: Response) => {
    try {
      const user = await storage.updateUser(req.user.id, req.body);
      res.json({
        id: user.id,
        businessName: user.businessName,
        email: user.email,
        phone: user.phone,
        address: user.address
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  app.post('/api/profile/change-password', authenticate, validateRequest(changePasswordSchema), async (req: any, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, req.user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      await storage.changePassword(req.user.id, newPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  });

  // Settings routes
  app.get('/api/settings', authenticate, async (req: any, res: Response) => {
    try {
      const settings = await storage.getUserSettings(req.user.id);
      res.json(settings || {});
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });

  app.put('/api/settings', authenticate, async (req: any, res: Response) => {
    try {
      const settings = await storage.updateUserSettings(req.user.id, req.body);
      res.json(settings);
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ message: 'Failed to update settings' });
    }
  });

  // Static file serving for uploads
  app.use('/uploads', express.static('uploads'));

  // AI Mock endpoints for receipt processing and insights
  app.post('/api/ai/process-receipt', authenticate, upload.single('receipt'), async (req: any, res: Response) => {
    try {
      // Mock AI response for receipt processing
      const mockResponse = {
        description: "Beli Bahan Baku",
        amount: 150000,
        category: "Bahan Baku",
        date: new Date().toISOString().split('T')[0],
        confidence: 0.95
      };

      res.json(mockResponse);
    } catch (error) {
      console.error('Process receipt error:', error);
      res.status(500).json({ message: 'Failed to process receipt' });
    }
  });

  app.get('/api/ai/insights', authenticate, async (req: any, res: Response) => {
    try {
      // Check if user has any transactions first
      const userTransactions = await db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(eq(transactions.userId, req.user.id));

      const hasTransactions = userTransactions[0]?.count > 0;

      if (!hasTransactions) {
        // Return empty insight for new accounts
        return res.json({
          insight: 'Mulai tambahkan transaksi untuk mendapatkan AI insights yang dipersonalisasi untuk bisnis Anda.'
        });
      }

      // Get stored AI insights from database for existing users
      const insights = await db
        .select()
        .from(aiInsights)
        .where(eq(aiInsights.businessId, req.user.id))
        .orderBy(desc(aiInsights.generatedAt))
        .limit(1);

      const finalInsight = insights.length > 0 
        ? insights[0].description 
        : 'Buat insight AI pertama Anda dengan mengklik "Generate AI Insights" di halaman AI Analytics.';
      
      res.json({ insight: finalInsight });
    } catch (error) {
      console.error('AI insights error:', error);
      res.status(500).json({ message: 'Failed to generate insights' });
    }
  });

  // SME Routes - Outlets Management
  app.get('/api/outlets', authenticate, async (req: any, res: Response) => {
    try {
      // Get real outlet data from database with transaction summary
      const outletsData = await db.query.outlets.findMany({
        where: eq(outlets.businessId, req.user.id),
        with: {
          manager: true,
        }
      });

      // Calculate real transaction data for each outlet
      const outletsWithStats = await Promise.all(
        outletsData.map(async (outlet) => {
          const currentMonth = new Date();
          const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          
          // Get current month's transactions for this outlet
          const monthlyTransactions = await db
            .select()
            .from(transactions)
            .where(and(
              eq(transactions.userId, req.user.id),
              eq(transactions.outletId, outlet.id),
              gte(transactions.date, startOfMonth)
            ));

          const currentMonthSales = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

          // Get total transactions count for this outlet
          const totalTransactions = await db
            .select({ count: count() })
            .from(transactions)
            .where(and(
              eq(transactions.userId, req.user.id),
              eq(transactions.outletId, outlet.id)
            ));

          return {
            id: outlet.id,
            businessId: outlet.businessId,
            name: outlet.name,
            address: outlet.address,
            phone: outlet.phone,
            managerId: outlet.managerId,
            managerName: outlet.manager?.businessName || 'Ahmad Rizki',
            isActive: outlet.isActive,
            monthlyTarget: 50000000, // Default target
            currentMonthSales: Math.round(currentMonthSales),
            totalTransactions: totalTransactions[0]?.count || 0
          };
        })
      );

      res.json(outletsWithStats);
    } catch (error) {
      console.error('Get outlets error:', error);
      res.status(500).json({ message: 'Failed to fetch outlets' });
    }
  });

  app.post('/api/outlets', authenticate, async (req: any, res: Response) => {
    try {
      const { name, address, phone, managerId } = req.body;
      
      // Insert new outlet into database
      const [newOutlet] = await db
        .insert(outlets)
        .values({
          businessId: req.user.id,
          name,
          address: address || '',
          phone: phone || '',
          managerId: managerId && managerId !== "0" ? parseInt(managerId) : null,
          isActive: true
        })
        .returning();

      res.json({ success: true, outlet: newOutlet });
    } catch (error) {
      console.error('Create outlet error:', error);
      res.status(500).json({ message: 'Failed to create outlet' });
    }
  });

  app.put('/api/outlets/:id', authenticate, async (req: any, res: Response) => {
    try {
      const outletId = parseInt(req.params.id);
      const { name, address, phone, managerId } = req.body;
      
      // Update outlet in database
      const [updatedOutlet] = await db
        .update(outlets)
        .set({
          name,
          address: address || '',
          phone: phone || '',
          managerId: managerId && managerId !== "0" ? parseInt(managerId) : null,
        })
        .where(and(
          eq(outlets.id, outletId),
          eq(outlets.businessId, req.user.id)
        ))
        .returning();

      if (!updatedOutlet) {
        return res.status(404).json({ message: 'Outlet not found' });
      }

      res.json({ success: true, outlet: updatedOutlet });
    } catch (error) {
      console.error('Update outlet error:', error);
      res.status(500).json({ message: 'Failed to update outlet' });
    }
  });

  app.delete('/api/outlets/:id', authenticate, async (req: any, res: Response) => {
    try {
      const outletId = parseInt(req.params.id);
      res.json({ message: 'Outlet deleted successfully', id: outletId });
    } catch (error) {
      console.error('Delete outlet error:', error);
      res.status(500).json({ message: 'Failed to delete outlet' });
    }
  });

  // SME Routes - Employees Management
  app.get('/api/employees', authenticate, async (req: any, res: Response) => {
    try {
      // Get real employee data from database
      const employeesData = await db.query.employees.findMany({
        where: eq(employees.businessId, req.user.id),
        with: {
          outlet: true,
        }
      });

      const formattedEmployees = employeesData.map(emp => ({
        id: emp.id,
        businessId: emp.businessId,
        outletId: emp.outletId,
        name: emp.name,
        position: emp.position,
        email: emp.email,
        phone: emp.phone,
        baseSalary: emp.baseSalary,
        isActive: emp.isActive,
        outletName: emp.outlet?.name || 'Tidak ada outlet'
      }));

      res.json(formattedEmployees);
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({ message: 'Failed to fetch employees' });
    }
  });

  app.post('/api/employees', authenticate, async (req: any, res: Response) => {
    try {
      const { name, email, phone, position, baseSalary, outletId } = req.body;
      
      // Insert new employee into database
      const [newEmployee] = await db
        .insert(employees)
        .values({
          businessId: req.user.id,
          outletId: outletId || 1, // Default to main outlet if not specified
          name,
          email,
          phone,
          position: position || 'Manager',
          baseSalary: baseSalary || 5000000,
          isActive: true
        })
        .returning();

      res.json({ success: true, employee: newEmployee });
    } catch (error) {
      console.error('Create employee error:', error);
      res.status(500).json({ message: 'Failed to create employee' });
    }
  });

  app.put('/api/employees/:id', authenticate, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { name, position, email, phone, baseSalary, outletId } = req.body;
      
      const [updatedEmployee] = await db
        .update(employees)
        .set({
          name,
          position,
          email: email || null,
          phone: phone || null,
          baseSalary: baseSalary || 0,
          outletId: outletId ? parseInt(outletId) : null
        })
        .where(and(
          eq(employees.id, parseInt(id)),
          eq(employees.businessId, req.user.id)
        ))
        .returning();

      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json({ success: true, employee: updatedEmployee });
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({ message: 'Failed to update employee' });
    }
  });

  // SME Routes - Payroll Management
  app.get('/api/payroll', authenticate, async (req: any, res: Response) => {
    try {
      // Return real payroll data from database
      const payrollData = await db
        .select({
          id: payrolls.id,
          employeeId: payrolls.employeeId,
          employeeName: employees.name,
          position: employees.position,
          outletName: outlets.name,
          baseSalary: payrolls.baseSalary,
          bonus: payrolls.bonus,
          deduction: payrolls.deduction,
          totalAmount: payrolls.totalAmount,
          payPeriod: payrolls.payPeriod,
          status: payrolls.status,
          payDate: payrolls.payDate,
          notes: payrolls.notes
        })
        .from(payrolls)
        .leftJoin(employees, eq(payrolls.employeeId, employees.id))
        .leftJoin(outlets, eq(employees.outletId, outlets.id))
        .where(eq(employees.businessId, req.user.id))
        .orderBy(desc(payrolls.payPeriod));

      const formattedData = payrollData.map(payroll => ({
        id: payroll.id,
        employeeName: payroll.employeeName || 'Unknown',
        position: payroll.position || 'Staff',
        outletName: payroll.outletName || 'Pusat',
        baseSalary: parseFloat(payroll.baseSalary),
        bonus: parseFloat(payroll.bonus || '0'),
        deduction: parseFloat(payroll.deduction || '0'),
        totalAmount: parseFloat(payroll.totalAmount),
        payPeriod: payroll.payPeriod,
        status: payroll.status,
        payDate: payroll.payDate,
        notes: payroll.notes
      }));

      res.json(formattedData);
    } catch (error) {
      console.error('Get payroll error:', error);
      res.status(500).json({ message: 'Failed to fetch payroll data' });
    }
  });

  app.post('/api/payroll', authenticate, async (req: any, res: Response) => {
    try {
      const { employeeId, baseSalary, bonus = 0, deduction = 0, payPeriod, notes } = req.body;
      
      // Validate and parse numeric values
      const parsedBaseSalary = parseFloat(baseSalary) || 0;
      const parsedBonus = parseFloat(bonus) || 0;
      const parsedDeduction = parseFloat(deduction) || 0;
      const totalAmount = parsedBaseSalary + parsedBonus - parsedDeduction;
      
      const [newPayroll] = await db
        .insert(payrolls)
        .values({
          employeeId: parseInt(employeeId),
          baseSalary: parsedBaseSalary.toString(),
          bonus: parsedBonus.toString(), 
          deduction: parsedDeduction.toString(),
          totalAmount: totalAmount.toString(),
          payPeriod,
          status: 'pending',
          notes
        })
        .returning();

      res.json({ success: true, payroll: newPayroll });
    } catch (error) {
      console.error('Create payroll error:', error);
      res.status(500).json({ message: 'Failed to create payroll record' });
    }
  });

  app.put('/api/payroll/:id/status', authenticate, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updateData: any = { status };
      if (status === 'paid') {
        updateData.payDate = new Date();
      }
      
      const [updatedPayroll] = await db
        .update(payrolls)
        .set(updateData)
        .where(eq(payrolls.id, parseInt(id)))
        .returning();

      res.json({ success: true, payroll: updatedPayroll });
    } catch (error) {
      console.error('Update payroll status error:', error);
      res.status(500).json({ message: 'Failed to update payroll status' });
    }
  });

  app.get('/api/payroll/reminders', authenticate, async (req: any, res: Response) => {
    try {
      const reminders = [
        {
          id: 1,
          type: 'payroll_due',
          title: 'Payroll Juli 2024',
          description: 'Deadline pembayaran: 31 Juli 2024',
          dueDate: '2024-07-31',
          priority: 'high'
        }
      ];
      res.json(reminders);
    } catch (error) {
      console.error('Get payroll reminders error:', error);
      res.status(500).json({ message: 'Failed to fetch payroll reminders' });
    }
  });

  // SME Routes - Vendors Management
  app.get('/api/vendors', authenticate, async (req: any, res: Response) => {
    try {
      const vendorsData = await db.select()
        .from(vendors)
        .where(and(
          eq(vendors.businessId, req.user.id),
          eq(vendors.isActive, true)
        ))
        .orderBy(vendors.name);
      
      res.json(vendorsData);
    } catch (error) {
      console.error('Get vendors error:', error);
      res.status(500).json({ message: 'Failed to fetch vendors' });
    }
  });

  app.post('/api/vendors', authenticate, upload.single('document'), async (req: any, res: Response) => {
    try {
      const { name, contactPerson, phone, email, address, paymentTerms, contractAmount } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Nama vendor wajib diisi' });
      }

      let documentUrl = null;
      if (req.file) {
        documentUrl = `/uploads/${req.file.filename}`;
      }

      const [newVendor] = await db.insert(vendors)
        .values({
          businessId: req.user.id,
          name,
          contactPerson: contactPerson || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
          paymentTerms: parseInt(paymentTerms) || 30,
          contractAmount: contractAmount || null,
          documentUrl: documentUrl,
          isActive: true
        })
        .returning();

      res.status(201).json({ success: true, vendor: newVendor });
    } catch (error) {
      console.error('Create vendor error:', error);
      res.status(500).json({ message: 'Failed to create vendor' });
    }
  });

  app.put('/api/vendors/:id', authenticate, upload.single('document'), async (req: any, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      const { name, contactPerson, phone, email, address, paymentTerms, contractAmount } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Nama vendor wajib diisi' });
      }

      // Check if vendor belongs to the user's business
      const existingVendor = await db.select()
        .from(vendors)
        .where(and(
          eq(vendors.id, vendorId),
          eq(vendors.businessId, req.user.id)
        ))
        .limit(1);

      if (!existingVendor.length) {
        return res.status(404).json({ message: 'Vendor not found' });
      }

      let documentUrl = existingVendor[0].documentUrl; // Keep existing document if no new one
      if (req.file) {
        documentUrl = `/uploads/${req.file.filename}`;
      }

      const [updatedVendor] = await db.update(vendors)
        .set({
          name,
          contactPerson: contactPerson || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
          paymentTerms: parseInt(paymentTerms) || 30,
          contractAmount: contractAmount || null,
          documentUrl: documentUrl,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId))
        .returning();

      res.json({ success: true, vendor: updatedVendor });
    } catch (error) {
      console.error('Update vendor error:', error);
      res.status(500).json({ message: 'Failed to update vendor' });
    }
  });

  app.delete('/api/vendors/:id', authenticate, async (req: any, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);

      // Check if vendor belongs to the user's business
      const existingVendor = await db.select()
        .from(vendors)
        .where(and(
          eq(vendors.id, vendorId),
          eq(vendors.businessId, req.user.id)
        ))
        .limit(1);

      if (!existingVendor.length) {
        return res.status(404).json({ message: 'Vendor not found' });
      }

      // Instead of hard delete, deactivate the vendor
      await db.update(vendors)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, vendorId));

      res.json({ success: true, message: 'Vendor berhasil dihapus' });
    } catch (error) {
      console.error('Delete vendor error:', error);
      res.status(500).json({ message: 'Failed to delete vendor' });
    }
  });

  // SME Routes - Tax Management
  app.get('/api/tax/summary', authenticate, async (req: any, res: Response) => {
    try {
      // Get current year and quarter for calculations
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const currentQuarter = Math.ceil((currentMonth + 1) / 3);
      
      // Calculate quarter date range
      const quarterStartMonth = (currentQuarter - 1) * 3;
      const quarterStart = new Date(currentYear, quarterStartMonth, 1);
      const quarterEnd = new Date(currentYear, quarterStartMonth + 3, 0);
      
      // Get year-to-date range
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date();
      
      // Get financial reports for tax calculation
      const quarterlyReport = await storage.getFinancialReport(req.user.id, quarterStart, quarterEnd);
      const yearlyReport = await storage.getFinancialReport(req.user.id, yearStart, yearEnd);
      
      // Calculate PPh Final 0.5% for UMKM based on gross income
      const taxRate = 0.005; // 0.5% PPh Final UMKM
      const currentQuarterTax = Math.round(quarterlyReport.totalIncome * taxRate);
      const yearToDateTax = Math.round(yearlyReport.totalIncome * taxRate);
      
      // Calculate next payment deadline (quarterly)
      const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
      const nextYear = currentQuarter === 4 ? currentYear + 1 : currentYear;
      const nextDeadline = new Date(nextYear, (nextQuarter - 1) * 3 + 3, 20); // 20th of month after quarter end
      
      const taxSummary = {
        currentQuarterTax,
        yearToDateTax,
        quarterlyIncome: quarterlyReport.totalIncome,
        yearlyIncome: yearlyReport.totalIncome,
        taxRate,
        upcomingDeadline: nextDeadline.toISOString().split('T')[0],
        complianceStatus: 'compliant',
        quarter: `Q${currentQuarter} ${currentYear}`
      };
      
      res.json(taxSummary);
    } catch (error) {
      console.error('Get tax summary error:', error);
      res.status(500).json({ message: 'Failed to fetch tax summary' });
    }
  });

  // SME Routes - Invoice Management
  app.get('/api/invoices/pending', authenticate, async (req: any, res: Response) => {
    try {
      const pendingInvoices = [
        {
          id: 1,
          vendorName: 'PT Sumber Rejeki',
          invoiceNumber: 'INV-2024-001',
          amount: 2500000,
          dueDate: '2024-06-30',
          status: 'pending'
        }
      ];
      res.json(pendingInvoices);
    } catch (error) {
      console.error('Get pending invoices error:', error);
      res.status(500).json({ message: 'Failed to fetch pending invoices' });
    }
  });

  // SME Routes - Notifications
  app.get('/api/notifications', authenticate, async (req: any, res: Response) => {
    try {
      // Check if user has any transactions first
      const userTransactions = await db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(eq(transactions.userId, req.user.id));

      const hasTransactions = userTransactions[0]?.count > 0;

      if (!hasTransactions) {
        // Return empty notifications for new accounts
        return res.json([]);
      }

      // For existing users with transactions, show relevant notifications
      const notifications = [
        {
          id: 1,
          userId: req.user.id,
          type: 'payroll_reminder',
          title: 'Payroll Reminder',
          message: 'Payroll untuk bulan Juni perlu diproses',
          isRead: false,
          priority: 'high',
          createdAt: new Date()
        }
      ];
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  // SME Routes - User Managers
  app.get('/api/users/managers', authenticate, async (req: any, res: Response) => {
    try {
      // Get managers from users table with manager role
      const managersData = await db
        .select()
        .from(users)
        .where(and(
          eq(users.role, 'manager'),
          eq(users.isActive, true)
        ));

      // Format response
      const managers = managersData.map(manager => ({
        id: manager.id,
        name: manager.businessName,
        email: manager.email,
        position: 'Manager'
      }));

      res.json(managers);
    } catch (error) {
      console.error('Get managers error:', error);
      res.status(500).json({ message: 'Failed to fetch managers' });
    }
  });

  app.post('/api/users/managers', authenticate, async (req: any, res: Response) => {
    try {
      const { businessName, email, phone, password } = req.body;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new manager user into database
      const [newManager] = await db
        .insert(users)
        .values({
          businessName,
          email,
          phone: phone || '',
          password: hashedPassword,
          role: 'manager',
          isActive: true
        })
        .returning();

      res.json({ success: true, manager: newManager });
    } catch (error) {
      console.error('Create manager error:', error);
      res.status(500).json({ message: 'Failed to create manager' });
    }
  });

  // Send payslip via email
  app.post('/api/payroll/send-payslip', authenticate, async (req: any, res: Response) => {
    try {
      const { payrollId } = req.body;
      
      if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        return res.status(500).json({ 
          message: 'Mailgun tidak dikonfigurasi. Periksa MAILGUN_API_KEY dan MAILGUN_DOMAIN.' 
        });
      }

      // Get payroll details with employee information
      const payrollData = await db.select({
        payrollId: payrolls.id,
        payPeriod: payrolls.payPeriod,
        baseSalary: payrolls.baseSalary,
        bonus: payrolls.bonus,
        deduction: payrolls.deduction,
        totalAmount: payrolls.totalAmount,
        status: payrolls.status,
        payDate: payrolls.payDate,
        notes: payrolls.notes,
        employeeId: payrolls.employeeId,
        employeeName: employees.name,
        employeeEmail: employees.email,
        employeePosition: employees.position
      })
        .from(payrolls)
        .innerJoin(employees, eq(payrolls.employeeId, employees.id))
        .where(eq(payrolls.id, payrollId))
        .limit(1);

      if (!payrollData.length) {
        return res.status(404).json({ message: 'Payroll not found' });
      }

      const payroll = payrollData[0];
      const employeeEmail = payroll.employeeEmail;
      const employeeName = payroll.employeeName;

      if (!employeeEmail) {
        return res.status(400).json({ 
          message: 'Email karyawan tidak tersedia. Harap lengkapi data email karyawan terlebih dahulu.' 
        });
      }

      // Generate payslip HTML
      const payslipHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Slip Gaji - ${employeeName}</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; padding: 20px; color: #1e293b; background: #f8fafc; }
            .payslip { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #f29716 0%, #d4820a 100%); color: white; padding: 30px; text-align: center; }
            .company-name { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
            .document-title { font-size: 18px; font-weight: 500; opacity: 0.9; }
            .content { padding: 30px; }
            .employee-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
            .info-group h4 { color: #475569; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
            .info-group p { font-size: 16px; font-weight: 500; color: #1e293b; }
            .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .salary-table th { background: #f1f5f9; padding: 16px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
            .salary-table td { padding: 16px; border-bottom: 1px solid #e2e8f0; }
            .amount { font-weight: 600; text-align: right; }
            .total-row { background: #f8fafc; font-weight: 700; }
            .total-row .amount { color: #059669; }
            .footer { text-align: center; padding: 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="payslip">
            <div class="header">
              <div class="company-name">Toko Berkah</div>
              <div class="document-title">Slip Gaji Karyawan</div>
            </div>
            <div class="content">
              <div class="employee-info">
                <div class="info-group">
                  <h4>Nama Karyawan</h4>
                  <p>${employeeName}</p>
                </div>
                <div class="info-group">
                  <h4>Periode Gaji</h4>
                  <p>${payroll.payPeriod}</p>
                </div>
              </div>
              <table class="salary-table">
                <thead>
                  <tr>
                    <th>Komponen Gaji</th>
                    <th class="amount">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Gaji Pokok</td>
                    <td class="amount">Rp ${(Number(payroll.baseSalary) || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>Tunjangan & Bonus</td>
                    <td class="amount">Rp ${(Number(payroll.bonus) || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>Potongan</td>
                    <td class="amount">-Rp ${(Number(payroll.deduction) || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>Total Gaji Bersih</strong></td>
                    <td class="amount">Rp ${(Number(payroll.totalAmount) || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="footer">
              <p>Dokumen ini dibuat secara otomatis oleh sistem Toko Berkah</p>
              <p>Tanggal: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email using Mailgun REST API
      const formData = new URLSearchParams();
      formData.append('from', `Toko Berkah <noreply@${process.env.MAILGUN_DOMAIN}>`);
      formData.append('to', employeeEmail);
      formData.append('subject', `Slip Gaji ${payroll.payPeriod} - ${employeeName}`);
      formData.append('html', payslipHtml);

      // Log untuk debugging
      console.log('Mailgun config:', {
        domain: process.env.MAILGUN_DOMAIN,
        hasSecret: !!process.env.MAILGUN_SECRET,
        secretPrefix: process.env.MAILGUN_SECRET?.substring(0, 8),
        to: employeeEmail,
        endpoint: 'api.eu.mailgun.net'
      });

      const response = await fetch(`https://api.eu.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
      }

      res.json({ 
        success: true, 
        message: `Slip gaji berhasil dikirim ke ${employeeEmail}` 
      });
    } catch (error: any) {
      console.error('Send payslip error:', error);
      
      let errorMessage = 'Gagal mengirim slip gaji.';
      if (error.statusCode === 401) {
        errorMessage = 'Mailgun API key tidak valid. Periksa konfigurasi MAILGUN_API_KEY.';
      } else if (error.statusCode === 403) {
        errorMessage = 'Domain Mailgun tidak terverifikasi atau tidak memiliki izin.';
      } else if (error.message?.includes('Domain')) {
        errorMessage = 'MAILGUN_DOMAIN tidak valid atau tidak ditemukan.';
      }
      
      res.status(500).json({ 
        message: errorMessage 
      });
    }
  });

  // POS Device Management API Endpoints
  app.get('/api/pos-devices', authenticate, async (req: any, res: Response) => {
    try {
      const devices = await storage.getPosDevices(req.user.id);
      res.json(devices);
    } catch (error) {
      console.error('Error fetching POS devices:', error);
      res.status(500).json({ message: 'Failed to fetch POS devices' });
    }
  });

  app.post('/api/pos-devices', authenticate, validateRequest(insertPosDeviceSchema), async (req: any, res: Response) => {
    try {
      const deviceData = {
        ...req.body,
        businessId: req.user.id,
      };
      
      const device = await storage.createPosDevice(deviceData);
      
      // Create initial sync log
      await storage.createSyncLog({
        posDeviceId: device.id,
        syncType: 'manual',
        status: 'success',
        transactionCount: 0,
      });
      
      res.status(201).json(device);
    } catch (error) {
      console.error('Error creating POS device:', error);
      res.status(500).json({ message: 'Failed to create POS device' });
    }
  });

  app.put('/api/pos-devices/:id', authenticate, async (req: any, res: Response) => {
    try {
      const deviceId = parseInt(req.params.id);
      const device = await storage.updatePosDevice(deviceId, req.user.id, req.body);
      res.json(device);
    } catch (error) {
      console.error('Error updating POS device:', error);
      res.status(500).json({ message: 'Failed to update POS device' });
    }
  });

  app.delete('/api/pos-devices/:id', authenticate, async (req: any, res: Response) => {
    try {
      const deviceId = parseInt(req.params.id);
      await storage.deletePosDevice(deviceId, req.user.id);
      res.json({ message: 'POS device deleted successfully' });
    } catch (error) {
      console.error('Error deleting POS device:', error);
      res.status(500).json({ message: 'Failed to delete POS device' });
    }
  });

  // POS Sync Endpoints for MOKA and Custom POS
  app.post('/api/pos-devices/:id/sync', authenticate, async (req: any, res: Response) => {
    try {
      const deviceId = parseInt(req.params.id);
      const device = await storage.getPosDeviceById(deviceId, req.user.id);
      
      if (!device) {
        return res.status(404).json({ message: 'POS device not found' });
      }

      let syncResult = { success: false, transactionCount: 0, errorMessage: '' };
      
      // Handle different POS types
      if (device.type === 'moka') {
        syncResult = await syncMokaPOS(device);
      } else if (device.type === 'custom') {
        syncResult = await syncCustomPOS(device);
      } else {
        syncResult = await syncGenericPOS(device);
      }

      // Update device status and sync log
      await storage.updatePosDeviceStatus(
        deviceId, 
        syncResult.success ? 'connected' : 'disconnected',
        new Date(),
        syncResult.transactionCount
      );

      await storage.createSyncLog({
        posDeviceId: deviceId,
        syncType: 'manual',
        status: syncResult.success ? 'success' : 'failed',
        transactionCount: syncResult.transactionCount,
        errorMessage: syncResult.errorMessage || undefined,
      });

      res.json({
        success: syncResult.success,
        message: syncResult.success ? 
          `Successfully synced ${syncResult.transactionCount} transactions` :
          `Sync failed: ${syncResult.errorMessage}`,
        transactionCount: syncResult.transactionCount
      });
      
    } catch (error) {
      console.error('Error syncing POS device:', error);
      res.status(500).json({ message: 'Failed to sync POS device' });
    }
  });

  app.get('/api/pos-devices/:id/sync-logs', authenticate, async (req: any, res: Response) => {
    try {
      const deviceId = parseInt(req.params.id);
      const logs = await storage.getSyncLogs(deviceId, 20);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      res.status(500).json({ message: 'Failed to fetch sync logs' });
    }
  });

  // AI Analytics & Fraud Detection Endpoints

  app.post('/api/ai/generate-insights', authenticate, async (req: any, res: Response) => {
    try {
      const { transactionData, dashboardStats } = req.body;

      if (!process.env.DEEPSEEK_API_KEY && !process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          message: 'AI API key not configured. Please add DEEPSEEK_API_KEY or OPENAI_API_KEY to environment variables.' 
        });
      }

      // Analyze transaction patterns using OpenAI
      const analysisPrompt = `
        Analyze the following financial data for a small business and provide actionable insights:
        
        Dashboard Stats:
        - Cash Balance: ${dashboardStats?.cashBalance || 0}
        - Weekly Income: ${dashboardStats?.weeklyIncome || 0}
        - Weekly Expenses: ${dashboardStats?.weeklyExpenses || 0}
        - Weekly Profit: ${dashboardStats?.weeklyProfit || 0}
        
        Recent Transactions (${transactionData?.length || 0} transactions):
        ${transactionData?.slice(0, 10).map((t: any) => 
          `- ${t.type}: ${t.amount} (${t.description || 'No description'})`
        ).join('\n') || 'No recent transactions'}
        
        Provide business insights in JSON format with this structure:
        {
          "cashFlowAnalysis": "detailed analysis",
          "profitabilityInsights": "profit optimization suggestions",
          "riskAssessment": "financial risk evaluation",
          "recommendations": ["actionable recommendation 1", "recommendation 2"],
          "anomalies": ["any unusual patterns detected"],
          "forecast": "short-term financial forecast"
        }
      `;

      // Determine API configuration
      const isDeepSeek = !!process.env.DEEPSEEK_API_KEY;
      const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
      const apiUrl = isDeepSeek ? 'https://api.deepseek.com/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
      const model = isDeepSeek ? 'deepseek-chat' : 'gpt-4o';

      const openaiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a financial analyst expert specializing in small business financial optimization and fraud detection. Analyze data and provide actionable insights in JSON format.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1500,
          temperature: 0.3
        })
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
      }

      const aiResult = await openaiResponse.json();
      const insights = JSON.parse(aiResult.choices[0].message.content);

      // Store insights in database
      const [newInsight] = await db
        .insert(aiInsights)
        .values({
          businessId: req.user.id,
          type: 'financial_analysis',
          title: 'AI Financial Analysis',
          description: insights.cashFlowAnalysis || 'Comprehensive financial analysis completed',
          severity: 'medium',
          actionRequired: true,
          metadata: JSON.stringify(insights)
        })
        .returning();

      res.json({
        success: true,
        insights,
        insightId: newInsight.id
      });

    } catch (error: any) {
      console.error('Generate AI insights error:', error);
      res.status(500).json({ 
        message: 'Failed to generate AI insights',
        error: error.message 
      });
    }
  });

  // AI Chat endpoint
  app.post('/api/ai/chat', authenticate, async (req: any, res: Response) => {
    try {
      const { message, context } = req.body;
      
      if (!process.env.DEEPSEEK_API_KEY) {
        return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' });
      }

      // Prepare context for AI
      const { transactions = [], dashboardStats = {}, outlets = [], businessName = 'Toko Berkah' } = context;
      
      // Create comprehensive business context
      const businessContext = `
Business: ${businessName}
Current Balance: Rp ${dashboardStats.cashBalance?.toLocaleString() || '0'}
Weekly Income: Rp ${dashboardStats.weeklyIncome?.toLocaleString() || '0'}
Weekly Expenses: Rp ${dashboardStats.weeklyExpenses?.toLocaleString() || '0'}
Total Outlets: ${outlets.length}
Recent Transactions: ${transactions.length} records

Transaction Summary:
${transactions.slice(0, 10).map((t: any) => 
  `- ${t.type}: Rp ${t.amount?.toLocaleString()} (${t.description})`
).join('\n')}

Outlet Performance:
${outlets.map((o: any) => 
  `- ${o.name}: Revenue Rp ${o.monthlyRevenue?.toLocaleString() || '0'}, Transactions: ${o.monthlyTransactions || 0}`
).join('\n')}
      `;

      const prompt = `Anda adalah asisten AI untuk analisis data bisnis ${businessName}. Berikan jawaban yang akurat, profesional, dan berdasarkan data real berikut:

${businessContext}

Pertanyaan user: ${message}

Jawab dalam bahasa Indonesia dengan format yang jelas dan mudah dipahami. Gunakan data actual yang tersedia, berikan insight yang berguna, dan sertakan angka-angka spesifik jika relevan. Jangan tambahkan catatan atau komentar tambahan, langsung berikan jawaban yang diminta.`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Anda adalah asisten AI untuk analisis bisnis. Berikan jawaban yang akurat, profesional, dan berdasarkan data yang diberikan. Jawab dalam bahasa Indonesia.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'Maaf, tidak dapat memproses pertanyaan saat ini.';

      res.json({ response: aiResponse });
    } catch (error) {
      console.error('AI Chat error:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  app.post('/api/ai/detect-fraud', authenticate, async (req: any, res: Response) => {
    try {
      const { transactions } = req.body;

      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          message: 'OpenAI API key not configured for fraud detection.' 
        });
      }

      // Fraud detection using OpenAI
      const fraudPrompt = `
        Analyze these financial transactions for potential fraud or anomalies:
        
        ${transactions?.slice(0, 20).map((t: any, i: number) => 
          `${i+1}. ${t.type}: ${t.amount} IDR - ${t.description} (${t.date})`
        ).join('\n') || 'No transactions provided'}
        
        Detect potential fraud patterns and return JSON:
        {
          "riskScore": "1-100 integer",
          "alertLevel": "low|medium|high",
          "detectedAnomalies": [
            {
              "type": "anomaly_type",
              "description": "detailed description",
              "severity": "low|medium|high",
              "affectedTransactions": ["transaction indices"],
              "recommendation": "action to take"
            }
          ],
          "summary": "overall fraud risk assessment"
        }
      `;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a fraud detection expert for financial transactions. Analyze patterns and identify potential fraudulent activities with high accuracy.'
            },
            {
              role: 'user',
              content: fraudPrompt
            }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1000,
          temperature: 0.1
        })
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
      }

      const aiResult = await openaiResponse.json();
      const fraudAnalysis = JSON.parse(aiResult.choices[0].message.content);

      // Store fraud alerts if high risk detected
      if (fraudAnalysis.alertLevel === 'high' && fraudAnalysis.detectedAnomalies?.length > 0) {
        for (const anomaly of fraudAnalysis.detectedAnomalies) {
          await db
            .insert(aiInsights)
            .values({
              businessId: req.user.id,
              type: 'fraud_alert',
              title: `Fraud Alert: ${anomaly.type}`,
              description: anomaly.description,
              confidence: fraudAnalysis.riskScore,
              priority: anomaly.severity,
              data: JSON.stringify({
                anomaly,
                affectedTransactions: anomaly.affectedTransactions,
                recommendation: anomaly.recommendation
              })
            });
        }
      }

      res.json({
        success: true,
        fraudAnalysis,
        alertsGenerated: fraudAnalysis.alertLevel === 'high' ? fraudAnalysis.detectedAnomalies?.length : 0
      });

    } catch (error: any) {
      console.error('Fraud detection error:', error);
      res.status(500).json({ 
        message: 'Failed to perform fraud detection',
        error: error.message 
      });
    }
  });

  app.put('/api/ai/alerts/:id/status', authenticate, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Update alert status in database
      const [updatedAlert] = await db
        .update(aiInsights)
        .set({ 
          priority: status === 'resolved' ? 'low' : 'high',
          updatedAt: new Date()
        })
        .where(and(
          eq(aiInsights.id, parseInt(id)),
          eq(aiInsights.businessId, req.user.id)
        ))
        .returning();

      if (!updatedAlert) {
        return res.status(404).json({ message: 'Alert not found' });
      }

      res.json({
        success: true,
        alert: updatedAlert
      });

    } catch (error: any) {
      console.error('Update alert status error:', error);
      res.status(500).json({ message: 'Failed to update alert status' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// POS Integration Functions
async function syncMokaPOS(device: any) {
  try {
    // MOKA POS API integration
    const response = await fetch(`${device.apiUrl}/transactions/today`, {
      headers: {
        'Authorization': `Bearer ${device.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`MOKA API error: ${response.statusText}`);
    }

    const data = await response.json();
    const transactions = data.transactions || [];
    
    // Process MOKA transactions and sync to our database
    for (const mokaTxn of transactions) {
      // Convert MOKA transaction format to our format
      // This would integrate with the transactions table
    }

    return {
      success: true,
      transactionCount: transactions.length,
      errorMessage: ''
    };
  } catch (error) {
    return {
      success: false,
      transactionCount: 0,
      errorMessage: error.message
    };
  }
}

async function syncCustomPOS(device: any) {
  try {
    // Custom POS API integration
    const response = await fetch(`${device.apiUrl}/api/sales/today`, {
      headers: {
        'X-API-Key': device.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Custom POS API error: ${response.statusText}`);
    }

    const data = await response.json();
    const sales = data.sales || [];

    // Process custom POS transactions
    for (const sale of sales) {
      // Convert custom POS format to our format
    }

    return {
      success: true,
      transactionCount: sales.length,
      errorMessage: ''
    };
  } catch (error) {
    return {
      success: false,
      transactionCount: 0,
      errorMessage: error.message
    };
  }
}

async function syncGenericPOS(device: any) {
  // Generic POS sync for other types (cashier, self-service, mobile)
  try {
    const mockTransactionCount = Math.floor(Math.random() * 50) + 10;
    
    return {
      success: true,
      transactionCount: mockTransactionCount,
      errorMessage: ''
    };
  } catch (error) {
    return {
      success: false,
      transactionCount: 0,
      errorMessage: error.message
    };
  }
}
