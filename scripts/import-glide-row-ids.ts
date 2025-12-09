// scripts/import-glide-row-ids.ts
// Import Glide Row IDs from CSV into Supabase groups table

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import csv from 'csv-parser'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface CSVRow {
    '🔒 Row ID': string
    'Group/Name Override': string
    'Group/Format': string
    'Status/Is Archived': string
    'Affiliate/RID': string
}

interface GroupMatch {
    rowId: string
    groupName: string
    supabaseId?: string
    matched: boolean
}

async function importRowIds() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    console.log('🚀 Starting Glide Row ID import...\n')

    // Read CSV file
    const csvPath = path.join(process.cwd(), 'BRI Groups List v2.csv')
    const csvData: CSVRow[] = []

    await new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row: CSVRow) => {
                // Only process rows with valid Row IDs and group names
                if (row['🔒 Row ID'] && row['Group/Name Override']) {
                    csvData.push(row)
                }
            })
            .on('end', resolve)
            .on('error', reject)
    })

    console.log(`📄 Loaded ${csvData.length} groups from CSV\n`)

    // Fetch all groups from Supabase
    const { data: supabaseGroups, error: fetchError } = await supabase
        .from('groups')
        .select('id, name, row_id')

    if (fetchError) {
        console.error('❌ Error fetching groups from Supabase:', fetchError)
        process.exit(1)
    }

    console.log(`📊 Found ${supabaseGroups?.length || 0} groups in Supabase\n`)

    // Match CSV groups to Supabase groups
    const matches: GroupMatch[] = []
    const unmatched: GroupMatch[] = []
    let updateCount = 0
    let alreadyPopulatedCount = 0

    for (const csvRow of csvData) {
        const groupName = csvRow['Group/Name Override'].trim()
        const rowId = csvRow['🔒 Row ID'].trim()
        const affiliateRid = csvRow['Affiliate/RID']?.trim() || null

        // Try to find matching group in Supabase (case-insensitive)
        const matchedGroup = supabaseGroups?.find(
            (sg) => sg.name?.toLowerCase() === groupName.toLowerCase()
        )

        if (matchedGroup) {
            matches.push({
                rowId,
                groupName,
                supabaseId: matchedGroup.id,
                matched: true,
            })

            // Check if row_id is already populated
            if (matchedGroup.row_id) {
                alreadyPopulatedCount++
                console.log(`⏭️  Skipping "${groupName}" - row_id already set`)
                continue
            }

            // Update the group with Row ID and affiliate RID
            const { error: updateError } = await supabase
                .from('groups')
                .update({
                    row_id: rowId,
                    affiliate_rid: affiliateRid
                })
                .eq('id', matchedGroup.id)

            if (updateError) {
                console.error(`❌ Error updating "${groupName}":`, updateError)
            } else {
                updateCount++
                console.log(`✅ Updated "${groupName}" with Row ID: ${rowId}`)
            }
        } else {
            unmatched.push({
                rowId,
                groupName,
                matched: false,
            })
        }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📈 IMPORT SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total CSV groups:           ${csvData.length}`)
    console.log(`Total Supabase groups:      ${supabaseGroups?.length || 0}`)
    console.log(`Matched and updated:        ${updateCount}`)
    console.log(`Already had Row IDs:        ${alreadyPopulatedCount}`)
    console.log(`Unmatched (not in Supabase): ${unmatched.length}`)
    console.log('='.repeat(60))

    if (unmatched.length > 0) {
        console.log('\n⚠️  UNMATCHED GROUPS (in CSV but not in Supabase):')
        console.log('─'.repeat(60))
        unmatched.forEach((um) => {
            console.log(`  • ${um.groupName} (Row ID: ${um.rowId})`)
        })
    }

    // Check for Supabase groups without Row IDs
    const groupsWithoutRowIds = supabaseGroups?.filter((sg) => !sg.row_id) || []
    if (groupsWithoutRowIds.length > 0) {
        console.log('\n⚠️  SUPABASE GROUPS WITHOUT ROW IDs:')
        console.log('─'.repeat(60))
        groupsWithoutRowIds.forEach((g) => {
            console.log(`  • ${g.name} (ID: ${g.id})`)
        })
    }

    console.log('\n✨ Import complete!\n')
}

importRowIds().catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
})
