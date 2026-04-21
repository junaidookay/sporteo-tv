# Cloudflare Stream Implementation Guide

## Overview
Complete replacement of Bunny.net with Cloudflare Stream for live streaming and video hosting with advanced features for secure playback and device limiting.

## What's Been Implemented

### 1. Cloudflare Stream Library (`lib/cloudflare-stream.ts`)
- **Core Functions:**
  - `createStream()` - Create new video for uploads
  - `createLiveInput()` - Create RTMP endpoint for OBS streaming
  - `getLiveInput()` - Get live input details and RTMP URLs
  - `generateSignedURL()` - Generate time-limited signed URLs for secure playback
  - `getPlaybackURL()` - Get HLS manifest URL for videos
  - `getRTMPPushURL()` - Get RTMP push URL for OBS streaming

- **Features:**
  - Automatic HLS video generation
  - Signed URL support with expiration (default 1 hour)
  - Live input management for OBS streaming
  - Error handling and logging

### 2. Enhanced Video Player (`components/cloudflare-video-player.tsx`)
- **Features:**
  - Native Cloudflare Stream embed (iframe-based)
  - Live stream indicators
  - Adaptive bitrate streaming
  - Fallback playback handling
  - Responsive design

### 3. API Routes
- **`app/api/admin/live-streams/route.ts`** - Admin endpoints for managing live streams
- **`app/api/cloudflare/signed-url/route.ts`** - Generate signed URLs for secure video playback
- **`app/api/cloudflare/webhooks/live-input/route.ts`** - Handle Cloudflare webhooks for live input events

### 4. Updated Watch Page (`app/watch/[id]/page.tsx`)
- Uses Cloudflare Video Player component
- Handles both live streams and video replays
- Device limiting support via signed URLs

## Configuration

### Environment Variables (Vercel)
```
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

### Admin Settings Page
- Cloudflare API Token
- Cloudflare Account ID
- Cloudflare Stream Zone ID

## Database Schema (`scripts/011_cloudflare_stream.sql`)
- `streams.cloudflare_stream_id` - Cloudflare Stream video ID
- `streams.cloudflare_live_input_id` - Cloudflare Live Input ID
- `streams.is_live` - Boolean for live status
- `streams.ingestion_key` - Stream ingestion key for RTMP

## How to Use

### For Live Streaming:
1. Create a live stream in the admin dashboard
2. Get the RTMP push URL and stream key
3. Configure OBS with:
   - Server: RTMP URL from admin
   - Stream Key: The ingestion key

### For Video Playback:
1. Upload video to Cloudflare Stream
2. Associate video ID with event
3. Users access via signed URLs (auto-generated)

## Migration from Bunny.net
- All Bunny.net references have been removed
- Videos have been migrated to Cloudflare Stream
- Existing event-stream associations remain intact
