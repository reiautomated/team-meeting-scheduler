#!/bin/bash

# Vercel Environment Variables Setup Script
# This script helps you configure all environment variables for the Team Meeting Scheduler

VERCEL_TOKEN="he0Z5OjdH41iXDhSMojl4rhz"

echo "🔧 Setting up Vercel Environment Variables"
echo "=========================================="
echo ""
echo "📋 Current environment variables:"

# Show current environment variables
vercel env ls --token "$VERCEL_TOKEN"

echo ""
echo "🚀 Let's set up the remaining environment variables..."
echo ""

# Function to add environment variable
add_env_var() {
    local var_name="$1"
    local description="$2"
    local example="$3"
    
    echo "➤ Setting up $var_name"
    echo "  Description: $description"
    echo "  Example: $example"
    read -p "  Enter value for $var_name (or press Enter to skip): " var_value
    
    if [ -n "$var_value" ]; then
        echo "$var_value" | vercel env add "$var_name" production --token "$VERCEL_TOKEN"
        echo "  ✅ Added $var_name"
    else
        echo "  ⏭️  Skipped $var_name"
    fi
    echo ""
}

# Set up core application variables
echo "🔐 Core Application Variables"
echo "=============================="

add_env_var "NEXTAUTH_SECRET" \
    "Secret key for NextAuth.js authentication" \
    "84TXH698Po2O8RiFFWlpM5skUxYxRRZUaWHi43UzAtE="

add_env_var "NEXTAUTH_URL" \
    "Your production app URL" \
    "https://team-meeting-scheduler-il4cm56e0-rei-automated.vercel.app"

add_env_var "BASE_URL" \
    "Base URL for your application" \
    "https://team-meeting-scheduler-il4cm56e0-rei-automated.vercel.app"

# AI Services
echo "🤖 AI Services (Choose one or both)"
echo "===================================="

add_env_var "OPENAI_API_KEY" \
    "OpenAI API key for AI-powered date suggestions" \
    "sk-proj-abc123..."

add_env_var "ANTHROPIC_API_KEY" \
    "Anthropic API key for AI-powered date suggestions" \
    "sk-ant-api03-abc123..."

# Google Calendar
echo "📅 Google Calendar Integration"
echo "=============================="

add_env_var "GOOGLE_CLIENT_ID" \
    "Google OAuth Client ID for calendar integration" \
    "123456789-abc.apps.googleusercontent.com"

add_env_var "GOOGLE_CLIENT_SECRET" \
    "Google OAuth Client Secret" \
    "GOCSPX-abc123def456"

add_env_var "GOOGLE_REDIRECT_URI" \
    "Google OAuth redirect URI" \
    "https://team-meeting-scheduler-il4cm56e0-rei-automated.vercel.app/api/auth/google/callback"

# Email/SMTP
echo "📧 Email/SMTP Configuration"
echo "==========================="

add_env_var "SMTP_HOST" \
    "SMTP server hostname" \
    "smtp.gmail.com"

add_env_var "SMTP_PORT" \
    "SMTP server port" \
    "587"

add_env_var "SMTP_USER" \
    "SMTP username (usually your email)" \
    "your-email@gmail.com"

add_env_var "SMTP_PASS" \
    "SMTP password (use App Password for Gmail)" \
    "your-app-password"

echo "✅ Environment variable setup complete!"
echo ""
echo "📋 Final environment variables:"
vercel env ls --token "$VERCEL_TOKEN"

echo ""
echo "🚀 Next steps:"
echo "1. Deploy your application: vercel --prod"
echo "2. Test the functionality with real API keys"
echo "3. Enable AI features and Google Calendar integration"
echo ""
echo "💡 Tips:"
echo "• For OpenAI: Get API key from https://platform.openai.com/api-keys"
echo "• For Google Calendar: Set up OAuth in https://console.cloud.google.com/"
echo "• For Gmail SMTP: Use App Passwords, not your regular password"