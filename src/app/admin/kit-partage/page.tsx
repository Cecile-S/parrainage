import { createClient } from "@/lib/supabase/server";
import { NewTemplateForm } from "./new-template-form";
import { TemplateRow } from "./template-row";

export default async function AdminShareKitPage() {
  const supabase = await createClient();
  const [{ data: activities }, { data: templates }] = await Promise.all([
    supabase.from("activities").select("id, name").order("name"),
    supabase
      .from("share_templates")
      .select("id, activity_id, channel, label, content, active")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Kit de partage réseaux sociaux</h1>
        <p className="text-sm text-neutral-500">
          Ces messages sont proposés aux ambassadeurs pour les aider à
          recruter des filleuls via les réseaux sociaux (inspiré de Boast).
        </p>
      </div>

      <NewTemplateForm activities={activities ?? []} />

      {(activities ?? []).map((activity) => {
        const items = (templates ?? []).filter(
          (t) => t.activity_id === activity.id,
        );
        if (items.length === 0) return null;
        return (
          <div key={activity.id} className="flex flex-col gap-2">
            <p className="text-sm font-medium">{activity.name}</p>
            <ul className="flex flex-col gap-2">
              {items.map((t) => (
                <TemplateRow key={t.id} template={t} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
