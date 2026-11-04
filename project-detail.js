// Render a single project. Media, Markdown, and navigation live in separate files.
const titleEl = document.getElementById("project-detail-title");
const subtitleEl = document.getElementById("project-detail-subtitle");
const actionsEl = document.getElementById("project-detail-actions");
const heroEl = document.getElementById("project-detail-hero");
const summaryEl = document.getElementById("project-detail-summary");
const contentEl = document.getElementById("project-detail-content");
const sectionEl = document.querySelector(".project-detail-section");
const tagsEl = document.getElementById("project-detail-tags");
const pagerEl = document.getElementById("project-detail-pager");
// story-detail.html reuses this page with its own registry (`data-registry` on <body>)
// and `data-translated="false"` when it has no English files.
const registryPath = document.body.dataset.registry;
const translated = document.body.dataset.translated !== "false";

// Wait for the first gallery image (at most `limit` ms) so the page fades in whole, not piece by piece.
function whenImageReady(image, limit = 1200) {
  if (!image) return Promise.resolve();
  const loaded = image.complete ? Promise.resolve() : new Promise(resolve => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
  const decoded = loaded.then(() => image.decode?.()).catch(() => {});
  return Promise.race([decoded, new Promise(resolve => setTimeout(resolve, limit))]);
}

function revealPage() {
  sectionEl.classList.add("is-ready");
}

function fadeInBodyImages() {
  contentEl.parentElement.querySelectorAll(".project-md-img").forEach(image => {
    const show = () => image.classList.add("is-loaded");
    if (image.complete) show();
    else {
      image.addEventListener("load", show, { once: true });
      image.addEventListener("error", show, { once: true });
    }
  });
}

function renderProjectActions(links) {
  if (!actionsEl) return; // Story pages have no link buttons.
  const seen = new Set();
  actionsEl.replaceChildren();
  links.forEach(({ label, url }) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    const link = document.createElement("a");
    link.className = "project-detail-action";
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    const normalized = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
    link.textContent = localizedSectionTitle(normalized);
    actionsEl.appendChild(link);
  });
}

// Story pages show each category as a tag that opens the bookshelf filtered to it.
function renderStoryTags(project) {
  if (!tagsEl) return;
  const categories = storyCategoryValues(project)
    .map(value => SITE_CONFIG.storyCategories.find(item => item.value === value))
    .filter(Boolean);
  tagsEl.hidden = !categories.length;
  tagsEl.setAttribute("aria-label", siteText("태그", "Tags"));
  tagsEl.replaceChildren(...categories.map(category => {
    const tag = document.createElement("a");
    tag.className = "project-detail-tag";
    tag.href = `stories.html?category=${encodeURIComponent(category.value)}`;
    tag.textContent = siteText(category.ko, category.en);
    return tag;
  }));
}

// Story pages end with "← Back" to the bookshelf and "Next post →" in stories.json order.
function renderStoryPager(registry, slug) {
  if (!pagerEl) return;
  pagerEl.setAttribute("aria-label", siteText("스토리 이동", "Story navigation"));
  const back = document.createElement("a");
  back.className = "project-detail-pager-back";
  back.href = "stories.html";
  back.textContent = siteText("← 돌아가기", "← Back");
  pagerEl.replaceChildren(back);
  const next = registry[registry.findIndex(entry => entry.slug === slug) + 1];
  if (!next) return;
  const nextLink = document.createElement("a");
  nextLink.className = "project-detail-pager-next";
  nextLink.href = `story-detail.html?slug=${encodeURIComponent(next.slug)}`;
  nextLink.textContent = siteText("다음 포스트 →", "Next post →");
  pagerEl.appendChild(nextLink);
}

function renderProjectSections(project) {
  contentEl.replaceChildren();
  const overview = [];
  const media = [];
  project.sections.forEach(section => {
    if (section.key === "show") return;
    if (section.key === "overview") { overview.push(...section.lines); return; }
    if (section.key === "media") { media.push(...section.lines); return; }
    if (!section.lines.some(line => line.trim())) return;
    const row = document.createElement("section");
    row.className = "project-detail-row";
    const heading = document.createElement("h2");
    heading.className = "project-detail-row-label";
    heading.textContent = localizedSectionTitle(section.title);
    const body = document.createElement("div");
    body.className = "project-detail-row-body";
    body.innerHTML = markdownLinesToHtml(section.lines, project.contentPath);
    row.append(heading, body);
    contentEl.appendChild(row);
  });
  const introduction = markdownLinesToHtml([...overview, "", ...media], project.contentPath);
  summaryEl.hidden = !introduction;
  summaryEl.innerHTML = introduction
    ? `<h2>${siteText("프로젝트 소개", "Project overview")}</h2>${introduction}` : "";
}

async function loadProject() {
  try {
    const slug = new URLSearchParams(location.search).get("slug");
    const registry = await loadProjectRegistry(registryPath);
    const entry = registry.find(project => project.slug === slug);
    if (!entry) throw new Error(`Unknown project: ${slug}`);
    const project = await loadProjectContent({ ...entry, translated });
    titleEl.textContent = project.title;
    subtitleEl.textContent = project.subtitle;
    subtitleEl.hidden = !project.subtitle;
    document.title = `${project.title} | Dongwoo Kang`;
    renderStoryTags(project);
    renderStoryPager(registry, slug);
    renderProjectActions(project.links);
    renderProjectSections(project);
    buildHeroSlider(heroEl, project.images, project.title);
    fadeInBodyImages();
    initCodeBlocks();
    initMath();
    initProjectToc();
    await whenImageReady(heroEl.querySelector("img"));
    revealPage();
  } catch (error) {
    console.error(error);
    titleEl.textContent = siteText("프로젝트를 찾을 수 없습니다", "Project not found");
    document.title = titleEl.textContent;
    heroEl.parentElement.hidden = true;
    summaryEl.hidden = false;
    summaryEl.textContent = siteText("프로젝트를 불러오지 못했습니다. 프로젝트 목록에서 다시 선택해 주세요.", "Unable to load this project. Please select it again from the project list.");
    revealPage();
  }
}

loadProject();
