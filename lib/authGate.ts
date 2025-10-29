export type MockSession = { role: "partner" | "admin" | "guest"; org_id?: string };

export function getMockSession(): MockSession {
  // Production ortamında her zaman guest rolü dön
  if (process.env.NODE_ENV === "production") {
    return { role: "guest" };
  }

  // Staging ortamında localStorage'dan rol kontrolü
  if (typeof window !== "undefined") {
    const mockRole = localStorage.getItem("mockRole") as "partner" | "admin" | undefined;
    
    if (mockRole === "partner") {
      return { role: "partner", org_id: "partner-123" };
    }
    
    if (mockRole === "admin") {
      return { role: "admin" };
    }
  }

  return { role: "guest" };
}

export function requireRole(session: MockSession, allowed: ("partner" | "admin")[]): boolean {
  // TypeScript type guard için role kontrolü
  return session.role === "partner" || session.role === "admin" ? allowed.includes(session.role) : false;
}