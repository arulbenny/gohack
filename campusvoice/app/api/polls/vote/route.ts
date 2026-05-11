import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { poll_id, option_id, user_id } = body

  if (!poll_id || !option_id || !user_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Check if already voted
  const { data: existing } = await supabase
    .from('poll_votes')
    .select('id')
    .eq('poll_id', poll_id)
    .eq('user_id', user_id)
    .single()

  if (existing) return NextResponse.json({ error: 'Already voted' }, { status: 400 })

  // Save vote
  const { error: voteError } = await supabase
    .from('poll_votes')
    .insert([{ poll_id, option_id, user_id }])

  if (voteError) return NextResponse.json({ error: voteError.message }, { status: 500 })

  // Increment vote count
  const { error: countError } = await supabase.rpc('increment_poll_vote', { option_id })
  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}