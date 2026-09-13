// Floating section navigation, automatically built from rendered headings.
function initProjectToc() {
  const toc = document.getElementById("project-toc");
  const headings = Array.from(document.querySelectorAll(
    "#project-detail-title, #project-detail-content h2, #project-detail-content h3, #project-detail-content h4, #project-detail-summary h2"
  )).filter(heading => heading.getClientRects().length && heading.textContent.trim());
  if (!toc || headings.length < 2) return;

  toc.setAttribute("aria-label", siteText("프로젝트 목차", "Project contents"));
  const links = headings.map((heading, index) => {
    if (!heading.id) heading.id = `project-section-${index}`;
    heading.classList.add("project-toc-target");
    heading.tabIndex = -1;
    const link = document.createElement("a");
    link.className = "project-toc-link";
    if (heading.matches("h3, h4")) link.classList.add("is-subsection");
    link.href = `#${heading.id}`;
    link.setAttribute("aria-label", heading.textContent.trim());
    const label = document.createElement("span");
    label.className = "project-toc-label";
    label.setAttribute("aria-hidden", "true");
    label.textContent = heading.textContent.trim();
    link.appendChild(label);
    toc.appendChild(link);
    return link;
  });
  toc.hidden = false;
  // Keep shared fragment links useful after async Markdown loading.
  try {
    const fragment = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (headings.includes(fragment)) fragment.scrollIntoView();
  } catch (_) { /* Ignore malformed fragments without interrupting the page. */ }

  let framePending = false;
  function updateActiveSection() {
    framePending = false;
    let active = 0;
    const readingLine = 112;
    headings.forEach((heading, index) => {
      if (heading.getBoundingClientRect().top <= readingLine) active = index;
    });
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      active = headings.length - 1;
    }
    links.forEach((link, index) => {
      if (index === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateActiveSection);
  }
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  new ResizeObserver(scheduleUpdate).observe(document.querySelector(".project-detail-section"));
  updateActiveSection();
}

