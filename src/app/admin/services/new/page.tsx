import type { Metadata } from "next";
import { adminListCategories } from "@/lib/admin";
import { AdminHeading } from "@/components/admin/ui";
import { ServiceForm } from "@/components/admin/service-form";

export const metadata: Metadata = { title: "New service · Admin" };

export default async function NewServicePage() {
  const categories = await adminListCategories();

  return (
    <>
      <AdminHeading title="New service" description="Available as a booking add-on once saved." />
      <div className="mt-8">
        <ServiceForm categories={categories} />
      </div>
    </>
  );
}
