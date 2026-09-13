// Render a single project. Media, Markdown, and navigation live in separate files.
const titleEl = document.getElementById("project-detail-title");
const actionsEl = document.getElementById("project-detail-actions");
const heroEl = document.getElementById("project-detail-hero");
const summaryEl = document.getElementById("project-detail-summary");
const contentEl = document.getElementById("project-detail-content");

function renderProjectActions(links) {
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
    const registry = await loadProjectRegistry();
    const entry = registry.find(project => project.slug === slug);
    if (!entry) throw new Error(`Unknown project: ${slug}`);
    const project = await loadProjectContent(entry);
    titleEl.textContent = project.title;
    document.title = `${project.title} | Dongwoo Kang`;
    renderProjectActions(project.links);
    renderProjectSections(project);
    buildHeroSlider(heroEl, project.images, project.title);
    initCodeBlocks();
    initMath();
    initProjectToc();
  } catch (error) {
    console.error(error);
    titleEl.textContent = siteText("프로젝트를 찾을 수 없습니다", "Project not found");
    document.title = titleEl.textContent;
    heroEl.parentElement.hidden = true;
    summaryEl.hidden = false;
    summaryEl.textContent = siteText("프로젝트를 불러오지 못했습니다. 프로젝트 목록에서 다시 선택해 주세요.", "Unable to load this project. Please select it again from the project list.");
  }
}

loadProject();
