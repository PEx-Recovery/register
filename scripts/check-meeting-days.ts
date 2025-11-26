// Check meeting_day data format
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMeetingDays() {
    console.log('🔍 Checking meeting_day format in database...\n');

    // Get sample of meeting_day values
    const { data: groups } = await supabase
        .from('groups')
        .select('name, meeting_day, is_archived')
        .eq('is_archived', false)
        .limit(20);

    console.log('📋 Sample active groups and their meeting_day values:');
    groups?.forEach(g => {
        console.log(`   ${g.name}: "${g.meeting_day}"`);
    });

    // Check distinct meeting_day values
    const { data: allGroups } = await supabase
        .from('groups')
        .select('meeting_day')
        .eq('is_archived', false);

    const uniqueDays = [...new Set(allGroups?.map(g => g.meeting_day))];
    console.log('\n📊 Unique meeting_day values found:');
    uniqueDays.forEach(day => {
        console.log(`   "${day}"`);
    });
}

checkMeetingDays()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Check failed:', error);
        process.exit(1);
    });
