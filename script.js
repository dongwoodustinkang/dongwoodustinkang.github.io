const tabButtons = document.querySelectorAll(".tab-button[data-target]");
const panels = document.querySelectorAll(".panel");
const homeContent = document.getElementById("home-content");
const businessCard = document.getElementById("business-card");
const homeVisual = document.getElementById("home-visual");
const brandHomeButton = document.getElementById("brand-home");
let cardFlipped = false;

function setActivePanel(target) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.target === target;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === target);
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActivePanel(button.dataset.target);
    window.location.hash = button.dataset.target;
    closeMobileMenu();
  });
});

brandHomeButton.addEventListener("click", () => {
  setActivePanel("home");
  window.location.hash = "home";
  closeMobileMenu();
});

function getInitialPanel() {
  const hash = window.location.hash.replace("#", "");
  return hash === "contact" ? "contact" : "home";
}

function parseInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function markdownToHtml(markdownText) {
  const html = [];
  let inList = false;
  const closeList = () => { if (inList) { html.push("</ul>"); inList = false; } };

  markdownText.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) { closeList(); return; }
    if (line.startsWith("# "))   { closeList(); html.push(`<h1>${parseInlineMarkdown(line.slice(2))}</h1>`); return; }
    if (line.startsWith("## "))  { closeList(); html.push(`<h2>${parseInlineMarkdown(line.slice(3))}</h2>`); return; }
    if (line.startsWith("### ")) { closeList(); html.push(`<h3>${parseInlineMarkdown(line.slice(4))}</h3>`); return; }
    if (line.startsWith("- ")) {
      if (!inList) { html.push("<ul>"); inList = true; }
      html.push(`<li>${parseInlineMarkdown(line.slice(2))}</li>`);
      return;
    }
    closeList();
    html.push(`<p>${parseInlineMarkdown(line)}</p>`);
  });
  closeList();
  return html.join("\n");
}

function setupHomeVisualFlip() {
  if (!homeVisual) return;
  const syncState = () => homeVisual.setAttribute("aria-pressed", homeVisual.classList.contains("is-flipped") ? "true" : "false");
  const toggle = () => { homeVisual.classList.toggle("is-flipped"); syncState(); };
  homeVisual.addEventListener("click", toggle);
  homeVisual.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  syncState();
}

async function loadHomeMarkdown() {
  try {
    const res = await fetch("content/home.md");
    if (!res.ok) throw new Error();
    homeContent.innerHTML = markdownToHtml(await res.text());
  } catch (_) {
    homeContent.innerHTML = "<p>홈 소개 파일을 불러오지 못했습니다. <code>content/home.md</code>를 확인해주세요.</p>";
  }
}

function setCardTransform(xRatio, yRatio) {
  businessCard.style.transform = `rotateX(${yRatio * -10}deg) rotateY(${(cardFlipped ? 180 : 0) + xRatio * 12}deg)`;
}
function resetCardTransform() {
  businessCard.style.transform = `rotateX(0deg) rotateY(${cardFlipped ? 180 : 0}deg)`;
}

businessCard.addEventListener("mousemove", (e) => {
  const r = businessCard.getBoundingClientRect();
  setCardTransform((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
});
businessCard.addEventListener("mouseleave", resetCardTransform);
businessCard.addEventListener("touchmove", (e) => {
  const t = e.touches[0], r = businessCard.getBoundingClientRect();
  setCardTransform((t.clientX - r.left) / r.width * 2 - 1, (t.clientY - r.top) / r.height * 2 - 1);
});
businessCard.addEventListener("touchend", resetCardTransform);
businessCard.addEventListener("blur", resetCardTransform);

const flipCard = () => { cardFlipped = !cardFlipped; businessCard.classList.toggle("flipped", cardFlipped); resetCardTransform(); };
businessCard.addEventListener("dblclick", flipCard);
businessCard.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipCard(); } });

setActivePanel(getInitialPanel());
setupHomeVisualFlip();
loadHomeMarkdown();

