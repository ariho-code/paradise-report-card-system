"use client";

import { Modal } from "@/components/modal";
import { btnPrimary, btnSecondary, fieldClass } from "@/components/ui";
import type { Subject } from "@/lib/types";

export function SubjectModal({
  subject,
  onClose,
}: {
  subject?: Subject | null;
  onClose: () => void;
}) {
  return (
    <Modal kicker="Curriculum" title={subject ? "Edit subject" : "Add subject"} onClose={onClose}>
      <form action="/api/subjects" method="post" className="space-y-4">
        {subject ? <input type="hidden" name="id" value={subject.id} /> : null}
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-brass">Subject name</span>
          <input
            name="name"
            required
            autoFocus
            defaultValue={subject?.name}
            placeholder="Mathematics"
            className={fieldClass}
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-rule bg-parchment px-3 py-2.5 text-sm">
          <input type="checkbox" name="compulsory" defaultChecked={subject?.compulsory ?? true} />
          Compulsory for every learner
        </label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            {subject ? "Save subject" : "Add subject"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
