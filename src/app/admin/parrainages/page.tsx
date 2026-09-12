import { createClient } from "@/lib/supabase/server";
import { ReferralKanban } from "./referral-kanban";

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

  const defaultAmountByActivityId: Record<string, number> = {};
  for (const p of programs ?? []) {
    const rules = p.reward_rules as { cash_amount?: number } | null;
    if (!(p.activity_id in defaultAmountByActivityId)) {
      defaultAmountByActivityId[p.activity_id] = rules?.cash_amount ?? 0;
    }
  }

  const rewardByReferral: Record<
    string,
    { id: string; amount: number | null; payment_status: string } | undefined
  > = {};
  const items = (referrals ?? []).map((r) => {
    const activity = r.activities as unknown as { name: string } | null;
    const ambassador = r.profiles as unknown as { email: string } | null;
    const consent = (
      r.referee_consents as unknown as { consented_at: string | null }[]
    )?.[0];
    const reward = (
      r.rewards as unknown as
        | { id: string; amount: number | null; payment_status: string }[]
        | null
    )?.[0];
    rewardByReferral[r.id] = reward;
    return {
      id: r.id,
      referee_name: r.referee_name,
      status: r.status,
      activityId: r.activity_id,
      activityName: activity?.name ?? "",
      ambassadorEmail: ambassador?.email ?? "",
      consentedAt: consent?.consented_at ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Parrainages</h1>
        <p className="text-sm text-neutral-500">
          Glisse une carte pour changer son statut. Toutes activités et tous
          ambassadeurs confondus.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucun parrainage pour le moment.</p>
      ) : (
        <ReferralKanban
          referrals={items}
          rewardByReferral={rewardByReferral}
          defaultAmountByActivityId={defaultAmountByActivityId}
        />
      )}
    </div>
  );
}
