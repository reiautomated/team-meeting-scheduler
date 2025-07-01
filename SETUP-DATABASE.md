# Database Setup Guide

This guide helps you connect your Vercel Postgres database to the Team Meeting Scheduler project.

## 🗄️ Step 1: Get Your Database Connection URL

### Method A: Via Vercel Dashboard (Recommended)
1. **Go to**: https://vercel.com/dashboard/stores
2. **Find your Postgres database** and click on it
3. **Copy the connection string** from the "Connect" tab
4. **Format**: `postgresql://default:password@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require`

### Method B: Via Project Storage Tab
1. **Go to your project**: https://vercel.com/rei-automated-devs-projects/team-meeting-scheduler
2. **Click the "Storage" tab**
3. **Click "Connect Database"**
4. **Select your existing Postgres database**
5. **This automatically adds DATABASE_URL to your project**

## 🔧 Step 2: Add Database to Vercel Project

### If you used Method A (manual setup):

Run the database setup script:
```bash
./scripts/setup-database.sh
```

Or manually add via CLI:
```bash
# Replace with your actual database URL
echo "postgresql://default:password@host:5432/verceldb?sslmode=require" | vercel env add DATABASE_URL production --token he0Z5OjdH41iXDhSMojl4rhz
```

### If you used Method B:
✅ You're already done! The DATABASE_URL is automatically configured.

## 🏗️ Step 3: Set Up Database Schema

Once your database is connected, run these commands to create the tables:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Optional: Open Prisma Studio to view your database
npx prisma studio
```

## 🚀 Step 4: Deploy with Database

Deploy your updated application:
```bash
vercel --prod --token he0Z5OjdH41iXDhSMojl4rhz
```

## 🧪 Step 5: Test Database Connection

### Local Testing:
1. **Update your `.env` file** with your actual database URL
2. **Run migrations**: `npx prisma db push`
3. **Start development**: `npm run dev`
4. **Test the admin setup**: Visit http://localhost:3000/admin/setup

### Production Testing:
1. **Visit your live app**: https://team-meeting-scheduler-nn9gn0vl8-rei-automated-devs-projects.vercel.app
2. **Test admin setup**: Click "Create Meeting Series"
3. **Check database**: Use Prisma Studio or Vercel dashboard

## 📋 Database Schema Overview

Your database will have these tables:
- **users** - Team members and admins
- **meeting_series** - Meeting series configurations
- **meetings** - Individual meeting instances
- **team_members** - Team membership and roles
- **availabilities** - Time slot availability data

## 🔍 Troubleshooting

### Database Connection Issues:
- **Check URL format**: Must include `?sslmode=require`
- **Verify credentials**: Username/password must be correct
- **Test connection**: Use `npx prisma db push` to test

### Environment Variable Issues:
- **Check Vercel dashboard**: Ensure DATABASE_URL is set in production
- **Local development**: Update `.env` file with real database URL
- **Redeploy**: After adding env vars, redeploy with `vercel --prod`

### Migration Issues:
- **Reset database**: `npx prisma db push --force-reset` (⚠️ deletes all data)
- **Generate client**: `npx prisma generate` after schema changes
- **Check logs**: View deployment logs for detailed error messages

## ✅ Success Checklist

- [ ] Database URL obtained from Vercel dashboard
- [ ] DATABASE_URL added to Vercel project environment
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Application deployed with database connection
- [ ] Admin setup flow working (creates database records)
- [ ] Can view database in Prisma Studio or Vercel dashboard

Once completed, your application will have full database functionality for storing meeting series, team members, and availability data!