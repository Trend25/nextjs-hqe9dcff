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
