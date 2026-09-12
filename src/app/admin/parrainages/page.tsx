import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente de consentement",
  consentement_obtenu: "Consentement obtenu",
  en_cours: "En cours",
  conclu: "Conclu",
  refuse: "Refusé",
};

export default async function AdminReferralsPage() {
  const supabase = await createClient();
  const { data: referrals } = await supabase
    .from("referrals")
    .select(
      "id, referee_name, status, created_at, activities(name), profiles(email), referee_consents(consented_at)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Parrainages</h1>
        <p className="text-sm text-neutral-500">
          Tous les parrainages déclarés, toutes activités et tous
          ambassadeurs confondus.
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
                <th className="py-2 pr-4">Déclaré le</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => {
                const activity = r.activities as unknown as { name: string } | null;
                const ambassador = r.profiles as unknown as { email: string } | null;
                const consent = (
                  r.referee_consents as unknown as { consented_at: string | null }[]
                )?.[0];
                return (
                  <tr key={r.id} className="border-b border-neutral-100">
                    <td className="py-2 pr-4">{r.referee_name}</td>
                    <td className="py-2 pr-4 text-neutral-500">
                      {ambassador?.email}
                    </td>
                    <td className="py-2 pr-4">{activity?.name}</td>
                    <td className="py-2 pr-4">
                      {STATUS_LABELS[r.status] ?? r.status}
                    </td>
                    <td className="py-2 pr-4 text-neutral-500">
                      {consent?.consented_at
                        ? new Date(consent.consented_at).toLocaleDateString("fr-FR")
                        : "—"}
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
