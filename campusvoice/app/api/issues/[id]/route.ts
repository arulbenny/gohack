import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, admin_response, is_escalated, escalated_at } = body

  if (status && !['Pending', 'In Progress', 'Resolved'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updates: any = {}
  if (status) updates.status = status
  if (admin_response !== undefined) {
    updates.admin_response = admin_response
    updates.admin_responded_at = new Date().toISOString()
  }
  if (is_escalated !== undefined) {
  updates.is_escalated = is_escalated
  updates.escalated_at = escalated_at
}

  const { data, error } = await supabase
    .from('issues')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Issue deleted' })
}