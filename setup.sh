#!/bin/bash

# FinanceWhiz.AI Local Setup Script
echo "🚀 Setting up FinanceWhiz.AI for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.x or newer."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 16.x or newer."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads
chmod 755 uploads

# Database setup prompt
echo ""
echo "🗄️  Database Setup Required:"
echo "1. Make sure PostgreSQL is running"
echo "2. Create database and user as described in README.md"
echo "3. Update DATABASE_URL in .env file"
echo ""

read -p "Have you completed the database setup? (y/N): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Pushing database schema..."
    npm run db:push
    echo "✅ Database schema created successfully!"
else
    echo "⚠️  Please complete database setup and run 'npm run db:push' manually."
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run dev' to start development server"
echo "3. Open http://localhost:5000 in your browser"
echo ""
echo "📖 Read README.md for detailed instructions and API key setup."