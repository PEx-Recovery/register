// Apply migration to cloud and verify
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('📝 Please apply this SQL migration to your cloud database:\n');
console.log('='.repeat(60));

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '0008_fix_numeric_meeting_day.sql');
const sql = fs.readFileSync(migrationPath, 'utf-8');
console.log(sql);

console.log('='.repeat(60));
console.log('\n✅ Copy and run the above SQL in your Supabase Dashboard → SQL Editor');
console.log('📍 URL: https://supabase.com/dashboard/project/aufqnlgcqpkxzddieriy/sql/new\n');
