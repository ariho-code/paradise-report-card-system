"use client";

import { useEffect } from "react";

export function Modal({
  title,
  kicker,
  children,
  onClose,
  wide,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-ink/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`modal-sheet relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-navy/20 bg-vellum shadow-[0_30px_80px_rgba(22,50,92,0.28)] sm:mx-4 sm:rounded-3xl ${
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <div className="relative flex items-start gap-3 border-b border-rule px-5 py-4">
          <img src="/logo.jpg" alt="" className="h-12 w-12 rounded-full object-contain" />
          <div className="min-w-0 flex-1">
            {kicker ? (
              <p className="text-[10px] uppercase tracking-[0.22em] text-brass">{kicker}</p>
            ) : null}
            <h2 id="modal-title" className="font-[family-name:var(--font-display)] text-2xl text-navy">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-rule px-3 py-2 text-sm font-semibold text-navy"
          >
            Close
          </button>
        </div>
        <div className="relative px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
