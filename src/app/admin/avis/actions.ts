"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateRequestState = {
  status: "idle" | "success" | "error";
  message?: string;
  platformName?: string;
  platformUrl?: string;
  ambassadorEmail?: string;
};

export async function createReviewRequest(
  _prevState: CreateRequestState,
  formData: FormData,
): Promise<CreateRequestState> {
  const ambassadorId = String(formData.get("ambassador_id") ?? "").trim();
  const activityId = String(formData.get("activity_id") ?? "").trim();

  if (!ambassadorId || !activityId) {
    return { status: "error", message: "Choisis un ambassadeur et une activité." };
  }

  const supabase = await createClient();

  const { data: platformId, error: pickError } = await supabase.rpc(
    "pick_review_platform",
    { p_activity_id: activityId },
  );

  if (pickError || !platformId) {
    return {
      status: "error",
      message: "Aucune plateforme d'avis configurée pour cette activité.",
    };
  }

  const [{ data: platform }, { data: ambassador }] = await Promise.all([
    supabase.from("review_platforms").select("name, url").eq("id", platformId).single(),
    supabase.from("profiles").select("email").eq("id", ambassadorId).single(),
  ]);

  if (!platform || !ambassador) {
    return { status: "error", message: "Ambassadeur ou plateforme introuvable." };
  }

  const { error: insertError } = await supabase.from("reviews").insert({
    ambassador_id: ambassadorId,
    activity_id: activityId,
    platform_id: platformId,
    platform: platform.name,
    status: "en_attente",
  });

  if (insertError) {
    return { status: "error", message: insertError.message };
  }

  revalidatePath("/admin/avis");

  return {
    status: "success",
    platformName: platform.name,
    platformUrl: platform.url,
    ambassadorEmail: ambassador.email,
  };
}
