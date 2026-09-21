import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { SmartImage } from "@/components/ui/smart-image";

/** Split layout: form on the left, a full-bleed event photograph on the right. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative flex flex-col justify-center overflow-hidden px-5 py-12 sm:px-12 lg:px-16">
        <div
          aria-hidden
          className="ornament pointer-events-none absolute -left-40 top-0 size-[34rem] opacity-50"
        />

        <div className="relative mx-auto w-full max-w-md">
          <Logo />
          <div className="mt-10">{children}</div>

          <Link
            href="/"
            className="mt-10 inline-flex items-center gap-2 text-xs text-cream-200/40 transition-colors hover:text-champagne-200"
          >
            <ArrowLeft className="size-3.5" />
            Back to the site
          </Link>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <SmartImage
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80"
          alt=""
          seed="auth-panel"
          className="absolute inset-0 h-full w-full"
          imgClassName="opacity-45"
          sizes="50vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-ink-950/85 via-ink-950/40 to-ink-950/90"
        />
        <div className="absolute inset-x-0 bottom-0 p-14">
          <p className="font-display max-w-md text-balance text-4xl leading-tight text-cream-50">
            Every celebration deserves a{" "}
            <span className="text-foil italic">masterpiece.</span>
          </p>
          <p className="mt-4 max-w-sm text-sm text-cream-200/50">
            Sign in to track your bookings, review your run-of-show and settle payments.
          </p>
        </div>
      </div>
    </div>
  );
}
