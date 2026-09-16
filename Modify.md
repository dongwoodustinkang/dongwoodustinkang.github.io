# 홈페이지 수정 안내

이 사이트는 **HTML + CSS + JavaScript + Markdown**으로 구성된 정적 사이트입니다. 별도 빌드나 패키지 설치 없이 수정할 수 있습니다. 내용만 바꿀 때는 아래 표에 있는 파일부터 열면 됩니다.

## 1. 무엇을 어디서 수정하나요?

| 수정할 항목 | 파일 / 위치 |
| --- | --- |
| 자기소개 한국어 / 영어 | `index.html`의 `id="home-content"` |
| 이름, 프로필 사진, 이메일, 타임라인, 수상·장학금·자격증·어학, 하단 연락처 | `index.html` |
| 공통 메뉴 항목, CV 파일 경로, 프로젝트 분류 | `site-config.js` |
| 프로젝트 추가·삭제·목록 순서·분류·연도 | `projects/projects.json` |
| 프로젝트 제목·소속·링크·이미지·본문 | 해당 `projects/*.md`와 `projects/*.en.md` |
| 전체 색상, 기본 글꼴 | `styles.css` 상단의 `:root` |
| 홈 화면 간격, 사진 크기, 버튼, 타임라인 | `home.css` |
| 공통 헤더, 햄버거 메뉴, KR·EN 버튼 | `site-header.css` |
| 프로젝트 카드, 필터, 1열·2열 배치 | `works.css` |
| 상세 페이지 간격, 갤러리, 오른쪽 눈금 목차 | `project-page.css` |
| 본문 표, 코드 블록, 수식, 영상 스타일 | `project-markdown.css` |

CSS는 공통 → 페이지별 순서로 적용됩니다. 예전 디자인을 덮어쓰던 규칙은 정리했으므로, 새 규칙을 계속 덧붙이기보다 해당 파일의 기존 값을 수정해 주세요.

## 2. 수정한 화면 확인하기

HTML 파일을 더블 클릭해서 여는 `file://` 주소에서는 브라우저가 Markdown과 JSON 읽기를 차단할 수 있습니다. **로컬 미리보기 주소로 확인**하세요.

1. 터미널에서 저장소 폴더로 이동합니다.
2. 아래 명령을 실행합니다. Python 3가 필요합니다.

```sh
cd ~/dongwoodustinkang.github.io
python3 -m http.server 5173 --bind 127.0.0.1
```

3. 브라우저에서 <http://127.0.0.1:5173/>를 엽니다.
4. 파일을 저장한 뒤 브라우저를 새로고침합니다.
5. 서버를 종료하려면 실행한 터미널에서 `Ctrl+C`를 누릅니다.

이미 5173 포트의 서버가 실행 중이면 그 미리보기를 그대로 사용하면 됩니다. 다른 작업이 해당 포트를 사용한다면 `5174`처럼 다른 번호를 사용하세요.

내용 파일은 최신 버전을 확인하도록 요청합니다. CSS나 JavaScript 수정이 바로 보이지 않으면 강력 새로고침(`Cmd+Shift+R`)을 해 보세요. 배포 후에도 이전 파일이 보이는 경우 HTML의 해당 파일 경로 뒤 `?v=...` 값을 새 값으로 바꿉니다. 공통 파일은 세 HTML 모두에서 값을 맞춰 주세요.

## 3. 자기소개, 이름, 사진, 연락처

### 자기소개

- `index.html`의 `id="home-content"` 안에서 각 `<p>`를 수정합니다.
- 태그 안의 문구는 한국어, 같은 태그의 `data-en` 값은 영어입니다.

```html
<p data-en="First introduction paragraph.">첫 번째 소개 문단입니다.</p>
<p data-en="Second introduction paragraph.">두 번째 소개 문단입니다.</p>
```

문단을 추가할 때는 위의 `<p>...</p>` 한 줄을 복사해 한국어와 영어를 함께 입력합니다.

### 이름과 사진

`index.html`에서 다음 항목을 찾습니다.