// ── Home projects: up to 2 projects, fully dynamic ───
async function parseMdForProject(contentPath) {
  if (!contentPath) return {};
  try {
    const res = await fetch(contentPath);
    if (!res.ok) return {};
    const mdText = await res.text();
    const lines  = mdText.split(/\r?\n/);
    const fm     = parseFrontmatter(mdText);
    let inShow = false, inOverview = false, showThumb = "";
    const overviewLines = [];
    for (const line of lines) {
      if (/^## Show\s*$/i.test(line.trim()))     { inShow = true;  inOverview = false; continue; }
      if (/^## Overview\s*$/i.test(line.trim())) { inOverview = true; inShow = false; continue; }
      if (/^## /.test(line)) { inShow = false; if (inOverview) break; }
      if (inShow && !showThumb) {
        const src = line.trim();
        if (src && /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(src)) showThumb = src;
      }
      if (inOverview && line.trim()) overviewLines.push(line.trim());
    }
    return { fm, thumbnail: showThumb, overview: overviewLines.join(" ") };
  } catch (_) { return {}; }
}

function buildProjectItem(p, mdData, idx) {
  const { fm = {}, thumbnail = "", overview = "" } = mdData;
  const title       = fm.title  || p.title  || "";
  const author      = fm.author || p.author || "";
  const venue       = fm.venue  || p.venue  || "";
  const thumbSrc    = thumbnail || p.thumbnail || "";
  const abstractText = overview || p.abstract || "";
  const hiddenId    = `home-project-hidden-${idx + 1}`;
  const detailUrl   = p.slug ? `project-detail.html?slug=${encodeURIComponent(p.slug)}` : "#";
  const reduced     = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Thumb ──
  const thumbEl = document.createElement("div");
  thumbEl.className = "home-project-thumb";
  thumbEl.setAttribute("aria-hidden", "true");
  if (thumbSrc) { thumbEl.style.backgroundImage = `url("${thumbSrc}")`; thumbEl.classList.add("has-image"); }

  const overlay = document.createElement("span");
  overlay.className = "home-project-thumb-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.textContent = "EXPLORE →";

  const thumbLink = document.createElement("a");
  thumbLink.href = detailUrl;
  thumbLink.className = "home-project-thumb-link";
  thumbLink.setAttribute("aria-label", `View project: ${title}`);
  thumbLink.appendChild(thumbEl);
  thumbLink.appendChild(overlay);

  // ── Details ──
  const nameEl = document.createElement("h3");
  nameEl.className = "home-project-name";
  nameEl.textContent = title;

  const nameLink = document.createElement("a");
  nameLink.href = detailUrl;
  nameLink.className = "home-project-name-link";
  nameLink.appendChild(nameEl);

  const authorEl = document.createElement("p");
  authorEl.className = "home-project-author";
  authorEl.textContent = author;

  const venueEl = document.createElement("p");
  venueEl.className = "home-project-venue";
  venueEl.textContent = venue;

  const details = document.createElement("div");
  details.className = "home-project-details";
  details.appendChild(nameLink);
  details.appendChild(authorEl);
  details.appendChild(venueEl);

  // ── Abstract button + hidden paragraph ──
  const hiddenEl = document.createElement("p");
  hiddenEl.id = hiddenId;
  hiddenEl.className = "home-project-hidden";
  hiddenEl.hidden = true;
  hiddenEl.textContent = abstractText;

  if (abstractText) {
    const abstractBtn = document.createElement("button");
    abstractBtn.className = "home-project-abstract";
    abstractBtn.type = "button";
    abstractBtn.setAttribute("aria-expanded", "false");
    abstractBtn.setAttribute("aria-controls", hiddenId);
    abstractBtn.textContent = "abstract ↓";
    abstractBtn.addEventListener("click", () => {
      hiddenEl.hidden = !hiddenEl.hidden;
      const expanded = !hiddenEl.hidden;
      abstractBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      abstractBtn.textContent = expanded ? "abstract ↑" : "abstract ↓";
    });
    details.appendChild(abstractBtn);
  }

  // ── Article ──
  const article = document.createElement("article");
  article.className = "home-project-item";
  article.appendChild(thumbLink);
  article.appendChild(details);

  // ── Navigation with FLIP ──
  function navigateToDetail(e) {
    e.preventDefault();
    if (p.slug) {
      sessionStorage.setItem("flip:" + p.slug, JSON.stringify({
        titleTop: nameEl.getBoundingClientRect().top,
        scrollY: window.scrollY,
      }));
    }
    const mainEl = document.querySelector("main");
    if (mainEl && !reduced) {
      mainEl.classList.add("page-exiting");
      setTimeout(() => { window.location.href = detailUrl; }, 220);
    } else {
      window.location.href = detailUrl;
    }
  }
  thumbLink.addEventListener("click", navigateToDetail);
  nameLink.addEventListener("click", navigateToDetail);

  return { article, hiddenEl };
}

async function loadHomeProject() {
  const section = document.querySelector(".home-projects");
  if (!section) return;

  let projects;
  try {
    const res = await fetch("projects/projects.json");
    if (!res.ok) return;
    projects = await res.json();
  } catch (_) { return; }
  if (!projects || !projects.length) return;

  const shown = projects.slice(0, 2);

  // Fetch md metadata for all shown projects in parallel
  const mdDataList = await Promise.all(shown.map((p) => parseMdForProject(p.content)));

  // Remove static template items, keep title + view-all link
  section.querySelectorAll(".home-project-item, .home-project-hidden").forEach((el) => el.remove());
  const viewAll = section.querySelector(".view-all-projects");

  shown.forEach((p, idx) => {
    const { article, hiddenEl } = buildProjectItem(p, mdDataList[idx], idx);
    section.insertBefore(article, viewAll);
    section.insertBefore(hiddenEl, viewAll);
  });
}

// Remove page-exiting class when page is restored from bfcache
window.addEventListener("pageshow", () => {
  document.querySelector("main")?.classList.remove("page-exiting");
});

loadHomeProject();
