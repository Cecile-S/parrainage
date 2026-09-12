import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/activites", label: "Activités" },
  { href: "/admin/programmes", label: "Programmes" },
  { href: "/admin/plateformes-avis", label: "Plateformes d'avis" },
  { href: "/admin/kit-partage", label: "Kit de partage" },
  { href: "/admin/parrainages", label: "Parrainages" },
  { href: "/admin/avis", label: "Avis" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <nav className="flex shrink-0 flex-row flex-wrap gap-1 md:w-48 md:flex-col">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
