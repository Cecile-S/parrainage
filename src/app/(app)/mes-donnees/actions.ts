"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function exportMyData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: referrals },
    { data: reviews },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("referrals")
      .select("*, referee_consents(*)")
      .eq("referrer_id", user.id),
    supabase.from("reviews").select("*").eq("ambassador_id", user.id),
  ]);

  return {
    exported_at: new Date().toISOString(),
    profile,
    referrals,
    reviews,
  };
}

export async function deleteMyAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({
      email: `compte-supprime-${user.id}@anonyme.local`,
      phone: null,
    })
    .eq("id", user.id);

  await supabase.auth.signOut();
  redirect("/login");
}
