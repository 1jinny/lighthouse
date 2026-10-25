#!/usr/bin/env node
/**
 * 불당드림치과 스타일 썸네일 생성기
 * 실제 사진 배경 + 네이비 병원 라벨 + 형광 연두 형광펜 제목 박스 (블로그 썸네일 스타일)
 *
 * 사용법:
 *   node scripts/make-thumbnail-dream.js \
 *     --title "이가 길어 보인다면\n잇몸이식 CTG" \
 *     --image path/to/photo.jpg \
 *     --out articles/output/thumbnails/ctg.png
 *
 * 옵션:
 *   --label   라벨 텍스트 (기본: 불당드림치과)
 *   --width   가로 px (기본 1200) / --height 세로 px (기본 675, 16:9)
 *             구글 비즈니스 프로필용은 --width 1200 --height 900 (4:3)
 *   --pos     배경 사진 초점 (기본 "center top", 예: "center", "70% 30%")
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import {chromium} from 'playwright-core';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[++i] ?? '';
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const width = parseInt(args.width || '1200', 10);
const height = parseInt(args.height || '675', 10);
const title = (args.title || '제목을 입력하세요').replace(/\\n/g, '\n');
const label = args.label || '불당드림치과';
const out = path.resolve(ROOT, args.out || `articles/output/thumbnails/dream-${Date.now()}.png`);

let bgImage = 'none';
if (args.image) {
  const imgPath = path.resolve(ROOT, args.image);
  if (!fs.existsSync(imgPath)) {
    console.error(`배경 사진을 찾을 수 없음: ${imgPath}`);
    process.exit(1);
  }
  const mime = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}[path.extname(imgPath).toLowerCase()] || 'image/jpeg';
  bgImage = `url("data:${mime};base64,${fs.readFileSync(imgPath).toString('base64')}")`;
}

const titleLines = title.split('\n')
  .map(line => `<span class="title-line">${line.trim()}</span>`)
  .join('\n    ');

let html = fs.readFileSync(path.join(ROOT, 'templates/thumbnail-dream.html'), 'utf8');
html = html
  .replace('{{WIDTH}}', String(width))
  .replace('{{HEIGHT}}', String(height))
  .replace('{{BG_IMAGE}}', bgImage)
  .replace('{{BG_POSITION}}', args.pos || 'center top')
  .replace('{{BG_FALLBACK}}', 'linear-gradient(135deg, #e8eef3 0%, #c7d4de 100%)')
  .replace('{{LABEL}}', label)
  .replace('{{TITLE_LINES}}', titleLines);

const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const browser = await chromium.launch({
  executablePath: fs.existsSync(executablePath) ? executablePath : undefined,
  args: ['--no-sandbox'],
});
const page = await browser.newPage({viewport: {width, height}});
await page.setContent(html, {waitUntil: 'networkidle'});
fs.mkdirSync(path.dirname(out), {recursive: true});
await page.screenshot({path: out});
await browser.close();

console.log(`썸네일 생성 완료 (${width}x${height}): ${out}`);
