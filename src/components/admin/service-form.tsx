"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { saveService, type ActionResult } from "@/lib/actions/admin";
import { Panel } from "@/components/admin/ui";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { SmartImage } from "@/components/ui/smart-image";
import { Switch } from "@/components/admin/switch";
import { slugify } from "@/lib/utils";
import type { Category, Service } from "@/lib/database.types";

const PRICE_UNITS = [
  { value: "event", label: "per event" },
  { value: "plate", label: "per plate (scales with guests)" },
  { value: "hour", label: "per hour" },
  { value: "day", label: "per day" },
];

export function ServiceForm({
  service,
  categories,
}: {
  service?: Service;
  categories: Category[];
}) {
  const [state, action] = useActionState<ActionResult, FormData>(saveService, null);

  const [name, setName] = useState(service?.name ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [image, setImage] = useState(service?.image_url ?? "");

  const slugTouched = slug !== "" && slug !== slugify(name);
  const effectiveSlug = slugTouched ? slug : slugify(name);

  return (
    <form action={action} className="space-y-6">
      {service && <input type="hidden" name="id" value={service.id} />}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel className="space-y-5 p-6">
          <Field label="Name" htmlFor="name">
            <Input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Signature DJ Console"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="URL slug" htmlFor="slug" hint="/services/…">
              <Input
                id="slug"
                name="slug"
                value={effectiveSlug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </Field>

            <Field label="Category" htmlFor="category_id">
              <Select
                id="category_id"
                name="category_id"
                defaultValue={service?.category_id ?? categories[0]?.id ?? ""}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Tagline" htmlFor="tagline">
            <Input
              id="tagline"
              name="tagline"
              defaultValue={service?.tagline ?? ""}
              placeholder="Beat-matched sets that never let the floor empty"
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={service?.description ?? ""}
            />
          </Field>

          <Field label="Features" htmlFor="features" hint="one per line">
            <Textarea
              id="features"
              name="features"
              rows={6}
              defaultValue={(service?.features ?? []).join("\n")}
              placeholder={"6-hour performance set\nWireless mics for hosts"}
            />
          </Field>
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-5 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
              Pricing
            </h2>

            <Field label="Base price (₹)" htmlFor="base_price">
              <Input
                id="base_price"
                name="base_price"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={service?.base_price ?? 0}
              />
            </Field>

            <Field label="Charged" htmlFor="price_unit">
              <Select id="price_unit" name="price_unit" defaultValue={service?.price_unit ?? "event"}>
                {PRICE_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </Select>
            </Field>
          </Panel>

          <Panel className="space-y-5 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
              Image
            </h2>

            <SmartImage
              src={image}
              alt="Preview"
              seed={effectiveSlug || "service"}
              className="aspect-[16/10] w-full rounded-xl"
            />

            <Field label="Image URL" htmlFor="image_url">
              <Input
                id="image_url"
                name="image_url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-…"
              />
            </Field>
          </Panel>

          <Panel className="space-y-5 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
              Visibility
            </h2>

            <Switch
              name="is_active"
              label="Live on the site"
              defaultChecked={service?.is_active ?? true}
            />
            <Switch
              name="is_featured"
              label="Feature on the home page"
              defaultChecked={service?.is_featured ?? false}
            />

            <Field label="Sort order" htmlFor="sort_order" hint="lower shows first">
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={service?.sort_order ?? 0}
              />
            </Field>
          </Panel>
        </div>
      </div>

      {state && !state.ok && <Toast state={{ tone: "error", message: state.message }} />}

      <div className="flex flex-wrap items-center gap-3 border-t border-champagne-300/10 pt-6">
        <SaveButton isNew={!service} />
        <Link href="/admin/services" className="text-sm text-cream-200/45 hover:text-cream-100">
          Cancel
        </Link>
        {service && (
          <Link
            href={`/services/${service.slug}`}
            target="_blank"
            className="ml-auto text-sm text-champagne-200/70 hover:text-champagne-100"
          >
            View on site ↗
          </Link>
        )}
      </div>
    </form>
  );
}

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving…" : isNew ? "Create service" : "Save changes"}
    </Button>
  );
}
