import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const issue_id = searchParams.get('issue_id')

  if (!issue_id) return NextResponse.json({ error: 'Missing issue_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('polls')
    .select('*, poll_options(*)')
    .eq('issue_id', issue_id)
    .single()

  if (error) return NextResponse.json({ data: null })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { issue_id, question, options } = body

  if (!issue_id || !question || !options?.length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert([{ issue_id, question }])
    .select()
    .single()

  if (pollError) return NextResponse.json({ error: pollError.message }, { status: 500 })

  const optionRows = options.map((opt: string) => ({
    poll_id: poll.id,
    option_text: opt,
  }))

  const { error: optError } = await supabase.from('poll_options').insert(optionRows)
  if (optError) return NextResponse.json({ error: optError.message }, { status: 500 })

  return NextResponse.json({ data: poll }, { status: 201 })
}