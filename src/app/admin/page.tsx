import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: referralsCount },
    { count: consentedCount },
    { count: reviewsCount },
    { count: confirmedReviewsCount },
    { data: activities },
  ] = await Promise.all([
    supabase.from("referrals").select("id", { count: "exact", head: true }),
    supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .neq("status", "en_attente"),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmee"),
    supabase.from("activities").select("id, name"),
  ]);

  const stats = [
    { label: "Parrainages déclarés", value: referralsCount ?? 0 },
    { label: "Consentements obtenus", value: consentedCount ?? 0 },
    { label: "Demandes d'avis", value: reviewsCount ?? 0 },
    { label: "Avis confirmés", value: confirmedReviewsCount ?? 0 },
    { label: "Activités", value: activities?.length ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Vue d&apos;ensemble</h1>
        <p className="text-sm text-neutral-500">
          Toutes activités confondues.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-md border border-neutral-200 p-4"
          >
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
