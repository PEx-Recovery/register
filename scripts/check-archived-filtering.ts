#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;

async function main() {
    console.log('🔍 Checking archived group filtering in cloud database...\n');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check total groups
    const { count: totalCount } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true });

    console.log(`📊 Total groups in database: ${totalCount}`);

    // Check archived groups
    const { count: archivedCount } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true })
        .eq('is_archived', true);

    console.log(`📦 Archived groups: ${archivedCount}`);
    console.log(`✅ Active groups: ${(totalCount || 0) - (archivedCount || 0)}\n`);

    // Get some sample groups to see their status
    console.log('📋 Sample of groups with archived status:');
    const { data: sampleGroups } = await supabase
        .from('groups')
        .select('name, is_archived')
        .limit(10);

    sampleGroups?.forEach((g: any) => {
        console.log(`   ${g.is_archived ? '📦' : '✅'} ${g.name}`);
    });

    // Get all archived group IDs for verification
    const { data: archivedGroups } = await supabase
        .from('groups')
        .select('id, name')
        .eq('is_archived', true);

    const archivedIds = new Set(archivedGroups?.map(g => g.id));
    console.log(`\n📋 Loaded ${archivedIds.size} archived group IDs for verification`);

    // Test get_groups_sorted_by_day
    console.log('\n🧪 Testing get_groups_sorted_by_day RPC...');
    const { data: dayGroups, error: dayError } = await supabase.rpc('get_groups_sorted_by_day');

    if (dayError) {
        console.log('   ❌ Error:', dayError.message);
    } else {
        console.log(`   📋 Returned ${dayGroups?.length || 0} groups`);

        // Check if any archived groups are in the results
        const archivedInResults = dayGroups?.filter((g: any) => archivedIds.has(g.id));

        if (archivedInResults && archivedInResults.length > 0) {
            console.log(`   ⚠️  WARNING: Found ${archivedInResults.length} archived groups in results:`);
            archivedInResults.forEach((g: any) => {
                console.log(`      - ${g.name} (ID: ${g.id})`);
            });
        } else {
            console.log('   ✅ No archived groups found in results');
        }
    }

    // Test get_groups_sorted_by_distance
    console.log('\n🧪 Testing get_groups_sorted_by_distance RPC...');
    // Using coordinates near Johannesburg, South Africa
    const { data: distGroups, error: distError } = await supabase.rpc(
        'get_groups_sorted_by_distance',
        { user_lat: -26.2041, user_lon: 28.0473 }
    );

    if (distError) {
        console.log('   ❌ Error:', distError.message);
    } else {
        console.log(`   📋 Returned ${distGroups?.length || 0} groups`);

        // Check if any archived groups are in the results
        const archivedInResults = distGroups?.filter((g: any) => archivedIds.has(g.id));

        if (archivedInResults && archivedInResults.length > 0) {
            console.log(`   ⚠️  WARNING: Found ${archivedInResults.length} archived groups in results:`);
            archivedInResults.forEach((g: any) => {
                console.log(`      - ${g.name} (ID: ${g.id})`);
            });
        } else {
            console.log('   ✅ No archived groups found in results');
        }
    }

    console.log('\n' + '='.repeat(60));
    if (archivedCount && archivedCount > 0) {
        console.log('\n💡 NEXT STEPS:');
        console.log('1. Open the Supabase Dashboard SQL Editor');
        console.log('2. Copy the contents of APPLY_THIS_TO_CLOUD_COMPLETE.sql');
        console.log('3. Paste and run it in the SQL Editor');
        console.log('4. Run this script again to verify the fix\n');
    } else {
        console.log('\n✅ All checks passed!\n');
    }
}

main().catch(console.error);
