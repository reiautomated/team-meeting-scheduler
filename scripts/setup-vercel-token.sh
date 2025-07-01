#!/bin/bash

# Vercel Token Setup Helper
# This script helps you configure your Vercel token for permanent CLI access

echo "🚀 Vercel Token Setup Helper"
echo "============================"
echo ""

# Check if token is already set
if [ -n "$VERCEL_TOKEN" ] && [ "$VERCEL_TOKEN" != "your-vercel-token-here" ]; then
    echo "✅ Vercel token is already configured!"
    echo "Token preview: ${VERCEL_TOKEN:0:10}..."
    echo ""
    
    # Test the token
    echo "🧪 Testing Vercel authentication..."
    if vercel whoami >/dev/null 2>&1; then
        echo "✅ Vercel authentication successful!"
        vercel whoami
    else
        echo "❌ Vercel authentication failed. Token may be invalid."
    fi
else
    echo "❌ Vercel token not configured yet."
    echo ""
    echo "📖 Setup Instructions:"
    echo "1. Visit: https://vercel.com/account/tokens"
    echo "2. Login with GitHub (same account as your repo)"
    echo "3. Click 'Create Token'"
    echo "4. Name: 'WSL2 Development' or 'CLI Access'"
    echo "5. Scope: 'Full Account' (recommended)"
    echo "6. Copy the token"
    echo ""
    echo "💾 To set your token permanently:"
    echo "1. Edit the environment file:"
    echo "   nano ~/.team-scheduler-env"
    echo ""
    echo "2. Replace 'your-vercel-token-here' with your actual token:"
    echo "   export VERCEL_TOKEN=\"vercel_xxxxxxxxxxxxxxxxxxxx\""
    echo ""
    echo "3. Reload environment:"
    echo "   source ~/.bashrc"
    echo ""
    echo "4. Verify setup:"
    echo "   ./scripts/setup-vercel-token.sh"
fi

echo ""
echo "🔧 Future Usage:"
echo "• Deploy projects: vercel"
echo "• Link projects: vercel link"
echo "• Set env vars: vercel env add"
echo "• View deployments: vercel ls"
echo ""
echo "💡 Benefits of Token Authentication:"
echo "• Works in WSL2 without browser popups"
echo "• Permanent authentication across sessions"
echo "• Scriptable deployments and CI/CD"
echo "• No need to re-login"