#!/bin/bash

# Database Setup Script for Team Meeting Scheduler
# This script helps you connect your Vercel Postgres database

VERCEL_TOKEN="he0Z5OjdH41iXDhSMojl4rhz"

echo "🗄️  Setting up Vercel Postgres Database"
echo "======================================="
echo ""

echo "📋 You'll need your Vercel Postgres connection details:"
echo "1. Go to: https://vercel.com/dashboard/stores"
echo "2. Find your Postgres database"
echo "3. Click on it to get connection details"
echo ""

echo "🔗 Expected format:"
echo "postgresql://username:password@host:port/database?sslmode=require"
echo ""

read -p "📝 Enter your DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Database URL is required"
    exit 1
fi

echo ""
echo "🚀 Setting DATABASE_URL in Vercel project..."

# Add to production environment
echo "$DATABASE_URL" | vercel env add DATABASE_URL production --token "$VERCEL_TOKEN"

echo ""
echo "✅ Database URL added to production environment!"
echo ""
echo "🔄 Next steps:"
echo "1. Run database migrations: npx prisma db push"
echo "2. Generate Prisma client: npx prisma generate"
echo "3. Deploy to apply changes: vercel --prod"
echo ""
echo "🧪 To test the database connection locally:"
echo "1. Add DATABASE_URL to your .env file"
echo "2. Run: npx prisma db push"
echo "3. Start development: npm run dev"