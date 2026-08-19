import { FitReportsOnNavigate } from "@/components/fit-reports-client";
import { fitReportSheets } from "@/lib/fit-report";

/**
 * Fits every sheet on the page. Render once, after the sheets themselves.
 *
 * The inline script covers direct visits and refreshes: the browser runs it
 * while parsing, so the reports are sized before anything is painted and long
 * before React hydrates a class of them. It is inert on client-side
 * navigation, where nothing re-executes an injected <script>, so the client
 * component covers arriving here from a <Link>. Both call the same function.
 */
export function FitReports() {
  return (
    <>
      <script
        // text/plain on the client keeps React from re-running it, and from
        // warning about rendered <script> tags in development.
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: `(${fitReportSheets.toString()})()` }}
      />
      <FitReportsOnNavigate />
    </>
  );
}
