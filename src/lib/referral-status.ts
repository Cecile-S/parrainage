export const REFERRAL_STATUSES = [
  "en_attente",
  "consentement_obtenu",
  "en_cours",
  "conclu",
  "refuse",
] as const;

export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  en_attente: "En attente de consentement",
  consentement_obtenu: "Consentement obtenu",
  en_cours: "En cours",
  conclu: "Conclu",
  refuse: "Refusé",
};
