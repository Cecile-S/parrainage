"use client";

import { useState, useTransition } from "react";
import {
  REFERRAL_STATUSES,
  REFERRAL_STATUS_LABELS,
  type ReferralStatus,
} from "@/lib/referral-status";
import { updateReferralStatus, createReward, markRewardPaid } from "./actions";

type Reward = {
  id: string;
  amount: number | null;
  payment_status: string;
};

type Referral = {
  id: string;
  referee_name: string;
  status: string;
  activityId: string;
  activityName: string;
  ambassadorEmail: string;
  consentedAt: string | null;
};

export function ReferralKanban({
  referrals,
  rewardByReferral,
  defaultAmountByActivityId,
}: {
  referrals: Referral[];
  rewardByReferral: Record<string, Reward | undefined>;
  defaultAmountByActivityId: Record<string, number>;
}) {
  const [items, setItems] = useState(referrals);
  const [dragId, setDragId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function moveTo(id: string, status: ReferralStatus) {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
    startTransition(() => updateReferralStatus(id, status));
  }

  return (
    <div className="grid grid-cols-1 gap-3 overflow-x-auto sm:grid-cols-2 lg:grid-cols-5">
      {REFERRAL_STATUSES.map((status) => {
        const columnItems = items.filter((r) => r.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) moveTo(dragId, status as ReferralStatus);
              setDragId(null);
            }}
            className="flex min-h-24 flex-col gap-2 rounded-md bg-neutral-50 p-2"
          >
            <p className="text-xs font-medium text-neutral-500">
              {REFERRAL_STATUS_LABELS[status as ReferralStatus]}{" "}
              <span className="text-neutral-400">({columnItems.length})</span>
            </p>
            <div className="flex flex-col gap-2">
              {columnItems.map((r) => {
                const reward = rewardByReferral[r.id];
                return (
                  <div
                    key={r.id}
                    draggable
                    onDragStart={() => setDragId(r.id)}
                    className="cursor-grab rounded-md border border-neutral-200 bg-white p-3 text-sm shadow-sm active:cursor-grabbing"
                  >
                    <p className="font-medium">{r.referee_name}</p>
                    <p className="text-xs text-neutral-500">
                      {r.ambassadorEmail}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {r.activityName}
                    </p>
                    {r.consentedAt && (
                      <p className="mt-1 text-xs text-neutral-400">
                        Consenti le{" "}
                        {new Date(r.consentedAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}

                    {status === "conclu" && (
                      <div className="mt-2 text-xs">
                        {reward ? (
                          <div className="flex items-center gap-2">
                            <span>
                              {reward.amount} € —{" "}
                              {reward.payment_status === "paye"
                                ? "Payé"
                                : "À payer"}
                            </span>
                            {reward.payment_status !== "paye" && (
                              <button
                                type="button"
                                onClick={() =>
                                  startTransition(() =>
                                    markRewardPaid(reward.id),
                                  )
                                }
                                className="rounded-md bg-green-50 px-2 py-1 font-medium text-green-700"
                              >
                                Marquer payé
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              startTransition(() =>
                                createReward(
                                  r.id,
                                  "cash",
                                  defaultAmountByActivityId[r.activityId] ?? 0,
                                ),
                              )
                            }
                            className="rounded-md bg-neutral-900 px-2 py-1 font-medium text-white"
                          >
                            Créer la récompense (
                            {defaultAmountByActivityId[r.activityId] ?? 0} €)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {columnItems.length === 0 && (
                <div className="rounded-md border border-dashed border-neutral-200 p-3 text-center text-xs text-neutral-400">
                  Glisser une carte ici
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
