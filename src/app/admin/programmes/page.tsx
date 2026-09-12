import { createClient } from "@/lib/supabase/server";
import { NewProgramForm } from "./new-program-form";
import { ProgramRow } from "./program-row";

export default async function AdminProgramsPage() {
  const supabase = await createClient();
  const [{ data: activities }, { data: programs }] = await Promise.all([
    supabase.from("activities").select("id, name").order("name"),
    supabase
      .from("programs")
      .select("id, activity_id, name, reward_rules, active")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Programmes</h1>
        <p className="text-sm text-neutral-500">
          Un programme par activité définit la récompense versée pour un
          parrainage conclu. Plusieurs programmes possibles par activité
          (multi-programme).
        </p>
      </div>

      <NewProgramForm activities={activities ?? []} />

      {(activities ?? []).map((activity) => {
        const items = (programs ?? []).filter(
          (p) => p.activity_id === activity.id,
        );
        if (items.length === 0) return null;
        return (
          <div key={activity.id} className="flex flex-col gap-2">
            <p className="text-sm font-medium">{activity.name}</p>
            <ul className="flex flex-col gap-2">
              {items.map((p) => (
                <ProgramRow key={p.id} program={p} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
