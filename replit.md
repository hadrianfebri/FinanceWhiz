# FinanceWhiz.AI - UMKM Financial Management System

## Overview

FinanceWhiz.AI is an AI-powered financial management application designed specifically for Small-Medium Enterprises (SME) in Indonesia. The system enables multi-outlet businesses to record transactions, monitor cash flow across locations, generate automated financial reports, and provide AI-driven insights. The application features role-based access (Owner, Finance, Manager Cabang), comprehensive tax management, payroll tracking, and advanced business intelligence capabilities with complete brand transformation.

## System Architecture

The application follows a full-stack monorepo architecture with:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Authentication**: JWT-based authentication with bcrypt for password hashing

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables
- **Charts**: Chart.js for data visualization
- **Forms**: React Hook Form with Zod validation
- **File Structure**: Feature-based organization with shared components

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Upload**: Multer for receipt image handling
- **API Structure**: RESTful endpoints with comprehensive error handling
- **Middleware**: Authentication middleware for protected routes

### Database Schema
- **Users**: Business information, authentication credentials
- **Categories**: Income/expense categorization system
- **Transactions**: Financial transaction records with receipt support
- **User Settings**: Configurable application preferences

### Authentication System
- JWT-based authentication with token storage in localStorage
- Protected routes requiring authentication
- Password hashing using bcrypt
- User session management with automatic token validation

## Data Flow

