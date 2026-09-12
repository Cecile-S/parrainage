"use client";

import { useActionState } from "react";
import { createReviewRequest, type CreateRequestState } from "./actions";

const initialState: CreateRequestState = { status: "idle" };

type Ambassador = { id: string; email: string };
type Activity = { id: string; name: string };

function mailtoRequest(email: string, platformName: string, platformUrl: string) {
  const subject = "Un petit avis, ça compte énormément !";
  const body = `Bonjour,\n\nSi tu as 2 minutes, ça m'aiderait beaucoup que tu laisses un avis sur ${platformName} :\n${platformUrl}\n\nMerci !`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function NewRequestForm({
  ambassadors,
  activities,
}: {
  ambassadors: Ambassador[];
  activities: Activity[];
}) {
  const [state, formAction, pending] = useActionState(
    createReviewRequest,
    initialState,
  );

  return (
    <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4">
      <p className="text-sm font-medium">Demander un avis à un ambassadeur</p>
      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <select
          name="ambassador_id"
          required
          defaultValue=""
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        >
          <option value="" disabled>
            Ambassadeur...
          </option>
          {ambassadors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.email}
            </option>
          ))}
        </select>
        <select
          name="activity_id"
          required
          defaultValue=""
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        >
          <option value="" disabled>
            Activité...
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
          {pending ? "..." : "Créer la demande"}
        </button>
      </form>

      {state.status === "success" && state.platformUrl && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm">
          <span className="text-green-700">
            Demande créée ({state.platformName}).
          </span>
          <a
            href={mailtoRequest(
              state.ambassadorEmail!,
              state.platformName!,
              state.platformUrl,
            )}
            className="font-medium text-green-800 underline"
          >
            Envoyer l&apos;email maintenant
          </a>
        </div>
      )}

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
    </div>
  );
}
