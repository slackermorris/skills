# Making the grid real on the web

`assets/grid_tokens.py` emits this entire scaffold correctly. What follows is *why* it is built this way — read it before hand-editing any of it, because every rule here exists to prevent a specific observed failure.

## 2.1 One source of truth

Every grid parameter lives in `:root` CSS variables:

```css
:root{
  --cols:12;
  --bl:8px;        /* baseline unit */
  --lh:24px;       /* leading = 3 x baseline */
  --gutter:24px;
  --margin:72px;
  --maxw:1296px;
}
```

**Content and overlay both read these same variables.** Never hand-author the overlay's geometry separately — it will drift the moment either side changes, and the drift is invisible at the width you happened to be looking at.

## 2.2 The overlay MUST live in the same content box as the content ← the #1 bug

**Failure mode.** Content sits in a centered `max-width` container while the overlay is a **full-width sibling** of the section. At any viewport wider than `--maxw`, the centered content and the full-width overlay no longer share column positions. The review note is "the grid is just slapped on top and misaligned," and it is correct.

This bug is invisible below `--maxw`. Measured on the test fixture: an overlay moved out to be a sibling of `.wrap` reports `overlay=72px` at 1440px — and `overlay=0px` at 900px. Verify at several widths or you will ship it.

**Fix.** Put `.guides` *inside* the same `.wrap` as the content, and draw the column guides from the same variables:

```css
.guides{position:absolute;inset:0;pointer-events:none;z-index:60;opacity:0;transition:opacity .26s ease;}
body.grid-on .guides{opacity:1;}
.guides .cols{position:absolute;top:0;bottom:0;left:var(--margin);right:var(--margin);
  display:grid;grid-template-columns:repeat(var(--cols),1fr);column-gap:var(--gutter);}
```

Now the overlay columns *are* the content columns, at every width, by construction. Add margin lines at `var(--margin)` left and right.

## 2.3 Place every element by column line, via subgrid bands

Don't eyeball spans and don't use percentage widths. Each horizontal **band** spans all columns and re-exposes them:

```css
.band{grid-column:1 / -1;display:grid;grid-template-columns:subgrid;
  column-gap:var(--gutter);align-items:start;}
@supports not (grid-template-columns:subgrid){
  .band{grid-template-columns:repeat(var(--cols),1fr);}
}
```

Children then place by line number:

```html
<div class="band">
  <p class="lede"  style="grid-column:1 / 7;">…</p>
  <p class="body"  style="grid-column:7 / 10;">…</p>
  <p class="numeral" style="grid-column:10 / 13;">32</p>
</div>
```

Every headline, paragraph, photo, and caption now snaps to identical lines with no arithmetic on your part. This is also what makes check 1 in `verify.md` meaningful — it measures `.band > *`, so anything placed outside a band is unverified.

## 2.4 Lock vertical rhythm to the baseline

- Leading is `--lh` (24px = 3 × 8).
- **Every line-height a multiple of the baseline, in px — never unitless — for display type.** A unitless `line-height:1.1` on a 112px masthead produces a 123.2px box and pushes everything after it off the grid. Use `line-height:96px`.
- Every margin and padding a multiple of the baseline. Spread top/bottom padding too, so content *starts* on a line.
- **Media heights are multiples of the leading** (240 / 360 / 432 / 480px) so a photo's top *and* bottom both land on lines.
- Hairline rules sit inside a baseline-height band rather than floating free.

## 2.5 The toggle

A button plus the `G` key toggles `body.grid-on`; the overlay fades 0→1. The overlay draws translucent **numbered column fields**, the **baseline** (a major line every `--lh`, a faint minor line every `--bl`), and the **margin lines**.

Showing the real grid the page is built on *is* the demo. It is only impressive because it is the same grid — which is the whole point of §2.1 and §2.2.

## 2.6 Optical alignment — display ink, not its box ← the subtle bug

A 112px headline whose layout box sits exactly on line 1 still *looks* misaligned against the body text beneath it, because the letterform's **ink** is inset by its **left side-bearing**. The box is on the grid; the visible letter is not.

Cure it at runtime, measuring the actually-loaded font:

```js
// after document.fonts.ready, and again on resize:
var cvs=document.createElement('canvas'),ctx=cvs.getContext('2d');
document.querySelectorAll('.masthead,.numeral,.shead h2,.h2b').forEach(function(el){
  el.style.marginLeft='0px';
  var cs=getComputedStyle(el),ch=(el.textContent||'').trim()[0]; if(!ch) return;
  if(cs.textTransform==='uppercase') ch=ch.toUpperCase();
  ctx.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily; ctx.textAlign='left';
  var abl=ctx.measureText(ch).actualBoundingBoxLeft;      // +ve = ink overhangs left of box
  if(isFinite(abl)) el.style.marginLeft=abl.toFixed(2)+'px';  // shift box so INK lands on the line
});
```

Apply it to the masthead, large numerals, and section headlines. It scales with fluid type because it re-runs on resize, and it is correct in the user's browser because it measures the font that actually loaded.

The magnitude is not negligible: on the test fixture, removing the nudge moves the masthead's `K` **7.73px** off its column line at 112px in Helvetica Neue. That is visible.

**Two constraints that follow from this being font-specific:**

1. **The selector list appears twice.** `sel` in the page's JS and `OPT_SELECTOR` in `assets/verify_grid.js` must name the same elements. If the harness's list matches nothing, check 4 passes vacuously — it prints `⚠ nothing measured for: no elements matched OPT (…)`, so read that line rather than the PASS.
2. **Measure with the right font or don't bother.** Side-bearing differs per typeface, so a page whose webfont failed to load is nudged by a fallback grotesque's metrics (measured −16px on a fallback vs −7px on real Inter for the same `H`). Two situations bite: an offline `file://` page, and a page under a strict CSP that blocks the font CDN. In both, embed the real font as an `@font-face` `data:` URI first — `grid_tokens.py --self-hosted-fonts` emits the stubs. The harness prints which font it measured; check it before trusting `ink=`.
