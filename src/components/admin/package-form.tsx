"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { savePackage, type ActionResult } from "@/lib/actions/admin";
import { Panel } from "@/components/admin/ui";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { SmartImage } from "@/components/ui/smart-image";
import { Switch } from "@/components/admin/switch";
import { EVENT_TYPES, cn, slugify } from "@/lib/utils";
import type { Package, Service } from "@/lib/database.types";

export function PackageForm({
  pkg,
  services,
  serviceIds,
}: {
  pkg?: Package;
  services: Service[];
  serviceIds: string[];
}) {
  const [state, action] = useActionState<ActionResult, FormData>(savePackage, null);

  const [name, setName] = useState(pkg?.name ?? "");
  const [slug, setSlug] = useState(pkg?.slug ?? "");
  const [hero, setHero] = useState(pkg?.hero_image_url ?? "");
  const [bundled, setBundled] = useState<string[]>(serviceIds);

  // The slug tracks the name until it is edited by hand.
  const slugTouched = slug !== "" && slug !== slugify(name);
  const effectiveSlug = slugTouched ? slug : slugify(name);

  return (
    <form action={action} className="space-y-6">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel className="space-y-5 p-6">
            <Field label="Name" htmlFor="name">
              <Input
                id="name"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="The Signature Wedding"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="URL slug" htmlFor="slug" hint="/packages/…">
                <Input
                  id="slug"
                  name="slug"
                  value={effectiveSlug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="classic-wedding-signature"
                />
              </Field>

              <Field label="Occasion" htmlFor="event_type">
                <Select id="event_type" name="event_type" defaultValue={pkg?.event_type ?? "wedding"}>
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Tagline" htmlFor="tagline" hint="one line, shown on the card">
              <Input
                id="tagline"
                name="tagline"
                defaultValue={pkg?.tagline ?? ""}
                placeholder="Two days, one coordinator, nothing left to you"
              />
            </Field>

            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                name="description"
                rows={6}
                defaultValue={pkg?.description ?? ""}
                placeholder="What the package actually covers, in a paragraph or two."
              />
            </Field>

            <Field
              label="Inclusions"
              htmlFor="inclusions"
              hint="one per line"
            >
              <Textarea
                id="inclusions"
                name="inclusions"
                rows={7}
                defaultValue={(pkg?.inclusions ?? []).join("\n")}
                placeholder={"Fresh-flower mandap and stage\nMulti-cuisine catering for 300"}
              />
            </Field>
          </Panel>

          <Panel className="space-y-5 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
              Bundled services
            </h2>
            <p className="-mt-2 text-xs text-cream-200/40">
              Shown on the package page and hidden from the add-on list at booking, so nobody pays
              twice.
            </p>

            {bundled.map((id) => (
              <input key={id} type="hidden" name="service_ids" value={id} />
            ))}

            <div className="grid gap-2 sm:grid-cols-2">
              {services.map((s) => {
                const active = bundled.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setBundled((prev) =>
                        active ? prev.filter((x) => x !== s.id) : [...prev, s.id],
                      )
                    }
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors",
                      active
                        ? "border-champagne-300/55 bg-champagne-300/[0.08] text-cream-50"
                        : "border-champagne-300/12 text-cream-200/55 hover:border-champagne-300/30",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        active ? "bg-champagne-300" : "bg-cream-200/20",
                      )}
                    />
                    <span className="truncate">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>

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
                defaultValue={pkg?.base_price ?? 0}
              />
            </Field>

            <Field label="Sale price (₹)" htmlFor="sale_price" hint="blank for none">
              <Input
                id="sale_price"
                name="sale_price"
                type="number"
                min={0}
                step={1}
                defaultValue={pkg?.sale_price ?? ""}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Guest capacity" htmlFor="guest_capacity">
                <Input
                  id="guest_capacity"
                  name="guest_capacity"
                  type="number"
                  min={1}
                  defaultValue={pkg?.guest_capacity ?? 100}
                />
              </Field>

              <Field label="Duration (hours)" htmlFor="duration_hours">
                <Input
                  id="duration_hours"
                  name="duration_hours"
                  type="number"
                  min={1}
                  defaultValue={pkg?.duration_hours ?? 5}
                />
              </Field>
            </div>
          </Panel>

          <Panel className="space-y-5 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
              Imagery
            </h2>

            <SmartImage
              src={hero}
              alt="Hero preview"
              seed={effectiveSlug || "package"}
              className="aspect-[16/9] w-full rounded-xl"
            />

            <Field label="Hero image URL" htmlFor="hero_image_url">
              <Input
                id="hero_image_url"
                name="hero_image_url"
                value={hero}
                onChange={(e) => setHero(e.target.value)}
                placeholder="https://images.unsplash.com/photo-…"
              />
            </Field>

            <Field label="Gallery URLs" htmlFor="gallery" hint="one per line">
              <Textarea
                id="gallery"
                name="gallery"
                rows={4}
                defaultValue={(pkg?.gallery ?? []).join("\n")}
              />
            </Field>
          </Panel>

          <Panel className="space-y-5 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
              Visibility
            </h2>

            <Switch name="is_active" label="Live on the site" defaultChecked={pkg?.is_active ?? true} />
            <Switch
              name="is_featured"
              label="Feature on the home page"
              defaultChecked={pkg?.is_featured ?? false}
            />

            <Field label="Sort order" htmlFor="sort_order" hint="lower shows first">
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={pkg?.sort_order ?? 0}
              />
            </Field>
          </Panel>
        </div>
      </div>

      {state && !state.ok && <Toast state={{ tone: "error", message: state.message }} />}

      <div className="flex flex-wrap items-center gap-3 border-t border-champagne-300/10 pt-6">
        <SaveButton isNew={!pkg} />
        <Link href="/admin/packages" className="text-sm text-cream-200/45 hover:text-cream-100">
          Cancel
        </Link>
        {pkg && (
          <Link
            href={`/packages/${pkg.slug}`}
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
      {pending ? "Saving…" : isNew ? "Create package" : "Save changes"}
    </Button>
  );
}
