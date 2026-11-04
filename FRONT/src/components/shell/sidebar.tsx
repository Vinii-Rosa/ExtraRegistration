"use client";

import { ChevronsLeft, ChevronsRight, Clock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/sidebar-context";
import { navSections } from "./nav";

// Rótulos: fecham em 300ms, abrem em 400ms; o nó fica montado para o fade existir
const label =
  "whitespace-nowrap transition-[opacity,translate] duration-400 ease-ui md:sb-closed:-translate-x-[15px] md:sb-closed:opacity-0 md:sb-closed:duration-300";

export function Sidebar() {
  const pathname = usePathname();
  const { open, toggle, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 animate-[fade-in_250ms_var(--ease-ui)] md:hidden"
        />
      )}
      <aside
        aria-label="Menu principal"
        className={`fixed inset-y-0 left-0 z-50 flex w-65 flex-col overflow-hidden border-r border-border bg-card transition-transform duration-300 ease-ui dark:bg-bg md:static md:z-auto md:w-auto md:translate-x-0 md:transition-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="group relative flex h-14 shrink-0 items-center gap-2.5 border-b border-border pr-4 pl-5">
          <span className="relative flex size-6 shrink-0 items-center justify-center">
            <span className="flex size-6 items-center justify-center rounded bg-primary text-primary-fg transition-opacity duration-400 ease-ui md:sb-closed:group-hover:opacity-0">
              <Clock size={14} strokeWidth={2.5} />
            </span>
            <ChevronsRight
              size={16}
              className="absolute opacity-0 transition-opacity duration-400 ease-ui md:sb-closed:group-hover:opacity-100"
            />
          </span>
          <span className={`${label} flex-1 text-sm font-bold tracking-tight`}>
            Extra Hour
          </span>
          <button
            type="button"
            aria-label="Recolher menu"
            onClick={toggle}
            className="hidden rounded-lg p-1.5 text-muted transition-[opacity,color,background-color] duration-250 ease-ui hover:bg-card-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-focus md:block md:sb-closed:pointer-events-none md:sb-closed:opacity-0"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Expandir menu"
            aria-expanded={open}
            tabIndex={open ? -1 : 0}
            onClick={toggle}
            className="absolute inset-0 hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus md:sb-closed:block"
          />
        </div>

        <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-2">
          {navSections.map((section) => (
            <div key={section.title} className="mt-6 first:mt-4">
              <p
                className={`${label} mb-2 px-3 text-[10px] font-bold tracking-widest text-muted uppercase`}
              >
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map(({ href, label: text, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        title={text}
                        onClick={() => setMobileOpen(false)}
                        className={`group flex items-center gap-3 overflow-hidden rounded-lg p-3 text-xs font-semibold transition-colors duration-250 ease-ui focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus ${
                          active
                            ? "bg-primary text-primary-fg shadow-sm dark:bg-card dark:text-fg dark:shadow-[inset_0_0_0_1px_var(--border)]"
                            : "text-muted hover:bg-card-hover hover:text-fg"
                        }`}
                      >
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center ${
                            active
                              ? "scale-110 transition-transform duration-250 ease-ui"
                              : "transition-transform duration-400 ease-spring group-hover:-translate-y-[1.5px] group-hover:scale-125"
                          }`}
                        >
                          <Icon size={16} />
                        </span>
                        <span className={label}>{text}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
