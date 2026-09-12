import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Squelette : activités disponibles pour l'utilisateur connecté.
  // Un "ambassadeur" multi-activités verra ici Capifrance / Moonee / etc.
  const [{ data: activities }, { data: profile }] = await Promise.all([
    supabase.from("activities").select("id, name, slug"),
    supabase.from("profiles").select("role").eq("id", user.id).single(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold">Parrainage</span>
          <nav className="flex gap-4 text-sm text-neutral-500">
            <Link href="/dashboard" className="hover:text-neutral-900">
              Tableau de bord
            </Link>
            <Link href="/mes-donnees" className="hover:text-neutral-900">
              Mes données
            </Link>
            {profile?.role === "admin" && (
              <Link href="/admin" className="hover:text-neutral-900">
                Administration
              </Link>
            )}
          </nav>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-900">
            Déconnexion
          </button>
        </form>
      </header>

      {activities && activities.length > 1 && (
        <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-2 text-sm text-neutral-500">
          Activités : {activities.map((a) => a.name).join(" · ")}
        </div>
      )}

      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
