"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signUp, type AuthResult } from "@/lib/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function SignInForm() {
  const [state, action] = useActionState<AuthResult, FormData>(signIn, null);
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const denied = params.get("denied");

  return (
    <>
      <h1 className="font-display text-4xl">Welcome back</h1>
      <p className="mt-3 text-sm text-cream-200/50">
        Sign in to see your bookings, payments and run-of-show.
      </p>

      {denied === "admin" && (
        <div className="mt-6">
          <Toast
            state={{
              tone: "error",
              message: "That area is for administrators. You are signed in as a customer.",
            }}
          />
        </div>
      )}

      <form action={action} className="mt-8 space-y-5">
        <input type="hidden" name="next" value={next} />

        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </Field>

        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </Field>

        {state && <Toast state={{ tone: state.ok ? "ok" : "error", message: state.message }} />}

        <Submit label="Sign in" pendingLabel="Signing in…" />
      </form>

      <p className="mt-6 text-sm text-cream-200/45">
        New here?{" "}
        <Link
          href="/signup"
          className="text-champagne-200 underline decoration-champagne-300/30 underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState<AuthResult, FormData>(signUp, null);

  return (
    <>
      <h1 className="font-display text-4xl">Create your account</h1>
      <p className="mt-3 text-sm text-cream-200/50">
        One account tracks every booking, payment and change to your event.
      </p>

      <form action={action} className="mt-8 space-y-5">
        <Field label="Full name" htmlFor="full_name">
          <Input id="full_name" name="full_name" required autoComplete="name" placeholder="Ananya Mehra" />
        </Field>

        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </Field>

        <Field label="Phone" htmlFor="phone" hint="optional">
          <Input id="phone" name="phone" autoComplete="tel" placeholder="+91 98765 43210" />
        </Field>

        <Field label="Password" htmlFor="password" hint="8 characters minimum">
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </Field>

        {state && <Toast state={{ tone: state.ok ? "ok" : "error", message: state.message }} />}

        <Submit label="Create account" pendingLabel="Creating…" />
      </form>

      <p className="mt-6 text-sm text-cream-200/45">
        Already have one?{" "}
        <Link
          href="/login"
          className="text-champagne-200 underline decoration-champagne-300/30 underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
