// Localization fill-rate audit for the zh locale.
// Measures: of every NON-EMPTY English string slot, how many have a
// non-empty Chinese value? (Blank-in-both is fine and not penalized.)
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const i18n = join(root, 'src/i18n');

const load = p => JSON.parse(readFileSync(p, 'utf8'));
const blank = v => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + '%' : 'n/a');

const enLevels = [...(await import('../src/levels/act0-terminal/index.js')).act0Levels,
  ...(await import('../src/levels/act1-basics/index.js')).act1Levels,
  ...(await import('../src/levels/act2-branching/index.js')).act2Levels,
  ...(await import('../src/levels/act3-conflicts/index.js')).act3Levels,
  ...(await import('../src/levels/act4-rewriting/index.js')).act4Levels,
  ...(await import('../src/levels/act5-recovery/index.js')).act5Levels,
  ...(await import('../src/levels/act6-collaboration/index.js')).act6Levels];
const { commandDocs } = await import('../src/docs/commands/index.js');
const { guides } = await import('../src/docs/guides/index.js');

let EN = 0, ZH = 0; // global string-slot counters

function auditScalar(enVal, zhVal) {
  if (blank(enVal)) return; // nothing to translate
  EN++;
  if (!blank(zhVal)) ZH++;
}
function auditArray(enArr, zhArr) {
  if (!Array.isArray(enArr)) return;
  enArr.forEach((enItem, i) => auditScalar(enItem, Array.isArray(zhArr) ? zhArr[i] : undefined));
}

// ---- Flat namespaces ----
console.log('=== 扁平命名空间（字符串填充率） ===');
for (const ns of ['ui', 'stages', 'hints']) {
  const en = load(join(i18n, 'en', `${ns}.json`));
  const zh = load(join(i18n, 'zh', `${ns}.json`));
  let e = 0, z = 0;
  for (const [k, v] of Object.entries(en)) {
    if (blank(v)) continue;
    e++; EN++;
    if (!blank(zh[k])) { z++; ZH++; }
  }
  console.log(`- ${ns}.json: ${z}/${e} 非空英文串已填充 => ${pct(z, e)}`);
}

// ---- Levels ----
console.log('\n=== 关卡叙事（字符串填充率） ===');
const zhLevels = load(join(i18n, 'zh', 'levels.json'));
for (const lv of enLevels) {
  const o = zhLevels[lv.id] || {};
  auditScalar(lv.title, o.title);
  auditScalar(lv.subtitle, o.subtitle);
  auditScalar(lv.briefing?.narrative, o.briefing?.narrative);
  auditScalar(lv.briefing?.concept, o.briefing?.concept);
  auditArray(lv.briefing?.objectives, o.briefing?.objectives);
  auditArray(lv.tips, o.tips);
  auditArray(lv.hints?.map(h => h.text), o.hints);
}

// ---- Commands ----
console.log('\n=== 命令文档（字符串填充率） ===');
const zhCmds = load(join(i18n, 'zh', 'docs-commands.json'));
for (const [k, doc] of Object.entries(commandDocs)) {
  const o = zhCmds[k] || {};
  auditScalar(doc.description, o.description);
  auditScalar(doc.tip, o.tip);
  auditScalar(doc.advanced, o.advanced);
  auditArray(doc.options?.map(x => x.description), o.options);
  auditArray(doc.examples?.map(x => x.explanation), o.examples);
}

// ---- Guides ----
console.log('\n=== 概念指南（字符串填充率） ===');
const zhGuides = load(join(i18n, 'zh', 'docs-guides.json'));
for (const [k, g] of Object.entries(guides)) {
  const o = zhGuides[k] || {};
  auditScalar(g.title, o.title);
  auditScalar(g.content, o.content);
}

console.log('\n=== 总体字符串填充率 ===');
console.log(`非空英文串总数 (需翻译): ${EN}`);
console.log(`已填充中文串数: ${ZH}`);
console.log(`总体汉化填充率: ${pct(ZH, EN)}`);
