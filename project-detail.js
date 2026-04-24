const menuToggleButton = document.getElementById("menu-toggle");
const mobileOverlay = document.getElementById("mobile-overlay");

const titleEl = document.getElementById("project-detail-title");
const authorEl = document.getElementById("project-detail-author");
const affiliationEl = document.getElementById("project-detail-affiliation");
const venueEl = document.getElementById("project-detail-venue");
const actionsEl = document.getElementById("project-detail-actions");
const heroEl = document.getElementById("project-detail-hero");
const summaryEl = document.getElementById("project-detail-summary");
const contentEl = document.getElementById("project-detail-content");
const abstractEl = document.getElementById("project-detail-abstract");
const abstractLabelEl = document.getElementById("project-detail-abstract-label");
const bibtexEl = document.getElementById("project-detail-bibtex");
const bibtexLabelEl = document.getElementById("project-detail-bibtex-label");
const bibtexCopyButton = document.getElementById("project-bibtex-copy-btn");
const bibtexCopyIcon = document.getElementById("project-bibtex-copy-icon");
const publicationsEl = document.getElementById("project-detail-publications");
const publicationsLabelEl = document.getElementById("project-detail-publications-label");

let copiedIconTimer = null;

function openMobileMenu() {
  mobileOverlay.classList.add("open");
  mobileOverlay.setAttribute("aria-hidden", "false");
  menuToggleButton.classList.add("is-open");
  menuToggleButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
}

function closeMobileMenu() {
  mobileOverlay.classList.remove("open");
  mobileOverlay.setAttribute("aria-hidden", "true");
  menuToggleButton.classList.remove("is-open");
  menuToggleButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

function parseFrontmatter(markdown) {
  const result = { title: "", author: "", affiliation: "", venue: "", links: [] };
  const fmMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return result;
  const lines = fmMatch[1].split(/\r?\n/);
  let listKey = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (listKey && /^[*-]\s/.test(line)) {
      const itemText = line.replace(/^[*-]\s+/, "");
      const ci = itemText.indexOf(":");
      const label = ci > -1 ? itemText.slice(0, ci).trim() : itemText.trim();
      const url = ci > -1 ? itemText.slice(ci + 1).trim() : "";
      if (listKey === "links") result.links.push({ label, url });
      continue;
    }
    listKey = null;
    const ci = line.indexOf(":");
    if (ci === -1) continue;
    const key = line.slice(0, ci).trim().toLowerCase();
    const val = line.slice(ci + 1).trim().replace(/^["']|["']$/g, "");
    if (!val) { if (key === "links") listKey = "links"; }
    else if (key === "title") result.title = val;
    else if (key === "author" || key === "authors") result.author = val;
    else if (key === "affiliation" || key === "affilation") result.affiliation = val;
    else if (key === "venue") result.venue = val;
  }
  return result;
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\s*\r?\n?/, "");
}

function escapeHtml(input = "") {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getProjectYear(project) {
  const venue = (project.venue || "").trim();
  const matched = venue.match(/\b(19|20)\d{2}\b/);
  return matched ? matched[0] : "2026";
}

function getQuerySlug() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("slug") || "").trim();
}

function normalizeSectionKey(input = "") {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function parseMarkdownSections(markdown) {
  const sections = {};
  const lines = markdown.split(/\r?\n/);
  let currentKey = "";

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      const title = heading[1].trim();
      const key = normalizeSectionKey(title);
      if (!sections[key]) {
        sections[key] = { title, lines: [] };
      }
      currentKey = key;
      return;
    }

    if (!currentKey) {
      return;
    }

    sections[currentKey].lines.push(line);
  });

  return sections;
}

function getSectionKey(sections, aliases = []) {
  for (const alias of aliases) {
    const key = normalizeSectionKey(alias);
    if (sections[key]) {
      return key;
    }
  }
  return "";
}

function getSection(sections, aliases = []) {
  const key = getSectionKey(sections, aliases);
  return key ? sections[key] : null;
}

function getSectionLines(sections, aliases = []) {
  const section = getSection(sections, aliases);
  return section ? section.lines : [];
}

function parseResources(lines = []) {
  const resources = {};

  lines.forEach((line) => {
    const matched = line.trim().match(/^-\s*([^:]+):\s*(\S+)\s*$/i);
    if (!matched) {
      return;
    }
    resources[matched[1].trim().toLowerCase()] = matched[2].trim();
  });

  return resources;
}

