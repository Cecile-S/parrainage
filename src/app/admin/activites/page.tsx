import { createClient } from "@/lib/supabase/server";
import { NewActivityForm } from "./new-activity-form";

export default async function AdminActivitiesPage() {
  const supabase = await createClient();
  const { data: activities } = await supabase
    .from("activities")
    .select("id, name, slug, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Activités</h1>
        <p className="text-sm text-neutral-500">
          Chaque activité (Capifrance, Moonee...) a son propre programme, ses
          plateformes d&apos;avis et son kit de partage.
        </p>
      </div>

      <NewActivityForm />

      <ul className="flex flex-col gap-2">
        {(activities ?? []).map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between rounded-md border border-neutral-200 px-4 py-3 text-sm"
          >
            <span className="font-medium">{a.name}</span>
            <span className="text-neutral-500">{a.slug}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
