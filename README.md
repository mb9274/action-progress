# Action for Progress website

Official website for **Action for Progress**, a charitable organization in Brookfields, west end of Freetown, Sierra Leone.

This is a fast, static, mobile-first site. Page content lives in editable files so non-technical staff can update text without changing code.

## Quick start

Requirements: **Node.js 18+** (tested with Node 24). No npm packages need to be installed.

```bash
# build the site into dist/
npm run build

# run a local preview at http://127.0.0.1:4321/
npm run dev

# preview without watching for changes
npm run preview
```

Open **http://127.0.0.1:4321/** in your browser after running `npm run dev`.

## Edit content (no code required)

All editable content is in the `content/` folder:

| File / folder | What it controls |
|---|---|
| `content/site.json` | Organization name, site URL, contact details, address, Facebook link, form endpoint |
| `content/donate.json` | **All donation details (single place)** — methods, account numbers, payment link, receiving note |
| `content/home.json` | Home page hero, intro and section text |
| `content/impact.json` | Verified impact numbers and the photo gallery |
| `content/pages/about.md` | About page |
| `content/pages/our-work.md` | Our work overview |
| `content/pages/impact.md` | Impact page intro |
| `content/pages/news.md` | News page intro |
| `content/pages/get-involved.md` | Get involved intro |
| `content/pages/contact.md` | Contact intro |
| `content/pages/privacy-page.md` | Privacy and child safety note |
| `content/work/*.md` | Focus-area pages (girl child education; child and maternal death rate) |
| `content/stories/*.md` | Beneficiary stories (see child safety rules below) |
| `content/news/*.md` | News and activity updates |

See `content/README.md` for a short editing guide.

### Adding a news post

1. Copy `content/news/_TEMPLATE.md` to a new file, e.g. `content/news/2026-11-outreach.md`.
2. Fill in `title`, `date` (`YYYY-MM-DD`), `summary` and the body text using verified facts.
3. Set `published: true` when ready.
4. Run `npm run build`.

### Adding a story or photo

Stories and photos are published **only with consent**.

- A story must have `consentConfirmed: true` and `published: true`.
- If a child is involved, `guardianConsent: true` is also required.
- Add `photo` and `photoAlt` only for consented images placed in `public/images/`.
- The build will stop if these rules are broken.

**Child safety:** never publish a child's full name, exact location, school, or any identifying detail. Use no names or only a first name where consent allows.

### Donation details (one place)

Edit **only** `content/donate.json` to add or change giving information:

- Set `enabled: true` on a method (mobile money, bank transfer, or online payment link) once its details are confirmed.
- Fill in `receivingNote` with who receives the money.
- Until a method is enabled, the site shows a clear "donation details are being finalised" message.

### Forms

Forms are ready for a provider such as **Formspree** (works on Cloudflare Pages and Netlify):

1. Create a form endpoint in Formspree.
2. Set `"formEndpoint"` in `content/site.json` to that URL.
3. Rebuild and deploy.

Until an endpoint is set, forms are shown as not connected and visitors are directed to email.

### Logo and colours

- Replace `public/logo.svg`, `public/favicon.svg`, and `public/apple-touch-icon.png` with the official logo.
- Update brand colours in `src/styles.css` under `:root` (`--indigo`, `--green`, `--rose`, `--yellow`) to match the final logo palette.
- Replace `public/og-default.png` with a branded 1200×630 share image for Facebook/WhatsApp.

## Placeholders

Missing information is shown as visible placeholders like `[PHONE NUMBER]`. They are listed in **`PLACEHOLDERS.md`**.

- `npm run check:placeholders` — list placeholders currently in content.
- `npm run check:launch` — fails if any placeholders remain (use before launch).

**Do not invent facts, statistics, names, or testimonials.** All numbers must be real and checkable.

## Project structure

```text
content/          Editable content (JSON and Markdown)
public/           Static assets (logo, images, manifest)
scripts/          Build, dev server and placeholder checks
src/
  lib/            Content loading, markdown, helpers
  templates.mjs   Page templates and components
  styles.css      Mobile-first styles (brand colours as CSS variables)
  app.js          Small script for the mobile menu
dist/             Built site output (generated)
```

## Deploy (free hosting)

The site builds to static files in `dist/` — no server required. `vercel.json` is included with the build command and output directory so Vercel deploys correctly.

### Vercel

1. Push this repository to GitHub/GitLab.
2. In Vercel → Add New → Project → import the repo.
3. Keep the **Root Directory** as the repository root (do not set it to `dist` or `public`).
4. Vercel will read `vercel.json`: build command `npm run build`, output directory `dist`.
5. Deploy. If the project already exists, go to **Settings → General** and confirm the Root Directory is the repo root, then redeploy.

### Cloudflare Pages

1. Push this repository to GitHub/GitLab.
2. In Cloudflare Dashboard → Pages → Create a project → connect the repo.
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy. Set the real domain in `content/site.json` (`url`) and rebuild.

### Netlify

1. Push this repository to GitHub/GitLab.
2. In Netlify → Add new site → Import an existing project.
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Deploy. (You may also use Netlify Forms as an alternative to Formspree if preferred.)

## Accessibility, SEO and performance

- Mobile-first, lightweight design (minimal JavaScript, compressed/static assets).
- Semantic landmarks, skip link, labelled form fields, visible focus, and alt text.
- Per-page titles/descriptions, Open Graph/Twitter cards, canonical URLs, `sitemap.xml`, and `robots.txt`.
- Organization structured data is included for confirmed facts.
- Test on a real phone and a slow connection before launch.

## Privacy and child safety

- No accounts, no payment processing, no advertising trackers.
- Forms collect only what a visitor submits; add a form provider privacy note as needed.
- Photographs and stories of children require written guardian consent and must not include identifying details. See `/privacy/` on the site and `content/pages/privacy-page.md`.
