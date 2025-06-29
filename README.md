# FinanceWhiz.AI - UMKM Financial Management System

Sistem manajemen keuangan berbasis AI untuk Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia dengan fitur multi-outlet, payroll, vendor management, dan analisis fraud detection.

## 🚀 Fitur Utama

- **Dashboard Komprehensif**: Monitoring real-time cash flow dan performa bisnis
- **Multi-Outlet Management**: Kelola beberapa cabang dalam satu sistem
- **AI Analytics**: Insights bisnis menggunakan DeepSeek AI dan fraud detection
- **Payroll Management**: Sistem penggajian dengan slip gaji digital dan email delivery
- **Vendor Management**: Tracking kontrak dan pembayaran supplier
- **Tax Management**: Perhitungan otomatis PPh Final 0.5% untuk UMKM
- **POS Integration**: Sinkronisasi dengan MOKA POS dan Custom POS systems
- **Receipt Processing**: Upload dan analisis struk menggunakan AI
- **Export & Reporting**: Laporan keuangan dalam format PDF dan Excel

## 📋 Prerequisites

Pastikan sistem Anda sudah terinstall:

- **Node.js** 20.x atau lebih baru
- **PostgreSQL** 16.x atau lebih baru
- **npm** atau **yarn**

## 🛠️ Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd financewhiz-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### PostgreSQL Installation (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database
```bash
sudo -u postgres psql

CREATE DATABASE financewhiz_db;
CREATE USER financewhiz_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE financewhiz_db TO financewhiz_user;
\q
```

### 4. Environment Variables

Buat file `.env` di root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://financewhiz_user:your_password@localhost:5432/financewhiz_db
PGHOST=localhost
PGPORT=5432
PGUSER=financewhiz_user
PGPASSWORD=your_password
PGDATABASE=financewhiz_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# AI API Keys (Optional - untuk fitur AI)
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENAI_API_KEY=your_openai_api_key

# Email Configuration (untuk payslip delivery)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_SECRET=your_mailgun_secret

# Application Configuration
NODE_ENV=development
```

### 5. Database Migration

```bash
# Push schema ke database
npm run db:push

# (Optional) Seed data untuk testing
tsx scripts/seed.ts
```

### 6. Start Development Server

```bash
npm run dev
```

Server akan berjalan di:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api

### 7. Demo Account (Optional)

Jika Anda menjalankan seeding database, Anda dapat login dengan:
- **Email**: demo@financewhiz.ai
- **Password**: demo123

Demo account sudah terisi dengan:
- 12 kategori transaksi (income & expense)
- 3 outlet bisnis (Jakarta, Bandung, Surabaya)
- 4 karyawan dengan data payroll
- 2 vendor supplier
- 9 transaksi sample untuk testing

## 📁 Project Structure

```
financewhiz-ai/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utilities and API client
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── db.ts             # Database connection
│   ├── storage.ts        # Data access layer
│   ├── routes.ts         # API endpoints
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
├── uploads/              # File upload directory
└── drizzle.config.ts     # Database configuration
```

## 🔑 API Keys Setup

### DeepSeek AI (untuk AI Analytics)
1. Daftar di [DeepSeek Platform](https://platform.deepseek.com)
2. Generate API key
3. Tambahkan ke `.env` sebagai `DEEPSEEK_API_KEY`

### Mailgun (untuk Email Delivery)
1. Daftar di [Mailgun](https://mailgun.com)
2. Verify domain Anda
3. Dapatkan API key dari dashboard
4. Tambahkan credentials ke `.env`

### OpenAI (Alternative AI Provider)
1. Daftar di [OpenAI Platform](https://platform.openai.com)
2. Generate API key
3. Tambahkan ke `.env` sebagai `OPENAI_API_KEY`

## 🚀 Production Deployment

### 1. Build Application

```bash
npm run build
```

### 2. Environment Setup

Pastikan environment variables production sudah di-set:

```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_jwt_secret
# ... other production configs
```

### 3. Start Production Server

```bash
npm start
```

### 4. Process Manager (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start application dengan PM2
pm2 start npm --name "financewhiz-ai" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔧 Database Commands

```bash
# Push schema changes
npm run db:push

# Generate migrations
npm run db:generate

# Studio (database browser)
npm run db:studio
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

## 📊 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema
- `drizzle-kit studio` - Open database studio
- `tsx scripts/seed.ts` - Seed database with demo data
- `npm run check` - TypeScript type checking

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database connectivity
psql -h localhost -U financewhiz_user -d financewhiz_db
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Permission Issues
```bash
# Fix uploads directory permissions
chmod 755 uploads/
chown -R $USER:$USER uploads/
```

## 🔐 Security Considerations

- Ganti default JWT secret dengan string random minimum 32 karakter
- Gunakan HTTPS di production
- Set up proper firewall rules
- Regular backup database
- Monitor API usage dan set rate limiting
- Validasi semua input user

## 📈 Performance Optimization

- Enable PostgreSQL query optimization
- Setup Redis untuk caching (optional)
- Configure nginx sebagai reverse proxy
- Enable gzip compression
- Setup CDN untuk static assets

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail lengkap.

## 🆘 Support

Untuk support dan pertanyaan:
- Create issue di GitHub repository
- Email: support@financewhiz.ai
- Documentation: [docs.financewhiz.ai](https://docs.financewhiz.ai)

---

**FinanceWhiz.AI** - Empowering Indonesian SMEs with AI-driven financial management.