"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveSettings, type ActionResult } from "@/lib/actions/admin";
import { Panel } from "@/components/admin/ui";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import type { SiteSettings } from "@/lib/database.types";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action] = useActionState<ActionResult, FormData>(saveSettings, null);

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="space-y-5 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
            Identity
          </h2>

          <Field label="Company name" htmlFor="company_name">
            <Input id="company_name" name="company_name" required defaultValue={settings.company_name} />
          </Field>

          <Field label="Tagline" htmlFor="tagline" hint="footer and About page">
            <Input id="tagline" name="tagline" defaultValue={settings.tagline} />
          </Field>

          <Field
            label="Hero headline"
            htmlFor="hero_title"
            hint="the last two words get the gold treatment"
          >
            <Input id="hero_title" name="hero_title" defaultValue={settings.hero_title} />
          </Field>

          <Field label="Hero subtitle" htmlFor="hero_subtitle">
            <Textarea
              id="hero_subtitle"
              name="hero_subtitle"
              rows={3}
              defaultValue={settings.hero_subtitle}
            />
          </Field>
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-5 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
              Contact
            </h2>

            <Field label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={settings.phone} />
            </Field>

            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" defaultValue={settings.email} />
            </Field>

            <Field label="Studio address" htmlFor="address">
              <Textarea id="address" name="address" rows={2} defaultValue={settings.address} />
            </Field>
          </Panel>

          <Panel className="space-y-5 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
              Social
            </h2>

            <Field label="Instagram" htmlFor="instagram_url" hint="blank hides the icon">
              <Input id="instagram_url" name="instagram_url" defaultValue={settings.instagram_url ?? ""} />
            </Field>

            <Field label="Facebook" htmlFor="facebook_url" hint="blank hides the icon">
              <Input id="facebook_url" name="facebook_url" defaultValue={settings.facebook_url ?? ""} />
            </Field>

            <Field label="YouTube" htmlFor="youtube_url" hint="blank hides the icon">
              <Input id="youtube_url" name="youtube_url" defaultValue={settings.youtube_url ?? ""} />
            </Field>
          </Panel>
        </div>
      </div>

      <Panel className="p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
          Counters
        </h2>
        <p className="mt-2 text-xs text-cream-200/40">
          These animate up on the home page and the About page.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <Field label="Events delivered" htmlFor="events_count">
            <Input
              id="events_count"
              name="events_count"
              type="number"
              min={0}
              defaultValue={settings.events_count}
            />
          </Field>

          <Field label="Cities covered" htmlFor="cities_count">
            <Input
              id="cities_count"
              name="cities_count"
              type="number"
              min={0}
              defaultValue={settings.cities_count}
            />
          </Field>

          <Field label="Years in the trade" htmlFor="years_count">
            <Input
              id="years_count"
              name="years_count"
              type="number"
              min={0}
              defaultValue={settings.years_count}
            />
          </Field>
        </div>
      </Panel>

      {state && <Toast state={{ tone: state.ok ? "ok" : "error", message: state.message }} />}

      <div className="border-t border-champagne-300/10 pt-6">
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving…" : "Save settings"}
    </Button>
  );
}
