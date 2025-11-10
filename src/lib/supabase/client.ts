import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      },
      global: {
        fetch: typeof fetch !== 'undefined' ? fetch : undefined
      }})
