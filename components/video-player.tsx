'use client'

import { useEffect, useRef } from 'react'

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  autoplay?: boolean
  controls?: boolean
  muted?: boolean
  className?: string
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoplay = false,
  controls = true,
  muted = false,
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Load HLS stream if applicable
    if (src.endsWith('.m3u8')) {
      // Check if HLS.js is available
      if (typeof window !== 'undefined' && 'HLS' in window) {
        const Hls = (window as any).HLS
        if (Hls.isSupported()) {
          const hls = new Hls()
          hls.loadSource(src)
          hls.attachMedia(video)
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari/iOS)
        video.src = src
      }
    } else {
      video.src = src
    }
  }, [src])

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        poster={poster}
        autoPlay={autoplay}
        controls={controls}
        muted={muted}
        className="w-full h-full"
        title={title}
      />
    </div>
  )
}

// HLS.js loader script
export function HLSScript() {
  return (
    <script
      src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"
      async
    />
  )
}
