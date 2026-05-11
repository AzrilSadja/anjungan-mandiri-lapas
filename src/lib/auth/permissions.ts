import type { Session } from "next-auth";

export function hasRole(session: Session | null, role: "admin" | "user"): boolean {
  return session?.user?.role === role;
}

export function canAccessPetugas(session: Session | null): boolean {
  return hasRole(session, "admin") || hasRole(session, "user");
}
