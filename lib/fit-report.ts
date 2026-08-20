/**
 * Scales each report sheet down until it fits the page it is printed on.
 *
 * This runs from an inline <script> as well as from React, so it must stay
 * SELF-CONTAINED: no imports, no references to anything outside its own body.
 * Its source is stringified into the page, and a function that closed over
 * module scope would throw once inlined.
 *
 * Why it is inlined at all: the print routes render one sheet per learner, and
 * a full class takes seconds to hydrate. Waiting for React meant every sheet
 * sat overflowing until then, and anything printed inside that window came out
 * cropped. Parsing the page is enough to fit it.
 */
export function fitReportSheets() {
  // A legibility floor, not a fitting floor. The summary sheet is set at 13px
  // so that it prints at 9.75pt, and 0.85 of that is 8.3pt — about as small as
  // a mark on a page can get and still be read across a desk. The old floor of
  // 0.56 took the sheet down to 4.4pt, which is what the school printed and
  // could not read. Anything that will not fit by 0.85 belongs on a second
  // sheet rather than shrunk, which is what the commentary page is for.
  var MIN_SCALE = 0.85;
  var STEPS = 8;
  // A margin, not a slack allowance: sub-pixel layout rounding means a scale
  // accepted at exactly the frame height can still paint a fraction over it.
  var SAFETY_PX = 1;

  function fitOne(frame: HTMLElement) {
    var content = frame.firstElementChild as HTMLElement | null;
    if (!content) return;

    function apply(scale: number) {
      content!.style.setProperty("--fit-scale", String(scale));
    }

    // The content box is stretched to the frame by a min-height, so its own
    // scrollHeight can never report less than the frame is tall. Drop that
    // floor while measuring to learn what the blocks actually need; measuring
    // through it would only ever say "exactly full".
    function naturalHeight() {
      content!.style.minHeight = "0";
      var height = content!.scrollHeight;
      content!.style.minHeight = "";
      return height;
    }

    // Narrowing the scale widens the content box, which changes how the
    // remarks wrap, so each candidate is applied and measured rather than
    // solved for. scrollHeight is in unscaled units; the height it occupies
    // on the page is that times the scale.
    function fits(scale: number) {
      apply(scale);
      return naturalHeight() * scale <= frame.clientHeight - SAFETY_PX;
    }

    if (fits(1)) return;

    var lo = MIN_SCALE;
    var hi = 1;
    for (var i = 0; i < STEPS; i += 1) {
      var mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
    apply(Math.floor(lo * 1000) / 1000);
  }

  function fitAll() {
    var frames = document.querySelectorAll(".print-fit");
    for (var i = 0; i < frames.length; i += 1) fitOne(frames[i] as HTMLElement);
  }

  // Both entry points call this, and a page carries several sheets, so the
  // listeners are bound once for the document rather than once per caller.
  var scope = window as unknown as { __fitReportsBound?: boolean };
  if (!scope.__fitReportsBound) {
    scope.__fitReportsBound = true;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        fitAll();
      });
    }
    // Web fonts change every metric on the sheet, so re-fit once they land.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        fitAll();
      });
    }
    window.addEventListener("resize", function () {
      fitAll();
    });
    window.addEventListener("beforeprint", function () {
      fitAll();
    });
  }

  fitAll();
}
