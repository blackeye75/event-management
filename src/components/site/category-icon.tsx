import {
  Cake,
  Camera,
  ConciergeBell,
  Disc3,
  Flower2,
  MapPinned,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/**
 * Categories store an icon *name* so an admin can pick one without shipping
 * code. Anything unrecognised falls back to the sparkle.
 */
const ICONS: Record<string, LucideIcon> = {
  "flower-2": Flower2,
  "utensils-crossed": UtensilsCrossed,
  "disc-3": Disc3,
  camera: Camera,
  sparkles: Sparkles,
  "map-pinned": MapPinned,
  cake: Cake,
  "concierge-bell": ConciergeBell,
};

export const ICON_NAMES = Object.keys(ICONS);

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} />;
}
