// Shared navigation and project categories. See Modify.md before editing.
const SITE_CONFIG = {
  cv: "assets/pdf/dongwoo-kang-cv.pdf",
  navigation: [
    { key: "home", label: "Home", href: "index.html#top" },
    { key: "works", label: "Works", href: "projects.html" },
    { key: "stories", label: "Stories", href: "stories.html" },
    { key: "cv", label: "CV" },
  ],
  categories: [
    { value: "keti", ko: "KETI", en: "KETI" },
    { value: "personal", ko: "개인", en: "Personal" },
  ],
  // Story categories; each entry in stories/stories.json uses one `value`.
  storyCategories: [
    { value: "ai", ko: "AI", en: "AI" },
    { value: "physical", ko: "Physical", en: "Physical" },
    { value: "iot", ko: "IoT", en: "IoT" },
    { value: "abnormal-detection", ko: "Abnormal Detection", en: "Abnormal Detection" },
    { value: "review", ko: "논문리뷰", en: "review" },
  ],
};
