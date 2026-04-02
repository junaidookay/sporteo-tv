# Payments & Streaming Implementation Guide

## Overview
This guide documents the complete payment processing, access control, and streaming implementation for Sporteo.tv.

## 1. Stripe Integration

### Payment Types Supported
- **PPV (Pay-Per-View)**: One-time payment for individual events
- **Subscriptions**: Monthly or annual subscription for unlimited access

### Stripe Webhook Configuration
Located at: `/app/api/webhooks/stripe/route.ts`

The webhook handles:
- `checkout.session.completed`: Creates purchases and subscriptions
- `customer.subscription.updated`: Updates subscription status
- `customer.subscription.deleted`: Cancels subscriptions
- `charge.refunded`: Marks purchases as refunded

### Event Creation with Pricing
Admin page: `/app/admin/events/page.tsx`

Admins can easily create events with:
1. **Event Type**: Select from Football, Basketball, Tennis, etc.
2. **PPV Price**: Set one-time purchase price (optional)
3. **Subscription Required**: Toggle whether subscription is needed
4. **Title, Date, Location, Description, Image**: All customizable

## 2. Access Control & Validation

### Purchase Verification Flow
```
User clicks "Watch Event"
  ↓
Check if authenticated
  ↓
Verify purchase OR subscription status
  ↓
Create stream session token (enforces one device limit)
  ↓
Initialize video player with session token
```

### Database Tables for Access Control

#### Purchases Table
- `user_id`: Which user purchased
- `event_id`: Which event
- `stripe_charge_id`: Payment reference
- `amount_cents`: Price paid
- `status`: completed, refunded
- `expires_at`: When access expires (30 days for PPV)

#### Subscriptions Table
- `user_id`: Subscriber
- `stripe_subscription_id`: Stripe reference
- `plan_type`: monthly or annual
- `status`: active or cancelled
- `current_period_end`: When subscription expires

#### Stream Access Table
- `user_id`: Who has access
- `event_id`: Which event
- `access_token`: Temporary access token
- `expires_at`: Token expiration

#### Stream Sessions Table (NEW)
- `user_id`: Active user
- `event_id`: Currently watching
- `device_id`: Which device (enforces one per user)
- `session_token`: Temporary session token
- `is_active`: Whether session is still active
- `expires_at`: 12-hour session timeout
- `ip_address`: Logged for security
- `user_agent`: Device info

## 3. Device/Stream Limiting

### One Active Device Per User - Implementation

The system enforces one active stream per user:

1. **Device Registration**: Each browser gets a unique `deviceId` (stored in localStorage)
2. **Session Creation**: When watching, a session is created with:
   - `session_token`: Secure 32-character token
   - `device_id`: Current device identifier
   - 12-hour timeout
3. **Termination on Conflict**: When user tries to stream on a new device:
   - Old device's session is automatically marked inactive
   - User can only watch on the new device
   - Old device stream stops working

### Implementation Location
- Stream session creation: `/app/api/stream-sessions/route.ts`
- Watch page integration: `/app/watch/[id]/page.tsx`
- Client-side device ID: Stored in browser localStorage

## 4. Dashboard Features

### My Library Section
- Location: Dashboard → "My Library" tab
- Shows: All purchased events with "WATCH NOW" buttons
- Functionality: One-click access to purchased content

### Purchase History Section
- Location: Dashboard → "Purchase History" tab
- Shows: All transactions with dates, amounts, and status
- Filters: By transaction type (PPV/Subscription)
- Details: Full payment information and receipt links

## 5. Video Playback with Access Control

### Watch Page Flow (`/app/watch/[id]/page.tsx`)
```
1. Load event details
2. Check user authentication
3. Create unique device ID if not exists
4. Request stream session token via /api/stream-sessions
5. If no access: show error message
6. If access granted: display video player with session token
7. Video player validates token every 5 minutes
```

### Session Token Validation
GET `/api/stream-sessions?token=<SESSION_TOKEN>`
- Returns: valid (true/false), event_id
- Expires: 12 hours from creation
- Stops working if another device starts streaming

