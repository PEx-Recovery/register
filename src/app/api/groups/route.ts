import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: groups, error } = await supabase
      .from('groups')
      .select('*')

    if (error) {
      console.error('Error fetching groups:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
