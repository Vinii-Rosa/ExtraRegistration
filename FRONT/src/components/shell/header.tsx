"use client";

import { LogOut, Menu as MenuIcon, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem } from "@/components/ui/menu";
import { useSession } from "@/contexts/session-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { useTheme } from "@/contexts/theme-context";
import { titleOf } from "./nav";

export function Header() {
  const pathname = usePathname();
  const { setMobileOpen } = useSidebar();
  const { toggleTheme } = useTheme();
  const { email, displayName, initial, logout, loggingOut } = useSession();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="icon"
          aria-label="Abrir menu"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon size={16} />
        </Button>
        <span
          aria-hidden
          className="size-2 shrink-0 animate-pulse rounded-full bg-success"
        />
        <h1 className="truncate text-xs font-bold tracking-tight uppercase">
          {titleOf(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="icon" aria-label="Alternar tema" onClick={toggleTheme}>
          <Sun size={16} className="hidden dark:block" />
          <Moon size={16} className="dark:hidden" />
        </Button>
        <span aria-hidden className="h-4 w-px bg-border" />
        <div className="flex items-center gap-3">
          <div className="hidden min-w-0 text-right leading-tight sm:block">
            <p className="max-w-48 truncate text-xs font-semibold">
              {displayName}
            </p>
            <p className="max-w-48 truncate text-[10px] text-muted">{email}</p>
          </div>
          <Menu
            label="Menu do usuário"
            trigger={
              <span className="flex size-8 items-center justify-center rounded-full border border-border text-xs font-bold">
                {initial}
              </span>
            }
          >
            <MenuItem
              onClick={logout}
              disabled={loggingOut}
              className="text-danger"
            >
              <LogOut size={14} />
              Sair
            </MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
}
