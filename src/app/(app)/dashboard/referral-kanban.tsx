import {
  REFERRAL_STATUSES,
  REFERRAL_STATUS_LABELS,
  type ReferralStatus,
} from "@/lib/referral-status";

type Referral = {
  id: string;
  referee_name: string;
  status: string;
  reward?: { amount: number | null; payment_status: string } | null;
};

export function ReferralKanban({ referrals }: { referrals: Referral[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 overflow-x-auto sm:grid-cols-2 lg:grid-cols-5">
      {REFERRAL_STATUSES.map((status) => {
        const items = referrals.filter((r) => r.status === status);
        return (
          <div key={status} className="flex flex-col gap-2">
            <p className="text-xs font-medium text-neutral-500">
              {REFERRAL_STATUS_LABELS[status as ReferralStatus]}{" "}
              <span className="text-neutral-400">({items.length})</span>
            </p>
            <div className="flex flex-col gap-2">
              {items.map((r) => (
                <div
                  key={r.id}
                  className="rounded-md border border-neutral-200 bg-white p-3 text-sm shadow-sm"
                >
                  <p className="font-medium">{r.referee_name}</p>
                  {r.reward && (
                    <p
                      className={
                        r.reward.payment_status === "paye"
                          ? "mt-1 text-xs text-green-600"
                          : "mt-1 text-xs text-orange-600"
                      }
                    >
                      {r.reward.amount} € —{" "}
                      {r.reward.payment_status === "paye" ? "payé" : "à venir"}
                    </p>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <div className="rounded-md border border-dashed border-neutral-200 p-3 text-center text-xs text-neutral-400">
                  Vide
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
