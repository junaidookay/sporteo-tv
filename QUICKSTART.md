# Prime Fight - Quick Start Checklist

Get your PPV streaming platform running in 15 minutes.

## 1. Supabase Setup (3 min)

- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Create new project `primefight`
- [ ] Go to **Settings → API**
- [ ] Copy these values:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 2. Stripe Setup (3 min)

- [ ] Go to [stripe.com](https://stripe.com)
- [ ] Sign up and go to **Developers → API Keys**
- [ ] Copy these values (in Test mode):
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)
  - `STRIPE_SECRET_KEY` (starts with `sk_test_`)
  - `STRIPE_WEBHOOK_SECRET` (from Webhooks section)

## 3. Bunny.net Setup (2 min)

- [ ] Go to [bunny.net](https://bunny.net)
- [ ] Sign up and go to **Settings → API**
- [ ] Copy `BUNNY_API_KEY`
- [ ] Go to **Stream → Libraries**
- [ ] Create library and copy `BUNNY_STREAM_LIBRARY_ID`

## 4. Create .env.local (1 min)

```bash
cp .env.example .env.local
```

Fill in values from steps 1-3 above.

## 5. Database Setup (2 min)

1. Go to your Supabase project
2. Click **SQL Editor**
3. Click **New Query**
4. Open `scripts/setup-all.sql` and copy all contents
5. Paste into SQL Editor
6. Click **Run**

Wait for completion (should say success).

## 6. Add Demo Data (1 min) - Optional

Same process as step 5, but with `scripts/seed-data.sql`

This adds sample fighting events for testing.

## 7. Run Locally (3 min)

```bash
npm install
npm run dev
```

Visit http://localhost:3000 - you should see the landing page!

## 8. Test Account

- Click "Sign Up"
- Create account with any email
- Verify email (check spam folder)
- Login

## 9. Test Payment (Optional)

- Go to Subscriptions page
- Click subscribe button
- Stripe checkout opens
- Use card: **4242 4242 4242 4242**
- Any future expiry date, any CVC (e.g., 123)
- Complete payment
- Check Stripe Dashboard for test charge

## Done! 🎉

Your streaming platform is running locally. Next:

- Customize colors in `app/globals.css`
- Configure your events
- Set up Bunny.net RTMP streaming
- Create admin account
- Deploy to Vercel

## Common Issues

| Issue | Solution |
|-------|----------|
| "Could not find table" | Run setup-all.sql in SQL Editor |
| Auth not working | Check SUPABASE_URL and ANON_KEY in .env.local |
| Payment failing | Verify STRIPE_SECRET_KEY is correct |
| No events shown | Run seed-data.sql to add demo events |

## Full Setup Guide

For detailed instructions, see **SETUP_GUIDE.md**

## Deployment

Ready for production?

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Replace test keys with production keys
5. Deploy!

See README.md for full deployment instructions.
