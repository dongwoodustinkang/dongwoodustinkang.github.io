// Stories (paper reviews) shown as books on shelves: one shelf per `BOOKS_PER_SHELF` stories.
const BOOKS_PER_SHELF = 10;
// Category tags sit on one line, six visible at a time; the rest scroll sideways.
const TAGS_PER_PAGE = 6;
const storyFilters = document.getElementById("stories-filters");
const storyShelves = document.getElementById("stories-shelves");

let allStories = [];
// `stories.html?category=ai` (the tag on a story page) opens with that category selected.
let activeCategory = new URLSearchParams(location.search).get("category") || "all";

function createFilterButton(category) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "stories-filter";
  button.dataset.category = category.value;
  button.textContent = `${siteText(category.ko, category.en)} ${category.count}`;
  // A second click on the selected category shows every story again.
  button.addEventListener("click", () => {
    activeCategory = activeCategory === category.value ? "all" : category.value;
    updateFilterState();
    renderShelves();
  });
  return button;
}

function updateFilterState() {
  storyFilters.querySelectorAll(".stories-filter").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.category === activeCategory));
  });
}

// The tag bar is as wide as the widest group of six, and each scroll lands on the next group.
// When even one group is wider than the screen (phones), every tag becomes a stop instead.
function layoutStoryFilters() {
  const tags = [...storyFilters.querySelectorAll(".stories-filter")];
  storyFilters.style.width = "";
  storyFilters.classList.remove("snap-each");
  if (tags.length <= TAGS_PER_PAGE) return;
  let groupWidth = 0;
  for (let start = 0; start < tags.length; start += TAGS_PER_PAGE) {
    const last = tags[Math.min(start + TAGS_PER_PAGE, tags.length) - 1];
    groupWidth = Math.max(groupWidth, last.offsetLeft + last.offsetWidth - tags[start].offsetLeft);
  }
  if (groupWidth <= storyFilters.parentElement.clientWidth) {
    storyFilters.style.width = `${groupWidth + tags[0].offsetLeft * 2}px`;
  } else storyFilters.classList.add("snap-each");
}

function filterStops() {
  const tags = [...storyFilters.querySelectorAll(".stories-filter")];
  const stops = storyFilters.classList.contains("snap-each") ? tags : tags.filter((_, i) => i % TAGS_PER_PAGE === 0);
  return stops.map(tag => tag.offsetLeft - tags[0].offsetLeft);
}

// Tags are sorted by story count (ties keep the site-config.js order).
function renderStoryFilters() {
  storyFilters.setAttribute("aria-label", siteText("스토리 분류", "Story categories"));
  const categories = SITE_CONFIG.storyCategories
    .map(category => ({ ...category, count: allStories.filter(story => storyCategoryValues(story).includes(category.value)).length }))
    .filter(category => category.count)
    .sort((a, b) => b.count - a.count);
  storyFilters.replaceChildren(...categories.map(createFilterButton));
  storyFilters.querySelectorAll(".stories-filter").forEach((tag, i) => tag.classList.toggle("is-group-start", i % TAGS_PER_PAGE === 0));
  updateFilterState();
  layoutStoryFilters();
  // Open on the group that holds a category chosen from a story's tag.
  const selected = storyFilters.querySelector('[aria-pressed="true"]');
  if (selected) {
    const offset = selected.offsetLeft - storyFilters.firstElementChild.offsetLeft;
    storyFilters.scrollLeft = Math.max(...filterStops().filter(stop => stop <= offset));
  }
}

