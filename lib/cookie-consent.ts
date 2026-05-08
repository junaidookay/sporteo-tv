export interface CookieConsent {
  analytics: boolean
  marketing: boolean
  functional: boolean
  necessary: boolean // Always true, cannot be disabled
}

const CONSENT_KEY = 'cookie_consent'
const CONSENT_VERSION = '1'

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('[v0] Failed to parse cookie consent:', error)
  }
  return null
}

export function setCookieConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
  } catch (error) {
    console.error('[v0] Failed to save cookie consent:', error)
  }
}

export function hasCookieConsent(): boolean {
  return getCookieConsent() !== null
}

export function isAnalyticsEnabled(): boolean {
  const consent = getCookieConsent()
  return consent?.analytics ?? false
}

export function isMarketingEnabled(): boolean {
  const consent = getCookieConsent()
  return consent?.marketing ?? false
}

export function isFunctionalEnabled(): boolean {
  const consent = getCookieConsent()
  return consent?.functional ?? true // Functional is enabled by default after consent
}
