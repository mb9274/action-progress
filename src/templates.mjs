import { escapeHtml as esc, isReal, isPlaceholder, absoluteUrl, telHref, whatsappHref, dateTimeAttr } from './lib/html.mjs';
import { formatDate } from './lib/content.mjs';

const NAV_ITEMS = [
  ['Home', '/'],
  ['About', '/about/'],
  ['Our work', '/our-work/'],
  ['Impact', '/impact/'],
  ['Get involved', '/get-involved/'],
  ['Contact', '/contact/'],
];

const ICONS = {
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  whatsapp: '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.5 9.5c.4 2 2 3.6 4 4l1.3-1.3 2.2.9v2.2c-3.8.4-7.4-3.2-7-7h2.2l.9 2.2z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
};

export function icon(name, className = '') {
  const path = ICONS[name] || ICONS.arrow;
  return `<svg class="icon ${className}" aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

function shown(value) {
  if (isPlaceholder(value)) return `<span class="placeholder">${esc(value)}</span>`;
  return esc(value);
}

function fullTitle(site, title, seoTitle) {
  if (seoTitle) return seoTitle;
  if (!title) return `${site.name} | Brookfields, west end of Freetown`;
  return title.includes(site.name) ? title : `${title} | ${site.name}`;
}

function header(site, active) {
  const links = NAV_ITEMS.map(([label, href]) => {
    const isActive = href === '/' ? active === '/' : active === href || active.startsWith(href);
    return `<li><a class="nav-link" href="${href}"${isActive ? ' aria-current="page"' : ''}>${label}</a></li>`;
  }).join('');

  return `<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="Action for Progress home">
      <img class="brand__logo" src="/logo.svg" alt="" width="52" height="52">
      <span class="brand__text">
        <span class="brand__name">${esc(site.name)}</span>
        <span class="brand__place">Brookfields, Freetown</span>
      </span>
    </a>

    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
      ${icon('menu')}<span>Menu</span>
    </button>

    <nav class="site-nav" id="site-nav" aria-label="Main navigation">
      <ul class="nav-list">${links}</ul>
    </nav>

    <div class="header-actions">
      <a class="btn btn--donate" href="/get-involved/#donate">Donate</a>
    </div>
  </div>
</header>`;
}

function footer(site) {
  const year = new Date().getFullYear();
  const phone = isReal(site.phone)
    ? `<a href="${telHref(site.phone)}">${esc(site.phone)}</a>`
    : shown(site.phone);
  const email = isReal(site.email)
    ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`
    : shown(site.email);

  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand brand--footer" href="/">
          <img class="brand__logo" src="/logo.svg" alt="" width="48" height="48">
          <span class="brand__text">
            <span class="brand__name">${esc(site.name)}</span>
            <span class="brand__place">Brookfields, Freetown</span>
          </span>
        </a>
        <p>${esc(site.missionLine)}</p>
        <a class="footer-social" href="${esc(site.facebook)}" rel="noopener noreferrer">${icon('facebook')} Facebook</a>
      </div>

      <nav class="footer-col" aria-labelledby="footer-explore">
        <h2 class="footer-title" id="footer-explore">Explore</h2>
        <ul>
          <li><a href="/about/">About us</a></li>
          <li><a href="/our-work/">Our work</a></li>
          <li><a href="/impact/">Impact and stories</a></li>
          <li><a href="/news/">News and activities</a></li>
          <li><a href="/contact/">Contact</a></li>
        </ul>
      </nav>

      <nav class="footer-col" aria-labelledby="footer-involved">
        <h2 class="footer-title" id="footer-involved">Get involved</h2>
        <ul>
          <li><a href="/get-involved/#donate">Donate</a></li>
          <li><a href="/get-involved/#volunteer">Volunteer</a></li>
          <li><a href="/get-involved/#partner">Partner</a></li>
          <li><a href="/privacy/">Privacy and child safety</a></li>
        </ul>
      </nav>

      <div class="footer-col">
        <h2 class="footer-title">Contact</h2>
        <address>
          ${shown(site.address.street)}<br>
          ${esc(site.address.area)}, ${esc(site.address.city)}<br>
          ${esc(site.address.country)}<br>
          ${phone}<br>
          ${email}
        </address>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© ${year} ${esc(site.name)}. All rights reserved.</p>
      <p>Registration: ${shown(site.registrationNumber)}</p>
      <a href="/privacy/">Privacy</a>
    </div>
  </div>
</footer>`;
}

export function donateBand(donate) {
  const hasMethod = donate.methods.some((method) => method.enabled === true);
  const text = hasMethod ? donate.intro : donate.pendingMessage;

  return `<section class="donate-band" aria-labelledby="donate-band-title">
  <div class="container donate-band__inner">
    <div>
      <p class="eyebrow">Give hope</p>
      <h2 id="donate-band-title">${esc(donate.heading)}</h2>
      <p>${esc(text)}</p>
    </div>
    <a class="btn btn--dark" href="/get-involved/#donate">Donate</a>
  </div>
</section>`;
}

export function layout({
  site,
  donate,
  title,
  seoTitle,
  description,
  canonical,
  ogImage = '/og-default.png',
  ogImageAlt = 'Action for Progress, Brookfields, west end of Freetown',
  active = '',
  body,
  noindex = false,
}) {
  const pageTitle = fullTitle(site, title, seoTitle);
  const image = absoluteUrl(site.url, ogImage);
  const canonicalUrl = absoluteUrl(site.url, canonical);

  const organisation = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: site.name,
    description: site.description,
    sameAs: [site.facebook],
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.address.city,
      addressCountry: 'SL',
    },
  };
  if (isReal(site.email)) organisation.email = site.email;
  if (isReal(site.phone)) organisation.telephone = site.phone;
  if (!site.url.includes('.example')) organisation.url = site.url;

  const jsonLd = JSON.stringify(organisation).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canonicalUrl)}">
  ${noindex ? '<meta name="robots" content="noindex">' : ''}
  <meta name="theme-color" content="${esc(site.themeColor)}">
  <meta name="color-scheme" content="light dark">

  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonicalUrl)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(ogImageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(pageTitle)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">

  <link rel="stylesheet" href="/assets/styles.css">
  <script>document.documentElement.classList.add('js');</script>
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${header(site, active)}
  <main id="main">
${body}
  </main>
  ${donateBand(donate)}
  ${footer(site)}
  <script src="/assets/app.js" defer></script>
</body>
</html>`;
}

