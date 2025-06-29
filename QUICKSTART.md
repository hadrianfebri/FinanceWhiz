# Quick Start Guide - FinanceWhiz.AI

## 🚀 Fast Setup (5 Minutes)

### Prerequisites
- Node.js 20.x atau lebih baru
- PostgreSQL 16.x atau lebih baru

### 1. Clone & Install
```bash
git clone <repository-url>
cd financewhiz-ai
npm install
```

### 2. Database Setup
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE financewhiz_db;
CREATE USER financewhiz_user WITH PASSWORD 'demo123';
GRANT ALL PRIVILEGES ON DATABASE financewhiz_db TO financewhiz_user;
\q
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file dengan database credentials:
DATABASE_URL=postgresql://financewhiz_user:demo123@localhost:5432/financewhiz_db
PGHOST=localhost
PGPORT=5432
PGUSER=financewhiz_user
PGPASSWORD=demo123
PGDATABASE=financewhiz_db
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=development
```

### 4. Initialize Database
```bash
# Push schema
npm run db:push

# Seed demo data
tsx scripts/seed.ts
```

### 5. Start Application
```bash
npm run dev
```

Buka http://localhost:5000

### 6. Demo Login
- **Email**: demo@financewhiz.ai
- **Password**: demo123

## 📊 Demo Data Included

- ✅ 12 kategori transaksi (income & expense)
- ✅ 3 outlet bisnis (Jakarta, Bandung, Surabaya)  
- ✅ 4 karyawan dengan data payroll
- ✅ 2 vendor supplier
- ✅ 9 transaksi sample untuk testing
- ✅ Dashboard dengan data real dan laporan keuangan

## 🔧 Optional API Keys

Untuk fitur AI dan email (tidak wajib untuk testing):

```env
# AI Analytics (Optional)
DEEPSEEK_API_KEY=your_deepseek_key
OPENAI_API_KEY=your_openai_key

# Email Payslips (Optional)
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=your_domain
MAILGUN_SECRET=your_secret
```

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql
```

### Port 5000 Already in Use
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

### Permission Issues
```bash
chmod 755 uploads/
chmod +x setup.sh
```

## 📖 Next Steps

1. Explore dashboard dan fitur-fitur utama
2. Tambah transaksi baru di menu Transaksi
3. Lihat laporan keuangan di menu Laporan
4. Test payroll management dan vendor tracking
5. Setup API keys untuk fitur AI dan email

Untuk dokumentasi lengkap, baca `README.md`