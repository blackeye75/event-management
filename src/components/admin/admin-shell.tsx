"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarDays,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Quote,
  Settings,
  Sparkles,
  Tags,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ADMIN_NAV, type AdminNavIcon } from "@/components/admin/admin-nav";
import { cn } from "@/lib/utils";

const ICONS: Record<AdminNavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  package: Package,
  sparkles: Sparkles,
  tags: Tags,
  quote: Quote,
  inbox: Inbox,
  settings: Settings,
};

export function AdminShell({
  name,
  email,
  children,
}: {
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer on navigation without an effect round-trip.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex min-h-svh flex-1">
      {/* ---------------------------------------------------------- Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-champagne-300/10 bg-ink-900/60 lg:flex">
        <div className="border-b border-champagne-300/10 px-6 py-6">
          <Logo />
        </div>
        <SidebarNav pathname={pathname} />
        <SidebarFooter name={name} email={email} />
      </aside>

      {/* ------------------------------------------------------ Mobile bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-champagne-300/10 bg-ink-950/90 px-5 backdrop-blur-xl lg:hidden">
        <Logo compact />
        <span className="font-display text-lg">Admin</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="hairline grid size-10 place-items-center rounded-full"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-30 flex flex-col bg-ink-950/97 pt-16 backdrop-blur-xl lg:hidden"
          >
            <SidebarNav pathname={pathname} />
            <SidebarFooter name={name} email={email} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------------- Content */}
      <div className="flex-1 pt-16 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">{children}</div>
      </div>
    </div>
  );
}

function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
      {ADMIN_NAV.map((item) => {
        const Icon = ICONS[item.icon];
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors",
              active ? "text-champagne-100" : "text-cream-200/55 hover:text-cream-50",
            )}
          >
            {active && (
              <motion.span
                layoutId="admin-nav"
                className="absolute inset-0 rounded-xl border border-champagne-300/25 bg-champagne-300/10"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <Icon className="relative size-4 shrink-0" />
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ name, email }: { name: string; email: string }) {
  return (
    <div className="border-t border-champagne-300/10 p-4">
      <div className="px-2 pb-3">
        <p className="truncate text-sm text-cream-50">{name}</p>
        <p className="truncate text-xs text-cream-200/35">{email}</p>
      </div>
      <div className="flex gap-2">
        <Link
          href="/"
          className="hairline flex-1 rounded-lg px-3 py-2 text-center text-xs text-cream-200/60 transition-colors hover:border-champagne-300/40 hover:text-champagne-200"
        >
          View site
        </Link>
        <form action="/auth/signout" method="post" className="flex-1">
          <button
            type="submit"
            className="hairline flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs text-cream-200/60 transition-colors hover:border-rose-400/40 hover:text-rose-300"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