1. **User Registration/Login**: Credentials validated against database, JWT token issued
2. **Transaction Management**: Users create/edit transactions with category assignment
3. **Real-time Dashboard**: Aggregated financial data displayed with charts
4. **Report Generation**: Historical data analysis with period-based filtering
5. **AI Insights**: Automated financial analysis and recommendations
6. **Receipt Upload**: Image files stored with transaction records

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver for serverless environments
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/**: Comprehensive UI component primitives
- **drizzle-orm**: Type-safe database ORM
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation and validation
- **multer**: File upload handling
- **chart.js**: Data visualization
- **zod**: Runtime type validation

### Development Dependencies
- **Vite**: Fast build tool and dev server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **tsx**: TypeScript execution for development

## Deployment Strategy

- **Development**: Runs on Replit with live reload via Vite dev server
- **Production Build**: Vite builds frontend, esbuild bundles backend
- **Database**: PostgreSQL provisioned through Replit's database service
- **Environment**: Node.js 20 runtime with PostgreSQL 16
- **Deployment Target**: Autoscale deployment on Replit infrastructure

The application uses environment variables for database connection and JWT secrets, with automatic database provisioning through Replit's integrated services.

## User Preferences

Preferred communication style: Simple, everyday language.

## Brand Design Guidelines

### Visual Identity
- **Logo**: Custom FinanceWhiz.AI logo featuring orange and yellow geometric shapes
- **Primary Colors**: 
  - Orange (#f29716) - Primary brand color for buttons, highlights, and active states
  - Yellow (#ffde32) - Secondary accent color for badges and highlights
  - Dark Teal (#04474f) - Professional accent for balance cards and user avatars
- **Typography**: League Spartan font family for modern, professional appearance
- **Background**: Light gray (#f4f4f4) with subtle diagonal line pattern

### UI Components
- **Card Base**: White background with rounded corners (xl) and subtle shadows
- **Balance Card**: Dark teal background with white text, following brand guidelines
- **Buttons**: Orange primary buttons with hover effects and proper spacing
- **Navigation**: Active menu items show orange left border and background highlight
- **Icons**: Circular backgrounds with brand colors, consistent sizing throughout

### Layout Structure
- **Sidebar**: 240px width with logo header, user profile section, and navigation menu
- **Main Content**: Grid-based layout with proper spacing and responsive design
- **Quick Actions**: Floating action buttons with rounded corners and shadow effects
- **Dashboard Cards**: Consistent card-based design with hover animations

## Changelog

Changelog:
- June 20, 2025. Initial setup
- June 20, 2025. Complete FinanceWhiz.AI brand transformation implementation:
  - Added custom logo and brand colors throughout application
  - Updated typography to League Spartan font family
  - Implemented brand design guidelines for UI components
  - Redesigned dashboard with balance card and branded styling
  - Updated sidebar, navbar, and landing page with new brand identity
  - Added hover effects and brand-consistent color scheme
- June 20, 2025. Navigation optimization and bug fixes:
  - Fixed duplicate header issue by removing logo from navbar
  - Implemented dynamic page titles in navbar (Dashboard, Transaksi, Laporan, Profil)
  - Removed duplicate page titles from all content areas
  - Fixed Select component value prop errors in transactions page
  - Fixed transaction creation categoryId type conversion error
  - Improved login redirect with proper auth state invalidation
  - Streamlined navigation layout for better user experience
- June 20, 2025. Final header layout optimization:
  - Repositioned logo to left side of sticky navbar
  - Removed redundant page titles and user info from sidebar
  - Created clean header with FinanceWhiz.AI branding on left, user controls on right
  - Implemented sticky header that stays fixed during scrolling
  - Achieved professional, streamlined navigation design
- June 20, 2025. Completed missing functionality implementations:
  - Fixed dashboard "Lihat Laporan" button to navigate to reports page
  - Added Excel export functionality for transactions page (CSV format)
  - Implemented edit transaction functionality using existing modal
  - Created PDF download feature for reports page (HTML format with print styling)
  - Fixed category display issue by implementing proper JOIN queries with relations
  - Enhanced transactions page with complete CRUD operations and export capabilities
- June 20, 2025. Major SME expansion - Comprehensive business management system:
  - Extended database schema with 8 new enterprise tables (outlets, employees, payrolls, vendors, invoices, tax_reports, pos_transactions, notifications)
  - Created 5 new SME management pages: Payroll, Vendors, Tax Management, POS Sync, and enhanced Outlets
  - Implemented role-based access control architecture for Owner, Manager, Staff, Accountant roles
  - Added multi-outlet operations with outlet-specific transaction tracking
  - Built comprehensive payroll management with salary, bonus, and deduction tracking
  - Created vendor management system with payment terms and transaction history
  - Implemented Indonesian tax compliance features (PPh Final 0.5% for UMKM)
  - Added POS system integration with real-time synchronization capabilities
  - Enhanced API with 10+ new endpoints supporting all SME operations
  - Updated navigation with enterprise features while maintaining UMKM functionality
- June 20, 2025. Application debugging and outlet functionality enhancement:
  - Fixed database connection pool configuration to resolve startup timeout issues
  - Resolved TypeScript errors in SME dashboard components
  - Enhanced outlet management "Lihat Detail" button with comprehensive outlet information display
  - Implemented outlet "Transaksi" button navigation to filtered transactions page
  - Application now running stable with all interactive features functional
- June 20, 2025. Critical data synchronization fixes across all application pages:
  - Fixed API outlets endpoint to use real database data instead of mock/hardcoded values
  - Synchronized dashboard calculations to match actual transaction data from database
  - Corrected outlet data mapping issues (currentMonthSales vs monthlyRevenue, totalTransactions vs monthlyTransactions)
  - Fixed date formatting error in dashboard preventing proper display of recent transactions
  - All pages now display consistent data: Dashboard (Rp 94.950.000 saldo), Transactions, Reports, and Outlets
  - Verified real outlet performance: Cabang Utama (25 transaksi, Rp 56jt), Cabang Bandung (21 transaksi, Rp 33.2jt), Cabang Surabaya (21 transaksi, Rp 30.3jt)
- June 23, 2025. Professional payslip system implementation:
  - Added professional slip gaji generation with print functionality using HTML/CSS templates
  - Implemented email delivery system using Mailgun for sending payslips to employees
  - Added slip gaji buttons (cetak & kirim email) to payroll management interface
  - Updated company branding from "FinanceWhiz.AI" to actual business name "Toko Berkah"
  - Created responsive payslip design with proper styling for professional appearance
  - Enabled automated payslip distribution for all industries with customizable templates
  - Added employee management functionality with view and edit capabilities in payroll interface
  - Created backend API endpoints for updating employee data (PUT /api/employees/:id)
  - Configured Mailgun EU endpoint with MAILGUN_SECRET for successful email delivery
- June 23, 2025. Enhanced employee management with search and filter capabilities:
  - Added search functionality to "Kelola Karyawan" modal for finding employees by name or email
  - Implemented position-based filtering with dropdown selection of unique job positions
  - Added reset filter button to clear all search and filter criteria
  - Enhanced modal UI with proper scrolling, sticky headers, and responsive design
  - Fixed Select component validation errors by replacing empty string values with "all"
  - Added employee counter showing filtered results vs total employees
  - Improved user experience with real-time search and filter functionality
- June 23, 2025. Complete vendor management enhancement with contract tracking:
  - Added contract amount (nominal kontrak) field to vendor database schema
  - Implemented document upload functionality for vendor contracts and files
  - Enhanced vendor cards to display contract amounts with proper currency formatting
  - Updated both create and edit vendor forms with scrollable interface
  - Fixed modal scrolling issues with max-height and overflow-y-auto classes
  - Modified backend API to handle file uploads using multer middleware
  - Supports PDF, DOC, DOCX, JPG, PNG document formats for vendor documentation
- June 23, 2025. Advanced tax management system for UMKM businesses:
  - Implemented automatic PPh Final 0.5% calculation based on real financial data from reports
  - Created professional PDF export functionality with branded Toko Berkah formatting
  - Added dynamic status management for tax reports (Real-time, Draft, Disetor, Lunas)
  - Built edit modal for manual corrections and data adjustments
  - Enhanced tax summary cards with detailed income sources and calculation breakdown
  - Integrated real-time synchronization with financial reports for accurate tax calculations
  - Added comprehensive information banner explaining UMKM tax calculation methodology
- June 23, 2025. AI Chat Assistant implementation with DeepSeek integration:
  - Built complete AI Chat interface with real-time messaging and typing indicators
  - Integrated DeepSeek API for business data analysis and intelligent responses
  - Added quick question buttons for common business queries (transactions, sales, outlets)
  - Implemented proper markdown formatting for AI responses (bold, headers, lists)
  - Changed branding from "DeepSeek AI" to "FinanceWhiz AI" throughout interface
  - Added scrollable message containers to handle long AI responses without interface overflow
  - Configured AI to provide clean, direct answers without additional notes or commentary
  - Enhanced visual spacing and positioning relative to sidebar for optimal user experience
- June 23, 2025. Fixed new account data integrity and created comprehensive local deployment documentation:
  - Eliminated hardcoded AI insights and static percentage data for new accounts without transactions
  - Fixed notifications system to show empty states instead of sample data for new users
  - Updated dashboard growth indicators to only display when actual historical data exists
  - Created comprehensive README.md with detailed local deployment instructions
  - Added .env.example template with all required environment variables
  - Created automated setup.sh script for streamlined local development setup
  - Documented all API key requirements, database setup, and troubleshooting steps
  - Enhanced project structure documentation for better developer onboarding