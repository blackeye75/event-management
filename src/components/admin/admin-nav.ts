export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/bookings", label: "Bookings", icon: "calendar" },
  { href: "/admin/packages", label: "Packages", icon: "package" },
  { href: "/admin/services", label: "Services", icon: "sparkles" },
  { href: "/admin/categories", label: "Categories", icon: "tags" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "quote" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "inbox" },
  { href: "/admin/settings", label: "Site settings", icon: "settings" },
] as const;

export type AdminNavIcon = (typeof ADMIN_NAV)[number]["icon"];