// A vertical mouse wheel over the tags moves one group sideways; trackpads and touch
// scroll sideways natively. At either end the wheel scrolls the page as usual.
let wheelLocked = false;
storyFilters.addEventListener("wheel", event => {
  if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
  const maxScroll = storyFilters.scrollWidth - storyFilters.clientWidth;
  const direction = Math.sign(event.deltaY);
  if (maxScroll <= 1) return;
  if ((direction < 0 && storyFilters.scrollLeft <= 1) || (direction > 0 && storyFilters.scrollLeft >= maxScroll - 1)) return;
  event.preventDefault();
  if (wheelLocked) return;
  wheelLocked = true;
  setTimeout(() => { wheelLocked = false; }, 350);
  const stops = filterStops();
  const target = direction > 0
    ? stops.find(stop => stop > storyFilters.scrollLeft + 1) ?? maxScroll
    : [...stops].reverse().find(stop => stop < storyFilters.scrollLeft - 1) ?? 0;
  storyFilters.scrollTo({ left: target, behavior: "smooth" });
}, { passive: false });
window.addEventListener("resize", layoutStoryFilters);

function createBook(story, index) {
  const book = document.createElement("a");
  book.className = "stories-book";
  book.href = `story-detail.html?slug=${encodeURIComponent(story.slug)}`;
  book.style.setProperty("--book-index", index);
  // Bubbles near the shelf edges open inward so they stay on screen.
  const column = index % BOOKS_PER_SHELF;
  book.dataset.tipAlign = column < 3 ? "start" : column > 6 ? "end" : "center";
  book.setAttribute("aria-label", [story.title, story.affiliation].filter(Boolean).join(" — "));

  const cover = document.createElement("span");
  cover.className = "stories-book-cover";
  cover.setAttribute("aria-hidden", "true");
  if (story.thumbnail) {
    cover.classList.add("has-image");
    const image = new Image();
    image.onload = image.onerror = () => {
      cover.style.backgroundImage = `url("${story.thumbnail}")`;
      cover.classList.add("is-loaded");
    };
    image.src = story.thumbnail;
  } else {
    // Without a cover image the book shows its title and venue like a plain paperback.
    const title = document.createElement("span");
    title.className = "stories-book-title";
    title.textContent = story.title;
    const venue = document.createElement("span");
    venue.className = "stories-book-venue";
    venue.textContent = story.affiliation;
    cover.append(title, venue);
  }

  const tip = document.createElement("span");
  tip.className = "stories-book-tip";
  tip.setAttribute("aria-hidden", "true");
  const tipTitle = document.createElement("strong");
  tipTitle.textContent = story.title;
  tip.appendChild(tipTitle);
  if (story.affiliation) {
    const tipVenue = document.createElement("span");
    tipVenue.textContent = story.affiliation;
    tip.appendChild(tipVenue);
  }

  book.append(cover, tip);
  return book;
}

function renderShelves() {
  storyShelves.replaceChildren();
  const visible = allStories.filter(story => activeCategory === "all" || storyCategoryValues(story).includes(activeCategory));
  if (!visible.length) {
    const message = document.createElement("p");
    message.className = "stories-empty";
    message.textContent = siteText("아직 등록된 스토리가 없습니다.", "No stories yet.");
    storyShelves.appendChild(message);
    return;
  }
  for (let start = 0; start < visible.length; start += BOOKS_PER_SHELF) {
    const shelf = document.createElement("div");
    shelf.className = "stories-shelf";
    const books = document.createElement("div");
    books.className = "stories-shelf-books";
    visible.slice(start, start + BOOKS_PER_SHELF)
      .forEach((story, offset) => books.appendChild(createBook(story, start + offset)));
    const board = document.createElement("div");
    board.className = "stories-shelf-board";
    board.setAttribute("aria-hidden", "true");
    shelf.append(books, board);
    storyShelves.appendChild(shelf);
  }
}

async function loadStories() {
  try {
    const registry = await loadProjectRegistry("stories/stories.json");
    // Stories are written in Korean only, so the English page shows the same files.
    allStories = await Promise.all(registry.map(entry => loadProjectContent({ ...entry, translated: false })));
    if (!allStories.some(story => storyCategoryValues(story).includes(activeCategory))) activeCategory = "all";
    renderStoryFilters();
    renderShelves();
  } catch (error) {
    console.error(error);
    storyShelves.innerHTML = `<p class="stories-empty">${siteText("스토리를 불러오지 못했습니다.", "Failed to load stories.")}</p>`;
  }
}

loadStories();
