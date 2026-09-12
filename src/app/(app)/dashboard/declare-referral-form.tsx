"use client";

import { useActionState, useState } from "react";
import { declareReferral, type DeclareReferralState } from "./actions";

const initialState: DeclareReferralState = { status: "idle" };

type Activity = { id: string; name: string };

export function DeclareReferralForm({ activities }: { activities: Activity[] }) {
  const [state, formAction, pending] = useActionState(
    declareReferral,
    initialState,
  );
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const consentUrl =
    state.status === "success" && state.referralId
      ? `${window.location.origin}/consentement/${state.referralId}`
      : null;

  const message = consentUrl
    ? `Bonjour ${state.refereeName ?? ""}, pour te mettre en relation j'ai besoin de ton accord — c'est rapide : ${consentUrl}`
    : "";

  function copyLink() {
    if (!consentUrl) return;
    navigator.clipboard.writeText(consentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open && state.status !== "success") {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        Déclarer un filleul
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4">
      {state.status === "success" && consentUrl ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-green-600">{state.message}</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={consentUrl}
              className="flex-1 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-600"
            />
            <button
              type="button"
              onClick={copyLink}
              className="rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white"
            >
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {state.refereeEmail && (
              <a
                href={`mailto:${encodeURIComponent(state.refereeEmail)}?subject=${encodeURIComponent("Petite question avant de te mettre en relation")}&body=${encodeURIComponent(message)}`}
                className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
              >
                Envoyer par email
              </a>
            )}
            {state.refereePhone && (
              <a
                href={`sms:${encodeURIComponent(state.refereePhone)}?&body=${encodeURIComponent(message)}`}
                className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
              >
                Envoyer par SMS
              </a>
            )}
          </div>

          <p className="text-xs text-neutral-500">
            Ces boutons ouvrent ton appli email/SMS avec le message déjà
            rempli. Ton filleul doit confirmer son accord avant toute mise en
            relation commerciale.
          </p>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              window.location.reload();
            }}
            className="self-start text-xs text-neutral-500 underline"
          >
            Déclarer un autre filleul
          </button>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="referee_name" className="text-xs text-neutral-500">
              Nom du filleul
            </label>
            <input
              id="referee_name"
              name="referee_name"
              required
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="referee_email" className="text-xs text-neutral-500">
              Email du filleul
            </label>
            <input
              id="referee_email"
              name="referee_email"
              type="email"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="referee_phone" className="text-xs text-neutral-500">
              Téléphone du filleul
            </label>
            <input
              id="referee_phone"
              name="referee_phone"
              type="tel"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="activity_id" className="text-xs text-neutral-500">
              Activité
            </label>
            <select
              id="activity_id"
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

          {state.status === "error" && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? "Envoi..." : "Déclarer"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-4 py-2 text-sm text-neutral-500"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
