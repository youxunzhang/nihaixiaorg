import path from 'node:path';

export const MEDICAL_NOTICE = '本站为独立的中医古籍与传统文化资料整理平台。古籍中的医药、疾病和疗效描述反映特定历史时期的认识，不代表现代医学已验证其安全性或有效性。本站不提供诊断、治疗、处方、用药或针刺操作指导，请勿据此自行治疗或用药。涉及健康问题请咨询有资质的专业人员。';

export function isPublicChapter(chapter) {
  return Boolean(
    chapter &&
    chapter.sourceVerified === true &&
    chapter.rightsCleared === true &&
    chapter.complianceApproved === true &&
    chapter.reviewStatus === 'published'
  );
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function assertSafeSlug(slug, label = 'slug') {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) {
    throw new Error(`${label} 必须是稳定的 ASCII slug：${slug}`);
  }
  return slug;
}

export function assertCatalog(catalog) {
  if (!catalog || !Array.isArray(catalog.books) || catalog.books.length !== 3) {
    throw new Error('catalog.json 必须包含三部首期经典');
  }

  const expected = new Set(['huangdi-neijing', 'shanghanlun', 'shennong-bencao']);
  for (const book of catalog.books) {
    assertSafeSlug(book.slug, `${book.title} slug`);
    expected.delete(book.id);
    if (!Array.isArray(book.volumes) || book.volumes.length === 0) {
      throw new Error(`${book.title} 缺少目录结构`);
    }
    for (const volume of book.volumes) {
      assertSafeSlug(volume.slug, `${book.title}/${volume.title} slug`);
      const items = volume.chapters || volume.entries;
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error(`${book.title}/${volume.title} 缺少目录条目`);
      }
    }
  }
  if (expected.size) throw new Error(`缺少首期经典：${[...expected].join(', ')}`);
}

export function chapterCatalog(book, volume) {
  return (volume.chapters || []).map((title, index) => ({
    id: `${book.id}-${volume.id}-${String(index + 1).padStart(3, '0')}`,
    title,
    order: index + 1,
    slug: String(index + 1).padStart(2, '0'),
    bookId: book.id,
    volumeId: volume.id
  }));
}

function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`;
}

function breadcrumbJson(items) {
  return jsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://nihaixia.org${item.url}`
    }))
  });
}

function renderBreadcrumb(items) {
  return `<nav class="guji-breadcrumb" aria-label="面包屑">${items.map((item, index) => index === items.length - 1
    ? `<span aria-current="page">${escapeHtml(item.name)}</span>`
    : `<a href="${item.url}">${escapeHtml(item.name)}</a><span aria-hidden="true">/</span>`).join('')}</nav>`;
}

