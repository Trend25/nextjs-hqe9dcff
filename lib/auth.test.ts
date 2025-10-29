// lib/auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifySupabaseJWT } from './auth';

describe('verifySupabaseJWT', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...OLD_ENV };
  });

  it('returns valid:false when token is missing', () => {
    const res = verifySupabaseJWT(null);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('no_token');
  });

  it('returns valid:false when secret is missing (staging mode)', () => {
    delete process.env.SUPABASE_JWT_SECRET;
    const fakeToken = 'a.b.c';
    const res = verifySupabaseJWT(fakeToken);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('no_secret');
  });

  it('parses payload when secret exists', () => {
    // simulate env set (as in production)
    process.env.SUPABASE_JWT_SECRET = 'dummy-secret';

    // this is header.payload.signature (dummy base64 for {"role":"partner","org_id":"org-123","sub":"u-1"})
    const payloadObj = {
      role: 'partner',
      org_id: 'org-123',
      sub: 'u-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const payloadBase64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
    const token = `x.${payloadBase64}.y`;

    const res = verifySupabaseJWT(token);
    expect(res.valid).toBe(true);
    expect(res.role).toBe('partner');
    expect(res.org_id).toBe('org-123');
    expect(res.user_id).toBe('u-1');
  });

  it('returns valid:false when expired', () => {
    process.env.SUPABASE_JWT_SECRET = 'dummy-secret';

    const expiredPayload = {
      role: 'startup',
      org_id: null,
      sub: 'u-9',
      exp: Math.floor(Date.now() / 1000) - 10, // already expired
    };
    const payloadBase64 = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
    const token = `x.${payloadBase64}.y`;

    const res = verifySupabaseJWT(token);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('expired');
  });
});
