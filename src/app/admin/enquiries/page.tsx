import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { adminListEnquiries } from "@/lib/admin";
import { AdminHeading, EmptyState, Panel } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteEnquiry, toggleEnquiryHandled } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { eventTypeLabel, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Enquiries · Admin" };

export default async function AdminEnquiriesPage() {
  const enquiries = await adminListEnquiries();
  const open = enquiries.filter((e) => !e.is_handled);
  const handled = enquiries.filter((e) => e.is_handled);

  return (
    <>
      <AdminHeading
        title="Enquiries"
        description="Everything submitted through the contact form, newest first."
      />

      {enquiries.length ? (
        <div className="mt-8 space-y-10">
          <Section title="Needs a reply" items={open} emptyNote="Inbox zero." />
          {handled.length > 0 && <Section title="Handled" items={handled} muted />}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No enquiries yet"
            description="Messages sent from /contact land here."
          />
        </div>
      )}
    </>
  );
}

function Section({
  title,
  items,
  emptyNote,
  muted,
}: {
  title: string;
  items: Awaited<ReturnType<typeof adminListEnquiries>>;
  emptyNote?: string;
  muted?: boolean;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl">
        {title}
        <span className="ml-3 text-base text-cream-200/30">{items.length}</span>
      </h2>

      {items.length ? (
        <div className={`mt-5 space-y-3 ${muted ? "opacity-60" : ""}`}>
          {items.map((e) => (
            <Panel key={e.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-cream-50">{e.name}</span>
                    {e.event_type && <Badge>{eventTypeLabel(e.event_type)}</Badge>}
                    <span className="text-xs text-cream-200/30">{formatDate(e.created_at)}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                    <a
                      href={`mailto:${e.email}`}
                      className="inline-flex items-center gap-1.5 text-champagne-200/75 hover:text-champagne-100"
                    >
                      <Mail className="size-3.5" />
                      {e.email}
                    </a>
                    {e.phone && (
                      <a
                        href={`tel:${e.phone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-1.5 text-champagne-200/75 hover:text-champagne-100"
                      >
                        <Phone className="size-3.5" />
                        {e.phone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <form action={toggleEnquiryHandled}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="is_handled" value={String(e.is_handled)} />
                    <button
                      type="submit"
                      className="hairline rounded-lg px-3 py-1.5 text-xs text-cream-200/65 transition-colors hover:border-champagne-300/40 hover:text-champagne-200"
                    >
                      {e.is_handled ? "Reopen" : "Mark handled"}
                    </button>
                  </form>
                  <DeleteButton
                    action={deleteEnquiry}
                    id={e.id}
                    confirmLabel={`Delete the enquiry from ${e.name}?`}
                  />
                </div>
              </div>

              <p className="mt-4 text-pretty text-sm leading-relaxed text-cream-200/60">
                {e.message}
              </p>
            </Panel>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-cream-200/35">{emptyNote}</p>
      )}
    </section>
  );
}
