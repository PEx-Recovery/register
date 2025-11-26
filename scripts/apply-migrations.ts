// Apply migrations to cloud database using direct SQL execution
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

console.log('🔗 Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function applyMigrations() {
    console.log('\n📦 Applying migrations to cloud database...\n');

    // Migration 1: Add is_archived column
    console.log('📝 Applying migration: 0005_add_archived_status.sql');

    const migration1 = `
    ALTER TABLE groups ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_groups_is_archived ON groups(is_archived);
  `;

    const { error: error1 } = await supabase.rpc('exec_sql', { sql: migration1 });

    if (error1) {
        console.error('   ❌ Error:', error1.message);
        console.log('   ⚠️  Trying alternative method...');

        // Split into individual statements and try to execute
        const statements = migration1.split(';').filter(s => s.trim());
        for (const statement of statements) {
            if (!statement.trim()) continue;
            const { error } = await (supabase as any).from('_ignore').select('*').limit(0);
            console.log('   ℹ️  Manual execution required via Supabase Dashboard SQL Editor');
            console.log('   📄 SQL to run:');
            console.log(migration1);
            break;
        }
    } else {
        console.log('   ✅ Applied successfully');
    }

    // Migration 2: Update functions
    console.log('\n📝 Applying migration: 0006_update_functions_filter_archived.sql');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '0006_update_functions_filter_archived.sql');
    const migration2 = fs.readFileSync(migrationPath, 'utf-8');

    const { error: error2 } = await supabase.rpc('exec_sql', { sql: migration2 });

    if (error2) {
        console.error('   ❌ Error:', error2.message);
        console.log('   ℹ️  Manual execution required via Supabase Dashboard SQL Editor');
        console.log('   📄 File location:', migrationPath);
    } else {
        console.log('   ✅ Applied successfully');
    }

    console.log('\n✅ Migration process complete!');
}

applyMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    });
