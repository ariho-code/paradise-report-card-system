"use client";

import { useRouter } from "next/navigation";
import { fieldClass } from "@/components/ui";

export function ClassFilter({
  value,
  classes,
  year,
  term,
  basePath,
}: {
  value: string;
  classes: string[];
  year: string;
  term: string;
  basePath: string;
}) {
  const router = useRouter();

  return (
    <label className="block min-w-40 flex-1">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Class</span>
      <select
        className={fieldClass}
        value={value}
        onChange={(event) => {
          const next = new URLSearchParams({ year, term });
          if (event.target.value) next.set("class", event.target.value);
          router.push(`${basePath}?${next.toString()}`);
        }}
      >
        <option value="">All classes</option>
        {classes.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
