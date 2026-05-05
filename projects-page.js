const filterSelect     = document.getElementById("projects-filter");
const yearFilterSelect = document.getElementById("projects-year-filter");
const projectsList     = document.getElementById("projects-list");

let allProjects = [];

function populateYearOptions() {
  if (!yearFilterSelect) return;
  const prevValue = yearFilterSelect.value || "all";
  yearFilterSelect.innerHTML = '<option value="all">All Year</option>';
  const years = Array.from(
    new Set(allProjects.map((p) => getProjectYear(p)).filter(Boolean).sort((a, b) => Number(b) - Number(a)))
  );
  years.forEach((year) => {
    const opt = document.createElement("option");
    opt.value = year;
    opt.textContent = year;
    yearFilterSelect.appendChild(opt);
  });
  yearFilterSelect.value = years.includes(prevValue) ? prevValue : "all";
}

function renderProjects(categoryFilter = "all", yearFilter = "all") {
  projectsList.innerHTML = "";
  const filtered = allProjects.filter((p) => {
    const catOk  = categoryFilter === "all" || p.category === categoryFilter;
    const yearOk = yearFilter === "all" || getProjectYear(p) === yearFilter;
    return catOk && yearOk;
  });

  if (!filtered.length) {
    const msg = document.createElement("p");
    msg.className = "projects-empty";
    msg.textContent = "No projects in this category yet.";
    projectsList.appendChild(msg);
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
    if (project.thumbnail) {
      thumb.style.backgroundImage = `url("${project.thumbnail}")`;
      thumb.classList.add("has-image");
    }
    const explore = document.createElement("div");
    explore.className = "projects-tile-explore";
    explore.innerHTML = '<span class="projects-tile-explore-label">View Project →</span>';
    thumb.appendChild(explore);

    const title = document.createElement("h3");
    title.className = "projects-tile-name";
    title.textContent = project.title;

    const author = document.createElement("p");
    author.className = "projects-tile-author";
    author.textContent = project.author;

    const venue = document.createElement("p");
    venue.className = "projects-tile-venue";
    venue.textContent = project.venue;

    item.appendChild(thumb);
    item.appendChild(title);
    item.appendChild(author);
    item.appendChild(venue);
    projectsList.appendChild(item);
  });
}

async function fetchMdMeta(contentPath) {
  if (!contentPath) return {};
  try {
    const res = await fetch(contentPath);
    if (!res.ok) return {};
    const text  = await res.text();
    const lines = text.split(/\r?\n/);

    const fm = parseFrontmatter(text);

    // Reuse already-split lines for ## Show image extraction
    let thumbnail = "", inShow = false;
    for (const line of lines) {
      if (/^## Show\s*$/i.test(line.trim())) { inShow = true; continue; }
      if (inShow) {
        if (/^## /.test(line)) break;
        const src = line.trim();
        if (src && /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(src)) { thumbnail = src; break; }
      }
    }

    return { thumbnail, title: fm.title, author: fm.author, venue: fm.venue };
  } catch (_) { return {}; }
}

async function loadProjects() {
  try {
    const res = await fetch("projects/projects.json");
    if (!res.ok) throw new Error("projects.json not found");
    const raw = await res.json();

    // Enrich with md metadata in parallel; create new objects instead of mutating fetched data
    allProjects = await Promise.all(raw.map(async (project) => {
      const meta = await fetchMdMeta(project.content);
      return {
        ...project,
        title:     meta.title     || project.title     || "",
        author:    meta.author    || project.author    || "",
        venue:     meta.venue     || project.venue     || "",
        thumbnail: meta.thumbnail || project.thumbnail || "",
      };
    }));

    populateYearOptions();
    renderProjects(filterSelect?.value ?? "all", yearFilterSelect?.value ?? "all");
  } catch (_) {
    projectsList.innerHTML = '<p class="projects-empty">Failed to load project data.</p>';
  }
}

if (filterSelect) {
  filterSelect.addEventListener("change", () =>
    renderProjects(filterSelect.value, yearFilterSelect?.value ?? "all")
  );
}
if (yearFilterSelect) {
  yearFilterSelect.addEventListener("change", () =>
    renderProjects(filterSelect?.value ?? "all", yearFilterSelect.value)
  );
}

loadProjects();

// Remove page-exiting class when page is restored from bfcache
window.addEventListener("pageshow", () => {
  document.querySelector(".projects-main")?.classList.remove("page-exiting");
});

// ── Exit animation + FLIP data storage ──────────────
projectsList.addEventListener("click", (e) => {
  const tile = e.target.closest(".projects-tile-link");
  if (!tile || tile.classList.contains("is-disabled")) return;
  e.preventDefault();

  const href = tile.href;
  const slug = tile.dataset.slug;

  if (slug) {
    const titleEl = tile.querySelector(".projects-tile-name");
    const thumbEl = tile.querySelector(".projects-tile-thumb");
    if (titleEl) {
      const rect = titleEl.getBoundingClientRect();
      sessionStorage.setItem("flip:" + slug, JSON.stringify({ titleTop: rect.top, scrollY: window.scrollY }));
    }
    if (thumbEl) {
      const rect = thumbEl.getBoundingClientRect();
      sessionStorage.setItem("flip:thumb:" + slug, JSON.stringify({
        top: rect.top, left: rect.left, width: rect.width, height: rect.height, scrollY: window.scrollY,
      }));
    }
  }

  const mainEl = document.querySelector(".projects-main");
  if (mainEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    mainEl.classList.add("page-exiting");
    setTimeout(() => { window.location.href = href; }, 220);
  } else {
    window.location.href = href;
  }
});
