import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "Demandé",
  confirmee: "Confirmé",
};

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, platform, status, created_at, confirmed_at, activities(name), profiles(email)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Avis</h1>
        <p className="text-sm text-neutral-500">
          Toutes les demandes d&apos;avis, toutes plateformes et tous
          ambassadeurs confondus.
        </p>
      </div>

      {!reviews || reviews.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune demande d&apos;avis pour le moment.</p>
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
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => {
                const activity = r.activities as unknown as { name: string } | null;
                const ambassador = r.profiles as unknown as { email: string } | null;
                return (
                  <tr key={r.id} className="border-b border-neutral-100">
                    <td className="py-2 pr-4">{r.platform}</td>
                    <td className="py-2 pr-4 text-neutral-500">
                      {ambassador?.email}
                    </td>
                    <td className="py-2 pr-4">{activity?.name}</td>
                    <td className="py-2 pr-4">
                      {STATUS_LABELS[r.status] ?? r.status}
                    </td>
                    <td className="py-2 pr-4 text-neutral-500">
                      {new Date(r.created_at).toLocaleDateString("fr-FR")}
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
