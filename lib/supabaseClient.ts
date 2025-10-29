// NOT: This client is for staging/preview usage only.
// TODO: production URL/KEY asla buraya yazılmamalı.
// TODO: analytics insert'i backend route üzerinden proxy'le.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;

export function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  // Staging anon client. RLS varsayıyoruz.
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

// TODO: production ortamında service role key KULLANILMAYACAK.
// TODO: analytics insert'i backend route üzerinden proxy'le.

