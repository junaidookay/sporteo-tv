'use client'

import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-black mb-8">About Sporteo.tv</h1>
        <Card className="p-8 border-border">
          <p className="text-lg mb-6">
            Sporteo.tv is a premium pay-per-view streaming platform for live sports events worldwide.
            We bring you the best in boxing, MMA, basketball, football, tennis, and more.
          </p>
          <p className="text-lg mb-6">
            Our mission is to make premium sports content accessible to fans everywhere,
            with crystal-clear streaming quality and an unmatched viewing experience.
          </p>
          <p className="text-lg">
            Founded in 2025, Sporteo.tv is committed to delivering the ultimate sports streaming
            experience to fans around the globe.
          </p>
        </Card>
      </main>
    </div>
  )
}