- `id="home-title"`: 한국어 이름과 `data-en`의 영어 이름
- `class="profile-photo"`: `src`에 프로필 사진 경로
- `<title>`와 `<meta name="description">`: 탭 제목과 검색 설명

현재 프로필 사진 경로는 `assets/images/home-intro-540.jpeg`입니다. 파일을 다른 이름이나 확장자로 교체하면 `index.html`의 `src`도 함께 바꿔 주세요.

사진 크기·둥근 모서리는 `home.css`의 `.profile-photo`에서 바꿉니다. 이름을 변경하면 `language.js`의 홈 탭 제목 및 사진 설명, `project-detail.js`의 상세 탭 제목에 붙는 이름도 확인하세요.

### 이메일과 소셜 링크

`index.html`의 `class="home-contact"`에서 이메일 주소와 화면에 보이는 문구를 바꿉니다. 아래 두 부분을 함께 수정하세요.

```html
<a href="mailto:hello@example.com">hello [at] example [dot] com</a>
```

하단의 `class="contact-links"`에는 GitHub·이메일·Medium·Google Scholar 링크가 있습니다. `href`가 실제 주소, `title`이 링크 이름입니다. 추가할 때 기존 `<a>...</a>` 하나를 복사해 주소·제목·아이콘을 변경하고, 제거할 때는 해당 `<a>...</a>` 전체를 삭제합니다.

## 4. 타임라인과 수상·자격증

이 항목들은 `index.html`에 있습니다. **태그 사이의 문구가 한국어, `data-en` 속성이 영어**입니다. 양쪽을 함께 고치면 KR·EN 전환 시 반영됩니다.

### 타임라인 추가·삭제·정렬

`class="career-list"` 안의 `<li class="career-entry">...</li>` 하나가 경력 한 항목입니다.

- 추가: 기존 `<li>...</li>` 전체를 복사하고 기간·기관·직책·설명을 변경
- 삭제: 해당 `<li>...</li>` 전체 삭제
- 순서: `<li>` 블록을 위아래로 이동

### 수상·자격증 항목 추가

`panel-awards`, `panel-scholarships`, `panel-certificates`, `panel-languages` 중 맞는 영역을 찾습니다. 그 안의 `<ul class="credential-list">`에 다음과 같은 항목을 넣습니다.

```html
<li class="credential-row">
  <div>
    <p class="credential-name" data-en="Award name">수상 이름</p>
    <p class="credential-org" data-en="Organization">기관 이름</p>
  </div>
  <time datetime="2026-09">2026/09</time>
</li>
```

`datetime`은 `2026`, `2026-09`, `2026-09-13` 형식입니다. 기간은 기존 장학금처럼 `<span class="credential-date">2024 - 2026</span>`으로 표시할 수 있습니다.

탭 자체를 추가하거나 삭제할 때는 **버튼과 연결된 패널을 함께** 변경합니다. 버튼의 `aria-controls="panel-example"`과 패널의 `id="panel-example"`, 패널의 `aria-labelledby="tab-example"`과 버튼의 `id="tab-example"`을 서로 맞추세요. 처음 표시할 탭만 `aria-selected="true"`, 해당 패널만 `hidden`을 생략합니다.

## 5. CV와 공통 메뉴

`site-config.js`의 `cv` 값이 홈의 CV 버튼과 모든 햄버거 메뉴의 CV 링크에 공통으로 적용됩니다.

```js
cv: "assets/pdf/dongwoo-kang-cv.pdf",
```

같은 파일 이름으로 PDF를 교체하면 경로를 바꾸지 않아도 됩니다. 다른 이름으로 저장했다면 `cv`만 수정하세요.

`navigation` 배열이 공통 메뉴입니다. 배열 순서가 표시 순서입니다.

```js
{ key: "blog", label: "Blog", href: "https://example.com" },
```

추가할 때는 배열에 항목을 넣고, 제거할 때는 그 항목을 삭제합니다. `home`, `works`, `cv` 키는 현재 페이지 표시와 CV 연결에 사용되므로 기존 항목의 키는 유지하세요. 새로운 일반 링크는 같은 탭에서 열립니다. 메뉴 디자인은 `site-header.css`, 메뉴 생성·열기·닫기는 `shared.js`에 있습니다.

