import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!error && user) {
      let profile = await prisma.user.findUnique({
        where: { id: user.id }
      })

      if (!profile) {
        profile = await syncUserProfile(user)
      }

      return { supabaseUser: user, profile }
    }
  } catch (e) {
    // Fallthrough to demo user if supabase fails or is not logged in
  }

  // Fallback demo user profile for dev/testing when no Supabase session exists
  try {
    let demoProfile = await prisma.user.findFirst({
      where: { username: 'test_user' }
    })

    if (!demoProfile) {
      demoProfile = await prisma.user.create({
        data: {
          email: 'demo@datalord.io',
          username: 'test_user',
          name: 'Test User',
          coins: 100,
        }
      })
    }

    return { supabaseUser: null, profile: demoProfile }
  } catch (e) {
    console.error('Error fetching fallback profile:', e)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user || !user.profile) {
    return null
  }
  
  return user
}

export async function syncUserProfile(supabaseUser: SupabaseUser) {
  const email = supabaseUser.email!
  const name = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null
  const avatarUrl = supabaseUser.user_metadata?.avatar_url || null
  const username = supabaseUser.user_metadata?.username || email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 7)

  const user = await prisma.user.upsert({
    where: { id: supabaseUser.id },
    update: {
      email,
      name,
      avatarUrl,
    },
    create: {
      id: supabaseUser.id,
      email,
      name,
      username,
      avatarUrl,
    }
  })

  return user
}
