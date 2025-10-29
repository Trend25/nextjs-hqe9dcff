// tests/api/session.verify.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../../pages/api/session/verify';
import { verifySupabaseJWT } from '../../lib/auth';

// we don't want real console noise in test
vi.spyOn(console, 'warn').mockImplementation(() => {});

vi.mock('../../lib/auth', () => {
  return {
    verifySupabaseJWT: vi.fn(),
  };
});

function mockReqRes(headers: Record<string, string>) {
  const req: any = {
    headers,
  };
  let statusCode = 200;
  let jsonBody: any = null;

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(body: any) {
      jsonBody = body;
      return res;
    },
    _get() {
      return { statusCode, jsonBody };
    },
  };
  return { req, res };
}

describe('/api/session/verify', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 403 when token invalid', async () => {
    (verifySupabaseJWT as unknown as vi.Mock).mockReturnValue({
      valid: false,
      reason: 'no_token',
      role: 'guest',
      org_id: null,
      user_id: null,
    });

    const { req, res } = mockReqRes({});
    await handler(req, res);

    const { statusCode, jsonBody } = res._get();
    expect(statusCode).toBe(403);
    expect(jsonBody.ok).toBe(false);
    expect(jsonBody.error).toBe('unauthorized');
  });

  it('returns 200 and session payload when token valid', async () => {
    (verifySupabaseJWT as unknown as vi.Mock).mockReturnValue({
      valid: true,
      role: 'partner',
      org_id: 'org-xyz',
      user_id: 'u-1',
      exp: 123456789,
    });

    const { req, res } = mockReqRes({
      authorization: 'Bearer faketoken',
    });
    await handler(req, res);

    const { statusCode, jsonBody } = res._get();
    expect(statusCode).toBe(200);
    expect(jsonBody.ok).toBe(true);
    expect(jsonBody.role).toBe('partner');
    expect(jsonBody.org_id).toBe('org-xyz');
    expect(jsonBody.user_id).toBe('u-1');
  });
});
