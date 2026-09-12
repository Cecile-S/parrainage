"use client";

import { useActionState, useRef, useEffect } from "react";
import { createActivity, type ActivityFormState } from "./actions";

const initialState: ActivityFormState = { status: "idle" };

export function NewActivityForm() {
  const [state, formAction, pending] = useActionState(
    createActivity,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-xs text-neutral-500">
          Nouvelle activité
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="ex: Courtage crédit"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
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
        <p className="text-sm text-red-600">{state.message}</p>
      )}
    </form>
  );
}
