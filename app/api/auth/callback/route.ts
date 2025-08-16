import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createClientComponentClient();
    
    try {
      await supabase.auth.exchangeCodeForSession(code);
      // Email confirm sonrası dashboard'a yönlendir
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
    } catch (error) {
      console.error('Callback error:', error);
    }
  }

  // Hata varsa login'e yönlendir
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
}
