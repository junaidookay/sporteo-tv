'use client'

import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-black mb-8">Terms of Service</h1>
        <Card className="p-8 border-border space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Sporteo.tv, you agree to be bound by these Terms of Service.
              If you do not agree, please do not use our platform.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">Subscription Services</h2>
            <p className="text-muted-foreground">
              Our subscription services provide access to live and on-demand content.
              Subscriptions are billed recurring until cancelled. You can cancel anytime
              from your account settings.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">User Conduct</h2>
            <p className="text-muted-foreground">
              You agree not to share your account, attempt unauthorized access, or use
              our platform for any illegal purpose. We reserve the right to terminate
              accounts that violate these terms.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">Content Rights</h2>
            <p className="text-muted-foreground">
              All content on Sporteo.tv is protected by copyright. You may not record,
              redistribute, or commercially exploit any content without authorization.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, please contact us at legal@sporteo.tv.
            </p>
          </section>
        </Card>
      </main>
    </div>
  )
}