#!/usr/bin/env node
/**
 * 썸네일 생성기 — templates/thumbnail.html에 텍스트를 채워 1080x1080 PNG로 렌더링.
 *
 * 사용법:
 *   node scripts/make-thumbnail.js \
 *     --title "무삭제 라미네이트,\n치아 손상 없이 가능할까?" \
 *     --subtitle "삭제량 0mm 라미네이트의 조건" \
 *     --badge "치아성형" \
 *     --out articles/output/thumbnails/laminate.png
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
const clinic = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/clinic-profile.json'), 'utf8'));

const title = (args.title || '제목을 입력하세요').replace(/\\n/g, '\n');
const subtitle = args.subtitle || '';
const badge = args.badge || '치과상식';
const out = path.resolve(ROOT, args.out || `articles/output/thumbnails/thumb-${Date.now()}.png`);

let html = fs.readFileSync(path.join(ROOT, 'templates/thumbnail.html'), 'utf8');
html = html
  .replace('{{TITLE}}', title)
  .replace('{{SUBTITLE}}', subtitle)
  .replace('{{BADGE}}', badge)
  .replace('{{CLINIC_NAME}}', clinic.name || '블랑드림치과')
  .replace('{{CLINIC_SUB}}', [clinic.nearbyStation, clinic.phone].filter(Boolean).join(' · '));

const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';

const browser = await chromium.launch({
  executablePath: fs.existsSync(executablePath) ? executablePath : undefined,
  args: ['--no-sandbox'],
});
const page = await browser.newPage({viewport: {width: 1080, height: 1080}});
await page.setContent(html, {waitUntil: 'networkidle'});
fs.mkdirSync(path.dirname(out), {recursive: true});
await page.screenshot({path: out});
await browser.close();

console.log(`썸네일 생성 완료: ${out}`);
