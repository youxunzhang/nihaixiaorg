import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');

export async function buildYijingTool({ outDir = path.join(root, 'dist', 'data') } = {}) {
  const reviewPath = path.join(root, 'content', 'guji', 'review', 'yijing-wikisource.json');
  const records = JSON.parse(await fs.readFile(reviewPath, 'utf8'));
  const approved = records
    .filter((item) => item.sourceVerified && item.rightsCleared && item.complianceApproved && item.reviewStatus === 'published')
    .sort((left, right) => left.order - right.order);

  if (approved.length !== 64 || approved[0]?.order !== 1 || approved.at(-1)?.order !== 64) {
    throw new Error(`周易学习工具需要连续 64 卦已审核原文，当前可用 ${approved.length} 卦`);
  }

  const payload = {
    book: {
      title: '周易',
      edition: approved[0].sourceEdition,
      sourceLicense: approved[0].sourceLicense,
      sourceLicenseUrl: approved[0].sourceLicenseUrl,
      updatedAt: approved[0].reviewedAt
    },
    hexagrams: approved.map((item) => ({
      order: item.order,
      slug: item.slug,
      title: item.title,
      volumeId: item.volumeId,
      paragraphs: item.paragraphs.map((paragraph) => ({ id: paragraph.id, text: paragraph.text })),
      sourceCitation: item.sourceCitation,
      sourceUrl: item.sourceUrl,
      sourceRevision: item.sourceRevision,
      bodySha256: item.bodySha256
    }))
  };

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'yijing-tool.json'), `${JSON.stringify(payload)}\n`, 'utf8');
  return payload;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = await buildYijingTool();
  console.log(`周易学习工具数据已生成：${payload.hexagrams.length} 卦`);
}
