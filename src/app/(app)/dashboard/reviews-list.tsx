"use client";

import { useTransition } from "react";
import { confirmReviewLeft } from "./actions";

type Review = {
  id: string;
  platform: string | null;
  status: string;
  created_at: string;
};

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  const [isPending, startTransition] = useTransition();

  if (reviews.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-neutral-500">Mes avis</p>
      <ul className="flex flex-col gap-2">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-md border border-neutral-200 px-4 py-3 text-sm"
          >
            <span>{r.platform}</span>
            {r.status === "confirmee" ? (
              <span className="text-green-600">Avis confirmé</span>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => confirmReviewLeft(r.id))
                }
                className="text-xs font-medium text-neutral-900 underline disabled:opacity-50"
              >
                J&apos;ai laissé mon avis
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
