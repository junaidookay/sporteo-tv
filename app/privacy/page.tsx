'use client'

import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-black mb-8">Privacy Policy</h1>
        <Card className="p-8 border-border space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly, including your name, email address,
              and payment information when you register for an account or make a purchase.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to process transactions, send notifications,
              and improve our services. We do not sell your personal information to third parties.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your personal information.
              All payment processing is handled securely through Stripe.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about our privacy practices, please contact us at support@sporteo.tv.
            </p>
          </section>
        </Card>
      </main>
    </div>
  )
}