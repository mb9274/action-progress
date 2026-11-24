import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, formatDate } from '../src/lib/content.mjs';
import { markdownToHtml } from '../src/lib/markdown.mjs';
import { escapeHtml as esc, absoluteUrl, isReal, dateTimeAttr } from '../src/lib/html.mjs';
import {
  layout,
  pageHero,
  focusCard,
  storyCard,
  newsCard,
  metricsSection,
  storiesSection,
  gallerySection,
  donatePanel,
  contactForm,
  involveForm,
  contactDetails,
  teamSection,
  registrationSection,
  shareButtons,
  emptyState,
  icon,
} from '../src/templates.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

function writeFile(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents, 'utf8');
}

function routeToFile(outDir, route) {
  const clean = route.replace(/^\/+/, '');
  return route === '/'
    ? path.join(outDir, 'index.html')
    : path.join(outDir, clean, route.endsWith('/') ? 'index.html' : '');
}

function localAssetExists(publicDir, src) {
  if (!src || /^https?:\/\//i.test(src)) return true;
  const clean = src.replace(/^\/+/, '');
  return fs.existsSync(path.join(publicDir, clean));
}

function assertAsset(publicDir, src, label) {
  if (!localAssetExists(publicDir, src)) {
    throw new Error(`${label}: image "${src}" was not found in the public folder.`);
  }
}

export function buildSite({ root = ROOT, outDir = path.join(ROOT, 'dist'), log = true } = {}) {
  const content = loadContent(root);
  const { site, home, donate, impact, pages, work, publishedStories, publishedNews, metrics, gallery, featuredStory } = content;
  const publicDir = path.join(root, 'public');

  for (const photo of gallery) assertAsset(publicDir, photo.src, 'content/impact.json');
  for (const story of publishedStories) {
    if (story.photo) assertAsset(publicDir, story.photo, story.file);
  }
  for (const item of publishedNews) {
    if (item.image) assertAsset(publicDir, item.image, item.file);
  }

  if (!fs.existsSync(publicDir)) {
    throw new Error('public folder not found.');
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.cpSync(publicDir, outDir, { recursive: true });

  const assetsDir = path.join(outDir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.copyFileSync(path.join(root, 'src', 'styles.css'), path.join(assetsDir, 'styles.css'));
  fs.copyFileSync(path.join(root, 'src', 'app.js'), path.join(assetsDir, 'app.js'));

  const routes = [];
  const pagesOut = [];

  function addPage(route, html) {
    writeFile(routeToFile(outDir, route), html);
    routes.push(route);
    pagesOut.push(route);
  }

  function renderPage({ route, title, seoTitle, description, active, body, ogImage, ogImageAlt, noindex }) {
    const html = layout({
      site,
      donate,
      title,
      seoTitle,
      description,
      canonical: route,
      active,
      body,
      ogImage,
      ogImageAlt,
      noindex,
    });
    addPage(route, html);
  }

  const page = (slug) => {
    const item = pages.get(slug);
    if (!item) throw new Error(`Missing page content for "${slug}".`);
    return item;
  };

  /* ---------------- Home ---------------- */

  const hero = home.hero;
  const focusCards = work.map(focusCard).join('');
  const focusList = work
    .map((item) => `<li>${icon(item.icon)}<span>${esc(item.title)}</span></li>`)
    .join('');
  const steps = home.how.items
    .map(
      (item, index) => `<div class="step">
      <span class="step__num">0${index + 1}</span>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.text)}</p>
    </div>`
    )
    .join('');

  const featuredImage = featuredStory?.photo
    ? `<img class="story-feature__img" src="${esc(featuredStory.photo)}" alt="${esc(featuredStory.photoAlt || '')}" width="800" height="600" loading="lazy">`
    : `<div class="story-feature__art" aria-hidden="true"><span>“</span></div>`;

  const featuredBody = featuredStory
    ? `<div class="story-feature__body">
        <p class="eyebrow">${esc(home.stories.eyebrow)}</p>
        <h2>${esc(featuredStory.title)}</h2>
        <p>${esc(featuredStory.summary)}</p>
        <a class="text-link" href="/impact/${esc(featuredStory.slug)}/">${esc(home.stories.cta)} ${icon('arrow')}</a>
      </div>`
    : `<div class="story-feature__body">
        <p class="eyebrow">${esc(home.stories.eyebrow)}</p>
        <h2>${esc(home.stories.pendingTitle)}</h2>
        <p>${esc(home.stories.pendingText)}</p>
        <a class="text-link" href="/impact/">${esc(home.stories.cta)} ${icon('arrow')}</a>
      </div>`;

  const latestNews = publishedNews.slice(0, 2);
  const newsBlock =
    latestNews.length > 0
      ? `<div class="news-grid">${latestNews.map(newsCard).join('')}</div>`
      : emptyState(
          'Updates will appear here',
          `${esc(home.news.emptyText)}`,
          `<a class="btn btn--outline" href="${esc(site.facebook)}" rel="noopener noreferrer">${esc(home.news.cta)}</a>`
        );

  const homeBody = `<section class="hero">
  <div class="container hero__inner">
    <div class="hero__copy">
      <p class="hero__eyebrow">${esc(hero.eyebrow)}</p>
      <h1>${esc(hero.title)}</h1>
      <p class="hero__text">${esc(hero.text)}</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="${esc(hero.primaryCta.href)}">${esc(hero.primaryCta.label)} ${icon('arrow')}</a>
        <a class="btn btn--outline" href="${esc(hero.secondaryCta.href)}" style="color:var(--cream-ink);border-color:rgba(255,249,236,.65)">${esc(hero.secondaryCta.label)}</a>
      </div>
    </div>
    <aside class="hero__panel" aria-label="Our focus areas">
      <p class="hero__panel-label">Our focus</p>
      <ul class="hero__list">${focusList}</ul>
      <p class="hero__place">Brookfields · Freetown · Sierra Leone</p>
    </aside>
  </div>
</section>

<section class="section" aria-labelledby="focus-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">${esc(home.intro.eyebrow)}</p>
      <h2 id="focus-title">${esc(home.intro.title)}</h2>
      <p class="lede">${esc(home.intro.text)}</p>
    </div>
    <div class="focus-grid">${focusCards}</div>
  </div>
</section>

<section class="section section--alt" aria-labelledby="how-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">${esc(home.how.eyebrow)}</p>
      <h2 id="how-title">${esc(home.how.title)}</h2>
    </div>
    <div class="steps">${steps}</div>
  </div>
</section>

<section class="section" aria-labelledby="featured-title">
  <div class="container">
    <div class="story-feature">
      ${featuredImage}
      <div class="story-feature__body">
        <p class="eyebrow">${esc(home.stories.eyebrow)}</p>
        <h2 id="featured-title">${featuredStory ? esc(featuredStory.title) : esc(home.stories.pendingTitle)}</h2>
        <p>${featuredStory ? esc(featuredStory.summary) : esc(home.stories.pendingText)}</p>
        <a class="text-link" href="${featuredStory ? `/impact/${esc(featuredStory.slug)}/` : '/impact/'}">${esc(home.stories.cta)} ${icon('arrow')}</a>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt" aria-labelledby="news-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">${esc(home.news.eyebrow)}</p>
      <h2 id="news-title">${esc(home.news.title)}</h2>
    </div>
    ${newsBlock}
  </div>
</section>`;

  renderPage({
    route: '/',
    title: '',
    seoTitle: `${site.name} | Brookfields, west end of Freetown`,
    description: site.description,
    active: '/',
    body: homeBody,
  });

  /* ---------------- About ---------------- */

  const about = page('about');
  const aboutBody = `${pageHero({
    eyebrow: about.navLabel || 'About',
    title: about.heroTitle || about.title,
    text: about.heroText,
  })}
<section class="section">
  <div class="container prose-wrap">
    <div class="prose">${markdownToHtml(about.body)}</div>
  </div>
</section>
${teamSection()}
${registrationSection(site)}`;

  renderPage({
    route: '/about/',
    title: about.title,
    seoTitle: about.seoTitle,
    description: about.description,
    active: '/about/',
    body: aboutBody,
  });

  /* ---------------- Our work ---------------- */

  const workPage = page('our-work');
  const workBody = `${pageHero({
    eyebrow: workPage.navLabel || 'Our work',
    title: workPage.heroTitle || workPage.title,
    text: workPage.heroText,
  })}
<section class="section">
  <div class="container">
    <div class="prose-wrap prose">${markdownToHtml(workPage.body)}</div>
    <div class="focus-grid" style="margin-top:1.5rem">${work.map(focusCard).join('')}</div>
  </div>
</section>`;

  renderPage({
    route: '/our-work/',
    title: workPage.title,
    seoTitle: workPage.seoTitle,
    description: workPage.description,
    active: '/our-work/',
    body: workBody,
  });

  for (const item of work) {
    const body = `${pageHero({
      eyebrow: 'Our work',
      title: item.title,
      text: item.summary,
      accent: item.accent,
    })}
<section class="section">
  <div class="container prose-wrap">
    <div class="prose">${markdownToHtml(item.body)}</div>
    <p style="margin-top:2rem"><a class="text-link" href="/our-work/">${icon('arrow')} Back to our work</a></p>
  </div>
</section>`;

    renderPage({
      route: `/our-work/${item.slug}/`,
      title: item.title,
      seoTitle: item.seoTitle,
      description: item.description || item.summary,
      active: '/our-work/',
      body,
    });
  }

  /* ---------------- Impact ---------------- */

  const impactPage = page('impact');
  const impactStories = storiesSection(publishedStories);
  const impactBody = `${pageHero({
    eyebrow: 'Impact and stories',
    title: impact.heroTitle || impactPage.title,
    text: impact.heroText || impactPage.heroText,
  })}
<section class="section section--tight">
  <div class="container prose-wrap">
    <div class="prose">${markdownToHtml(impactPage.body)}</div>
  </div>
</section>
${metricsSection(metrics, impact.metricsNote)}
${impactStories}
${gallerySection(gallery)}
<section class="section section--tight">
  <div class="container">
    <div class="callout">
      <p><strong>Follow our work.</strong> Current activities are also posted on our Facebook page.</p>
      <p><a class="text-link" href="${esc(site.facebook)}" rel="noopener noreferrer">${icon('facebook')} Visit Action for Progress on Facebook</a></p>
    </div>
  </div>
</section>`;

  renderPage({
    route: '/impact/',
    title: impactPage.title,
    seoTitle: impactPage.seoTitle,
    description: impactPage.description,
    active: '/impact/',
    body: impactBody,
  });

  for (const story of publishedStories) {
    const url = absoluteUrl(site.url, `/impact/${story.slug}/`);
    const body = `<section class="page-hero"><div class="container page-hero__inner">
      <p class="eyebrow">Impact and stories</p>
      <h1>${esc(story.title)}</h1>
      ${story.dateValue ? `<p class="page-hero__text"><time datetime="${dateTimeAttr(story.dateValue)}">${esc(formatDate(story.dateValue))}</time></p>` : ''}
    </div></section>
    <section class="section">
      <div class="container prose-wrap">
        ${story.photo ? `<img src="${esc(story.photo)}" alt="${esc(story.photoAlt || '')}" width="900" height="600" style="border-radius:var(--radius);margin-bottom:1.5rem">` : ''}
        <div class="prose">${markdownToHtml(story.body)}</div>
        ${shareButtons(url, story.title)}
        <p class="small" style="margin-top:1.5rem">This story is shared with consent. Identifying details of children are not published. <a href="/privacy/">Read our privacy and child safety note</a>.</p>
        <p style="margin-top:1.5rem"><a class="text-link" href="/impact/">${icon('arrow')} Back to impact and stories</a></p>
      </div>
    </section>`;

    renderPage({
      route: `/impact/${story.slug}/`,
      title: story.title,
      description: story.summary,
      active: '/impact/',
      body,
      ogImage: story.photo || '/og-default.png',
      ogImageAlt: story.photoAlt || 'Action for Progress story',
    });
  }

  /* ---------------- News ---------------- */

  const newsPage = page('news');
  const newsList =
    publishedNews.length > 0
      ? `<div class="news-grid">${publishedNews.map(newsCard).join('')}</div>`
      : emptyState(
          'News will appear here',
          'Updates from Action for Progress will be published here. For current activities, visit our Facebook page.',
          `<a class="btn btn--solid" href="${esc(site.facebook)}" rel="noopener noreferrer">${icon('facebook')} Visit our Facebook page</a>`
        );

  const newsBody = `${pageHero({
    eyebrow: 'News and activities',
    title: newsPage.heroTitle || newsPage.title,
    text: newsPage.heroText,
  })}
<section class="section">
  <div class="container">
    <div class="prose-wrap prose" style="margin-bottom:1.5rem">${markdownToHtml(newsPage.body)}</div>
    ${newsList}
  </div>
</section>`;

  renderPage({
    route: '/news/',
    title: newsPage.title,
    seoTitle: newsPage.seoTitle,
    description: newsPage.description,
    active: '/news/',
    body: newsBody,
  });

  for (const item of publishedNews) {
    const url = absoluteUrl(site.url, `/news/${item.slug}/`);
    const body = `<section class="page-hero"><div class="container page-hero__inner">
      <p class="eyebrow">News and activities</p>
      <h1>${esc(item.title)}</h1>
      <p class="page-hero__text"><time datetime="${dateTimeAttr(item.dateValue)}">${esc(formatDate(item.dateValue))}</time></p>
    </div></section>
    <section class="section">
      <div class="container prose-wrap">
        ${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.imageAlt || '')}" width="900" height="600" style="border-radius:var(--radius);margin-bottom:1.5rem">` : ''}
        <div class="prose">${markdownToHtml(item.body)}</div>
        ${shareButtons(url, item.title)}
        <p style="margin-top:1.5rem"><a class="text-link" href="/news/">${icon('arrow')} Back to news</a></p>
      </div>
    </section>`;

    renderPage({
      route: `/news/${item.slug}/`,
      title: item.title,
      description: item.summary || site.description,
      active: '/news/',
      body,
      ogImage: item.image || '/og-default.png',
      ogImageAlt: item.imageAlt || item.title,
    });
  }

  /* ---------------- Get involved ---------------- */

  const involved = page('get-involved');
  const involvedBody = `${pageHero({
    eyebrow: 'Get involved',
    title: involved.heroTitle || involved.title,
    text: involved.heroText,
  })}
<section class="section section--tight">
  <div class="container prose-wrap">
    <div class="prose">${markdownToHtml(involved.body)}</div>
  </div>
</section>
${donatePanel(site, donate)}
<section class="section section--alt" id="volunteer" aria-labelledby="involve-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Volunteer or partner</p>
      <h2 id="involve-title">Lend your time or work with us</h2>
      <p class="lede">Tell us how you would like to help. We will reply with the next step.</p>
    </div>
    <div class="contact-grid">
      <div class="stack">
        <div class="callout" id="partner">
          <h3>Partner with us</h3>
          <p>We welcome partners, NGOs, government offices and community groups who share our focus on girls, mothers and children.</p>
          <p class="small">Partnership details: <span class="placeholder">[PARTNERSHIP OPPORTUNITIES]</span></p>
        </div>
        <div class="callout">
          <h3>Volunteer</h3>
          <p>Volunteers can support our advocacy, donation and sensitization work.</p>
          <p class="small">Current needs: <span class="placeholder">[VOLUNTEER OPPORTUNITIES]</span></p>
        </div>
      </div>
      <div class="form-card">
        <h3>Send an offer of help</h3>
        ${involveForm(site)}
      </div>
    </div>
  </div>
</section>`;

  renderPage({
    route: '/get-involved/',
    title: involved.title,
    seoTitle: involved.seoTitle,
    description: involved.description,
    active: '/get-involved/',
    body: involvedBody,
  });

  /* ---------------- Contact ---------------- */

  const contact = page('contact');
  const contactBody = `${pageHero({
    eyebrow: 'Contact',
    title: contact.heroTitle || contact.title,
    text: contact.heroText,
  })}
<section class="section">
  <div class="container">
    <div class="prose-wrap prose" style="margin-bottom:1.5rem">${markdownToHtml(contact.body)}</div>
    <div class="contact-grid">
      ${contactDetails(site)}
      <div class="form-card">
        <h2>Send us a message</h2>
        ${contactForm(site)}
      </div>
    </div>
  </div>
</section>`;

  renderPage({
    route: '/contact/',
    title: contact.title,
    seoTitle: contact.seoTitle,
    description: contact.description,
    active: '/contact/',
    body: contactBody,
  });

  /* ---------------- Privacy ---------------- */

  const privacy = page('privacy');
  const privacyBody = `${pageHero({
    eyebrow: 'Privacy',
    title: privacy.heroTitle || privacy.title,
    text: privacy.heroText,
  })}
<section class="section">
  <div class="container prose-wrap">
    <div class="prose">${markdownToHtml(privacy.body)}</div>
  </div>
</section>`;

  renderPage({
    route: '/privacy/',
    title: privacy.title,
    seoTitle: privacy.seoTitle,
    description: privacy.description,
    active: '',
    body: privacyBody,
  });

  /* ---------------- 404 ---------------- */

  const notFoundBody = `<section class="error-page">
  <div class="container">
    <p class="eyebrow">Page not found</p>
    <h1>We could not find that page.</h1>
    <p>The page may have moved. Return to the home page, or contact us if you were looking for something specific.</p>
    <a class="btn btn--solid" href="/">Go to the home page</a>
  </div>
</section>`;

  const notFoundHtml = layout({
    site,
    donate,
    title: 'Page not found',
    description: 'The page you were looking for could not be found.',
    canonical: '/404.html',
    active: '',
    body: notFoundBody,
    noindex: true,
  });
  addPage('/404.html', notFoundHtml);

  /* ---------------- Sitemap and robots ---------------- */

  const sitemapRoutes = routes.filter((route) => route !== '/404.html');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
${sitemapRoutes
  .map((route) => `  <url><loc>${esc(absoluteUrl(site.url, route))}</loc></url>`)
  .join('\n')}
</urlset>
`;
  writeFile(path.join(outDir, 'sitemap.xml'), sitemap);

  const robots = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl(site.url, '/sitemap.xml')}
`;
  writeFile(path.join(outDir, 'robots.txt'), robots);
  writeFile(path.join(outDir, '.nojekyll'), '');

  if (log) {
    console.log(`Built ${routes.length} pages to ${path.relative(root, outDir) || 'dist'}`);
    console.log(`Routes: ${routes.join(', ')}`);
  }

  return { routes, outDir };
}
