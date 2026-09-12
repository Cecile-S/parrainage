"use client";

import { useActionState, useRef, useEffect } from "react";
import { createProgram, type ProgramFormState } from "./actions";

const initialState: ProgramFormState = { status: "idle" };

type Activity = { id: string; name: string };

export function NewProgramForm({ activities }: { activities: Activity[] }) {
  const [state, formAction, pending] = useActionState(
    createProgram,
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
        <label className="text-xs text-neutral-500">Nom du programme</label>
        <input
          name="name"
          required
          placeholder="ex: Programme standard"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">
          Récompense (€, parrainage conclu)
        </label>
        <input
          name="cash_amount"
          type="number"
          min={0}
          defaultValue={100}
          className="w-32 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "..." : "Créer"}
      </button>
      {state.status === "error" && (
        <p className="w-full text-sm text-red-600">{state.message}</p>
      )}
    </form>
  );
}
