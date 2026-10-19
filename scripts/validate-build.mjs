import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(scriptDir, '..', 'dist');
const gujiRoot = path.join(dist, 'guji');

async function walk(root, extension) {
  const files = [];
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute, extension));
    else if (!extension || entry.name.endsWith(extension)) files.push(absolute);
  }
  return files;
}

async function exists(file) {
  try { await fs.access(file); return true; } catch (_) { return false; }
}

function targetFor(urlPath) {
  const clean = decodeURI(urlPath.split('#')[0].split('?')[0]);
  if (clean === '/') return path.join(dist, 'index.html');
  if (clean === '/books') return path.join(dist, 'books.html');
  if (clean.endsWith('/')) return path.join(dist, clean.slice(1), 'index.html');
  return path.join(dist, clean.slice(1));
}

const htmlFiles = await walk(gujiRoot, '.html');
const failures = [];
const canonicals = new Set();
for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  if (!canonical) failures.push(`${path.relative(dist, file)} -> 缺少 canonical`);
  else if (canonicals.has(canonical)) failures.push(`${path.relative(dist, file)} -> canonical 重复：${canonical}`);
  else canonicals.add(canonical);
  const urls = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const url of urls) {
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    const target = targetFor(url);
    if (!await exists(target)) failures.push(`${path.relative(dist, file)} -> ${url}`);
  }
}

if (failures.length) {
  console.error('发现无效内部链接：');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`内部链接检查通过：${htmlFiles.length} 个古籍页面。`);
}

