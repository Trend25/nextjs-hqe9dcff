// pages/api/session/verify.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySupabaseJWT } from '../../../lib/auth';

// Bu endpoint prod öncesi "kapı bekçisi" (gatekeeper).
// Amaç: client bize token ile gelsin, biz rol/org_id döndürelim.
// IMPORTANT: Bu kod production secret'ı loglamaz. Hata durumunda throw etmez.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Normal yol: Authorization: Bearer <jwt>
  const rawAuth = req.headers.authorization || '';
  const token = rawAuth.startsWith('Bearer ')
    ? rawAuth.replace('Bearer ', '')
    : null;

  const session = verifySupabaseJWT(token);

  if (!session.valid) {
    // Observability için log (Vercel / Supabase logs).
    console.warn('Session verify failed', session.reason);
    // 403: kullanıcı var ama yetkisi yok / geçersiz token
    return res.status(403).json({
      ok: false,
      error: 'unauthorized',
      reason: session.reason ?? 'invalid',
    });
  }

  // Geçerli oturum
  return res.status(200).json({
    ok: true,
    role: session.role,
    org_id: session.org_id,
    user_id: session.user_id,
    exp: session.exp ?? null,
  });
}

/*
TODO (prod):
- Burada partner rolü için org_id zorunluluğunu enforce et.
- Admin rolünde full erişim ver, partner rolünde org_id'ye göre RLS uygula.
- Buradan sonra dashboard API'leri bu verify endpoint'ini kullanacak.
- Secret eksikse staging modunda 403 dönmesi normal, UI kırılmıyor.
*/
