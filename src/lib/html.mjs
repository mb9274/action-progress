export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function attr(value) {
  return escapeHtml(value);
}

export function isPlaceholder(value) {
  return typeof value === 'string' && /\[[A-Z0-9][^\]]*\]/.test(value);
}

export function isReal(value) {
  return typeof value === 'string' && value.trim() !== '' && !isPlaceholder(value);
}

export function absoluteUrl(siteUrl, pathname) {
  return new URL(pathname, siteUrl).href;
}

export function telHref(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, '')}`;
}

export function whatsappHref(value) {
  return `https://wa.me/${String(value).replace(/\D/g, '')}`;
}

export function dateTimeAttr(date) {
  return date ? date.toISOString().slice(0, 10) : '';
}
