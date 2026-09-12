"use client";

import { useActionState } from "react";
import type { ConsentState } from "./actions";

const initialState: ConsentState = { status: "idle" };

export function ConsentForm({
  action,
  consentText,
}: {
  action: (state: ConsentState, formData: FormData) => Promise<ConsentState>;
  consentText: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.status === "success") {
    return (
      <p className="rounded-md bg-green-50 p-4 text-sm text-green-700">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="agree"
          required
          className="mt-1"
        />
        <span>{consentText}</span>
      </label>

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Envoi..." : "Je confirme mon accord"}
      </button>
    </form>
  );
}
