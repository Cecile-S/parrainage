import { createClient } from "@/lib/supabase/server";
import { NewPlatformForm } from "./new-platform-form";
import { PlatformRow } from "./platform-row";

export default async function AdminReviewPlatformsPage() {
  const supabase = await createClient();
  const [{ data: activities }, { data: platforms }] = await Promise.all([
    supabase.from("activities").select("id, name").order("name"),
    supabase
      .from("review_platforms")
      .select("id, activity_id, name, url, weight, active")
      .order("weight", { ascending: false }),
  ]);

  const byActivity = (activities ?? []).map((activity) => {
    const items = (platforms ?? []).filter(
      (p) => p.activity_id === activity.id,
    );
    const totalWeight = items
      .filter((p) => p.active)
      .reduce((sum, p) => sum + p.weight, 0);
    return { activity, items, totalWeight };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Plateformes d&apos;avis</h1>
        <p className="text-sm text-neutral-500">
          Le poids détermine la fréquence relative à laquelle chaque
          plateforme est proposée aux ambassadeurs. Une plateforme de poids 5
          est proposée ~5x plus souvent qu&apos;une plateforme de poids 1.
        </p>
      </div>

      <NewPlatformForm activities={activities ?? []} />

      {byActivity.map(({ activity, items, totalWeight }) => (
        <div key={activity.id} className="flex flex-col gap-2">
          <p className="text-sm font-medium">{activity.name}</p>
          {items.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Aucune plateforme configurée.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((p) => (
                <PlatformRow
                  key={p.id}
                  platform={p}
                  sharePercent={
                    p.active && totalWeight > 0
                      ? Math.round((p.weight / totalWeight) * 100)
                      : 0
                  }
                />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
