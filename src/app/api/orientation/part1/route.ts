import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { isNoEmail, ...formData } = body

    // Get group ID from cookie
    const groupIdCookie = request.cookies.get('pending_group_id')
    if (!groupIdCookie) {
      return NextResponse.json(
        { error: 'Session expired. Please start over.' },
        { status: 401 }
      )
    }
    const groupId = groupIdCookie.value
    const today = new Date().toISOString().split('T')[0]

    if (isNoEmail) {
      // No-email check-in
      const { error } = await supabase.from('attendance_register').insert({
        id: uuidv4(),
        group_id: groupId,
        attendance_date: today,
        is_no_email_check_in: true,
        member_id: null,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth || null,
        ethnicity: formData.ethnicity,
        gender: formData.gender,
        reason_for_attending: formData.reasonForAttending,
      })

      if (error) {
        console.error('Error creating no-email attendance:', error)
        return NextResponse.json(
          { error: 'Failed to save attendance' },
          { status: 500 }
        )
      }

      const response = NextResponse.json({ status: 'SUCCESS' })
      response.cookies.set('app_status', '', { path: '/', maxAge: -1 })
      response.cookies.set('pending_group_id', '', { path: '/', maxAge: -1 })
      return response
    }

    // Email user - update member and create attendance
    const memberIdCookie = request.cookies.get('member_id')
    if (!memberIdCookie) {
      return NextResponse.json(
        { error: 'Member session not found. Please sign in again.' },
        { status: 401 }
      )
    }
    const memberId = memberIdCookie.value

    // Update member
    const { error: memberError } = await supabase
      .from('members')
      .update({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender,
        ethnicity: formData.ethnicity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)

    if (memberError) {
      console.error('Error updating member:', memberError)
      return NextResponse.json(
        { error: 'Failed to update member details.' },
        { status: 500 }
      )
    }

    // Create orientation details
    const { error: detailsError } = await supabase
      .from('orientation_details')
      .insert({
        member_id: memberId,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender,
        ethnicity: formData.ethnicity,
        reason_for_attending: formData.reasonForAttending,
      })

    if (detailsError) {
      console.error('Error creating orientation details:', detailsError)
      return NextResponse.json(
        { error: 'Failed to save orientation details.' },
        { status: 500 }
      )
    }

    // Create attendance record
    const { error: attendanceError } = await supabase
      .from('attendance_register')
      .insert({
        id: uuidv4(),
        member_id: memberId,
        group_id: groupId,
        attendance_date: today,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender,
        ethnicity: formData.ethnicity,
        reason_for_attending: formData.reasonForAttending,
        is_no_email_check_in: false,
      })

    if (attendanceError) {
      console.error('Error creating attendance record:', attendanceError)
      return NextResponse.json(
        { error: 'Failed to log attendance.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ status: 'SUCCESS' })
  } catch (error) {
    console.error('Unhandled error in orientation part1:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
