# Prime Fight - Premium PPV Combat Sports Streaming Platform

A full-stack Next.js 16 application for streaming live boxing, MMA, and K-1 fights with secure payments, real-time streaming, and admin management.

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Server Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Video Streaming**: Bunny.net
- **Deployment**: Vercel

## Features

### User Features
- 🔐 User authentication with Supabase
- 📺 Browse upcoming and past fighting events
- 💳 Pay-per-view (PPV) event purchasing
- 📅 Monthly and annual subscription plans
- 🎥 Live and on-demand video streaming
- 👤 User profile management
- 📱 Responsive design for all devices

### Admin Features
- 📊 Comprehensive dashboard with analytics
- 🎬 Event management and scheduling
- 📡 Live stream monitoring and controls
- 👥 User management and analytics
- 💰 Revenue tracking and reporting
- ⚙️ Platform settings and configuration

### Payment & Monetization
- Stripe integration for secure payments
- Subscription management with Stripe Webhooks
- PPV event purchases with automatic access control
- Revenue analytics and reporting

### Streaming
- Bunny.net RTMP live streaming
- HLS/DASH multi-bitrate streaming
- Stream health monitoring
- Video on-demand (VOD) replay management

## Project Structure

```
app/
├── (auth)/                 # Authentication pages
│   ├── login/
│   ├── sign-up/
│   └── error/
├── admin/                  # Admin dashboard
│   ├── events/
│   ├── streams/
│   ├── analytics/
│   └── settings/
├── api/
│   └── webhooks/          # Stripe webhooks
├── events/                # Event browsing
├── watch/                 # Live/replay streaming
├── subscriptions/         # Subscription plans
├── profile/               # User profile
├── checkout/              # Payment success/cancel
└── page.tsx              # Home page

lib/
├── db.ts                 # Database queries
├── stripe.ts             # Stripe client
├── bunny.ts              # Bunny.net API
├── products.ts           # Product definitions
├── errors.ts             # Error handling
├── supabase/
│   ├── client.ts         # Client auth
│   ├── server.ts         # Server auth
│   └── middleware.ts     # Auth middleware
└── utils.ts              # Utilities

components/
├── navbar.tsx            # Navigation bar
├── checkout.tsx          # Stripe checkout
├── video-player.tsx      # Video player
├── admin-sidebar.tsx     # Admin navigation
└── ui/                   # UI components

scripts/
├── 001_profiles.sql      # Database setup
├── 002_events.sql
├── 003_subscriptions.sql
├── 004_purchases.sql
├── 005_streams.sql
├── 006_replays.sql
└── 007_triggers.sql
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Stripe account
- Bunny.net account

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository>
cd primefight
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your actual credentials:
- Supabase URL and keys
- Stripe keys (public and secret)
- Bunny.net API credentials

3. **Set up the database - IMPORTANT**

Go to your Supabase dashboard and run the SQL setup script:

1. Open Supabase SQL Editor
2. Copy the contents of `scripts/setup-all.sql`
3. Paste into SQL Editor and execute
4. (Optional) Run `scripts/seed-data.sql` for demo data

The setup script will:
- Create all necessary tables (profiles, events, subscriptions, purchases, streams, replays)
- Enable Row Level Security (RLS)
- Create database triggers for auto-generated profiles and timestamps
- Set up proper indexes for performance

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to Settings → API and copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY)
3. Go to SQL Editor and run `scripts/setup-all.sql` to create database schema
4. (Optional) Run `scripts/seed-data.sql` to add demo events
5. Paste keys into your .env.local file

### Stripe Setup

1. Create a Stripe account
2. Generate API keys
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Add keys to .env.local

### Bunny.net Setup

1. Create a Bunny.net account
2. Create a stream library
3. Get your API key and storage zone
4. Add credentials to .env.local

## Database Schema

### Main Tables
- **profiles**: User information and metadata
- **events**: Fight events and details
- **subscriptions**: User subscription records
- **purchases**: PPV purchase history
- **streams**: Live stream information
- **stream_access**: Access control tokens
- **video_replays**: Video on-demand content
- **analytics**: Event performance metrics

All tables include Row Level Security (RLS) policies for data protection.

## API Routes

### Webhooks
- `POST /api/webhooks/stripe` - Stripe payment events

### Protected Routes
- `/api/auth/*` - Authentication endpoints
- `/api/user/*` - User data endpoints
- `/admin/*` - Admin dashboard (requires admin role)

## Authentication

Uses Supabase Auth with email/password authentication. Users can:
- Sign up and verify email
- Login with credentials
- Manage profile information
- View purchase/subscription history

Admin users (marked with `is_admin=true` in profiles) can access `/admin` routes.

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel settings
4. Deploy

```bash
vercel deploy
```

### Manual Deployment

```bash
npm run build
npm run start
```

## Payment Flow

1. User selects subscription or PPV event
2. Stripe Checkout is shown
3. Payment is processed
4. Webhook updates database
5. User gains access to content

## Video Streaming Flow

### Live Events
1. Broadcaster gets RTMP credentials from Bunny.net
2. Encoder connects to RTMP server
3. HLS/DASH streams generated automatically
4. Video player accesses stream via CDN
5. Stream access controlled by database

### Replays
1. Live stream recorded by Bunny.net
2. VOD file processed and stored
3. Replay made available in event detail
4. Users can watch with same access rules

## Error Handling

The application includes comprehensive error handling:
- Custom error types (AuthError, PaymentError, StreamError, etc.)
- Error logging and tracking
- User-friendly error messages
- Graceful fallbacks

## Performance Optimization

- Server-side rendering for SEO
- Static generation where possible
- Image optimization
- Code splitting
- Database query optimization

## Security

- Row Level Security (RLS) on all tables
- Secure session management with Supabase
- Payment security with Stripe
- HTTPS required in production
- Environment variable protection

## Monitoring & Analytics

- Stream viewer tracking
- Event performance metrics
- Revenue analytics
- User engagement tracking
- Error logging

## Contributing

1. Create a feature branch
2. Commit changes
3. Push to GitHub
4. Open a pull request

## License

Proprietary - Prime Fight

## Support

For issues and questions:
1. Check documentation
2. Review error logs
3. Contact admin team

## Future Enhancements

- Live chat during events
- User comments and ratings
- Advanced streaming analytics
- Mobile native apps
- Exclusive member content
- Premium coaching content
- Event highlights and clips
- Integration with social media
