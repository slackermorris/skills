#!/usr/bin/env node
/*
 * verify_grid.js — prove an editorial page actually sits on its grid.
 *
 * ZERO DEPENDENCIES. Drives your locally installed Chrome over the DevTools
 * Protocol using Node's built-in global WebSocket (Node >= 22). No puppeteer,
 * no playwright, no npm install, works offline.
 *
 * Asserts, at several viewport widths (including > and < the content
 * max-width, to catch the centered-container drift):
 *
 *   1. COLUMN ADHERENCE  — every placed `.band > *` element's left edge snaps
 *      to a column START line and its right edge to a column END line (~0px).
 *      NB: build BOTH the start-set and end-set of x-coords. A grid item that
 *      spans "to line N" ends at the FAR side of the gutter, so naive single
 *      edge math falsely reports a one-gutter (gutter-px) error.
 *   2. OVERLAY MATCH     — each `.guides .col` rect equals the computed column
 *      rect (~0px), i.e. the overlay really is the content grid.
 *   3. BASELINE          — text element tops, modulo the baseline unit, ~0.
 *   4. OPTICAL INK       — display elements' visible INK-left equals the column
 *      line (measure canvas actualBoundingBoxLeft with the LOADED font).
 *      CAVEAT: side-bearing is font-specific, so a page whose webfont did not
 *      load is measured against a fallback grotesque and the nudge is wrong
 *      (we have measured -16px on a fallback vs -7px on real Inter for the
 *      same `H`). If you verify a `file://` page offline, or a page under a
 *      strict CSP that blocks the font CDN, EMBED the real font via
 *      @font-face(data: URI) first. The reported `font=` tells you which font
 *      was actually in play — check it before trusting `ink=`.
 *
 * Usage:
 *   node verify_grid.js <file-or-url> [--widths=1440,1180,900] [--baseline=8]
 *                                     [--screenshot=<dir>] [--browser=helium]
 *   A bare path is accepted and converted to a file:// URL.
 *
 * Browser: any Chromium-based browser works (it is all CDP). Resolution order is
 *   --browser=<name|path>  →  $GRID_BROWSER  →  $CHROME  →  first found of
 *   Helium, Chrome, Chromium, Edge. Known names: helium, chrome, chromium, edge.
 *   The browser actually used is printed, so it is never ambiguous which font
 *   stack and engine produced the numbers.
 *
 * Exit: 0 all widths pass, 1 a check failed, 2 harness error.
 */
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ---------- args ----------
const argv = process.argv.slice(2);
const opt = k => { const a = argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
const target = argv.find(a => !a.startsWith('--'));
const widths = (opt('widths') || '1440,1180,900').split(',').map(Number).filter(n => n > 0);
const BL = Number(opt('baseline') || 8);
const shotDir = opt('screenshot');

if (!target) {
  console.error('usage: node verify_grid.js <file-or-url> [--widths=1440,1180,900] [--baseline=8] [--screenshot=dir]');
  process.exit(2);
}
const url = /^[a-z]+:\/\//i.test(target) ? target : 'file://' + path.resolve(target);

// ---------- browser discovery (any Chromium-based browser; it is all CDP) ----------
const BROWSERS = {
  helium:   ['/Applications/Helium.app/Contents/MacOS/Helium',
             os.homedir() + '/Applications/Helium.app/Contents/MacOS/Helium'],
  chrome:   ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
             '/usr/bin/google-chrome'],
  chromium: ['/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/chromium'],
  edge:     ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
};
const isFile = p => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const requested = opt('browser') || process.env.GRID_BROWSER || process.env.CHROME;

let browser, browserName;
if (requested) {
  const key = requested.toLowerCase();
  const cands = BROWSERS[key] || [requested];       // a known name, else treat as a path
  browser = cands.find(isFile);
  browserName = BROWSERS[key] ? key : path.basename(requested);
  if (!browser) {
    console.error(`ERR requested browser "${requested}" not found` +
                  (BROWSERS[key] ? ` at: ${cands.join(', ')}` : ' (not an executable path)'));
    process.exit(2);
  }
} else {
  // Helium first — a Chromium fork, and the preferred browser on this machine.
  for (const [name, cands] of Object.entries(BROWSERS)) {
    const hit = cands.find(isFile);
    if (hit) { browser = hit; browserName = name; break; }
  }
  if (!browser) {
    console.error('ERR no Chromium-based browser found. Pass --browser=/path/to/browser');
    process.exit(2);
  }
}
if (typeof WebSocket === 'undefined') {
  console.error(`ERR this Node (${process.version}) has no global WebSocket. Node >= 22 required.`);
  process.exit(2);
}

// ---------- the in-page measurement ----------
// Keep OPT in sync with the page's own optical-alignment selector list, or
// check 4 measures nothing and passes vacuously.
const OPT_SELECTOR = '.masthead, .numeral, .shead h2, .h2b';

