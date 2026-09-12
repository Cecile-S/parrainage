"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { CONSENT_TEXT } from "./consent-text";

export type ConsentState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function confirmConsent(
  referralId: string,
  _prevState: ConsentState,
  formData: FormData,
): Promise<ConsentState> {
  const agreed = formData.get("agree") === "on";

  if (!agreed) {
    return {
      status: "error",
      message: "Merci de cocher la case pour confirmer ton accord.",
    };
  }

  const supabase = await createClient();
  const headerList = await headers();

  const { data, error } = await supabase.rpc("confirm_referee_consent", {
    p_referral_id: referralId,
    p_channel: "email",
    p_accepted_text: CONSENT_TEXT,
    p_proof: {
      user_agent: headerList.get("user-agent") ?? "",
      ip: headerList.get("x-forwarded-for") ?? "",
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  if (!data) {
    return {
      status: "error",
      message: "Ce lien a déjà été utilisé ou n'est plus valide.",
    };
  }

  return { status: "success", message: "Merci, ton accord a bien été enregistré !" };
}
