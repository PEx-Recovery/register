import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:15321',
  'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
);

async function testAuth() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@email.com',
    password: 'testing123',
  });

  console.log('Access Token:', data.session?.access_token);
}

testAuth();