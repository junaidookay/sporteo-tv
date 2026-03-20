# Prime Fight - Deployment Guide

Deploy your PPV streaming platform to production.

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Database backups created
- [ ] Stripe production account created
- [ ] Bunny.net production credentials ready
- [ ] Custom domain purchased (optional)
- [ ] Analytics configured
- [ ] Error monitoring set up

## Step 1: Create Production Accounts

### Stripe Production Setup

1. Log into Stripe and disable Test Mode
2. Go to **Settings → Business Profile**
3. Complete business information
4. Enable payments once approved
5. Go to **Developers → API Keys**
6. Copy production keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_`)
   - `STRIPE_SECRET_KEY` (starts with `sk_live_`)
7. Create production webhook endpoint
   - Go to **Developers → Webhooks**
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select required events
   - Copy webhook secret

### Bunny.net Production Setup

1. Log into Bunny.net
2. Go to **Settings → Billing**
3. Verify payment method and enable production
4. Create new stream library for production
5. Get production API credentials

### Supabase Production Setup

1. Your Supabase project is production-ready
2. Enable Postgres backup in **Settings**
3. Go to **Security → Network** and configure firewall if needed

## Step 2: Push to GitHub

```bash
git add .
git commit -m "Prime Fight PPV Platform - Ready for Production"
git push origin main
```

## Step 3: Deploy to Vercel

### Option A: Direct Deployment

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Import from GitHub (select your repository)
4. Click "Deploy"

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

## Step 4: Add Environment Variables

In Vercel dashboard:

1. Go to your project **Settings → Environment Variables**
2. Add all variables from your `.env.local`:

```
# Supabase (use same as local)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (PRODUCTION KEYS)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Bunny.net
BUNNY_API_KEY=...
BUNNY_STREAM_LIBRARY_ID=...
BUNNY_CDN_HOSTNAME=xxxxx.b-cdn.net
```

3. Click "Save"

## Step 5: Configure Stripe Webhook

1. Go to Stripe **Developers → Webhooks**
2. Update webhook URL to your Vercel domain:
   - `https://your-vercel-domain.vercel.app/api/webhooks/stripe`
3. Update webhook secret in Vercel environment variables
4. Test webhook with Stripe dashboard

## Step 6: Set Custom Domain (Optional)

In Vercel:

1. Go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for verification (5-30 minutes)

## Step 7: Enable HTTPS

Vercel automatically provides HTTPS. No action needed.

## Step 8: Test Production Deployment

### Test Payment with Real Card

1. Visit your live domain
2. Create new account
3. Purchase subscription with real Stripe test card

Real test cards:
- **4000 0000 0000 0002** - Decline
- **4000 0025 0000 3155** - Decline with specific error
- **4242 4242 4242 4242** - Charge succeeds

(Note: These work on test mode. In production, use real cards but they won't charge)

### Verify Database Sync

1. Check Supabase dashboard
2. Verify new user profile was created
3. Verify subscription record was created

### Test Email

1. Check that confirmation emails are sent
2. Verify password reset functionality

## Step 9: Set Up Monitoring

### Enable Sentry (Error Tracking) - Optional

```bash
npm install @sentry/nextjs
```

Add to `sentry.client.config.ts`:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

Add to Vercel environment variables:
- `SENTRY_DSN=your-sentry-project-dsn`

### Enable Analytics - Optional

Connect to a service like:
- Google Analytics
- Mixpanel
- Plausible

## Step 10: Backup & Monitoring

### Supabase Backups

1. Go to **Settings → Backups**
2. Enable automatic backups
3. Set backup frequency (daily recommended)

### Vercel Monitoring

1. Enable **Analytics** in Vercel dashboard
2. Set up alerts for:
   - High error rate
   - Performance degradation
   - Deployment failures

## Step 11: Security Hardening

### Enable WAF - Optional

In Vercel:
1. Go to **Settings → Security**
2. Enable DDoS protection
3. Configure rate limiting

### Supabase Security

1. Go to **Settings → Security**
2. Review authentication settings
3. Enable two-factor authentication
4. Set up session timeout

### Stripe Security

1. Go to **Settings → Security**
2. Enable API key restrictions
3. Set up IP whitelisting for webhooks

## Production Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Database backups enabled
- [ ] SSL certificate active
- [ ] Stripe webhook configured
- [ ] Monitoring enabled
- [ ] Error tracking set up
- [ ] Logging configured
- [ ] Email notifications working
- [ ] Support contact information visible
- [ ] Privacy policy published
- [ ] Terms of service published

## Ongoing Maintenance

### Weekly Tasks
- Monitor error logs
- Check analytics
- Review Stripe transactions
- Monitor stream health

### Monthly Tasks
- Review user feedback
- Analyze engagement metrics
- Check performance metrics
- Update security patches

### Quarterly Tasks
- Backup data review
- Security audit
- Performance optimization
- Capacity planning

## Scaling

As your platform grows:

### Database Optimization
- Add indexes for frequently queried fields
- Archive old data
- Increase replica count

### Streaming Optimization
- Use Bunny.net geographic distribution
- Enable adaptive bitrate
- Configure caching policies

### Infrastructure Scaling
- Monitor Vercel metrics
- Upgrade to higher tier if needed
- Enable automatic scaling

## Troubleshooting Production

### Payment Not Processing

1. Check Stripe dashboard for errors
2. Verify webhook is configured
3. Check Vercel logs for webhook failures
4. Review environment variables

### Users Can't Access Content

1. Verify database has purchase record
2. Check RLS policies on purchases table
3. Review video stream access logs
4. Check Bunny.net stream status

### Videos Not Playing

1. Check Bunny.net dashboard
2. Verify HLS URL is correct
3. Check CDN bandwidth usage
4. Review stream health metrics

### High Latency

1. Check Bunny.net region settings
2. Verify database performance
3. Monitor API response times
4. Scale infrastructure if needed

## Rollback Procedure

If something goes wrong:

1. In Vercel, go to **Deployments**
2. Find previous stable deployment
3. Click **Promote to Production**
4. Verify everything works
5. Investigate issue in staging environment

## Staging Environment Setup

For testing before production:

```bash
# Create staging environment in Vercel
vercel env pull staging .env.staging
```

Add staging environment variables:
- Use Stripe test keys
- Use test Bunny.net credentials
- Point to staging Supabase database

Test thoroughly before deploying to production.

## Going Live Announcement

1. Notify users via email
2. Post on social media
3. Update website
4. Prepare support team
5. Monitor closely first 24 hours

## Performance Targets

Aim for:
- Page load: < 2 seconds
- Video start: < 3 seconds
- API response: < 200ms
- Uptime: > 99.9%

## Budget Planning

Monthly costs approximately:

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $20+ | Pro plan |
| Supabase | $25+ | Depending on usage |
| Stripe | 2.9% + $0.30 | Per transaction |
| Bunny.net | Bandwidth | ~$0.01 per GB |
| **Total** | **$50+** | Variable by usage |

## Support & Help

- **Vercel Issues**: [vercel.com/help](https://vercel.com/help)
- **Supabase Issues**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe Issues**: [stripe.com/support](https://stripe.com/support)
- **Bunny.net Issues**: [bunny.net/support](https://bunny.net/support)

## Next Steps

After deployment:

1. Monitor for 24 hours
2. Gather user feedback
3. Plan feature improvements
4. Set up marketing
5. Expand to mobile apps
6. Add advanced features

Congratulations! Your PPV streaming platform is live!
