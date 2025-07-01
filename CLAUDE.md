# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev                # Start development server
npm run build             # Build for production (includes prisma generate)
npm run start             # Start production server
npm run lint              # Run ESLint

# Database
npx prisma generate       # Generate Prisma client
npx prisma db push        # Push schema changes to database
npx prisma studio         # Open database browser
npm run db:push           # Push using local env vars (dotenv wrapper)

# Testing database connection
npx prisma db push        # Test connection and sync schema
```

## Architecture Overview

This is a Next.js application for scheduling team meetings across timezones with AI assistance. The application follows a three-phase workflow:

### Core Workflow
1. **Admin Setup** (`/admin/setup`) - Admin creates meeting series with AI-generated date suggestions
2. **Availability Collection** (`/availability/[token]`) - Team members submit their availability
3. **Schedule Generation & Voting** (`/vote/[token]`) - AI generates 3 schedule options, team votes on preferences

### Key Libraries & Integrations
- **Database**: PostgreSQL via Prisma ORM
- **AI**: Vercel AI SDK with OpenAI/Anthropic for date suggestions and schedule optimization
- **Calendar**: Google Calendar API for automatic event creation
- **Email**: SendGrid for notifications and invitations
- **Timezone**: date-fns-tz for timezone conversions and scheduling
- **UI**: Tailwind CSS with custom components

### Database Schema (Prisma)
- **MeetingSeries**: Core meeting configuration with status tracking
- **User**: Team members with timezone info
- **TeamMember**: Join table linking users to meeting series with invite tokens
- **Availability**: User time slots in their local timezone
- **MeetingSchedules**: AI-generated schedule options with voting
- **ScheduleVote**: Ranked voting on schedule preferences
- **Meeting**: Final scheduled meetings with calendar integration

### Core Algorithm Files
- `src/lib/scheduling.ts` - Main scheduling algorithm that finds optimal meeting times
- `src/lib/timezone.ts` - Timezone conversion utilities and overlap detection
- `src/lib/google-calendar.ts` - Calendar event creation and management
- `src/lib/email.ts` - Email template and sending logic

### API Routes Structure
- `/api/meeting-series` - Create and manage meeting series
- `/api/availability` - Submit availability data
- `/api/meeting-schedules` - Generate AI-powered schedule options
- `/api/votes` - Handle schedule voting
- `/api/meetings` - Create final scheduled meetings

### Environment Variables
Essential variables for full functionality:
- `DATABASE_URL` - PostgreSQL connection
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - AI integrations
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Calendar API
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Email sending

### Token-Based Access
The application uses secure tokens for:
- Team member invitation links (`/availability/[token]`)
- Voting links (`/vote/[token]`)
- All accessed via `TeamMember.inviteToken` for security

### Meeting Constraints
- Default: 3 consecutive meetings of 3.5 hours each (210 minutes)
- Configurable duration and number of meetings
- Timezone-aware scheduling across global teams
- Requires all team members to participate

Run `npm run build` before deployment to ensure Prisma client is generated.