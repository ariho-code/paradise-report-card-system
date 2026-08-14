"use client";

import { Modal } from "@/components/modal";
import { btnPrimary, btnSecondary, fieldClass } from "@/components/ui";
import type { SchoolClass } from "@/lib/types";

export function ClassModal({
  schoolClass,
  onClose,
}: {
  schoolClass?: SchoolClass | null;
  onClose: () => void;
}) {
  return (
    <Modal kicker="Classes" title={schoolClass ? "Edit class" : "Add class"} onClose={onClose}>
      <form action="/api/classes" method="post" className="space-y-4">
        {schoolClass ? <input type="hidden" name="id" value={schoolClass.id} /> : null}
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Class name</span>
          <input
            name="name"
            required
            autoFocus
            defaultValue={schoolClass?.name}
            placeholder="Grade 8"
            className={fieldClass}
          />
        </label>
        <p className="text-xs text-ink/55">
          Editing a class name also updates every student already in that class.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            {schoolClass ? "Save class" : "Add class"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
