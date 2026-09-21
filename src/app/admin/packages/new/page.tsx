import type { Metadata } from "next";
import { adminListServices } from "@/lib/admin";
import { AdminHeading } from "@/components/admin/ui";
import { PackageForm } from "@/components/admin/package-form";

export const metadata: Metadata = { title: "New package · Admin" };

export default async function NewPackagePage() {
  const services = await adminListServices();

  return (
    <>
      <AdminHeading
        title="New package"
        description="It goes live the moment you save it, unless you switch visibility off."
      />
      <div className="mt-8">
        <PackageForm services={services} serviceIds={[]} />
      </div>
    </>
  );
}