export function pageHero({ eyebrow, title, text, accent = '' }) {
  return `<section class="page-hero${accent ? ` page-hero--${esc(accent)}` : ''}">
  <div class="container page-hero__inner">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${esc(title)}</h1>
    ${text ? `<p class="page-hero__text">${esc(text)}</p>` : ''}
  </div>
</section>`;
}

export function focusCard(item) {
  return `<article class="focus-card" data-accent="${esc(item.accent)}">
  <span class="focus-card__icon">${icon(item.icon)}</span>
  <h3>${esc(item.title)}</h3>
  <p>${esc(item.summary)}</p>
  <a class="text-link" href="/our-work/${esc(item.slug)}/">Learn more ${icon('arrow')}</a>
</article>`;
}

export function storyCard(story) {
  const image = story.photo
    ? `<img class="story-card__img" src="${esc(story.photo)}" alt="${esc(story.photoAlt || '')}" width="640" height="420" loading="lazy">`
    : '';
  return `<article class="story-card">
  ${image}
  <div class="story-card__body">
    ${story.dateValue ? `<time datetime="${dateTimeAttr(story.dateValue)}">${esc(formatDate(story.dateValue))}</time>` : ''}
    <h3><a href="/impact/${esc(story.slug)}/">${esc(story.title)}</a></h3>
    <p>${esc(story.summary)}</p>
    <a class="text-link" href="/impact/${esc(story.slug)}/">Read the story ${icon('arrow')}</a>
  </div>
</article>`;
}

export function newsCard(item) {
  return `<article class="news-card">
  <time datetime="${dateTimeAttr(item.dateValue)}">${esc(formatDate(item.dateValue))}</time>
  <h3><a href="/news/${esc(item.slug)}/">${esc(item.title)}</a></h3>
  ${item.summary ? `<p>${esc(item.summary)}</p>` : ''}
  <a class="text-link" href="/news/${esc(item.slug)}/">Read update ${icon('arrow')}</a>
</article>`;
}

