import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Sign out from Supabase - this invalidates the session
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('[logout] SignOut error:', error)
    }
    
    // Create a response that also instructs client to clear cookies
    const response = NextResponse.json({ success: true })
    
    // Clear all Supabase-related cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    response.cookies.delete('supabase-auth-token')
    response.cookies.delete('device_id')
    
    return response
  } catch (error) {
    console.error('[logout] Error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
