"use client";

import { useSession } from "@/hooks/use-session";

export function useUser() {
  const session = useSession();

  return {
    user: session.data?.user ?? null,
    isAuthenticated: session.isAuthenticated,
    isLoading: session.isLoading,
  };
}
