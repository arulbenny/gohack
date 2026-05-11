import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password, full_name, role, college_id, id_card_url } = body

  if (!email || !password || !full_name || !college_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Create auth user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Generate unique anon ID
  const anonId = 'Anon #' + Math.floor(1000 + Math.random() * 9000)

  // Save extra user info in our users table
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id: authData.user?.id,
      email,
      full_name,
      role: role || 'student',
      college_id,
      id_card_url,
      is_approved: true,
      anon_id: anonId,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, message: 'Account created successfully!' }, { status: 201 })
}