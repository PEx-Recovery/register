// FILE 4: src/app/api/orientation/part2/route.ts
// ============================================
import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

// 🔥 CRITICAL: Add these two lines at the top
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const memberIdCookie = request.cookies.get('member_id');
    if (!memberIdCookie) {
      return NextResponse.json({ error: 'User session not found. Please sign in again.' }, { status: 401 });
    }
    const memberId = memberIdCookie.value;

    const {
      firstName, lastName, phone, dateOfBirth, gender, ethnicity,
      emergencyContactName, emergencyContactPhone, emergencyContactEmail,
      reasonForAttending, sourceOfDiscovery, problematicSubstances,
      currentlyInTreatment, currentTreatmentProgramme, previousTreatment,
      previousTreatmentProgrammes, previousRecoveryGroups, previousRecoveryGroupsNames,
      goalsForAttending, anythingElseImportant, howElseHelp,
      consentWhatsapp, consentConfidentiality, consentAnonymity,
      consentLiability, consentVoluntary
    } = body;

    const { error: detailsError } = await supabase
      .from('orientation_details')
      .update({
        reason_for_attending: reasonForAttending,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        emergency_contact_email: emergencyContactEmail,
        source_of_discovery: sourceOfDiscovery,
        problematic_substances: problematicSubstances,
        currently_in_treatment: currentlyInTreatment,
        current_treatment_programme: currentTreatmentProgramme,
        previous_treatment: previousTreatment,
        previous_treatment_programmes: previousTreatmentProgrammes,
        previous_recovery_groups: previousRecoveryGroups,
        previous_recovery_groups_names: previousRecoveryGroupsNames,
        goals_for_attending: goalsForAttending,
        anything_else_important: anythingElseImportant,
        how_else_help: howElseHelp,
        consent_whatsapp: consentWhatsapp,
        consent_confidentiality: consentConfidentiality,
        consent_anonymity: consentAnonymity,
        consent_liability: consentLiability,
        consent_voluntary: consentVoluntary,
        created_at: new Date().toISOString(),
      })
      .eq('member_id', memberId);

    if (detailsError) {
      console.error('Error updating orientation details (Part 2):', detailsError);
      return NextResponse.json({ error: 'Failed to save orientation details' }, { status: 500 });
    }

    const { error: memberError } = await supabase
      .from('members')
      .update({
        orientation_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId);

    if (memberError) {
      console.error('Error completing orientation (Part 2):', memberError);
      return NextResponse.json({ error: 'Failed to mark orientation as complete' }, { status: 500 });
    }

    const response = NextResponse.json({ status: 'SUCCESS' });
    response.cookies.set('app_status', 'CHECKIN_COMPLETE', { path: '/', httpOnly: true });
    response.cookies.set('member_id', '', { path: '/', maxAge: -1 });
    response.cookies.set('pending_group_id', '', { path: '/', maxAge: -1 });

    return response;

  } catch (error) {
    console.error('Unhandled error in orientation part2:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}