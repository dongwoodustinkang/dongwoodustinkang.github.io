const menuToggleButton = document.getElementById("menu-toggle");
const mobileOverlay = document.getElementById("mobile-overlay");
const filterSelect = document.getElementById("projects-filter");
const yearFilterSelect = document.getElementById("projects-year-filter");
const projectsList = document.getElementById("projects-list");

let allProjects = [];

function getProjectYear(project) {
  const venue = (project.venue || "").trim();
  const matched = venue.match(/\b(19|20)\d{2}\b/);
  return matched ? matched[0] : "";
}

function populateYearOptions() {
  if (!yearFilterSelect) {
    return;
  }

  const prevValue = yearFilterSelect.value || "all";
  yearFilterSelect.innerHTML = '<option value="all">All Year</option>';

  const years = Array.from(
    new Set(allProjects.map(getProjectYear).filter(Boolean).sort((a, b) => Number(b) - Number(a)))
  );

  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilterSelect.appendChild(option);
  });

  yearFilterSelect.value = years.includes(prevValue) ? prevValue : "all";
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

function renderProjects(categoryFilter = "all", yearFilter = "all") {
  projectsList.innerHTML = "";

  const filtered = allProjects.filter((project) => {
    const categoryMatched = categoryFilter === "all" || project.category === categoryFilter;
    const yearMatched = yearFilter === "all" || getProjectYear(project) === yearFilter;
    return categoryMatched && yearMatched;
  });

  if (!filtered.length) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "projects-empty";
    emptyMessage.textContent = "No projects in this category yet.";
    projectsList.appendChild(emptyMessage);
    return;
  }

  filtered.forEach((project) => {
    const item = document.createElement("a");
    item.className = "projects-tile projects-tile-link";
    item.dataset.category = project.category;
    if (project.slug) item.dataset.slug = project.slug;

    const detailLink = project.slug
      ? `project-detail.html?slug=${encodeURIComponent(project.slug)}`
      : "#";
    item.href = detailLink;

    if (detailLink === "#") {
      item.classList.add("is-disabled");
      item.setAttribute("aria-disabled", "true");
      item.tabIndex = -1;
    }

    const thumb = document.createElement("div");
    thumb.className = "projects-tile-thumb";
    thumb.setAttribute("aria-hidden", "true");
    const thumbSrc = project._thumbnail || project.thumbnail || "";
    if (thumbSrc) {
      thumb.style.backgroundImage = `url("${thumbSrc}")`;
      thumb.classList.add("has-image");
    }

    // Explore overlay
    const explore = document.createElement("div");
    explore.className = "projects-tile-explore";
    explore.innerHTML = '<span class="projects-tile-explore-label">View Project →</span>';
    thumb.appendChild(explore);

    const title = document.createElement("h3");
    title.className = "projects-tile-name";
    title.textContent = project._title || project.title;

    const author = document.createElement("p");
    author.className = "projects-tile-author";
    author.textContent = project._author || project.author;

    const venue = document.createElement("p");
    venue.className = "projects-tile-venue";
    venue.textContent = project._venue || project.venue;

    item.appendChild(thumb);
    item.appendChild(title);
    item.appendChild(author);
    item.appendChild(venue);
    projectsList.appendChild(item);
  });
}

async function fetchMdMeta(contentPath) {
  const empty = { thumbnail: "", title: "", author: "", venue: "" };
  if (!contentPath) return empty;
  try {
    const res = await fetch(contentPath);
    if (!res.ok) return empty;
    const text = await res.text();

    // Parse frontmatter
    const meta = { title: "", author: "", venue: "" };
    const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (fmMatch) {
      let listKey = null;
      for (const raw of fmMatch[1].split(/\r?\n/)) {
        const ln = raw.trim();
        if (!ln) continue;
        if (listKey && /^[*-]\s/.test(ln)) { listKey = null; continue; }
        listKey = null;
        const ci = ln.indexOf(":");
        if (ci === -1) continue;
        const key = ln.slice(0, ci).trim().toLowerCase();
        const val = ln.slice(ci + 1).trim().replace(/^["']|["']$/g, "");
        if (!val) { if (key === "links") listKey = "links"; continue; }
        if (key === "title") meta.title = val;
        else if (key === "author" || key === "authors") meta.author = val;
        else if (key === "venue") meta.venue = val;
      }
    }

    // Extract first ## Show image
    let thumbnail = "";
    let inShow = false;
    for (const line of text.split(/\r?\n/)) {
      if (/^## Show\s*$/i.test(line.trim())) { inShow = true; continue; }
      if (inShow) {
        if (/^## /.test(line)) break;
        const src = line.trim();
        if (src && /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(src)) { thumbnail = src; break; }
      }
    }

    return { thumbnail, ...meta };
  } catch (_) { return empty; }
}

async function loadProjects() {
  try {
    const response = await fetch("projects/projects.json");
    if (!response.ok) {
      throw new Error("projects.json not found");
    }
    allProjects = await response.json();

    // Fetch md metadata (frontmatter + ## Show thumbnail) in parallel
    await Promise.all(allProjects.map(async (project) => {
      const meta = await fetchMdMeta(project.content);
      project._thumbnail = meta.thumbnail || project.thumbnail || "";
      project._title = meta.title || project.title || "";
      project._author = meta.author || project.author || "";
      project._venue = meta.venue || project.venue || "";
    }));

    populateYearOptions();

    const initialCategory = filterSelect ? filterSelect.value : "all";
    const initialYear = yearFilterSelect ? yearFilterSelect.value : "all";
    renderProjects(initialCategory, initialYear);
  } catch (error) {
    projectsList.innerHTML = '<p class="projects-empty">Failed to load project data.</p>';
  }
}

if (filterSelect) {
  filterSelect.addEventListener("change", () => {
    const year = yearFilterSelect ? yearFilterSelect.value : "all";
    renderProjects(filterSelect.value, year);
  });
}

if (yearFilterSelect) {
  yearFilterSelect.addEventListener("change", () => {
    const category = filterSelect ? filterSelect.value : "all";
    renderProjects(category, yearFilterSelect.value);
  });
}

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

loadProjects();

// ── Exit animation + FLIP data storage ──────────────
projectsList.addEventListener("click", (e) => {
  const tile = e.target.closest(".projects-tile-link");
  if (!tile || tile.classList.contains("is-disabled")) return;

  e.preventDefault();
  const href = tile.href;
  const slug = tile.dataset.slug;

  // Store title's screen position for FLIP on detail page
  if (slug) {
    const titleEl = tile.querySelector(".projects-tile-name");
    const thumbEl = tile.querySelector(".projects-tile-thumb");
    if (titleEl) {
      const rect = titleEl.getBoundingClientRect();
      sessionStorage.setItem("flip:" + slug, JSON.stringify({
        titleTop: rect.top,
        scrollY: window.scrollY,
      }));
    }
    if (thumbEl) {
      const rect = thumbEl.getBoundingClientRect();
      sessionStorage.setItem("flip:thumb:" + slug, JSON.stringify({
        top: rect.top, left: rect.left,
        width: rect.width, height: rect.height,
        scrollY: window.scrollY,
      }));
    }
  }

  // Page exit animation then navigate
  const mainEl = document.querySelector(".projects-main");
  if (mainEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    mainEl.classList.add("page-exiting");
    setTimeout(() => { window.location.href = href; }, 220);
  } else {
    window.location.href = href;
  }
});

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
