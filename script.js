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
