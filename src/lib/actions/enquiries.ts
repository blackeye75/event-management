"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { EVENT_TYPES } from "@/lib/utils";

const eventTypes = EVENT_TYPES.map((t) => t.value) as [string, ...string[]];

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name."),
  email: z.string().trim().email("That email does not look right."),
  phone: z.string().trim().max(24).optional().or(z.literal("")),
  event_type: z.enum(eventTypes).optional().or(z.literal("")),
  message: z.string().trim().min(10, "A sentence or two about the event, please."),
});

export type EnquiryResult = { ok: boolean; message: string };

export async function submitEnquiry(
  _prev: EnquiryResult | null,
  formData: FormData,
): Promise<EnquiryResult> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    event_type: formData.get("event_type"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      message:
        "Enquiries need a Supabase project — add your credentials to .env.local, then try again.",
    };
  }

  const { name, email, phone, event_type, message } = parsed.data;

  const { error } = await supabase.from("enquiries").insert({
    name,
    email,
    phone: phone || null,
    event_type: (event_type || null) as never,
    message,
  });

  if (error) {
    return { ok: false, message: "We could not send that just now. Please call us instead." };
  }

  return {
    ok: true,
    message: `Thank you, ${name.split(" ")[0]} — we have your note and will reply within one working day.`,
  };
}
