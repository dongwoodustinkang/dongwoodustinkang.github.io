// Image gallery: dot navigation, arrow keys, and swipe.
function buildHeroSlider(heroEl, sources = [], title = "") {
  const controls = document.getElementById("project-gallery-controls");
  heroEl.replaceChildren();
  controls.replaceChildren();
  heroEl.parentElement.hidden = sources.length === 0;
  controls.hidden = sources.length < 2;
  if (!sources.length) return;

  heroEl.setAttribute("role", "region");
  heroEl.setAttribute("aria-label", siteText("프로젝트 이미지", "Project images"));
  heroEl.setAttribute("aria-roledescription", siteText("슬라이더", "carousel"));
  heroEl.tabIndex = 0;
  const track = document.createElement("div");
  track.className = "hero-track";
  const slides = sources.map((src, i) => {
    const slide = document.createElement("div");
    slide.className = "hero-slide";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-label", `${i + 1} / ${sources.length}`);
    const image = document.createElement("img");
    image.src = src;
    image.alt = `${title} — ${siteText('이미지', 'Image')} ${i + 1}`;
    image.draggable = false;
    slide.appendChild(image);
    track.appendChild(slide);
    return slide;
  });
  heroEl.appendChild(track);
  let current = 0;
  const dots = sources.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "gallery-dot";
    dot.setAttribute("aria-label", siteText(`이미지 ${i + 1} 보기`, `View image ${i + 1}`));
    dot.addEventListener("click", () => goTo(i));
    controls.appendChild(dot);
    return dot;
  });

  function goTo(index) {
    current = (index + sources.length) % sources.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === current)));
    slides.forEach((slide, i) => slide.setAttribute("aria-hidden", String(i !== current)));
  }
  goTo(0);
  heroEl.onkeydown = event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    goTo(current + (event.key === 'ArrowLeft' ? -1 : 1));
  };
  let pointerStart = null;
  heroEl.onpointerdown = event => {
    if (event.isPrimary) pointerStart = { x: event.clientX, y: event.clientY };
  };
  heroEl.onpointerup = event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) goTo(current + (dx < 0 ? 1 : -1));
    pointerStart = null;
  };
  heroEl.onpointercancel = () => { pointerStart = null; };
}

