import fs from 'fs';

const src = fs.readFileSync('src/store/wordDatabase.ts', 'utf-8');
const tiers = ['T1', 'T2', 'T3', 'T4', 'T5'];

// Parse all entries
const allEntries = [];
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
      entries.push({ word: match[1], trans: match[2], pos: match[3], raw: match[0] });
    }
  }
  tierEntries[tier] = entries;
  allEntries.push(...entries);
}

// Build translation lookup
const transMap = new Map();
for (const e of allEntries) {
  if (e.trans !== e.word) {
    transMap.set(e.word.toLowerCase(), e.trans);
  }
}

// Stemming rules (order matters: try longest suffix first)
const suffixRules = [
  { suffix: 'ies', replace: 'y', note: '复数' },
  { suffix: 'ied', replace: 'y', note: '过去式' },
  { suffix: 'ying', replace: 'ie', note: '进行时' },
  { suffix: 'ing', replace: '', note: '进行时' },
  { suffix: 'ies', replace: 'y', note: '复数' },
  { suffix: 'es', replace: '', note: '复数/三单' },
  { suffix: 'ed', replace: '', note: '过去式' },
  { suffix: 'er', replace: '', note: '比较级/名词' },
  { suffix: 'est', replace: '', note: '最高级' },
  { suffix: 's', replace: '', note: '复数/三单' },
  { suffix: 'tion', replace: 'te', note: '名词' },
  { suffix: 'tion', replace: 't', note: '名词' },
  { suffix: 'sion', replace: 'de', note: '名词' },
  { suffix: 'sion', replace: 's', note: '名词' },
  { suffix: 'ment', replace: '', note: '名词' },
  { suffix: 'ness', replace: '', note: '名词' },
  { suffix: 'ity', replace: 'e', note: '名词' },
  { suffix: 'ity', replace: '', note: '名词' },
  { suffix: 'ly', replace: '', note: '副词' },
  { suffix: 'ful', replace: '', note: '形容词' },
  { suffix: 'less', replace: '', note: '形容词' },
  { suffix: 'ous', replace: 'e', note: '形容词' },
  { suffix: 'ous', replace: '', note: '形容词' },
  { suffix: 'ive', replace: 'e', note: '形容词' },
  { suffix: 'ive', replace: '', note: '形容词' },
  { suffix: 'able', replace: 'e', note: '形容词' },
  { suffix: 'able', replace: '', note: '形容词' },
  { suffix: 'ible', replace: 'e', note: '形容词' },
  { suffix: 'ible', replace: '', note: '形容词' },
  { suffix: 'al', replace: 'e', note: '形容词/名词' },
  { suffix: 'al', replace: '', note: '形容词/名词' },
  { suffix: 'ic', replace: '', note: '形容词' },
  { suffix: 'ical', replace: '', note: '形容词' },
  { suffix: 'ize', replace: 'e', note: '动词' },
  { suffix: 'ize', replace: '', note: '动词' },
  { suffix: 'ise', replace: 'e', note: '动词' },
  { suffix: 'ise', replace: '', note: '动词' },
  { suffix: 'ify', replace: '', note: '动词' },
  { suffix: 'en', replace: '', note: '动词' },
  { suffix: 'ist', replace: '', note: '名词' },
  { suffix: 'ism', replace: '', note: '名词' },
  { suffix: 'or', replace: 'e', note: '名词' },
  { suffix: 'or', replace: '', note: '名词' },
];

function findRoot(word) {
  const lower = word.toLowerCase();
  if (transMap.has(lower)) return null; // Already translated

  for (const rule of suffixRules) {
    if (lower.endsWith(rule.suffix)) {
      const root = lower.slice(0, -rule.suffix.length) + rule.replace;
      if (root.length >= 2 && transMap.has(root)) {
        return { root, note: rule.note };
      }
    }
  }
  return null;
}

let filled = 0;
for (const e of allEntries) {
  if (e.trans === e.word) {
    const result = findRoot(e.word);
    if (result) {
      e.trans = transMap.get(result.root) + '(' + result.note + ')';
      filled++;
    }
  }
}

console.log(`Filled ${filled} translations by stemming`);

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
