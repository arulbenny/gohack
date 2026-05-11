import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all pending users for a college
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const college_id = searchParams.get('college_id')

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('college_id', college_id)
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// PATCH - approve or reject a user
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { user_id, is_approved } = body

  const { data, error } = await supabase
    .from('users')
    .update({ is_approved })
    .eq('id', user_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