function shell({ title, description, canonical, active = 'guji', breadcrumbs = [], body, structuredData = '' }) {
  const nav = [
    ['/', '首页', 'home'],
    ['/books', '中医书籍', 'books'],
    ['/guji/', '经典原文', 'guji'],
    ['/resources.html', '经典视频', 'videos'],
    ['/tao.html', '资料', 'materials']
  ].map(([href, label, key]) => `<a href="${href}"${active === key ? ' class="active" aria-current="page"' : ''}>${label}</a>`).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="/guji/guji.css?v=20261019">
  ${structuredData}
  ${breadcrumbs.length ? breadcrumbJson(breadcrumbs) : ''}
</head>
<body class="guji-page">
  <a class="skip-link" href="#guji-main">跳到主要内容</a>
  <header class="guji-header">
    <div class="guji-header-inner">
      <a class="guji-brand" href="/guji/"><span aria-hidden="true">典</span><span><strong>中医经典原文</strong><small>篇章目录 · 文献来源</small></span></a>
      <button class="guji-menu-button" type="button" aria-expanded="false" aria-controls="gujiNav">目录</button>
      <nav class="guji-nav" id="gujiNav" aria-label="主要导航">${nav}</nav>
    </div>
  </header>
  <main id="guji-main">
    ${breadcrumbs.length ? `<div class="guji-container">${renderBreadcrumb(breadcrumbs)}</div>` : ''}
    ${body}
  </main>
  <footer class="guji-footer">
    <div class="guji-container guji-footer-grid"><div><strong>中医经典原文</strong><p>按书、按篇阅读有来源记录的古籍文献。</p></div><div><a href="/guji/">经典首页</a><a href="/books">中医书库</a><a href="/sitemap.html">网站地图</a></div></div>
    <p>本站为个人建立的独立资料整理网站，非任何医家、家属、机构或出版社的官方网站。</p>
  </footer>
  <button class="guji-top" type="button" aria-label="返回顶部">↑</button>
  <script src="/guji/guji.js?v=20261019" defer></script>
</body>
</html>`;
}

export function renderNotice() {
  return `<aside class="classic-notice" aria-label="文献阅读说明"><strong>文献阅读说明</strong><p>${MEDICAL_NOTICE}</p></aside>`;
}

function countPublished(bookId, publishedChapters) {
  return publishedChapters.filter((chapter) => chapter.bookId === bookId).length;
}

export function renderLibraryIndex(catalog, publishedChapters = []) {
  const cards = catalog.books.map((book, index) => {
    const counts = book.volumes.map((volume) => `${volume.title} ${(volume.chapters || volume.entries).length} 条目录`).join(' · ');
    return `<article class="classic-card classic-card-${index + 1}" data-search="${escapeHtml(`${book.title} ${book.subtitle} ${counts}`)}">
      <div class="classic-card-mark" aria-hidden="true">${['医', '伤', '本'][index]}</div>
      <div><p class="classic-card-kicker">${escapeHtml(book.subtitle)}</p><h2>${escapeHtml(book.title)}</h2><p>${escapeHtml(book.summary)}</p>
      <dl><div><dt>目录结构</dt><dd>${escapeHtml(counts)}</dd></div><div><dt>已审正文</dt><dd>${countPublished(book.id, publishedChapters)} 篇</dd></div></dl>
      <a class="guji-primary-link" href="/guji/${book.slug}/">查看目录 <span aria-hidden="true">→</span></a></div>
    </article>`;
  }).join('');

  const body = `<section class="guji-hero"><div class="guji-container guji-hero-grid"><div><p class="guji-eyebrow">古籍阅读 · 篇章目录 · 文献来源</p><h1>中医经典原文</h1><p class="guji-lead">从书目和篇章目录进入，保留底本线索与审核状态。只有来源、版权与内容审核全部通过的正文才会开放阅读。</p><form class="classic-search" role="search"><label for="classicSearch">搜索书名或目录标题</label><div><input id="classicSearch" type="search" placeholder="例如：素问、辨脉法、上品" autocomplete="off"><button type="submit">查找</button></div><p>仅搜索古籍书名与目录元数据，不提供症状、疾病或方药推荐。</p></form></div><div class="guji-hero-seal" aria-hidden="true"><span>经</span><span>典</span><span>原</span><span>文</span></div></div></section>
  <section class="guji-section"><div class="guji-container"><div class="guji-section-heading"><div><p class="guji-eyebrow">首批经典</p><h2>三部古籍，一套阅读路径</h2></div><p>目录可以公开浏览；“整理中”条目不会生成空白详情页。</p></div><div class="classic-grid" id="classicResults">${cards}</div><p class="classic-empty" hidden>没有找到匹配的书名或目录。</p></div></section>
  <section class="guji-section guji-section-muted"><div class="guji-container guji-explainer"><div><p class="guji-eyebrow">阅读规则</p><h2>先确认来源，再开放正文</h2></div><ol><li><span>01</span><div><strong>目录定位</strong><p>按书、分册和篇章建立稳定路径。</p></div></li><li><span>02</span><div><strong>底本核校</strong><p>记录版本、出处、文字状态与来源链接。</p></div></li><li><span>03</span><div><strong>内容审核</strong><p>医疗高风险内容未经批准不公开。</p></div></li></ol></div></section>
  <section class="guji-section"><div class="guji-container">${renderNotice()}</div></section>`;

  return shell({
    title: '中医经典原文｜古籍篇章目录与文献阅读',
    description: '中医经典原文阅读中心，提供《黄帝内经》《伤寒论》《神农本草经》的篇章目录、底本来源与已审核文献阅读。',
    canonical: 'https://nihaixia.org/guji/',
    body,
    structuredData: jsonLd({
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: '中医经典原文', url: 'https://nihaixia.org/guji/',
      hasPart: catalog.books.map((book) => ({ '@type': 'Book', name: book.title, url: `https://nihaixia.org/guji/${book.slug}/` }))
    })
  });
}

function volumeSummary(book, volume) {
  const entries = volume.chapters || volume.entries;
  const qualifier = volume.entries ? `已对照 ${entries.length} 条 / 传统计数 ${volume.expectedCount} 条` : `${entries.length} 篇目录`;
  return `<article class="volume-card"><p>${escapeHtml(qualifier)}</p><h2>${escapeHtml(volume.title)}</h2><p>${escapeHtml(volume.description || '按原书篇次浏览。')}</p><a href="/guji/${book.slug}/${volume.slug}/">打开目录 <span aria-hidden="true">→</span></a></article>`;
}

