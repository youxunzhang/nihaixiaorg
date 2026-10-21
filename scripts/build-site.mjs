import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGuji } from './build-guji.mjs';
import { buildDaodejingReader } from './build-daodejing-reader.mjs';
import { buildYijingTool } from './build-yijing-tool.mjs';
import { isPublishableHerbProfile } from './guji-lib.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const outDir = path.resolve(root, 'dist');

if (outDir === root || !outDir.startsWith(`${root}${path.sep}`)) {
  throw new Error(`拒绝清理不安全的构建路径：${outDir}`);
}

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });

const publicExtensions = new Set(['.html', '.css', '.js', '.xml', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.ico', '.webp', '.svg']);
const rootSpecialFiles = new Set(['_headers', '_redirects', 'ads.txt']);

for (const entry of await fs.readdir(root, { withFileTypes: true })) {
  const source = path.join(root, entry.name);
  const destination = path.join(outDir, entry.name);
  if (entry.isDirectory()) {
    if (entry.name === 'assets' || entry.name === 'data') await fs.cp(source, destination, { recursive: true });
    continue;
  }
  if (rootSpecialFiles.has(entry.name) || publicExtensions.has(path.extname(entry.name).toLowerCase())) {
    await fs.copyFile(source, destination);
  }
}

const result = await buildGuji({ outDir: path.join(outDir, 'guji') });
const daodejingReader = await buildDaodejingReader({ outDir: path.join(outDir, 'data') });
const yijingTool = await buildYijingTool({ outDir: path.join(outDir, 'data') });

const sitemapPath = path.join(outDir, 'sitemap.xml');
const sitemap = await fs.readFile(sitemapPath, 'utf8');
const herbStart = '<!-- GENERATED HERB PROFILES START -->';
const herbEnd = '<!-- GENERATED HERB PROFILES END -->';
if (!sitemap.includes(herbStart) || !sitemap.includes(herbEnd)) {
  throw new Error('sitemap.xml 缺少本草名称页生成标记');
}
const herbBook = result.catalog.books.find((book) => book.id === 'shennong-bencao');
const herbUrls = (result.catalog.herbProfiles || [])
  .filter(isPublishableHerbProfile)
  .map((profile) => {
    const volume = herbBook.volumes.find((item) => item.id === profile.volumeId);
    if (!volume) throw new Error(`本草名称页缺少分部：${profile.name}`);
    return `    <url><loc>https://nihaixia.org/guji/${herbBook.slug}/${volume.slug}/${profile.slug}/</loc><lastmod>${result.catalog.updatedAt}</lastmod><changefreq>yearly</changefreq><priority>0.6</priority></url>`;
  })
  .join('\n');
const herbBlockPattern = new RegExp(`${herbStart}[\\s\\S]*?${herbEnd}`);
await fs.writeFile(sitemapPath, sitemap.replace(herbBlockPattern, `${herbStart}\n${herbUrls}\n    ${herbEnd}`), 'utf8');

const culturalStart = '<!-- GENERATED CULTURAL CLASSICS START -->';
const culturalEnd = '<!-- GENERATED CULTURAL CLASSICS END -->';
const sitemapWithHerbs = await fs.readFile(sitemapPath, 'utf8');
if (!sitemapWithHerbs.includes(culturalStart) || !sitemapWithHerbs.includes(culturalEnd)) {
  throw new Error('sitemap.xml 缺少文化经典生成标记');
}
const culturalIds = new Set(['yijing', 'daodejing']);
const culturalBooks = result.catalog.books.filter((book) => culturalIds.has(book.id));
const culturalUrls = [];
for (const book of culturalBooks) {
  culturalUrls.push(`    <url><loc>https://nihaixia.org/guji/${book.slug}/</loc><lastmod>${result.catalog.updatedAt}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
  for (const volume of book.volumes) {
    culturalUrls.push(`    <url><loc>https://nihaixia.org/guji/${book.slug}/${volume.slug}/</loc><lastmod>${result.catalog.updatedAt}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
  }
  for (const chapter of result.publishedChapters.filter((item) => item.bookId === book.id)) {
    const volume = book.volumes.find((item) => item.id === chapter.volumeId);
    if (!volume) throw new Error(`${book.title}${chapter.title} 缺少分部`);
    culturalUrls.push(`    <url><loc>https://nihaixia.org/guji/${book.slug}/${volume.slug}/${chapter.slug}/</loc><lastmod>${result.catalog.updatedAt}</lastmod><changefreq>yearly</changefreq><priority>0.7</priority></url>`);
  }
}
const culturalBlockPattern = new RegExp(`${culturalStart}[\\s\\S]*?${culturalEnd}`);
await fs.writeFile(sitemapPath, sitemapWithHerbs.replace(culturalBlockPattern, `${culturalStart}\n${culturalUrls.join('\n')}\n    ${culturalEnd}`), 'utf8');

console.log(`站点构建完成：${outDir}`);
console.log(`古籍审核记录 ${result.reviewed} 条，公开正文 ${result.published} 篇。`);
console.log(`《道德经》互动阅读数据 ${daodejingReader.chapters.length} 章。`);
console.log(`周易学习工具数据 ${yijingTool.hexagrams.length} 卦。`);

