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
} from "@shared/schema";
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
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
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
      const stats = await storage.getDashboardStats(req.user.id);
      
      // Mock AI insights based on financial data
      const insights = [
        "Pengeluaran Anda meningkat 15% dari minggu lalu, terutama di kategori bahan baku. Pertimbangkan untuk mencari supplier dengan harga lebih kompetitif.",
        `Saldo kas Anda saat ini Rp ${stats.cashBalance.toLocaleString('id-ID')}. Pastikan untuk menjaga cadangan kas untuk operasional harian.`,
        "Tren penjualan menunjukkan peningkatan pada hari Jumat dan Sabtu. Pertimbangkan untuk menambah stok pada hari-hari tersebut."
      ];

      const randomInsight = insights[Math.floor(Math.random() * insights.length)];
      
      res.json({ insight: randomInsight });
    } catch (error) {
      console.error('AI insights error:', error);
      res.status(500).json({ message: 'Failed to generate insights' });
    }
  });

  // SME Routes - Outlets Management
  app.get('/api/outlets', authenticate, async (req: any, res: Response) => {
    try {
      // Mock outlet data for demonstration
      const outlets = [
        {
          id: 1,
          businessId: req.user.id,
          name: 'Cabang Utama',
          address: 'Jl. Sudirman No. 123, Jakarta',
          phone: '021-12345678',
          managerId: 1,
          managerName: 'Ahmad Rizki',
          isActive: true,
          monthlyTarget: 50000000,
          currentMonthSales: 42000000
        },
        {
          id: 2,
          businessId: req.user.id,
          name: 'Cabang Mall',
          address: 'Mall Central Park Lt. 2, Jakarta',
          phone: '021-87654321',
          managerId: 2,
          managerName: 'Siti Nurhaliza',
          isActive: true,
          monthlyTarget: 35000000,
          currentMonthSales: 28000000
        }
      ];
      res.json(outlets);
    } catch (error) {
      console.error('Get outlets error:', error);
      res.status(500).json({ message: 'Failed to fetch outlets' });
    }
  });

  app.post('/api/outlets', authenticate, async (req: any, res: Response) => {
    try {
      const outletData = { 
        ...req.body, 
        businessId: req.user.id,
        id: Date.now(),
        isActive: true,
        monthlyTarget: req.body.monthlyTarget || 50000000,
        currentMonthSales: 0,
        managerName: req.body.managerName || 'Belum Ditentukan'
      };
      res.json(outletData);
    } catch (error) {
      console.error('Create outlet error:', error);
      res.status(500).json({ message: 'Failed to create outlet' });
    }
  });

  app.put('/api/outlets/:id', authenticate, async (req: any, res: Response) => {
    try {
      const outletId = parseInt(req.params.id);
      const updateData = { 
        ...req.body, 
        id: outletId,
        businessId: req.user.id,
        updatedAt: new Date()
      };
      res.json(updateData);
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
      // Mock employee data
      const employees = [
        {
          id: 1,
          businessId: req.user.id,
          outletId: 1,
          name: 'Ahmad Rizki',
          position: 'Manager',
          email: 'ahmad@example.com',
          phone: '081234567890',
          baseSalary: 6000000,
          isActive: true
        },
        {
          id: 2,
          businessId: req.user.id,
          outletId: 2,
          name: 'Siti Nurhaliza',
          position: 'Kasir',
          email: 'siti@example.com',
          phone: '087654321098',
          baseSalary: 3500000,
          isActive: true
        }
      ];
      res.json(employees);
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({ message: 'Failed to fetch employees' });
    }
  });

  // SME Routes - Payroll Management
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
      const vendors = [
        {
          id: 1,
          businessId: req.user.id,
          name: 'PT Sumber Rejeki',
          contactPerson: 'Agus Setiawan',
          phone: '081234567890',
          email: 'agus@sumberrejeki.com',
          address: 'Jl. Industri No. 45, Jakarta',
          paymentTerms: 30,
          isActive: true
        }
      ];
      res.json(vendors);
    } catch (error) {
      console.error('Get vendors error:', error);
      res.status(500).json({ message: 'Failed to fetch vendors' });
    }
  });

  // SME Routes - Tax Management
  app.get('/api/tax/summary', authenticate, async (req: any, res: Response) => {
    try {
      const taxSummary = {
        currentQuarterTax: 600000,
        yearToDateTax: 1075000,
        upcomingDeadline: '2024-10-31',
        complianceStatus: 'compliant'
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
      const managers = [
        {
          id: 1,
          name: 'Ahmad Rizki',
          email: 'ahmad@example.com',
          position: 'Manager Cabang Utama'
        },
        {
          id: 2,
          name: 'Siti Nurhaliza',
          email: 'siti@example.com',
          position: 'Manager Cabang Mall'
        }
      ];
      res.json(managers);
    } catch (error) {
      console.error('Get managers error:', error);
      res.status(500).json({ message: 'Failed to fetch managers' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
