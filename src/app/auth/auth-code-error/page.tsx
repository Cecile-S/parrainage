export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-xl font-semibold">Lien invalide ou expiré</h1>
      <p className="text-sm text-neutral-500">
        Redemande un lien de connexion depuis la page de connexion.
      </p>
      <a href="/login" className="text-sm font-medium underline">
        Retour à la connexion
      </a>
    </main>
  );
}
