# FinSmart Lite - UMKM Financial Management System

## Overview

FinSmart Lite is an AI-powered financial management application designed specifically for small and medium enterprises (UMKM) in Indonesia. The system enables businesses to record transactions, monitor cash flow, and generate automated financial reports with AI-driven insights.

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

## Changelog

Changelog:
- June 20, 2025. Initial setup