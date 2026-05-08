'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getCookieConsent, setCookieConsent, hasCookieConsent } from '@/lib/cookie-consent'
import type { CookieConsent } from '@/lib/cookie-consent'

export function CookieConsentBanner() {
  const [show, setShow] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookieConsent>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = hasCookieConsent()
    if (!hasConsent) {
      setShow(true)
    } else {
      const stored = getCookieConsent()
      if (stored) {
        setPreferences(stored)
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    setCookieConsent(consent)
    setShow(false)
  }

  const handleRejectAll = () => {
    const consent: CookieConsent = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    setCookieConsent(consent)
    setShow(false)
  }

  const handleSavePreferences = () => {
    setCookieConsent(preferences)
    setShow(false)
    setShowSettings(false)
  }

  const togglePreference = (key: keyof CookieConsent) => {
    if (key === 'necessary') return // Cannot toggle necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (!show) return null

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <Card className="max-w-2xl mx-auto border-border bg-background/95 backdrop-blur-sm">
          {!showSettings ? (
            // Main Banner
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-black mb-2">Cookie Preferences</h2>
                <p className="text-sm text-muted-foreground">
                  We use cookies to enhance your browsing experience, analyze site traffic, and serve personalized content. Please choose your preferences below.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold">Necessary Cookies</p>
                    <p className="text-muted-foreground text-xs">Required for site functionality</p>
                  </div>
                  <div className="px-3 py-1 bg-secondary rounded text-xs font-bold">Always On</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold">Functional Cookies</p>
                    <p className="text-muted-foreground text-xs">Remember your preferences and settings</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold">Analytics Cookies</p>
                    <p className="text-muted-foreground text-xs">Help us understand how you use the site</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold">Marketing Cookies</p>
                    <p className="text-muted-foreground text-xs">Personalize ads and content</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  className="flex-1 border-border"
                >
                  Reject All
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="flex-1 border-border"
                >
                  Customize
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Settings Panel
            <div className="p-6">
              <h2 className="text-lg font-black mb-6">Cookie Settings</h2>

              <div className="space-y-4 mb-6">
                {/* Necessary */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Necessary Cookies</p>
                      <p className="text-sm text-muted-foreground">
                        Essential for website functionality. Cannot be disabled.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="w-5 h-5"
                    />
                  </div>
                </div>

                {/* Functional */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Functional Cookies</p>
                      <p className="text-sm text-muted-foreground">
                        Remember your preferences, language selection, and login information.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={() => togglePreference('functional')}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Analytics */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Analytics Cookies</p>
                      <p className="text-sm text-muted-foreground">
                        Help us understand user behavior and improve our services through data analysis.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => togglePreference('analytics')}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Marketing */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Marketing Cookies</p>
                      <p className="text-sm text-muted-foreground">
                        Enable personalized advertising and content recommendations.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => togglePreference('marketing')}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="flex-1 border-border"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Overlay */}
      {show && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => {
            // Don't close on overlay click - user must make a choice
          }}
        />
      )}
    </>
  )
}
