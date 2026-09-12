"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TemplateFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function createTemplate(
  _prevState: TemplateFormState,
  formData: FormData,
): Promise<TemplateFormState> {
  const activityId = String(formData.get("activity_id") ?? "").trim();
  const channel = String(formData.get("channel") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!activityId || !channel || !label || !content) {
    return { status: "error", message: "Tous les champs sont obligatoires." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("share_templates").insert({
    activity_id: activityId,
    channel,
    label,
    content,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/kit-partage");
  return { status: "success" };
}

export async function toggleTemplateActive(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("share_templates").update({ active }).eq("id", id);
  revalidatePath("/admin/kit-partage");
}
