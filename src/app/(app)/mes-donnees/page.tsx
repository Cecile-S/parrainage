import { ExportButton, DeleteAccountButton } from "./data-actions";

export default function MesDonneesPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Mes données</h1>
        <p className="text-sm text-neutral-500">
          Conformément au RGPD, retrouve ici l&apos;accès, la rectification, la
          portabilité et l&apos;effacement de tes données.
        </p>
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <div className="rounded-md border border-neutral-200 p-4">
          <p className="font-medium">Exporter mes données</p>
          <p className="mb-3 text-neutral-500">
            Ton profil, tes parrainages et tes avis, au format JSON.
          </p>
          <ExportButton />
        </div>
        <div className="rounded-md border border-neutral-200 p-4">
          <p className="font-medium">Supprimer mon compte</p>
          <p className="mb-3 text-neutral-500">
            Anonymise immédiatement ton profil (email, téléphone) et te
            déconnecte. Les parrainages déjà en cours restent tracés pour
            les obligations comptables et légales, mais ne sont plus
            rattachés à ton identité.
          </p>
          <DeleteAccountButton />
        </div>
        <div className="rounded-md border border-neutral-200 p-4">
          <p className="font-medium">Politique de confidentialité</p>
          <p className="text-neutral-500">À rédiger avant le lancement.</p>
        </div>
      </div>
    </div>
  );
}
