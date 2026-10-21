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
  assert.equal(result.reviewed, 227);
  assert.equal(result.published, 226);
  assert.equal(result.herbProfiles, 32);
  assert.equal(await fileExists(path.join(testDir, 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'huangdi-neijing', 'suwen', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'shennong-bencao', 'shangpin', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'shennong-bencao', 'shangpin', 'yuquan', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'shennong-bencao', 'shangpin', 'renshen', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'shennong-bencao', 'shangpin', 'huangzhi', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'huangdi-neijing', 'suwen', '01', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'huangdi-neijing', 'suwen', '81', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'yijing', 'shangjing', '01', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'yijing', 'xiajing', '64', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'daodejing', 'daojing', '01', 'index.html')), true);
  assert.equal(await fileExists(path.join(testDir, 'daodejing', 'deijing', '81', 'index.html')), true);
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

test('《易经》六十四卦与《道德经》八十一章均有可追溯原文', async () => {
  const yijing = JSON.parse(await fs.readFile(path.resolve('content/guji/review/yijing-wikisource.json'), 'utf8'));
  const daodejing = JSON.parse(await fs.readFile(path.resolve('content/guji/review/daodejing-wikisource.json'), 'utf8'));
  assert.equal(yijing.length, 64);
  assert.equal(yijing[0].title, '乾');
  assert.equal(yijing[63].title, '未济');
  assert.equal(daodejing.length, 81);
  assert.equal(daodejing[0].title, '第一章');
  assert.equal(daodejing[80].title, '第八十一章');
  for (const chapter of [...yijing, ...daodejing]) {
    assert.equal(isPublicChapter(chapter), true);
    assert.ok(chapter.paragraphs.length >= 1, `${chapter.title} 正文不得为空`);
    assert.match(chapter.sourceUrl, /zh\.wikisource\.org\/w\/index\.php\?title=/);
    assert.match(String(chapter.sourceRevision), /^\d+$/);
    assert.equal(chapter.sourceLicense, 'CC BY-SA 4.0');
    assert.match(chapter.bodySha256, /^[a-f0-9]{64}$/);
  }
  assert.doesNotMatch(daodejing.map((chapter) => chapter.paragraphs.map((item) => item.text).join('')).join('\n'), /王弼曰|晁说之|熊克谨记/);
});

test('古籍首页使用五部经典卡片，网站首页保留三部中医经典入口', async () => {
  const catalog = JSON.parse(await fs.readFile(path.resolve('content/guji/catalog.json'), 'utf8'));
  const libraryHtml = renderLibraryIndex(catalog, []);
  assert.match(libraryHtml, /class="classic-card-metrics"/);
  assert.match(libraryHtml, /401<\/strong> 条目录/);
  assert.match(libraryHtml, /名称资料<\/dt><dd><strong>32<\/strong> 篇/);
  assert.match(libraryHtml, /五部古籍，一套阅读路径/);
  assert.match(libraryHtml, /href="\/guji\/yijing\/"/);
  assert.match(libraryHtml, /href="\/guji\/daodejing\/"/);
  assert.match(libraryHtml, /查看导读与目录/);

  const booksHtml = await fs.readFile(path.resolve('books.html'), 'utf8');
  assert.doesNotMatch(booksHtml, /购买|buy-link|go\.html\?book=/);
  assert.match(booksHtml, /阅读六十四卦原文/);
  assert.match(booksHtml, /阅读八十一章原文/);

  const homeHtml = await fs.readFile(path.resolve('index.html'), 'utf8');
  assert.match(homeHtml, /id="classics"/);
  assert.match(homeHtml, /href="\/guji\/huangdi-neijing\/"/);
  assert.match(homeHtml, /href="\/guji\/shanghanlun\/"/);
  assert.match(homeHtml, /href="\/guji\/shennong-bencao\/"/);
  assert.match(homeHtml, /32 条名称资料/);
  assert.match(homeHtml, /关于本站 · 资料共建/);
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
  assert.match(modelJs, /meridian-body-turnaround-v3\.png/);
  assert.match(modelJs, /requestAnimationFrame\(animateView\)/);
  assert.match(modelJs, /function setView\(/);
  assert.equal(await fileExists(path.resolve('assets/meridian-body-turnaround-v3.png')), true);
});

test('V1 拒绝生成本草药物详情页', async () => {
  const catalog = JSON.parse(await fs.readFile(path.resolve('content/guji/catalog.json'), 'utf8'));
  const book = catalog.books.find((item) => item.id === 'shennong-bencao');
  const volume = book.volumes[0];
  assert.throws(() => renderReaderPage(catalog, book, volume, { ...approved, bookId: book.id, volumeId: volume.id }), /不生成《神农本草经》药物详情页/);
});

test('五部古籍页都有实际文献导读内容', async () => {
  const catalog = JSON.parse(await fs.readFile(path.resolve('content/guji/catalog.json'), 'utf8'));
  for (const book of catalog.books) {
    assert.equal(book.guideSections.length, 3, `${book.title} 应有三段文献导读`);
    const html = renderBookPage(catalog, book, []);
    assert.match(html, /class="book-guide-grid"/);
    assert.match(html, new RegExp(book.guideSections[0].title));
  }
});

test('上品本草名称页完整覆盖目录且只提供目录、异名和版本资料', async () => {
  const catalog = JSON.parse(await fs.readFile(path.resolve('content/guji/catalog.json'), 'utf8'));
  const book = catalog.books.find((item) => item.id === 'shennong-bencao');
  const profile = catalog.herbProfiles.find((item) => item.slug === 'renshen');
  const volume = book.volumes.find((item) => item.id === profile.volumeId);
  assert.equal(catalog.herbProfiles.length, 32);
  assert.equal(catalog.herbProfiles.every(isPublishableHerbProfile), true);
  const shangpin = book.volumes.find((item) => item.id === 'shangpin');
  assert.deepEqual(
    catalog.herbProfiles.filter((item) => item.volumeId === 'shangpin').map((item) => item.name),
    shangpin.entries,
    '上品当前已录入目录应全部生成名称档案',
  );
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
  const sitemap = await fs.readFile(path.resolve('dist/sitemap.xml'), 'utf8');
  assert.match(sitemap, /https:\/\/nihaixia\.org\/guji\//);
  assert.match(sitemap, /\/guji\/huangdi-neijing\/suwen\//);
  assert.match(sitemap, /\/guji\/shennong-bencao\/xiapin\//);
  assert.match(sitemap, /\/guji\/shennong-bencao\/shangpin\/renshen\//);
  assert.match(sitemap, /\/guji\/shennong-bencao\/shangpin\/yuquan\//);
  assert.match(sitemap, /\/guji\/shennong-bencao\/shangpin\/huangzhi\//);
  assert.match(sitemap, /\/guji\/huangdi-neijing\/suwen\/01\//);
  assert.match(sitemap, /\/guji\/huangdi-neijing\/suwen\/81\//);
  assert.match(sitemap, /\/guji\/yijing\/shangjing\/01\//);
  assert.match(sitemap, /\/guji\/yijing\/xiajing\/64\//);
  assert.match(sitemap, /\/guji\/daodejing\/daojing\/01\//);
  assert.match(sitemap, /\/guji\/daodejing\/deijing\/81\//);
  assert.doesNotMatch(sitemap, /review-workflow-example/);
});

test('中医工具提供认识中药材入口与非诊疗型名称档案', async () => {
  const [mainJs, herbsHtml, herbsJs, redirects, acupointsHtml, ziwuHtml] = await Promise.all([
    fs.readFile(path.resolve('main.js'), 'utf8'),
    fs.readFile(path.resolve('herbs.html'), 'utf8'),
    fs.readFile(path.resolve('herbs.js'), 'utf8'),
    fs.readFile(path.resolve('_redirects'), 'utf8'),
    fs.readFile(path.resolve('acupoints.html'), 'utf8'),
    fs.readFile(path.resolve('ziwu.html'), 'utf8')
  ]);

  assert.match(mainJs, /href="herbs\.html" class="dropdown-item">认识中药材/);
  assert.match(acupointsHtml, /href="herbs\.html">认识中药材/);
  assert.match(ziwuHtml, /href="herbs\.html">认识中药材/);
  assert.match(herbsHtml, /从形态开始/);
  assert.match(herbsHtml, /基原/);
  assert.match(herbsHtml, /药用部位/);
  assert.match(herbsHtml, /形态辨识/);
  assert.match(herbsHtml, /不提供功效、主治、方剂、剂量/);
  assert.equal((herbsJs.match(/slug: '/g) || []).length, 15);
  assert.doesNotMatch(herbsJs, /effects:|usage:|contraindications:|<h3>功效|<h3>主治|用法用量/);
  assert.doesNotMatch(redirects, /^\/herbs(?:\.html)?\s/m);
});

test('中医工具提供由审核原文生成的道德经互动阅读器', async () => {
  const [mainJs, readerHtml, readerJs, readerData, sitemap, acupointsHtml, herbsHtml, ziwuHtml] = await Promise.all([
    fs.readFile(path.resolve('main.js'), 'utf8'),
    fs.readFile(path.resolve('read-daodejing.html'), 'utf8'),
    fs.readFile(path.resolve('read-daodejing.js'), 'utf8'),
    fs.readFile(path.resolve('dist/data/daodejing-reader.json'), 'utf8'),
    fs.readFile(path.resolve('dist/sitemap.xml'), 'utf8'),
    fs.readFile(path.resolve('acupoints.html'), 'utf8'),
    fs.readFile(path.resolve('herbs.html'), 'utf8'),
    fs.readFile(path.resolve('ziwu.html'), 'utf8')
  ]);
  const payload = JSON.parse(readerData);

  assert.equal(payload.chapters.length, 81);
  assert.equal(payload.chapters[0].title, '第一章');
  assert.equal(payload.chapters.at(-1).title, '第八十一章');
  assert.equal(payload.book.sourceRevision, 2354026);
  assert.equal(payload.book.sourceLicense, 'CC BY-SA 4.0');
  assert.match(readerHtml, /八十一章 · 王弼本/);
  assert.match(readerHtml, /浏览器即时生成/);
  assert.match(readerJs, /SpeechSynthesisUtterance/);
  assert.match(readerJs, /wakeLock\.request\('screen'\)/);
  assert.match(readerJs, /daodejing-reader-preferences/);
  assert.match(mainJs, /href="read-daodejing\.html" class="dropdown-item">读《道德经》/);
  assert.match(acupointsHtml, /href="read-daodejing\.html">读《道德经》/);
  assert.match(herbsHtml, /href="read-daodejing\.html">读《道德经》/);
  assert.match(ziwuHtml, /href="read-daodejing\.html">读《道德经》/);
  assert.match(sitemap, /https:\/\/nihaixia\.org\/read-daodejing\.html/);
});

test('中医工具提供由审核原文生成的周易学习辅助工具', async () => {
  const [mainJs, toolHtml, toolJs, toolData, sitemap, acupointsHtml, herbsHtml, ziwuHtml, readerHtml] = await Promise.all([
    fs.readFile(path.resolve('main.js'), 'utf8'),
    fs.readFile(path.resolve('yijing-tool.html'), 'utf8'),
    fs.readFile(path.resolve('yijing-tool.js'), 'utf8'),
    fs.readFile(path.resolve('dist/data/yijing-tool.json'), 'utf8'),
    fs.readFile(path.resolve('dist/sitemap.xml'), 'utf8'),
    fs.readFile(path.resolve('acupoints.html'), 'utf8'),
    fs.readFile(path.resolve('herbs.html'), 'utf8'),
    fs.readFile(path.resolve('ziwu.html'), 'utf8'),
    fs.readFile(path.resolve('read-daodejing.html'), 'utf8')
  ]);
  const payload = JSON.parse(toolData);

  assert.equal(payload.hexagrams.length, 64);
  assert.equal(payload.hexagrams[0].title, '乾');
  assert.equal(payload.hexagrams.at(-1).title, '未济');
  assert.equal(payload.book.sourceLicense, 'CC BY-SA 4.0');
  assert.match(toolHtml, /先识八卦，[\s\S]*再读六十四卦/);
  assert.match(toolHtml, /不提供起卦、占断、运势或现实决策建议/);
  assert.match(toolJs, /\['kun','qian'\]/);
  assert.match(toolJs, /\['li','kan'\]/);
  assert.match(mainJs, /href="yijing-tool\.html" class="dropdown-item">周易学习辅助工具/);
  for (const page of [acupointsHtml, herbsHtml, ziwuHtml, readerHtml]) {
    assert.match(page, /href="yijing-tool\.html">周易学习/);
  }
  assert.match(sitemap, /https:\/\/nihaixia\.org\/yijing-tool\.html/);
});

test('中医工具提供第三方经方辨证 Skill 的安全安装入口', async () => {
  const [mainJs, skillHtml, skillJs, sitemap, acupointsHtml, herbsHtml, ziwuHtml, readerHtml, yijingHtml] = await Promise.all([
    fs.readFile(path.resolve('main.js'), 'utf8'),
    fs.readFile(path.resolve('jingfang-skill.html'), 'utf8'),
    fs.readFile(path.resolve('jingfang-skill.js'), 'utf8'),
    fs.readFile(path.resolve('dist/sitemap.xml'), 'utf8'),
    fs.readFile(path.resolve('acupoints.html'), 'utf8'),
    fs.readFile(path.resolve('herbs.html'), 'utf8'),
    fs.readFile(path.resolve('ziwu.html'), 'utf8'),
    fs.readFile(path.resolve('read-daodejing.html'), 'utf8'),
    fs.readFile(path.resolve('yijing-tool.html'), 'utf8')
  ]);

  assert.match(skillHtml, /经方辨证，[\s\S]*从经典里找依据/);
  assert.match(skillHtml, /用于学习，不替人诊疗/);
  assert.match(skillHtml, /不要据此自行诊断、抓药、调整剂量或延误就医/);
  assert.match(skillHtml, /本站不托管其知识库/);
  assert.match(skillHtml, /https:\/\/skillhub\.cn\/skills\/user_ff4d9420\/nihaixia-pro/);
  assert.match(skillJs, /@user_ff4d9420\/nihaixia-pro/);
  assert.match(mainJs, /href="jingfang-skill\.html" class="dropdown-item">倪海厦中医经方辨证 Skill/);
  for (const page of [acupointsHtml, herbsHtml, ziwuHtml, readerHtml, yijingHtml]) {
    assert.match(page, /href="jingfang-skill\.html">经方 Skill/);
  }
  assert.match(sitemap, /https:\/\/nihaixia\.org\/jingfang-skill\.html/);
});

test('首页人物经历与资料共建入口使用中性可信表述', async () => {
  const home = await fs.readFile(path.resolve('index.html'), 'utf8');
  assert.doesNotMatch(home, /治愈众多|疑难杂症患者|未经核实的疗效/);
  assert.match(home, /关于本站 · 资料共建/);
  assert.match(home, /让珍贵的中医知识，更容易被找到/);
  assert.match(home, /添加微信完全自愿，站内公开内容可直接浏览/);
  assert.match(home, /反馈勘误/);
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

