import type { Metadata } from "next";
import { getPackages, getServices, getSettings } from "@/lib/queries";
import { PageHeader } from "@/components/site/page-header";
import { Gallery, type GalleryItem } from "@/components/site/gallery";
import { CtaBand } from "@/components/site/cta-band";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Decor builds, mandaps, stages, dessert tables and dance floors from recent Function Junction events.",
};

export default async function GalleryPage() {
  const [packages, services, settings] = await Promise.all([
    getPackages(),
    getServices(),
    getSettings(),
  ]);

  // The gallery is assembled from the catalogue the admin already maintains,
  // so adding a package or service adds its imagery here automatically.
  const seen = new Set<string>();
  const items: GalleryItem[] = [];

  for (const pkg of packages) {
    for (const src of pkg.gallery) {
      if (seen.has(src)) continue;
      seen.add(src);
      items.push({ src, alt: pkg.name, seed: pkg.slug, caption: pkg.name });
    }
  }

  for (const service of services) {
    if (!service.image_url || seen.has(service.image_url)) continue;
    seen.add(service.image_url);
    items.push({
      src: service.image_url,
      alt: service.name,
      seed: service.slug,
      caption: service.name,
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="The work"
        title="Rooms we have"
        accent="taken apart and rebuilt"
        description="A cross-section of recent builds — mandaps, neon floors, dessert walls and dinner sets. Tap any frame to open it full size."
      />

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <Gallery items={items} />
      </section>

      <CtaBand phone={settings.phone} />
    </>
  );
}
