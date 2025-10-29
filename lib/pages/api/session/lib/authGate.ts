// lib/authGate.ts
// Client-side gate. Dashboardlar bunu kullanarak "ben bu sayfayı gösterebilir miyim?" diye soruyor.
// Bu kod throw ETMEYECEK. UI kırılmamalı.

export type ClientSession = {
  ok: boolean;
  role: 'admin' | 'partner' | 'startup' | 'guest';
  org_id: string | null;
  user_id: string | null;
  exp: number | null;
};

async function fetchSessionOnce(): Promise<ClientSession> {
  try {
    const res = await fetch('/api/session/verify', {
      method: 'GET',
      headers: {
        // Production'da gerçek Authorization header browser'dan gelecek (cookie/JWT).
        // Staging: bu fetch muhtemelen 403 dönecek çünkü token yok -> graceful.
      },
    });

    if (!res.ok) {
      return {
        ok: false,
        role: 'guest',
        org_id: null,
        user_id: null,
        exp: null,
      };
    }

    const data = await res.json();
    return {
        ok: data.ok ?? false,
        role: data.role ?? 'guest',
        org_id: data.org_id ?? null,
        user_id: data.user_id ?? null,
        exp: data.exp ?? null,
    };
  } catch {
    return {
      ok: false,
      role: 'guest',
      org_id: null,
      user_id: null,
      exp: null,
    };
  }
}

// Refresh denemesi: token expire olduysa ileride buradan sessizce yenilemeye çalışacağız.
export async function refreshSession(): Promise<ClientSession> {
  // TODO: /api/session/refresh implement edilecek (staging mock).
  // Şimdilik sadece tekrar dene.
  return fetchSessionOnce();
}

export async function requireRole(required: 'admin' | 'partner') {
  // 1. normal session dene
  let session = await fetchSessionOnce();

  // 2. expire olabilir. refresh de dene.
  if (!session.ok && session.exp !== null) {
    session = await refreshSession();
  }

  if (required === 'admin') {
    if (!session.ok || session.role !== 'admin') {
      return {
        allowed: false,
        reason: 'forbidden_admin',
        session,
      };
    }
    return { allowed: true, session };
  }

  if (required === 'partner') {
    if (
      !session.ok ||
      session.role !== 'partner' ||
      !session.org_id
    ) {
      return {
        allowed: false,
        reason: 'forbidden_partner',
        session,
      };
    }
    return { allowed: true, session };
  }

  // default safe
  return {
    allowed: false,
    reason: 'unsupported_role_check',
    session,
  };
}

/*
TODO (prod):
- refreshSession gerçek bir refresh token flow ile çalışacak.
- eğer iki deneme de başarısızsa dashboard "Erişim reddedildi" mesajı gösterecek.
- partner dashboard, session.org_id'yi query paramından değil buradan okuyacak.
*/
