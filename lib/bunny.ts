// Bunny.net integration for video streaming
// API Documentation: https://docs.bunny.net/

const BUNNY_API_KEY = process.env.BUNNY_API_KEY
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'primefight'
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || 'primefight.b-cdn.net'
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID

if (!BUNNY_API_KEY) {
  console.warn('BUNNY_API_KEY not configured. Video streaming will not work.')
}

// Bunny API client
export const bunnyAPI = {
  async makeRequest(path: string, options: RequestInit = {}) {
    const url = `https://api.bunny.net${path}`
    const headers = {
      'AccessKey': BUNNY_API_KEY || '',
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`Bunny API error: ${response.statusText}`)
    }

    return response.json()
  },
}

// Stream management
export interface BunnyStream {
  id: string
  name: string
  rtmpUrl: string
  rtmpKey: string
  hslUrl?: string
  dashUrl?: string
  status: 'created' | 'pending' | 'offline' | 'online'
  viewerCount?: number
}

export async function createBunnyStream(name: string): Promise<BunnyStream> {
  try {
    const response = await bunnyAPI.makeRequest('/livechart', {
      method: 'POST',
      body: JSON.stringify({
        name,
        recordingEnabled: true,
        replayPreservationEnabled: true,
      }),
    })

    return {
      id: response.id,
      name: response.name,
      rtmpUrl: response.rtmpServerUrl,
      rtmpKey: response.streamKey,
      hslUrl: response.hlsUrl,
      dashUrl: response.dashUrl,
      status: response.status || 'created',
    }
  } catch (error) {
    console.error('Failed to create Bunny stream:', error)
    throw error
  }
}

export async function getBunnyStream(streamId: string): Promise<BunnyStream | null> {
  try {
    const response = await bunnyAPI.makeRequest(`/livechart/${streamId}`)

    return {
      id: response.id,
      name: response.name,
      rtmpUrl: response.rtmpServerUrl,
      rtmpKey: response.streamKey,
      hslUrl: response.hlsUrl,
      dashUrl: response.dashUrl,
      status: response.status || 'offline',
      viewerCount: response.viewerCount || 0,
    }
  } catch (error) {
    console.error('Failed to get Bunny stream:', error)
    return null
  }
}

export async function deleteBunnyStream(streamId: string): Promise<void> {
  try {
    await bunnyAPI.makeRequest(`/livechart/${streamId}`, {
      method: 'DELETE',
    })
  } catch (error) {
    console.error('Failed to delete Bunny stream:', error)
    throw error
  }
}

// Video management
export interface BunnyVideo {
  guid: string
  title: string
  duration: number
  status: 'uploaded' | 'processing' | 'published' | 'failed'
  thumbnailUrl?: string
  videoUrl?: string
}

export async function uploadVideo(
  videoUrl: string,
  title: string
): Promise<{ videoId: string; uploadUrl: string }> {
  try {
    // Create a new video in Bunny library
    const response = await bunnyAPI.makeRequest('/video', {
      method: 'POST',
      body: JSON.stringify({
        title,
      }),
    })

    return {
      videoId: response.guid,
      uploadUrl: `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${response.guid}/`,
    }
  } catch (error) {
    console.error('Failed to create video upload:', error)
    throw error
  }
}

export async function getVideo(videoId: string): Promise<BunnyVideo | null> {
  try {
    const response = await bunnyAPI.makeRequest(`/video/${videoId}`)

    return {
      guid: response.guid,
      title: response.title,
      duration: response.duration,
      status: response.status,
      thumbnailUrl: response.thumbnail,
      videoUrl: `https://${BUNNY_CDN_HOSTNAME}/${videoId}/play_${videoId}.html`,
    }
  } catch (error) {
    console.error('Failed to get video:', error)
    return null
  }
}

// Video playback signing
export function generateVideoAccessToken(videoId: string, expires?: Date): string {
  // This is a simplified version. In production, you'd want to:
  // 1. Use proper HMAC signing with your token authentication key
  // 2. Set appropriate expiration times
  // 3. Potentially restrict by IP or other parameters

  const expiresAt = expires || new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours default
  const expiresTimestamp = Math.floor(expiresAt.getTime() / 1000)

  // In a real implementation, you'd sign this with your Bunny API key
  // For now, we'll just return a basic token structure
  return btoa(JSON.stringify({
    videoId,
    expires: expiresTimestamp,
  }))
}

// HLS stream playback URL generation
export function getHLSPlaybackUrl(streamId: string): string {
  return `https://${BUNNY_CDN_HOSTNAME}/${streamId}/playlist.m3u8`
}

// DASH stream playback URL generation
export function getDASHPlaybackUrl(streamId: string): string {
  return `https://${BUNNY_CDN_HOSTNAME}/${streamId}/manifest.mpd`
}

// Stream health monitoring
export async function getStreamStats(streamId: string): Promise<{
  viewerCount: number
  bitrate: number
  resolution: string
  isHealthy: boolean
}> {
  try {
    const stream = await getBunnyStream(streamId)
    if (!stream) {
      return {
        viewerCount: 0,
        bitrate: 0,
        resolution: 'unknown',
        isHealthy: false,
      }
    }

    return {
      viewerCount: stream.viewerCount || 0,
      bitrate: 0, // Would need additional API calls for detailed stats
      resolution: '1080p', // Would need additional API calls for detailed stats
      isHealthy: stream.status === 'online',
    }
  } catch (error) {
    console.error('Failed to get stream stats:', error)
    return {
      viewerCount: 0,
      bitrate: 0,
      resolution: 'unknown',
      isHealthy: false,
    }
  }
}
