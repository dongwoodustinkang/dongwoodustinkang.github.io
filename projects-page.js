const filterSelect     = document.getElementById("projects-filter");
const yearFilterSelect = document.getElementById("projects-year-filter");
const projectsList     = document.getElementById("projects-list");

let allProjects = [];

function populateYearOptions() {
  if (!yearFilterSelect) return;
  const prevValue = yearFilterSelect.value || "all";
  yearFilterSelect.innerHTML = '<option value="all">Year</option>';
  const years = Array.from(
    new Set(allProjects.map((p) => p.year).filter(Boolean).sort((a, b) => Number(b) - Number(a)))
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
    const yearOk = yearFilter === "all" || p.year === yearFilter;
    return catOk && yearOk;
  });

  if (!filtered.length) {
    const msg = document.createElement("p");
    msg.className = "projects-empty";
    msg.textContent = siteText("해당 조건에 맞는 프로젝트가 없습니다.", "No projects match these filters.");
    projectsList.appendChild(msg);
    return;
  }

  filtered.forEach((project, index) => {
    const item = document.createElement("a");
    item.className = "projects-tile projects-tile-link";
    item.style.setProperty("--tile-index", index);
    item.dataset.category = project.category;
    item.dataset.slug = project.slug;
    item.href = `project-detail.html?slug=${encodeURIComponent(project.slug)}`;
    // Start the detail page's first gallery image early so it can fade in sooner.
    const warm = () => { if (project.images[0]) new Image().src = project.images[0]; };
    item.addEventListener("pointerenter", warm, { once: true });
    item.addEventListener("focus", warm, { once: true });

    const thumb = document.createElement("div");
    thumb.className = "projects-tile-thumb";
    thumb.setAttribute("aria-hidden", "true");
    if (project.thumbnail) {
      const image = document.createElement("span");
      image.className = "projects-tile-image";
      setTileImage(image, project.thumbnail);
      thumb.appendChild(image);
    }

    const title = document.createElement("h2");
    title.className = "projects-tile-name";
    title.textContent = project.title;

    const venue = document.createElement("p");
    venue.className = "projects-tile-venue";
    venue.textContent = [project.year, projectOrganization(project)].filter(Boolean).join(" ");

    const copy = document.createElement("div");
    copy.className = "projects-tile-copy";
    copy.appendChild(title);
    copy.appendChild(venue);

    item.appendChild(thumb);
    item.appendChild(copy);
    projectsList.appendChild(item);
  });
}

// The image fades in only after it has fully loaded.
function setTileImage(element, src) {
  const image = new Image();
  image.onload = image.onerror = () => {
    element.style.backgroundImage = `url("${src}")`;
    element.classList.add("is-loaded");
  };
  image.src = src;
}

async function loadProjects() {
  try {
    const registry = await loadProjectRegistry();
    allProjects = await Promise.all(registry.map(loadProjectContent));

    populateYearOptions();
    renderProjects(filterSelect?.value ?? "all", yearFilterSelect?.value ?? "all");
  } catch (error) {
    console.error(error);
    projectsList.innerHTML = `<p class="projects-empty">${siteText('프로젝트를 불러오지 못했습니다.', 'Failed to load project data.')}</p>`;
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

SITE_CONFIG.categories.forEach(category => {
  const option = document.createElement("option");
  option.value = category.value;
  option.textContent = siteText(category.ko, category.en);
  filterSelect.appendChild(option);
});

loadProjects();
