const projectData = [
  {
    category: "industrial",
    title: "Predictive Maintenance Dashboard",
    description:
      "제조 설비 로그를 분석해 고장 확률을 예측하고, 현장 엔지니어를 위한 실시간 알림 대시보드를 구축했습니다.",
  },
  {
    category: "industrial",
    title: "Demand Forecasting for Retail",
    description:
      "프로모션/계절성 데이터를 결합해 판매량 예측 모델을 개선하고 재고 비용을 절감한 프로젝트입니다.",
  },
  {
    category: "academic",
    title: "Graph Neural Network Research",
    description:
      "이종 그래프에서 노드 분류 성능을 높이기 위한 attention 기반 메시지 전달 기법을 연구했습니다.",
  },
  {
    category: "academic",
    title: "HCI Study for AI Tutor",
    description:
      "학습자의 이해도를 높이는 설명 인터페이스를 설계하고 사용자 실험을 통해 효과를 검증했습니다.",
  },
];

const tabButtons = document.querySelectorAll(".tab-button[data-target]");
const panels = document.querySelectorAll(".panel");
const projectGrid = document.getElementById("project-grid");
const filterButtons = document.querySelectorAll(".filter-button");
const homeContent = document.getElementById("home-content");
const businessCard = document.getElementById("business-card");
const homeVisual = document.getElementById("home-visual");
const brandHomeButton = document.getElementById("brand-home");
const menuToggleButton = document.getElementById("menu-toggle");
const mobileOverlay = document.getElementById("mobile-overlay");
const homeAbstractButtons = document.querySelectorAll(".home-project-abstract");
let cardFlipped = false;

function setActivePanel(target) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.target === target;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  panels.forEach((panel) => {
    const isActive = panel.id === target;
    panel.classList.toggle("active", isActive);
  });
}

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

function renderProjects(filter = "all") {
  if (!projectGrid) {
    return;
  }

  projectGrid.innerHTML = "";

  const filtered = filter === "all" ? projectData : projectData.filter((item) => item.category === filter);

  filtered.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.innerHTML = `
      <p class="project-meta">${project.category}</p>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
    `;
    projectGrid.appendChild(card);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    renderProjects(filter);
  });
});

function getInitialPanel() {
  const hash = window.location.hash.replace("#", "");
  if (hash === "contact") {
    return "contact";
  }
  return "home";
}

