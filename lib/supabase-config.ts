// lib/supabase-config.ts
// Production Supabase Configuration
// Note: anon key is safe to expose publicly - database security handled by RLS

export const SUPABASE_CONFIG = {
  url: 'https://hfrzxhbwjatdnpftrdgr.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmcnp4aGJ3amF0ZG5wZnRyZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTY3NzksImV4cCI6MjA2ODUzMjc3OX0.Fg7TK4FckPi5XAWNM_FLii9WyzSDAUCSdyoX-WLLXhA'
} as const;
