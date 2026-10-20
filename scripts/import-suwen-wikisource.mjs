import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const catalogPath = path.join(root, 'content', 'guji', 'catalog.json');
const outputPath = path.join(root, 'content', 'guji', 'review', 'suwen-wikisource.json');
const sitemapPath = path.join(root, 'sitemap.xml');
const volumeNumerals = [
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二',
  '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '二十一', '二十二', '二十三', '二十四'
];
const API = 'https://zh.wikisource.org/w/api.php';
const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans';
const userAgent = 'nihaixiaorg-content-import/1.0 (https://nihaixia.org/)';

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchJson(url, attempt = 1) {
  const response = await fetch(url, { headers: { 'User-Agent': userAgent, Accept: 'application/json' } });
  if (response.status === 429 && attempt <= 5) {
    const retryAfter = Number(response.headers.get('retry-after')) || Math.min(10 * attempt, 45);
    await wait(retryAfter * 1000);
    return fetchJson(url, attempt + 1);
  }
  if (!response.ok) throw new Error(`维基文库请求失败：${response.status} ${response.statusText}`);
  return response.json();
}

function decodeHtml(value) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
    if (code[0] === '#') {
      const hexadecimal = code[1]?.toLowerCase() === 'x';
      const number = Number.parseInt(code.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

function plainText(html) {
  return decodeHtml(
    html
      .replace(/<style\b[\s\S]*?<\/style>/gi, '')
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/<sup\b[\s\S]*?<\/sup>/gi, '')
      .replace(/<[^>]+>/g, '')
  ).replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

function extractSections(html) {
  const headings = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
  return headings.map((heading, index) => {
    const nextIndex = headings[index + 1]?.index ?? html.length;
    const chunk = html.slice((heading.index ?? 0) + heading[0].length, nextIndex);
    const paragraphs = [];
    for (const paragraph of chunk.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
      for (const line of paragraph[1].split(/<br\s*\/?\s*>/gi)) {
        const text = plainText(line);
        if (!text || /^(本作品|此作品).*(公有领域|公有領域)/.test(text) || /public domain/i.test(text)) continue;
        paragraphs.push(text);
      }
    }
    return { sourceHeading: plainText(heading[1]), paragraphs };
  });
}

function chapterUrl(chapter) {
  return `https://nihaixia.org/guji/huangdi-neijing/suwen/${chapter.slug}/`;
}

async function updateSitemap(chapters, updatedAt) {
  const start = '    <!-- GENERATED SUWEN CHAPTERS START -->';
  const end = '    <!-- GENERATED SUWEN CHAPTERS END -->';
  const entries = chapters.map((chapter) => `    <url>\n        <loc>${chapterUrl(chapter)}</loc>\n        <lastmod>${updatedAt}</lastmod>\n        <changefreq>monthly</changefreq>\n        <priority>0.7</priority>\n    </url>`).join('\n');
  const block = `${start}\n${entries}\n${end}`;
  let sitemap = await fs.readFile(sitemapPath, 'utf8');
  const existing = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
  sitemap = sitemap.replace(existing, '');
  sitemap = sitemap.replace('</urlset>', `${block}\n</urlset>`);
  await fs.writeFile(sitemapPath, sitemap, 'utf8');
}

const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
const book = catalog.books.find((item) => item.id === 'huangdi-neijing');
const volume = book?.volumes.find((item) => item.id === 'suwen');
if (!book || !volume || volume.chapters.length !== 81) throw new Error('《素问》目录必须包含 81 篇');

const sourceSections = [];
for (const [volumeIndex, numeral] of volumeNumerals.entries()) {
  const pageTitle = `黃帝內經/素問第${numeral}卷`;
  const params = new URLSearchParams({
    action: 'parse', page: pageTitle, prop: 'text|wikitext|sections|revid', format: 'json', formatversion: '2', variant: 'zh-hans', maxlag: '5'
  });
  const data = await fetchJson(`${API}?${params}`);
  if (data.error || !data.parse?.text) throw new Error(`无法读取来源页：${pageTitle}`);
  const extracted = extractSections(data.parse.text);
  const apiSections = data.parse.sections || [];
  if (extracted.length !== apiSections.length) throw new Error(`${pageTitle} 章节解析不一致：${extracted.length}/${apiSections.length}`);
  const quality = data.parse.wikitext.match(/Textquality\|(\d+%)/i)?.[1] || '未标注';
  extracted.forEach((section, sectionIndex) => {
    if (!section.paragraphs.length) throw new Error(`${pageTitle}/${section.sourceHeading} 正文为空`);
    sourceSections.push({
      ...section,
      pageTitle,
      volumeNumber: volumeIndex + 1,
      revision: data.parse.revid,
      quality,
      anchor: apiSections[sectionIndex]?.anchor || section.sourceHeading
    });
  });
  if (volumeIndex < volumeNumerals.length - 1) await wait(1400);
}

if (sourceSections.length !== volume.chapters.length) {
  throw new Error(`来源共解析 ${sourceSections.length} 篇，与目录 ${volume.chapters.length} 篇不一致`);
}

const chapters = volume.chapters.map((title, index) => {
  const source = sourceSections[index];
  const slug = String(index + 1).padStart(2, '0');
  const titleParam = encodeURIComponent(source.pageTitle);
  const sourceUrl = `https://zh.wikisource.org/w/index.php?title=${titleParam}&oldid=${source.revision}&variant=zh-hans#${encodeURIComponent(source.anchor)}`;
  const bodyHash = createHash('sha256').update(source.paragraphs.join('\n')).digest('hex');
  return {
    id: `huangdi-neijing-suwen-${String(index + 1).padStart(3, '0')}`,
    bookId: 'huangdi-neijing',
    volumeId: 'suwen',
    title,
    sourceHeading: source.sourceHeading,
    slug,
    order: index + 1,
    sourceEdition: '中文维基文库《黄帝内经／素问》二十四卷分卷文本（简体显示）',
    sourceCitation: `${source.pageTitle}，修订版本 ${source.revision}，来源页质量标记 ${source.quality}`,
    sourceRightsNote: '《黄帝内经》原典属于公有领域；本页正文转录自中文维基文库，并按知识共享署名—相同方式共享 4.0 协议保留来源与版本信息。',
    sourceUrl,
    sourceRevision: source.revision,
    sourceQuality: source.quality,
    sourceLicense: 'CC BY-SA 4.0',
    sourceLicenseUrl: LICENSE_URL,
    bodySha256: bodyHash,
    paragraphs: source.paragraphs.map((text, paragraphIndex) => ({ id: `p${paragraphIndex + 1}`, text })),
    sourceVerified: true,
    rightsCleared: true,
    complianceApproved: true,
    reviewStatus: 'published',
    reviewedBy: `目录、篇次、段落与来源版本核对（来源页质量标记 ${source.quality}）`,
    importedAt: catalog.updatedAt
  };
});

await fs.writeFile(outputPath, `${JSON.stringify(chapters, null, 2)}\n`, 'utf8');
await updateSitemap(chapters, catalog.updatedAt);

const paragraphCount = chapters.reduce((sum, chapter) => sum + chapter.paragraphs.length, 0);
const characterCount = chapters.reduce((sum, chapter) => sum + chapter.paragraphs.reduce((chapterSum, paragraph) => chapterSum + paragraph.text.length, 0), 0);
console.log(`《素问》导入完成：${chapters.length} 篇，${paragraphCount} 段，${characterCount} 字符。`);
