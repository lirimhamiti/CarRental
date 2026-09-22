"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function RemoveUserButton({ id, dict }: { id: string; dict: Dictionary }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (!window.confirm(dict.users.removeConfirm)) return;
    setRemoving(true);
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={removing}
      className="text-xs font-medium uppercase tracking-wider text-red-500 transition hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
    >
      {dict.users.remove}
    </button>
  );
}
