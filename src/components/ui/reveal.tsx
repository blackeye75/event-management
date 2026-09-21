"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)" },
};

/** Scroll-triggered entrance. Fires once, respects reduced motion via CSS. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const Component = motion[as];

  return (
    <Component
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}

/** Staggers direct <Reveal> children without hand-tuning each delay. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: stagger }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const revealChild: Variants = variants;
