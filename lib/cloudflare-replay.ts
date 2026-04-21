const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

export async function createLiveRecording(
  liveInputId: string,
  accountId: string,
  apiToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/stream/live_inputs/${liveInputId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Failed to get live input details')
      return null
    }

    const data: any = await response.json()
    if (!data.success) {
      console.error('Cloudflare API error:', data.errors)
      return null
    }

    return data.result.uid || null
  } catch (error) {
    console.error('Error creating live recording:', error)
    return null
  }
}

export async function getLiveRecordings(
  liveInputId: string,
  accountId: string,
  apiToken: string
) {
  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/stream/live_inputs/${liveInputId}/videos`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data: any = await response.json()
    if (!data.success) {
      return []
    }

    return data.result || []
  } catch (error) {
    console.error('Error getting live recordings:', error)
    return []
  }
}

export async function deleteLiveRecording(
  videoId: string,
  accountId: string,
  apiToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/stream/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data: any = await response.json()
    return data.success
  } catch (error) {
    console.error('Error deleting live recording:', error)
    return false
  }
}