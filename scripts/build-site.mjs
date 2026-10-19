import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGuji } from './build-guji.mjs';

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
console.log(`站点构建完成：${outDir}`);
console.log(`古籍审核记录 ${result.reviewed} 条，公开正文 ${result.published} 篇。`);

