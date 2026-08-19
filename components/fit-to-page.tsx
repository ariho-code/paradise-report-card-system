"use client";

import { useEffect, useRef } from "react";

/**
 * Keeps a whole report on one A4 sheet.
 *
 * The sheet is a fixed 297mm box, so anything that does not fit used to be
 * clipped away silently — subject rows simply vanished off the bottom. This
 * wrapper measures the laid-out content against the space available and, only
 * when it genuinely overflows, scales it down by the smallest amount that makes
 * it fit. A report that already fits is left at 1 and is untouched.
 *
 * The scale is published as --fit-scale so individual blocks can opt out of the
 * shrinking: the signature spaces divide by it to keep their real-world size.
 */

const MIN_SCALE = 0.66;
const STEPS = 8;
const TOLERANCE = 0.5;

export function FitToPage({ children }: { children: React.ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;

    const apply = (scale: number) => {
      content.style.setProperty("--fit-scale", String(scale));
    };

    // scrollHeight is reported in the content's own unscaled units, so the
    // height it will actually occupy on the page is that times the scale.
    const fits = (scale: number) => content.scrollHeight * scale <= frame.clientHeight + TOLERANCE;

    const measure = () => {
      apply(1);
      if (fits(1)) return;

      // Narrowing the scale also widens the content box, which changes how the
      // remarks wrap, so each candidate has to be measured rather than solved.
      let lo = MIN_SCALE;
      let hi = 1;
      for (let i = 0; i < STEPS; i += 1) {
        const mid = (lo + hi) / 2;
        apply(mid);
        if (fits(mid)) lo = mid;
        else hi = mid;
      }
      apply(Math.floor(lo * 1000) / 1000);
    };

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();
    // Web fonts change every metric on the sheet, so re-fit once they land.
    document.fonts?.ready.then(schedule).catch(() => {});
    window.addEventListener("resize", schedule);
    window.addEventListener("beforeprint", measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("beforeprint", measure);
    };
  }, [children]);

  return (
    <div className="print-inner">
      <div className="print-fit" ref={frameRef}>
        <div className="print-fit-content" ref={contentRef} style={{ "--fit-scale": 1 } as React.CSSProperties}>
          {children}
        </div>
      </div>
    </div>
  );
}