## 6. 기존 프로젝트 수정하기

`projects/projects.json`에서 해당 프로젝트의 `content` 경로를 찾습니다. 예를 들어 다음 항목은 `projects/csi-project-2025.md`를 사용합니다.

```json
{
  "slug": "csi-project-2025",
  "category": "keti",
  "year": "2025",
  "content": "projects/csi-project-2025.md"
}
```

| 필드 | 의미 |
| --- | --- |
| `slug` | 상세 페이지 주소에 쓰는 고유 이름. 영문 소문자·숫자·하이픈 사용 |
| `category` | `keti` 또는 `personal` |
| `year` | Year 필터와 카드에 표시할 연도. 문자열로 작성 |
| `content` | 한국어 Markdown 파일의 저장소 기준 경로 |

카드의 제목과 소속은 Markdown 상단에서 가져옵니다. 대표 이미지는 `## Show`의 첫 번째 이미지입니다. **JSON에 제목이나 대표 이미지를 중복해서 넣지 않습니다.**

Markdown 맨 위의 `---` 사이가 기본 정보입니다. 일반 YAML 전체를 지원하는 것은 아니며 아래 형식을 사용하세요.

```md
---
title: "프로젝트 제목"
author: "Dongwoo Kang"
affiliation: "한국전자기술연구원(KETI)"
venue: "2026"
Links:
- Github: https://github.com/example/project
- Paper: https://example.com/paper
---
```

- `title`: 카드와 상세 페이지의 제목
- `affiliation`: 카드에 표시할 소속
- `author`, `venue`: 작성자·행사 기록용 정보. 현재 상세 화면에서는 별도로 표시하지 않음
- `Links`: 상세 페이지 상단 링크 버튼. 없으면 `Links:`와 하위 항목을 함께 생략 가능
- 버튼 추가·삭제: `- 이름: URL` 줄을 추가·삭제. 빈 URL은 버튼을 만들지 않음
- 카드 연도는 Markdown의 `venue`가 아니라 JSON의 `year`를 사용

## 7. 새 프로젝트 추가하기

1. `projects/project-template.md`를 복사해 `projects/my-project.md`로 저장합니다.
2. 같은 파일을 영어로 작성해 `projects/my-project.en.md`로 저장합니다.
3. 이미지는 `assets/images/my-project/` 폴더에 넣습니다.
4. Markdown의 제목·소속·링크·이미지 경로·본문을 수정합니다.
5. `projects/projects.json` 배열에 아래 항목을 추가합니다.

```json
{
  "slug": "my-project",
  "category": "personal",
  "year": "2026",
  "content": "projects/my-project.md"
}
```

JSON 배열의 항목 사이에는 쉼표가 필요하고, **마지막 항목 뒤에는 쉼표를 넣지 않습니다.** 같은 `slug`를 두 번 사용하지 마세요. 영어 파일은 자동으로 `.en.md` 경로를 읽으므로 JSON에 별도로 등록하지 않습니다. 템플릿 파일 자체는 목록에 등록되어 있지 않아 화면에 나타나지 않습니다.

추가 후 <http://127.0.0.1:5173/projects.html>에서 카드를 확인합니다. 상세 주소는 `project-detail.html?slug=my-project`입니다.

### 순서 변경

`projects.json` 배열에서 항목 전체를 이동합니다. 표시 순서는 연도 자동 정렬이 아니라 **배열 순서**입니다. Year 필터의 연도 선택지만 최신순으로 정렬됩니다.

### 프로젝트 숨기기 / 제거

먼저 `projects.json`에서 해당 항목을 삭제하면 카드에서 사라집니다. 그 `slug`의 상세 주소는 더 이상 프로젝트를 표시하지 않습니다. 본문 파일을 남겨 두면 나중에 다시 등록할 수 있습니다.