export function emptyState(title, text, cta = null) {
  return `<div class="empty-state">
  <span class="empty-state__icon">${icon('heart')}</span>
  <h3>${esc(title)}</h3>
  <p>${text}</p>
  ${cta || ''}
</div>`;
}

export function metricsSection(metrics, note) {
  if (metrics.length === 0) {
    return `<section class="section" aria-labelledby="numbers-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Verified impact</p>
      <h2 id="numbers-title">Numbers we can stand behind</h2>
    </div>
    ${emptyState(
      'Verified numbers are coming',
      `${esc(note)} <span class="placeholder">[VERIFIED IMPACT NUMBERS]</span>`
    )}
  </div>
</section>`;
  }

  const cards = metrics
    .map(
      (metric) => `<div class="metric">
        <span class="metric__value">${esc(metric.value)}</span>
        <span class="metric__label">${esc(metric.label)}</span>
        ${metric.note ? `<span class="metric__note">${esc(metric.note)}</span>` : ''}
      </div>`
    )
    .join('');

  return `<section class="section" aria-labelledby="numbers-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Verified impact</p>
      <h2 id="numbers-title">Numbers we can stand behind</h2>
      <p class="lede">${esc(note)}</p>
    </div>
    <div class="metrics">${cards}</div>
  </div>
</section>`;
}

export function storiesSection(stories) {
  if (stories.length === 0) {
    return `<section class="section" id="stories" aria-labelledby="stories-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Stories</p>
      <h2 id="stories-title">Stories from our community</h2>
    </div>
    ${emptyState(
      'Consented stories will appear here',
      'We publish a beneficiary story only after written consent has been confirmed. No story is shared without permission.'
    )}
  </div>
</section>`;
  }

  return `<section class="section" id="stories" aria-labelledby="stories-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Stories</p>
      <h2 id="stories-title">Stories from our community</h2>
      <p class="lede">Shared with consent. Identifying details of children are never published.</p>
    </div>
    <div class="story-grid">${stories.map(storyCard).join('')}</div>
  </div>
</section>`;
}

export function gallerySection(gallery) {
  if (gallery.length === 0) {
    const placeholders = [1, 2, 3]
      .map(
        () => `<figure class="gallery__item">
      <img class="gallery__img" src="/images/photo-placeholder.svg" alt="Photograph placeholder" width="800" height="600" loading="lazy">
      <figcaption><span class="placeholder">[PHOTO CAPTION]</span></figcaption>
    </figure>`
      )
      .join('');

    return `<section class="section section--alt" aria-labelledby="gallery-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Photographs</p>
      <h2 id="gallery-title">Life at Action for Progress</h2>
      <p class="lede">Real photographs will be added here with permission. We do not use stock images of children.</p>
    </div>
    <div class="gallery">${placeholders}</div>
  </div>
</section>`;
  }

  const figures = gallery
    .map(
      (photo) => `<figure class="gallery__item">
      <img class="gallery__img" src="${esc(photo.src)}" alt="${esc(photo.alt)}" width="800" height="600" loading="lazy">
      <figcaption>${esc(photo.caption)}</figcaption>
    </figure>`
    )
    .join('');

  return `<section class="section section--alt" aria-labelledby="gallery-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Photographs</p>
      <h2 id="gallery-title">Life at Action for Progress</h2>
      <p class="lede">Every photograph is published with permission.</p>
    </div>
    <div class="gallery">${figures}</div>
  </div>
</section>`;
}

