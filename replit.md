# FinanceWhiz.AI - UMKM Financial Management System

## Overview

FinanceWhiz.AI is an AI-powered financial management application designed specifically for small and medium enterprises (UMKM) in Indonesia. The system enables businesses to record transactions, monitor cash flow, and generate automated financial reports with AI-driven insights. The application features a complete brand transformation with custom logo, color scheme, and typography following professional design guidelines.

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