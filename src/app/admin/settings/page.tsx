import type { Metadata } from "next";
import { adminGetSettings } from "@/lib/admin";
import { AdminHeading, EmptyState } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Site settings · Admin" };

export default async function AdminSettingsPage() {
  const settings = await adminGetSettings();

  return (
    <>
      <AdminHeading
        title="Site settings"
        description="Company details, the home-page headline and the counters — all of it renders straight onto the public site."
      />

      <div className="mt-8">
        {settings ? (
          <SettingsForm settings={settings} />
        ) : (
          <EmptyState
            title="Settings row missing"
            description="Run supabase/migrations/0001_init.sql — it seeds the single site_settings row."
          />
        )}
      </div>
    </>
  );
}
