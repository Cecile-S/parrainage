"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SendMagicLinkState = {
  status: "idle" | "success" | "error";
  message?: string;
  email?: string;
};

export async function sendMagicLink(
  _prevState: SendMagicLinkState,
  formData: FormData,
): Promise<SendMagicLinkState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { status: "error", message: "Merci de renseigner un email." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return {
    status: "success",
    message: "Code envoyé ! Vérifie ta boîte mail (et les spams).",
    email,
  };
}

export type VerifyCodeState = {
  status: "idle" | "error";
  message?: string;
};

export async function verifyCode(
  _prevState: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!email || !code) {
    return { status: "error", message: "Merci de renseigner le code reçu par email." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (error) {
    return { status: "error", message: "Code invalide ou expiré. Redemande un code." };
  }

  redirect("/dashboard");
}
