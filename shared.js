// All pages use this header and menu; no duplicated navigation HTML.
function initSiteNavigation() {
  const mount = document.getElementById("site-navigation");
  if (!mount) return;
  const isHome = document.body.classList.contains("homepage");
  const activePage = isHome ? "home" : "works";
  const homeHref = isHome ? "#top" : "index.html#top";
  mount.innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <a id="header-home" class="header-home" href="${homeHref}" aria-label="${siteText('홈으로 이동', 'Go to home')}" title="${siteText('홈으로 이동', 'Go to home')}">
          <svg viewBox="0 0 32 36" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 14 16 3l13 11v17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V14Z" />
            <path d="M12 32V18h8v14" />
          </svg>
        </a>
        <div class="header-actions">
          <div class="language-switch" role="group" aria-label="Language">
            <button type="button" data-language="ko" aria-label="한국어">KR</button>
            <button type="button" data-language="en" aria-label="English">EN</button>
          </div>
          <button id="menu-toggle" class="menu-toggle" type="button" aria-label="${siteText('메뉴 열기', 'Open menu')}" aria-expanded="false" aria-controls="mobile-overlay">
            <span class="menu-line"></span><span class="menu-line"></span><span class="menu-line"></span>
          </button>
        </div>
      </div>
    </header>
    <div id="mobile-overlay" class="mobile-overlay" aria-hidden="true" inert>
      <nav class="mobile-menu" aria-label="${siteText('주 메뉴', 'Main navigation')}"></nav>
    </div>`;
  const menu = mount.querySelector(".mobile-menu");
  SITE_CONFIG.navigation.forEach(item => {
    const link = document.createElement("a");
    link.className = "mobile-tab-button";
    link.href = item.key === "cv" ? SITE_CONFIG.cv : item.href;
    link.textContent = item.label;
    if (item.key === activePage) link.setAttribute("aria-current", "page");
    if (item.key === "cv") {
      link.target = "_blank";
      link.rel = "noreferrer";
      link.setAttribute("aria-label", `CV ${siteText('(새 탭)', '(opens in a new tab)')}`);
    }
    menu.appendChild(link);
  });
  document.querySelectorAll("[data-cv-link]").forEach(link => { link.href = SITE_CONFIG.cv; });
  initLanguageButtons();

  const toggle = mount.querySelector("#menu-toggle");
  const overlay = mount.querySelector("#mobile-overlay");
  const background = document.querySelectorAll("main, .site-footer, .skip-link");
  function setMenuOpen(open) {
    if (!open && overlay.classList.contains("open")) toggle.focus();
    overlay.inert = !open;
    overlay.classList.toggle("open", open);
    overlay.setAttribute("aria-hidden", String(!open));
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? siteText("메뉴 닫기", "Close menu") : siteText("메뉴 열기", "Open menu"));
    document.body.classList.toggle("menu-open", open);
    background.forEach(element => { element.inert = open; });
    if (open) menu.querySelector("a")?.focus();
  }
  toggle.addEventListener("click", () => setMenuOpen(!overlay.classList.contains("open")));
  mount.querySelector("#header-home").addEventListener("click", () => setMenuOpen(false));
  overlay.addEventListener("click", event => {
    if (event.target === overlay || event.target.closest("a")) setMenuOpen(false);
  });
  window.addEventListener("keydown", event => {
    if (!overlay.classList.contains("open")) return;
    if (event.key === "Escape") setMenuOpen(false);
    if (event.key !== "Tab") return;
    const controls = [...mount.querySelectorAll("a, button")].filter(element => element.getClientRects().length);
    const index = controls.indexOf(document.activeElement);
    event.preventDefault();
    controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
  });
}

initSiteNavigation();
