"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateReferralStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase
    .from("referrals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/parrainages");
}

export async function createReward(
  referralId: string,
  type: string,
  amount: number,
) {
  const supabase = await createClient();
  await supabase.from("rewards").insert({
    referral_id: referralId,
    type,
    amount,
    payment_status: "en_attente",
  });
  revalidatePath("/admin/parrainages");
}

export async function markRewardPaid(rewardId: string) {
  const supabase = await createClient();
  await supabase
    .from("rewards")
    .update({ payment_status: "paye", paid_at: new Date().toISOString() })
    .eq("id", rewardId);
  revalidatePath("/admin/parrainages");
}
