"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import { submitEnquiry, type EnquiryResult } from "@/lib/actions/enquiries";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { EVENT_TYPES } from "@/lib/utils";

export function EnquiryForm({ defaultMessage = "" }: { defaultMessage?: string }) {
  const [state, action] = useActionState<EnquiryResult | null, FormData>(submitEnquiry, null);

  return (
    <form action={action} className="glass rounded-3xl p-7 sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name">
          <Input id="name" name="name" required placeholder="Ananya Mehra" autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>
        <Field label="Phone" htmlFor="phone" hint="optional">
          <Input id="phone" name="phone" placeholder="+91 98765 43210" autoComplete="tel" />
        </Field>
        <Field label="Occasion" htmlFor="event_type" hint="optional">
          <Select id="event_type" name="event_type" defaultValue="">
            <option value="">Not sure yet</option>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Tell us about it" htmlFor="message" className="mt-5">
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          defaultValue={defaultMessage}
          placeholder="Date, rough guest count, city, and anything you already know you want."
        />
      </Field>

      <div className="mt-6 space-y-4">
        {state && <Toast state={{ tone: state.ok ? "ok" : "error", message: state.message }} />}
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      <Send className="size-4" />
      {pending ? "Sending…" : "Send enquiry"}
    </Button>
  );
}
