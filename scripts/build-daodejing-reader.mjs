import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');

export async function buildDaodejingReader({ outDir = path.join(root, 'dist', 'data') } = {}) {
  const reviewPath = path.join(root, 'content', 'guji', 'review', 'daodejing-wikisource.json');
  const records = JSON.parse(await fs.readFile(reviewPath, 'utf8'));
  const approved = records
    .filter((item) => item.sourceVerified && item.rightsCleared && item.complianceApproved && item.reviewStatus === 'published')
    .sort((left, right) => left.order - right.order);

  if (approved.length !== 81 || approved[0]?.order !== 1 || approved.at(-1)?.order !== 81) {
    throw new Error(`《道德经》阅读器需要连续 81 章已审核原文，当前可用 ${approved.length} 章`);
  }

  const source = approved[0];
  const payload = {
    book: {
      title: '道德经',
      edition: source.sourceEdition,
      sourceCitation: source.sourceCitation.replace('一章', '全书'),
      sourceUrl: source.sourceUrl,
      sourceRevision: source.sourceRevision,
      sourceLicense: source.sourceLicense,
      sourceLicenseUrl: source.sourceLicenseUrl,
      updatedAt: source.reviewedAt
    },
    chapters: approved.map((item) => ({
      order: item.order,
      slug: item.slug,
      title: item.title,
      volumeId: item.volumeId,
      paragraphs: item.paragraphs.map((paragraph) => ({ id: paragraph.id, text: paragraph.text })),
      sourceCitation: item.sourceCitation,
      bodySha256: item.bodySha256
    }))
  };

  await fs.mkdir(outDir, { recursive: true });
  const outputPath = path.join(outDir, 'daodejing-reader.json');
  await fs.writeFile(outputPath, `${JSON.stringify(payload)}\n`, 'utf8');
  return payload;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = await buildDaodejingReader();
  console.log(`《道德经》阅读器数据已生成：${payload.chapters.length} 章`);
}