완전히 정리하려면 해당 `.md`, `.en.md`, 이미지 폴더도 삭제합니다. 이미지가 다른 프로젝트에서 함께 사용되는지 먼저 검색하세요. `slug`나 파일 이름을 변경할 때는 기존에 공유한 상세 주소도 바뀐다는 점을 고려하세요.

### 분류 변경·추가

개인 프로젝트는 `"category": "personal"`, KETI 프로젝트는 `"category": "keti"`로 설정합니다. 다른 분류를 추가하려면 `site-config.js`의 `categories`에 아래처럼 추가한 다음 프로젝트의 `category`에 같은 `value`를 넣습니다.

```js
{ value: "new-category", ko: "새 분류", en: "New category" },
```

## 8. 프로젝트 본문 작성 규칙

### 이미지 갤러리

```md
## Show
assets/images/my-project/cover.png
assets/images/my-project/result.png
```

첫 이미지가 카드 대표 이미지입니다. 이미지 순서대로 갤러리가 구성되고, 점 버튼 수도 자동으로 맞춰집니다. 이미지가 한 장이면 점 버튼을 숨기고, 이미지가 없으면 갤러리를 숨깁니다. 이미지를 교체·추가·제거할 때 한국어와 영어 파일 양쪽의 목록을 맞춰 주세요.

경로는 대소문자를 구분합니다. 저장소 루트 기준 `assets/images/...` 형식을 권장합니다. `../assets/images/...` 같은 상대 경로는 **Markdown 파일이 있는 폴더 기준**으로 해석합니다.

### 본문 제목과 오른쪽 목차

```md
## Problem Definition

#### 해결하려던 문제
본문을 작성합니다.

## Solution Process

#### 구현 방법
본문을 작성합니다.

## Contribution
내가 맡은 부분과 결과를 작성합니다.
```

- `## 제목`: 큰 본문 구간. 작성한 순서대로 표시
- `### 제목` 또는 `#### 제목`: 본문 내부의 소제목
- 제목을 추가하거나 제거하면 오른쪽 눈금 목차도 자동으로 변경
- `## 문제 정의`처럼 한국어 제목을 직접 사용해도 됨. 영어 파일에는 영어 제목 작성
- `Problem Definition`, `Solution Process`, `Contribution` 등 공통 제목은 한국어 화면에서 자동 번역. 대응 문구는 `language.js`의 `localizedSectionTitle`에서 수정

특별한 제목은 세 가지입니다.

| 제목 | 표시 방식 |
| --- | --- |
| `## Show` | 상단 갤러리 이미지 목록. 일반 본문에 표시하지 않음 |
| `## Overview` | 본문 뒤의 ‘프로젝트 소개’ 문단 |
| `## Media` | ‘프로젝트 소개’ 뒤에 붙일 영상 등 |

그 밖의 `## 제목`은 일반 본문 구간이 됩니다. 예전의 숨겨진 Publications/BibTeX 전용 처리는 제거했습니다. 인용문이나 코드는 필요한 본문 구간에 직접 작성하세요.

### 지원하는 문법

```md
**굵게**, *기울임*, ==강조==, `짧은 코드`

[논문 보기](https://example.com/paper)

- 첫 번째 항목
- 두 번째 항목

![설명](assets/images/my-project/result.png)

| 항목 | 결과 |
| - | - |
| 정확도 | 95% |
```

코드는 백틱 3개로 감싸고 첫 줄에 언어 이름을 붙입니다.

````md
```python
print("Hello")
```
````

수식은 문장 안에서 `$x^2$`, 독립된 문단에서는 아래 형식을 사용합니다.

```md
$$
y = ax + b
$$
```

영상은 `## Media` 아래에 기존 프로젝트처럼 YouTube의 **공유 → 퍼가기**에서 얻은 `<iframe ...></iframe>` 코드를 넣습니다. 이 사이트는 영상용 iframe을 그대로 표시하므로 직접 확인한 퍼가기 코드를 사용하세요. 수식과 코드 색상은 외부 KaTeX·highlight.js를 사용합니다. 이 파일을 불러오지 못해도 본문과 원본 코드는 유지됩니다.

