import Link from 'next/link'
import { Card } from '@/components/ui/card'

interface LiveStreamCardProps {
  event: any
}

export function LiveStreamCard({ event }: LiveStreamCardProps) {
  return (
    <Link href={`/watch/${event.id}`}>
      <Card className="overflow-hidden hover:border-primary transition-all hover:shadow-lg cursor-pointer h-full flex flex-col group border-primary bg-primary/5">
        <div className="relative h-48 bg-black overflow-hidden">
          {event.cloudflare_live_input_id && event.cloudflare_customer_subdomain ? (
            <iframe
              src={`https://customer-${event.cloudflare_customer_subdomain}.cloudflarestream.com/${event.cloudflare_live_input_id}/iframe`}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <img
              src={event.featured_image || '/placeholder.jpg'}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-600 text-white animate-pulse">
              LIVE NOW
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
            <div className="flex items-center gap-2 text-xs text-red-500 font-bold">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              STREAMING NOW
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground">{event.event_type}</div>
            {event.location && (
              <div className="text-sm font-medium">{event.location}</div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}