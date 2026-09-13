// Project registry = order/category/year/path. Markdown = all visible content.
async function fetchText(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Unable to load ${path} (${response.status})`);
  return response.text();
}

async function loadProjectRegistry() {
  return JSON.parse(await fetchText("projects/projects.json"));
}

function parseFrontmatter(markdown) {
  const metadata = { title: "", author: "", affiliation: "", venue: "", links: [] };
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return metadata;
  let inLinks = false;
  for (const raw of match[1].split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const link = inLinks && line.match(/^[-*]\s+([^:]+):\s*(.*)$/);
    if (link) { metadata.links.push({ label: link[1].trim(), url: link[2].trim() }); continue; }
    const field = line.match(/^([^:]+):\s*(.*)$/);
    if (!field) continue;
    const key = field[1].trim().toLowerCase();
    inLinks = key === "links";
    if (key in metadata && key !== "links") metadata[key] = field[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
  return metadata;
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\s*\r?\n?/, "");
}

function parseMarkdownSections(markdown) {
  const sections = [];
  let current = null;
  let inCode = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (line.trim().startsWith("```")) inCode = !inCode;
    const heading = !inCode && line.match(/^##\s+(.+)$/);
    if (heading) {
      current = { title: heading[1].trim(), key: heading[1].trim().toLowerCase(), lines: [] };
      sections.push(current);
    } else if (current) current.lines.push(line);
  }
  return sections;
}

async function loadProjectContent(entry) {
  const path = localizedContentPath(entry.content);
  const markdown = await fetchText(path);
  const metadata = parseFrontmatter(markdown);
  if (!metadata.title) throw new Error(`Missing title: ${path}`);
  const sections = parseMarkdownSections(stripFrontmatter(markdown));
  const galleryLines = sections.filter(section => section.key === "show").flatMap(section => section.lines);
  const images = extractAllImageSources(galleryLines, path);
  return { ...entry, ...metadata, sections, images, thumbnail: images[0] || "", contentPath: path };
}

function projectOrganization(project) {
  return /Korea Electronics? Technology Institute/i.test(project.affiliation)
    ? siteText("한국전자기술연구원(KETI)", "Korea Electronics Technology Institute (KETI)")
    : project.affiliation;
}