## 6. Security Features

### Built-in Protections
1. **RLS (Row Level Security)**: Database-level access control
2. **Stripe Webhook Signature**: Verifies payment events are legitimate
3. **Session Tokens**: Temporary, expiring tokens instead of permanent access
4. **Device Limiting**: Automatic termination of old sessions
5. **IP & User Agent Logging**: Tracks session creation details
6. **Purchase Expiration**: PPV access expires after 30 days

### Access Validation Checklist
Before playing video:
- ✓ User is authenticated
- ✓ User has active purchase OR subscription
- ✓ Session token is valid
- ✓ Session hasn't expired
- ✓ Device ID matches current browser
- ✓ No other devices have active sessions

## 7. Admin Control Panel

### Event Management
- Create/Edit/Delete events: `/app/admin/events/page.tsx`
- Quick toggles for subscription requirement
- Easy pricing adjustment
- View active sessions: `/app/admin/streams/page.tsx`

### User Management
- View all users: `/app/admin/users/page.tsx`
- See purchase history
- Monitor subscriptions
- Check device sessions

## 8. API Endpoints

### Stream Sessions API
**POST** `/api/stream-sessions`
- Creates new session, terminates old ones
- Validates purchase/subscription
- Returns: `{ session_token, event_id }`

**GET** `/api/stream-sessions?token=<TOKEN>`
- Validates session token
- Returns: `{ valid, event_id }`
- 401/403 if invalid/expired

### Stripe Webhook
**POST** `/api/webhooks/stripe`
- Handles payment events
- Creates purchases/subscriptions
- No authentication needed (signature verified)

## 9. How to Use (For End Users)

### Purchasing PPV Event
1. Browse events at `/events`
2. Click event and choose "BUY NOW"
3. Complete payment via Stripe checkout
4. Access granted immediately
5. Watch on any device (but only one at a time)

### Subscribing
1. Go to `/subscriptions`
2. Choose monthly or annual plan
3. Complete payment
4. Access all events instantly
5. Can watch on one device at a time

### Watching Purchased Content
1. Visit `/dashboard` → "My Library"
2. See all purchased events
3. Click "WATCH NOW" to start
4. Video player initializes with session token
5. Auto-logout from other devices

## 10. Testing the Implementation

### Test PPV Purchase
1. Go to `/events`
2. Click an event → "BUY NOW"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Check dashboard → Purchase History
6. Watch event from "My Library"

### Test Device Limiting
1. Open event in Chrome
2. Video should play with session token
3. Open same event in Firefox
4. New device gets session
5. Chrome video stops (session terminated)

### Test Subscription
1. Go to `/subscriptions`
2. Purchase subscription (test card)
3. Access all events
4. Try watch from another device → old session ends

## 11. Database Setup

Run these migration scripts in Supabase SQL Editor (in order):
```
1. scripts/001_profiles.sql
2. scripts/002_events.sql
3. scripts/003_subscriptions.sql
4. scripts/004_purchases.sql
5. scripts/005_streams.sql
6. scripts/006_replays.sql
7. scripts/007_triggers.sql
8. scripts/008_stream_sessions.sql (NEW)
```

## 12. Environment Variables Required

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
BUNNY_API_KEY=...
BUNNY_STREAM_ID=...
```

## Troubleshooting

### User can't watch even after purchasing
- Check: Does purchase record exist in database?
- Check: Is purchase status "completed"?
- Check: Has it expired (30 days for PPV)?
- Fix: Manually create purchase record in Supabase

### Stream session error on watch page
- Check: Is stream_sessions table created?
- Check: Are all database migrations run?
- Check: Does user have valid purchase/subscription?
- Fix: Run migration 008_stream_sessions.sql

### Device limiting not working
- Check: Is localStorage enabled in browser?
- Check: Is deviceId being set?
- Fix: Clear browser cache and try again

### Stripe webhook failing
- Check: Is webhook secret configured correctly?
- Check: Is signature matching?
- Fix: Update STRIPE_WEBHOOK_SECRET in .env

