'use client'

import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-black mb-8">Cookie Policy</h1>
        <Card className="p-8 border-border space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
            <p className="text-muted-foreground">
              Cookies are small text files stored on your device that help us provide
              and improve our service. They enable essential features like authentication
              and remembering your preferences.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies for authentication, security, and to remember your preferences.
              We also use analytics cookies to understand how you use our platform.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
            <p className="text-muted-foreground">
              You can control cookies through your browser settings. Disabling cookies
              may affect some functionality of our platform.
            </p>
          </section>
        </Card>
      </main>
    </div>
  )
}