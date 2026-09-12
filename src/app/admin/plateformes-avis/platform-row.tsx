"use client";

import { useState, useTransition } from "react";
import {
  updatePlatformWeight,
  togglePlatformActive,
  updatePlatformDetails,
  deletePlatform,
} from "./actions";

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
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(platform.name);
  const [url, setUrl] = useState(platform.url);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function saveDetails() {
    startTransition(async () => {
      const result = await updatePlatformDetails(platform.id, name, url);
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 rounded-md border border-neutral-200 px-4 py-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
            placeholder="Nom"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="min-w-64 flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm"
            placeholder="Lien de dépôt d'avis"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={saveDetails}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setName(platform.name);
              setUrl(platform.url);
              setError(null);
            }}
            className="text-xs text-neutral-500"
          >
            Annuler
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </li>
    );
  }

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

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs text-neutral-500 underline"
      >
        Modifier
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm(`Supprimer ${platform.name} ?`)) {
            startTransition(() => deletePlatform(platform.id));
          }
        }}
        className="text-xs text-red-600 underline disabled:opacity-50"
      >
        Supprimer
      </button>
    </li>
  );
}
