"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, type AuthResult } from "@/lib/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import type { Profile } from "@/lib/database.types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState<AuthResult, FormData>(updateProfile, null);

  return (
    <form action={action} className="hairline space-y-5 rounded-2xl bg-ink-900/40 p-6">
      <Field label="Full name" htmlFor="full_name">
        <Input id="full_name" name="full_name" required defaultValue={profile.full_name ?? ""} />
      </Field>

      <Field label="Phone" htmlFor="phone" hint="optional">
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} placeholder="+91 98765 43210" />
      </Field>

      <Field label="Email" htmlFor="email" hint="managed by your sign-in">
        <Input id="email" defaultValue={profile.email ?? ""} disabled />
      </Field>

      {state && <Toast state={{ tone: state.ok ? "ok" : "error", message: state.message }} />}

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "Saving…" : "Save details"}
    </Button>
  );
}
