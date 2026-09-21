import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/site/auth-forms";
import { getCurrentProfile } from "@/lib/queries";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect(profile.role === "admin" ? "/admin" : "/account");

  return (
    <Suspense fallback={<div className="h-96" />}>
      <SignInForm />
    </Suspense>
  );
}
