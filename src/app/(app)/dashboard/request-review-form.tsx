"use client";

import { useActionState } from "react";
import { requestReview, type RequestReviewState } from "./actions";

const initialState: RequestReviewState = { status: "idle" };

type Activity = { id: string; name: string };

export function RequestReviewForm({ activities }: { activities: Activity[] }) {
  const [state, formAction, pending] = useActionState(
    requestReview,
    initialState,
  );

  return (
    <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4">
      <div>
        <p className="text-sm font-medium">Laisser un avis</p>
        <p className="text-xs text-neutral-500">
          On te propose une plateforme différente à chaque fois, pour
          équilibrer les avis entre elles.
        </p>
      </div>

      <form action={formAction} className="flex items-center gap-2">
        <select
          name="activity_id"
          required
          defaultValue=""
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        >
          <option value="" disabled>
            Choisir une activité...
          </option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "..." : "Demander"}
        </button>
      </form>

      {state.status === "success" && state.platformUrl && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm">
          <span className="text-green-700">{state.message}</span>
          <a
            href={state.platformUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-green-800 underline"
          >
            {state.platformName}
          </a>
        </div>
      )}

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
    </div>
  );
}