const measureExpr = (BL, OPT) => `(() => {
  const OPT = ${JSON.stringify(OPT)};
  const grid = document.querySelector('.grid');
  if (!grid) return { error: 'no .grid element found' };
  const cs = getComputedStyle(grid);
  const tracks = cs.gridTemplateColumns.split(' ').map(parseFloat).filter(n => !isNaN(n));
  if (!tracks.length) return { error: 'could not read gridTemplateColumns' };
  const gap = parseFloat(cs.columnGap) || 0;
  const gr = grid.getBoundingClientRect();
  // build column START (L) and END (R) coordinate sets
  const L = [], R = []; let x = gr.left;
  for (let i = 0; i < tracks.length; i++) { L.push(x); x += tracks[i]; R.push(x); if (i < tracks.length - 1) x += gap; }
  const nr = (v, arr) => arr.reduce((m, e) => Math.min(m, Math.abs(e - v)), 1e9);
  const nearest = (v, arr) => arr.reduce((b, e) => Math.abs(e - v) < Math.abs(b - v) ? e : b, arr[0]);

  // 1. column adherence — exclude optical display elements (their box is
  //    deliberately offset by the glyph side-bearing so the INK lands on the
  //    line; they are validated by check 4 instead).
  let colErr = 0, worst = null, colChecked = 0;
  document.querySelectorAll('.band > *').forEach(el => {
    if (el.matches(OPT)) return;
    const r = el.getBoundingClientRect(); if (r.width < 2) return;
    colChecked++;
    const e = Math.max(nr(r.left, L), nr(r.right, R));
    if (e > colErr) { colErr = e; worst = (el.className || el.tagName).toString().slice(0, 28); }
  });

  // 2. overlay match
  let ovErr = 0, ovChecked = 0;
  document.querySelectorAll('.guides .cols .col').forEach((c, i) => {
    const r = c.getBoundingClientRect(); ovChecked++;
    if (L[i] != null) ovErr = Math.max(ovErr, Math.abs(r.left - L[i]));
    if (R[i] != null) ovErr = Math.max(ovErr, Math.abs(r.right - R[i]));
  });

  // 3. baseline (tops modulo BL, per spread relative to its rows-top)
  const BL = ${BL};
  let baseErr = 0, baseChecked = 0;
  document.querySelectorAll('.spread').forEach(sp => {
    const rowsEl = sp.querySelector('.guides .rows'); if (!rowsEl) return;
    const top = rowsEl.getBoundingClientRect().top;
    sp.querySelectorAll('.body,.lede,.cap,.toc li,.dishes li,.kicker').forEach(el => {
      baseChecked++;
      const t = el.getBoundingClientRect().top - top; const m = ((t % BL) + BL) % BL;
      baseErr = Math.max(baseErr, Math.min(m, BL - m));
    });
  });

  // 4. optical ink offset — each display element's visible INK-left must sit
  //    on ITS OWN column line (the nearest column-start to its box), not
  //    always line 1 (headlines can start on any column).
  const cvs = document.createElement('canvas'), ctx = cvs.getContext('2d');
  let inkErr = 0, inkWorst = null, inkChecked = 0;
  document.querySelectorAll(OPT).forEach(el => {
    const c = getComputedStyle(el); let ch = (el.textContent || '').trim().charAt(0); if (!ch) return;
    if (c.textTransform === 'uppercase') ch = ch.toUpperCase();
    ctx.font = c.fontStyle + ' ' + c.fontWeight + ' ' + c.fontSize + ' ' + c.fontFamily; ctx.textAlign = 'left';
    const abl = ctx.measureText(ch).actualBoundingBoxLeft;
    if (!isFinite(abl)) return;
    inkChecked++;
    const box = el.getBoundingClientRect().left;
    const tgt = nearest(box, L);   // the column line this element sits on
    const e = Math.abs((box - abl) - tgt);
    if (e > inkErr) { inkErr = e; inkWorst = (el.className || '').toString().slice(0, 20) + ' "' + ch + '"'; }
  });

  const probe = document.querySelector(OPT.split(',')[0].trim()) || document.body;
  return {
    cols: tracks.length,
    track: +tracks[0].toFixed(1),
    maxColErrPx: +colErr.toFixed(2), worstCol: worst, colChecked,
    overlayErrPx: +ovErr.toFixed(2), ovChecked,
    maxBaselineOffPx: +baseErr.toFixed(2), baseChecked,
    maxInkOffPx: +inkErr.toFixed(2), worstInk: inkWorst, inkChecked,
    fontFamily: getComputedStyle(probe).fontFamily.split(',')[0].replace(/["']/g, '')
  };
})()`;

