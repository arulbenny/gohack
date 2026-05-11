import { NextResponse } from 'next/server'
import { supabase } from  '@/lib/supabase'

// GET all colleges (for signup dropdown)
export async function GET() {
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
