import fs from 'fs';

const src = fs.readFileSync('src/store/wordDatabase.ts', 'utf-8');
const t2Raw = JSON.parse(fs.readFileSync('scripts/t2-words.json', 'utf-8'));

// Build T2 word map
const t2Map = new Map();
for (const [word, trans, pos] of t2Raw) {
  t2Map.set(word.toLowerCase(), { word, trans, pos });
}

// Parse current tiers
const tiers = ['T4', 'T5'];
const tierEntries = {};

for (const tier of tiers) {
  const regex = new RegExp(`(const ${tier}: Array<\\[string, string, string\\]> = \\[)([\\s\\S]*?)(\\];)`, 'm');
  const m = src.match(regex);
  if (!m) continue;
  const entries = [];
  const lines = m[2].split('\n');
  for (const line of lines) {
    const matches = [...line.matchAll(/\['([^']+)'\s*,\s*'([^']*)'\s*,\s*'([^']+)'\]/g)];
    for (const match of matches) {
      entries.push({ word: match[1], trans: match[2], pos: match[3] });
    }
  }
  tierEntries[tier] = entries;
}

// Collect T2 words not currently in DB
const currentWords = new Set();
const allRegex = /\['([^']+)'\s*,\s*'([^']*)'\s*,\s*'([^']+)'\]/g;
let m;
while ((m = allRegex.exec(src)) !== null) {
  currentWords.add(m[1].toLowerCase());
}

const spareT2 = [];
for (const [word, trans, pos] of t2Raw) {
  if (!currentWords.has(word.toLowerCase()) && trans !== word) {
    spareT2.push({ word, trans, pos });
  }
}
console.log('Spare T2 words with translation:', spareT2.length);

// Replace untranslated words in T4/T5 with spare T2 words
let spareIdx = 0;
let replaced = 0;
for (const tier of tiers) {
  const entries = tierEntries[tier];
  if (!entries) continue;
  for (const e of entries) {
    if (e.trans === e.word && spareIdx < spareT2.length) {
      const replacement = spareT2[spareIdx++];
      e.word = replacement.word;
      e.trans = replacement.trans;
      e.pos = replacement.pos;
      replaced++;
    }
  }
}
console.log(`Replaced ${replaced} untranslated words with spare T2 words`);

// Rebuild file
function escapeStr(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

let newSrc = src;
for (const tier of tiers) {
  const entries = tierEntries[tier];
  if (!entries) continue;

  const lines = [];
  for (let i = 0; i < entries.length; i += 4) {
    const chunk = entries.slice(i, i + 4);
    const items = chunk.map(e => `['${escapeStr(e.word)}','${escapeStr(e.trans)}','${escapeStr(e.pos)}']`);
    lines.push('  ' + items.join(',') + ',');
  }

  const regex = new RegExp(`const ${tier}: Array<\\[string, string, string\\]> = \\[\\s\\S]*?\\];`, 'm');
  const oldMatch = newSrc.match(regex);
  if (oldMatch) {
    const newBlock = `const ${tier}: Array<[string, string, string]> = [\n${lines.join('\n')}\n];`;
    newSrc = newSrc.replace(oldMatch[0], newBlock);
  }
}

fs.writeFileSync('src/store/wordDatabase.ts', newSrc);
console.log('Updated wordDatabase.ts');
