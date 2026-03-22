# Prime Fight - Quick Setup Guide

Get Prime Fight running in 5 minutes with sample data!

## Prerequisites

- Node.js 18+ installed
- Git installed
- A Supabase account (free tier is fine)
- A Stripe account (test mode available)

## Step 1: Clone and Install (1 min)

```bash
# Clone the project
git clone <your-repo-url>
cd primefight

# Install dependencies
npm install
```

## Step 2: Set Up Environment Variables (1 min)

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Get your credentials:
   - **Supabase**: Go to https://supabase.com → Create project → Go to Settings → API → Copy:
     - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public)
     - `SUPABASE_SERVICE_ROLE_KEY` (service_role key)
   
   - **Stripe**: Go to https://stripe.com → Dashboard → Developers → API Keys → Copy:
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Publishable key)
     - `STRIPE_SECRET_KEY` (Secret key)

3. Paste them into `.env.local`

## Step 3: Set Up Database (1 min)

1. Open Supabase dashboard → Your project → SQL Editor
2. Copy the entire contents of `scripts/setup-all.sql`
3. Paste into SQL Editor and click "Run"
4. Wait for it to complete (should show "✓ Success")

## Step 4: Add Sample Data (1 min)

Option A: Using the demo script:
```bash
node scripts/populate-demo-data.js
```

Option B: Manually insert in Supabase SQL Editor:
```bash
# Copy contents of scripts/seed-data.sql
# Paste into SQL Editor and run
```

## Step 5: Start the Development Server (1 min)

```bash
npm run dev
```

Open http://localhost:3000 in your browser 🎉

## You Should See:

- ✅ Homepage with featured events
- ✅ Navigation bar with theme switcher (Sun/Moon icon)
- ✅ Light/Dark mode toggle
- ✅ Boxing, MMA, K-1 event sections with sample data
- ✅ Subscription plans section
- ✅ Footer with links
- ✅ Ability to click events and view details

## Test the App:

1. **Browse Events**: Click "Events" in navbar
2. **Theme Toggle**: Click sun/moon icon in top right
3. **Sign Up**: Click "Get Started" to create an account
4. **View Event Details**: Click any event card
5. **Subscribe**: Click "Subscribe" in navbar

## Stripe Test Cards:

For testing payments:
- Card: `4242 4242 4242 4242`
- Exp: `12/25`
- CVC: `123`

## Database Tables Created:

- `profiles` - User profiles
- `events` - Event listings
- `subscriptions` - Subscription plans
- `purchases` - One-time PPV purchases
- `streams` - Stream information
- `replays` - VOD/replay info

## File Structure:

```
primefight/
├── app/
│   ├── page.tsx          # Homepage with featured events
│   ├── events/           # Events listing & details
│   ├── auth/             # Login/Sign up
│   ├── profile/          # User dashboard
│   ├── admin/            # Admin panel
│   ├── watch/            # Video player
│   └── subscriptions/    # Plans page
├── components/
│   ├── navbar.tsx        # Top navigation
│   ├── theme-switcher.tsx # Light/Dark toggle
│   ├── checkout.tsx      # Stripe checkout
│   └── video-player.tsx  # Video player
├── lib/
│   ├── supabase/        # Supabase clients
│   ├── db.ts            # Database functions
│   ├── stripe.ts        # Stripe setup
│   ├── bunny.ts         # Bunny.net setup
│   └── products.ts      # Product catalog
├── scripts/
│   ├── setup-all.sql    # Database schema
│   ├── seed-data.sql    # Sample data
│   └── populate-demo-data.js # Demo script
└── public/              # Static assets
```

## Troubleshooting:

### "Cannot find module 'supabase'"
```bash
npm install @supabase/supabase-js
```

### "Missing environment variables"
- Check `.env.local` has all required variables
- Make sure no typos in variable names
- Restart dev server after updating `.env.local`

### "Database tables don't exist"
- Run `scripts/setup-all.sql` in Supabase SQL Editor
- Check for any SQL errors in the console

### "Events not showing"
- Run `scripts/populate-demo-data.js` to add sample events
- Check Supabase console that events table has data

### "Can't login"
- Make sure Supabase auth is enabled
- Check project auth settings in Supabase dashboard

## Next Steps:

1. **Customize Events**: Add real events in Supabase
2. **Set Stripe Webhooks**: 
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `customer.subscription.updated`
3. **Configure Bunny.net**: 
   - Create account at bunny.net
   - Set up video library
   - Update Bunny API key in `.env.local`
4. **Deploy to Vercel**:
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables in Vercel settings
   - Deploy!

## Useful Links:

- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Bunny.net Docs: https://bunny.net/docs
- Next.js Docs: https://nextjs.org/docs

## Support:

- Check the `DOCUMENTATION.md` file for detailed architecture info
- Review `README.md` for full feature list
- See `DEPLOYMENT.md` for production setup

---

**Happy streaming! 🎬**
