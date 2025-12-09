// src/app/api/orientation/update-step/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncOrientationComplete } from '@/lib/glide-sync'


export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * API Route: Update Orientation Step
 * 
 * This route handles step-by-step updates during the orientation process.
 * Each step writes specific fields to the appropriate table(s) based on the field mapping.
 * 
 * Field-to-Table Mapping:
 * - Members: firstName, lastName, phone, dateOfBirth
 * - Orientation_details: emergencyContact*, all research questions, consents, phone
 * - Attendance_register: firstName, lastName, phone, dateOfBirth, reasonForAttending, ethnicity, gender
 */

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { stepName, memberId, groupId, orientationId, data } = body

        if (!memberId || !groupId || !orientationId || !stepName) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        const supabase = createClient()
        const today = new Date().toISOString().split('T')[0]

        console.log(`Updating step: ${stepName} for member: ${memberId}`)

        // Handle each step based on which fields need to be updated
        switch (stepName) {
            case 'firstName': {
                // Write to members table
                const { error: memberError } = await supabase
                    .from('members')
                    .update({ first_name: data.firstName, updated_at: new Date().toISOString() })
                    .eq('id', memberId)

                if (memberError) {
                    console.error('Error updating member firstName:', memberError)
                    return NextResponse.json(
                        { error: 'Failed to update first name' },
                        { status: 500 }
                    )
                }

                // Write to attendance_register
                const { error: attendanceError } = await supabase
                    .from('attendance_register')
                    .update({ first_name: data.firstName })
                    .eq('member_id', memberId)
                    .eq('group_id', groupId)
                    .eq('attendance_date', today)

                if (attendanceError) {
                    console.error('Error updating attendance firstName:', attendanceError)
                }

                break
            }

            case 'lastName': {
                // Write to members table
                const { error: memberError } = await supabase
                    .from('members')
                    .update({ last_name: data.lastName, updated_at: new Date().toISOString() })
                    .eq('id', memberId)

                if (memberError) {
                    console.error('Error updating member lastName:', memberError)
                    return NextResponse.json(
                        { error: 'Failed to update last name' },
                        { status: 500 }
                    )
                }

                // Write to attendance_register
                const { error: attendanceError } = await supabase
                    .from('attendance_register')
                    .update({ last_name: data.lastName })
                    .eq('member_id', memberId)
                    .eq('group_id', groupId)
                    .eq('attendance_date', today)

                if (attendanceError) {
                    console.error('Error updating attendance lastName:', attendanceError)
                }

                break
            }

            case 'phone': {
                // Write to members table
                const { error: memberError } = await supabase
                    .from('members')
                    .update({ phone: data.phone, updated_at: new Date().toISOString() })
                    .eq('id', memberId)

                if (memberError) {
                    console.error('Error updating member phone:', memberError)
                    return NextResponse.json(
                        { error: 'Failed to update phone' },
                        { status: 500 }
                    )
                }

                // Write to orientation_details table
                const { error: orientationError } = await supabase
                    .from('orientation_details')
                    .update({ phone: data.phone })
                    .eq('id', orientationId)

                if (orientationError) {
                    console.error('Error updating orientation phone:', orientationError)
                }

                // Write to attendance_register
                const { error: attendanceError } = await supabase
                    .from('attendance_register')
                    .update({ phone: data.phone })
                    .eq('member_id', memberId)
                    .eq('group_id', groupId)
                    .eq('attendance_date', today)

                if (attendanceError) {
                    console.error('Error updating attendance phone:', attendanceError)
                }

                break
            }

            case 'dateOfBirth': {
                // Write to members table
                const { error: memberError } = await supabase
                    .from('members')
                    .update({ date_of_birth: data.dateOfBirth, updated_at: new Date().toISOString() })
                    .eq('id', memberId)

                if (memberError) {
                    console.error('Error updating member dateOfBirth:', memberError)
                    return NextResponse.json(
                        { error: 'Failed to update date of birth' },
                        { status: 500 }
                    )
                }

                // Write to orientation_details table
                const { error: orientationError } = await supabase
                    .from('orientation_details')
                    .update({ date_of_birth: data.dateOfBirth })
                    .eq('id', orientationId)

                if (orientationError) {
                    console.error('Error updating orientation dateOfBirth:', orientationError)
                }

                // Write to attendance_register
                const { error: attendanceError } = await supabase
                    .from('attendance_register')
                    .update({ date_of_birth: data.dateOfBirth })
                    .eq('member_id', memberId)
                    .eq('group_id', groupId)
                    .eq('attendance_date', today)

                if (attendanceError) {
                    console.error('Error updating attendance dateOfBirth:', attendanceError)
                }

                break
            }

            case 'gender': {
                // Write to members table
                const { error: memberError } = await supabase
                    .from('members')
                    .update({ gender: data.gender, updated_at: new Date().toISOString() })
                    .eq('id', memberId)

                if (memberError) {
                    console.error('Error updating member gender:', memberError)
                    return NextResponse.json(
                        { error: 'Failed to update gender' },
                        { status: 500 }
                    )
                }

                // Write to orientation_details table
                const { error: orientationError } = await supabase
                    .from('orientation_details')
                    .update({ gender: data.gender })
                    .eq('id', orientationId)

                if (orientationError) {
                    console.error('Error updating orientation gender:', orientationError)
                }

                // Write to attendance_register
                const { error: attendanceError } = await supabase
                    .from('attendance_register')
                    .update({ gender: data.gender })
                    .eq('member_id', memberId)
                    .eq('group_id', groupId)
                    .eq('attendance_date', today)

                if (attendanceError) {
                    console.error('Error updating attendance gender:', attendanceError)
                }

                break
            }

            case 'ethnicity': {
                // Write to members table
                const { error: memberError } = await supabase
                    .from('members')
                    .update({ ethnicity: data.ethnicity, updated_at: new Date().toISOString() })
                    .eq('id', memberId)

                if (memberError) {
                    console.error('Error updating member ethnicity:', memberError)
                    return NextResponse.json(
                        { error: 'Failed to update ethnicity' },
                        { status: 500 }
                    )
                }

                // Write to orientation_details table
                const { error: orientationError } = await supabase
                    .from('orientation_details')
                    .update({ ethnicity: data.ethnicity })
                    .eq('id', orientationId)

                if (orientationError) {
                    console.error('Error updating orientation ethnicity:', orientationError)
                }

                // Write to attendance_register
                const { error: attendanceError } = await supabase
                    .from('attendance_register')
                    .update({ ethnicity: data.ethnicity })
                    .eq('member_id', memberId)
                    .eq('group_id', groupId)
                    .eq('attendance_date', today)

                if (attendanceError) {
                    console.error('Error updating attendance ethnicity:', attendanceError)
                }

                break
            }

            case 'reasonForAttending': {
                // Write to members table
                const { error: memberError } = await supabase
                    .from('members')
                    .update({ reason_for_attending: data.reasonForAttending, updated_at: new Date().toISOString() })
                    .eq('id', memberId)

                if (memberError) {
                    console.error('Error updating member reasonForAttending:', memberError)
                    return NextResponse.json(
                        { error: 'Failed to update reason for attending' },
                        { status: 500 }
                    )
                }

                // Write to orientation_details table
                const { error: orientationError } = await supabase
                    .from('orientation_details')
                    .update({ reason_for_attending: data.reasonForAttending })
                    .eq('id', orientationId)

                if (orientationError) {
                    console.error('Error updating orientation reasonForAttending:', orientationError)
                }

                // Write to attendance_register
                const { error: attendanceError } = await supabase
                    .from('attendance_register')
                    .update({ reason_for_attending: data.reasonForAttending })
                    .eq('member_id', memberId)
                    .eq('group_id', groupId)
                    .eq('attendance_date', today)

                if (attendanceError) {
                    console.error('Error updating attendance reasonForAttending:', attendanceError)
                }

                break
            }

            case 'emergencyContactName':
            case 'emergencyContactPhone':
            case 'emergencyContactEmail':
            case 'sourceOfDiscovery':
            case 'problematicSubstances':
            case 'problematicSubstancesOther':
            case 'currentlyInTreatment':
            case 'currentTreatmentProgramme':
            case 'previousTreatment':
            case 'previousTreatmentProgrammes':
            case 'previousRecoveryGroups':
            case 'previousRecoveryGroupsNames':
            case 'goalsForAttending':
            case 'goalsForAttendingOther':
            case 'anythingElseImportant':
            case 'howElseHelp': {
                // All these fields go to orientation_details table only
                const updateData: any = {}

                // Convert camelCase to snake_case for database columns
                const fieldMap: { [key: string]: string } = {
                    emergencyContactName: 'emergency_contact_name',
                    emergencyContactPhone: 'emergency_contact_phone',
                    emergencyContactEmail: 'emergency_contact_email',
                    sourceOfDiscovery: 'source_of_discovery',
                    problematicSubstances: 'problematic_substances',
                    problematicSubstancesOther: 'problematic_substances_other',
                    currentlyInTreatment: 'currently_in_treatment',
                    currentTreatmentProgramme: 'current_treatment_programme',
                    previousTreatment: 'previous_treatment',
                    previousTreatmentProgrammes: 'previous_treatment_programmes',
                    previousRecoveryGroups: 'previous_recovery_groups',
                    previousRecoveryGroupsNames: 'previous_recovery_groups_names',
                    goalsForAttending: 'goals_for_attending',
                    goalsForAttendingOther: 'goals_for_attending_other',
                    anythingElseImportant: 'anything_else_important',
                    howElseHelp: 'how_else_help',
                }

                const dbField = fieldMap[stepName] || stepName
                updateData[dbField] = data[stepName]

                const { error: orientationError } = await supabase
                    .from('orientation_details')
                    .update(updateData)
                    .eq('id', orientationId)

                if (orientationError) {
                    console.error(`Error updating orientation ${stepName}:`, orientationError)
                    return NextResponse.json(
                        { error: `Failed to update ${stepName}` },
                        { status: 500 }
                    )
                }

                break
            }

            case 'consents': {
                // Write all consent fields to orientation_details
                const { error: orientationError } = await supabase
                    .from('orientation_details')
                    .update({
                        consent_whatsapp: data.consentWhatsapp,
                        consent_confidentiality: data.consentConfidentiality,
                        consent_anonymity: data.consentAnonymity,
                        consent_liability: data.consentLiability,
                        consent_voluntary: data.consentVoluntary,
                    })
                    .eq('id', orientationId)

                if (orientationError) {
                    console.error('Error updating consents:', orientationError)
                    return NextResponse.json(
                        { error: 'Failed to update consents' },
                        { status: 500 }
                    )
                }

                // Mark orientation as complete in members table
                const { error: memberError } = await supabase
                    .from('members')
                    .update({
                        orientation_complete: true,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', memberId)

                if (memberError) {
                    console.error('Error marking orientation complete:', memberError)
                    return NextResponse.json(
                        { error: 'Failed to complete orientation' },
                        { status: 500 }
                    )
                }

                // Fetch complete member and orientation data for Glide sync
                const { data: memberData } = await supabase
                    .from('members')
                    .select('first_name, last_name, email, phone, date_of_birth, gender, ethnicity')
                    .eq('id', memberId)
                    .single()

                const { data: orientationData } = await supabase
                    .from('orientation_details')
                    .select('*')
                    .eq('id', orientationId)
                    .single()

                // Get group's Glide Row ID for cross-table linking
                const { data: groupData } = await supabase
                    .from('groups')
                    .select('row_id')
                    .eq('id', groupId)
                    .single()

                // Sync to Glide (now awaited to get Row IDs back)
                if (memberData && orientationData) {
                    const glideResult = await syncOrientationComplete({
                        memberId,
                        groupId,
                        groupRowId: groupData?.row_id, // Pass Glide Row ID for the group
                        firstName: memberData.first_name || '',
                        lastName: memberData.last_name || '',
                        email: memberData.email || '',
                        phone: memberData.phone,
                        dateOfBirth: memberData.date_of_birth,
                        gender: memberData.gender,
                        ethnicity: memberData.ethnicity,
                        emergencyContactName: orientationData.emergency_contact_name,
                        emergencyContactPhone: orientationData.emergency_contact_phone,
                        emergencyContactEmail: orientationData.emergency_contact_email,
                        reasonForAttending: orientationData.reason_for_attending,
                        sourceOfDiscovery: orientationData.source_of_discovery,
                        problematicSubstances: orientationData.problematic_substances,
                        problematicSubstancesOther: orientationData.problematic_substances_other,
                        currentlyInTreatment: orientationData.currently_in_treatment,
                        currentTreatmentProgramme: orientationData.current_treatment_programme,
                        previousTreatment: orientationData.previous_treatment,
                        previousTreatmentProgrammes: orientationData.previous_treatment_programmes,
                        previousRecoveryGroups: orientationData.previous_recovery_groups,
                        previousRecoveryGroupsNames: orientationData.previous_recovery_groups_names,
                        goalsForAttending: orientationData.goals_for_attending,
                        goalsForAttendingOther: orientationData.goals_for_attending_other,
                        anythingElseImportant: orientationData.anything_else_important,
                        howElseHelp: orientationData.how_else_help,
                        consentWhatsapp: data.consentWhatsapp,
                        consentConfidentiality: data.consentConfidentiality,
                        consentAnonymity: data.consentAnonymity,
                        consentLiability: data.consentLiability,
                        consentVoluntary: data.consentVoluntary
                    }).catch(error => {
                        console.error('[Orientation] Glide sync failed (non-blocking):', error)
                        return { memberGlideRowId: null, orientationGlideRowId: null, attendanceGlideRowId: null }
                    })

                    console.log('[Glide Sync] Orientation sync complete:', glideResult)

                    // Write Glide Row IDs back to Supabase for cross-table linking
                    if (glideResult.memberGlideRowId) {
                        // Update members table with its own Glide Row ID and group Row ID
                        await supabase
                            .from('members')
                            .update({
                                row_id: glideResult.memberGlideRowId,
                                group_row_id: groupData?.row_id
                            })
                            .eq('id', memberId)

                        // Update orientation_details with member Row ID and group Row ID
                        await supabase
                            .from('orientation_details')
                            .update({
                                member_row_id: glideResult.memberGlideRowId,
                                group_row_id: groupData?.row_id
                            })
                            .eq('id', orientationId)

                        // Update attendance_register with member Row ID and group Row ID
                        await supabase
                            .from('attendance_register')
                            .update({
                                member_row_id: glideResult.memberGlideRowId,
                                group_row_id: groupData?.row_id
                            })
                            .eq('member_id', memberId)
                            .eq('group_id', groupId)
                            .eq('attendance_date', today)
                    }

                    // Update members table with orientation Row ID
                    if (glideResult.orientationGlideRowId) {
                        console.log('[Orientation] Writing orientation Row ID to members:', glideResult.orientationGlideRowId)
                        const { error: memberOrientationError } = await supabase
                            .from('members')
                            .update({ orientation_row_id: glideResult.orientationGlideRowId })
                            .eq('id', memberId)

                        if (memberOrientationError) {
                            console.error('[Orientation] Error updating members.orientation_row_id:', memberOrientationError)
                        } else {
                            console.log('[Orientation] Successfully updated members.orientation_row_id')
                        }

                        // Also store it in orientation_details for reference
                        console.log('[Orientation] Writing orientation Row ID to orientation_details:', glideResult.orientationGlideRowId)
                        const { error: orientationRowIdError } = await supabase
                            .from('orientation_details')
                            .update({ row_id: glideResult.orientationGlideRowId })
                            .eq('id', orientationId)

                        if (orientationRowIdError) {
                            console.error('[Orientation] Error updating orientation_details.row_id:', orientationRowIdError)
                        } else {
                            console.log('[Orientation] Successfully updated orientation_details.row_id')
                        }
                    } else {
                        console.warn('[Orientation] No orientation Glide Row ID returned from sync')
                    }
                }

                break
            }

            default:
                return NextResponse.json(
                    { error: `Unknown step: ${stepName}` },
                    { status: 400 }
                )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unhandled error in update-step route:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
