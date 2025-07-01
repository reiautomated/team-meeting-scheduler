# Environment Variables Setup Guide

Your Vercel project now has all required environment variables with placeholder values. Here's how to update them with real API keys and credentials for full functionality.

## ✅ Already Configured (with placeholders)

| Variable | Status | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | ✅ **Real value set** | Vercel Postgres connection |
| `NEXTAUTH_SECRET` | ✅ **Real value set** | Authentication security |
| `NEXTAUTH_URL` | ✅ **Real value set** | Production app URL |
| `BASE_URL` | ✅ **Real value set** | App base URL |
| `OPENAI_API_KEY` | 🔄 **Placeholder** | AI date suggestions |
| `GOOGLE_CLIENT_ID` | 🔄 **Placeholder** | Calendar integration |
| `GOOGLE_CLIENT_SECRET` | 🔄 **Placeholder** | Calendar integration |
| `GOOGLE_REDIRECT_URI` | ✅ **Real value set** | OAuth callback |
| `SMTP_HOST` | ✅ **Real value set** | Email server |
| `SMTP_PORT` | ✅ **Real value set** | Email server port |
| `SMTP_USER` | 🔄 **Placeholder** | Your email address |
| `SMTP_PASS` | 🔄 **Placeholder** | Email app password |

## 🔄 How to Update Variables with Real Values

### Method 1: Using Vercel CLI
```bash
# Remove placeholder and add real value
vercel env rm VARIABLE_NAME production --token he0Z5OjdH41iXDhSMojl4rhz
echo "real-value-here" | vercel env add VARIABLE_NAME production --token he0Z5OjdH41iXDhSMojl4rhz
```

### Method 2: Using Vercel Dashboard
1. Go to: https://vercel.com/rei-automated/team-meeting-scheduler/settings/environment-variables
2. Click the variable you want to update
3. Click "Edit" and paste your real value
4. Save and redeploy

## 🔑 Getting Real API Keys

### 1. OpenAI API Key (for AI date suggestions)
1. **Visit**: https://platform.openai.com/api-keys
2. **Create** new API key
3. **Copy** the key (starts with `sk-proj-` or `sk-`)
4. **Update**: `OPENAI_API_KEY`

### 2. Google Calendar API (for calendar integration)
1. **Visit**: https://console.cloud.google.com/
2. **Create** new project or select existing
3. **Enable** Google Calendar API
4. **Create** OAuth 2.0 credentials
5. **Set redirect URI**: `https://team-meeting-scheduler-il4cm56e0-rei-automated.vercel.app/api/auth/google/callback`
6. **Copy** Client ID and Client Secret
7. **Update**: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### 3. Email/SMTP (for notifications)

#### Gmail Setup:
1. **Enable** 2-factor authentication on your Google account
2. **Go to**: https://myaccount.google.com/apppasswords
3. **Generate** app password for "Mail"
4. **Update**:
   - `SMTP_USER`: your-email@gmail.com
   - `SMTP_PASS`: the-generated-app-password

#### Other Email Providers:
- **SendGrid**: Get SMTP credentials from dashboard
- **Mailgun**: Use SMTP settings from your domain
- **Office 365**: Use outlook.office365.com with app password

## 🚀 After Updating Variables

1. **Redeploy** your application:
   ```bash
   vercel --prod --token he0Z5OjdH41iXDhSMojl4rhz
   ```

2. **Test functionality**:
   - AI date suggestions should work
   - Google Calendar integration should work
   - Email notifications should send

## 🧪 Testing Environment Variables

### Test AI Integration:
1. Visit admin setup: `/admin/setup`
2. Fill out form and click "Get AI Date Suggestion"
3. Should return actual AI suggestions (not placeholder text)

### Test Email:
1. Complete meeting setup with team member emails
2. Check if invitation emails are sent

### Test Database:
1. Create a meeting series
2. Check if data is saved (visit Prisma Studio or Vercel dashboard)

## 🔧 Quick Update Commands

```bash
# Update OpenAI key
vercel env rm OPENAI_API_KEY production --token he0Z5OjdH41iXDhSMojl4rhz
echo "sk-proj-your-real-key" | vercel env add OPENAI_API_KEY production --token he0Z5OjdH41iXDhSMojl4rhz

# Update Google credentials
vercel env rm GOOGLE_CLIENT_ID production --token he0Z5OjdH41iXDhSMojl4rhz
echo "123456-abc.apps.googleusercontent.com" | vercel env add GOOGLE_CLIENT_ID production --token he0Z5OjdH41iXDhSMojl4rhz

# Update SMTP credentials
vercel env rm SMTP_USER production --token he0Z5OjdH41iXDhSMojl4rhz
echo "your-email@gmail.com" | vercel env add SMTP_USER production --token he0Z5OjdH41iXDhSMojl4rhz

# Then redeploy
vercel --prod --token he0Z5OjdH41iXDhSMojl4rhz
```

## ✅ Verification Checklist

- [ ] OpenAI API key updated (AI suggestions work)
- [ ] Google Calendar credentials updated (calendar integration works)
- [ ] SMTP credentials updated (emails send successfully)
- [ ] Application redeployed after updates
- [ ] All features tested in production

Once you update these variables with real values, your Team Meeting Scheduler will have full functionality!