# Verify — don't trust, measure

`assets/verify_grid.js` renders the page and asserts four things. Zero dependencies: it drives your local Helium (or Chrome) directly over the DevTools Protocol using Node's built-in `WebSocket`. No npm install, works offline, and it measures with your real installed fonts.

```bash
node assets/verify_grid.js index.html --widths=1440,1180,900
node assets/verify_grid.js index.html --screenshot=/tmp/shots     # + PNG per width
node assets/verify_grid.js https://example.com/page --browser=chrome
```

Browser resolution: `--browser=<name|path>` → `$GRID_BROWSER` → `$CHROME` → first found of Helium, Chrome, Chromium, Edge. Known names are `helium`, `chrome`, `chromium`, `edge`. The browser used is printed on the first line so it is never ambiguous which engine and font stack produced the numbers. A throwaway profile is used, and the launch flags suppress the default-browser and Keychain prompts.

**Run at widths that straddle `--maxw`.** 1440 / 1180 / 900 against a 1296px max-width catches the centered-container drift; a single width will not.

## The four checks

**1. Column adherence.** Every placed `.band > *` element's left edge snaps to a column **start** line and its right edge to a column **end** line, ~0px.

- Elements outside a `.band` are not measured at all. If you position something by hand, it is unverified.
- **Excludes** the optically-aligned display elements — their boxes are *deliberately* offset by the glyph side-bearing, so a box check on them would report a false failure. They are validated by check 4 instead.
- **Gotcha that makes it correct:** build *both* the column-start set and the column-end set. A grid item spanning "to line N" ends at the **far** side of the gutter, so single-edge math falsely reports a one-gutter error on every element.

**2. Overlay match.** Each `.guides .col` rect equals the computed column rect, ~0px. This is what proves the overlay *is* the content grid rather than a picture of one.

**3. Baseline.** Text element tops, modulo the baseline unit, ~0. Tolerance is half a baseline, because the border-box top is only a proxy — the leading does the real work. Measured per spread, relative to that spread's `.rows` top.

**4. Optical ink.** Each display element's visible ink-left (`box − actualBoundingBoxLeft`, measured in the loaded font) equals **its own** column line — the nearest column-start to its box, not always line 1, since a headline can begin on any column.

## Reading the output

A clean run:

```
       browser: helium (/Applications/Helium.app/Contents/MacOS/Helium)
[PASS] vw=1440  col=0px overlay=0px baseline=0px ink=0.01px  (worstCol=null, worstInk=masthead "K", font=Helvetica Neue)
GRID VERIFY: PASS
```

Exit codes: `0` all widths passed, `1` a check failed, `2` harness error (no browser, bad path, page threw).

**A vacuous pass is worse than a failure.** If a check found nothing to measure, the harness prints:

```
       ⚠ nothing measured for: no elements matched OPT (.masthead, .numeral, …) — sync this list with the page
```

Read that line. `ink=0px` with nothing measured is not a pass; it means `OPT_SELECTOR` in the harness has drifted from `sel` in the page's alignment JS.

**Check `font=`** before trusting `ink=`. If it reports a fallback rather than your intended grotesque, the side-bearing measurement is against the wrong metrics and the number is meaningless — see `engineering.md` §2.6.

## What each failure looks like

These are the actual diagnostics from deliberately breaking a passing fixture — worth knowing by sight:

| Injected bug | Reported |
|---|---|
| Overlay moved out to be a sibling of `.wrap` | `overlay=72px` at vw=1440, **`overlay=0px` at vw=900** — the drift only exists above `--maxw` |
| Optical nudge removed | `ink=7.73px`, `worstInk=masthead "K"` |
| An element given `margin-left:11px` | `col=11px`, `worstCol=lede` |

`worstCol` and `worstInk` name the offending element, so a failure points straight at the fix.

## Then look at it

Numbers are necessary, not sufficient. Take a screenshot per viewport and read the PNG back with the image-capable Read tool, zoomed on the **top-left corner** — masthead against body text against the first column line. That single crop is the fastest human check for whether the page reads as being on a grid, and it catches things no assertion covers.
