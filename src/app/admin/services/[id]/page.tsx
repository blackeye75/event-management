import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminGetService, adminListCategories } from "@/lib/admin";
import { AdminHeading } from "@/components/admin/ui";
import { ServiceForm } from "@/components/admin/service-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteService } from "@/lib/actions/admin";

export const metadata: Metadata = { title: "Edit service · Admin" };

export default async function EditServicePage({ params }: PageProps<"/admin/services/[id]">) {
  const { id } = await params;
  const [service, categories] = await Promise.all([adminGetService(id), adminListCategories()]);
  if (!service) notFound();

  return (
    <>
      <AdminHeading
        title={service.name}
        description="Changes are live on the public site as soon as you save."
        action={
          <DeleteButton
            action={deleteService}
            id={service.id}
            confirmLabel={`Delete “${service.name}”? Past bookings keep their line items.`}
          />
        }
      />
      <div className="mt-8">
        <ServiceForm service={service} categories={categories} />
      </div>
    </>
  );
}
