"use client";

import { useState } from "react";
import { btnGold } from "@/components/ui";

/**
 * Saves the report as a PDF through the browser's own print pipeline.
 *
 * This used to rasterise the sheets with html2canvas, which produced a picture
 * of the report rather than a document: half a megabyte a page, no text to
 * search or select, and — because html2canvas lays text out itself and sets it
 * lower than the browser does — grades sitting outside their seals and
 * signatures with their descenders shaved off. Printing to PDF is the same
 * engine that draws the sheet on screen, so the file is real text at the
 * printer's resolution and is exactly what comes off the printer.
 *
 * The browser offers the document title as the filename, so it is swapped for
 * the learner's name while the dialog is open and put back afterwards.
 */
export function PdfDownloadButton({
  filename,
  label = "Save as PDF",
}: {
  filename: string;
  label?: string;
}) {
  const [note, setNote] = useState("");

  function save() {
    const suggested = filename.replace(/\.pdf$/i, "");
    const previous = document.title;

    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      document.title = previous;
      window.removeEventListener("afterprint", restore);
    };

    document.title = suggested;
    window.addEventListener("afterprint", restore);
    // afterprint does not fire everywhere, and the title must not be left
    // holding a learner's name on the page afterwards.
    window.setTimeout(restore, 60000);

    setNote("In the dialog, set Destination to “Save as PDF”.");
    window.print();
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button type="button" onClick={save} className={btnGold}>
        {label}
      </button>
      {note ? <p className="max-w-xs text-xs text-ink/60">{note}</p> : null}
    </div>
  );
}