function markdownLinesToPlainText(lines = []) {
  let inCode = false;
  return lines
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) {
        return false;
      }
      if (line.startsWith("```")) {
        inCode = !inCode;
        return false;
      }
      if (inCode) {
        return false;
      }
      return true;
    })
    .map((line) => line.replace(/^-+\s*/, "").trim())
    .filter(Boolean)
    .join(" ");
}

function getSummaryText(summarySection, abstractSection) {
  if (summarySection) {
    return markdownLinesToPlainText(summarySection.lines);
  }
  if (abstractSection) {
    return markdownLinesToPlainText(abstractSection.lines);
  }
  return "";
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
  };
  return aliasMap[lang] || lang || "text";
}

function markdownLinesToHtml(lines = []) {
  const html = [];
  let inList = false;
  let inCode = false;
  let codeLang = "text";
  let codeLines = [];

  const closeListIfNeeded = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  const closeCodeIfNeeded = () => {
    if (!inCode) {
      return;
    }
    const code = escapeHtml(codeLines.join("\n"));
    html.push(
      `<pre class="project-code-pre"><code class="language-${codeLang}" data-lang="${codeLang}">${code}</code></pre>`
    );
    inCode = false;
    codeLang = "text";
    codeLines = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (inCode) {
      if (trimmed.startsWith("```")) {
        closeCodeIfNeeded();
        return;
      }
      codeLines.push(rawLine);
      return;
    }

    if (trimmed.startsWith("```")) {
      closeListIfNeeded();
      const langMatched = trimmed.match(/^```([\w#+-]*)/);
      codeLang = normalizeFenceLanguage(langMatched ? langMatched[1] : "");
      inCode = true;
      codeLines = [];
      return;
    }

    if (!trimmed) {
      closeListIfNeeded();
      return;
    }

    const h4Matched = trimmed.match(/^####\s+(.+)$/);
    if (h4Matched) {
      closeListIfNeeded();
      html.push(`<h4 class="project-md-h4">${escapeHtml(h4Matched[1].trim())}</h4>`);
      return;
    }

    const h3Matched = trimmed.match(/^###\s+(.+)$/);
    if (h3Matched) {
      closeListIfNeeded();
      html.push(`<h3 class="project-md-h3">${escapeHtml(h3Matched[1].trim())}</h3>`);
      return;
    }

    const h2Matched = trimmed.match(/^##\s+(.+)$/);
    if (h2Matched) {
      closeListIfNeeded();
      html.push(`<h2 class="project-md-h2">${escapeHtml(h2Matched[1].trim())}</h2>`);
      return;
    }

    if (trimmed.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${escapeHtml(trimmed.replace(/^-+\s*/, ""))}</li>`);
      return;
    }

    closeListIfNeeded();
    html.push(`<p>${escapeHtml(trimmed)}</p>`);
  });

  closeListIfNeeded();
  closeCodeIfNeeded();
  return html.join("");
}

