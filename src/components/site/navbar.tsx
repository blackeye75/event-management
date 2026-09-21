import { getCurrentProfile, getSettings } from "@/lib/queries";
import { NavbarClient } from "@/components/site/navbar-client";

export async function Navbar() {
  const [profile, settings] = await Promise.all([getCurrentProfile(), getSettings()]);

  return (
    <NavbarClient
      phone={settings.phone}
      user={
        profile
          ? {
              name: profile.full_name ?? profile.email ?? "Guest",
              isAdmin: profile.role === "admin",
            }
          : null
      }
    />
  );
}
