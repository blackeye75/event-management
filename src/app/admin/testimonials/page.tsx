import type { Metadata } from "next";
import { adminListTestimonials } from "@/lib/admin";
import { AdminHeading, Panel } from "@/components/admin/ui";
import { TestimonialEditor } from "@/components/admin/testimonial-editor";

export const metadata: Metadata = { title: "Testimonials · Admin" };

export default async function AdminTestimonialsPage() {
  const testimonials = await adminListTestimonials();

  return (
    <>
      <AdminHeading
        title="Testimonials"
        description="The carousel on the home page and the About page. Unpublish rather than delete if you might want it back."
      />

      <div className="mt-8 space-y-4">
        {testimonials.map((t) => (
          <TestimonialEditor key={t.id} testimonial={t} />
        ))}

        <Panel className="p-6">
          <h2 className="font-display text-xl">Add a testimonial</h2>
          <div className="mt-5">
            <TestimonialEditor />
          </div>
        </Panel>
      </div>
    </>
  );
}
