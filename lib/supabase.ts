import { createClient } from '@supabase/supabase-js'

// Environment variables'lardan değerleri al
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hfrzxhbwjatdnpftrdgr.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmcnp4aGJ3amF0ZG5wZnRyZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTY3NzksImV4cCI6MjA2ODUzMjc3OX0.Fg7TK4FckPi5XAWNM_FLii9WyzSDAUCSdyoX-WLLXhA'

// Debug için test kodları
console.log('🔍 Supabase Test:')
console.log('URL from env:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('URL final:', supabaseUrl)
console.log('Key exists:', supabaseKey ? 'Var ✅' : 'Yok ❌')

// Düzeltilmiş hata kontrolü
if (supabaseUrl.includes('dashboard') || supabaseUrl.includes('YOUR-PROJECT-ID')) {
  console.error('❌ Environment variable hala dashboard URL!')
  console.log('API URL kullanın: https://hfrzxhbwjatdnpftrdgr.supabase.co')
} else {
  console.log('✅ Supabase configuration doğru!')
}

// Supabase client'ını oluştur
export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth helper functions - kullanımı kolaylaştırmak için
export const authHelpers = {
  // Kullanıcı kayıt
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/auth/verify'
      }
    })
  },

  // Kullanıcı giriş
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  // Kullanıcı çıkış
  signOut: async () => {
    return await supabase.auth.signOut()
  },

  // Mevcut kullanıcı bilgisi
  getCurrentUser: () => {
    return supabase.auth.getUser()
  }
}