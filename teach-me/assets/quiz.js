/* teach-me quiz widget — inline this into a lesson's <script> block.
 *
 * Self-grading multiple-choice quiz with the feedback loop the lessons depend on:
 * immediate (the instant the user commits to an option), automatic (no "submit"),
 * and specific (a wrong answer shows what's actually true and why).
 *
 * It also enforces the equal-length-answer rule: if a question's options differ
 * much in length, the longest is a giveaway. mountQuiz() warns in the console so
 * the author can fix it before the lesson ships.
 *
 * Usage:
 *   mountQuiz(document.getElementById('quiz'), [
 *     {
 *       q: "How does a Service find the Pods it routes to?",
 *       options: [
 *         { text: "by matching the label selector to pod labels", correct: true,
 *           why: "Right — the Service's selector is matched against pod labels to build its endpoints." },
 *         { text: "by reading each pod's name from the api server", correct: false,
 *           why: "Not names — Services match on labels, so pods can come and go freely." },
 *         { text: "by hashing the pod ip address ranges in use", correct: false,
 *           why: "No hashing of IPs — endpoints are derived from the label selector." }
 *       ]
 *     }
 *   ]);
 *
 * Authoring rules (see ../references/lesson-design.md):
 *   - Every option's `text` should be the same number of words, ideally same chars.
 *   - `why` is required on every option — the wrong-answer feedback is the most
 *     valuable moment in the lesson; spend words there.
 */
(function () {
  function lengthWarn(question, idx) {
    var opts = question.options || [];
    if (opts.length < 2) return;
    var words = opts.map(function (o) { return (o.text || '').trim().split(/\s+/).length; });
    var chars = opts.map(function (o) { return (o.text || '').trim().length; });
    var spread = function (arr) { return Math.max.apply(null, arr) - Math.min.apply(null, arr); };
    if (spread(words) > 0) {
      console.warn('[teach-me quiz] Q' + (idx + 1) + ': options differ in WORD count ' +
        JSON.stringify(words) + '. Equal length removes the formatting tell — make them match.');
    } else if (spread(chars) > 12) {
      console.warn('[teach-me quiz] Q' + (idx + 1) + ': options differ in CHARACTER count ' +
        JSON.stringify(chars) + '. Tighten so the correct answer is not the longest.');
    }
  }

  window.mountQuiz = function mountQuiz(container, questions) {
    if (!container) { console.error('[teach-me quiz] no container element'); return; }
    container.classList.add('quiz');
    container.innerHTML = '';

    questions.forEach(function (question, qi) {
      lengthWarn(question, qi);

      var card = document.createElement('div');
      card.className = 'quiz-q';

      var qText = document.createElement('div');
      qText.className = 'q-text';
      qText.textContent = question.q;
      card.appendChild(qText);

      var optsWrap = document.createElement('div');
      optsWrap.className = 'quiz-options';

      var feedback = document.createElement('div');
      feedback.className = 'quiz-feedback';

      var answered = false;
      question.options.forEach(function (opt) {
        var btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.type = 'button';
        btn.textContent = opt.text;
        btn.addEventListener('click', function () {
          if (answered) return;          // first commit is the answer; no second guess
          answered = true;
          btn.classList.add(opt.correct ? 'correct' : 'wrong');
          if (!opt.correct) {
            // also reveal which one was right, so the loop teaches
            Array.prototype.forEach.call(optsWrap.children, function (b, i) {
              if (question.options[i].correct) b.classList.add('correct');
            });
          }
          Array.prototype.forEach.call(optsWrap.children, function (b) { b.disabled = true; });
          feedback.textContent = opt.why || (opt.correct ? 'Correct.' : 'Not quite.');
          feedback.classList.add('show', opt.correct ? 'correct' : 'wrong');
        });
        optsWrap.appendChild(btn);
      });

      card.appendChild(optsWrap);
      card.appendChild(feedback);
      container.appendChild(card);
    });
  };
})();
