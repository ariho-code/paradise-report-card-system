"use client";

import { useState } from "react";
import { btnGold } from "@/components/ui";

export function PdfDownloadButton({
  filename,
  label = "Download PDF",
}: {
  filename: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function download() {
    setBusy(true);
    setNote("");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const sheets = Array.from(document.querySelectorAll<HTMLElement>(".print-sheet"));
      if (sheets.length === 0) {
        setNote("No report to download.");
        return;
      }

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < sheets.length; i += 1) {
        const restore = unscaleForCapture(sheets[i]);
        let canvas: HTMLCanvasElement;
        try {
          canvas = await html2canvas(sheets[i], {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            onclone(_doc, el) {
              el.style.background = "#ffffff";
              el.style.maxHeight = "none";

              // html2canvas sets text a few pixels lower than the browser
              // does, so anything whose box ends exactly at its last line got
              // its descenders shaved off: the signature names, which clip
              // their own overflow, and the footer, which sits flush against
              // the bottom of the fitting window. Neither needs to clip during
              // a capture — the sheet's own padding is empty below them.
              const frame = el.querySelector<HTMLElement>(".print-fit");
              if (frame) frame.style.overflow = "visible";

              // Same drop, but the grade seals cannot absorb it: the letter
              // ends up sitting on the bottom edge of its own box. Their
              // vertical padding is moved entirely below the glyph, which
              // lifts it by that much without changing the box.
              el.querySelectorAll<HTMLElement>(".grade-seal").forEach((seal) => {
                const style = getComputedStyle(seal);
                const top = parseFloat(style.paddingTop);
                const bottom = parseFloat(style.paddingBottom);
                seal.style.paddingTop = "0px";
                seal.style.paddingBottom = `${top + bottom}px`;
              });
              el.querySelectorAll<HTMLElement>("*").forEach((node) => {
                if (getComputedStyle(node).overflow === "hidden" && node !== el) {
                  node.style.overflow = "visible";
                }
              });
              el.querySelectorAll<HTMLElement>("*").forEach((node) => {
                const style = window.getComputedStyle(node);
                if (style.color) node.style.color = rgbOf(style.color);
                if (style.backgroundColor && style.backgroundColor !== "rgba(0, 0, 0, 0)") {
                  node.style.backgroundColor = rgbOf(style.backgroundColor);
                }
                if (style.borderColor) node.style.borderColor = rgbOf(style.borderColor);
              });
            },
          });
        } finally {
          restore();
        }
        const img = canvas.toDataURL("image/jpeg", 0.95);
        const margin = 6;
        const usableW = pageW - margin * 2;
        const usableH = pageH - margin * 2;
        const ratio = Math.min(usableW / canvas.width, usableH / canvas.height);
        const w = canvas.width * ratio;
        const h = canvas.height * ratio;
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", (pageW - w) / 2, margin, w, h);
      }
      pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not build the PDF.";
      setNote(`${message} You can still use Print → Save as PDF.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button type="button" onClick={download} disabled={busy} className={btnGold}>
        {busy ? "Preparing PDF…" : label}
      </button>
      {note ? <p className="max-w-xs text-xs text-blush">{note}</p> : null}
    </div>
  );
}

/**
 * Lays a sheet out at its natural size for the duration of one capture.
 *
 * A report that does not fit the page is scaled down with a CSS transform.
 * html2canvas takes its text metrics from the live document rather than from
 * the clone it hands to onclone, and it cannot read positions through a
 * transform: every glyph landed low in its box, so grades sat half outside
 * their seals, and the foot of the sheet was sliced through the signatures.
 *
 * Removing the transform alone would overflow the page, so the sheet and its
 * padding grow by exactly the factor the transform was shrinking them. That is
 * the same layout at a larger size, and the finished raster is scaled back
 * down onto the page, which is what the transform was doing anyway.
 *
 * Returns the undo, which the caller must run.
 */
function unscaleForCapture(sheet: HTMLElement) {
  const content = sheet.querySelector<HTMLElement>(".print-fit-content");
  const inner = sheet.querySelector<HTMLElement>(".print-inner");
  if (!content || !inner) return () => {};

  const scale = parseFloat(getComputedStyle(content).getPropertyValue("--fit-scale")) || 1;
  if (!(scale < 1)) return () => {};

  const box = sheet.getBoundingClientRect();
  const pad = getComputedStyle(inner);
  const before = {
    width: sheet.style.width,
    height: sheet.style.height,
    maxWidth: sheet.style.maxWidth,
    padding: inner.style.padding,
    transform: content.style.transform,
    contentWidth: content.style.width,
    minHeight: content.style.minHeight,
  };

  sheet.style.maxWidth = "none";
  sheet.style.width = `${box.width / scale}px`;
  sheet.style.height = `${box.height / scale}px`;
  inner.style.padding = [pad.paddingTop, pad.paddingRight, pad.paddingBottom, pad.paddingLeft]
    .map((value) => `${parseFloat(value) / scale}px`)
    .join(" ");
  // The content already lays itself out at 1/scale of the frame, so with the
  // frame now that much bigger it needs no transform at all. --fit-scale is
  // left alone: the signature spaces divide by it and have to grow to match.
  content.style.transform = "none";
  content.style.width = "100%";
  content.style.minHeight = "100%";
  return () => {
    sheet.style.width = before.width;
    sheet.style.height = before.height;
    sheet.style.maxWidth = before.maxWidth;
    inner.style.padding = before.padding;
    content.style.transform = before.transform;
    content.style.width = before.contentWidth;
    content.style.minHeight = before.minHeight;
  };
}

function rgbOf(value: string) {
  if (!value || value.includes("oklch") || value.includes("lab") || value.includes("lch") || value.includes("color(")) {
    return "#111111";
  }
  return value;
}
