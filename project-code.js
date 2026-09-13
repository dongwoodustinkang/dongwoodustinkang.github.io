// Optional syntax highlighting, code copy buttons, and KaTeX rendering.
function initCodeBlocks() {
  // Syntax highlighting
  if (window.hljs) {
    document.querySelectorAll(".project-code-pre code").forEach((el) => hljs.highlightElement(el));
  }
  // Copy buttons — read textContent after hljs so span tags are stripped
  document.querySelectorAll(".project-code-copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const codeEl = btn.closest(".project-code-block").querySelector("code");
      const text = codeEl ? codeEl.textContent : "";
      try {
        await navigator.clipboard.writeText(text);
      } catch (_) {
        const ta = Object.assign(document.createElement("textarea"), {
          value: text,
          style: "position:fixed;opacity:0",
        });
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      const icon = btn.querySelector(".copy-icon");
      if (icon) icon.src = "assets/icons/check.svg";
      btn.dataset.tooltip = "Copied!";
      btn.classList.add("is-copied");
      setTimeout(() => {
        if (icon) icon.src = "assets/icons/copy.svg";
        btn.dataset.tooltip = btn.dataset.lang || "copy";
        btn.classList.remove("is-copied");
      }, 2000);
    });
  });
}

function initMath() {
  if (!window.renderMathInElement) return;
  const opts = {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$",  right: "$",  display: false },
    ],
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    throwOnError: false,
  };
  document.querySelectorAll(".home-markdown, .project-detail-summary, .project-detail-content").forEach(el => renderMathInElement(el, opts));
}

