import fetch from 'node-fetch'

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

interface StreamCreateOptions {
  name: string
  description?: string
  isLiveInput?: boolean
}

interface StreamSignedURLOptions {
  videoId: string
  expiresIn?: number
}

interface LiveInputCreateOptions {
  name: string
  description?: string
}

export class CloudflareStream {
  private accountId: string
  private apiToken: string

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || ''
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || ''

    if (!this.accountId || !this.apiToken) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables are required')
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    }
  }

  async createStream(options: StreamCreateOptions) {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${this.accountId}/stream`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          meta: {
            name: options.name,
            description: options.description || '',
          },
          isLiveInput: options.isLiveInput || false,
        }),
      }
    )

    const data: any = await response.json()
    if (!data.success) {
      throw new Error(`Failed to create stream: ${data.errors?.[0]?.message || 'Unknown error'}`)
    }

    return data.result
  }

  async getStream(videoId: string) {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${this.accountId}/stream/${videoId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    )

    const data: any = await response.json()
    if (!data.success) {
      throw new Error(`Failed to get stream: ${data.errors?.[0]?.message || 'Unknown error'}`)
    }

    return data.result
  }

  async createLiveInput(options: LiveInputCreateOptions) {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${this.accountId}/stream/live_inputs`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          meta: {
            name: options.name,
            description: options.description || '',
          },
        }),
      }
    )

    const data: any = await response.json()
    if (!data.success) {
      throw new Error(`Failed to create live input: ${data.errors?.[0]?.message || 'Unknown error'}`)
    }

    return data.result
  }

  async getLiveInput(liveInputId: string) {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${this.accountId}/stream/live_inputs/${liveInputId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    )

    const data: any = await response.json()
    if (!data.success) {
      throw new Error(`Failed to get live input: ${data.errors?.[0]?.message || 'Unknown error'}`)
    }

    return data.result
  }

  async deleteLiveInput(liveInputId: string) {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${this.accountId}/stream/live_inputs/${liveInputId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    )

    const data: any = await response.json()
    return data.success
  }

  async generateSignedURL(options: StreamSignedURLOptions): Promise<string> {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${this.accountId}/stream/${options.videoId}/token`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ttl: options.expiresIn || 3600,
        }),
      }
    )

    const data: any = await response.json()
    if (!data.success) {
      throw new Error(`Failed to generate signed URL: ${data.errors?.[0]?.message || 'Unknown error'}`)
    }

    const token = data.result.token
    return `https://customer-${this.accountId}.cloudflarestream.com/${options.videoId}/manifest/video.m3u8?token=${token}`
  }

  getPlaybackURL(videoId: string): string {
    return `https://customer-${this.accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8`
  }

  getRTMPPushURL(liveInputId: string): string {
    return `rtmp://live.cloudflare.com:1935/live/${liveInputId}`
  }

  getRTMPStreamKey(liveInputId: string): string {
    return liveInputId
  }
}

export default new CloudflareStream()