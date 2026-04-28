'use client'

import { useEffect, useState, useCallback } from 'react'

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return ''

  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    const browserInfo = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset()
    ].join('|')

    let hash = 0
    for (let i = 0; i < browserInfo.length; i++) {
      const char = browserInfo.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    deviceId = `device_${Math.abs(hash).toString(16)}_${Date.now()}`
    localStorage.setItem('device_id', deviceId)
  }
  return deviceId
}

function getDeviceName(): string {
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

interface UseDeviceSessionReturn {
  deviceId: string
  deviceName: string
  isSessionValid: boolean
  isLoading: boolean
  registerSession: () => Promise<boolean>
  updateHeartbeat: () => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  listSessions: () => Promise<any[]>
}

export function useDeviceSession(): UseDeviceSessionReturn {
  const [deviceId, setDeviceId] = useState<string>('')
  const [deviceName, setDeviceName] = useState<string>('Unknown Device')
  const [isSessionValid, setIsSessionValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const id = getOrCreateDeviceId()
    const name = getDeviceName()
    setDeviceId(id)
    setDeviceName(name)

    const verifySession = async () => {
      try {
        const response = await fetch('/api/user-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'validate',
            device_id: id
          })
        })

        const data = await response.json()
        setIsSessionValid(data.valid === true)
      } catch (error) {
        console.error('Session validation error:', error)
        setIsSessionValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [])

  const registerSession = useCallback(async (): Promise<boolean> => {
    if (!deviceId) return false

    try {
      const response = await fetch('/api/user-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          device_id: deviceId,
          device_name: deviceName
        })
      })

      const data = await response.json()
      if (data.success) {
        setIsSessionValid(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Session registration error:', error)
      return false
    }
  }, [deviceId, deviceName])

  const updateHeartbeat = useCallback(async (): Promise<void> => {
    if (!deviceId) return

    try {
      await fetch('/api/user-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'heartbeat',
          device_id: deviceId
        })
      })
    } catch (error) {
      console.error('Heartbeat error:', error)
    }
  }, [deviceId])

  const logout = useCallback(async (): Promise<void> => {
    if (!deviceId) return

    try {
      await fetch('/api/user-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logout',
          device_id: deviceId
        })
      })
      setIsSessionValid(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [deviceId])

  const logoutAll = useCallback(async (): Promise<void> => {
    try {
      await fetch('/api/user-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout_all' })
      })
      setIsSessionValid(false)
    } catch (error) {
      console.error('Logout all error:', error)
    }
  }, [])

  const listSessions = useCallback(async (): Promise<any[]> => {
    try {
      const response = await fetch('/api/user-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      })
      const data = await response.json()
      return data.sessions || []
    } catch (error) {
      console.error('List sessions error:', error)
      return []
    }
  }, [])

  return {
    deviceId,
    deviceName,
    isSessionValid,
    isLoading,
    registerSession,
    updateHeartbeat,
    logout,
    logoutAll,
    listSessions
  }
}