export function donatePanel(site, donate) {
  const enabled = donate.methods.filter((method) => method.enabled === true);

  let body;
  if (enabled.length === 0) {
    body = `<div class="donate-pending">
      <p>${esc(donate.pendingMessage)}</p>
      <p class="small">Receiving details: ${shown(donate.receivingNote)}</p>
      <a class="btn btn--solid" href="/contact/">Contact us to give</a>
    </div>`;
  } else {
    const methods = enabled
      .map((method) => {
        const lines = (method.lines || [])
          .filter(Boolean)
          .map((line) => `<li>${shown(line)}</li>`)
          .join('');
        const link = isReal(method.url)
          ? `<a class="btn btn--solid" href="${esc(method.url)}" rel="noopener noreferrer">Open payment link</a>`
          : '';
        return `<div class="donate-method">
          <h3>${esc(method.label)}</h3>
          ${lines ? `<ul class="donate-method__lines">${lines}</ul>` : ''}
          ${link}
        </div>`;
      })
      .join('');

    body = `<div class="donate-methods">${methods}</div>
      <p class="donate-receiving">Receiving details: ${shown(donate.receivingNote)}</p>`;
  }

  return `<section class="section" id="donate" aria-labelledby="donate-title">
  <div class="container">
    <div class="donate-panel">
      <div class="donate-panel__head">
        <p class="eyebrow">Give</p>
        <h2 id="donate-title">${esc(donate.heading)}</h2>
        <p>${esc(donate.intro)}</p>
      </div>
      ${body}
      <p class="privacy-note">Donation details are managed by ${esc(site.name)}. <a href="/privacy/">Read our privacy note</a>.</p>
    </div>
  </div>
</section>`;
}

function formNotice(site) {
  if (isReal(site.formEndpoint)) return '';
  return `<div class="notice" role="note">
    <strong>This form is not connected yet.</strong>
    Please email us at ${shown(site.email)} and we will reply. The form will work once a form endpoint is added to <code>content/site.json</code>.
  </div>`;
}

function formOpen(site, subject, id) {
  const ready = isReal(site.formEndpoint);
  return {
    ready,
    attrs: ready
      ? ` action="${esc(site.formEndpoint)}" method="post" accept-charset="UTF-8"`
      : '',
    hidden: `<input type="hidden" name="_subject" value="${esc(subject)}">
    <div class="hp" aria-hidden="true">
      <label for="${id}-bot">Leave this field empty</label>
      <input id="${id}-bot" type="text" name="_gotcha" tabindex="-1" autocomplete="off">
    </div>`,
  };
}

export function contactForm(site) {
  const form = formOpen(site, 'Website contact form', 'contact');
  return `<form class="form"${form.attrs}>
    ${form.hidden}
    ${formNotice(site)}
    <div class="form-grid">
      <div class="field">
        <label for="contact-name">Your name <span aria-hidden="true">*</span></label>
        <input id="contact-name" name="name" type="text" autocomplete="name" required>
      </div>
      <div class="field">
        <label for="contact-email">Email address <span aria-hidden="true">*</span></label>
        <input id="contact-email" name="email" type="email" autocomplete="email" required>
      </div>
    </div>
    <div class="field">
      <label for="contact-message">Message <span aria-hidden="true">*</span></label>
      <textarea id="contact-message" name="message" rows="5" required></textarea>
    </div>
    <button class="btn btn--solid" type="submit"${form.ready ? '' : ' disabled'}>Send message</button>
    <p class="form-note">We use your details only to reply. <a href="/privacy/">Read our privacy note</a>.</p>
  </form>`;
}

export function involveForm(site) {
  const form = formOpen(site, 'Website get involved form', 'involve');
  return `<form class="form"${form.attrs}>
    ${form.hidden}
    ${formNotice(site)}
    <div class="form-grid">
      <div class="field">
        <label for="involve-name">Your name <span aria-hidden="true">*</span></label>
        <input id="involve-name" name="name" type="text" autocomplete="name" required>
      </div>
      <div class="field">
        <label for="involve-email">Email address <span aria-hidden="true">*</span></label>
        <input id="involve-email" name="email" type="email" autocomplete="email" required>
      </div>
    </div>
    <div class="field">
      <label for="involve-interest">I would like to <span aria-hidden="true">*</span></label>
      <select id="involve-interest" name="interest" required>
        <option value="">Choose one</option>
        <option value="Volunteer">Volunteer</option>
        <option value="Partner">Partner</option>
        <option value="Other">Something else</option>
      </select>
    </div>
    <div class="field">
      <label for="involve-message">How would you like to help? <span aria-hidden="true">*</span></label>
      <textarea id="involve-message" name="message" rows="5" required></textarea>
    </div>
    <button class="btn btn--solid" type="submit"${form.ready ? '' : ' disabled'}>Send my offer</button>
    <p class="form-note">We use your details only to follow up. <a href="/privacy/">Read our privacy note</a>.</p>
  </form>`;
}

