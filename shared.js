// shared.js — utilities shared across all pages

// ── Mobile menu ──────────────────────────────────────
const _menuToggle = document.getElementById("menu-toggle");
const _mobileOverlay = document.getElementById("mobile-overlay");

function openMobileMenu() {
  _mobileOverlay.classList.add("open");
  _mobileOverlay.setAttribute("aria-hidden", "false");
  _menuToggle.classList.add("is-open");
  _menuToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
}

function closeMobileMenu() {
  _mobileOverlay.classList.remove("open");
  _mobileOverlay.setAttribute("aria-hidden", "true");
  _menuToggle.classList.remove("is-open");
  _menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

_menuToggle.addEventListener("click", () => {
  _mobileOverlay.classList.contains("open") ? closeMobileMenu() : openMobileMenu();
});
_mobileOverlay.addEventListener("click", (e) => {
  if (e.target === _mobileOverlay) closeMobileMenu();
});
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMobileMenu(); });
window.addEventListener("resize", () => { if (window.innerWidth > 900) closeMobileMenu(); });

// ── Dark mode ────────────────────────────────────────
const _darkToggleBtn = document.getElementById("dark-toggle");

function setDark(val) {
  document.body.classList.toggle("dark", val);
  localStorage.setItem("theme", val ? "dark" : "light");
  if (_darkToggleBtn) _darkToggleBtn.textContent = val ? "☀" : "☾";
}

(function () {
  const saved = localStorage.getItem("theme");
  setDark(saved === "dark" || (saved === null && window.matchMedia("(prefers-color-scheme: dark)").matches));
})();

if (_darkToggleBtn) {
  _darkToggleBtn.addEventListener("click", () => setDark(!document.body.classList.contains("dark")));
}

// ── Header scroll ────────────────────────────────────
const _siteHeader = document.querySelector(".site-header");
if (_siteHeader) {
  const _onScroll = () => _siteHeader.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", _onScroll, { passive: true });
  _onScroll();
}

// ── Mouse glow ───────────────────────────────────────
const _mouseGlow = document.getElementById("mouse-glow");
if (_mouseGlow) {
  window.addEventListener("mousemove", (e) => {
    _mouseGlow.style.left = e.clientX + "px";
    _mouseGlow.style.top = e.clientY + "px";
  }, { passive: true });
}

// ── Utilities ────────────────────────────────────────
function escapeHtml(input = "") {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getProjectYear(project, fallback = "") {
  const matched = (project.venue || "").trim().match(/\b(19|20)\d{2}\b/);
  return matched ? matched[0] : fallback;
}

function parseFrontmatter(markdown) {
  const result = { title: "", author: "", affiliation: "", venue: "", links: [] };
  const fmMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return result;
  let listKey = null;
  for (const raw of fmMatch[1].split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (listKey && /^[*-]\s/.test(line)) {
      const itemText = line.replace(/^[*-]\s+/, "");
      const ci = itemText.indexOf(":");
      const label = ci > -1 ? itemText.slice(0, ci).trim() : itemText.trim();
      const url   = ci > -1 ? itemText.slice(ci + 1).trim() : "";
      if (listKey === "links") result.links.push({ label, url });
      continue;
    }
    listKey = null;
    const ci = line.indexOf(":");
    if (ci === -1) continue;
    const key = line.slice(0, ci).trim().toLowerCase();
    const val = line.slice(ci + 1).trim().replace(/^["']|["']$/g, "");
    if (!val) { if (key === "links") listKey = "links"; }
    else if (key === "title") result.title = val;
    else if (key === "author" || key === "authors") result.author = val;
    else if (key === "affiliation" || key === "affilation") result.affiliation = val;
    else if (key === "venue") result.venue = val;
  }
  return result;
}
