"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { LayoutDashboard, Menu, Phone, UserRound, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { NAV_LINKS } from "@/components/site/nav-links";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NavbarClient({
  phone,
  user,
}: {
  phone: string;
  user: { name: string; isAdmin: boolean } | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Close the drawer whenever the route changes. Adjusting state during
  // render is React's recommended alternative to a synchronising effect.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Lock the page behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-champagne-300/10 bg-ink-950/80 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Logo />

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm transition-colors",
                    active ? "text-champagne-200" : "text-cream-200/65 hover:text-cream-50",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border border-champagne-300/25 bg-champagne-300/10"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-sm text-cream-200/60 transition-colors hover:text-champagne-200"
            >
              <Phone className="size-4" />
              {phone}
            </a>
            {user ? (
              <ButtonLink
                href={user.isAdmin ? "/admin" : "/account"}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {user.isAdmin ? (
                  <LayoutDashboard className="size-4" />
                ) : (
                  <UserRound className="size-4" />
                )}
                {user.isAdmin ? "Admin" : user.name.split(" ")[0]}
              </ButtonLink>
            ) : (
              <ButtonLink href="/login" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
            )}
            <ButtonLink href="/book" size="sm">
              Book an event
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="hairline grid size-11 place-items-center rounded-full text-cream-100 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ink-950/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-full flex-col justify-center gap-2 px-8 pt-20">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i + 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    className="font-display block border-b border-champagne-300/10 py-4 text-4xl text-cream-50"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="mt-8 flex flex-col gap-3"
              >
                <ButtonLink href="/book" size="lg">
                  Book an event
                </ButtonLink>
                <ButtonLink
                  href={user ? (user.isAdmin ? "/admin" : "/account") : "/login"}
                  variant="outline"
                  size="lg"
                >
                  {user ? (user.isAdmin ? "Admin panel" : "My bookings") : "Sign in"}
                </ButtonLink>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
