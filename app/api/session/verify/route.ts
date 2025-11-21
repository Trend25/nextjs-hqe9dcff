import { NextResponse } from 'next/server';

// Lightweight, graceful JWT/session verify endpoint for UAT/staging.
// Behavior:
// - If no Authorization header -> 401
// - If SUPABASE_JWT_SECRET not set -> 200 { verified: false, mock: true } (graceful)
// - If token present but secret missing -> same mock response
// - If secret present -> we currently cannot cryptographically verify without adding deps;
//   respond with 501 to indicate verification is not enabled in this build.

export async function GET(request: Request) {
  try {
    const auth = request.headers.get('authorization') || request.headers.get('Authorization');

    if (!auth) {
      return NextResponse.json({ error: 'authorization_required' }, { status: 401 });
    }

    const token = auth.replace(/^Bearer\s+/i, '').trim();

    const supaSecret = process.env.SUPABASE_JWT_SECRET;

    if (!supaSecret) {
      // Graceful mode for UAT/staging: do not fail deploys because secret is missing.
      return NextResponse.json(
        {
          verified: false,
          mock: true,
          message:
            'SUPABASE_JWT_SECRET not configured. Endpoint running in graceful/mock mode for UAT.'
        },
        { status: 200 }
      );
    }

    // If we get here, a secret exists but we intentionally avoid adding a runtime
    // crypto dependency in this sprint. Respond clearly so CI can flag missing implementation.
    return NextResponse.json(
      { verified: false, implemented: false, message: 'JWT verification not implemented in this build' },
      { status: 501 }
    );
  } catch (err) {
    return NextResponse.json({ error: 'internal_error', details: String(err) }, { status: 500 });
  }
}
