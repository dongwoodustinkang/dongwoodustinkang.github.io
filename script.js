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

// ── Home projects: dynamic first project ─────────────
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
  const p = projects[0];

  const article = section.querySelector(".home-project-item");
  const hiddenAbstract = section.querySelector(".home-project-hidden");
  if (!article) return;

  const nameEl    = article.querySelector(".home-project-name");
  const authorEl  = article.querySelector(".home-project-author");
  const venueEl   = article.querySelector(".home-project-venue");
  const abstractBtn = article.querySelector(".home-project-abstract");
  const thumbEl   = article.querySelector(".home-project-thumb");

  // JSON defaults
  if (nameEl)   nameEl.textContent   = p.title  || "";
  if (authorEl) authorEl.textContent = p.author || "";
  if (venueEl)  venueEl.textContent  = p.venue  || "";
  if (thumbEl && p.thumbnail) {
    thumbEl.style.backgroundImage = `url("${p.thumbnail}")`;
    thumbEl.classList.add("has-image");
  }

  // Fetch md: single pass for frontmatter override + ## Show thumbnail + ## Overview text
  let overviewText = "";
  if (p.content) {
    try {
      const mdRes = await fetch(p.content);
      if (mdRes.ok) {
        const mdText = await mdRes.text();
        const lines  = mdText.split(/\r?\n/);

        const fm = parseFrontmatter(mdText);
        if (fm.title  && nameEl)   nameEl.textContent   = fm.title;
        if (fm.author && authorEl) authorEl.textContent = fm.author;
        if (fm.venue  && venueEl)  venueEl.textContent  = fm.venue;

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
        overviewText = overviewLines.join(" ");
        if (showThumb && thumbEl) {
          thumbEl.style.backgroundImage = `url("${showThumb}")`;
          thumbEl.classList.add("has-image");
        }
      }
    } catch (_) {}
  }

  const abstractText = overviewText || p.abstract || "";
  if (hiddenAbstract && abstractText) {
    hiddenAbstract.textContent = abstractText;
  } else if (abstractBtn && !abstractText) {
    abstractBtn.hidden = true;
  }

  // Wire abstract toggle directly on this button (avoids re-binding all buttons)
  if (abstractBtn && hiddenAbstract) {
    hiddenAbstract.id = "home-project-hidden-1";
    abstractBtn.setAttribute("aria-controls", "home-project-hidden-1");
    abstractBtn.setAttribute("aria-expanded", "false");
    abstractBtn.textContent = "abstract ↓";
    abstractBtn.addEventListener("click", () => {
      hiddenAbstract.hidden = !hiddenAbstract.hidden;
      const expanded = !hiddenAbstract.hidden;
      abstractBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      abstractBtn.textContent = expanded ? "abstract ↑" : "abstract ↓";
    });
  }

  const detailUrl = `project-detail.html?slug=${encodeURIComponent(p.slug)}`;

  if (thumbEl && !thumbEl.closest("a")) {
    const thumbLink = document.createElement("a");
    thumbLink.href = detailUrl;
    thumbLink.className = "home-project-thumb-link";
    thumbLink.setAttribute("aria-label", `View project: ${p.title}`);
    thumbEl.parentNode.insertBefore(thumbLink, thumbEl);
    thumbLink.appendChild(thumbEl);
    const overlay = document.createElement("span");
    overlay.className = "home-project-thumb-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.textContent = "EXPLORE →";
    thumbLink.appendChild(overlay);
  }

  if (nameEl && !nameEl.closest("a")) {
    const nameLink = document.createElement("a");
    nameLink.href = detailUrl;
    nameLink.className = "home-project-name-link";
    nameEl.parentNode.insertBefore(nameLink, nameEl);
    nameLink.appendChild(nameEl);
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function navigateToDetail(e) {
    e.preventDefault();
    if (nameEl) {
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

  const thumbLink = section.querySelector(".home-project-thumb-link");
  if (thumbLink) thumbLink.addEventListener("click", navigateToDetail);
  const nameLink = section.querySelector(".home-project-name-link");
  if (nameLink) nameLink.addEventListener("click", navigateToDetail);
}

loadHomeProject();
