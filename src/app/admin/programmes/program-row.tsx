"use client";

import { useTransition } from "react";
import { toggleProgramActive } from "./actions";

type Program = {
  id: string;
  name: string;
  reward_rules: { cash_amount?: number; currency?: string } | null;
  active: boolean;
};

export function ProgramRow({ program }: { program: Program }) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between rounded-md border border-neutral-200 px-4 py-3 text-sm">
      <div>
        <p className="font-medium">{program.name}</p>
        <p className="text-xs text-neutral-500">
          {program.reward_rules?.cash_amount ?? 0}{" "}
          {program.reward_rules?.currency ?? "EUR"} par parrainage conclu
        </p>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() => toggleProgramActive(program.id, !program.active))
        }
        className={
          program.active
            ? "rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
            : "rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-500"
        }
      >
        {program.active ? "Actif" : "Désactivé"}
      </button>
    </li>
  );
}
