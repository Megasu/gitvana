import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const out = { levels: {}, commands: {}, guides: {} };

// ---- LEVELS (JSON source) ----
const acts = readdirSync(join(root, 'src/levels'), { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

for (const act of acts) {
  const dir = join(root, 'src/levels', act);
  const files = readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const data = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    if (!data.id) continue;
    out.levels[data.id] = {
      title: data.title,
      subtitle: data.subtitle,
      narrative: data.briefing?.narrative,
      concept: data.briefing?.concept,
      objectives: data.briefing?.objectives ?? [],
      tips: data.tips ?? [],
      hints: (data.hints ?? []).map(h => h.text),
    };
  }
}

// ---- DOCS (TS source via dynamic import) ----
const cmdMod = await import(join(root, 'src/docs/commands/index.ts'));
const commandDocs = cmdMod.commandDocs;
for (const [name, doc] of Object.entries(commandDocs)) {
  out.commands[name] = {
    description: doc.description,
    tip: doc.tip,
    advanced: doc.advanced ?? null,
    options: (doc.options ?? []).map(o => o.description),
    examples: (doc.examples ?? []).map(e => e.explanation),
  };
}

const guideMod = await import(join(root, 'src/docs/guides/index.ts'));
const guides = guideMod.guides;
for (const [id, g] of Object.entries(guides)) {
  out.guides[id] = { title: g.title, content: g.content };
}

writeFileSync('/tmp/i18n-source.json', JSON.stringify(out, null, 2));
console.log('Levels:', Object.keys(out.levels).length);
console.log('Commands:', Object.keys(out.commands).length);
console.log('Guides:', Object.keys(out.guides).length);
console.log('Wrote /tmp/i18n-source.json');
