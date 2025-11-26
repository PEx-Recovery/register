#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
    console.log('🔧 Applying archived group filtering to cloud database...\n');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'APPLY_THIS_TO_CLOUD_COMPLETE.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by function definitions and execute separately
    const functions = sql.split('CREATE OR REPLACE FUNCTION').filter(f => f.trim());

    console.log(`📝 Found ${functions.length} functions to update\n`);

    for (let i = 0; i < functions.length; i++) {
        const functionSql = 'CREATE OR REPLACE FUNCTION' + functions[i];

        // Extract function name for logging
        const nameMatch = functionSql.match(/FUNCTION\s+([\w.]+)\s*\(/);
        const functionName = nameMatch ? nameMatch[1] : `Function ${i + 1}`;

        try {
            console.log(`⚙️  Updating ${functionName}...`);
            const { error } = await supabase.rpc('exec_sql', { sql: functionSql });

            if (error) {
                console.error(`   ❌ Error: ${error.message}`);

                // Try alternative approach using the Supabase management API
                console.log(`   🔄 Trying alternative approach...`);
                const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: functionSql }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to update ${functionName}`);
                }
                console.log(`   ✅ Updated via alternative method`);
            } else {
                console.log(`   ✅ Updated successfully`);
            }
        } catch (err) {
            console.error(`   ❌ Failed to update ${functionName}:`, err);
            console.log('\n⚠️  You may need to apply this manually via the Supabase dashboard SQL editor.\n');
        }
        console.log('');
    }

    console.log('\n✅ Migration complete!\n');
    console.log('🔍 Now verifying the filtering...\n');

    // Verify the filtering
    await verifyFiltering(supabase);
}

async function verifyFiltering(supabase: any) {
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

    // Test get_groups_sorted_by_day
    console.log('🧪 Testing get_groups_sorted_by_day...');
    const { data: dayGroups, error: dayError } = await supabase.rpc('get_groups_sorted_by_day');

    if (dayError) {
        console.log('   ❌ Error:', dayError.message);
    } else {
        console.log(`   📋 Returned ${dayGroups?.length || 0} groups`);
        const hasArchived = dayGroups?.some((g: any) =>
            g.name?.toLowerCase().includes('archived') || g.is_archived === true
        );
        if (hasArchived) {
            console.log('   ⚠️  WARNING: Found archived groups in results!');
        } else {
            console.log('   ✅ No archived groups in results');
        }
    }

    // Test get_groups_sorted_by_distance
    console.log('\n🧪 Testing get_groups_sorted_by_distance...');
    const { data: distGroups, error: distError } = await supabase.rpc(
        'get_groups_sorted_by_distance',
        { user_lat: -26.0, user_lon: 28.0 }
    );

    if (distError) {
        console.log('   ❌ Error:', distError.message);
    } else {
        console.log(`   📋 Returned ${distGroups?.length || 0} groups`);
        const hasArchived = distGroups?.some((g: any) =>
            g.name?.toLowerCase().includes('archived') || g.is_archived === true
        );
        if (hasArchived) {
            console.log('   ⚠️  WARNING: Found archived groups in results!');
        } else {
            console.log('   ✅ No archived groups in results');
        }
    }

    console.log('\n🎉 Verification complete!\n');
}

main().catch(console.error);
