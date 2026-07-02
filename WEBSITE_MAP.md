# Asthana Group Website Map

This website is a static HTML/CSS site. The public site root is this `gw/`
folder, and `CNAME` points the site to `theasthanagroup.com`.

## High-Level Structure

```text
gw/
├── index.html              # Home page
├── research.html           # Research areas and selected highlights
├── funding.html            # Research funding and computing resources
├── outputs.html            # Publications, software, talks, teaching, and training
├── publications.html       # Highlighted and full publication lists
├── software.html           # Group software projects
├── people.html             # Current members, open positions, alumni
├── culture.html            # Group culture, values, and photo gallery
├── news.html               # Chronological group updates
├── join.html               # Hiring and joining information
├── opportunities.html      # Redirects old opportunities URL to join.html
├── legal.html              # Copyright and template credits
├── 404.html / 404.md       # Not-found page
├── style.css               # Legacy/global styles and older page rules
├── pages.css               # Current shared page layout system
├── research.css            # Research-page-specific layout
├── manifest.json           # Web app metadata
├── sw.js                   # Service worker cache
├── assets/
│   ├── ayush_cv.pdf
│   ├── fonts/              # CircularStd web font files
│   ├── js/app.js           # Registers the service worker
│   └── img/                # Site imagery
└── CNAME                   # Custom domain
```

## Shared Page Components

Most pages follow the same structure:

```text
<head>
  Google Analytics
  Animate.css
  Bootstrap 4.4.1
  style.css
  pages.css
  Font Awesome
</head>

<body class="site-shell">
  desktop nav: .nav-desk.site-nav
  main page content: .site-page .page-container
  footer: .footer-full.site-footer
  mobile hamburger menu: .menu-wrap
</body>
```

Common reusable classes live mainly in `pages.css`:

```text
.site-shell            Overall page shell/background
.site-nav              Desktop navigation
.site-page             Main page wrapper
.page-container        Content width container
.page-header           Eyebrow, title, subtitle block
.page-section          Major content section
.page-section-title    Section heading
.page-card             Reusable card surface
.page-card--link       Clickable card variant
.page-grid             Responsive card grid
.page-tag              Pill-style text link
.page-action           Primary call-to-action button
.site-footer           Footer layout
.menu-wrap             Mobile hamburger menu
```

## Page Map

| Page | Purpose | Main Components | Key Assets |
| --- | --- | --- | --- |
| `index.html` | Landing/home page for the group. | Hero, latest updates, research thrusts, funding/collaboration callout. | `manifest.json`, `assets/js/app.js`, optimized group image. |
| `research.html` | Explains the group's research program. | Research problem cards, accuracy target, side/sub navigation, four research program cards, selected highlights. | Publication graphics, `assets/img/theme1.png`, `assets/img/4.png`, `research.css`. |
| `funding.html` | Lists sponsored projects and computing-resource support. | Funding total strip, grant cards, metadata grid, source links. | Public award and program links. |
| `outputs.html` | Collects research products. | Papers/software cards, talks/training section, collaboration ecosystem card. | Publication graphics, `assets/img/4.png`. |
| `publications.html` | Lists research outputs. | Highlighted publication cards, main publications list, before-UND publications, software citations. | `assets/img/publications/generalized-eigenvalue.jpeg`, `qseom-ga.gif`, `quantum-krylov.png`, `chemically-decisive-benchmarks.png`. |
| `software.html` | Lists software projects and citations. | Cards for QCANT, BenchmarkQC, AutoGen-wick, and CFOUR. | External GitHub/CFOUR links. |
| `people.html` | Shows group members and alumni. | Current member grid, open positions card, alumni grid. | Headshots in `assets/img/` and `assets/img/pics/`, plus `assets/ayush_cv.pdf`. |
| `culture.html` | Shows group values and lab photos. | Group photo hero, values grid, lab moments gallery. | Optimized gallery images in `assets/img/optimized/`. |
| `news.html` | Chronological group updates. | News card list from 2023 through 2026, with occasional images. | `assets/img/pacs.jpeg`, `assets/img/gpAPS.jpg`. |
| `join.html` | Describes joining/hiring opportunities. | Current openings hero, role cards, what-to-send checklist, skills section. | Optimized group image, external mail links. |
| `opportunities.html` | Legacy URL redirect. | Meta refresh to `join.html`. | None. |
| `legal.html` | Legal and credit information. | Compact card with copyright/template credit. | None beyond shared styles. |
| `404.html` | Not-found fallback. | Compact error page with navigation back to the site. | None beyond shared styles. |

## Research Page Components

`research.html` has its own component layer in `research.css`.

