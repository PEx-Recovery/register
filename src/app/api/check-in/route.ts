// src/app/api/check-in/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import { syncAttendanceRegister } from '@/lib/glide-sync'


// Force dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Helper Functions
async function validateGeolocation(
  userLocation: any,
  groupLat: number,
  groupLon: number
): Promise<boolean> {
  console.log('SERVER-SIDE VALIDATION: Checking location...')
  return true // Assume true for now
}

async function validateTime(groupDay: string): Promise<boolean> {
  console.log('SERVER-SIDE VALIDATION: Checking day of week...')
  return true // Assume true for now
}

async function checkForDuplicate(
  supabase: any,
  memberId: string,
  groupId: string
): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('attendance_register')
    .select('id')
    .eq('member_id', memberId)
    .eq('group_id', groupId)
    .eq('attendance_date', today)
    .limit(1)

  if (error) {
    console.error('Error checking for duplicate:', error)
    return false
  }
  return data && data.length > 0
}

// Main API Route Handler
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, groupId, isNoEmail, geolocation } = body

    console.log('Check-in request received:', { email: email || 'no-email', groupId })

    const supabase = createClient()

    // Validate group exists
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('latitude, longitude, meeting_day')
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      console.error('Group not found:', groupError)
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Validate location and time
    if (
      !(await validateGeolocation(
        geolocation,
        group.latitude!,
        group.longitude!
      ))
    ) {
      return NextResponse.json(
        { error: 'User is outside the allowed radius' },
        { status: 403 }
      )
    }

    if (!(await validateTime(group.meeting_day))) {
      return NextResponse.json(
        { error: 'Group does not meet today' },
        { status: 403 }
      )
    }

    // Handle "No Email" path
    if (isNoEmail) {
      console.log('No-email check-in requested')
      const response = NextResponse.json({ status: 'NO_EMAIL_INFO_REQUIRED' })
      response.cookies.set('app_status', 'NO_EMAIL_INFO_REQUIRED', {
        path: '/',
      })
      response.cookies.set('pending_group_id', groupId, {
        path: '/',
        httpOnly: true,
      })
      return response
    }

    // Handle "Email" path - check if member exists
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(
        'id, orientation_complete, first_name, last_name, phone, date_of_birth, gender, ethnicity, reason_for_attending'
      )
      .eq('email', email)
      .single()

    // Member NOT Found - Create new member
    if (memberError || !member) {
      console.log('Creating new member for:', email)
      const newMemberId = uuidv4()
      const orientationId = uuidv4()
      const attendanceId = uuidv4()
      const today = new Date().toISOString().split('T')[0]

      // 1. Create member record with email and location coordinates
      const { data: newMember, error: createError } = await supabase
        .from('members')
        .insert({
          id: newMemberId,
          email: email,
          latitude: geolocation?.latitude || null,
          longitude: geolocation?.longitude || null,
          orientation_row_id: orientationId, // Link to orientation record
          group_row_id: groupId, // Link to group
          orientation_complete: false,
        })
        .select('id')
        .single()

      if (createError || !newMember) {
        console.error('Failed to create member:', createError)
        return NextResponse.json(
          { error: 'Could not create new member' },
          { status: 500 }
        )
      }

      // 2. Create orientation_details record with email and location coordinates
      const { error: orientationError } = await supabase
        .from('orientation_details')
        .insert({
          id: orientationId,
          member_id: newMemberId,
          member_row_id: newMemberId, // Link back to member
          group_row_id: groupId, // Link to group
          email: email,
          latitude: geolocation?.latitude || null,
          longitude: geolocation?.longitude || null,
        })

      if (orientationError) {
        console.error('Failed to create orientation record:', orientationError)
        return NextResponse.json(
          { error: 'Could not create orientation record' },
          { status: 500 }
        )
      }

      // 3. Create attendance_register record for today with row linking
      const { error: attendanceError } = await supabase
        .from('attendance_register')
        .insert({
          id: attendanceId,
          member_id: newMemberId,
          member_row_id: newMemberId, // Link to member
          group_id: groupId,
          group_row_id: groupId, // Link to group
          attendance_date: today,
          is_no_email_check_in: false,
        })

      if (attendanceError) {
        console.error('Failed to create attendance record:', attendanceError)
        return NextResponse.json(
          { error: 'Could not create attendance record' },
          { status: 500 }
        )
      }

      const response = NextResponse.json({
        status: 'ORIENTATION_REQUIRED',
        isNewMember: true,
      })
      response.cookies.set('app_status', 'ORIENTATION_REQUIRED', { path: '/' })
      response.cookies.set('member_id', newMember.id, {
        path: '/',
      })
      response.cookies.set('orientation_id', orientationId, {
        path: '/',
      })
      response.cookies.set('pending_group_id', groupId, {
        path: '/',
      })
      response.cookies.set('user_email', email, {
        path: '/',
      })
      return response
    }

    // Member Found - Check for duplicate
    if (await checkForDuplicate(supabase, member.id, groupId)) {
      return NextResponse.json(
        { error: 'User has already checked in today' },
        { status: 409 }
      )
    }

    // Check if orientation is complete
    if (!member.orientation_complete) {
      console.log('Member needs orientation:', member.id)

      // Get the orientation_details record ID for this member
      const { data: orientationData } = await supabase
        .from('orientation_details')
        .select('id')
        .eq('member_id', member.id)
        .single()

      const orientationId = orientationData?.id

      // Create attendance record for returning member who hasn't completed orientation
      const today = new Date().toISOString().split('T')[0]
      const { error: attendanceError } = await supabase
        .from('attendance_register')
        .insert({
          id: uuidv4(),
          member_id: member.id,
          member_row_id: member.id,
          group_id: groupId,
          group_row_id: groupId,
          attendance_date: today,
          is_no_email_check_in: false,
          // Copy existing member data to attendance register
          first_name: member.first_name,
          last_name: member.last_name,
          phone: member.phone,
          date_of_birth: member.date_of_birth,
        })

      if (attendanceError) {
        console.error('Failed to create attendance record:', attendanceError)
      }

      const response = NextResponse.json({
        status: 'ORIENTATION_REQUIRED',
        isNewMember: false,
      })
      response.cookies.set('app_status', 'ORIENTATION_REQUIRED', { path: '/' })
      response.cookies.set('member_id', member.id, {
        path: '/',
      })
      if (orientationId) {
        response.cookies.set('orientation_id', orientationId, {
          path: '/',
        })
      }
      response.cookies.set('pending_group_id', groupId, {
        path: '/',
      })
      response.cookies.set('user_email', email, {
        path: '/',
      })
      return response
    }

    // Happy Path - Complete check-in
    console.log('Completing check-in for member:', member.id)
    const today = new Date().toISOString().split('T')[0]

    const { error: attendanceError } = await supabase
      .from('attendance_register')
      .insert({
        id: uuidv4(),
        member_id: member.id,
        member_row_id: member.id,
        group_id: groupId,
        group_row_id: groupId,
        attendance_date: today,
        is_no_email_check_in: false,
        first_name: member.first_name,
        last_name: member.last_name,
        phone: member.phone,
        date_of_birth: member.date_of_birth,
        gender: member.gender,
        ethnicity: member.ethnicity,
        reason_for_attending: member.reason_for_attending ?? null,
      })

    if (attendanceError) {
      console.error('Failed to create attendance record:', attendanceError)
      return NextResponse.json(
        { error: 'Could not create attendance record' },
        { status: 500 }
      )
    }

    // Sync to Glide (async, non-blocking)
    syncAttendanceRegister({
      firstName: member.first_name || '',
      lastName: member.last_name || '',
      gender: member.gender,
      dateOfBirth: member.date_of_birth,
      ethnicity: member.ethnicity,
      memberId: member.id,
      groupId: groupId,
      attendanceDate: today,
      reasonForAttending: member.reason_for_attending,
      email: email
    }).catch(error => {
      console.error('[Check-in] Glide sync failed (non-blocking):', error)
    })

    const response = NextResponse.json({ status: 'CHECKIN_COMPLETE' })
    response.cookies.set('app_status', 'CHECKIN_COMPLETE', { path: '/' })
    return response
  } catch (error) {
    console.error('Unhandled error in check-in route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}