"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PlatformFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function createPlatform(
  _prevState: PlatformFormState,
  formData: FormData,
): Promise<PlatformFormState> {
  const activityId = String(formData.get("activity_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const weight = Number(formData.get("weight") ?? 1);

  if (!activityId || !name || !url) {
    return { status: "error", message: "Tous les champs sont obligatoires." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("review_platforms").insert({
    activity_id: activityId,
    name,
    url,
    weight: Number.isFinite(weight) && weight > 0 ? Math.round(weight) : 1,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/plateformes-avis");
  return { status: "success" };
}

export async function updatePlatformWeight(id: string, weight: number) {
  const supabase = await createClient();
  await supabase
    .from("review_platforms")
    .update({ weight: Math.max(1, Math.round(weight)) })
    .eq("id", id);
  revalidatePath("/admin/plateformes-avis");
}

export async function togglePlatformActive(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("review_platforms").update({ active }).eq("id", id);
  revalidatePath("/admin/plateformes-avis");
}
