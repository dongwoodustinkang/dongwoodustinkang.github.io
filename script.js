// Warm the browser cache with Works card images once Home is idle.
window.addEventListener('load', () => {
  const idle = window.requestIdleCallback || (callback => setTimeout(callback, 1500));
  idle(async () => {
    try {
      const registry = await loadProjectRegistry();
      const projects = await Promise.all(registry.map(loadProjectContent));
      projects.forEach(project => {
        if (project.thumbnail) new Image().src = project.thumbnail;
      });
    } catch (error) {
      // Prefetch is optional; Works loads everything itself.
    }
  });
});

// Home credential tabs: arrow keys wrap; Home and End jump to the edges.
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
