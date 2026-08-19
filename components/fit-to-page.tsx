/**
 * The fixed window a report has to fit inside.
 *
 * Deliberately a server component: the fitting itself is done by
 * fitReportSheets, which <FitReports /> both inlines into the page and runs
 * from React, so a sheet is sized without waiting for hydration.
 */
export function FitToPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="print-inner">
      <div className="print-fit">
        <div className="print-fit-content" style={{ "--fit-scale": 1 } as React.CSSProperties}>
          {children}
        </div>
      </div>
    </div>
  );
}
