import type { Metadata } from "next";
import { adminListCategories, adminListServices } from "@/lib/admin";
import { AdminHeading, Panel } from "@/components/admin/ui";
import { CategoryEditor } from "@/components/admin/category-editor";

export const metadata: Metadata = { title: "Categories · Admin" };

export default async function AdminCategoriesPage() {
  const [categories, services] = await Promise.all([adminListCategories(), adminListServices()]);

  const counts = services.reduce<Record<string, number>>((acc, s) => {
    if (s.category_id) acc[s.category_id] = (acc[s.category_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <AdminHeading
        title="Categories"
        description="The disciplines services are filed under. They drive the icon rail on the home page and the filters on /services."
      />

      <div className="mt-8 space-y-4">
        {categories.map((category) => (
          <CategoryEditor
            key={category.id}
            category={category}
            serviceCount={counts[category.id] ?? 0}
          />
        ))}

        <Panel className="p-6">
          <h2 className="font-display text-xl">Add a category</h2>
          <div className="mt-5">
            <CategoryEditor />
          </div>
        </Panel>
      </div>
    </>
  );
}