export function renderBookPage(catalog, book, publishedChapters = []) {
  const source = catalog.sources[book.sourceId];
  const crumbs = [{ name: '首页', url: '/' }, { name: '经典原文', url: '/guji/' }, { name: book.title, url: `/guji/${book.slug}/` }];
  const volumes = book.volumes.map((volume) => volumeSummary(book, volume)).join('');
  const body = `<section class="guji-book-hero"><div class="guji-container guji-book-grid"><div><p class="guji-eyebrow">${escapeHtml(book.subtitle)}</p><h1>《${escapeHtml(book.title)}》目录</h1><p class="guji-lead">${escapeHtml(book.summary)}</p><div class="guji-status"><span>目录 ${book.volumes.reduce((sum, volume) => sum + (volume.chapters || volume.entries).length, 0)} 条</span><span>已审正文 ${countPublished(book.id, publishedChapters)} 篇</span></div></div><div class="guji-source-card"><span>文献说明</span><p>${escapeHtml(book.historyNote)}</p><a href="${book.guideUrl}">了解这本书</a></div></div></section>
  <section class="guji-section"><div class="guji-container"><div class="guji-section-heading"><div><p class="guji-eyebrow">目录结构</p><h2>按分册与卷次浏览</h2></div><p>“整理中”的条目仅显示目录，不生成正文页。</p></div><div class="volume-grid">${volumes}</div></div></section>
  <section class="guji-section guji-section-muted"><div class="guji-container source-panel"><div><p class="guji-eyebrow">底本与出处</p><h2>${escapeHtml(source.label)}</h2><p>${escapeHtml(source.rightsNote)}</p></div><a href="${source.url}" rel="noopener noreferrer" target="_blank">查看来源记录</a></div></section>
  <section class="guji-section"><div class="guji-container">${renderNotice()}</div></section>`;
  return shell({ title: `《${book.title}》目录｜中医经典原文`, description: `${book.title}${book.subtitle}篇章目录、文献来源和内容审核进度。`, canonical: `https://nihaixia.org/guji/${book.slug}/`, breadcrumbs: crumbs, body });
}

export function renderVolumePage(catalog, book, volume, publishedChapters = []) {
  const source = catalog.sources[book.sourceId];
  const isHerbIndex = Array.isArray(volume.entries);
  const entries = isHerbIndex ? volume.entries.map((title, index) => ({ title, order: index + 1 })) : chapterCatalog(book, volume);
  const publicByKey = new Map(publishedChapters.map((chapter) => [`${chapter.bookId}/${chapter.volumeId}/${chapter.slug}`, chapter]));
  const list = entries.map((entry) => {
    const published = !isHerbIndex && publicByKey.get(`${book.id}/${volume.id}/${entry.slug}`);
    const number = String(entry.order).padStart(2, '0');
    const chapterUrl = book.id === 'shanghanlun' ? `/guji/${book.slug}/${entry.slug}/` : `/guji/${book.slug}/${volume.slug}/${entry.slug}/`;
    const link = published ? `<a href="${chapterUrl}">${escapeHtml(entry.title)}</a><span class="toc-status published">已审可读</span>` : `<span>${escapeHtml(entry.title)}</span><span class="toc-status">${isHerbIndex ? '古籍药名索引' : '正文整理中'}</span>`;
    return `<li data-search="${escapeHtml(entry.title)}"><span class="toc-number">${number}</span><div>${link}</div></li>`;
  }).join('');
  const crumbs = [{ name: '首页', url: '/' }, { name: '经典原文', url: '/guji/' }, { name: book.title, url: `/guji/${book.slug}/` }, { name: volume.title, url: `/guji/${book.slug}/${volume.slug}/` }];
  const titleSuffix = isHerbIndex ? '古籍药名索引' : '篇章目录';
  const intro = volume.description || `按${volume.title}原有次序浏览目录。`;
  const body = `<section class="guji-catalog-hero"><div class="guji-container"><p class="guji-eyebrow">《${escapeHtml(book.title)}》</p><h1>${escapeHtml(volume.title)} · ${titleSuffix}</h1><p class="guji-lead">${escapeHtml(intro)}</p>${isHerbIndex ? '<p class="catalog-boundary"><strong>边界：</strong>本页仅提供古籍药名定位，不提供现代药物功效、主治、剂量、禁忌或使用建议。</p>' : ''}</div></section>
  <section class="guji-section"><div class="guji-container guji-catalog-layout"><aside class="catalog-aside"><label for="catalogSearch">搜索本目录</label><input id="catalogSearch" type="search" placeholder="输入篇名或古籍药名" autocomplete="off"><p>仅匹配当前目录标题。</p><a href="/guji/${book.slug}/">← 返回《${escapeHtml(book.title)}》总目录</a></aside><div><div class="catalog-meta"><span>${entries.length} 条已录入目录</span>${isHerbIndex ? `<span>传统计数 ${volume.expectedCount} 条</span>` : `<span>${publishedChapters.filter((chapter) => chapter.bookId === book.id && chapter.volumeId === volume.id).length} 篇已审正文</span>`}</div><ol class="classic-toc" id="catalogResults">${list}</ol><p class="catalog-empty" hidden>本目录中没有匹配条目。</p></div></div></section>
  <section class="guji-section guji-section-muted"><div class="guji-container source-panel"><div><p class="guji-eyebrow">目录来源</p><h2>${escapeHtml(source.label)}</h2><p>${escapeHtml(source.rightsNote)}</p></div><a href="${source.url}" rel="noopener noreferrer" target="_blank">核对来源</a></div></section>
  <section class="guji-section"><div class="guji-container">${renderNotice()}</div></section>`;
  return shell({ title: `${book.title}·${volume.title}${titleSuffix}｜中医经典原文`, description: `${book.title}${volume.title}${titleSuffix}、来源说明与审核状态。`, canonical: `https://nihaixia.org/guji/${book.slug}/${volume.slug}/`, breadcrumbs: crumbs, body });
}

