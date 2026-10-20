import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertCatalog,
  isPublishableHerbProfile,
  isPublicChapter,
  outputPathForChapter,
  renderBookPage,
  renderHerbProfilePage,
  renderLibraryIndex,
  renderReaderPage,
  renderVolumePage
} from './guji-lib.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function listJsonFiles(root) {
  const result = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile() && entry.name.endsWith('.json')) result.push(absolute);
    }
  }
  try { await walk(root); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return result;
}

async function writePage(file, html) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${html}\n`, 'utf8');
}

function findBook(catalog, id) {
  const book = catalog.books.find((item) => item.id === id);
  if (!book) throw new Error(`正文引用了未知书籍：${id}`);
  return book;
}

function findVolume(book, id) {
  const volume = book.volumes.find((item) => item.id === id);
  if (!volume) throw new Error(`正文引用了未知分册：${book.id}/${id}`);
  return volume;
}

export async function buildGuji({ outDir = path.join(projectRoot, 'dist', 'guji') } = {}) {
  const catalog = await readJson(path.join(projectRoot, 'content', 'guji', 'catalog.json'));
  assertCatalog(catalog);

  const reviewFiles = await listJsonFiles(path.join(projectRoot, 'content', 'guji', 'review'));
  const reviewedRecords = (await Promise.all(reviewFiles.map(readJson))).flatMap((record) => Array.isArray(record) ? record : [record]);
  const published = reviewedRecords.filter(isPublicChapter);
  const herbProfiles = (catalog.herbProfiles || []).filter(isPublishableHerbProfile);

  for (const chapter of published) {
    if (!Array.isArray(chapter.paragraphs) || chapter.paragraphs.length === 0) {
      throw new Error(`已发布正文不能为空：${chapter.id}`);
    }
    const book = findBook(catalog, chapter.bookId);
    const volume = findVolume(book, chapter.volumeId);
    if (book.id === 'shennong-bencao') throw new Error('V1 禁止生成本草药物详情页');
    if (!volume.chapters) throw new Error(`正文不能挂载到药名索引：${chapter.id}`);
  }

  await fs.mkdir(outDir, { recursive: true });
  await fs.copyFile(path.join(projectRoot, 'guji-assets', 'guji.css'), path.join(outDir, 'guji.css'));
  await fs.copyFile(path.join(projectRoot, 'guji-assets', 'guji.js'), path.join(outDir, 'guji.js'));
  await writePage(path.join(outDir, 'index.html'), renderLibraryIndex(catalog, published));

  for (const book of catalog.books) {
    await writePage(path.join(outDir, book.slug, 'index.html'), renderBookPage(catalog, book, published));
    for (const volume of book.volumes) {
      await writePage(path.join(outDir, book.slug, volume.slug, 'index.html'), renderVolumePage(catalog, book, volume, published, herbProfiles));
    }
  }

  const herbBook = findBook(catalog, 'shennong-bencao');
  for (const profile of herbProfiles) {
    const volume = findVolume(herbBook, profile.volumeId);
    const siblings = herbProfiles.filter((item) => item.volumeId === profile.volumeId);
    const currentIndex = siblings.findIndex((item) => item.id === profile.id);
    const asNav = (item) => item ? {
      title: item.displayName || item.name,
      url: `/guji/${herbBook.slug}/${volume.slug}/${item.slug}/`
    } : null;
    await writePage(
      path.join(outDir, herbBook.slug, volume.slug, profile.slug, 'index.html'),
      renderHerbProfilePage(catalog, herbBook, volume, profile, {
        previous: asNav(siblings[currentIndex - 1]),
        next: asNav(siblings[currentIndex + 1])
      })
    );
  }

  for (const chapter of published) {
    const book = findBook(catalog, chapter.bookId);
    const volume = findVolume(book, chapter.volumeId);
    const siblings = published.filter((item) => item.bookId === book.id && item.volumeId === volume.id).sort((a, b) => a.order - b.order);
    const currentIndex = siblings.findIndex((item) => item.id === chapter.id);
    const asNav = (item) => item ? { title: item.title, url: `${book.id === 'shanghanlun' ? `/guji/${book.slug}` : `/guji/${book.slug}/${volume.slug}`}/${item.slug}/` } : null;
    await writePage(outputPathForChapter(outDir, book, volume, chapter), renderReaderPage(catalog, book, volume, chapter, { previous: asNav(siblings[currentIndex - 1]), next: asNav(siblings[currentIndex + 1]) }));
  }

  return { catalog, reviewed: reviewedRecords.length, published: published.length, herbProfiles: herbProfiles.length, outDir };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await buildGuji({ outDir: process.env.GUJI_OUT_DIR || undefined });
  console.log(`古籍系统构建完成：${result.outDir}`);
  console.log(`审核记录 ${result.reviewed} 条，公开正文 ${result.published} 篇。`);
  console.log(`本草药名文献 ${result.herbProfiles} 篇。`);
}

