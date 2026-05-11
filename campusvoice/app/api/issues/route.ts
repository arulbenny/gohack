import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const college_id = searchParams.get('college_id')
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const user_id = searchParams.get('user_id')

  let query = supabase
    .from('issues')
    .select('*, users(anon_id)')
    .order('created_at', { ascending: false })

  if (college_id) query = query.eq('college_id', college_id)
  if (category && category !== 'All') query = query.eq('category', category)
  if (status && status !== 'All') query = query.eq('status', status)
  if (user_id) query = query.eq('user_id', user_id)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, description, category, college_id, image_url, user_id } = body

  if (!title || !category || !college_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('issues')
    .insert([{ title, description, category, college_id, image_url, user_id }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}