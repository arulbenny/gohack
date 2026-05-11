import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - toggle upvote
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { issue_id, user_id } = body

  if (!issue_id || !user_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Check if already upvoted
  const { data: existing } = await supabase
    .from('upvotes')
    .select('id')
    .eq('issue_id', issue_id)
    .eq('user_id', user_id)
    .single()

  if (existing) {
    // Remove upvote
    await supabase.from('upvotes').delete().eq('issue_id', issue_id).eq('user_id', user_id)
    await supabase.rpc('decrement_upvote', { issue_id })
    return NextResponse.json({ upvoted: false })
  } else {
    // Add upvote
    await supabase.from('upvotes').insert([{ issue_id, user_id }])
    await supabase.rpc('increment_upvote', { issue_id })
    return NextResponse.json({ upvoted: true })
  }
}
