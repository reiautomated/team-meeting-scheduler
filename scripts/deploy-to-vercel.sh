#!/bin/bash

# Vercel Deployment Script
# This script sets up environment variables and deploys the application

VERCEL_TOKEN="he0Z5OjdH41iXDhSMojl4rhz"

echo "🚀 Deploying Team Meeting Scheduler to Vercel"
echo "=============================================="
echo ""

# First, let's create a temporary database URL for initial deployment
echo "📝 Setting up basic environment variables..."

# Set a temporary DATABASE_URL for initial deployment
echo "Setting DATABASE_URL..."
echo "postgresql://temp:temp@localhost:5432/temp" | vercel env add DATABASE_URL production --token "$VERCEL_TOKEN"

# Set NextAuth configuration
echo "Setting NEXTAUTH_SECRET..."
echo "84TXH698Po2O8RiFFWlpM5skUxYxRRZUaWHi43UzAtE=" | vercel env add NEXTAUTH_SECRET production --token "$VERCEL_TOKEN"

echo "Setting NEXTAUTH_URL..."
echo "https://team-meeting-scheduler.vercel.app" | vercel env add NEXTAUTH_URL production --token "$VERCEL_TOKEN"

echo "Setting BASE_URL..."
echo "https://team-meeting-scheduler.vercel.app" | vercel env add BASE_URL production --token "$VERCEL_TOKEN"

# Set placeholder values for optional services (will update later)
echo "Setting placeholder API keys (to be updated later)..."
echo "placeholder-openai-key" | vercel env add OPENAI_API_KEY production --token "$VERCEL_TOKEN"
echo "placeholder-google-client-id" | vercel env add GOOGLE_CLIENT_ID production --token "$VERCEL_TOKEN"
echo "placeholder-google-client-secret" | vercel env add GOOGLE_CLIENT_SECRET production --token "$VERCEL_TOKEN"
echo "https://team-meeting-scheduler.vercel.app/api/auth/google/callback" | vercel env add GOOGLE_REDIRECT_URI production --token "$VERCEL_TOKEN"

echo "Setting SMTP placeholders..."
echo "smtp.gmail.com" | vercel env add SMTP_HOST production --token "$VERCEL_TOKEN"
echo "587" | vercel env add SMTP_PORT production --token "$VERCEL_TOKEN"
echo "placeholder@gmail.com" | vercel env add SMTP_USER production --token "$VERCEL_TOKEN"
echo "placeholder-password" | vercel env add SMTP_PASS production --token "$VERCEL_TOKEN"

echo ""
echo "✅ Basic environment variables set!"
echo ""
echo "🚀 Deploying to production..."
vercel --prod --token "$VERCEL_TOKEN"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set up a real PostgreSQL database (Vercel Postgres recommended)"
echo "2. Update DATABASE_URL with real connection string"
echo "3. Add real API keys for OpenAI/Anthropic, Google Calendar, and SMTP"
echo "4. Run database migrations: npx prisma db push"
echo ""
echo "🔧 To update environment variables:"
echo "vercel env rm VARIABLE_NAME production --token $VERCEL_TOKEN"
echo "echo 'new-value' | vercel env add VARIABLE_NAME production --token $VERCEL_TOKEN"