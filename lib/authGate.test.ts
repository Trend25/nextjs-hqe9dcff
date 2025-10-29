import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getMockSession, requireRole, type MockSession } from "./authGate";

describe("authGate", () => {
  const mockProcess = { ...process };
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // Local storage mock
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
      removeItem: vi.fn(),
    } as Storage;
    global.localStorage = mockLocalStorage;
    
    // Store original NODE_ENV
    originalNodeEnv = mockProcess.env.NODE_ENV;
    // Use Object.defineProperty to mock process.env
    Object.defineProperty(process, "env", {
      value: { ...process.env, NODE_ENV: "development" },
      writable: true
    });
  });

  afterEach(() => {
    // Restore process.env
    Object.defineProperty(process, "env", {
      value: { ...process.env, NODE_ENV: originalNodeEnv },
      writable: true
    });
    vi.clearAllMocks();
  });

  describe("getMockSession", () => {
    it("should return guest role in production", () => {
      Object.defineProperty(process, "env", {
        value: { ...process.env, NODE_ENV: "production" },
        writable: true
      });
      const session = getMockSession();
      expect(session.role).toBe("guest");
      expect(session.org_id).toBeUndefined();
    });

    it("should return partner role with org_id when localStorage has partner role", () => {
      vi.spyOn(localStorage, "getItem").mockReturnValue("partner");
      const session = getMockSession();
      expect(session.role).toBe("partner");
      expect(session.org_id).toBe("partner-123");
    });

    it("should return admin role when localStorage has admin role", () => {
      vi.spyOn(localStorage, "getItem").mockReturnValue("admin");
      const session = getMockSession();
      expect(session.role).toBe("admin");
      expect(session.org_id).toBeUndefined();
    });

    it("should return guest role when localStorage is empty", () => {
      vi.spyOn(localStorage, "getItem").mockReturnValue(null);
      const session = getMockSession();
      expect(session.role).toBe("guest");
      expect(session.org_id).toBeUndefined();
    });
  });

  describe("requireRole", () => {
    it("should return false for guest user trying to access partner dashboard", () => {
      const session: MockSession = { role: "guest" };
      expect(requireRole(session, ["partner"])).toBe(false);
    });

    it("should return true for partner user accessing partner dashboard", () => {
      const session: MockSession = { role: "partner", org_id: "partner-123" };
      expect(requireRole(session, ["partner"])).toBe(true);
    });

    it("should return true for admin user accessing admin dashboard", () => {
      const session: MockSession = { role: "admin" };
      expect(requireRole(session, ["admin"])).toBe(true);
    });

    it("should return false for partner user trying to access admin dashboard", () => {
      const session: MockSession = { role: "partner", org_id: "partner-123" };
      expect(requireRole(session, ["admin"])).toBe(false);
    });

    it("should handle multiple allowed roles", () => {
      const session: MockSession = { role: "admin" };
      expect(requireRole(session, ["admin", "partner"])).toBe(true);
    });
  });
});