import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { genererSitemap } from '../src/utils/generateSitemap.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'public', 'sitemap.xml');

const xml = genererSitemap();
writeFileSync(outPath, xml, 'utf8');
console.log(`Sitemap écrit : ${outPath}`);
