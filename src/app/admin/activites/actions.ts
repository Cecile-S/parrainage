"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActivityFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createActivity(
  _prevState: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { status: "error", message: "Le nom est obligatoire." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .insert({ name, slug: slugify(name) });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/activites");
  return { status: "success" };
}
