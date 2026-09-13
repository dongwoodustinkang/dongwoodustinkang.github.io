// No packages required: run `node --test tests/site.test.cjs` from the repository root.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = vm.createContext({
  URL,
  window: { location: { href: 'http://localhost/project-detail.html' } },
  siteText: (ko, en) => ko,
});
for (const file of ['site-config.js', 'markdown.js', 'project-data.js']) {
  vm.runInContext(read(file), context, { filename: file });
}
const config = vm.runInContext('SITE_CONFIG', context);
const registry = JSON.parse(read('projects/projects.json'));

function localAssetExists(url, contentPath = '') {
  if (!url || /^(?:mailto:|data:|#)/.test(url)) return;
  const resolved = new URL(context.resolveContentPath(url, contentPath), 'http://localhost/');
  if (resolved.origin !== 'http://localhost') return;
  const localPath = decodeURIComponent(resolved.pathname).replace(/^\//, '');
  assert.ok(fs.existsSync(path.join(root, localPath)), `Missing local asset: ${url} (${contentPath})`);
}

test('registry has unique URLs, valid categories, explicit years, and both translations', () => {
  const slugs = new Set();
  for (const project of registry) {
    assert.match(project.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!slugs.has(project.slug), `Duplicate slug: ${project.slug}`);
    slugs.add(project.slug);
    assert.ok(config.categories.some(category => category.value === project.category));
    assert.match(project.year, /^\d{4}$/);
    assert.match(project.content, /^projects\/.+\.md$/);
    for (const file of [project.content, project.content.replace(/\.md$/, '.en.md')]) {
      const markdown = read(file);
      const metadata = context.parseFrontmatter(markdown);
      assert.ok(metadata.title, `Missing title: ${file}`);
      assert.ok(metadata.affiliation, `Missing affiliation: ${file}`);
      const sections = context.parseMarkdownSections(context.stripFrontmatter(markdown));
      const show = sections.filter(section => section.key === 'show').flatMap(section => section.lines);
      for (const image of context.extractAllImageSources(show, file)) localAssetExists(image, file);
      metadata.links.forEach(link => { assert.ok(link.label); localAssetExists(link.url, file); });
      for (const section of sections.filter(section => section.key !== 'show')) {
        const html = context.markdownLinesToHtml(section.lines, file);
        assert.ok(html || !section.lines.some(line => line.trim()), `Missing content: ${file}/${section.title}`);
        for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) localAssetExists(match[1], file);
      }
    }
  }
});

test('page dependencies and CV exist; HTML IDs are unique', () => {
  for (const file of ['index.html', 'projects.html', 'project-detail.html']) {
    const html = read(file);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, `Duplicate ID in ${file}`);
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) localAssetExists(match[1]);
    assert.equal((html.match(/id="site-navigation"/g) || []).length, 1);
  }
  localAssetExists(config.cv);
});

test('Markdown section parser keeps code-fenced headings inside code', () => {
  const sections = context.parseMarkdownSections('## Example\n```md\n## A code sample\n```\n## Result\nDone');
  assert.equal(sections.length, 2);
  assert.ok(sections[0].lines.includes('## A code sample'));
  assert.equal(sections[1].title, 'Result');
});

test('rendering preserves code, tables, math, links, and videos', () => {
  const source = '#### Heading\n**Bold** and [Paper](https://example.com)\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n```swift\nlet value = "<tag>"\n```\n\n$$\nx^2\n$$\n<iframe src="https://www.youtube.com/embed/example"></iframe>';
  const html = context.markdownLinesToHtml(source.split('\n'));
  for (const expected of ['<h4', '<strong>Bold</strong>', 'href="https://example.com"', '<table', '<th>A</th>', '&lt;tag&gt;', 'language-swift', 'project-code-copy', 'project-math-block', 'project-md-iframe-wrap']) assert.ok(html.includes(expected), expected);
});

test('gallery and inline images resolve relative to Markdown, not the page', () => {
  assert.equal(context.resolveContentPath('assets/images/example.png', 'projects/sample.md'), 'assets/images/example.png');
  assert.equal(context.resolveContentPath('../assets/images/example.png', 'projects/sample.md'), 'http://localhost/assets/images/example.png');
  assert.equal(context.parseImageSourceFromLine('![Figure](../assets/images/example.png)'), '../assets/images/example.png');
});

test('home introductions are available in both languages', () => {
  for (const file of ['content/home.md', 'content/home.en.md']) {
    const html = context.markdownLinesToHtml(read(file).split('\n'), file);
    assert.ok(html.includes('<p>'), `Missing introduction: ${file}`);
  }
});
