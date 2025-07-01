#!/bin/bash

# Team Meeting Scheduler Environment Setup Helper
# This script helps you configure environment variables

echo "🔧 Team Meeting Scheduler Environment Setup"
echo "=========================================="
echo ""

# Generate NextAuth secret
echo "Generating NextAuth secret..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo ""

# Check current environment file
ENV_FILE="$HOME/.team-scheduler-env"

if [ -f "$ENV_FILE" ]; then
    echo "📁 Environment file found at: $ENV_FILE"
    echo ""
    echo "🔍 Current environment variables status:"
    
    # Check each required variable
    source "$ENV_FILE"
    
    echo "✅ GITHUB_TOKEN: $([ -n "$GITHUB_TOKEN" ] && echo "Set" || echo "❌ Missing")"
    echo "$([ -n "$VERCEL_TOKEN" ] && [[ "$VERCEL_TOKEN" != *"your-vercel"* ]] && echo "✅" || echo "❌") VERCEL_TOKEN: $([ -n "$VERCEL_TOKEN" ] && echo "Set" || echo "Missing")"
    echo "$([ -n "$DATABASE_URL" ] && [[ "$DATABASE_URL" != *"username:password"* ]] && echo "✅" || echo "❌") DATABASE_URL: $([ -n "$DATABASE_URL" ] && echo "Set" || echo "Missing")"
    echo "$([ -n "$OPENAI_API_KEY" ] && [[ "$OPENAI_API_KEY" != *"your-openai"* ]] && echo "✅" || echo "❌") OPENAI_API_KEY: $([ -n "$OPENAI_API_KEY" ] && echo "Set" || echo "Missing")"
    echo "$([ -n "$ANTHROPIC_API_KEY" ] && [[ "$ANTHROPIC_API_KEY" != *"your-anthropic"* ]] && echo "✅" || echo "❌") ANTHROPIC_API_KEY: $([ -n "$ANTHROPIC_API_KEY" ] && echo "Set" || echo "Missing")"
    echo "$([ -n "$GOOGLE_CLIENT_ID" ] && [[ "$GOOGLE_CLIENT_ID" != *"your-google"* ]] && echo "✅" || echo "❌") GOOGLE_CLIENT_ID: $([ -n "$GOOGLE_CLIENT_ID" ] && echo "Set" || echo "Missing")"
    echo "$([ -n "$GOOGLE_CLIENT_SECRET" ] && [[ "$GOOGLE_CLIENT_SECRET" != *"your-google"* ]] && echo "✅" || echo "❌") GOOGLE_CLIENT_SECRET: $([ -n "$GOOGLE_CLIENT_SECRET" ] && echo "Set" || echo "Missing")"
    echo "$([ -n "$SMTP_USER" ] && [[ "$SMTP_USER" != *"your-email"* ]] && echo "✅" || echo "❌") SMTP_USER: $([ -n "$SMTP_USER" ] && echo "Set" || echo "Missing")"
    echo "$([ -n "$SMTP_PASS" ] && [[ "$SMTP_PASS" != *"your-gmail"* ]] && echo "✅" || echo "❌") SMTP_PASS: $([ -n "$SMTP_PASS" ] && echo "Set" || echo "Missing")"
    echo "$([ -n "$NEXTAUTH_SECRET" ] && [[ "$NEXTAUTH_SECRET" != *"your-nextauth"* ]] && echo "✅" || echo "❌") NEXTAUTH_SECRET: $([ -n "$NEXTAUTH_SECRET" ] && echo "Set" || echo "Missing")"
    
else
    echo "❌ Environment file not found at: $ENV_FILE"
    echo "Please run: source ~/.bashrc"
fi

echo ""
echo "📝 To update your NextAuth secret, run:"
echo "sed -i 's/export NEXTAUTH_SECRET=\".*\"/export NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"/' $ENV_FILE"
echo ""
echo "📖 Setup Guide:"
echo "1. Database: Set up PostgreSQL (Vercel Postgres, Supabase, Railway)"
echo "2. AI API: Get key from OpenAI or Anthropic"
echo "3. Google Calendar: Create OAuth credentials in Google Cloud Console"
echo "4. Email: Set up Gmail App Password or SMTP service"
echo "5. Edit $ENV_FILE with your actual values"
echo ""
echo "🔄 After updating, reload with: source ~/.bashrc"