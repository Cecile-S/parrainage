import { createClient } from "@/lib/supabase/server";
import { confirmConsent } from "./actions";
import { CONSENT_TEXT } from "./consent-text";
import { ConsentForm } from "./consent-form";

export default async function ConsentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("get_referral_for_consent", { p_referral_id: id })
    .maybeSingle<{ referee_name: string; already_consented: boolean }>();

  if (error || !data) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-semibold">Lien introuvable</h1>
        <p className="text-sm text-neutral-500">
          Ce lien de consentement n&apos;existe pas ou n&apos;est plus valide.
        </p>
      </main>
    );
  }

  const action = confirmConsent.bind(null, id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-xl font-semibold">Bonjour {data.referee_name}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Quelqu&apos;un vous a recommandé auprès de nous. Avant toute prise de
          contact, nous avons besoin de votre accord.
        </p>
      </div>

      {data.already_consented ? (
        <p className="rounded-md bg-neutral-50 p-4 text-sm text-neutral-600">
          Votre accord a déjà été enregistré, merci !
        </p>
      ) : (
        <ConsentForm action={action} consentText={CONSENT_TEXT} />
      )}
    </main>
  );
}
