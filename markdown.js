// Markdown syntax and media paths shared by Home and project pages.
function escapeHtml(input = "") {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeFenceLanguage(raw = "") {
  const lang = raw.trim().toLowerCase();
  const aliasMap = {
    py: "python",
    js: "javascript",
    ts: "typescript",
    sh: "bash",
    zsh: "bash",
    yml: "yaml",
    md: "markdown",
    // treat citation/plain-text fences as unlabeled
    cite: "text",
    citation: "text",
    ref: "text",
  };
  return aliasMap[lang] || lang || "text";
}

function parseInlineMarkdown(raw, contentPath = "") {
  // Escape HTML special chars first, then apply inline markdown
  let text = escapeHtml(raw);
  // Inline images: ![alt](src)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    const resolved = resolveContentPath(src, contentPath);
    return `<img class="project-md-img-inline" src="${resolved}" alt="${alt}" loading="lazy" />`;
  });
  // Bold: **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic: *text* (avoid matching bold's inner *)
  text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  // Highlight: ==text==
  text = text.replace(/==([^=\n]+)==/g, "<mark>$1</mark>");
  // Inline code: `code`
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  return text;
}

function markdownLinesToHtml(lines = [], contentPath = "") {
  const html = [];
  let inList = false;
  let inCode = false;
  let codeLang = "text";
  let codeLines = [];
  let inMath = false;
  let mathLines = [];
  let inIframe = false;
  let iframeLines = [];
  let inTable = false;
  let tableRows = [];

  const closeListIfNeeded = () => {
    if (inList) { html.push("</ul>"); inList = false; }
  };

  const closeIframeIfNeeded = () => {
    if (!inIframe) return;
    html.push(`<div class="project-md-iframe-wrap">${iframeLines.join("")}</div>`);
    inIframe = false; iframeLines = [];
  };

  const closeTableIfNeeded = () => {
    if (!inTable || !tableRows.length) { inTable = false; tableRows = []; return; }
    const parseRow = (line) =>
      line.split("|").slice(1, -1).map((c) => c.trim());
    const isSep = (row) => row.every((c) => /^:?-+:?$/.test(c));

    const firstRow = parseRow(tableRows[0]);
    const hasHeader = tableRows.length > 1 && isSep(parseRow(tableRows[1]));
    const dataStart = hasHeader ? 2 : 0;

    let t = `<div class="project-md-table-wrap"><table class="project-md-table">`;
    if (hasHeader) {
      t += `<thead><tr>${firstRow.map((c) => `<th>${parseInlineMarkdown(c, contentPath)}</th>`).join("")}</tr></thead>`;
    }
    t += "<tbody>";
    for (let i = dataStart; i < tableRows.length; i++) {
      const cells = parseRow(tableRows[i]);
      t += `<tr>${cells.map((c) => `<td>${parseInlineMarkdown(c, contentPath)}</td>`).join("")}</tr>`;
    }
    t += "</tbody></table></div>";
    html.push(t);
    inTable = false; tableRows = [];
  };

  const closeCodeIfNeeded = () => {
    if (!inCode) return;
    const escaped = escapeHtml(codeLines.join("\n"));
    const langLabel = codeLang !== "text" ? escapeHtml(codeLang) : "";
    const blockClass = langLabel ? "project-code-block" : "project-code-block no-lang";
    const tooltip = langLabel || "copy";
    html.push(
      `<div class="${blockClass}">` +
      (langLabel ? `<span class="project-code-lang" aria-hidden="true">${langLabel}</span>` : ``) +
      `<div class="project-code-inner">` +
      `<pre class="project-code-pre"><code class="language-${codeLang}">${escaped}</code></pre>` +
      `<button class="project-code-copy" type="button" aria-label="${siteText('코드 복사', 'Copy code')}" data-lang="${tooltip}" data-tooltip="${tooltip}">` +
      `<img class="copy-icon" src="assets/icons/copy.svg" alt="" />` +
      `</button>` +
      `</div>` +
      `</div>`
    );
    inCode = false; codeLang = "text"; codeLines = [];
  };

  const closeMathIfNeeded = () => {
    if (!inMath) return;
    // Wrap in a div so KaTeX auto-render finds $$ ... $$ in one text node
    html.push(`<div class="project-math-block">$$\n${mathLines.join("\n")}\n$$</div>`);
    inMath = false; mathLines = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // ── Inside code fence ──
    if (inCode) {
      if (trimmed.startsWith("```")) { closeCodeIfNeeded(); return; }
      codeLines.push(rawLine);
      return;
    }

    // ── Open code fence ──
    if (trimmed.startsWith("```")) {
      closeListIfNeeded();
      closeMathIfNeeded();
      const langMatched = trimmed.match(/^```([\w#+-]*)/);
      codeLang = normalizeFenceLanguage(langMatched ? langMatched[1] : "");
      inCode = true; codeLines = [];
      return;
    }

    // ── $$ math block delimiter ──
    if (trimmed === "$$") {
      if (inMath) { closeMathIfNeeded(); }
      else { closeListIfNeeded(); inMath = true; mathLines = []; }
      return;
    }

    // ── Inside math block ──
    if (inMath) { mathLines.push(rawLine); return; }

    // ── iframe block (raw HTML pass-through, responsive wrapper) ──
    if (inIframe) {
      iframeLines.push(trimmed);
      if (trimmed.includes("</iframe>")) closeIframeIfNeeded();
      return;
    }
    if (trimmed.startsWith("<iframe")) {
      closeListIfNeeded();
      closeMathIfNeeded();
      if (trimmed.includes("</iframe>")) {
        html.push(`<div class="project-md-iframe-wrap">${trimmed}</div>`);
      } else {
        inIframe = true; iframeLines = [trimmed];
      }
      return;
    }

    // ── Table rows ──
    if (inTable && !trimmed.startsWith("|")) closeTableIfNeeded();
    if (trimmed.startsWith("|")) {
      if (!inTable) { closeListIfNeeded(); closeMathIfNeeded(); inTable = true; tableRows = []; }
      tableRows.push(trimmed);
      return;
    }

    if (!trimmed) { closeListIfNeeded(); return; }

    // ── Standalone image line → <figure> ──
    const imgSrc = parseImageSourceFromLine(trimmed);
    if (imgSrc) {
      closeListIfNeeded();
      const resolved = resolveContentPath(imgSrc, contentPath);
      html.push(`<figure class="project-md-figure"><img class="project-md-img" src="${resolved}" alt="" loading="lazy" /></figure>`);
      return;
    }

    const h4Matched = trimmed.match(/^####\s+(.+)$/);
    if (h4Matched) {
      closeListIfNeeded();
      html.push(`<h4 class="project-md-h4">${parseInlineMarkdown(h4Matched[1].trim(), contentPath)}</h4>`);
      return;
    }

    const h3Matched = trimmed.match(/^###\s+(.+)$/);
    if (h3Matched) {
      closeListIfNeeded();
      html.push(`<h3 class="project-md-h3">${parseInlineMarkdown(h3Matched[1].trim(), contentPath)}</h3>`);
      return;
    }

    const h2Matched = trimmed.match(/^##\s+(.+)$/);
    if (h2Matched) {
      closeListIfNeeded();
      html.push(`<h2 class="project-md-h2">${parseInlineMarkdown(h2Matched[1].trim(), contentPath)}</h2>`);
      return;
    }

    if (trimmed.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${parseInlineMarkdown(trimmed.replace(/^-+\s*/, ""), contentPath)}</li>`);
      return;
    }

    closeListIfNeeded();
    html.push(`<p>${parseInlineMarkdown(trimmed, contentPath)}</p>`);
  });

  closeListIfNeeded();
  closeCodeIfNeeded();
  closeMathIfNeeded();
  closeIframeIfNeeded();
  closeTableIfNeeded();
  return html.join("");
}

