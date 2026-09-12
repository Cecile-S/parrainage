"use client";

import { useActionState, useRef, useEffect } from "react";
import { createPlatform, type PlatformFormState } from "./actions";

const initialState: PlatformFormState = { status: "idle" };

type Activity = { id: string; name: string };

export function NewPlatformForm({ activities }: { activities: Activity[] }) {
  const [state, formAction, pending] = useActionState(
    createPlatform,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-2 rounded-md border border-neutral-200 p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">Activité</label>
        <select
          name="activity_id"
          required
          defaultValue=""
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        >
          <option value="" disabled>
            Choisir...
          </option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">Nom</label>
        <input
          name="name"
          required
          placeholder="ex: Trustpilot"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">
          Lien de dépôt d&apos;avis
        </label>
        <input
          name="url"
          type="url"
          required
          placeholder="https://..."
          className="w-64 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">Poids</label>
        <input
          name="weight"
          type="number"
          min={1}
          defaultValue={1}
          className="w-20 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "..." : "Ajouter"}
      </button>
      {state.status === "error" && (
        <p className="w-full text-sm text-red-600">{state.message}</p>
      )}
    </form>
  );
}
