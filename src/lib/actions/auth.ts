"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { ok: boolean; message: string } | null;

const NOT_CONFIGURED = {
  ok: false,
  message:
    "Authentication needs a Supabase project. Copy .env.example to .env.local, add your URL and anon key, and restart the dev server.",
} as const;

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(24).optional().or(z.literal("")),
  password: z.string().min(8, "Use at least 8 characters."),
});

export async function signIn(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, message: "That email and password do not match an account." };
  }

  // Where to land is decided by role, so read the profile before redirecting.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  const next = formData.get("next");
  const target =
    typeof next === "string" && next.startsWith("/")
      ? next
      : profile?.role === "admin"
        ? "/admin"
        : "/account";

  revalidatePath("/", "layout");
  redirect(target);
}

export async function signUp(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { full_name, email, phone, password } = parsed.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, phone: phone || null },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  // With email confirmation on, Supabase returns a user but no session.
  if (!data.session) {
    return {
      ok: true,
      message: `Almost there — we sent a confirmation link to ${email}. Open it to finish creating your account.`,
    };
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your name."),
  phone: z.string().trim().max(24).optional().or(z.literal("")),
});

/** Lets a signed-in customer keep their own contact details current. */
export async function updateProfile(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: "Could not save those details." };
  }

  revalidatePath("/account");
  return { ok: true, message: "Saved." };
}
