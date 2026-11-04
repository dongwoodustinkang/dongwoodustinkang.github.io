// Project registry = order/category/year/path. Markdown = all visible content.
async function fetchText(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Unable to load ${path} (${response.status})`);
  return response.text();
}

async function loadProjectRegistry(path = "projects/projects.json") {
  return JSON.parse(await fetchText(path));
}

// A story's `category` is one value ("ai") or a list (["ai", "iot"]); this always returns a list.
function storyCategoryValues(story) {
  return [].concat(story.category || []);
}

function parseFrontmatter(markdown) {
  const metadata = { title: "", author: "", affiliation: "", venue: "", thumbnail: "", links: [] };
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

// The first `# ` heading (outside code blocks) is the subtitle under the detail page title.
function parseSubtitle(markdown) {
  let inCode = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (line.trim().startsWith("```")) inCode = !inCode;
    const heading = !inCode && line.match(/^#\s+(.+)$/);
    if (heading) return heading[1].trim();
  }
  return "";
}

// `translated: false` reads the Korean file in both languages (Stories has no .en.md).
async function loadProjectContent(entry) {
  const path = entry.translated === false ? entry.content : localizedContentPath(entry.content);
  const markdown = await fetchText(path);
  const metadata = parseFrontmatter(markdown);
  if (!metadata.title) throw new Error(`Missing title: ${path}`);
  const body = stripFrontmatter(markdown);
  const sections = parseMarkdownSections(body);
  const galleryLines = sections.filter(section => section.key === "show").flatMap(section => section.lines);
  const images = extractAllImageSources(galleryLines, path);
  // Works card image comes from `thumbnail:`; the `## Show` images belong to the detail page only.
  const thumbnail = metadata.thumbnail ? resolveContentPath(metadata.thumbnail, path) : images[0] || "";
  return { ...entry, ...metadata, subtitle: parseSubtitle(body), sections, images, thumbnail, contentPath: path };
}

function projectOrganization(project) {
  return /Korea Electronics? Technology Institute/i.test(project.affiliation)
    ? siteText("한국전자기술연구원(KETI)", "Korea Electronics Technology Institute (KETI)")
    : project.affiliation;
}
