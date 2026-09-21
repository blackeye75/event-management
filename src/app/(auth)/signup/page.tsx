import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/site/auth-forms";
import { getCurrentProfile } from "@/lib/queries";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignUpPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect(profile.role === "admin" ? "/admin" : "/account");

  return <SignUpForm />;
}
