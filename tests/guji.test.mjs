import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildGuji } from '../scripts/build-guji.mjs';
import { isPublishableHerbProfile, isPublicChapter, renderBookPage, renderHerbProfilePage, renderLibraryIndex, renderReaderPage } from '../scripts/guji-lib.mjs';

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
  assert.equal(result.reviewed, 82);
  assert.equal(result.published, 81);
  assert.equal(result.herbProfiles, 12);
  assert.equal(await fileExists(path.join(testDir, 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'huangdi-neijing', 'suwen', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'shennong-bencao', 'shangpin', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'shennong-bencao', 'shangpin', 'renshen', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'huangdi-neijing', 'suwen', '01', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'huangdi-neijing', 'suwen', '81', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'huangdi-neijing', 'suwen', 'review-workflow-example', 'index.html')), false);
  const files = await walk(testDir);
  const combined = (await Promise.all(files.filter((file) => file.endsWith('.html')).map((file) => fs.readFile(file, 'utf8')))).join('\n');
  assert.equal(combined.includes('GUJI_DRAFT_LEAK_SENTINEL'), false);
  assert.equal(combined.includes('href="/guji/shennong-bencao/shangpin/01/"'), false);
  await fs.rm(testDir, { recursive: true, force: true });
});

test('《素问》八十一篇正文保留来源版本、许可和完整段落', async () => {
  const chapters = JSON.parse(await fs.readFile(path.resolve('content/guji/review/suwen-wikisource.json'), 'utf8'));
  assert.equal(chapters.length, 81);
  assert.equal(chapters[0].title, '上古天真论');
  assert.equal(chapters[80].title, '解精微论');
  assert.equal(chapters.every(isPublicChapter), true);
  for (const [index, chapter] of chapters.entries()) {
    assert.equal(chapter.order, index + 1);
    assert.equal(chapter.slug, String(index + 1).padStart(2, '0'));
    assert.ok(chapter.paragraphs.length >= 1, `${chapter.title} 正文不得为空`);
    assert.ok(chapter.paragraphs.map((item) => item.text).join('').length >= 100, `${chapter.title} 正文长度异常`);
    assert.match(chapter.sourceUrl, /zh\.wikisource\.org\/w\/index\.php\?title=/);
    assert.match(String(chapter.sourceRevision), /^\d+$/);
    assert.equal(chapter.sourceLicense, 'CC BY-SA 4.0');
    assert.match(chapter.bodySha256, /^[a-f0-9]{64}$/);
    assert.doesNotMatch(chapter.paragraphs.map((item) => item.text).join('\n'), /Public domain|mw-|编辑章节/);
  }
});

test('古籍首页使用精简指标卡片，网站首页提供三部经典直达入口', async () => {
  const catalog = JSON.parse(await fs.readFile(path.resolve('content/guji/catalog.json'), 'utf8'));
  const libraryHtml = renderLibraryIndex(catalog, []);
  assert.match(libraryHtml, /class="classic-card-metrics"/);
  assert.match(libraryHtml, /256<\/strong> 条目录/);
  assert.match(libraryHtml, /名称资料<\/dt><dd><strong>12<\/strong> 篇/);
  assert.match(libraryHtml, /查看导读与目录/);

  const homeHtml = await fs.readFile(path.resolve('index.html'), 'utf8');
  assert.match(homeHtml, /id="classics"/);
  assert.match(homeHtml, /href="\/guji\/huangdi-neijing\/"/);
  assert.match(homeHtml, /href="\/guji\/shanghanlun\/"/);
  assert.match(homeHtml, /href="\/guji\/shennong-bencao\/"/);
  assert.match(homeHtml, /12 条名称资料/);
  assert.match(homeHtml, /需要目录，可以微信联系/);
  assert.doesNotMatch(homeHtml, /<ol><li><span>1<\/span>添加好友/);
  assert.ok(
    homeHtml.indexOf('倪海厦老师简介') < homeHtml.indexOf('id="classics"'),
    '首页应先显示倪海厦老师简介，再显示三部古籍入口',
  );
});

