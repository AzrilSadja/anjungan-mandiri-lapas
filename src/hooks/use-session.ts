"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

export function useSession() {
  const session = useNextAuthSession();

  return {
    data: session.data,
    status: session.status,
    isAuthenticated: session.status === "authenticated",
    isLoading: session.status === "loading",
  };
}
