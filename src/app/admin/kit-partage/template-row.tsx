"use client";

import { useTransition } from "react";
import { toggleTemplateActive } from "./actions";

type Template = {
  id: string;
  channel: string;
  label: string;
  content: string;
  active: boolean;
};

export function TemplateRow({ template }: { template: Template }) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-start justify-between gap-3 rounded-md border border-neutral-200 px-4 py-3 text-sm">
      <div>
        <p className="text-xs font-medium text-neutral-500">
          {template.channel} — {template.label}
        </p>
        <p className="mt-1 text-neutral-700">{template.content}</p>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() =>
            toggleTemplateActive(template.id, !template.active),
          )
        }
        className={
          template.active
            ? "shrink-0 rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
            : "shrink-0 rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-500"
        }
      >
        {template.active ? "Actif" : "Désactivé"}
      </button>
    </li>
  );
}
