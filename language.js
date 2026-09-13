// Content paths stay beside the originals so relative media links remain valid.
let siteLanguage = 'ko';
try { siteLanguage = localStorage.getItem('language') === 'en' ? 'en' : 'ko'; } catch (_) {}
const requestedLanguage = new URLSearchParams(location.search).get('lang');
if (requestedLanguage === 'ko' || requestedLanguage === 'en') siteLanguage = requestedLanguage;
document.documentElement.lang = siteLanguage;
if (document.body.classList.contains('homepage')) {
  document.title = siteLanguage === 'en' ? 'Dongwoo Kang' : '강동우 | Dongwoo Kang';
}

function siteText(korean, english) { return siteLanguage === 'en' ? english : korean; }
function localizedContentPath(path) {
  return siteLanguage === 'en' ? path.replace(/\.md$/, '.en.md') : path;
}

document.querySelectorAll('[data-en]').forEach(el => {
  if (siteLanguage === 'en') el.textContent = el.dataset.en;
});
function initLanguageButtons() {
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === siteLanguage));
    button.addEventListener('click', () => {
      const next = button.dataset.language;
      if (next === siteLanguage) return;
      const url = new URL(location.href);
      url.searchParams.delete('lang');
      try { localStorage.setItem('language', next); }
      catch (_) { url.searchParams.set('lang', next); }
      location.replace(url.href);
    });
  });
}
document.querySelector('.credential-tabs')?.setAttribute('aria-label', siteText('수상 및 자격증 분류', 'Credentials categories'));
document.querySelector('.profile-photo')?.setAttribute('alt', siteText('강동우 프로필 사진', 'Portrait of Dongwoo Kang'));
document.querySelector('.contact-links')?.setAttribute('aria-label', siteText('연락처 및 소셜 링크', 'Contact and social links'));
document.querySelectorAll('.contact-links a').forEach(link => {
  const label = link.title === 'Email' ? siteText('이메일 보내기', 'Send email') : `${link.title} ${siteText('(새 탭)', '(opens in a new tab)')}`;
  link.setAttribute('aria-label', label);
});

function localizedSectionTitle(title) {
  const labels = {
    'Problem Definition': '문제 정의', 'Solution Process': '해결 과정',
    'Contribution': '기여', 'Solution Design': '솔루션 설계',
    'Reflection': '회고', 'Abstract': '초록', 'Publications': '발표 논문',
    'Overview': '개요', 'Paper': '논문', 'Demo': '데모', 'News': '뉴스', 'Code': '코드'
  };
  return siteLanguage === 'ko' ? (labels[title] || title) : title;
}

// Back/forward cache can restore a page rendered in a previously selected language.
window.addEventListener('pageshow', event => {
  if (!event.persisted || requestedLanguage) return;
  try {
    const saved = localStorage.getItem('language') === 'en' ? 'en' : 'ko';
    if (saved !== siteLanguage) location.reload();
  } catch (_) {}
});
