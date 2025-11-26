// Clear and re-import groups script
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearGroups() {
    console.log('🗑️  Clearing existing groups...');

    const { error } = await supabase
        .from('groups')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
        console.error('❌ Error clearing groups:', error.message);
        process.exit(1);
    }

    console.log('✅ All groups cleared successfully!\n');
}

clearGroups()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Failed:', error);
        process.exit(1);
    });
