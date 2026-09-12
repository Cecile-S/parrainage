import { createClient } from "@/lib/supabase/server";
import { ReferralRow } from "./referral-row";

export default async function AdminReferralsPage() {
  const supabase = await createClient();
  const [{ data: referrals }, { data: programs }] = await Promise.all([
    supabase
      .from("referrals")
      .select(
        "id, referee_name, status, created_at, activity_id, activities(name), profiles(email), referee_consents(consented_at), rewards(id, type, amount, payment_status)",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("programs")
      .select("activity_id, reward_rules")
      .eq("active", true),
  ]);

  const defaultAmountByActivity = new Map<string, number>();
  for (const p of programs ?? []) {
    const rules = p.reward_rules as { cash_amount?: number } | null;
    if (!defaultAmountByActivity.has(p.activity_id)) {
      defaultAmountByActivity.set(p.activity_id, rules?.cash_amount ?? 0);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Parrainages</h1>
        <p className="text-sm text-neutral-500">
          Tous les parrainages déclarés, toutes activités et tous
          ambassadeurs confondus. Marque un parrainage &quot;Conclu&quot;
          pour déclencher la création de sa récompense.
        </p>
      </div>

      {!referrals || referrals.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucun parrainage pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                <th className="py-2 pr-4">Filleul</th>
                <th className="py-2 pr-4">Ambassadeur</th>
                <th className="py-2 pr-4">Activité</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Consentement</th>
                <th className="py-2 pr-4">Récompense</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => {
                const activity = r.activities as unknown as { name: string } | null;
                const ambassador = r.profiles as unknown as { email: string } | null;
                const consent = (
                  r.referee_consents as unknown as { consented_at: string | null }[]
                )?.[0];
                const reward = (
                  r.rewards as unknown as {
                    id: string;
                    type: string;
                    amount: number | null;
                    payment_status: string;
                  }[]
                )?.[0];
                return (
                  <ReferralRow
                    key={r.id}
                    referral={{
                      id: r.id,
                      referee_name: r.referee_name,
                      status: r.status,
                      activityName: activity?.name ?? "",
                      ambassadorEmail: ambassador?.email ?? "",
                      consentedAt: consent?.consented_at ?? null,
                      createdAt: r.created_at,
                    }}
                    reward={reward ?? null}
                    defaultAmount={defaultAmountByActivity.get(r.activity_id) ?? 0}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
