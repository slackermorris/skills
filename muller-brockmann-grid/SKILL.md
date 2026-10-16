---
name: muller-brockmann-grid
description: >
  Build editorial, magazine, report, or longform webpages on a genuine
  Müller-Brockmann modular grid (International Typographic Style) — columns and
  modules on a baseline, grotesque type, flush-left, white/black/one-red — and
  make the grid load-bearing rather than decorative: one CSS-variable source of
  truth, a toggleable overlay that shares the content box, subgrid bands so
  every element snaps to a column line, an 8px baseline lock, and runtime
  optical alignment so display type's ink sits on the line. Ships a scaffold
  generator and a zero-dependency verification harness that proves 0px
  adherence. Use whenever the user asks for a magazine spread, editorial layout,
  Swiss or International Typographic Style design, a grid system, a grid overlay
  toggle, or wants everything aligned to the grid. Also the reference for two
  recurring failure modes: a grid overlay that looks "slapped on top" or
  misaligned, and large display type that looks off-grid even though its box is
  on-grid.
metadata:
  last-used: "YYYY-MM-DD"
---

# Müller-Brockmann Grid Systems — real, visible, verified

Josef Müller-Brockmann (1914–1996), Zurich; *Grid Systems in Graphic Design* (1981) is the corpus. The grid is an ethic, not decoration:

> "The grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to his personal style. But one must learn how to use the grid; it is an art that requires practice."

This skill carries the discipline **and** the front-end engineering that makes a grid genuinely load-bearing on the web — which is the part most attempts get wrong — plus a harness that proves it.

## The two failure modes this skill exists to prevent

Both are real review notes. Everything else here is in service of not hearing them again.

1. **"The grid is just slapped on top and misaligned."** The overlay was not in the same content box as the content. See `references/engineering.md` §2.2 — it is the single most common bug, and it only appears at viewports wider than `--maxw`, which is why verification runs at several widths.
2. **"The H in the headline is off the grid."** The headline's *box* was on the grid but its *ink* was not; large glyphs carry a left side-bearing. See §2.6. **Box-on-grid ≠ ink-on-grid.**

## Workflow

1. **Decide the system before drawing.** Read `references/discipline.md`: field count, margins, gutters, baseline, type, palette. A 12-column grid on an 8px baseline is a solid general default; a 6×6 or 4×8 field grid when you want visible rows.
2. **Generate the scaffold.**
   ```bash
   python3 assets/grid_tokens.py --scaffold > index.html
   # tune: --cols --baseline --gutter --margin --maxw --accent
   # publishing under a strict CSP? add --self-hosted-fonts
   ```
   It warns if gutter or margin are not baseline multiples. Pure stdlib, no network.
3. **Build the spreads.** Read `references/engineering.md` and follow it literally — bands with `grid-template-columns:subgrid`, children placed by column *line*, every spacing value and line-height a baseline multiple, media heights multiples of the leading. The overlay and toggle are already wired to the same `:root` variables.
4. **Point the optical-alignment selector list at your real display elements.** It appears in **two** places that must agree: `sel` in the page's alignment JS, and `OPT_SELECTOR` in `assets/verify_grid.js`. If they drift apart, check 4 measures nothing and passes vacuously — the harness prints a `⚠ nothing measured for:` line when that happens, so read it.
5. **Verify.** Read `references/verify.md`, then:
   ```bash
   node assets/verify_grid.js index.html --widths=1440,1180,900
   ```
   Zero dependencies — it drives your local Helium (or Chrome) over the DevTools Protocol. Widths must straddle `--maxw`. Add `--screenshot=<dir>` and read the PNG back with the image-capable Read tool to eyeball a top-left crop of masthead vs body vs column line: the fastest human check there is.
6. **Fix and re-verify** until every width reports `col=0px overlay=0px baseline≤4px ink=0px` → `GRID VERIFY: PASS`.

## Craft, not just alignment

An aligned page can still be ugly. `references/discipline.md` carries the defaults that make it good: white paper, near-black ink, one accent (Swiss red `#e4002b`), a real grotesque plus a mono for folios and captions, hierarchy through scale and white space rather than colour, key data set as large numerals. Never warm-cream, never blue/purple gradients.

**Incorrect:** A page with a 12-column overlay drawn as a full-width sibling of a centered `max-width` wrapper, elements positioned with eyeballed percentage widths, unitless `line-height:1.1` on a 112px masthead, and no verification run. It looks plausible at one viewport and falls apart at another — `verify_grid.js` reports `overlay=72px` at 1440 while passing at 900, which is the drift made visible.

**Correct:** Every parameter in `:root`; the overlay inside the same `.wrap`, reading the same variables; each element placed `grid-column:1 / 7` on a subgrid band; the masthead at `font-size:112px; line-height:96px` (12 baselines) with its ink nudged onto the column line at runtime; `G` toggles the grid you actually built. `node assets/verify_grid.js index.html --widths=1440,1180,900` prints PASS at all three. Remove the optical nudge and it immediately reports `ink=7.73px` on the masthead's `K` — proof the check is live rather than decorative.

## Reference files

Read each when you reach the step that needs it; don't pre-load everything.

- `references/discipline.md` — the design system: modular grid, baseline rhythm, grotesque type, flush-left, palette, white space and asymmetry, plus the craft defaults.
- `references/engineering.md` — §2.1–2.6, the load-bearing CSS/JS: one source of truth, the overlay-in-the-same-box fix, subgrid bands, the baseline lock, the toggle, and runtime optical alignment.
- `references/verify.md` — the four checks, their tolerances, the two gotchas that make them correct, and how to read a failure.

## Creed

A grid you can't toggle on and measure is a mood board, not a system. Build it from one source of truth, prove it at 0px, and align the **ink**.
