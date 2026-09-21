"use client";

import { motion } from "motion/react";
import { CalendarCheck, ClipboardList, PartyPopper, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Tell us the occasion",
    body: "Pick a package or start from scratch. Date, guest count, city — that is all we need to begin.",
  },
  {
    icon: Sparkles,
    title: "We design the evening",
    body: "A planner builds your mood board, menu and run-of-show, and prices every add-on in one sheet.",
  },
  {
    icon: CalendarCheck,
    title: "Confirm and pay",
    body: "Book your date online with a secure part-payment. Your dashboard tracks every change after that.",
  },
  {
    icon: PartyPopper,
    title: "Turn up and celebrate",
    body: "Our crew loads in, runs the day and tears down. You arrive as a guest at your own function.",
  },
];

export function Process() {
  return (
    <div className="relative mt-16 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
      {/* The connecting rule that threads the four steps together on desktop */}
      <div
        aria-hidden
        className="absolute left-0 right-0 top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-champagne-300/25 to-transparent lg:block"
      />

      {STEPS.map((step, i) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="group relative px-6 py-10 text-center"
        >
          <div className="relative mx-auto grid size-[4.5rem] place-items-center">
            <span className="absolute inset-0 rounded-full border border-champagne-300/20 bg-ink-950 transition-all duration-500 group-hover:border-champagne-300/60 group-hover:bg-champagne-300/10" />
            <step.icon className="relative size-6 text-champagne-300 transition-transform duration-500 group-hover:scale-110" />
            <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-champagne-300 text-[0.65rem] font-bold text-ink-950">
              {i + 1}
            </span>
          </div>
          <h3 className="font-display mt-6 text-xl text-cream-50">{step.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-cream-200/50">{step.body}</p>
        </motion.div>
      ))}
    </div>
  );
}
