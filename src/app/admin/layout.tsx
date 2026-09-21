import { AdminShell } from "@/components/admin/admin-shell";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // /admin/setup renders its own page when Supabase is missing; everything
  // else goes through requireAdmin() and never reaches this branch unguarded.
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  const { data: profile } = user
    ? await supabase!.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <AdminShell
      name={profile?.full_name ?? profile?.email ?? "Administrator"}
      email={profile?.email ?? ""}
    >
      {children}
    </AdminShell>
  );
}
