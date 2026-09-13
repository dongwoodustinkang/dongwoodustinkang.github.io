// Home introduction and credential tabs.
const homeContent = document.getElementById("home-content");

async function loadHomeMarkdown() {
  try {
    const res = await fetch(localizedContentPath("content/home.md"), { cache: "no-cache" });
    if (!res.ok) throw new Error();
    homeContent.innerHTML = markdownLinesToHtml((await res.text()).split(/\r?\n/), "content/home.md");
  } catch (_) {
    homeContent.textContent = siteText("자기소개를 불러오지 못했습니다. 로컬 미리보기 주소에서 다시 확인해 주세요.", "Unable to load the introduction. Please open the local preview address.");
  }
}

loadHomeMarkdown();

// Accessible tabs: arrow keys wrap; Home and End jump to the edges.
const credentialTabs = [...document.querySelectorAll('.credential-tab')];

function selectCredentialTab(selectedTab) {
  credentialTabs.forEach(tab => {
    const selected = tab === selectedTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  });
}

credentialTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectCredentialTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % credentialTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + credentialTabs.length) % credentialTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = credentialTabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectCredentialTab(credentialTabs[next]);
    credentialTabs[next].focus();
  });
});
