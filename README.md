# Team Meeting Scheduler

A Next.js application designed to help teams schedule quarterly and annual meetings across multiple timezones with AI-powered assistance.

## Features

- **🌍 Timezone Smart**: Automatically handles timezone conversions and finds optimal meeting times for global teams
- **🤖 AI Assisted**: Uses AI to optimize date ranges and find the best meeting combinations
- **📅 Calendar Integration**: Automatically creates Google Calendar events with reminders
- **📧 Email Notifications**: Sends invitations and updates to team members
- **⏰ Flexible Scheduling**: Supports 3 consecutive 3.5-hour meetings with customizable availability

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Calendar API credentials
- SMTP email configuration

### Installation

1. Clone the repository:
```bash
git clone https://github.com/reiautomated/team-meeting-scheduler.git
cd team-meeting-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: For AI-powered date suggestions
- Google Calendar API credentials
- SMTP email configuration

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### For Administrators

1. Visit `/admin/setup` to create a new meeting series
2. Fill in meeting details and get AI-powered date range suggestions
3. Add team member emails who will receive availability requests

### For Team Members

1. Click the link in your email invitation
2. Select your timezone and available time slots
3. Submit your availability

### Automatic Scheduling

Once all team members submit their availability:
- The system finds optimal meeting times that work for everyone
- Google Calendar events are created automatically
- All participants receive calendar invitations with reminders (24h, 3h, 1h, 10min)

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Set these in your Vercel project settings:
- `DATABASE_URL`
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `BASE_URL`

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **AI**: Vercel AI SDK (OpenAI/Anthropic)
- **Calendar**: Google Calendar API
- **Email**: Nodemailer
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/
│   ├── admin/setup/          # Admin meeting setup flow
│   ├── availability/         # Team member availability selection
│   └── page.tsx             # Landing page
├── lib/
│   ├── db.ts                # Database client
│   ├── timezone.ts          # Timezone utilities and scheduling algorithms
│   ├── google-calendar.ts   # Google Calendar integration
│   └── email.ts             # Email service
└── prisma/
    └── schema.prisma        # Database schema
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
