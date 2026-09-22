// Estimate the volume of HARDCODED English user-facing text in .svelte
// templates that bypasses the i18n system, and compare to the translated
// (zh) i18n content volume. Heuristic: visible template text = after
// stripping <script>/<style>, Svelte {expressions}, and HTML tags.
import { readFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const i18n = join(root, 'src/i18n');

function stripScriptStyle(s) {
  return s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
}
function stripExpressions(s) {
  let prev;
  do { prev = s; s = s.replace(/\{[^{}]*\}/g, ' '); } while (s !== prev);
  return s;
}
function stripTags(s) {
  return s.replace(/<[^>]*>/g, ' ');
}

// ---- zh i18n content volume (non-space characters) ----
function charsOfJson(obj) {
  let c = 0;
  const walk = v => {
    if (typeof v === 'string') c += v.replace(/\s/g, '').length;
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(obj);
  return c;
}
let zhChars = 0;
for (const f of ['ui', 'stages', 'hints', 'levels', 'docs-commands', 'docs-guides']) {
  zhChars += charsOfJson(JSON.parse(readFileSync(join(i18n, 'zh', `${f}.json`), 'utf8')));
}

// ---- hardcoded English: (a) template text nodes + (b) script string literals ----
let enChars = 0, enFragments = 0, enWords = 0;
const files = [];
(function collect(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) collect(p);
    else if (e.name.endsWith('.svelte')) files.push(p);
  }
})(join(root, 'src'));

const isEnglishProse = (t) => {
  if (t.length < 12) return false;
  if (!/\s/.test(t)) return false;            // needs at least one space
  if (/ui\.|import|http|src\/|\.svelte|className|onclick|style=|class=/i.test(t)) return false;
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  const alphanum = (t.match(/[A-Za-z0-9]/g) || []).length;
  return alphanum > 0 && letters / alphanum > 0.55;
};

const perFile = {};
for (const f of files) {
  const raw = readFileSync(f, 'utf8');

  // (a) template visible text
  const tmpl = stripTags(stripExpressions(stripScriptStyle(raw)));
  for (const frag of tmpl.split(/\n+/)) {
    const t = frag.trim();
    if (isEnglishProse(t)) {
      enFragments++; enChars += t.replace(/\s/g, '').length;
      enWords += (t.match(/[A-Za-z]+/g) || []).length;
      perFile[f] = (perFile[f] || 0) + t.replace(/\s/g, '').length;
    }
  }

  // (b) script string literals (captures changelog/devblog data arrays)
  // strip <style> and comments so CSS font names / code comments aren't counted
  const code = raw
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ');
  const litRe = /(['"`])((?:\\.|(?!\1).)*)\1/g;
  let m;
  while ((m = litRe.exec(code))) {
    const t = m[2].trim();
    if (isEnglishProse(t)) {
      enFragments++; enChars += t.replace(/\s/g, '').length;
      enWords += (t.match(/[A-Za-z]+/g) || []).length;
      perFile[f] = (perFile[f] || 0) + t.replace(/\s/g, '').length;
    }
  }
}

console.log('=== 硬编码英文（绕开 i18n 的模板文本） ===');
console.log(`扫描 .svelte 文件数: ${files.length}`);
console.log(`硬编码英文文本片段数: ${enFragments}`);
console.log(`硬编码英文单词数: ${enWords}`);
console.log(`硬编码英文字符数(去空格): ${enChars}`);

console.log('\n=== 已翻译(i18n/zh)内容体量 ===');
console.log(`zh 内容字符数(去空格): ${zhChars}`);

console.log('\n=== 硬编码英文来源（按文件，Top 12） ===');
const top = Object.entries(perFile).sort((a, b) => b[1] - a[1]).slice(0, 12);
for (const [f, c] of top) console.log(`  ${c.toString().padStart(6)}  ${f.replace(root + '/', '')}`);

console.log('\n=== 估算站点级汉化率 ===');
const total = zhChars + enChars;
console.log(`按字符体量估算: ${((zhChars / total) * 100).toFixed(1)}%`);
console.log('注: 终端运行时输出(用户输入的 git 命令 + 引擎消息)未在模板扫描内，单列。');