// ---------- minimal CDP client ----------
function launchBrowser() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mbgrid-'));
  const proc = spawn(browser, [
    '--headless=new',
    '--remote-debugging-port=0',
    '--user-data-dir=' + profile,   // throwaway profile: never touches your real one
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',   // no "make me your default browser?" prompt
    '--password-store=basic',       // no macOS Keychain access prompt
    '--use-mock-keychain',          // ditto
    '--disable-extensions',
    '--disable-background-networking',
    '--allow-file-access-from-files',
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  const wsUrl = new Promise((resolve, reject) => {
    let buf = '';
    const t = setTimeout(() => reject(new Error(browserName + ' did not report a DevTools endpoint within 20s')), 20000);
    proc.stderr.on('data', d => {
      buf += d.toString();
      const m = buf.match(/ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/\S+/);
      if (m) { clearTimeout(t); resolve({ browserWs: m[0], port: m[1] }); }
    });
    proc.on('exit', c => { clearTimeout(t); reject(new Error(browserName + ' exited early (code ' + c + '): ' + buf.slice(-400))); });
  });
  return { proc, profile, wsUrl };
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const listeners = new Map();
  const open = new Promise((res, rej) => { ws.onopen = () => res(); ws.onerror = e => rej(new Error('ws error: ' + (e.message || 'unknown'))); });
  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id != null && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id); pending.delete(msg.id);
      msg.error ? rej(new Error(msg.method + ' ' + msg.error.message)) : res(msg.result);
    } else if (msg.method && listeners.has(msg.method)) {
      listeners.get(msg.method).splice(0).forEach(fn => fn(msg.params));
    }
  };
  const send = (method, params = {}, sessionId) => open.then(() => new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify(sessionId ? { id: mid, method, params, sessionId } : { id: mid, method, params }));
    setTimeout(() => { if (pending.has(mid)) { pending.delete(mid); rej(new Error(method + ' timed out')); } }, 30000);
  }));
  const once = (method, ms = 30000) => new Promise((res, rej) => {
    if (!listeners.has(method)) listeners.set(method, []);
    listeners.get(method).push(res);
    setTimeout(() => rej(new Error('waiting for ' + method + ' timed out')), ms);
  });
  return { ws, send, once, open };
}

// ---------- run ----------
(async () => {
  console.log(`       browser: ${browserName} (${browser})`);
  const { proc, profile, wsUrl } = launchBrowser();
  let cdp, failed = false;
  const cleanup = () => {
    try { cdp && cdp.ws.close(); } catch {}
    try { proc.kill('SIGKILL'); } catch {}
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  };
  process.on('SIGINT', () => { cleanup(); process.exit(130); });

  try {
    const { browserWs } = await wsUrl;
    cdp = connect(browserWs);
    await cdp.open;

    // attach a flat session to a fresh page target
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    const S = (m, p) => cdp.send(m, p, sessionId);
    await S('Page.enable');
    await S('Runtime.enable');

    if (shotDir) fs.mkdirSync(shotDir, { recursive: true });

    for (const W of widths) {
      await S('Emulation.setDeviceMetricsOverride', { width: W, height: 1000, deviceScaleFactor: 1, mobile: false });
      const loaded = cdp.once('Page.loadEventFired');
      await S('Page.navigate', { url });
      await loaded.catch(() => {});                 // some file:// loads fire before we listen
      // let webfonts settle, then force a layout flush
      await S('Runtime.evaluate', {
        expression: '(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))',
        awaitPromise: true,
      }).catch(() => {});
      await new Promise(r => setTimeout(r, 300));

      const out = await S('Runtime.evaluate', { expression: measureExpr(BL, OPT_SELECTOR), returnByValue: true });
      if (out.exceptionDetails) throw new Error('page evaluate threw: ' + (out.exceptionDetails.exception?.description || out.exceptionDetails.text));
      const res = out.result.value;
      if (res.error) { console.log(`[FAIL] vw=${W}  ${res.error}`); failed = true; continue; }

      if (shotDir) {
        const shot = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        const file = path.join(shotDir, `grid-${W}.png`);
        fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
        console.log(`       screenshot -> ${file}`);
      }

      // baseline tolerance = half a baseline unit (element border-box top vs line
      // is a proxy; the leading does the real work)
      const pass = res.maxColErrPx <= 0.5 && res.overlayErrPx <= 0.5 &&
                   res.maxBaselineOffPx <= (BL / 2) && res.maxInkOffPx <= 1.0;
      if (!pass) failed = true;
      console.log(`[${pass ? 'PASS' : 'FAIL'}] vw=${W}  col=${res.maxColErrPx}px overlay=${res.overlayErrPx}px ` +
                  `baseline=${res.maxBaselineOffPx}px ink=${res.maxInkOffPx}px  ` +
                  `(worstCol=${res.worstCol}, worstInk=${res.worstInk}, font=${res.fontFamily})`);

      // A vacuous pass is worse than a failure: say so loudly.
      const empty = [];
      if (!res.colChecked) empty.push('no .band > * elements');
      if (!res.ovChecked) empty.push('no .guides .cols .col elements — is the overlay populated?');
      if (!res.baseChecked) empty.push('no baseline-checked text (.body/.lede/.cap/.kicker/…)');
      if (!res.inkChecked) empty.push(`no elements matched OPT (${OPT_SELECTOR}) — sync this list with the page`);
      if (empty.length) console.log('       ⚠ nothing measured for: ' + empty.join('; '));
    }
  } catch (e) {
    cleanup();
    console.error('ERR ' + e.message);
    process.exit(2);
  }
  cleanup();
  if (failed) { console.error('GRID VERIFY: FAIL'); process.exit(1); }
  console.log('GRID VERIFY: PASS');
})();
