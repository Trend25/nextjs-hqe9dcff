// tests/lib/authGate.refresh.test.ts
import { describe, it, expect, vi } from 'vitest';
import { requireRole } from '../../lib/authGate';

describe('requireRole refresh flow', () => {
  it('denies guest user for admin', async () => {
    // mock fetch for /api/session/verify
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ ok: false }),
    });

    const res = await requireRole('admin');
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe('forbidden_admin');
  });

  it('accepts partner with org_id', async () => {
    // first call returns partner session ok:true
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        role: 'partner',
        org_id: 'org-123',
        user_id: 'u-1',
        exp: null,
      }),
    });

    const res = await requireRole('partner');
    expect(res.allowed).toBe(true);
    expect(res.session.org_id).toBe('org-123');
  });

  it('rejects partner with missing org_id', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        role: 'partner',
        org_id: null,
        user_id: 'u-2',
        exp: null,
      }),
    });

    const res = await requireRole('partner');
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe('forbidden_partner');
  });
});
