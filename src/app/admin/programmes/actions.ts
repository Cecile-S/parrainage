"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProgramFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function createProgram(
  _prevState: ProgramFormState,
  formData: FormData,
): Promise<ProgramFormState> {
  const activityId = String(formData.get("activity_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const cashAmount = Number(formData.get("cash_amount") ?? 0);

  if (!activityId || !name) {
    return { status: "error", message: "Tous les champs sont obligatoires." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("programs").insert({
    activity_id: activityId,
    name,
    reward_rules: { cash_amount: cashAmount, currency: "EUR" },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/programmes");
  return { status: "success" };
}

export async function toggleProgramActive(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("programs").update({ active }).eq("id", id);
  revalidatePath("/admin/programmes");
}
