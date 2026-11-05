"use client";

import {
  createContext,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";
import { logoutAction } from "@/actions/auth";

type SessionContextValue = {
  email: string;
  displayName: string;
  initial: string;
  loggingOut: boolean;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const [loggingOut, startLogout] = useTransition();

  const value = useMemo(() => {
    // A API não manda o nome no token: usa a parte do email antes do @
    const displayName = email.split("@")[0] || email;
    return {
      email,
      displayName,
      initial: displayName.charAt(0).toUpperCase(),
      loggingOut,
      logout: () => startLogout(() => logoutAction()),
    };
  }, [email, loggingOut]);

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession fora do SessionProvider");
  return ctx;
}
