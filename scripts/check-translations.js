import fs from 'fs';
const src = fs.readFileSync('src/store/wordDatabase.ts','utf-8');
const tiers = ['T1','T2','T3','T4','T5'];
for (const tier of tiers) {
  const regex = new RegExp('const ' + tier + ': Array[\\s\\S]*?^\\];', 'm');
  const m = src.match(regex);
  if (!m) { console.log(tier, 'not found'); continue; }
  const lines = m[0].split('\n');
  let translated = 0, total = 0;
  for (const line of lines) {
    const matches = [...line.matchAll(/\['([^']+)'\s*,\s*'([^']*)'\s*,\s*'([^']+)'\]/g)];
    for (const match of matches) {
      total++;
      if (match[2] !== match[1]) translated++;
    }
  }
  console.log(tier, 'total:', total, 'translated:', translated, '(' + Math.round(translated/total*100) + '%)');
}