function resolveContentPath(rawPath = "", contentPath = "") {
  const value = (rawPath || "").trim();
  if (!value) {
    return "";
  }
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }
  if (value.startsWith("assets/") || value.startsWith("projects/")) {
    return value;
  }
  if (value.startsWith("/")) {
    return value;
  }

  const contentDir = contentPath.includes("/")
    ? contentPath.slice(0, contentPath.lastIndexOf("/") + 1)
    : "";

  try {
    return new URL(value, new URL(contentDir, window.location.href)).href;
  } catch (error) {
    return `${contentDir}${value}`;
  }
}

function parseImageSourceFromLine(line = "") {
  const trimmed = line.trim();
  if (!trimmed) {
    return "";
  }

  const markdownImageMatched = trimmed.match(/!\[[^\]]*]\(([^)]+)\)/);
  if (markdownImageMatched) {
    return markdownImageMatched[1];
  }

  const keyImageMatched = trimmed.match(/^-\s*(image|hero|cover|thumbnail)\s*:\s*(.+)$/i);
  if (keyImageMatched) {
    return keyImageMatched[2];
  }

  if (
    /^(\.\/|\.\.\/|assets\/|projects\/|\/|https?:\/\/)/i.test(trimmed) &&
    /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(trimmed)
  ) {
    return trimmed;
  }

  return "";
}

function extractAllImageSources(lines = [], contentPath = "") {
  const sources = [];
  for (const rawLine of lines) {
    const source = parseImageSourceFromLine(rawLine);
    if (source) {
      sources.push(resolveContentPath(source, contentPath));
    }
  }
  return sources;
}
