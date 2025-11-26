// Apply RID migration to cloud database
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    console.log('📝 Applying RID columns migration to cloud database...\n');

    // We can't directly execute DDL statements via the JS client
    // So we'll just check if the columns exist by trying to query them
    const { data, error } = await supabase
        .from('groups')
        .select('row_id, affiliate_rid')
        .limit(1);

    if (error && error.message.includes('column')) {
        console.log('❌ RID columns not found in database.');
        console.log('\n⚠️  Please run this SQL in your Supabase Dashboard → SQL Editor:\n');
        console.log('ALTER TABLE groups ADD COLUMN IF NOT EXISTS row_id TEXT;');
        console.log('ALTER TABLE groups ADD COLUMN IF NOT EXISTS affiliate_rid TEXT;');
        console.log('CREATE INDEX IF NOT EXISTS idx_groups_row_id ON groups(row_id);');
        console.log('CREATE INDEX IF NOT EXISTS idx_groups_affiliate_rid ON groups(affiliate_rid);\n');
        process.exit(1);
    }

    console.log('✅ RID columns exist in database!');
}

applyMigration()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Check failed:', error.message);
        process.exit(1);
    });