test('首页提供六个本草名称入口，穴位模型提供四视图控制', async () => {
  const homeHtml = await fs.readFile(path.resolve('index.html'), 'utf8');
  const herbSection = homeHtml.match(/<section class="home-herbs"[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(herbSection, /id="herbs"/);
  for (const slug of ['renshen', 'gancao', 'huangqi', 'danggui', 'fuling', 'shuyu']) {
    assert.match(herbSection, new RegExp(`/guji/shennong-bencao/shangpin/${slug}/`));
  }
  assert.doesNotMatch(herbSection, /主治|功效|疗效|剂量|处方|服用|疾病|治疗|诊断|禁忌/);

  const modelHtml = await fs.readFile(path.resolve('acupoints.html'), 'utf8');
  for (const view of ['0', '90', '180', '270']) assert.match(modelHtml, new RegExp(`data-view="${view}"`));
  assert.match(modelHtml, /id="pointShortcuts"/);
  const modelJs = await fs.readFile(path.resolve('acupoints.js'), 'utf8');
  assert.match(modelJs, /meridian-body-turnaround-v2\.png/);
  assert.match(modelJs, /function setView\(/);
  assert.equal(await fileExists(path.resolve('assets/meridian-body-turnaround-v2.png')), true);
});

test('V1 拒绝生成本草药物详情页', async () => {
  const catalog = JSON.parse(await fs.readFile(path.resolve('content/guji/catalog.json'), 'utf8'));
  const book = catalog.books.find((item) => item.id === 'shennong-bencao');
  const volume = book.volumes[0];
  assert.throws(() => renderReaderPage(catalog, book, volume, { ...approved, bookId: book.id, volumeId: volume.id }), /不生成《神农本草经》药物详情页/);
});

test('三部古籍页都有实际文献导读内容', async () => {
  const catalog = JSON.parse(await fs.readFile(path.resolve('content/guji/catalog.json'), 'utf8'));
  for (const book of catalog.books) {
    assert.equal(book.guideSections.length, 3, `${book.title} 应有三段文献导读`);
    const html = renderBookPage(catalog, book, []);
    assert.match(html, /class="book-guide-grid"/);
    assert.match(html, new RegExp(book.guideSections[0].title));
  }
});

test('首批本草名称页只提供目录、异名和版本资料', async () => {
  const catalog = JSON.parse(await fs.readFile(path.resolve('content/guji/catalog.json'), 'utf8'));
  const book = catalog.books.find((item) => item.id === 'shennong-bencao');
  const profile = catalog.herbProfiles.find((item) => item.slug === 'renshen');
  const volume = book.volumes.find((item) => item.id === profile.volumeId);
  assert.equal(catalog.herbProfiles.length, 12);
  assert.equal(catalog.herbProfiles.every(isPublishableHerbProfile), true);
  for (const item of catalog.herbProfiles) {
    const itemVolume = book.volumes.find((entry) => entry.id === item.volumeId);
    const itemHtml = renderHerbProfilePage(catalog, book, itemVolume, item, {});
    assert.doesNotMatch(itemHtml, /味甘|味苦|味辛|主治|功效|疗效|剂量|处方|服用|疾病|治疗|诊断|禁忌/);
  }
  const html = renderHerbProfilePage(catalog, book, volume, profile, {});
  assert.match(html, /目录正名/);
  assert.match(html, /人衔/);
  assert.match(html, /鬼盖/);
  assert.match(html, /目录序号<\/dt><dd>28/);
  assert.match(html, /核对来源原页/);
});

test('公开 sitemap 只包含目录页，不包含未审核正文', async () => {
  const sitemap = await fs.readFile(path.resolve('sitemap.xml'), 'utf8');
  assert.match(sitemap, /https:\/\/nihaixia\.org\/guji\//);
  assert.match(sitemap, /\/guji\/huangdi-neijing\/suwen\//);
  assert.match(sitemap, /\/guji\/shennong-bencao\/xiapin\//);
  assert.match(sitemap, /\/guji\/shennong-bencao\/shangpin\/renshen\//);
  assert.match(sitemap, /\/guji\/huangdi-neijing\/suwen\/01\//);
  assert.match(sitemap, /\/guji\/huangdi-neijing\/suwen\/81\//);
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

