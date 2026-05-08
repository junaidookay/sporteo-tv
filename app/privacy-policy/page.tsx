import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Sporteo.tv',
  description: 'Privacy Policy and Cookie information for Sporteo.tv',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-3xl font-black mb-4">Introduction</h2>
            <p className="text-foreground/80">
              At Sporteo.tv, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          {/* Cookie Usage */}
          <section>
            <h2 className="text-3xl font-black mb-4">Cookies and Tracking Technologies</h2>
            
            <h3 className="text-xl font-bold mb-3 mt-6">What are Cookies?</h3>
            <p className="text-foreground/80">
              Cookies are small data files stored on your device that help us provide a better experience. We use different types of cookies for different purposes.
            </p>

            <h3 className="text-xl font-bold mb-3 mt-6">Types of Cookies We Use</h3>
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <h4 className="font-bold mb-2">Necessary Cookies</h4>
                <p className="text-sm text-foreground/70">
                  These cookies are essential for the website to function properly. They enable you to navigate and use core features such as authentication, payment processing, and security. You cannot disable these cookies.
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <h4 className="font-bold mb-2">Functional Cookies</h4>
                <p className="text-sm text-foreground/70">
                  These cookies remember your preferences and settings, such as language selection, theme preferences, and login information. This helps personalize your experience on return visits.
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <h4 className="font-bold mb-2">Analytics Cookies</h4>
                <p className="text-sm text-foreground/70">
                  We use these cookies to understand how you interact with our website. They help us analyze user behavior, measure site performance, and identify areas for improvement. Data is anonymized and aggregated.
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <h4 className="font-bold mb-2">Marketing Cookies</h4>
                <p className="text-sm text-foreground/70">
                  These cookies track your activity across websites to enable personalized advertising and content recommendations. They help us show you relevant offers and promotions.
                </p>
              </div>
            </div>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-3xl font-black mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-bold mb-3">Directly Provided Information</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>Account information (email, password, profile data)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Subscription preferences</li>
              <li>Viewing history and preferences</li>
            </ul>

            <h3 className="text-xl font-bold mb-3 mt-6">Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>Browser type and version</li>
              <li>IP address and location</li>
              <li>Device information</li>
              <li>Pages visited and time spent</li>
              <li>Referral sources</li>
              <li>Interaction data (clicks, scrolls, etc.)</li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section>
            <h2 className="text-3xl font-black mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>Provide and improve our services</li>
              <li>Process payments and subscriptions</li>
              <li>Analyze website usage and performance</li>
              <li>Personalize your experience</li>
              <li>Send updates and promotional content</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-3xl font-black mb-4">Your Rights</h2>
            <p className="text-foreground/80 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Manage cookie preferences anytime</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-3xl font-black mb-4">Contact Us</h2>
            <p className="text-foreground/80">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p className="text-foreground/80 mt-4">
              Email: privacy@sporteo.tv
            </p>
          </section>

          {/* Cookie Settings */}
          <section className="bg-primary/10 border border-primary/20 rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">Manage Your Cookie Preferences</h2>
            <p className="text-foreground/80 mb-4">
              You can update your cookie preferences at any time by clearing your browser data and revisiting the site, or contact us for assistance.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/">
            <Button variant="outline" className="border-border">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </>
  )
}
