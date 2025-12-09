// Script to clear all test data from members, orientation_details, and attendance_register tables
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
})

async function clearTestData() {
    console.log('🗑️  Clearing test data from database...\n')

    try {
        // Delete in order to respect foreign key constraints
        console.log('1. Deleting all attendance_register records...')
        const { error: attendanceError, count: attendanceCount } = await supabase
            .from('attendance_register')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (attendanceError) {
            console.error('❌ Error deleting attendance records:', attendanceError)
        } else {
            console.log(`   ✅ Deleted ${attendanceCount ?? 0} attendance records\n`)
        }

        console.log('2. Deleting all orientation_details records...')
        const { error: orientationError, count: orientationCount } = await supabase
            .from('orientation_details')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (orientationError) {
            console.error('❌ Error deleting orientation records:', orientationError)
        } else {
            console.log(`   ✅ Deleted ${orientationCount ?? 0} orientation records\n`)
        }

        console.log('3. Deleting all members records...')
        const { error: membersError, count: membersCount } = await supabase
            .from('members')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (membersError) {
            console.error('❌ Error deleting member records:', membersError)
        } else {
            console.log(`   ✅ Deleted ${membersCount ?? 0} member records\n`)
        }

        console.log('✅ Database reset complete!')
        console.log('You can now test with a clean slate.\n')
    } catch (error) {
        console.error('❌ Unexpected error:', error)
        process.exit(1)
    }
}

clearTestData()
