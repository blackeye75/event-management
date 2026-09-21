"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

/**
 * A destructive action behind a native confirm. Kept deliberately plain: a
 * custom modal would be prettier but this is a back-office tool where an
 * accidental delete matters more than the dialog's styling.
 */
export function DeleteButton({
  action,
  id,
  confirmLabel,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  confirmLabel: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmLabel)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Inner label={label} />
    </form>
  );
}

function Inner({ label }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label ?? "Delete"}
      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/25 px-3 py-1.5 text-xs text-rose-300/80 transition-colors hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-200 disabled:opacity-40"
    >
      <Trash2 className="size-3.5" />
      {label ?? (pending ? "Deleting…" : "Delete")}
    </button>
  );
}
