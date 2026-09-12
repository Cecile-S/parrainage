import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, referee_name, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Bonjour {user?.email}</h1>
        <p className="text-sm text-neutral-500">
          Voici tes parrainages en cours.
        </p>
      </div>

      {!referrals || referrals.length === 0 ? (
        <div className="rounded-md border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          Aucun parrainage pour le moment. Le formulaire de déclaration d&apos;un
          filleul (avec recueil de consentement) arrive en P0.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {referrals.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-md border border-neutral-200 px-4 py-3 text-sm"
            >
              <span>{r.referee_name}</span>
              <span className="text-neutral-500">{r.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
