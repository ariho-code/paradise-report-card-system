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
        const canvas = await html2canvas(sheets[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          onclone(_doc, el) {
            el.style.background = "#ffffff";
            el.style.maxHeight = "none";
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

function rgbOf(value: string) {
  if (!value || value.includes("oklch") || value.includes("lab") || value.includes("lch") || value.includes("color(")) {
    return "#111111";
  }
  return value;
}
