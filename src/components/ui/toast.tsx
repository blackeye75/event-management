"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";

export type ToastState = { tone: "ok" | "error"; message: string } | null;

/** Single inline toast — every form in the app reports through this. */
export function Toast({ state }: { state: ToastState }) {
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          className={
            "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm " +
            (state.tone === "ok"
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/30 bg-rose-400/10 text-rose-200")
          }
        >
          {state.tone === "ok" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <span className="text-pretty">{state.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
