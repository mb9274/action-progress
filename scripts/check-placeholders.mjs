import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const contentDir = path.join(root, 'content');
const launchMode = process.argv.includes('--launch');

const placeholderRe = /\[[A-Z0-9][^\]\n]*\]/g;
const results = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(json|md)$/i.test(entry.name) && !entry.name.startsWith('_TEMPLATE')) {
      const text = fs.readFileSync(full, 'utf8');
      const lines = text.split(/\r?\n/);
      lines.forEach((line, i) => {
        const matches = line.match(placeholderRe);
        if (matches) {
          for (const token of matches) {
            results.push({
              file: path.relative(root, full).replace(/\\/g, '/'),
              line: i + 1,
              token,
            });
          }
        }
      });
    }
  }
}

if (!fs.existsSync(contentDir)) {
  console.error('content/ folder not found.');
  process.exit(1);
}

walk(contentDir);

if (results.length === 0) {
  console.log('No placeholders found in content/.');
  process.exit(0);
}

console.log(`Found ${results.length} placeholder(s) in content/:`);
for (const item of results) {
  console.log(`- ${item.file}:${item.line}  ${item.token}`);
}

if (launchMode) {
  console.error('\nLaunch check failed: replace placeholders with approved information before launch.');
  process.exit(1);
}

console.log('\nPlaceholders are allowed during build. Replace them with real, approved information before launch.');
process.exit(0);
