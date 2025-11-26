// Verify archived group filtering in cloud database
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFiltering() {
    console.log('🔍 Verifying archived group filtering...\n');

    // 1. Check total groups
    const { count: totalCount } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true });

    console.log(`📊 Total groups in database: ${totalCount}`);

    // 2. Check archived groups
    const { count: archivedCount } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true })
        .eq('is_archived', true);

    console.log(`📦 Archived groups: ${archivedCount}`);
    console.log(`✅ Active groups: ${(totalCount || 0) - (archivedCount || 0)}\n`);

    // 3. Test get_groups_sorted_by_day RPC
    console.log('🧪 Testing get_groups_sorted_by_day RPC...');
    const { data: dayGroups, error: dayError } = await supabase.rpc('get_groups_sorted_by_day');

    if (dayError) {
        console.error('❌ RPC Error:', dayError.message);
    } else {
        console.log(`   Returned ${dayGroups?.length || 0} groups`);
        const hasArchived = dayGroups?.some((g: any) => g.name?.includes('ARCHIVED') || g.name?.includes('Archived'));
        if (hasArchived) {
            console.log('   ⚠️  WARNING: Found archived groups in results!');
        } else {
            console.log('   ✅ No archived groups in results');
        }
    }

    // 4. Test get_groups_sorted_by_distance RPC
    console.log('\n🧪 Testing get_groups_sorted_by_distance RPC...');
    const { data: distGroups, error: distError } = await supabase.rpc('get_groups_sorted_by_distance', {
        user_lat: -29.8587,
        user_lon: 31.0218
    });

    if (distError) {
        console.error('❌ RPC Error:', distError.message);
    } else {
        console.log(`   Returned ${distGroups?.length || 0} groups`);
        const hasArchived = distGroups?.some((g: any) => g.name?.includes('ARCHIVED') || g.name?.includes('Archived'));
        if (hasArchived) {
            console.log('   ⚠️  WARNING: Found archived groups in results!');
        } else {
            console.log('   ✅ No archived groups in results');
        }
    }

    // 5. Sample some groups to see their is_archived status
    console.log('\n📋 Sample of groups with archived status:');
    const { data: sampleGroups } = await supabase
        .from('groups')
        .select('name, is_archived')
        .limit(10);

    sampleGroups?.forEach(g => {
        console.log(`   ${g.is_archived ? '📦' : '✅'} ${g.name}`);
    });
}

verifyFiltering()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    });
