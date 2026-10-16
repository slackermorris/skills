# The discipline — decide this before you draw anything

Part 1 of the corpus, plus the craft defaults that keep an aligned page from being a dull one. None of this is web-specific; it is the design system you are then obliged to build honestly.

## Objective order

The grid brings "constructive thought," legibility, and design that is "objective and functional." Restraint is the point. The system organises the page, not the designer's ego. If a decision can be made by the grid rather than by taste, let the grid make it.

## The modular grid

Divide the type area into a field of **modules** — columns *and* rows — separated by consistent **gutters**, inside defined **margins**. Text and images occupy whole modules; nothing floats between them.

- Müller-Brockmann's own specimens commonly use 8, 20, or 32 fields.
- For the web, **12 columns on an 8px baseline** is a robust general default.
- Use a **6×6 or 4×8 modular field grid** when you want the rows to be visible as modules too, not just as a rhythm.

Choose the field count *before* laying anything out. Retrofitting a grid onto a finished composition is what produces decorative grids.

## The baseline grid

Vertical rhythm is sacred. **Leading is a whole multiple of the baseline unit**, and every element snaps to a line. This is the mechanism — the only mechanism — that makes facing columns, images, and captions line up across a spread.

With an 8px baseline, a 24px leading (3 baselines) is the workhorse. Display type then takes 48, 96, 120px line-heights — always multiples, always in px.

## Typography

- A **grotesque sans**: Akzidenz-Grotesk or Helvetica historically; on the web Inter, Helvetica Now, or Archivo.
- **Flush-left, ragged-right.** No justification, no centring.
- **Few sizes, large jumps.** Hierarchy comes from big scale intervals, not from many small increments. Two or three sizes plus a display size beats seven.
- Objective, not expressive. The type reports; it does not perform.
- **Large numerals and data set big** is a signature move — a figure at 96px next to 16px body text does more hierarchical work than any amount of bolding.

## Palette

- Pure white paper, near-black ink, and **one accent — red is canonical** (`#e4002b`).
- Avoid warm-cream backgrounds.
- **Never blue/purple gradients.** Hard rule.
- Colour identifies and accents; it does not carry hierarchy. If you are reaching for a second accent to explain the page, the layout is not doing its job.

## White space and asymmetry

Generous margins are structural, not leftover. Compositions are **asymmetric**, held in tension by the grid — a headline on columns 1–9 against a numeral on 10–12 is more alive than anything centred, and it stays rigorous because both edges land on real column lines.

Empty modules are legitimate content. Leaving a module empty is a decision the grid supports; filling every module is how a modular grid becomes a table.

## Craft defaults

The details that separate "aligned" from "excellent":

| Axis | Default |
|---|---|
| Paper / ink / accent | `#ffffff` / `#111315` / `#e4002b` |
| Display + body | A real grotesque webfont — Inter, Helvetica Now, Archivo |
| Folios, captions, grid annotations | A mono — Space Mono, IBM Plex Mono. Reinforces the technical register |
| Non-Latin | Noto Sans JP and siblings |
| Hierarchy | Scale + weight + white space. Not colour |
| Key data | Large numerals |
| Kickers / labels | Mono, caps, wide letter-spacing |
| Spread model | Full-width sections, each with its own `.grid` + `.guides`, consistent margins, per-spread folios |

**Photography.** Ground real subjects in real photographs rather than placeholder blocks — a modular grid is at its best when it is holding actual images to real column lines. Two delivery constraints:

- A page you open locally can reference image files by relative path, and load fonts from a CDN, with nothing special to do.
- A page published as an **Artifact** runs under a strict CSP that blocks *every* external host. Images must be embedded as `data:` URIs and fonts self-hosted via `@font-face` (`grid_tokens.py --self-hosted-fonts` emits the stubs). An external `<img src>` or Google Fonts `<link>` is simply a broken image and a fallback font there.

**If you ever rasterise the artwork** — headless screenshot, SVG conversion, a reference image for generation — check which font actually rendered. A `Helvetica`/`Arial` CSS stack silently falls back on systems that have neither, and the result reads like Calibri rather than a grotesque. Embed the real TTF, or render somewhere you have verified the font exists. This is the same class of error as the optical-measurement caveat in `verify.md`: wrong font in, wrong result out.