function extractCodeBlock(lines = []) {
  let inCode = false;
  let language = "text";
  const codeLines = [];

  lines.forEach((rawLine) => {
    const trimmed = rawLine.trim();

    if (!inCode) {
      const startMatched = trimmed.match(/^```([\w#+-]*)/);
      if (startMatched) {
        inCode = true;
        language = normalizeFenceLanguage(startMatched[1] || "");
        return;
      }
      if (trimmed) {
        codeLines.push(rawLine);
      }
      return;
    }

    if (trimmed.startsWith("```")) {
      inCode = false;
      return;
    }

    codeLines.push(rawLine);
  });

  while (codeLines.length && !codeLines[0].trim()) {
    codeLines.shift();
  }
  while (codeLines.length && !codeLines[codeLines.length - 1].trim()) {
    codeLines.pop();
  }

  return {
    code: codeLines.join("\n"),
    language,
  };
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

function extractImageCaptionLines(lines = []) {
  const captionLines = [];
  let pastImages = false;

  lines.forEach((rawLine) => {
    if (!pastImages) {
      if (!rawLine.trim()) return;
      if (parseImageSourceFromLine(rawLine)) return; // skip all image lines
      pastImages = true;
    }
    captionLines.push(rawLine);
  });

  while (captionLines.length && !captionLines[0].trim()) {
    captionLines.shift();
  }
  while (captionLines.length && !captionLines[captionLines.length - 1].trim()) {
    captionLines.pop();
  }

  return captionLines;
}

function parsePublicationBlocks(lines = []) {
  const blocks = [];
  let current = null;

  const flush = () => {
    if (!current) {
      return;
    }
    if (current.title || current.lines.some((line) => line.trim())) {
      blocks.push(current);
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    const heading = trimmed.match(/^###\s+(.+)$/);

    if (heading) {
      flush();
      current = { title: heading[1].trim(), lines: [] };
      return;
    }

    if (!current) {
      if (!trimmed) {
        return;
      }
      current = { title: "", lines: [] };
    }

    current.lines.push(line);
  });

  flush();
  return blocks;
}

function parsePublicationMeta(lines = []) {
  const meta = {};
  const body = [];

  lines.forEach((rawLine) => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      body.push(rawLine);
      return;
    }

    const keyValueMatched = trimmed.match(/^-+\s*([^:]+):\s*(.+)$/);
    if (!keyValueMatched) {
      body.push(rawLine);
      return;
    }

    meta[normalizeSectionKey(keyValueMatched[1])] = keyValueMatched[2].trim();
  });

  return { meta, body };
}

function getMetaValue(meta, aliases = []) {
  for (const alias of aliases) {
    const key = normalizeSectionKey(alias);
    if (meta[key]) {
      return meta[key];
    }
  }
  return "";
}

function createFallbackPublication(project, summaryText) {
  return {
    title: project.title || "Publication",
    authors: project.author || "Author",
    venue: project.venue || "Venue",
    abstract: summaryText || "Abstract will be updated soon.",
    link: (project.link || "").trim(),
    thumbnail: "",
  };
}

function parsePublications(section, project, summaryText, contentPath = "") {
  if (!section) {
    return [createFallbackPublication(project, summaryText)];
  }

  const blocks = parsePublicationBlocks(section.lines);
  if (!blocks.length) {
    return [createFallbackPublication(project, summaryText)];
  }

  const items = blocks
    .map((block) => {
      const { meta, body } = parsePublicationMeta(block.lines);
      const title = block.title || getMetaValue(meta, ["title"]) || project.title || "Publication";
      const authors = getMetaValue(meta, ["authors", "author"]) || project.author || "Author";
      const venue = getMetaValue(meta, ["venue", "conference", "journal"]) || project.venue || "Venue";
      const linkRaw = getMetaValue(meta, ["link", "paper", "url"]);
      const link = resolveContentPath(linkRaw, contentPath);
      const thumbnailRaw = getMetaValue(meta, ["thumbnail", "thumb", "image"]);
      const thumbnail = resolveContentPath(thumbnailRaw, contentPath);
      const abstractFromMeta = getMetaValue(meta, ["abstract", "summary", "description"]);
      const abstractFromBody = markdownLinesToPlainText(body);
      const abstract = abstractFromMeta || abstractFromBody || summaryText || "Abstract will be updated soon.";

      return { title, authors, venue, abstract, link, thumbnail };
    })
    .filter((item) => item.title || item.authors || item.venue);

  if (!items.length) {
    return [createFallbackPublication(project, summaryText)];
  }

  return items;
}

function getArxivPdfLink(link = "") {
  const matched = link.match(/arxiv\.org\/abs\/([^?#]+)/i);
  if (!matched) {
    return "";
  }
  return `https://arxiv.org/pdf/${matched[1]}.pdf`;
}

function getArxivId(link = "") {
  const matched = link.match(/arxiv\.org\/abs\/([^?#]+)/i);
  return matched ? matched[1] : "";
}

function toBibtexAuthors(authors = "") {
  return authors
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" and ");
}

function buildBibtex(project, arxivLink) {
  const year = getProjectYear(project);
  const arxivId = getArxivId(arxivLink);
  const firstAuthor = (project.author || "author").split(",")[0].replace(/[^a-zA-Z]/g, "").toLowerCase();
  const key = `${firstAuthor || "author"}${year}`;
  const title = project.title || "Untitled Project";
  const authors = toBibtexAuthors(project.author || "Unknown");
  const venue = project.venue || "Unknown Venue";

  if (arxivId) {
    return `@article{${key},
  title={${title}},
  author={${authors}},
  journal={arXiv preprint arXiv:${arxivId}},
  year={${year}}
}`;
  }

  return `@inproceedings{${key},
  title={${title}},
  author={${authors}},
  booktitle={${venue}},
  year={${year}}
}`;
}

function buildHeroSlider(slug, sources = []) {
  heroEl.innerHTML = "";
  heroEl.style.backgroundImage = "";
  heroEl.classList.remove("has-image", "has-slider");

  if (!sources.length) {
    const fallbacks = [
      `assets/images/projects/${slug}.png`,
      `assets/images/projects/${slug}.jpg`,
      `assets/images/projects/${slug}.jpeg`,
      `assets/images/projects/${slug}.webp`,
    ];
    let i = 0;
    const tryNext = () => {
      if (i >= fallbacks.length) return;
      const src = fallbacks[i++];
      const img = new Image();
      img.onload = () => { heroEl.style.backgroundImage = `url("${src}")`; heroEl.classList.add("has-image"); };
      img.onerror = tryNext;
      img.src = src;
    };
    tryNext();
    return;
  }

  if (sources.length === 1) {
    heroEl.style.backgroundImage = `url("${sources[0]}")`;
    heroEl.classList.add("has-image");
    return;
  }

  // Multiple images → slider
  heroEl.classList.add("has-image", "has-slider");

  const track = document.createElement("div");
  track.className = "hero-track";
  sources.forEach((src) => {
    const slide = document.createElement("div");
    slide.className = "hero-slide";
    slide.style.backgroundImage = `url("${src}")`;
    track.appendChild(slide);
  });
  heroEl.appendChild(track);

  const dotsEl = document.createElement("div");
  dotsEl.className = "hero-dots";
  dotsEl.setAttribute("aria-hidden", "true");
  sources.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "hero-dot" + (i === 0 ? " active" : "");
    dotsEl.appendChild(dot);
  });
  heroEl.appendChild(dotsEl);

  const prevBtn = document.createElement("button");
  prevBtn.className = "hero-nav-btn hero-prev";
  prevBtn.type = "button";
  prevBtn.setAttribute("aria-label", "이전 슬라이드");
  prevBtn.textContent = "‹";
  heroEl.appendChild(prevBtn);

  const nextBtn = document.createElement("button");
  nextBtn.className = "hero-nav-btn hero-next";
  nextBtn.type = "button";
  nextBtn.setAttribute("aria-label", "다음 슬라이드");
  nextBtn.textContent = "›";
  heroEl.appendChild(nextBtn);

  let current = 0;
  const dots = dotsEl.querySelectorAll(".hero-dot");

  function goTo(idx) {
    current = ((idx % sources.length) + sources.length) % sources.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

  heroEl.setAttribute("tabindex", "0");
  heroEl.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });
}

function createActionNode(label, url) {
  if (!url) {
    const node = document.createElement("span");
    node.className = "project-detail-action is-disabled";
    node.textContent = label;
    node.setAttribute("aria-disabled", "true");
    return node;
  }

  const node = document.createElement("a");
  node.className = "project-detail-action";
  node.href = url;
  node.target = "_blank";
  node.rel = "noreferrer";
  node.textContent = label;
  return node;
}

function buildAffiliation(project) {
  if (project.category === "industrial") {
    return "KETI Korea Electronics Technology Institute";
  }
  return "Research Collaboration";
}

function renderActions(project, resources) {
  actionsEl.innerHTML = "";

  const entries = [];
  const seenUrls = new Set();

  // Resources section from md (key: url pairs) — use as-is
  Object.entries(resources).forEach(([rawKey, url]) => {
    const trimmed = (url || "").trim();
    if (!trimmed || seenUrls.has(trimmed)) return;
    seenUrls.add(trimmed);
    const label = rawKey.trim().charAt(0).toUpperCase() + rawKey.trim().slice(1);
    entries.push({ label, url: trimmed });
  });

  // project.link — add if not already present
  const projectLink = (project.link || "").trim();
  if (projectLink && !seenUrls.has(projectLink)) {
    seenUrls.add(projectLink);
    const isArxiv = projectLink.includes("arxiv.org");
    entries.unshift({ label: isArxiv ? "arXiv" : "Paper", url: projectLink });
  }

  // project.code — add if not already present
  const projectCode = (project.code || "").trim();
  if (projectCode && !seenUrls.has(projectCode)) {
    seenUrls.add(projectCode);
    entries.push({ label: "Code", url: projectCode });
  }

  entries.forEach(({ label, url }) => actionsEl.appendChild(createActionNode(label, url)));

  // Return derived links for bibtex
  const primaryLink = (entries[0]?.url || projectLink || "").trim();
  const arxivLink = entries.find(e => e.url.includes("arxiv.org"))?.url || "";
  const pdfLink = (resources.pdf || getArxivPdfLink(arxivLink) || "").trim();
  const videoLink = (resources.video || "").trim();
  const codeLink = (resources.code || projectCode || "").trim();

  return { primaryLink, arxivLink, pdfLink, videoLink, codeLink };
}

function renderContentRows(sections, skipKeys) {
  if (!contentEl) return;
  contentEl.innerHTML = "";
  Object.keys(sections).forEach((key) => {
    if (skipKeys.has(key)) return;
    const section = sections[key];
    if (!section || !section.lines.some((l) => l.trim())) return;

    const row = document.createElement("div");
    row.className = "project-detail-row";

    const label = document.createElement("h2");
    label.className = "project-detail-row-label";
    label.textContent = section.title;
    row.appendChild(label);

    const body = document.createElement("div");
    body.className = "project-detail-row-body";
    body.innerHTML = markdownLinesToHtml(section.lines);
    row.appendChild(body);

    contentEl.appendChild(row);
  });
}

function renderAbstract(lines = []) {
  if (!lines.length) {
    abstractEl.innerHTML = "<p>Project abstract will be updated soon.</p>";
    return;
  }

  abstractEl.innerHTML = markdownLinesToHtml(lines);
}

function renderPublications(items = []) {
  publicationsEl.innerHTML = "";

  items.forEach((item) => {
    const publication = document.createElement("article");
    publication.className = "project-publication-item";

    const thumb = document.createElement(item.link ? "a" : "div");
    thumb.className = item.link
      ? "project-publication-thumb project-publication-thumb-link"
      : "project-publication-thumb";
    thumb.setAttribute("aria-hidden", "true");
    if (item.link) {
      thumb.href = item.link;
      thumb.target = "_blank";
      thumb.rel = "noreferrer";
      thumb.setAttribute("aria-label", `${item.title} link`);
      thumb.removeAttribute("aria-hidden");
    }
    if (item.thumbnail) {
      thumb.style.backgroundImage = `url("${item.thumbnail}")`;
      thumb.classList.add("has-image");
    }

    const meta = document.createElement("div");
    meta.className = "project-publication-meta";

    const title = document.createElement("h3");
    title.className = "project-publication-title";
    title.textContent = item.title || "Publication";
    if (item.link) {
      const titleLink = document.createElement("a");
      titleLink.className = "project-publication-title-link";
      titleLink.href = item.link;
      titleLink.target = "_blank";
      titleLink.rel = "noreferrer";
      titleLink.appendChild(title);
      meta.appendChild(titleLink);
    } else {
      meta.appendChild(title);
    }

    const authors = document.createElement("p");
    authors.className = "project-publication-authors";
    authors.textContent = item.authors || "Author";
    meta.appendChild(authors);

    const venue = document.createElement("p");
    venue.className = "project-publication-venue";
    venue.textContent = item.venue || "Venue";
    meta.appendChild(venue);

    const toggle = document.createElement("button");
    toggle.className = "project-publication-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Show abstract >";
    meta.appendChild(toggle);

    const abstractText = document.createElement("p");
    abstractText.className = "project-publication-abstract";
    abstractText.hidden = true;
    abstractText.textContent = item.abstract || "Abstract will be updated soon.";
    meta.appendChild(abstractText);

    toggle.addEventListener("click", () => {
      const opened = !abstractText.hidden;
      abstractText.hidden = opened;
      toggle.setAttribute("aria-expanded", opened ? "false" : "true");
      toggle.textContent = opened ? "Show abstract >" : "Hide abstract >";
    });

    publication.appendChild(thumb);
    publication.appendChild(meta);
    publicationsEl.appendChild(publication);
  });
}

function setCopySuccessState(copied) {
  if (copied) {
    bibtexCopyIcon.src = "assets/icons/copy_success.svg";
    bibtexCopyButton.classList.add("is-copied");
    if (copiedIconTimer) {
      clearTimeout(copiedIconTimer);
    }
    copiedIconTimer = setTimeout(() => {
      bibtexCopyIcon.src = "assets/icons/copy.svg";
      bibtexCopyButton.classList.remove("is-copied");
    }, 1200);
    return;
  }

  bibtexCopyIcon.src = "assets/icons/copy.svg";
  bibtexCopyButton.classList.remove("is-copied");
}

async function copyBibtex() {
  const text = bibtexEl.textContent || "";
  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setCopySuccessState(true);
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    setCopySuccessState(copied);
  }
}

async function loadProject() {
  const slug = getQuerySlug();

  try {
    const listResponse = await fetch("projects/projects.json");
    if (!listResponse.ok) {
      throw new Error("projects.json not found");
    }
    const projects = await listResponse.json();

    const project = projects.find((item) => item.slug === slug) || projects[0];
    if (!project) {
      throw new Error("project not found");
    }

    let markdown = "";
    if (project.content) {
      const contentResponse = await fetch(project.content);
      if (contentResponse.ok) {
        markdown = await contentResponse.text();
      }
    }

    const fm = parseFrontmatter(markdown);
    const sections = parseMarkdownSections(stripFrontmatter(markdown));

    const summarySectionKey = getSectionKey(sections, [
      "summary",
      "intro",
      "introduction",
      "overview",
    ]);
    const abstractSectionKey = getSectionKey(sections, ["abstract", "details", "description"]);
    const contributionSectionKey = getSectionKey(sections, ["key contributions", "contributions"]);
    const resourcesSectionKey = getSectionKey(sections, ["resources", "links"]);
    const heroImageSectionKey = getSectionKey(sections, ["show", "hero image", "hero", "image", "cover"]);
    const imageCaptionSectionKey = getSectionKey(sections, [
      "figure caption",
      "image caption",
      "caption",
      "figure description",
      "image description",
      "그림 설명",
      "이미지 설명",
      "캡션",
    ]);
    const bibtexSectionKey = getSectionKey(sections, ["bibtex", "bib", "citation"]);
    const codeSectionKey = getSectionKey(sections, ["code", "snippet", "sample code"]);
    const publicationsSectionKey = getSectionKey(sections, ["publications", "publication"]);

    const summarySection = summarySectionKey ? sections[summarySectionKey] : null;
    const abstractSection = abstractSectionKey ? sections[abstractSectionKey] : null;
    const contributionSection = contributionSectionKey ? sections[contributionSectionKey] : null;
    const resourcesSection = resourcesSectionKey ? sections[resourcesSectionKey] : null;
    const heroImageSection = heroImageSectionKey ? sections[heroImageSectionKey] : null;
    const imageCaptionSection = imageCaptionSectionKey ? sections[imageCaptionSectionKey] : null;
    const bibtexSection = bibtexSectionKey ? sections[bibtexSectionKey] : null;
    const codeSection = codeSectionKey ? sections[codeSectionKey] : null;
    const publicationsSection = publicationsSectionKey ? sections[publicationsSectionKey] : null;

    const resources = parseResources(resourcesSection ? resourcesSection.lines : []);
    // Frontmatter links override resources section
    const fmResources = {};
    fm.links.forEach(({ label, url }) => { if (label) fmResources[label.toLowerCase()] = url || ""; });
    const effectiveResources = Object.keys(fmResources).length ? { ...fmResources, ...resources } : resources;
    const summaryText = getSummaryText(summarySection, abstractSection);
    const links = renderActions(project, effectiveResources);

    titleEl.textContent = fm.title || project.title || "{Project Name}";
    authorEl.textContent = fm.author || project.author || "{Author}";
    affiliationEl.textContent = fm.affiliation || buildAffiliation(project);
    venueEl.textContent = fm.venue || project.venue || "{conference name / conference}";
    const heroCaptionLines = heroImageSection ? extractImageCaptionLines(heroImageSection.lines) : [];
    const imageCaptionLines = imageCaptionSection ? imageCaptionSection.lines : [];
    const captionLines = heroCaptionLines.length ? heroCaptionLines : imageCaptionLines;
    if (captionLines.length) {
      summaryEl.innerHTML = markdownLinesToHtml(captionLines);
    } else if (summarySection?.lines?.length) {
      summaryEl.innerHTML = markdownLinesToHtml(summarySection.lines);
    } else {
      summaryEl.textContent = summaryText || "Project summary will be updated soon.";
    }

    // Render content as 2-column rows: ## title (left) + content (right)
    const contentSkipKeys = new Set(
      [
        summarySectionKey,
        heroImageSectionKey,
        imageCaptionSectionKey,
        resourcesSectionKey,
        bibtexSectionKey,
        codeSectionKey,
        publicationsSectionKey,
      ].filter(Boolean)
    );
    renderContentRows(sections, contentSkipKeys);

    // Hidden section refs (kept for bibtex/publications logic)
    renderAbstract([]);

    const bibtexOrCodeSection = bibtexSection || codeSection;
    const customCode = extractCodeBlock(bibtexOrCodeSection ? bibtexOrCodeSection.lines : []);
    const bibtex = customCode.code || buildBibtex(project, links.arxivLink || links.primaryLink);
    const codeLanguage = customCode.code
      ? customCode.language || (bibtexSection ? "bibtex" : "text")
      : "bibtex";
    bibtexEl.textContent = bibtex;
    bibtexEl.className = `language-${codeLanguage}`;

    if (bibtexSection) {
      bibtexCopyButton.title = "Copy BibTeX";
      bibtexCopyButton.setAttribute("aria-label", "Copy BibTeX");
    } else if (codeSection) {
      bibtexCopyButton.title = "Copy Code";
      bibtexCopyButton.setAttribute("aria-label", "Copy Code");
    } else {
      bibtexCopyButton.title = "Copy BibTeX";
      bibtexCopyButton.setAttribute("aria-label", "Copy BibTeX");
    }

    abstractLabelEl.textContent = abstractSection?.title || summarySection?.title || "ABSTRACT";
    bibtexLabelEl.textContent = bibtexOrCodeSection?.title || "BIBTEX";
    publicationsLabelEl.textContent = publicationsSection?.title || "PUBLICATIONS";

    const publications = parsePublications(
      publicationsSection,
      project,
      summaryText,
      (project.content || "").trim()
    );
    renderPublications(publications);

    setCopySuccessState(false);

    document.title = `${fm.title || project.title} | Dongwoo Kang`;
    const heroImageSources = heroImageSection
      ? extractAllImageSources(heroImageSection.lines, (project.content || "").trim())
      : [];
    buildHeroSlider(project.slug || "", heroImageSources);
  } catch (error) {
    titleEl.textContent = "Project not found";
    authorEl.textContent = "";
    affiliationEl.textContent = "";
    venueEl.textContent = "";
    actionsEl.innerHTML = "";
    summaryEl.textContent = "Failed to load project data.";
    abstractEl.innerHTML = "<p>Failed to load project details.</p>";
    abstractLabelEl.textContent = "ABSTRACT";
    bibtexLabelEl.textContent = "BIBTEX";
    publicationsLabelEl.textContent = "PUBLICATIONS";
    bibtexEl.textContent = "";
    publicationsEl.innerHTML = "";
  }
}

bibtexCopyButton.addEventListener("click", copyBibtex);

menuToggleButton.addEventListener("click", () => {
  if (mobileOverlay.classList.contains("open")) {
    closeMobileMenu();
    return;
  }
  openMobileMenu();
});

mobileOverlay.addEventListener("click", (event) => {
  if (event.target === mobileOverlay) {
    closeMobileMenu();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    closeMobileMenu();
  }
});

loadProject();

// ── FLIP title animation ─────────────────────────────
// Called inside loadProject() after title is set — patched via wrapper below.
function runFlipAnimation(slug) {
  const key = "flip:" + slug;
  const stored = sessionStorage.getItem(key);
  if (!stored) return;
  sessionStorage.removeItem(key);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const from = JSON.parse(stored);

  requestAnimationFrame(() => {
    const rect = titleEl.getBoundingClientRect();
    const toAbsTop = rect.top + window.scrollY;
    const fromAbsTop = from.titleTop + from.scrollY;
    const dy = fromAbsTop - toAbsTop;

    // Start from card's position
    titleEl.style.willChange = "transform, opacity";
    titleEl.style.transform = `translateY(${dy}px)`;
    titleEl.style.opacity = "0.5";
    titleEl.style.transition = "none";

    // Force reflow
    titleEl.getBoundingClientRect();

    // Animate to final position
    titleEl.style.transition = "transform 0.72s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease";
    titleEl.style.transform = "";
    titleEl.style.opacity = "";

    titleEl.addEventListener("transitionend", () => {
      titleEl.style.willChange = "";
      titleEl.style.transform = "";
      titleEl.style.transition = "";
      titleEl.style.opacity = "";
    }, { once: true });
  });
}

// Also FLIP the hero from the card's thumb rect
function runHeroFlipAnimation(slug) {
  const key = "flip:thumb:" + slug;
  const stored = sessionStorage.getItem(key);
  if (!stored) return;
  sessionStorage.removeItem(key);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const from = JSON.parse(stored);
  const heroRect = heroEl.getBoundingClientRect();
  const toAbsTop = heroRect.top + window.scrollY;
  const fromAbsTop = from.top + from.scrollY;

  const dy = fromAbsTop - toAbsTop;
  const scaleX = from.width / heroRect.width;
  const scaleY = from.height / heroRect.height;

  heroEl.style.willChange = "transform, opacity";
  heroEl.style.transformOrigin = "top left";
  heroEl.style.transform = `translateY(${dy}px) scaleX(${scaleX}) scaleY(${scaleY})`;
  heroEl.style.opacity = "0.6";
  heroEl.style.transition = "none";

  heroEl.getBoundingClientRect();

  heroEl.style.transition = "transform 0.72s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease";
  heroEl.style.transform = "";
  heroEl.style.opacity = "";

  heroEl.addEventListener("transitionend", () => {
    heroEl.style.willChange = "";
    heroEl.style.transformOrigin = "";
    heroEl.style.transform = "";
    heroEl.style.transition = "";
    heroEl.style.opacity = "";
  }, { once: true });
}

// Patch loadProject to call FLIP after content is set
const _origLoadProject = loadProject;
(async function patchedLoad() {
  // loadProject already called above; intercept future slug reads via MutationObserver on title
  const slug = new URLSearchParams(window.location.search).get("slug") || "";
  if (!slug) return;

  // Wait for title to be populated (text changes from "{Project Name}")
  const observer = new MutationObserver(() => {
    if (titleEl.textContent && titleEl.textContent !== "{Project Name}") {
      observer.disconnect();
      runFlipAnimation(slug);
      runHeroFlipAnimation(slug);
    }
  });
  observer.observe(titleEl, { childList: true, subtree: true, characterData: true });
})();

// ── Dark mode ────────────────────────────────────────
const darkToggleBtn = document.getElementById("dark-toggle");
const floatingText = document.getElementById("floating-indicator-text");

function setDark(val) {
  document.body.classList.toggle("dark", val);
  localStorage.setItem("theme", val ? "dark" : "light");
  if (darkToggleBtn) darkToggleBtn.textContent = val ? "☀" : "☾";
  if (floatingText) floatingText.textContent = val ? "DARK_MODE" : "AVAILABLE";
}

const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setDark(savedTheme === "dark" || (savedTheme === null && prefersDark));

if (darkToggleBtn) {
  darkToggleBtn.addEventListener("click", () => {
    setDark(!document.body.classList.contains("dark"));
  });
}

// ── Header scroll ────────────────────────────────────
const siteHeaderEl = document.querySelector(".site-header");
if (siteHeaderEl) {
  const onScroll = () => siteHeaderEl.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ── Mouse glow ───────────────────────────────────────
const mouseGlow = document.getElementById("mouse-glow");
if (mouseGlow) {
  window.addEventListener("mousemove", (e) => {
    mouseGlow.style.left = e.clientX + "px";
    mouseGlow.style.top = e.clientY + "px";
  }, { passive: true });
}

// ── Back navigation exit animation ──────────────────
document.querySelectorAll('a[href*="projects.html"], a[href="index.html"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    if (link.target === "_blank") return;
    e.preventDefault();
    const href = link.href;
    const mainEl = document.querySelector(".project-detail-main");
    if (mainEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      mainEl.classList.add("page-exiting");
      setTimeout(() => { window.location.href = href; }, 220);
    } else {
      window.location.href = href;
    }
  });
});
