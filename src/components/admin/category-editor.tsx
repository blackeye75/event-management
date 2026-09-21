"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { deleteCategory, saveCategory, type ActionResult } from "@/lib/actions/admin";
import { Panel } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { Switch } from "@/components/admin/switch";
import { CategoryIcon, ICON_NAMES } from "@/components/site/category-icon";
import { slugify, titleCase } from "@/lib/utils";
import type { Category } from "@/lib/database.types";

export function CategoryEditor({
  category,
  serviceCount = 0,
}: {
  category?: Category;
  serviceCount?: number;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(saveCategory, null);
  const [open, setOpen] = useState(!category);
  const [icon, setIcon] = useState(category?.icon ?? "sparkles");
  const [name, setName] = useState(category?.name ?? "");

  const fields = (
    <form action={action} className="space-y-5">
      {category && <input type="hidden" name="id" value={category.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor={`name-${category?.id ?? "new"}`}>
          <Input
            id={`name-${category?.id ?? "new"}`}
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Decor & Styling"
          />
        </Field>

        <Field label="URL slug" htmlFor={`slug-${category?.id ?? "new"}`}>
          <Input
            id={`slug-${category?.id ?? "new"}`}
            name="slug"
            defaultValue={category?.slug ?? ""}
            placeholder={slugify(name) || "decor"}
          />
        </Field>
      </div>

      <Field label="Description" htmlFor={`desc-${category?.id ?? "new"}`}>
        <Textarea
          id={`desc-${category?.id ?? "new"}`}
          name="description"
          rows={2}
          defaultValue={category?.description ?? ""}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Icon" htmlFor={`icon-${category?.id ?? "new"}`}>
          <div className="flex items-center gap-3">
            <span className="hairline grid size-11 shrink-0 place-items-center rounded-xl">
              <CategoryIcon name={icon} className="size-5 text-champagne-300" />
            </span>
            <Select
              id={`icon-${category?.id ?? "new"}`}
              name="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            >
              {ICON_NAMES.map((n) => (
                <option key={n} value={n}>
                  {titleCase(n)}
                </option>
              ))}
            </Select>
          </div>
        </Field>

        <Field label="Sort order" htmlFor={`sort-${category?.id ?? "new"}`}>
          <Input
            id={`sort-${category?.id ?? "new"}`}
            name="sort_order"
            type="number"
            defaultValue={category?.sort_order ?? 0}
          />
        </Field>
      </div>

      <Switch name="is_active" label="Live on the site" defaultChecked={category?.is_active ?? true} />

      {state && <Toast state={{ tone: state.ok ? "ok" : "error", message: state.message }} />}

      <div className="flex items-center gap-3">
        <SaveButton isNew={!category} />
        {category && (
          <DeleteButton
            action={deleteCategory}
            id={category.id}
            confirmLabel={
              serviceCount
                ? `Delete “${category.name}”? Its ${serviceCount} service(s) stay, but become uncategorised.`
                : `Delete “${category.name}”?`
            }
          />
        )}
      </div>
    </form>
  );

  if (!category) return fields;

  return (
    <Panel>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-6 py-5 text-left"
      >
        <span className="hairline grid size-10 shrink-0 place-items-center rounded-xl">
          <CategoryIcon name={icon} className="size-4 text-champagne-300" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-cream-50">{category.name}</span>
          <span className="block truncate text-xs text-cream-200/35">
            /{category.slug} · {serviceCount} service{serviceCount === 1 ? "" : "s"}
            {!category.is_active && " · hidden"}
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-cream-200/40 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-champagne-300/10 px-6 py-6">{fields}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving…" : isNew ? "Add category" : "Save"}
    </Button>
  );
}
