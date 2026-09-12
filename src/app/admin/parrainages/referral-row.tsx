"use client";

import { useState, useTransition } from "react";
import { updateReferralStatus, createReward, markRewardPaid } from "./actions";

const STATUS_OPTIONS = [
  { value: "en_attente", label: "En attente de consentement" },
  { value: "consentement_obtenu", label: "Consentement obtenu" },
  { value: "en_cours", label: "En cours" },
  { value: "conclu", label: "Conclu" },
  { value: "refuse", label: "Refusé" },
];

type Reward = {
  id: string;
  type: string;
  amount: number | null;
  payment_status: string;
};

export function ReferralRow({
  referral,
  reward,
  defaultAmount,
}: {
  referral: {
    id: string;
    referee_name: string;
    status: string;
    activityName: string;
    ambassadorEmail: string;
    consentedAt: string | null;
    createdAt: string;
  };
  reward: Reward | null;
  defaultAmount: number;
}) {
  const [status, setStatus] = useState(referral.status);
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="border-b border-neutral-100 align-top">
      <td className="py-2 pr-4">{referral.referee_name}</td>
      <td className="py-2 pr-4 text-neutral-500">{referral.ambassadorEmail}</td>
      <td className="py-2 pr-4">{referral.activityName}</td>
      <td className="py-2 pr-4">
        <select
          value={status}
          disabled={isPending}
          onChange={(e) => {
            const next = e.target.value;
            setStatus(next);
            startTransition(() => updateReferralStatus(referral.id, next));
          }}
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-4 text-neutral-500">
        {referral.consentedAt
          ? new Date(referral.consentedAt).toLocaleDateString("fr-FR")
          : "—"}
      </td>
      <td className="py-2 pr-4">
        {status !== "conclu" ? (
          <span className="text-xs text-neutral-400">—</span>
        ) : reward ? (
          <div className="flex items-center gap-2 text-xs">
            <span>
              {reward.amount} € —{" "}
              {reward.payment_status === "paye" ? "Payé" : "À payer"}
            </span>
            {reward.payment_status !== "paye" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => markRewardPaid(reward.id))}
                className="rounded-md bg-green-50 px-2 py-1 font-medium text-green-700"
              >
                Marquer payé
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(() =>
                createReward(referral.id, "cash", defaultAmount),
              )
            }
            className="rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white"
          >
            Créer la récompense ({defaultAmount} €)
          </button>
        )}
      </td>
    </tr>
  );
}
