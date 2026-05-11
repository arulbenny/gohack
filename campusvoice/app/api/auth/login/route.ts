import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
  }

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

  // Get user profile from our users table
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*, colleges(name)')
    .eq('id', authData.user.id)
    .single()

  if (profileError) return NextResponse.json({ error: 'User profile not found' }, { status: 404 })

  if (!userProfile.is_approved) {
    return NextResponse.json({ error: 'Your account is pending admin approval.' }, { status: 403 })
  }

  return NextResponse.json({
    data: {
      user: userProfile,
      session: authData.session,
    }
  })
}