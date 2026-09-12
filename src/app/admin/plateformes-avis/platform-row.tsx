"use client";

import { useState, useTransition } from "react";
import { updatePlatformWeight, togglePlatformActive } from "./actions";

type Platform = {
  id: string;
  name: string;
  url: string;
  weight: number;
  active: boolean;
};

export function PlatformRow({
  platform,
  sharePercent,
}: {
  platform: Platform;
  sharePercent: number;
}) {
  const [weight, setWeight] = useState(platform.weight);
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-3 rounded-md border border-neutral-200 px-4 py-3 text-sm">
      <div className="flex-1">
        <p className="font-medium">{platform.name}</p>
        <a
          href={platform.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-neutral-500 underline"
        >
          {platform.url}
        </a>
      </div>

      <span className="text-xs text-neutral-500">
        ~{sharePercent}% des demandes
      </span>

      <input
        type="number"
        min={1}
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
        onBlur={() =>
          startTransition(() => updatePlatformWeight(platform.id, weight))
        }
        disabled={isPending}
        className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />

      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() =>
            togglePlatformActive(platform.id, !platform.active),
          )
        }
        className={
          platform.active
            ? "rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
            : "rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-500"
        }
      >
        {platform.active ? "Active" : "Désactivée"}
      </button>
    </li>
  );
}
