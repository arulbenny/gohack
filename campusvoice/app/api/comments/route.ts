import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const issue_id = searchParams.get('issue_id')

  if (!issue_id) return NextResponse.json({ error: 'Missing issue_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('issue_id', issue_id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { issue_id, content } = body

  if (!issue_id || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await supabase
    .from('comments')
    .insert([{ issue_id, content }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}