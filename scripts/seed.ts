#!/usr/bin/env tsx

import { db } from '../server/db.js';
import { users, categories, transactions, outlets, employees, vendors } from '../shared/schema.js';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create demo user
    console.log('👤 Creating demo user...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const [user] = await db.insert(users).values({
      businessName: 'Toko Berkah',
      email: 'demo@financewhiz.ai',
      password: hashedPassword,
      phone: '+62812345678',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      role: 'owner'
    }).returning();

    // Create categories
    console.log('📂 Creating categories...');
    const categoryData = [
      // Income categories
      { name: 'Penjualan Produk', type: 'income' as const, userId: user.id },
      { name: 'Jasa Konsultasi', type: 'income' as const, userId: user.id },
      { name: 'Komisi Penjualan', type: 'income' as const, userId: user.id },
      { name: 'Pendapatan Lain', type: 'income' as const, userId: user.id },
      // Expense categories
      { name: 'Pembelian Stok', type: 'expense' as const, userId: user.id },
      { name: 'Biaya Operasional', type: 'expense' as const, userId: user.id },
      { name: 'Marketing & Promosi', type: 'expense' as const, userId: user.id },
      { name: 'Transportasi', type: 'expense' as const, userId: user.id },
      { name: 'Utilitas (Listrik/Air)', type: 'expense' as const, userId: user.id },
      { name: 'Sewa Tempat', type: 'expense' as const, userId: user.id },
      { name: 'Gaji Karyawan', type: 'expense' as const, userId: user.id },
      { name: 'Peralatan & Supplies', type: 'expense' as const, userId: user.id }
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();

    // Create outlets
    console.log('🏪 Creating outlets...');
    const outletData = [
      {
        businessId: user.id,
        name: 'Cabang Utama',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        phone: '+62812345678',
        managerId: user.id,
        isActive: true
      },
      {
        businessId: user.id,
        name: 'Cabang Bandung',
        address: 'Jl. Asia Afrika No. 45, Bandung',
        phone: '+62812345679',
        managerId: user.id,
        isActive: true
      },
      {
        businessId: user.id,
        name: 'Cabang Surabaya',
        address: 'Jl. Tunjungan No. 67, Surabaya',
        phone: '+62812345680',
        managerId: user.id,
        isActive: true
      }
    ];

    const insertedOutlets = await db.insert(outlets).values(outletData).returning();

    // Create employees
    console.log('👥 Creating employees...');
    const employeeData = [
      {
        businessId: user.id,
        outletId: insertedOutlets[0].id,
        name: 'Ahmad Rizki',
        position: 'Kasir',
        email: 'ahmad@tokoberkah.com',
        phone: '+62812345681',
        baseSalary: '3500000'
      },
      {
        businessId: user.id,
        outletId: insertedOutlets[0].id,
        name: 'Siti Nurhaliza',
        position: 'Admin',
        email: 'siti@tokoberkah.com',
        phone: '+62812345682',
        baseSalary: '4000000'
      },
      {
        businessId: user.id,
        outletId: insertedOutlets[1].id,
        name: 'Budi Santoso',
        position: 'Manager Cabang',
        email: 'budi@tokoberkah.com',
        phone: '+62812345683',
        baseSalary: '6000000'
      },
      {
        businessId: user.id,
        outletId: insertedOutlets[2].id,
        name: 'Lisa Kartika',
        position: 'Sales Representative',
        email: 'lisa@tokoberkah.com',
        phone: '+62812345684',
        baseSalary: '3800000'
      }
    ];

    await db.insert(employees).values(employeeData);

    // Create vendors
    console.log('🤝 Creating vendors...');
    const vendorData = [
      {
        businessId: user.id,
        name: 'PT Supplier Utama',
        contactPerson: 'Pak Wijaya',
        phone: '+62813456789',
        email: 'supplier@ptutama.com',
        address: 'Jl. Industri No. 89, Jakarta',
        paymentTerms: 30,
        contractAmount: '150000000',
        isActive: true
      },
      {
        businessId: user.id,
        name: 'CV Bahan Baku Jaya',
        contactPerson: 'Bu Sari',
        phone: '+62814567890',
        email: 'cv@bahanbaku.com',
        address: 'Jl. Perdagangan No. 234, Surabaya',
        paymentTerms: 14,
        contractAmount: '85000000',
        isActive: true
      }
    ];

    await db.insert(vendors).values(vendorData);

    // Create sample transactions
    console.log('💰 Creating sample transactions...');
    const transactionData = [
      // Recent June 2025 transactions
      {
        userId: user.id,
        categoryId: insertedCategories[0].id, // Penjualan Produk
        amount: '38000000',
        description: 'Penjualan Juni - Minggu 1',
        notes: 'Target Q2 on track',
        type: 'income' as const,
        date: new Date('2025-06-02'),
        outletId: insertedOutlets[0].id
      },
      {
        userId: user.id,
        categoryId: insertedCategories[4].id, // Pembelian Stok
        amount: '22000000',
        description: 'Pembelian stok semester 2',
        notes: 'Persiapan target H2',
        type: 'expense' as const,
        date: new Date('2025-06-05'),
        outletId: insertedOutlets[0].id
      },
      {
        userId: user.id,
        categoryId: insertedCategories[1].id, // Jasa Konsultasi
        amount: '18500000',
        description: 'Konsultasi digital transformation',
        notes: 'Proyek modernisasi klien',
        type: 'income' as const,
        date: new Date('2025-06-08'),
        outletId: insertedOutlets[0].id
      },
      {
        userId: user.id,
        categoryId: insertedCategories[0].id, // Penjualan Produk
        amount: '45000000',
        description: 'Penjualan produk unggulan',
        notes: 'Product best seller bulan ini',
        type: 'income' as const,
        date: new Date('2025-06-10'),
        outletId: insertedOutlets[1].id
      },
      {
        userId: user.id,
        categoryId: insertedCategories[6].id, // Marketing & Promosi
        amount: '7500000',
        description: 'Campaign mid-year sale',
        notes: 'Promosi tengah tahun',
        type: 'expense' as const,
        date: new Date('2025-06-12'),
        outletId: insertedOutlets[0].id
      },
      {
        userId: user.id,
        categoryId: insertedCategories[2].id, // Komisi Penjualan
        amount: '12000000',
        description: 'Komisi partnership deal',
        notes: 'Revenue sharing dengan partner strategis',
        type: 'income' as const,
        date: new Date('2025-06-14'),
        outletId: insertedOutlets[0].id
      },
      {
        userId: user.id,
        categoryId: insertedCategories[10].id, // Gaji Karyawan
        amount: '3000000',
        description: 'Gaji karyawan Juni',
        notes: 'Gaji reguler + tunjangan',
        type: 'expense' as const,
        date: new Date('2025-06-16'),
        outletId: insertedOutlets[0].id
      },
      {
        userId: user.id,
        categoryId: insertedCategories[3].id, // Pendapatan Lain
        amount: '8500000',
        description: 'Pendapatan dari investasi',
        notes: 'Return dari portfolio investasi',
        type: 'income' as const,
        date: new Date('2025-06-18'),
        outletId: insertedOutlets[0].id
      },
      {
        userId: user.id,
        categoryId: insertedCategories[7].id, // Transportasi
        amount: '3200000',
        description: 'Ekspansi wilayah pengiriman',
        notes: 'Biaya logistik area baru',
        type: 'expense' as const,
        date: new Date('2025-06-20'),
        outletId: insertedOutlets[2].id
      }
    ];

    await db.insert(transactions).values(transactionData);

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Created:');
    console.log(`   - 1 demo user (email: demo@financewhiz.ai, password: demo123)`);
    console.log(`   - ${insertedCategories.length} categories`);
    console.log(`   - ${insertedOutlets.length} outlets`);
    console.log(`   - ${employeeData.length} employees`);
    console.log(`   - ${vendorData.length} vendors`);
    console.log(`   - ${transactionData.length} sample transactions`);
    console.log('');
    console.log('🚀 You can now login with:');
    console.log('   Email: demo@financewhiz.ai');
    console.log('   Password: demo123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };