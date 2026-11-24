import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from './frontmatter.mjs';

const PLACEHOLDER_PATTERN = /\[[A-Z0-9][A-Z0-9 _/&'’.,—–-]*\]/;

export function hasPlaceholder(value) {
  return typeof value === 'string' && PLACEHOLDER_PATTERN.test(value);
}

export function isReal(value) {
  return typeof value === 'string' && value.trim() !== '' && !hasPlaceholder(value);
}

export function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${file}: could not read JSON.\n${error.message}`);
  }
}

export function readMarkdownDir(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .sort()
    .map((name) => {
      const file = path.join(dir, name);
      const raw = fs.readFileSync(file, 'utf8');
      const { data, body } = parseFrontmatter(raw, file);
      return {
        ...data,
        slug: data.slug || name.replace(/\.md$/, ''),
        file,
        body,
      };
    });
}

function requireField(record, field, collection) {
  if (record[field] === undefined || record[field] === '') {
    throw new Error(`${record.file || collection}: "${field}" is required.`);
  }
}

function parseDate(value, file) {
  if (!value) return null;
  const text = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(`${file}: date must be written as YYYY-MM-DD.`);
  }
  const date = new Date(`${text}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${file}: "${text}" is not a valid date.`);
  }
  return date;
}

export function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function validateStory(story) {
  if (!story.published) return;

  requireField(story, 'title', 'story');
  requireField(story, 'summary', 'story');
  requireField(story, 'body', 'story');

  if (story.consentConfirmed !== true) {
    throw new Error(
      `${story.file}: this story is marked published but consentConfirmed is not true.\n` +
        'A story cannot be published without written consent.'
    );
  }

  if (story.childInvolved === true && story.guardianConsent !== true) {
    throw new Error(
      `${story.file}: this story involves a child but guardianConsent is not true.\n` +
        'Written guardian consent is required before publishing.'
    );
  }

  if (story.photo && !story.photoAlt) {
    throw new Error(`${story.file}: add photoAlt describing the photograph.`);
  }

  if (story.photo && story.consentConfirmed !== true) {
    throw new Error(`${story.file}: a photograph cannot be published without consent.`);
  }

  for (const field of ['title', 'summary', 'body']) {
    if (hasPlaceholder(story[field])) {
      throw new Error(
        `${story.file}: "${field}" still contains a placeholder. Replace it before publishing.`
      );
    }
  }
}

function validateNews(item) {
  if (!item.published) return;

  requireField(item, 'title', 'news');
  requireField(item, 'date', 'news');
  requireField(item, 'body', 'news');

  for (const field of ['title', 'summary', 'body']) {
    if (hasPlaceholder(item[field])) {
      throw new Error(
        `${item.file}: "${field}" still contains a placeholder. Replace it before publishing.`
      );
    }
  }
}

export function loadContent(root) {
  const contentDir = path.join(root, 'content');

  const site = readJson(path.join(contentDir, 'site.json'));
  const home = readJson(path.join(contentDir, 'home.json'));
  const donate = readJson(path.join(contentDir, 'donate.json'));
  const impact = readJson(path.join(contentDir, 'impact.json'));

  const pages = readMarkdownDir(path.join(contentDir, 'pages'));
  const pageMap = new Map(pages.map((page) => [page.slug, page]));

  for (const required of ['about', 'our-work', 'impact', 'news', 'get-involved', 'contact', 'privacy']) {
    if (!pageMap.has(required)) {
      throw new Error(
        `content/pages: missing page "${required}". Add a Markdown file with "slug: ${required}".`
      );
    }
  }

  const work = readMarkdownDir(path.join(contentDir, 'work')).sort(
    (a, b) => Number(a.order || 99) - Number(b.order || 99)
  );

  if (work.length === 0) {
    throw new Error('content/work: add at least one focus-area page.');
  }

  for (const item of work) {
    requireField(item, 'title', 'work');
    requireField(item, 'summary', 'work');
    item.accent = item.accent === 'rose' ? 'rose' : 'green';
    item.icon = item.icon === 'heart' ? 'heart' : 'book';
  }

  const stories = readMarkdownDir(path.join(contentDir, 'stories')).map((story) => ({
    ...story,
    dateValue: parseDate(story.date, story.file),
  }));
  stories.forEach(validateStory);

  const news = readMarkdownDir(path.join(contentDir, 'news')).map((item) => ({
    ...item,
    dateValue: parseDate(item.date, item.file),
  }));
  news.forEach(validateNews);

  const publishedStories = stories
    .filter((story) => story.published)
    .sort((a, b) => (b.dateValue?.getTime() || 0) - (a.dateValue?.getTime() || 0));

  const publishedNews = news
    .filter((item) => item.published)
    .sort((a, b) => (b.dateValue?.getTime() || 0) - (a.dateValue?.getTime() || 0));

  const metrics = Array.isArray(impact.metrics) ? impact.metrics : [];
  metrics.forEach((metric) => {
    if (!metric.value || !metric.label) {
      throw new Error('content/impact.json: each metric needs a value and a label.');
    }
  });

  const gallery = Array.isArray(impact.gallery) ? impact.gallery : [];
  gallery.forEach((photo) => {
    if (!photo.src || !photo.alt || !photo.caption) {
      throw new Error('content/impact.json: each gallery photo needs src, alt and caption.');
    }
    if (photo.consentConfirmed !== true) {
      throw new Error(
        `content/impact.json: "${photo.src}" cannot be shown until consentConfirmed is true.`
      );
    }
  });

  const featuredStory =
    publishedStories.find((story) => story.featured === true) || publishedStories[0] || null;

  return {
    site,
    home,
    donate,
    impact,
    pages: pageMap,
    work,
    stories,
    publishedStories,
    news,
    publishedNews,
    metrics,
    gallery,
    featuredStory,
  };
}
