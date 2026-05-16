export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  images?: string[]
  billingPeriod?: 'monthly' | 'annual'
}

// Subscription plans
export const SUBSCRIPTION_PLANS: Product[] = [
  {
    id: 'sub_monthly',
    name: 'Monthly Pass',
    description: 'Unlimited access to all events for one month',
    priceInCents: 999, // €9.99/month
    billingPeriod: 'monthly',
  },
  {
    id: 'sub_annual',
    name: 'Annual Pass',
    description: 'Unlimited access to all events for one year',
    priceInCents: 9999, // €99.99/year
    billingPeriod: 'annual',
  },
]

// Helper to get product by ID
export function getProduct(productId: string): Product | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === productId)
}

// Helper to validate product exists
export function isValidProduct(productId: string): boolean {
  return SUBSCRIPTION_PLANS.some((p) => p.id === productId)
}

// Helper to get price for display
export function formatPrice(priceInCents: number): string {
  return `€${(priceInCents / 100).toFixed(2)}`
}
