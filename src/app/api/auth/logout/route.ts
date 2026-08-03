import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    // Even if signOut fails, we still want to clear the client session
    return NextResponse.json({ success: true })
  }
}
