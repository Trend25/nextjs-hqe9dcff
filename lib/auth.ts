// lib/auth.ts
// Production JWT doğrulama helper.
// Not: Bu helper hiçbir zaman throw ETMEZ. UI kırılmamalı.
// TODO: HS256 imza doğrulaması gerçek üretim anahtarı ile yapılacak.

export type VerifiedSession = {
  valid: boolean;
  role: 'admin' | 'partner' | 'startup' | 'guest';
  org_id: string | null;
  user_id: string | null;
  exp?: number;
  reason?: string;
};

export function verifySupabaseJWT(token: string | null | undefined): VerifiedSession {
  // 1. Token yoksa -> geçersiz, guest.
  if (!token) {
    return {
      valid: false,
      role: 'guest',
      org_id: null,
      user_id: null,
      reason: 'no_token',
    };
  }

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    // Staging / preview ortamında secret olmayabilir. Prod'da bu kabul edilmeyecek.
    console.warn('JWT verify skipped: missing SUPABASE_JWT_SECRET (staging mode)');
    return {
      valid: false,
      role: 'guest',
      org_id: null,
      user_id: null,
      reason: 'no_secret',
    };
  }

  try {
    // Basit payload decode (header.payload.signature)
    // Burada imza doğrulaması YAPMIYORUZ. Bu bilinçli olarak TODO.
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        valid: false,
        role: 'guest',
        org_id: null,
        user_id: null,
        reason: 'invalid_format',
      };
    }

    const base64Payload = parts[1];
    const json = Buffer.from(base64Payload, 'base64').toString('utf-8');
    const payload = JSON.parse(json || '{}') as {
      role?: string;
      org_id?: string;
      sub?: string;
      exp?: number;
    };

    const role =
      payload.role === 'admin' ||
      payload.role === 'partner' ||
      payload.role === 'startup'
        ? (payload.role as 'admin' | 'partner' | 'startup')
        : 'guest';

    // Token süresi doldu mu? (exp epoch seconds)
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return {
        valid: false,
        role: 'guest',
        org_id: null,
        user_id: payload.sub ?? null,
        exp: payload.exp,
        reason: 'expired',
      };
    }

    return {
      valid: true,
      role,
      org_id: payload.org_id ?? null,
      user_id: payload.sub ?? null,
      exp: payload.exp,
    };
  } catch (err) {
    console.warn('JWT verify failed', err);
    return {
      valid: false,
      role: 'guest',
      org_id: null,
      user_id: null,
      reason: 'decode_error',
    };
  }
}

/*
TODO (Production hardening):
- HS256 imza doğrulamasını SUPABASE_JWT_SECRET ile yap.
- RLS ile partner sadece kendi org_id satırlarını çekebilecek.
- Admin tüm satırları görebilecek.
- Bu fonksiyon prod'da "guest" dönen kullanıcıyı dashboard'a sokmamalı.
*/
