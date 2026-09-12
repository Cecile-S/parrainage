"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DeclareReferralState = {
  status: "idle" | "success" | "error";
  message?: string;
  referralId?: string;
};

export async function declareReferral(
  _prevState: DeclareReferralState,
  formData: FormData,
): Promise<DeclareReferralState> {
  const refereeName = String(formData.get("referee_name") ?? "").trim();
  const refereeEmail = String(formData.get("referee_email") ?? "").trim();
  const refereePhone = String(formData.get("referee_phone") ?? "").trim();
  const activityId = String(formData.get("activity_id") ?? "").trim();

  if (!refereeName || !activityId) {
    return {
      status: "error",
      message: "Le nom du filleul et l'activité sont obligatoires.",
    };
  }

  if (!refereeEmail && !refereePhone) {
    return {
      status: "error",
      message: "Renseigne au moins un email ou un téléphone pour le filleul.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Session expirée, reconnecte-toi." };
  }

  const { data: referral, error: referralError } = await supabase
    .from("referrals")
    .insert({
      referrer_id: user.id,
      activity_id: activityId,
      referee_name: refereeName,
      referee_email: refereeEmail || null,
      referee_phone: refereePhone || null,
    })
    .select("id")
    .single();

  if (referralError || !referral) {
    return {
      status: "error",
      message: referralError?.message ?? "Impossible de créer le parrainage.",
    };
  }

  const { error: consentError } = await supabase.from("referee_consents").insert({
    referral_id: referral.id,
    channel: refereeEmail ? "email" : "sms",
  });

  if (consentError) {
    return { status: "error", message: consentError.message };
  }

  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Filleul déclaré. Partage-lui le lien de consentement ci-dessous.",
    referralId: referral.id,
  };
}
