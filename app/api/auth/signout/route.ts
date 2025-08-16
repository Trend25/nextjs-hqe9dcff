// app/api/auth/signout/route.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createClientComponentClient();
  
  try {
    await supabase.auth.signOut();
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}

// app/api/auth/callback/route.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClientComponentClient();
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
    } catch (error) {
      console.error('Callback error:', error);
    }
  }

  // Return to login page if there's an error
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
}

// app/api/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';

  if (token_hash && type) {
    const supabase = createClientComponentClient();

    try {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      if (!error) {
        return NextResponse.redirect(new URL(next, request.url));
      }
    } catch (error) {
      console.error('Confirm error:', error);
    }
  }

  // Redirect to error page or login if verification fails
  return NextResponse.redirect(new URL('/auth/login?error=Could not verify email', request.url));
}
