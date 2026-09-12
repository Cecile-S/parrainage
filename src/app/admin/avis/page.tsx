import { createClient } from "@/lib/supabase/server";
import { NewRequestForm } from "./new-request-form";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "Demandé",
  confirmee: "Confirmé",
};

function daysSince(date: string) {
  const ms = Date.now() - new Date(date).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function relanceMailto(email: string, platformName: string, platformUrl: string) {
  const subject = "Petit rappel — ton avis compte pour nous !";
  const body = `Bonjour,\n\nJuste un petit rappel : si tu as un instant, ton avis sur ${platformName} m'aiderait beaucoup :\n${platformUrl}\n\nMerci encore !`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const [{ data: reviews }, { data: ambassadors }, { data: activities }] =
    await Promise.all([
      supabase
        .from("reviews")
        .select(
          "id, platform, status, created_at, confirmed_at, activities(name), profiles(email), review_platforms(url)",
        )
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, email").order("email"),
      supabase.from("activities").select("id, name").order("name"),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Avis</h1>
        <p className="text-sm text-neutral-500">
          Toutes les demandes d&apos;avis, toutes plateformes et tous
          ambassadeurs confondus.
        </p>
      </div>

      <NewRequestForm
        ambassadors={ambassadors ?? []}
        activities={activities ?? []}
      />

      {!reviews || reviews.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aucune demande d&apos;avis pour le moment.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                <th className="py-2 pr-4">Plateforme</th>
                <th className="py-2 pr-4">Ambassadeur</th>
                <th className="py-2 pr-4">Activité</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Demandé le</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => {
                const activity = r.activities as unknown as { name: string } | null;
                const ambassador = r.profiles as unknown as { email: string } | null;
                const platformUrl = (
                  r.review_platforms as unknown as { url: string } | null
                )?.url;
                const pending = r.status === "en_attente";
                const days = daysSince(r.created_at);
                return (
                  <tr key={r.id} className="border-b border-neutral-100">
                    <td className="py-2 pr-4">{r.platform}</td>
                    <td className="py-2 pr-4 text-neutral-500">
                      {ambassador?.email}
                    </td>
                    <td className="py-2 pr-4">{activity?.name}</td>
                    <td className="py-2 pr-4">
                      {STATUS_LABELS[r.status] ?? r.status}
                      {pending && days >= 3 && (
                        <span className="ml-2 text-xs text-orange-600">
                          {days}j sans réponse
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-neutral-500">
                      {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-2 pr-4">
                      {pending && platformUrl && ambassador?.email && (
                        <a
                          href={relanceMailto(
                            ambassador.email,
                            r.platform ?? "",
                            platformUrl,
                          )}
                          className="text-xs font-medium text-neutral-900 underline"
                        >
                          Relancer
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
