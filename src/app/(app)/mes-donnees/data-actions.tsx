"use client";

import { useState, useTransition } from "react";
import { exportMyData, deleteMyAccount } from "./actions";

export function ExportButton() {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const data = await exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mes-donnees-parrainage.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isPending}
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
    >
      {isPending ? "Export..." : "Télécharger mes données (JSON)"}
    </button>
  );
}

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700"
      >
        Supprimer mon compte
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-red-700">
        Confirmer la suppression ? Cette action est irréversible.
      </span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => deleteMyAccount())}
        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
      >
        {isPending ? "..." : "Oui, supprimer"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs text-neutral-500"
      >
        Annuler
      </button>
    </div>
  );
}
