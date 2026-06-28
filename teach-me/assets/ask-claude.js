/* ask-claude — highlight any phrase in a lesson to ask Claude a follow-up.
 *
 * Flow: select text -> floating "Ask" button -> popover textbox -> submit.
 * The question + highlighted phrase + lesson/mission context POST straight to the
 * companion server (serve.js) — no copy-paste. serve.js spawns a headless Claude
 * that consults RESOURCES.md and writes questions/answers/<id>.md; this widget polls
 * for it and renders the answer in the page margin, anchored to the highlight. Q&A
 * persists in localStorage per lesson, so reopening restores past questions/answers.
 *
 * Requires serve.js to be running (open the lesson via http://localhost:PORT/).
 * Opened via file://, it degrades to a hint telling you to start the server.
 */
(function () {
  "use strict";

  var onServer = location.protocol === "http:" || location.protocol === "https:";

  // ---- context embedded by the lesson ------------------------------------
  function readContext() {
    var el = document.getElementById("lesson-context");
    if (!el) return { lesson: locationLesson(), title: document.title, missionSummary: "" };
    try {
      var c = JSON.parse(el.textContent || "{}");
      if (!c.lesson) c.lesson = locationLesson();
      if (!c.title) c.title = document.title;
      return c;
    } catch (e) {
      return { lesson: locationLesson(), title: document.title, missionSummary: "" };
    }
  }
  function locationLesson() {
    var p = location.pathname.split("/").filter(Boolean);
    return p.length ? p[p.length - 1] : document.title;
  }
  var CTX = readContext();
  var STORE_KEY = "ask-claude:" + CTX.lesson;

  // The element holding the lesson prose. Prefer .lesson, fall back to body.
  function root() {
    return document.querySelector(".lesson") || document.body;
  }

  // ---- tiny markdown renderer (offline, no deps) -------------------------
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function renderMarkdown(md) {
    var lines = md.replace(/\r\n/g, "\n").split("\n");
    var html = "";
    var i = 0;
    function inline(t) {
      t = escapeHtml(t);
      t = t.replace(/`([^`]+)`/g, function (_, c) { return "<code>" + c + "</code>"; });
      t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      t = t.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      return t;
    }
    while (i < lines.length) {
      var line = lines[i];
      if (/^```/.test(line)) {
        var buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++; // closing fence
        html += "<pre><code>" + escapeHtml(buf.join("\n")) + "</code></pre>";
        continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        var items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          items.push("<li>" + inline(lines[i].replace(/^\s*[-*]\s+/, "")) + "</li>");
          i++;
        }
        html += "<ul>" + items.join("") + "</ul>";
        continue;
      }
      if (/^\s*$/.test(line)) { i++; continue; }
      var para = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^```/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i])) {
        para.push(lines[i++]);
      }
      html += "<p>" + inline(para.join(" ")) + "</p>";
    }
    return html;
  }

  // ---- persistence -------------------------------------------------------
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function upsert(rec) {
    var list = load();
    var idx = list.findIndex(function (r) { return r.id === rec.id; });
    if (idx >= 0) list[idx] = rec; else list.push(rec);
    save(list);
  }

  // ---- highlight (re)anchoring -------------------------------------------
  function wrapRange(range, qid) {
    var mark = document.createElement("mark");
    mark.className = "ask-highlight";
    mark.setAttribute("data-qid", qid);
    try {
      range.surroundContents(mark);
    } catch (e) {
      mark.appendChild(range.extractContents());
      range.insertNode(mark);
    }
    return mark;
  }
  // First-exact-text-match Range under root (used to restore highlights on reload).
  function findTextRange(text) {
    text = (text || "").trim();
    if (!text) return null;
    var walker = document.createTreeWalker(root(), NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      var idx = node.nodeValue.indexOf(text);
      if (idx >= 0) {
        var r = document.createRange();
        r.setStart(node, idx);
        r.setEnd(node, idx + text.length);
        return r;
      }
    }
    return null;
  }

  // ---- answer note rendering (margin sidenote) --------------------------
  function noteFor(mark) {
    var id = mark.getAttribute("data-qid");
    var existing = document.querySelector('.ac-note[data-qid="' + id + '"]');
    if (existing) return existing;
    var note = document.createElement("aside");
    note.className = "ac-note";
    note.setAttribute("data-qid", id);
    var block = mark;
    while (block.parentNode && block.parentNode !== root() && getComputedStyle(block).display === "inline") {
      block = block.parentNode;
    }
    if (block.parentNode) block.parentNode.insertBefore(note, block.nextSibling);
    else root().appendChild(note);
    return note;
  }
  function renderNote(rec, mark) {
    var note = noteFor(mark);
    var body = rec.answerMarkdown
      ? renderMarkdown(rec.answerMarkdown)
      : '<div class="ac-pending">Claude is answering…</div>';
    note.innerHTML =
      '<button class="ac-note-dismiss" title="hide">×</button>' +
      '<div class="ac-note-q">' + escapeHtml(rec.question) + "</div>" + body;
    note.querySelector(".ac-note-dismiss").addEventListener("click", function () { note.remove(); });
  }

  // ---- polling -----------------------------------------------------------
  function pollAnswer(rec, mark) {
    if (!onServer) return;
    var delay = 2000;
    var maxDelay = 8000;
    var attempts = 0;
    function tick() {
      attempts++;
      if (attempts > 150) return;
      fetch("/answers/" + rec.id, { cache: "no-store" })
        .then(function (res) { return res.status === 200 ? res.text() : null; })
        .then(function (text) {
          if (text != null) {
            rec.answerMarkdown = text;
            rec.status = "answered";
            upsert(rec);
            renderNote(rec, mark);
          } else {
            delay = Math.min(maxDelay, Math.round(delay * 1.15));
            setTimeout(tick, delay);
          }
        })
        .catch(function () { setTimeout(tick, maxDelay); });
    }
    setTimeout(tick, delay);
  }

  // ---- submit ------------------------------------------------------------
  function submitQuestion(question, range) {
    var tempId = "pending-" + load().length + "-" + question.length;
    var mark = wrapRange(range, tempId);
    var highlight = mark.textContent;
    var rec = { id: tempId, question: question, highlightText: highlight, answerMarkdown: "", status: "sending" };
    renderNote(rec, mark);

    if (!onServer) { showServerHint(); return; }
    fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question, highlight: highlight, anchorText: highlight, context: CTX }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        rec.id = data.id;
        rec.status = "pending";
        mark.setAttribute("data-qid", data.id);
        var note = document.querySelector('.ac-note[data-qid="' + tempId + '"]');
        if (note) note.setAttribute("data-qid", data.id);
        upsert(rec);
        renderNote(rec, mark);
        pollAnswer(rec, mark);
      })
      .catch(function () { showServerHint(); });
  }

  // ---- selection UI ------------------------------------------------------
  var askBtn = document.createElement("button");
  askBtn.className = "ac-ask-btn";
  askBtn.innerHTML = "✦ Ask Claude";
  document.body.appendChild(askBtn);
  var savedRange = null;

  function hideBtn() { askBtn.classList.remove("ac-show"); }
  function showBtnAt(rect) {
    askBtn.style.left = window.scrollX + rect.left + rect.width / 2 + "px";
    askBtn.style.top = window.scrollY + rect.top - 12 + "px";
    askBtn.classList.add("ac-show");
  }

  document.addEventListener("mouseup", function () {
    setTimeout(function () {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        if (!popoverOpen) hideBtn();
        return;
      }
      var anchorEl = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentNode);
      if (!anchorEl || !root().contains(anchorEl)) { hideBtn(); return; }
      savedRange = sel.getRangeAt(0).cloneRange();
      showBtnAt(savedRange.getBoundingClientRect());
    }, 10);
  });

  var popoverOpen = false;
  askBtn.addEventListener("mousedown", function (e) { e.preventDefault(); });
  askBtn.addEventListener("click", function () { if (savedRange) openPopover(savedRange); });

  function openPopover(range) {
    closePopover();
    popoverOpen = true;
    hideBtn();
    var rect = range.getBoundingClientRect();
    var quote = range.toString();
    var pop = document.createElement("div");
    pop.className = "ac-popover";
    pop.innerHTML =
      '<div class="ac-quote">' + escapeHtml(quote.length > 220 ? quote.slice(0, 220) + "…" : quote) + "</div>" +
      '<textarea placeholder="Ask a follow-up about this…"></textarea>' +
      '<div class="ac-row"><span class="ac-hint">⏎ to send · Esc to cancel</span>' +
      '<span><button class="ac-btn ac-ghost" data-act="cancel">Cancel</button> ' +
      '<button class="ac-btn ac-primary" data-act="send">Ask</button></span></div>';
    document.body.appendChild(pop);
    pop.style.left = Math.max(8, window.scrollX + rect.left) + "px";
    pop.style.top = window.scrollY + rect.bottom + 8 + "px";
    var ta = pop.querySelector("textarea");
    ta.focus();

    function send() {
      var q = ta.value.trim();
      if (!q) return;
      var r = range.cloneRange();
      closePopover();
      submitQuestion(q, r);
    }
    pop.querySelector('[data-act="send"]').addEventListener("click", send);
    pop.querySelector('[data-act="cancel"]').addEventListener("click", closePopover);
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
      else if (e.key === "Escape") { closePopover(); }
    });
    activePopover = pop;
  }

  var activePopover = null;
  function closePopover() {
    if (activePopover) { activePopover.remove(); activePopover = null; }
    popoverOpen = false;
  }
  document.addEventListener("mousedown", function (e) {
    if (activePopover && !activePopover.contains(e.target) && e.target !== askBtn) closePopover();
  });

  // Click a highlight to scroll its note into view.
  root().addEventListener("click", function (e) {
    var mark = e.target.closest && e.target.closest("mark.ask-highlight");
    if (!mark) return;
    var note = document.querySelector('.ac-note[data-qid="' + mark.getAttribute("data-qid") + '"]');
    if (note) note.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  // ---- server-not-running hint ------------------------------------------
  var hintShown = false;
  function showServerHint() {
    if (hintShown) return;
    hintShown = true;
    var t = document.createElement("div");
    t.className = "ac-toast";
    t.innerHTML =
      "To ask Claude, run <code>node serve.js</code> in this workspace and open the " +
      "lesson via <code>http://localhost:5173/</code>.";
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); hintShown = false; }, 7000);
  }

  // ---- restore on load ---------------------------------------------------
  function restore() {
    var list = load();
    list.forEach(function (rec) {
      var range = findTextRange(rec.highlightText);
      if (!range) return;
      var mark = wrapRange(range, rec.id);
      renderNote(rec, mark);
      if (rec.status !== "answered" && onServer) pollAnswer(rec, mark);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", restore);
  } else {
    restore();
  }
})();
