"use client";

import { useEffect } from "react";
import { fitReportSheets } from "@/lib/fit-report";

/** Covers arriving from a <Link>, where the inline script never executes. */
export function FitReportsOnNavigate() {
  useEffect(() => {
    fitReportSheets();
  }, []);
  return null;
}
