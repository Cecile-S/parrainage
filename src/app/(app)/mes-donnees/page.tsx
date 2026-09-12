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
          <p className="text-neutral-500">
            À implémenter en P0 : export JSON/CSV du profil, des parrainages
            et des consentements liés à ce compte.
          </p>
        </div>
        <div className="rounded-md border border-neutral-200 p-4">
          <p className="font-medium">Supprimer mon compte</p>
          <p className="text-neutral-500">
            À implémenter en P0 : suppression du profil et anonymisation des
            parrainages liés, avec purge des filleuls non convertis au-delà
            du délai défini.
          </p>
        </div>
        <div className="rounded-md border border-neutral-200 p-4">
          <p className="font-medium">Politique de confidentialité</p>
          <p className="text-neutral-500">À rédiger avant le lancement.</p>
        </div>
      </div>
    </div>
  );
}
