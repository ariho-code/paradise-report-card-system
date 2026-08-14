"use client";

import { btnPrimary } from "@/components/ui";

export function PrintButton({ label = "Print report" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={btnPrimary}>
      {label}
    </button>
  );
}
