import type { Metadata } from "next";
import Link from "next/link";
import { Database } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { isSupabaseConfigured } from "@/lib/env";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Connect Supabase" };

/**
 * Shown when someone opens /admin before the project has a Supabase backend.
 * The public site still works from the demo catalogue, but nothing is editable
 * until these keys exist.
 */
export default function AdminSetupPage() {
  if (isSupabaseConfigured) redirect("/admin");

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-5 py-16 sm:px-8">
      <Logo />

      <div className="hairline mt-10 rounded-3xl bg-ink-900/50 p-8 sm:p-10">
        <span className="grid size-12 place-items-center rounded-full border border-champagne-300/25 bg-champagne-300/[0.07]">
          <Database className="size-5 text-champagne-300" />
        </span>

        <h1 className="font-display mt-6 text-3xl">Connect Supabase to open the panel</h1>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-cream-200/55">
          The public site is running on the bundled demo catalogue. Authentication, bookings,
          payments and this admin panel all need a real Supabase project.
        </p>

        <ol className="mt-8 space-y-5 text-sm">
          <Step n={1} title="Create a project">
            At <code className="text-champagne-200">supabase.com</code>, then copy its URL, anon key
            and service-role key.
          </Step>
          <Step n={2} title="Add them to .env.local">
            Copy <code className="text-champagne-200">.env.example</code> and fill in the three
            values.
          </Step>
          <Step n={3} title="Run the migrations and seed">
            <code className="text-champagne-200">supabase db push</code> then{" "}
            <code className="text-champagne-200">
              psql &quot;$DATABASE_URL&quot; -f supabase/seed.sql
            </code>
            .
          </Step>
          <Step n={4} title="Sign up">
            The first account created becomes the administrator automatically.
          </Step>
        </ol>

        <Link
          href="/"
          className="mt-9 inline-block text-sm text-champagne-200 underline decoration-champagne-300/30 underline-offset-4"
        >
          Back to the site
        </Link>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-champagne-300 text-[0.65rem] font-bold text-ink-950">
        {n}
      </span>
      <div>
        <p className="text-cream-50">{title}</p>
        <p className="mt-1 text-cream-200/50">{children}</p>
      </div>
    </li>
  );
}
