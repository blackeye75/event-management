import type { Package, Service } from "@/lib/database.types";
import { TAX_RATE } from "@/lib/utils";

export type AddonLine = {
  service_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type Quote = {
  packagePrice: number;
  addons: AddonLine[];
  addonsTotal: number;
  subtotal: number;
  tax: number;
  total: number;
  advance: number;
};

/** The advance taken at booking time; the balance is due before the event. */
export const ADVANCE_RATE = 0.25;

/**
 * The single source of truth for what a booking costs. The wizard calls it to
 * preview a total and the server action calls it again with rows read straight
 * from the database, so a tampered form can never change the price.
 */
export function quoteBooking({
  pkg,
  services,
  guestCount,
}: {
  pkg: Pick<Package, "base_price" | "sale_price"> | null;
  services: Pick<Service, "id" | "name" | "base_price" | "price_unit">[];
  guestCount: number;
}): Quote {
  const packagePrice = pkg ? Number(pkg.sale_price ?? pkg.base_price) : 0;
  const guests = Math.max(1, Math.round(guestCount) || 1);

  const addons: AddonLine[] = services.map((s) => {
    // Per-plate services scale with the headcount; everything else is a flat
    // charge for the event.
    const quantity = s.price_unit === "plate" ? guests : 1;
    const unit_price = Number(s.base_price);

    return {
      service_id: s.id,
      name: s.name,
      quantity,
      unit_price,
      line_total: unit_price * quantity,
    };
  });

  const addonsTotal = addons.reduce((sum, a) => sum + a.line_total, 0);
  const subtotal = packagePrice + addonsTotal;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  return {
    packagePrice,
    addons,
    addonsTotal,
    subtotal,
    tax,
    total,
    advance: Math.round(total * ADVANCE_RATE),
  };
}
