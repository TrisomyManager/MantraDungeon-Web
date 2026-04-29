import fs from 'fs';
import https from 'https';

// Read current wordDatabase.ts
const src = fs.readFileSync('src/store/wordDatabase.ts', 'utf-8');

// Extract all tier arrays
const tiers = ['T1', 'T2', 'T3', 'T4', 'T5'];
const tierData = {};
const tierRegexes = {};

for (const tier of tiers) {
  const regex = new RegExp(`(const ${tier}: Array<\\[string, string, string\\]> = \\[)([\\s\\S]*?)(\\];)`, 'm');
  const m = src.match(regex);
  if (!m) {
    console.log(tier, 'not found');
    continue;
  }
  tierRegexes[tier] = regex;
  const lines = m[2].split('\n');
  const entries = [];
  for (const line of lines) {
    const matches = [...line.matchAll(/\['([^']+)'\s*,\s*'([^']*)'\s*,\s*'([^']+)'\]/g)];
    for (const match of matches) {
      entries.push({ word: match[1], trans: match[2], pos: match[3], raw: match[0] });
    }
  }
  tierData[tier] = entries;
  const untranslated = entries.filter(e => e.trans === e.word);
  console.log(`${tier}: ${entries.length} words, ${untranslated.length} need translation`);
}

// Find all untranslated words
const untranslated = [];
for (const tier of tiers) {
  for (const e of tierData[tier]) {
    if (e.trans === e.word) {
      untranslated.push(e);
    }
  }
}
console.log(`Total untranslated: ${untranslated.length}`);

if (untranslated.length === 0) {
  console.log('Nothing to translate!');
  process.exit(0);
}

// MyMemory batch translate
function translateBatch(words) {
  return new Promise((resolve) => {
    const q = encodeURIComponent(words.join('\n'));
    const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=en|zh-CN`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.responseStatus === 200) {
            const translations = json.responseData.translatedText.split('\n');
            resolve(translations.map(t => t.trim()));
          } else {
            console.log('API error:', json.responseStatus, json.responseDetails);
            resolve(words.map(() => null));
          }
        } catch (e) {
          console.log('Parse error:', e.message, data.slice(0, 200));
          resolve(words.map(() => null));
        }
      });
    }).on('error', (err) => {
      console.log('Request error:', err.message);
      resolve(words.map(() => null));
    });
  });
}

// Translate in small batches
const batchSize = 10;
let successCount = 0;
for (let i = 0; i < untranslated.length; i += batchSize) {
  const batch = untranslated.slice(i, i + batchSize);
  const words = batch.map(e => e.word);
  const translations = await translateBatch(words);

  for (let j = 0; j < batch.length; j++) {
    const entry = batch[j];
    const trans = translations[j];
    if (trans && trans !== entry.word && trans.length > 0 && !trans.startsWith('<')) {
      entry.trans = trans;
      successCount++;
    }
  }

  if ((i / batchSize) % 10 === 0 || i + batchSize >= untranslated.length) {
    console.log(`Progress: ${Math.min(i + batchSize, untranslated.length)}/${untranslated.length} (success: ${successCount})`);
  }

  if (i + batchSize < untranslated.length) {
    await new Promise(r => setTimeout(r, 600));
  }
}

console.log(`Successfully translated: ${successCount}/${untranslated.length}`);

// Rebuild file
function escapeStr(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

let newSrc = src;
for (const tier of tiers) {
  const entries = tierData[tier];
  if (!entries) continue;

  const lines = [];
  for (let i = 0; i < entries.length; i += 4) {
    const chunk = entries.slice(i, i + 4);
    const items = chunk.map(e => `['${escapeStr(e.word)}','${escapeStr(e.trans)}','${escapeStr(e.pos)}']`);
    lines.push('  ' + items.join(',') + ',');
  }

  const oldMatch = newSrc.match(tierRegexes[tier]);
  if (oldMatch) {
    const oldBlock = oldMatch[0];
    const newBlock = `const ${tier}: Array<[string, string, string]> = [\n${lines.join('\n')}\n];`;
    newSrc = newSrc.replace(oldBlock, newBlock);
  }
}

fs.writeFileSync('src/store/wordDatabase.ts', newSrc);
console.log('Updated src/store/wordDatabase.ts');
