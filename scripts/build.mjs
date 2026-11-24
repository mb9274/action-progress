import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSite } from './build-site.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

try {
  buildSite({ root });
} catch (error) {
  console.error('Build failed:');
  console.error(error?.stack || error?.message || error);
  process.exit(1);
}
