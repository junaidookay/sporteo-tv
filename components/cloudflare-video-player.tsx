'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'

interface CloudflareVideoPlayerProps {
  videoId: string
  signedUrl?: string
  title?: string
  isLive?: boolean
  poster?: string
}

declare global {
  interface Window {
    cloudflare: any
  }
}

export default function CloudflareVideoPlayer({
  videoId,
  signedUrl,
  title,
  isLive = false,
  poster,
}: CloudflareVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlayer = async () => {
      if (!containerRef.current || !videoId) return

      try {
        const videoUrl = signedUrl || `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`

        const iframe = document.createElement('iframe')
        iframe.src = videoUrl
        iframe.style.width = '100%'
        iframe.style.height = '100%'
        iframe.style.border = 'none'
        iframe.style.borderRadius = '0.5rem'
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        iframe.allowFullscreen = true

        iframe.onload = () => setLoaded(true)
        iframe.onerror = () => setError('Failed to load video player')

        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(iframe)
      } catch (err) {
        console.error('Error loading video player:', err)
        setError('Failed to load video player')
      }
    }

    loadPlayer()
  }, [videoId, signedUrl])

  if (error) {
    return (
      <Card className="w-full aspect-video bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-400 hover:text-white"
          >
            Retry
          </button>
        </div>
      </Card>
    )
  }

  return (
    <div className="relative w-full">
      {isLive && (
        <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}
      <Card className="w-full aspect-video bg-black overflow-hidden">
        <div ref={containerRef} className="w-full h-full">
          {!loaded && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
          )}
        </div>
      </Card>
      {title && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
      )}
    </div>
  )
}