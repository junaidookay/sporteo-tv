'use client'

import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-black mb-8">Support</h1>
        <Card className="p-8 border-border space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-4">
              Our support team is here to help you with any questions or issues you may have.
            </p>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="font-bold mb-2">Email Support</p>
              <p className="text-muted-foreground">support@sporteo.tv</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">Common Issues</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Payment and billing questions</li>
              <li>• Streaming quality issues</li>
              <li>• Account access problems</li>
              <li>• Subscription management</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">Response Time</h2>
            <p className="text-muted-foreground">
              We typically respond to support requests within 24-48 hours.
            </p>
          </section>
        </Card>
      </main>
    </div>
  )
}