중첩 목록·각주 등 Markdown의 모든 기능을 지원하지는 않습니다. 복잡한 문법은 먼저 미리보기에서 확인하세요.

## 9. 언어와 화면 크기

- KR·EN은 화면 너비가 **540px보다 클 때** 표시됩니다.
- 언어 선택은 해당 브라우저에 저장됩니다.
- 임시로 한 언어만 확인하려면 주소 뒤에 `?lang=ko` / `?lang=en`을 붙입니다.
- 상세 페이지는 이미 `?slug=...`가 있으므로 `&lang=en`처럼 연결합니다.
- 영어 프로젝트가 누락되면 불러오기 오류가 표시됩니다. 한국어·영어 파일을 함께 작성하세요.

휴대폰에서는 카드 1열, 그 외에는 2열입니다. 상세 페이지 눈금 목차도 540px 이하에서는 숨겨집니다. 경계 너비를 바꾸려면 `home.css`, `site-header.css`, `works.css`, `project-page.css`의 `540px` / `541px` 조건을 함께 확인하세요. 목차 위치·눈금 길이는 `project-page.css`의 `.project-toc` 규칙에서 변경할 수 있습니다.

전체 색상은 `styles.css`의 변수로 조정합니다.

```css
--accent: #0088ff;
--accent-hover: #0077df;
--accent-soft: rgb(0 136 255 / 8%);
```

`--accent`는 기본 파랑, `--accent-hover`는 View Work 호버 색, `--accent-soft`는 연한 배경입니다. CV 호버에는 기본 파랑이 적용됩니다.

## 10. 수정 후 검사

Node.js가 설치되어 있다면 저장소 폴더에서 다음을 실행합니다. 별도 패키지 설치는 필요하지 않습니다.

```sh
node --test tests/site.test.cjs
```

프로젝트 이름 중복, 잘못된 분류, 한국어·영어 본문 누락, 로컬 이미지·CV·스크립트 파일 누락, 주요 Markdown 변환을 검사합니다. 외부 웹사이트 링크가 살아 있는지까지 검사하는 것은 아닙니다.

브라우저에서도 아래 동작을 확인하세요.

- 홈 내용과 수상·자격증 탭
- 공통 메뉴 열기·닫기, Home·Works·CV 이동
- KR·EN 전환 후 제목과 프로젝트 본문
- Year / Projects 필터
- 프로젝트 카드 클릭, 갤러리 점 버튼, 오른쪽 목차
- 휴대폰 너비에서 가로 넘침과 1열 카드

로컬 수정은 공개 사이트에 자동으로 올라가지 않습니다. 확인을 마친 뒤 평소 사용하는 Git 저장·업로드 절차로 반영하세요.

## 11. 동작 코드를 수정할 때의 구조

| 파일 | 역할 |
| --- | --- |
| `site-config.js` | 수정 가능한 공통 메뉴·CV·분류 설정 |
| `language.js` | 언어 선택, HTML의 `data-en`, 공통 문구 번역 |
| `shared.js` | 공통 헤더 생성과 메뉴 접근성 처리 |
| `markdown.js` | 본문을 HTML로 변환, 이미지 경로 처리 |
| `project-data.js` | JSON과 번역 Markdown을 읽어 프로젝트 정보 구성 |
| `script.js` | 홈 자기소개 로딩, 수상·자격증 탭 전환 |
| `projects-page.js` | 카드 목록 생성과 필터 |
| `project-detail.js` | 상세 페이지 제목·링크·본문 조립 |
| `project-gallery.js` | 이미지 전환, 방향키, 스와이프 |
| `project-toc.js` | 제목에서 목차 생성, 현재 구간 추적 |
| `project-code.js` | 코드 색상, 복사, 수식 표시 |

HTML 하단의 스크립트 순서는 의존 관계에 맞춰져 있습니다. 이름 변경이나 파일 이동을 할 때는 HTML의 `<script src="...">`와 `<link href="...">`도 함께 수정하세요. 내용 수정이나 프로젝트 추가에는 이 순서를 건드릴 필요가 없습니다.