export function renderReaderPage(catalog, book, volume, chapter, navigation = {}) {
  if (!isPublicChapter(chapter)) throw new Error(`拒绝生成未通过四项门槛的正文：${chapter.title}`);
  if (book.id === 'shennong-bencao') throw new Error('V1 不生成《神农本草经》药物详情页');
  assertSafeSlug(chapter.slug, `${chapter.title} slug`);
  const tocUrl = `/guji/${book.slug}/${volume.slug}/`;
  const chapterBase = book.id === 'shanghanlun' ? `/guji/${book.slug}/` : tocUrl;
  const chapterUrl = `${chapterBase}${chapter.slug}/`;
  const crumbs = [{ name: '首页', url: '/' }, { name: '经典原文', url: '/guji/' }, { name: book.title, url: `/guji/${book.slug}/` }, { name: volume.title, url: tocUrl }, { name: chapter.title, url: chapterUrl }];
  const paragraphs = chapter.paragraphs.map((paragraph, index) => `<p id="${escapeHtml(paragraph.id || `p${index + 1}`)}" tabindex="-1"><a class="paragraph-anchor" href="#${escapeHtml(paragraph.id || `p${index + 1}`)}" aria-label="链接到本段">¶</a>${escapeHtml(paragraph.text)}</p>`).join('');
  const navLink = (item, label) => item ? `<a href="${item.url}"><span>${label}</span><strong>${escapeHtml(item.title)}</strong></a>` : '<span></span>';
  const body = `<section class="reader-heading"><div class="guji-container reader-heading-grid"><div><p class="guji-eyebrow">《${escapeHtml(book.title)}》· ${escapeHtml(volume.title)} · 第 ${chapter.order} 篇</p><h1>${escapeHtml(chapter.title)}</h1><p>正文已通过来源、权利与内容合规审核。</p></div><div class="classic-settings" aria-label="阅读设置"><button type="button" data-font="down" aria-label="减小字号">字−</button><button type="button" data-font="up" aria-label="增大字号">字＋</button><button type="button" data-line="toggle" aria-label="调整行距">行距</button><button type="button" data-theme="toggle" aria-pressed="false">夜间</button></div></div></section>
  <section class="reader-wrap"><article class="classic-reader" data-reader-key="${escapeHtml(`${book.id}/${volume.id}/${chapter.slug}`)}"><header><dl><div><dt>底本</dt><dd>${escapeHtml(chapter.sourceEdition)}</dd></div><div><dt>出处</dt><dd>${escapeHtml(chapter.sourceCitation)}</dd></div><div><dt>审校</dt><dd>${escapeHtml(chapter.reviewedBy || '已记录')}</dd></div></dl>${chapter.sourceUrl ? `<a href="${chapter.sourceUrl}" rel="noopener noreferrer" target="_blank">查看来源</a>` : ''}</header><div class="reader-text">${paragraphs}</div><footer><p>${escapeHtml(chapter.sourceRightsNote || '来源与权利说明已记录。')}</p></footer></article><nav class="classic-navigation" aria-label="篇章导航">${navLink(navigation.previous, '上一篇')}<a class="back-toc" href="${tocUrl}">返回目录</a>${navLink(navigation.next, '下一篇')}</nav><div class="reader-notice">${renderNotice()}</div></section>`;
  return shell({ title: `${chapter.title}｜${book.title}·${volume.title}原文`, description: `${book.title}${volume.title}${chapter.title}，含底本出处、审核原文与篇章导航。`, canonical: `https://nihaixia.org${chapterUrl}`, breadcrumbs: crumbs, body });
}

export function outputPathForChapter(root, book, volume, chapter) {
  const parts = book.id === 'shanghanlun'
    ? [root, book.slug, chapter.slug, 'index.html']
    : [root, book.slug, volume.slug, chapter.slug, 'index.html'];
  return path.join(...parts);
}

