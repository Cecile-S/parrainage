export default function ConfidentialitePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12 text-sm leading-relaxed text-neutral-700">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">
          Politique de confidentialité
        </h1>
        <p className="mt-1 text-xs text-neutral-500">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-neutral-900">1. Qui traite vos données</h2>
        <p>
          Cécile Sow, responsable du traitement, pour le programme de
          parrainage lié à ses activités (Capifrance, Moonee). Contact :{" "}
          <a href="mailto:cecile@cecilesow.fr" className="underline">
            cecile@cecilesow.fr
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-neutral-900">
          2. Quelles données sont collectées
        </h2>
        <ul className="list-disc pl-5">
          <li>
            <strong>Ambassadeur</strong> : email, téléphone (optionnel),
            historique de connexion.
          </li>
          <li>
            <strong>Filleul</strong> : nom, email et/ou téléphone transmis par
            l&apos;ambassadeur, preuve de consentement (date, heure, canal,
            texte accepté, adresse IP).
          </li>
          <li>
            <strong>Avis</strong> : plateforme choisie, statut de la demande.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-neutral-900">
          3. Pourquoi ces données sont traitées
        </h2>
        <ul className="list-disc pl-5">
          <li>
            Gestion du programme de parrainage et des récompenses associées
            (base légale : exécution du contrat / intérêt légitime).
          </li>
          <li>
            Mise en relation commerciale avec un filleul — uniquement après
            son <strong>consentement explicite, préalable et horodaté</strong>{" "}
            (base légale : consentement, conformément à la loi n° 2025-594 du
            11 août 2026 sur le démarchage téléphonique).
          </li>
          <li>Collecte d&apos;avis clients (base légale : intérêt légitime).</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-neutral-900">
          4. Durée de conservation
        </h2>
        <p>
          Les données d&apos;un filleul n&apos;ayant pas consenti ou n&apos;ayant pas
          abouti à une mise en relation sont supprimées au bout de 12 mois.
          Les données liées à un parrainage conclu sont conservées pour la
          durée nécessaire aux obligations comptables et légales.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-neutral-900">5. Vos droits</h2>
        <p>
          Droit d&apos;accès, de rectification, d&apos;effacement et de portabilité.
          Les ambassadeurs peuvent exporter ou supprimer leurs données
          directement depuis{" "}
          <a href="/mes-donnees" className="underline">
            leur espace &quot;Mes données&quot;
          </a>
          . Un filleul souhaitant exercer ses droits peut écrire à{" "}
          <a href="mailto:cecile@cecilesow.fr" className="underline">
            cecile@cecilesow.fr
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-neutral-900">
          6. Sous-traitants et hébergement
        </h2>
        <ul className="list-disc pl-5">
          <li>Supabase (Irlande/UE) : base de données et authentification.</li>
          <li>
            O2switch (France) : hébergement de l&apos;application et envoi des
            emails.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium text-neutral-900">7. Cookies</h2>
        <p>
          Cette application utilise uniquement des cookies strictement
          nécessaires à la connexion (session). Aucun cookie de mesure
          d&apos;audience ou de publicité n&apos;est utilisé.
        </p>
      </section>

      <p className="mt-4 text-xs text-neutral-400">
        Ce document est un modèle de base à faire valider par un professionnel
        du droit avant mise en production réelle.
      </p>
    </main>
  );
}
