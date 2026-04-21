# Cloudflare Stream - Complete Workflow

## Overview

The streaming system now uses a three-stage workflow with admin preview before public visibility:

1. **Scheduled** → Generate OBS credentials
2. **OBS Streaming (Admin Preview)** → Admin reviews stream quality
3. **Go Live** → Stream becomes visible to viewers
4. **Stop & Archive** → Stream ends and becomes archived replay

## Detailed Workflow

### Stage 1: Create Event & Generate OBS Credentials

1. Admin creates a new event in `/admin/events`
2. Event appears in `/admin/streams` as "SCHEDULED"
3. Click **"Generate OBS Stream Key"** button
4. This creates a Cloudflare Live Input and returns:
   - **RTMPS URL**: `rtmps://live.cloudflare.com/rtmp/` (RTMPS Server)
   - **Stream Key**: Unique key for this event

### Stage 2: Configure OBS & Start Streaming

1. Open OBS Studio
2. Go to **Settings → Stream**
3. Select **Custom...** (not RTMP)
4. **Server**: `rtmps://live.cloudflare.com/rtmp/`
5. **Stream Key**: Copy from admin panel (the full key with credentials)
6. Click **Start Streaming**
7. Stream status changes to "OBS STREAMING" (orange indicator)
8. Admin sees stream in **ADMIN PREVIEW** section

### Stage 3: Admin Preview & Review

- **Admin can see the live stream** in the admin panel
- Only the admin can see this stream at this point
- **Users cannot access it yet** (is_publicly_live = false)
- Admin can check:
  - Video quality
  - Audio levels
  - Stream stability
  - Chatting with viewers about timing

### Stage 4: Go Live (Make Public)

When the admin is satisfied with the preview:

1. Click **"🔴 GO LIVE (Make Public)"** button
2. Stream instantly becomes visible to viewers
3. Stream moves from **ADMIN PREVIEW** to **PUBLIC LIVE**
4. Users can now watch at `/watch/[eventId]`

### Stage 5: Stop & Archive

When the stream should end:

1. Click **"Stop & Archive"** button
2. Stream stops streaming
3. Cloudflare automatically creates a **Replay Video**
4. Viewers can watch the archived replay (subject to subscription/purchase)

## Database Fields

```sql
-- is_live: Boolean - Stream is actively streaming (OBS connected)
-- is_publicly_live: Boolean - Stream is visible to viewers
-- cloudflare_live_input_id: Text - Cloudflare Live Input ID
-- cloudflare_live_input_key: Text - Stream key for OBS
-- cloudflare_rtmps_url: Text - RTMPS server URL
-- cloudflare_video_id: Text - Video ID for live playback
-- replay_video_id: Text - Auto-generated replay after stream ends
```

## API Endpoints

### Generate Live Input
**POST** `/api/cloudflare/create-live-input`
```json
{
  "eventId": "uuid"
}
```
Returns: `{ rtmpsUrl, streamKey, liveInputId }`

### Go Live / Stop / Archive
**POST** `/api/admin/go-live`
```json
{
  "eventId": "uuid",
  "action": "go-live" | "stop-preview" | "go-offline"
}
```

### Generate Signed URL (for playback)
**POST** `/api/cloudflare/signed-url`
```json
{
  "videoId": "uuid",
  "sessionToken": "token",
  "expiresIn": 3600
}
```

## Key Improvements

✅ **Admin Control**: Admins can review stream quality before going public
✅ **RTMPS Security**: Uses encrypted RTMPS instead of plain RTMP
✅ **Clear Credentials**: Shows RTMPS URL + Stream Key separately
✅ **Live Preview**: Admin can see stream before public visibility
✅ **Automatic Replay**: Cloudflare auto-records replays
✅ **Separate States**: 
   - `is_live` = OBS is streaming
   - `is_publicly_live` = Users can watch

## OBS Configuration Example

**Settings → Stream → Custom**
- **Server**: `rtmps://live.cloudflare.com/rtmp/`
- **Stream Key**: *(Copy full key from admin panel)*
- **Use authentication**: No (key includes auth)
- **Enable automatic reconnect**: Yes
- **Network optimizations**: Yes

## Troubleshooting

**"Stream key not generated"**
- Make sure Cloudflare Account ID and API Token are saved in Admin Settings
- Check network tab in browser for errors

**"OBS can't connect"**
- Verify RTMPS URL is exactly: `rtmps://live.cloudflare.com/rtmp/`
- Ensure Stream Key is copied completely
- Check firewall allows RTMPS port 1935

**"Stream visible in preview but not to users"**
- Click "GO LIVE" button to make it publicly visible
- is_publicly_live must be true for user access

**"Replay didn't create"**
- Cloudflare creates replays automatically when stream ends
- May take 1-2 minutes to process
- Check `/watch/[id]` page after stream ends