function escapeHtml(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseInlineMarkdown(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/==([^=]+)==/g, '<mark class="home-highlight">$1</mark>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function markdownToHtml(markdownText) {
  const lines = markdownText.split("\n");
  const html = [];
  let inList = false;

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      return;
    }

    if (line.startsWith("# ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h1>${parseInlineMarkdown(line.slice(2))}</h1>`);
      return;
    }

    if (line.startsWith("## ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h2>${parseInlineMarkdown(line.slice(3))}</h2>`);
      return;
    }

    if (line.startsWith("### ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${parseInlineMarkdown(line.slice(4))}</h3>`);
      return;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${parseInlineMarkdown(line.slice(2))}</li>`);
      return;
    }

    if (inList) {
      html.push("</ul>");
      inList = false;
    }

    html.push(`<p>${parseInlineMarkdown(line)}</p>`);
  });

  if (inList) {
    html.push("</ul>");
  }

  return html.join("\n");
}

function setupHomeAbstractToggles() {
  const setAbstractLabel = (button, isExpanded) => {
    button.textContent = isExpanded ? "abstract ↑" : "abstract ↓";
  };

  homeAbstractButtons.forEach((button) => {
    const targetId = button.getAttribute("aria-controls");
    if (!targetId) {
      return;
    }

    const hiddenAbstract = document.getElementById(targetId);
    if (!hiddenAbstract) {
      return;
    }

    const isExpandedInitially = !hiddenAbstract.hidden;
    button.setAttribute("aria-expanded", isExpandedInitially ? "true" : "false");
    setAbstractLabel(button, isExpandedInitially);

    button.addEventListener("click", () => {
      hiddenAbstract.hidden = !hiddenAbstract.hidden;
      const isExpanded = !hiddenAbstract.hidden;
      button.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      setAbstractLabel(button, isExpanded);
    });
  });
}

function setupHomeVisualFlip() {
  if (!homeVisual) {
    return;
  }

  const syncPressedState = () => {
    const isFlipped = homeVisual.classList.contains("is-flipped");
    homeVisual.setAttribute("aria-pressed", isFlipped ? "true" : "false");
  };

  const toggleFlip = () => {
    homeVisual.classList.toggle("is-flipped");
    syncPressedState();
  };

  homeVisual.addEventListener("click", toggleFlip);
  homeVisual.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFlip();
    }
  });

  syncPressedState();
}

async function loadHomeMarkdown() {
  try {
    const response = await fetch("content/home.md");
    if (!response.ok) {
      throw new Error("home.md file not found");
    }
    const markdown = await response.text();
    homeContent.innerHTML = markdownToHtml(markdown);
  } catch (error) {
    homeContent.innerHTML =
      "<p>홈 소개 파일을 불러오지 못했습니다. <code>content/home.md</code>를 확인해주세요.</p>";
  }
}

function setCardTransform(xRatio, yRatio) {
  const rotateY = xRatio * 12;
  const rotateX = yRatio * -10;
  const baseY = cardFlipped ? 180 : 0;
  businessCard.style.transform = `rotateX(${rotateX}deg) rotateY(${baseY + rotateY}deg)`;
}

function resetCardTransform() {
  const baseY = cardFlipped ? 180 : 0;
  businessCard.style.transform = `rotateX(0deg) rotateY(${baseY}deg)`;
}

businessCard.addEventListener("mousemove", (event) => {
  const rect = businessCard.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const xRatio = (x / rect.width - 0.5) * 2;
  const yRatio = (y / rect.height - 0.5) * 2;
  setCardTransform(xRatio, yRatio);
});

businessCard.addEventListener("mouseleave", resetCardTransform);

businessCard.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  const rect = businessCard.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  const xRatio = (x / rect.width - 0.5) * 2;
  const yRatio = (y / rect.height - 0.5) * 2;
  setCardTransform(xRatio, yRatio);
});

businessCard.addEventListener("touchend", resetCardTransform);
businessCard.addEventListener("blur", resetCardTransform);

businessCard.addEventListener("dblclick", () => {
  cardFlipped = !cardFlipped;
  businessCard.classList.toggle("flipped", cardFlipped);
  resetCardTransform();
});

businessCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    cardFlipped = !cardFlipped;
    businessCard.classList.toggle("flipped", cardFlipped);
    resetCardTransform();
  }
});

setActivePanel(getInitialPanel());
setupHomeVisualFlip();
setupHomeAbstractToggles();
loadHomeMarkdown();
renderProjects();

// ── Dark mode toggle ─────────────────────────────────
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

// ── Header scroll detection ──────────────────────────
const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  const onScroll = () => siteHeader.classList.toggle("scrolled", window.scrollY > 20);
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

  // Populate text fields (will be overridden by frontmatter below)
  const nameEl = article.querySelector(".home-project-name");
  const authorEl = article.querySelector(".home-project-author");
  const venueEl = article.querySelector(".home-project-venue");
  const abstractBtn = article.querySelector(".home-project-abstract");
  if (nameEl) nameEl.textContent = p.title || "";
  if (authorEl) authorEl.textContent = p.author || "";
  if (venueEl) venueEl.textContent = p.venue || "";

  // Thumb: set background image (## Show first image takes priority over json thumbnail)
  const thumbEl = article.querySelector(".home-project-thumb");
  if (thumbEl && p.thumbnail) {
    thumbEl.style.backgroundImage = `url("${p.thumbnail}")`;
    thumbEl.classList.add("has-image");
  }

  // Fetch md: parse frontmatter + ## Overview + ## Show thumbnail
  let overviewText = "";
  if (p.content) {
    try {
      const mdRes = await fetch(p.content);
      if (mdRes.ok) {
        const mdText = await mdRes.text();

        // Parse frontmatter
        const fmMatch = mdText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (fmMatch) {
          const fmLines = fmMatch[1].split(/\r?\n/);
          let listKey = null;
          for (const raw of fmLines) {
            const ln = raw.trim();
            if (!ln) continue;
            if (listKey && /^[*-]\s/.test(ln)) { listKey = null; continue; }
            listKey = null;
            const ci = ln.indexOf(":");
            if (ci === -1) continue;
            const key = ln.slice(0, ci).trim().toLowerCase();
            const val = ln.slice(ci + 1).trim().replace(/^["']|["']$/g, "");
            if (!val) { if (key === "links") listKey = "links"; continue; }
            if (key === "title" && nameEl) nameEl.textContent = val;
            else if ((key === "author" || key === "authors") && authorEl) authorEl.textContent = val;
            else if (key === "venue" && venueEl) venueEl.textContent = val;
          }
        }

        const lines = mdText.split(/\r?\n/);
        let inOverview = false;
        let inShow = false;
        let showThumb = "";
        const collected = [];
        for (const line of lines) {
          if (/^## Show\s*$/i.test(line.trim())) { inShow = true; inOverview = false; continue; }
          if (/^## Overview\s*$/i.test(line.trim())) { inOverview = true; inShow = false; continue; }
          if (/^## /.test(line)) { inShow = false; if (inOverview) break; }
          if (inShow && !showThumb) {
            const src = line.trim();
            if (src && /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(src)) showThumb = src;
          }
          if (inOverview && line.trim()) collected.push(line.trim());
        }
        overviewText = collected.join(" ");
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

  // Update abstract toggle id binding (re-query after re-run of setupHomeAbstractToggles)
  if (abstractBtn && hiddenAbstract) {
    hiddenAbstract.id = "home-project-hidden-1";
    abstractBtn.setAttribute("aria-controls", "home-project-hidden-1");
    // Re-attach toggle since textContent changed
    abstractBtn.removeAttribute("data-bound");
    setupHomeAbstractToggles();
  }

  // Make thumb and name clickable → navigate to detail page
  const detailUrl = `project-detail.html?slug=${encodeURIComponent(p.slug)}`;

  // Wrap thumb in anchor
  if (thumbEl && !thumbEl.closest("a")) {
    const thumbLink = document.createElement("a");
    thumbLink.href = detailUrl;
    thumbLink.className = "home-project-thumb-link";
    thumbLink.setAttribute("aria-label", `View project: ${p.title}`);
    thumbEl.parentNode.insertBefore(thumbLink, thumbEl);
    thumbLink.appendChild(thumbEl);

    // Hover explore overlay
    const overlay = document.createElement("span");
    overlay.className = "home-project-thumb-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.textContent = "EXPLORE →";
    thumbLink.appendChild(overlay);
  }

  // Make name a link
  if (nameEl && !nameEl.closest("a")) {
    const nameLink = document.createElement("a");
    nameLink.href = detailUrl;
    nameLink.className = "home-project-name-link";
    nameEl.parentNode.insertBefore(nameLink, nameEl);
    nameLink.appendChild(nameEl);
  }

  // Page-exit + FLIP on click
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function navigateToDetail(e) {
    e.preventDefault();
    const titleRect = nameEl ? nameEl.getBoundingClientRect() : null;
    if (titleRect) {
      sessionStorage.setItem("flip:" + p.slug, JSON.stringify({
        titleTop: titleRect.top,
        scrollY: window.scrollY
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