```text
.research-problem-grid    Three-card "Problems to solve" grid
.research-problem-card    Individual problem card with image, text, and credit
.research-accuracy-banner Accuracy target callout
.research-thrust-list     Stacked research thrust cards
.research-thrust-card     Individual thrust block with citations/grants
.research-citation-list   Paper, software, and funding evidence links
```

Research sections:

```text
#problems-to-solve
#molecular-quantum-algorithms
#challenging-quantum-chemistry
#materials-simulation
#open-source-software
```

## People Components

`people.html` uses shared card classes plus people-specific classes from
`pages.css`.

```text
.people-grid
.people-grid--compact
.person-card
.person-photo
.person-photo--placeholder
.person-body
.person-name
.person-role
.person-meta
.person-links
.open-positions-card
```

Current people represented:

```text
Ayush Asthana
Srivathsan Poyyapakkam Sundar
Mushir Thodika
Prince Frederick Kwao
Sonal Jain
Adan Abdihakim
```

Alumni represented:

```text
Sean Glaholt
```

## Publication Components

`publications.html` uses these main component families:

```text
.publication-feature-grid
.publication-feature-card
.publication-feature-media
.publication-feature-body
.publication-card
.publication-title
.publication-authors
.publication-venue
.publications-software-card
```

Publication anchors used for internal linking:

```text
#molecular-excited-states
#chemically-decisive
#quantum-krylov
#generalized-eigenvalue-paper
#analytic-gradients-paper
#response-properties-paper
#qseom-paper
#uranium-un2-paper
```

## Software Components

Software cards are linkable by ID:

```text
#qcant-software
#benchmarkqc-software
#autogenwick-software
```

The software page also includes a CFOUR card without an internal ID.

## Culture Components

`culture.html` uses:

```text
.culture-hero-card
.culture-hero-image
.culture-hero-body
.culture-gallery
.culture-gallery-card
```

Culture gallery images are currently:

```text
assets/img/optimized/spring-theoretical-chemists-2026-1.jpg
assets/img/optimized/spring-theoretical-chemists-2026-2.jpg
assets/img/optimized/spring-theoretical-chemists-2026-3.jpg
assets/img/optimized/catan-scoreboard-1400.jpg
assets/img/optimized/groupacs-1200.jpg
assets/img/optimized/group24_24-1400.jpg
assets/img/optimized/catan-1200.jpg
assets/img/optimized/bday2-1200.jpg
assets/img/optimized/bday1-1200.jpg
assets/img/optimized/grp2-1200.jpg
```

## Asset Map

```text
assets/img/
  Group, people, research, news, and logo images.

assets/img/publications/
  Publication thumbnail images and GIFs.

assets/img/pics/
  Smaller group/culture images and Mushir headshot.

assets/fonts/
  CircularStd font files used by `style.css`.

assets/js/app.js
  Registers `sw.js` when service workers are available.

assets/ayush_cv.pdf
  Linked from Ayush's people card.
```

## Styling Map

```text
style.css
  Older global styles, font definitions, nav/menu/footer rules, and some
  legacy page-specific rules. This file contains repeated legacy sections, so
  edit with care.

pages.css
  Current shared visual system for the newer pages: shell, nav, cards, page
  headers, grids, people cards, publication cards, software cards, culture
  gallery, compact pages, footer, and mobile menu overrides.

research.css
  Focused styles for the current research page layout and research-area cards.
```

## JavaScript and Offline Support

```text
assets/js/app.js
  Called by `index.html`; registers `./sw.js`.

sw.js
  Defines cache `site-static-v82` and pre-caches core HTML/CSS/assets. Fetches
  from cache first, then network.

manifest.json
  Defines the app name, start page, colors, orientation, and app icon.
```

## Navigation Flow

```text
Home
├── Research
│   ├── #problems-to-solve
│   ├── #molecular-quantum-algorithms
│   ├── #challenging-quantum-chemistry
│   ├── #materials-simulation
│   └── #open-source-software
├── Funding
├── Outputs
│   ├── Publications
│   ├── Software
│   ├── #talks-training
│   └── #collaborations
├── People
├── Culture
│   ├── People
│   └── Join
├── News
└── Join
```

## Maintenance Notes

When adding or editing a normal page, update both navigation blocks:

```text
desktop nav: .nav-desk.site-nav
mobile nav:  .menu-wrap
```

When adding important new pages or assets, update the cache list in `sw.js` and
increment `staticCacheName` so browsers refresh the cached version.

For new shared visual patterns, prefer adding them to `pages.css`. For research
only patterns, use `research.css`. Avoid adding new page-specific rules to the
duplicated legacy sections in `style.css` unless the existing page depends on
that older styling.
