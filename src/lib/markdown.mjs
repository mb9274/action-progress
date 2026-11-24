/**
 * A deliberately small Markdown renderer.
 * Supports headings, paragraphs, lists, blockquotes, horizontal rules,
 * links, bold and italic. Raw HTML is escaped, so content cannot inject markup.
 */

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(text) {
  let out = escapeHtml(text);

  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) => {
    const safeHref = href.replace(/&amp;/g, '&');
    if (!/^(https?:\/\/|mailto:|\/|#)/i.test(safeHref)) return match;
    const external = /^https?:\/\//i.test(safeHref);
    const rel = external ? ' rel="noopener noreferrer"' : '';
    return `<a href="${href}"${rel}>${label}</a>`;
  });

  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');

  return out;
}

function isList(lines, pattern) {
  return lines.length > 0 && lines.every((line) => pattern.test(line));
}

export function markdownToHtml(markdown) {
  const source = String(markdown ?? '').replace(/\r\n/g, '\n').trim();
  if (!source) return '';

  const blocks = source.split(/\n\s*\n/);
  const html = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trimEnd());
    const first = lines[0].trim();

    const heading = first.match(/^(#{2,4})\s+(.*)$/);
    if (heading && lines.length === 1) {
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^---+$/.test(first) && lines.length === 1) {
      html.push('<hr>');
      continue;
    }

    if (isList(lines, /^[-*]\s+/)) {
      const items = lines.map((line) => `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`);
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (isList(lines, /^\d+\.\s+/)) {
      const items = lines.map((line) => `<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`);
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    if (isList(lines, /^>\s?/)) {
      const quote = lines.map((line) => line.replace(/^>\s?/, '')).join(' ');
      html.push(`<blockquote><p>${inline(quote)}</p></blockquote>`);
      continue;
    }

    html.push(`<p>${inline(lines.join(' '))}</p>`);
  }

  return html.join('\n');
}
