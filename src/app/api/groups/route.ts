import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'

// 🔥 CRITICAL: Add these two lines at the top
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: groups, error } = await supabase.from('groups').select('*')

  if (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(groups)
}