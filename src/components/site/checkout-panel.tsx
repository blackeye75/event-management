"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast, type ToastState } from "@/components/ui/toast";
import { ADVANCE_RATE } from "@/lib/pricing";
import { cn, formatCurrency } from "@/lib/utils";

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export function CheckoutPanel({
  bookingRef,
  total,
  packagePrice,
  addonsTotal,
  tax,
  collected,
  demo,
}: {
  bookingRef: string;
  total: number;
  packagePrice: number;
  addonsTotal: number;
  tax: number;
  collected: number;
  demo: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"advance" | "full">(collected > 0 ? "full" : "advance");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const outstanding = Math.max(0, total - collected);
  const advance = Math.round(total * ADVANCE_RATE);
  const payable = mode === "advance" ? Math.min(advance, outstanding) : outstanding;

  async function pay() {
    setBusy(true);
    setToast(null);

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ booking_ref: bookingRef, mode }),
      });

      const order = await res.json();
      if (!res.ok) throw new Error(order.error ?? "Could not start the payment.");

      // Demo mode: no gateway to open, so settle straight away.
      if (order.demo) {
        await settle({ razorpay_order_id: order.order_id });
        return;
      }

      await loadRazorpayScript();
      if (!window.Razorpay) throw new Error("Could not reach the payment gateway.");

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Function Junction",
        description: `${mode === "advance" ? "Advance" : "Balance"} for ${bookingRef}`,
        order_id: order.order_id,
        prefill: order.prefill,
        theme: { color: "#c9a24a" },
        handler: (response) => {
          void settle(response);
        },
        modal: { ondismiss: () => setBusy(false) },
      });

      checkout.open();
    } catch (error) {
      setToast({
        tone: "error",
        message: error instanceof Error ? error.message : "Something went wrong.",
      });
      setBusy(false);
    }
  }

  async function settle(payload: Record<string, string>) {
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || result.ok === false) {
        throw new Error(result.error ?? "We could not confirm that payment.");
      }

      setToast({ tone: "ok", message: "Payment received — confirming your booking…" });
      router.refresh();
    } catch (error) {
      setToast({
        tone: "error",
        message: error instanceof Error ? error.message : "We could not confirm that payment.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-3xl p-7">
      <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
        Payment
      </h2>

      <dl className="mt-6 space-y-3 text-sm">
        <Row label="Package" value={formatCurrency(packagePrice)} />
        <Row label="Add-ons" value={formatCurrency(addonsTotal)} />
        <Row label="GST (18%)" value={formatCurrency(tax)} />
        {collected > 0 && (
          <Row label="Already paid" value={`− ${formatCurrency(collected)}`} tone="ok" />
        )}
        <div className="flex items-baseline justify-between border-t border-champagne-300/12 pt-4">
          <dt className="text-cream-100">Outstanding</dt>
          <dd className="font-display text-2xl text-champagne-200">
            {formatCurrency(outstanding)}
          </dd>
        </div>
      </dl>

      {collected === 0 && (
        <div className="mt-7 grid gap-2.5">
          <ModeOption
            active={mode === "advance"}
            onClick={() => setMode("advance")}
            title={`Pay ${Math.round(ADVANCE_RATE * 100)}% advance`}
            caption="Holds the date. Balance due before the event."
            amount={advance}
          />
          <ModeOption
            active={mode === "full"}
            onClick={() => setMode("full")}
            title="Pay in full"
            caption="Nothing further to settle."
            amount={outstanding}
          />
        </div>
      )}

      {demo && (
        <p className="mt-6 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-xs leading-relaxed text-amber-200/85">
          <strong className="font-semibold">Demo mode.</strong> No Razorpay keys are configured, so
          this button settles the payment locally instead of charging a card. Add{" "}
          <code className="text-amber-100">RAZORPAY_KEY_ID</code> and{" "}
          <code className="text-amber-100">RAZORPAY_KEY_SECRET</code> to switch on the real gateway.
        </p>
      )}

      <div className="mt-6 space-y-4">
        <Toast state={toast} />
        <Button onClick={pay} disabled={busy || outstanding <= 0} size="lg" className="w-full">
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Lock className="size-4" />
              Pay {formatCurrency(payable)}
            </>
          )}
        </Button>
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 text-xs text-cream-200/35">
        <ShieldCheck className="size-3.5" />
        Secured by Razorpay · UPI, cards, netbanking
      </p>
    </div>
  );
}

function ModeOption({
  active,
  onClick,
  title,
  caption,
  amount,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  caption: string;
  amount: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300",
        active
          ? "border-champagne-300/60 bg-champagne-300/[0.08]"
          : "border-champagne-300/12 hover:border-champagne-300/35",
      )}
    >
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full border",
          active ? "border-champagne-300" : "border-cream-200/25",
        )}
      >
        {active && (
          <motion.span
            layoutId="pay-mode"
            className="size-2 rounded-full bg-champagne-300"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-cream-50">{title}</span>
        <span className="block text-xs text-cream-200/40">{caption}</span>
      </span>
      <span className="shrink-0 text-sm text-champagne-200">{formatCurrency(amount)}</span>
    </button>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "ok" }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-cream-200/45">{label}</dt>
      <dd className={tone === "ok" ? "text-emerald-300" : "text-cream-100"}>{value}</dd>
    </div>
  );
}

/** Injects Razorpay's checkout script once, on first use. */
function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();

    const existing = document.querySelector<HTMLScriptElement>("script[data-razorpay]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Gateway script failed to load.")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gateway script failed to load."));
    document.head.appendChild(script);
  });
}
