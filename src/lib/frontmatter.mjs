/**
 * Minimal frontmatter parser for the content files.
 * Supports simple `key: value` pairs (strings, numbers, true/false).
 * This keeps the content editable without any third-party packages.
 */
export function parseFrontmatter(raw, file = '') {
  const source = String(raw ?? '').replace(/^\uFEFF/, '');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`${file}: missing frontmatter. Start the file with a --- block.`);
  }

  const data = {};
  const lines = match[1].split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const colon = line.indexOf(':');
    if (colon === -1) {
      throw new Error(`${file}: frontmatter line ${index + 2} is missing a colon: ${line}`);
    }

    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();

    if (!key) {
      throw new Error(`${file}: frontmatter line ${index + 2} has no field name.`);
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (/^-?\d+$/.test(value)) value = Number(value);

    data[key] = value;
  });

  return { data, body: match[2] || '' };
}