export function contactDetails(site) {
  const phone = isReal(site.phone)
    ? `<a href="${telHref(site.phone)}">${esc(site.phone)}</a>`
    : shown(site.phone);
  const email = isReal(site.email)
    ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`
    : shown(site.email);
  const whatsapp = isReal(site.whatsappLink)
    ? `<a href="${esc(site.whatsappLink)}" rel="noopener noreferrer">${esc(site.whatsapp)}</a>`
    : isReal(site.whatsapp)
      ? `<a href="${whatsappHref(site.whatsapp)}" rel="noopener noreferrer">${esc(site.whatsapp)}</a>`
      : shown(site.whatsapp);

  return `<div class="contact-card">
  <h2>Visit, call or write</h2>
  <ul class="contact-list">
    <li>${icon('pin')}<div><span class="contact-label">Address</span><span>${shown(site.address.street)}<br>${esc(site.address.area)}, ${esc(site.address.city)}<br>${esc(site.address.country)}</span></div></li>
    <li>${icon('phone')}<div><span class="contact-label">Phone</span>${phone}</div></li>
    <li>${icon('mail')}<div><span class="contact-label">Email</span>${email}</div></li>
    <li>${icon('whatsapp')}<div><span class="contact-label">WhatsApp</span>${whatsapp}</div></li>
    <li>${icon('clock')}<div><span class="contact-label">Opening hours</span>${shown(site.hours)}</div></li>
  </ul>
  <a class="map-link" href="${esc(site.mapUrl)}" rel="noopener noreferrer">Open Brookfields, Freetown in Google Maps ${icon('arrow')}</a>
  <p class="small">We aim to reply within ${shown(site.responseTime)}.</p>
</div>`;
}

export function teamSection() {
  const cards = [1, 2, 3]
    .map(
      () => `<article class="team-card">
      <span class="team-card__avatar" aria-hidden="true">${icon('users')}</span>
      <h3><span class="placeholder">[TEAM MEMBER NAME]</span></h3>
      <p><span class="placeholder">[ROLE]</span></p>
    </article>`
    )
    .join('');

  return `<section class="section section--alt" aria-labelledby="team-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Our team</p>
      <h2 id="team-title">People behind the work</h2>
      <p class="lede">Names, roles and photographs are published only with each person's permission.</p>
    </div>
    <div class="team-grid">${cards}</div>
  </div>
</section>`;
}

export function registrationSection(site) {
  return `<section class="section" aria-labelledby="registration-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Organization details</p>
      <h2 id="registration-title">Registration</h2>
    </div>
    <dl class="fact-list">
      <div><dt>Organization</dt><dd>${esc(site.name)}</dd></div>
      <div><dt>Registration number</dt><dd>${shown(site.registrationNumber)}</dd></div>
      <div><dt>Year founded</dt><dd>${shown(site.yearFounded)}</dd></div>
      <div><dt>Location</dt><dd>${esc(site.address.area)}, ${esc(site.address.city)}, ${esc(site.address.country)}</dd></div>
    </dl>
    <div class="callout">
      <p><strong>Partner and sponsor logos</strong> will be added here once approved. <span class="placeholder">[PARTNER OR SPONSOR LOGOS]</span></p>
    </div>
  </div>
</section>`;
}

export function shareButtons(url, title) {
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  return `<div class="share">
  <span class="share__label">Share this</span>
  <a class="btn btn--small btn--outline" href="${esc(facebook)}" target="_blank" rel="noopener noreferrer">${icon('facebook')} Facebook <span class="visually-hidden">(opens in a new tab)</span></a>
  <a class="btn btn--small btn--outline" href="${esc(whatsapp)}" target="_blank" rel="noopener noreferrer">${icon('whatsapp')} WhatsApp <span class="visually-hidden">(opens in a new tab)</span></a>
</div>`;
}
