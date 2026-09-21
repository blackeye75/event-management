import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

/**
 * Lives at the app root rather than inside the (site) group: a group-scoped
 * not-found does not catch unknown top-level URLs, so the chrome is rendered
 * here instead of inherited.
 */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative flex min-h-[70svh] flex-col items-center justify-center px-5 py-32 text-center">
          <div
            aria-hidden
            className="ornament pointer-events-none absolute left-1/2 top-1/3 size-[36rem] -translate-x-1/2 opacity-50"
          />

          <div className="relative">
            <span className="eyebrow">
              <span className="h-px w-8 bg-champagne-300/60" />
              Error 404
              <span className="h-px w-8 bg-champagne-300/60" />
            </span>

            <h1 className="font-display mt-6 text-balance text-5xl leading-tight sm:text-6xl">
              This page isn&apos;t{" "}
              <span className="text-foil italic">on the guest list.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md text-pretty text-cream-200/55">
              The link may be old, or the package may have been retired.
              Everything we currently run is one click away.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/packages" size="lg">
                Browse packages
              </ButtonLink>
              <ButtonLink href="/" variant="outline" size="lg">
                Back home
              </ButtonLink>
            </div>

            <p className="mt-8 text-xs text-cream-200/30">
              Looking for a booking?{" "}
              <Link
                href="/account"
                className="text-champagne-200/60 underline underline-offset-4"
              >
                Open your dashboard
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
