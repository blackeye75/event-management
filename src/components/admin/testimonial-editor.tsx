"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Star } from "lucide-react";
import { deleteTestimonial, saveTestimonial, type ActionResult } from "@/lib/actions/admin";
import { Panel } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { Switch } from "@/components/admin/switch";
import { SmartImage } from "@/components/ui/smart-image";
import { EVENT_TYPES } from "@/lib/utils";
import type { Testimonial } from "@/lib/database.types";

export function TestimonialEditor({ testimonial }: { testimonial?: Testimonial }) {
  const [state, action] = useActionState<ActionResult, FormData>(saveTestimonial, null);
  const [open, setOpen] = useState(!testimonial);
  const [rating, setRating] = useState(testimonial?.rating ?? 5);

  const key = testimonial?.id ?? "new";

  const fields = (
    <form action={action} className="space-y-5">
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}
      <input type="hidden" name="rating" value={rating} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Author" htmlFor={`author-${key}`}>
          <Input
            id={`author-${key}`}
            name="author_name"
            required
            defaultValue={testimonial?.author_name ?? ""}
            placeholder="Ananya & Rohit Mehra"
          />
        </Field>

        <Field label="Context" htmlFor={`role-${key}`} hint="shown under the name">
          <Input
            id={`role-${key}`}
            name="author_role"
            defaultValue={testimonial?.author_role ?? ""}
            placeholder="Signature Wedding, Udaipur"
          />
        </Field>
      </div>

      <Field label="Quote" htmlFor={`quote-${key}`}>
        <Textarea
          id={`quote-${key}`}
          name="quote"
          rows={4}
          required
          defaultValue={testimonial?.quote ?? ""}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Occasion" htmlFor={`type-${key}`} hint="optional">
          <Select id={`type-${key}`} name="event_type" defaultValue={testimonial?.event_type ?? ""}>
            <option value="">Not specified</option>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Rating" htmlFor={`rating-${key}`}>
          <div className="flex h-[3.1rem] items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                className="transition-transform hover:scale-115"
              >
                <Star
                  className={
                    n <= rating
                      ? "size-6 fill-champagne-300 text-champagne-300"
                      : "size-6 text-cream-200/20"
                  }
                />
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Avatar URL" htmlFor={`avatar-${key}`} hint="optional">
          <Input
            id={`avatar-${key}`}
            name="avatar_url"
            defaultValue={testimonial?.avatar_url ?? ""}
            placeholder="https://…"
          />
        </Field>

        <Field label="Sort order" htmlFor={`sort-${key}`}>
          <Input
            id={`sort-${key}`}
            name="sort_order"
            type="number"
            defaultValue={testimonial?.sort_order ?? 0}
          />
        </Field>
      </div>

      <Switch
        name="is_published"
        label="Published"
        hint="unpublished reviews stay here but leave the site"
        defaultChecked={testimonial?.is_published ?? true}
      />

      {state && <Toast state={{ tone: state.ok ? "ok" : "error", message: state.message }} />}

      <div className="flex items-center gap-3">
        <SaveButton isNew={!testimonial} />
        {testimonial && (
          <DeleteButton
            action={deleteTestimonial}
            id={testimonial.id}
            confirmLabel={`Delete the review from ${testimonial.author_name}?`}
          />
        )}
      </div>
    </form>
  );

  if (!testimonial) return fields;

  return (
    <Panel>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-6 py-5 text-left"
      >
        <SmartImage
          src={testimonial.avatar_url}
          alt={testimonial.author_name}
          seed={testimonial.author_name}
          className="size-10 shrink-0 rounded-full"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-cream-50">{testimonial.author_name}</span>
          <span className="block truncate text-xs text-cream-200/35">
            {testimonial.author_role ?? "—"}
            {!testimonial.is_published && " · unpublished"}
          </span>
        </span>
        <span className="hidden shrink-0 gap-0.5 sm:flex">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-champagne-300 text-champagne-300" />
          ))}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-cream-200/40 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-champagne-300/10 px-6 py-6">{fields}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving…" : isNew ? "Add testimonial" : "Save"}
    </Button>
  );
}
