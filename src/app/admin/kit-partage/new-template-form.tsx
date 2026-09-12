"use client";

import { useActionState, useRef, useEffect } from "react";
import { createTemplate, type TemplateFormState } from "./actions";

const initialState: TemplateFormState = { status: "idle" };

type Activity = { id: string; name: string };

const CHANNELS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram_story", label: "Instagram (story)" },
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];

export function NewTemplateForm({ activities }: { activities: Activity[] }) {
  const [state, formAction, pending] = useActionState(
    createTemplate,
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
      className="flex flex-col gap-2 rounded-md border border-neutral-200 p-4"
    >
      <div className="flex flex-wrap gap-2">
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
        <select
          name="channel"
          required
          defaultValue=""
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        >
          <option value="" disabled>
            Canal...
          </option>
          {CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          name="label"
          required
          placeholder="Nom du template (ex: Post de rentrée)"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      </div>
      <textarea
        name="content"
        required
        rows={3}
        placeholder="Texte du message... utilise {ambassadeur} et {activite} comme variables"
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "..." : "Ajouter le template"}
        </button>
        {state.status === "error" && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}
      </div>
    </form>
  );
}
