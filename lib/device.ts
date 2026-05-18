// Shared utility for device ID generation - used across the app

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return ''

  let deviceId = localStorage.getItem('device_id')
  
  if (!deviceId) {
    // Generate a truly unique device ID using crypto random
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    deviceId = 'device_' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
    localStorage.setItem('device_id', deviceId)
    console.log('[device] Created new device_id:', deviceId)
  } else {
    console.log('[device] Using existing device_id:', deviceId)
  }
  
  return deviceId
}

export function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Unknown Device'

  const ua = navigator.userAgent

  if (/(tablet|ipad|playbook)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet'
  }
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return 'Mobile Phone'
  }
  if (/(Win64|Win32|Macintosh|Mac OS X)/i.test(ua)) {
    return 'Desktop Computer'
  }
  return 'Unknown Device'
}
