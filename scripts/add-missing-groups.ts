// scripts/add-missing-groups.ts
// Add the two unmatched groups from CSV to Supabase

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function addMissingGroups() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    console.log('🚀 Adding missing groups to Supabase...\n')

    // Group 1: IGrow Recovery Bloemfontein Baptiste Kerk
    const group1 = {
        name: 'IGrow Recovery Bloemfontein Baptiste Kerk',
        format: 'In-person',
        specialisation: 'Addiction & Supporter Recovery',
        latitude: null, // Van Blerk Avenue, Groenvlei, Bloemfontein coordinates would need to be geocoded
        longitude: null,
        meeting_day: '4', // Thursday
        meeting_time: '18:00:00',
        timezone: 'Africa/Johannesburg',
        row_id: '4HImMwmwTSmUgPG-pOAfyQ',
        affiliate_rid: 'b-0qL4fZSkiDa37xOZVvog',
    }

    // Group 2: CCK Recovery
    const group2 = {
        name: 'CCK Recovery',
        format: 'In-person',
        specialisation: 'Addiction & Supporter Recovery',
        latitude: null, // cnr Richmond/Summerley Road, Kenilworth coordinates would need to be geocoded
        longitude: null,
        meeting_day: '1', // Monday
        meeting_time: '18:45:00',
        timezone: 'Africa/Johannesburg',
        row_id: 'xw4q5pmWQ-aNhyELaL4AWg',
        affiliate_rid: 'zD8pXpGQRTY9yxCLqZoj',
    }

    const groups = [group1, group2]
    let successCount = 0

    for (const group of groups) {
        console.log(`Adding: ${group.name}...`)

        const { data, error } = await supabase
            .from('groups')
            .insert(group)
            .select()
            .single()

        if (error) {
            console.error(`❌ Error adding ${group.name}:`, error)
        } else {
            successCount++
            console.log(`✅ Added ${group.name} (ID: ${data.id})`)
        }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📈 SUMMARY')
    console.log('='.repeat(60))
    console.log(`Successfully added: ${successCount} / ${groups.length} groups`)
    console.log('='.repeat(60))
    console.log('\n✨ Complete!\n')
}

addMissingGroups().catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
})
