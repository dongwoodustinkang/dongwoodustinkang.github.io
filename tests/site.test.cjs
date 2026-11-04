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
const storyRegistry = JSON.parse(read('stories/stories.json'));

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
      localAssetExists(metadata.thumbnail, file);
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

test('story registry has unique URLs, valid categories, and Korean content', () => {
  const slugs = new Set();
  for (const story of storyRegistry) {
    assert.match(story.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!slugs.has(story.slug), `Duplicate story slug: ${story.slug}`);
    slugs.add(story.slug);
    const categories = context.storyCategoryValues(story);
    assert.ok(categories.length, `Missing category: ${story.slug}`);
    for (const value of categories) assert.ok(config.storyCategories.some(category => category.value === value), `Unknown category: ${story.slug}/${value}`);
    assert.match(story.content, /^stories\/.+\.md$/);
    const metadata = context.parseFrontmatter(read(story.content));
    assert.ok(metadata.title, `Missing title: ${story.content}`);
    localAssetExists(metadata.thumbnail, story.content);
    metadata.links.forEach(link => localAssetExists(link.url, story.content));
  }
});

test('a story category may be one value or a list', () => {
  assert.deepEqual([...context.storyCategoryValues({ category: 'ai' })], ['ai']);
  assert.deepEqual([...context.storyCategoryValues({ category: ['ai', 'iot'] })], ['ai', 'iot']);
  assert.deepEqual([...context.storyCategoryValues({})], []);
});

test('page dependencies and CV exist; HTML IDs are unique', () => {
  for (const file of ['index.html', 'projects.html', 'project-detail.html', 'stories.html', 'story-detail.html']) {
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

test('body images between paragraphs become figures with optional captions', () => {
  const html = context.markdownLinesToHtml(['Before', '', '![Result <chart>](assets/images/a.png)', '', 'assets/images/b.png', '', 'After']);
  assert.ok(html.includes('alt="Result &lt;chart&gt;"'));
  assert.ok(html.includes('<figcaption class="project-md-caption">Result &lt;chart&gt;</figcaption>'));
  assert.equal((html.match(/<figure/g) || []).length, 2);
  assert.equal((html.match(/<figcaption/g) || []).length, 1);
});

test('body images accept an optional width', () => {
  const html = context.markdownLinesToHtml(['![Chart](assets/images/a.png){width=60%}', '', 'assets/images/b.png {width=400px}']);
  assert.ok(html.includes('style="width:60%" src="assets/images/a.png"'));
  assert.ok(html.includes('<figcaption class="project-md-caption">Chart</figcaption>'));
  assert.ok(html.includes('style="width:400px" src="assets/images/b.png"'));
});

test('numbered lines become ordered lists; a year-led sentence stays a paragraph', () => {
  const html = context.markdownLinesToHtml(['Intro', '1. One', '2. **Two**', '- Dot', 'After', '', '3. Three', '', '2017. A year']);
  assert.ok(html.includes('<p>Intro</p><ol><li>One</li><li><strong>Two</strong></li></ol><ul><li>Dot</li></ul><p>After</p>'));
  assert.ok(html.includes('<ol start="3"><li>Three</li></ol>'));
  assert.ok(html.includes('<p>2017. A year</p>'));
});

test('consecutive > lines become one callout with inline formatting', () => {
  const html = context.markdownLinesToHtml(['- Item', '> **First** <b>', '>', '>Second', 'After', '', '> Third', '>']);
  assert.ok(html.includes('<ul><li>Item</li></ul><blockquote class="project-md-callout"><p><strong>First</strong> &lt;b&gt;</p><p>Second</p></blockquote><p>After</p>'));
  assert.ok(html.endsWith('<blockquote class="project-md-callout"><p>Third</p></blockquote>'));
  assert.equal(context.markdownLinesToHtml(['>']), '');
  assert.ok(context.markdownLinesToHtml(['```', '> code', '```']).includes('&gt; code'));
});

test('a line with only <br> adds a spacer; blank lines and <br> in code do not', () => {
  const spacer = '<div class="project-md-spacer" aria-hidden="true"></div>';
  assert.equal(context.markdownLinesToHtml(['A', '<br>', '<br/>', 'B']), `<p>A</p>${spacer}${spacer}<p>B</p>`);
  assert.equal(context.markdownLinesToHtml(['A', '', '', 'B']), '<p>A</p><p>B</p>');
  assert.ok(!context.markdownLinesToHtml(['```', '<br>', '```']).includes('project-md-spacer'));
});

test('subtitle is the first Head 1 outside code blocks', () => {
  assert.equal(context.parseSubtitle('```md\n# Code\n```\n## Show\n# First\n# Second'), 'First');
  assert.equal(context.parseSubtitle('## Overview\n#### Not a subtitle'), '');
});

test('gallery and inline images resolve relative to Markdown, not the page', () => {
  assert.equal(context.resolveContentPath('assets/images/example.png', 'projects/sample.md'), 'assets/images/example.png');
  assert.equal(context.resolveContentPath('../assets/images/example.png', 'projects/sample.md'), 'http://localhost/assets/images/example.png');
  assert.equal(context.parseImageSourceFromLine('![Figure](../assets/images/example.png)'), '../assets/images/example.png');
});

