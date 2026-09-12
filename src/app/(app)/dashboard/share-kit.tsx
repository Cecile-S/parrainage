"use client";

import { useState } from "react";

type Template = {
  id: string;
  activityName: string;
  channel: string;
  label: string;
  content: string;
};

const CHANNEL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram_story: "Instagram",
  sms: "SMS",
  whatsapp: "WhatsApp",
  email: "Email",
};

export function ShareKit({
  templates,
  ambassadorName,
}: {
  templates: Template[];
  ambassadorName: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (templates.length === 0) return null;

  function copy(id: string, content: string) {
    const personalized = content
      .replaceAll("{ambassadeur}", ambassadorName)
      .replaceAll("{activite}", "");
    navigator.clipboard.writeText(personalized);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const byActivity = templates.reduce<Record<string, Template[]>>((acc, t) => {
    (acc[t.activityName] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4">
      <div>
        <p className="text-sm font-medium">Kit de partage réseaux sociaux</p>
        <p className="text-xs text-neutral-500">
          Des messages prêts à l&apos;emploi pour parler du programme autour de
          toi. Personnalise-les avant de les poster.
        </p>
      </div>

      {Object.entries(byActivity).map(([activityName, items]) => (
        <div key={activityName} className="flex flex-col gap-2">
          <p className="text-xs font-medium text-neutral-500">
            {activityName}
          </p>
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-start justify-between gap-3 rounded-md bg-neutral-50 p-3 text-sm"
            >
              <div>
                <p className="text-xs font-medium text-neutral-500">
                  {CHANNEL_LABELS[t.channel] ?? t.channel} — {t.label}
                </p>
                <p className="mt-1 text-neutral-700">
                  {t.content
                    .replaceAll("{ambassadeur}", ambassadorName)
                    .replaceAll("{activite}", activityName)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copy(t.id, t.content)}
                className="shrink-0 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                {copiedId === t.id ? "Copié !" : "Copier"}
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
