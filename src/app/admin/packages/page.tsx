import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { adminListPackages } from "@/lib/admin";
import { AdminHeading, EmptyState, TableWrap, Td, Th } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deletePackage } from "@/lib/actions/admin";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/ui/smart-image";
import { eventTypeLabel, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Packages · Admin" };

export default async function AdminPackagesPage() {
  const packages = await adminListPackages();

  return (
    <>
      <AdminHeading
        title="Packages"
        description="Everything on /packages. Deactivate to hide a package without losing its bookings."
        action={
          <ButtonLink href="/admin/packages/new" size="sm">
            <Plus className="size-4" />
            New package
          </ButtonLink>
        }
      />

      {packages.length ? (
        <div className="mt-8">
          <TableWrap>
            <thead>
              <tr>
                <Th>Package</Th>
                <Th>Occasion</Th>
                <Th className="text-right">Price</Th>
                <Th className="text-right">Capacity</Th>
                <Th>Visibility</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="transition-colors hover:bg-champagne-300/[0.03]">
                  <Td>
                    <Link href={`/admin/packages/${pkg.id}`} className="flex items-center gap-3">
                      <SmartImage
                        src={pkg.hero_image_url}
                        alt={pkg.name}
                        seed={pkg.slug}
                        className="size-11 shrink-0 rounded-lg"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-cream-50">{pkg.name}</span>
                        <span className="block truncate text-xs text-cream-200/35">
                          /{pkg.slug}
                        </span>
                      </span>
                    </Link>
                  </Td>
                  <Td className="text-cream-200/65">{eventTypeLabel(pkg.event_type)}</Td>
                  <Td className="whitespace-nowrap text-right">
                    <span className="text-cream-100">
                      {formatCurrency(pkg.sale_price ?? pkg.base_price)}
                    </span>
                    {pkg.sale_price != null && (
                      <span className="ml-2 text-xs text-cream-200/30 line-through">
                        {formatCurrency(pkg.base_price)}
                      </span>
                    )}
                  </Td>
                  <Td className="text-right text-cream-200/65">{pkg.guest_capacity}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        className={
                          pkg.is_active
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : "border-cream-200/20 bg-cream-100/5 text-cream-200/50"
                        }
                      >
                        {pkg.is_active ? "Live" : "Hidden"}
                      </Badge>
                      {pkg.is_featured && <Badge>Featured</Badge>}
                    </div>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/packages/${pkg.id}`}
                        className="hairline rounded-lg px-3 py-1.5 text-xs text-cream-200/65 transition-colors hover:border-champagne-300/40 hover:text-champagne-200"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deletePackage}
                        id={pkg.id}
                        confirmLabel={`Delete “${pkg.name}”? Bookings that reference it keep their price and are simply unlinked.`}
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
            title="No packages yet"
            description="Create your first package and it appears on the site immediately."
            action={<ButtonLink href="/admin/packages/new">Create a package</ButtonLink>}
          />
        </div>
      )}
    </>
  );
}
