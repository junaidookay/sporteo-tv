# Prime Fight - Complete Setup Guide

This guide will walk you through setting up the Prime Fight PPV streaming platform from scratch.

## Table of Contents
1. [Supabase Setup](#supabase-setup)
2. [Stripe Setup](#stripe-setup)
3. [Bunny.net Setup](#bunnynet-setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Running the App](#running-the-app)

## Supabase Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Enter a project name: `primefight`
4. Create a strong password
5. Select your region (closest to your users)
6. Click "Create new project"

### Step 2: Get Your API Keys
1. Once the project is created, go to **Settings → API**
2. Copy the following values to a text file:
   - **Project URL** - looks like `https://xxxxx.supabase.co`
   - **Anon Public Key** - long string starting with `eyJ...`
   - **Service Role Key** - long string starting with `eyJ...` (keep this secret!)

These will be used for environment variables.

## Stripe Setup

### Step 1: Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete account verification
3. Enable test mode (toggle in top right)

### Step 2: Get Stripe Keys
1. Go to **Developers → API Keys**
2. You should be in Test mode
3. Copy:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)
   - Keep these safe!

### Step 3: Set Up Webhook
1. Go to **Developers → Webhooks**
2. Click "Add endpoint"
3. For now, you can use a test webhook - we'll update this during deployment
4. Select these events:
   - `charge.succeeded`
   - `charge.failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the Signing Secret

## Bunny.net Setup

### Step 1: Create Bunny.net Account
1. Go to [bunny.net](https://bunny.net) and sign up
2. Complete account setup
3. Go to **Settings → API** and enable API access

### Step 2: Create Stream Library
1. Go to **Stream → Libraries**
2. Click "Add Library"
3. Enter name: `primefight-streams`
4. Select your region
5. Create the library

### Step 3: Get API Credentials
1. Go to **Settings → API**
2. Copy your **API Key**
3. Go back to your Stream Library
4. Copy the **Library ID** (shown in the list)

Optional: For video uploads, also set up:
- **Storage Zone** for VOD files
- Get the **Storage Zone API Key**

## Environment Variables

### Step 1: Copy Template
```bash
cp .env.example .env.local
```

### Step 2: Fill in Your Values

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Bunny.net Configuration
BUNNY_API_KEY=your-bunny-api-key
BUNNY_STREAM_LIBRARY_ID=your-library-id
BUNNY_CDN_HOSTNAME=xxxxx.b-cdn.net
```

Replace all `...` values with your actual credentials from the setup steps above.

## Database Setup

### Step 1: Access Supabase SQL Editor
1. Log in to your Supabase project
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Run Setup Script

1. Open the file: `scripts/setup-all.sql`
2. Copy ALL the contents
3. Paste into Supabase SQL Editor
4. Click **Run**

Wait for the query to complete. You should see success messages.

### Step 3: (Optional) Add Demo Data

To add sample events for testing:

1. Create another **New Query** in SQL Editor
2. Open the file: `scripts/seed-data.sql`
3. Copy and paste the contents
4. Click **Run**

You now have sample events in the database!

## Running the App

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Go to [http://localhost:3000](http://localhost:3000)

## Testing the App

### Create a Test Account
1. Click "Sign Up" on the home page
2. Use a test email (e.g., test@example.com)
3. Create a password
4. Verify your email (check spam folder)

### Test Events
If you ran the seed script, you should see sample events on the home page.

### Test Stripe Payment (Optional)
To test payments in Stripe test mode:

1. Use card number: `4242 4242 4242 4242`
2. Expiry: Any future date (e.g., 12/25)
3. CVC: Any 3 digits (e.g., 123)
4. Complete the payment

Check your Stripe Dashboard to see the test charge.

## Troubleshooting

### "Could not find the table" Error
- Make sure you ran `scripts/setup-all.sql` in Supabase SQL Editor
- The script must complete without errors

### Auth Not Working
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Verify they're in `.env.local`, not `.env.example`

### Payments Not Processing
- Verify `STRIPE_SECRET_KEY` is correct
- Make sure Stripe is in Test mode
- Use test card number `4242 4242 4242 4242`

### Can't see Events
- Run the seed script: `scripts/seed-data.sql`
- Or manually create an event via the admin panel

## Deployment

### To Vercel
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables
5. Deploy!

Replace test Stripe keys with production keys before going live.

## Next Steps

1. Customize branding and colors
2. Set up your Bunny.net RTMP for live streaming
3. Create admin users
4. Configure event types and pricing
5. Test the complete payment and streaming flow
6. Deploy to production

## Support

If you encounter issues:
1. Check the error message in the browser console (F12)
2. Check Supabase logs for database errors
3. Check Stripe Dashboard for payment issues
4. Review the main README.md for architecture details
