import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { adminListCategories, adminListServices } from "@/lib/admin";
import { AdminHeading, EmptyState, TableWrap, Td, Th } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteService } from "@/lib/actions/admin";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/ui/smart-image";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Services · Admin" };

export default async function AdminServicesPage() {
  const [services, categories] = await Promise.all([adminListServices(), adminListCategories()]);
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <AdminHeading
        title="Services"
        description="The add-ons customers can attach to any booking, and the tiles on /services."
        action={
          <ButtonLink href="/admin/services/new" size="sm">
            <Plus className="size-4" />
            New service
          </ButtonLink>
        }
      />

      {services.length ? (
        <div className="mt-8">
          <TableWrap>
            <thead>
              <tr>
                <Th>Service</Th>
                <Th>Category</Th>
                <Th className="text-right">Price</Th>
                <Th>Visibility</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-champagne-300/[0.03]">
                  <Td>
                    <Link href={`/admin/services/${s.id}`} className="flex items-center gap-3">
                      <SmartImage
                        src={s.image_url}
                        alt={s.name}
                        seed={s.slug}
                        className="size-11 shrink-0 rounded-lg"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-cream-50">{s.name}</span>
                        <span className="block truncate text-xs text-cream-200/35">/{s.slug}</span>
                      </span>
                    </Link>
                  </Td>
                  <Td className="text-cream-200/65">
                    {categoryName.get(s.category_id ?? "") ?? "—"}
                  </Td>
                  <Td className="whitespace-nowrap text-right">
                    <span className="text-cream-100">{formatCurrency(s.base_price)}</span>
                    <span className="ml-1.5 text-xs text-cream-200/35">/{s.price_unit}</span>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        className={
                          s.is_active
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : "border-cream-200/20 bg-cream-100/5 text-cream-200/50"
                        }
                      >
                        {s.is_active ? "Live" : "Hidden"}
                      </Badge>
                      {s.is_featured && <Badge>Featured</Badge>}
                    </div>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/services/${s.id}`}
                        className="hairline rounded-lg px-3 py-1.5 text-xs text-cream-200/65 transition-colors hover:border-champagne-300/40 hover:text-champagne-200"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteService}
                        id={s.id}
                        confirmLabel={`Delete “${s.name}”? Past bookings keep their line items.`}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No services yet"
            description="Add your first service so customers have something to attach to a booking."
            action={<ButtonLink href="/admin/services/new">Create a service</ButtonLink>}
          />
        </div>
      )}
    </>
  );
}
