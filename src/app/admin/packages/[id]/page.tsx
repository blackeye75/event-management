import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminGetPackage, adminListServices } from "@/lib/admin";
import { AdminHeading } from "@/components/admin/ui";
import { PackageForm } from "@/components/admin/package-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deletePackage } from "@/lib/actions/admin";

export const metadata: Metadata = { title: "Edit package · Admin" };

export default async function EditPackagePage({ params }: PageProps<"/admin/packages/[id]">) {
  const { id } = await params;
  const [result, services] = await Promise.all([adminGetPackage(id), adminListServices()]);
  if (!result) notFound();

  return (
    <>
      <AdminHeading
        title={result.pkg.name}
        description="Changes are live on the public site as soon as you save."
        action={
          <DeleteButton
            action={deletePackage}
            id={result.pkg.id}
            confirmLabel={`Delete “${result.pkg.name}”? Existing bookings keep their price and are simply unlinked.`}
          />
        }
      />
      <div className="mt-8">
        <PackageForm pkg={result.pkg} services={services} serviceIds={result.serviceIds} />
      </div>
    </>
  );
}
