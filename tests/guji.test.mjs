import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildGuji } from '../scripts/build-guji.mjs';
import { isPublicChapter, renderReaderPage } from '../scripts/guji-lib.mjs';

const testDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.guji-test-output');

const approved = {
  id: 'fixture-approved', bookId: 'huangdi-neijing', volumeId: 'suwen', title: '阅读器测试篇', slug: '01', order: 1,
  sourceEdition: '测试底本', sourceCitation: '测试出处', sourceRightsNote: '测试权利说明', sourceUrl: 'https://example.com/source',
  paragraphs: [{ id: 'p1', text: '用于验证阅读器转义与结构，不作为公开古籍正文。' }],
  sourceVerified: true, rightsCleared: true, complianceApproved: true, reviewStatus: 'published', reviewedBy: '测试流程'
};

test('正文必须同时通过四项公开门槛', () => {
  assert.equal(isPublicChapter(approved), true);
  for (const field of ['sourceVerified', 'rightsCleared', 'complianceApproved']) {
    assert.equal(isPublicChapter({ ...approved, [field]: false }), false, `${field} 不通过时不得公开`);
  }
  assert.equal(isPublicChapter({ ...approved, reviewStatus: 'draft' }), false);
});

test('统一阅读器包含来源、设置、段落锚点和目录导航', async () => {
  const catalog = JSON.parse(await fs.readFile(path.resolve('content/guji/catalog.json'), 'utf8'));
  const book = catalog.books.find((item) => item.id === approved.bookId);
  const volume = book.volumes.find((item) => item.id === approved.volumeId);
  const html = renderReaderPage(catalog, book, volume, approved, {});
  assert.match(html, /class="classic-settings"/);
  assert.match(html, /data-font="up"/);
  assert.match(html, /data-theme="toggle"/);
  assert.match(html, /class="paragraph-anchor"/);
  assert.match(html, /测试底本/);
  assert.match(html, /返回目录/);
  assert.match(html, /文献阅读说明/);
});

test('未通过审核的正文不进入静态构建产物', async () => {
  await fs.rm(testDir, { recursive: true, force: true });
  const result = await buildGuji({ outDir: testDir });
  assert.equal(result.reviewed, 1);
  assert.equal(result.published, 0);
  assert.equal(await fileExists(path.join(testDir, 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'huangdi-neijing', 'suwen', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'shennong-bencao', 'shangpin', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'huangdi-neijing', 'suwen', 'review-workflow-example', 'index.html')), false);
  const files = await walk(testDir);
  const combined = (await Promise.all(files.filter((file) => file.endsWith('.html')).map((file) => fs.readFile(file, 'utf8')))).join('\n');
  assert.equal(combined.includes('GUJI_DRAFT_LEAK_SENTINEL'), false);
  assert.equal(combined.includes('href="/guji/shennong-bencao/shangpin/01/"'), false);
  await fs.rm(testDir, { recursive: true, force: true });
});

test('V1 拒绝生成本草药物详情页', async () => {
  const catalog = JSON.parse(await fs.readFile(path.resolve('content/guji/catalog.json'), 'utf8'));
  const book = catalog.books.find((item) => item.id === 'shennong-bencao');
  const volume = book.volumes[0];
  assert.throws(() => renderReaderPage(catalog, book, volume, { ...approved, bookId: book.id, volumeId: volume.id }), /不生成《神农本草经》药物详情页/);
});

test('公开 sitemap 只包含目录页，不包含未审核正文', async () => {
  const sitemap = await fs.readFile(path.resolve('sitemap.xml'), 'utf8');
  assert.match(sitemap, /https:\/\/nihaixia\.org\/guji\//);
  assert.match(sitemap, /\/guji\/huangdi-neijing\/suwen\//);
  assert.match(sitemap, /\/guji\/shennong-bencao\/xiapin\//);
  assert.doesNotMatch(sitemap, /\/guji\/huangdi-neijing\/suwen\/\d{2}\//);
  assert.doesNotMatch(sitemap, /review-workflow-example/);
});

async function fileExists(file) {
  try { await fs.access(file); return true; } catch (_) { return false; }
}

async function walk(root) {
  const files = [];
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

