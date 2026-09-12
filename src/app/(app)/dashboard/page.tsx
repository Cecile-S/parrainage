import { createClient } from "@/lib/supabase/server";
import { DeclareReferralForm } from "./declare-referral-form";
import { RequestReviewForm } from "./request-review-form";
import { ShareKit } from "./share-kit";
import { ReviewsList } from "./reviews-list";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente de consentement",
  consentement_obtenu: "Consentement obtenu",
  en_cours: "En cours",
  conclu: "Conclu",
  refuse: "Refusé",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: referrals },
    { data: activities },
    { data: reviews },
    { data: templates },
  ] = await Promise.all([
    supabase
      .from("referrals")
      .select("id, referee_name, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("activities").select("id, name").order("name"),
    supabase
      .from("reviews")
      .select("id, platform, status, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("share_templates")
      .select("id, channel, label, content, activities(name)")
      .eq("active", true),
  ]);

  const ambassadorName = user?.email?.split("@")[0] ?? "moi";
  const shareTemplates = (templates ?? []).map((t) => ({
    id: t.id as string,
    channel: t.channel as string,
    label: t.label as string,
    content: t.content as string,
    activityName:
      (t.activities as unknown as { name: string } | null)?.name ?? "",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Bonjour {user?.email}</h1>
        <p className="text-sm text-neutral-500">
          Voici tes parrainages et tes avis en cours.
        </p>
      </div>

      <DeclareReferralForm activities={activities ?? []} />

      {!referrals || referrals.length === 0 ? (
        <div className="rounded-md border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          Aucun parrainage pour le moment. Déclare ton premier filleul
          ci-dessus.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {referrals.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-md border border-neutral-200 px-4 py-3 text-sm"
            >
              <span>{r.referee_name}</span>
              <span className="text-neutral-500">
                {STATUS_LABELS[r.status] ?? r.status}
              </span>
            </li>
          ))}
        </ul>
      )}

      <RequestReviewForm activities={activities ?? []} />
      <ReviewsList reviews={reviews ?? []} />
      <ShareKit templates={shareTemplates} ambassadorName={ambassadorName} />
    </div>
  );
}
