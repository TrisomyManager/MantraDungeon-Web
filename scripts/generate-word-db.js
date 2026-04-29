import fs from 'fs';
import https from 'https';

// ============================================================================
// 1. Read existing T1 data from wordDatabase.ts
// ============================================================================
const t1Source = fs.readFileSync('src/store/wordDatabase.ts', 'utf-8');
const t1Match = t1Source.match(/const T1: Array<\[string, string, string\]> = \[([\s\S]*?)\];/);
if (!t1Match) throw new Error('T1 data not found');

const T1 = [];
const t1Lines = t1Match[1].split('\n');
for (const line of t1Lines) {
  const matches = [...line.matchAll(/\['([^']+)'\s*,\s*'([^']*)'\s*,\s*'([^']+)'\]/g)];
  for (const m of matches) {
    T1.push([m[1], m[2].trim(), m[3]]);
  }
}
console.log('T1 words:', T1.length);

// ============================================================================
// 2. Read T2 JSON
// ============================================================================
const t2Raw = JSON.parse(fs.readFileSync('scripts/t2-words.json', 'utf-8'));
const T2 = t2Raw.map(([w, m, p]) => [w, m, p]);
console.log('T2 words:', T2.length);

// ============================================================================
// 3. Fetch Google 10000 English words (frequency sorted)
// ============================================================================
function fetchWords() {
  return new Promise((resolve, reject) => {
    https.get('https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const words = data.split('\n').filter(w => w.length > 0 && /^[a-zA-Z]+$/.test(w));
        resolve(words);
      });
    }).on('error', reject);
  });
}

const googleWords = await fetchWords();
console.log('Google words fetched:', googleWords.length);

// ============================================================================
// 4. Build translation map from existing data
// ============================================================================
const wordMap = new Map(); // word -> { meaningZh, pos }

for (const [word, meaningZh, pos] of T1) {
  wordMap.set(word.toLowerCase(), { meaningZh, pos });
}
for (const [word, meaningZh, pos] of T2) {
  wordMap.set(word.toLowerCase(), { meaningZh, pos });
}

// ============================================================================
// 5. Determine which words need translation
// ============================================================================
const needed = [];
for (const word of googleWords.slice(0, 8000)) {
  const lower = word.toLowerCase();
  if (!wordMap.has(lower)) {
    needed.push(lower);
  }
}
console.log('Words needing translation:', needed.length);

// ============================================================================
// 6. Batch translate via MyMemory API
// ============================================================================
function translateBatch(words) {
  return new Promise((resolve, reject) => {
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
            resolve(words.map(() => null));
          }
        } catch (e) {
          resolve(words.map(() => null));
        }
      });
    }).on('error', () => resolve(words.map(() => null)));
  });
}

function guessPos(word) {
  if (word.endsWith('ly')) return 'adv';
  if (word.endsWith('tion') || word.endsWith('sion') || word.endsWith('ment') || word.endsWith('ness') || word.endsWith('ity') || word.endsWith('er') || word.endsWith('or') || word.endsWith('ist') || word.endsWith('ism')) return 'n';
  if (word.endsWith('ful') || word.endsWith('less') || word.endsWith('ous') || word.endsWith('ive') || word.endsWith('able') || word.endsWith('ible') || word.endsWith('al') || word.endsWith('ic') || word.endsWith('ing') || word.endsWith('ed') || word.endsWith('en')) return 'adj';
  if (word.endsWith('ize') || word.endsWith('ise') || word.endsWith('ify')) return 'v';
  return 'n';
}

// Translate in batches
const batchSize = 100;
let translatedCount = 0;
for (let i = 0; i < needed.length; i += batchSize) {
  const batch = needed.slice(i, i + batchSize);
  const translations = await translateBatch(batch);
  for (let j = 0; j < batch.length; j++) {
    const word = batch[j];
    const trans = translations[j];
    if (trans && trans !== word && trans.length > 0) {
      wordMap.set(word, { meaningZh: trans, pos: guessPos(word) });
      translatedCount++;
    } else {
      // Fallback: use English word itself with a note
      wordMap.set(word, { meaningZh: word, pos: guessPos(word) });
    }
  }
  if (i + batchSize < needed.length) {
    console.log(`Translated ${Math.min(i + batchSize, needed.length)}/${needed.length}...`);
    await new Promise(r => setTimeout(r, 500)); // Rate limit
  }
}
console.log('Successfully translated:', translatedCount);

// ============================================================================
// 7. Build 8000-word database with tiers
// ============================================================================
const allWords = [];
for (const word of googleWords.slice(0, 8000)) {
  const lower = word.toLowerCase();
  const info = wordMap.get(lower);
  if (info) {
    allWords.push([word, info.meaningZh, info.pos]);
  } else {
    allWords.push([word, word, guessPos(word)]);
  }
}

// Remove duplicates while preserving order
const seen = new Set();
const uniqueWords = [];
for (const entry of allWords) {
  if (!seen.has(entry[0].toLowerCase())) {
    seen.add(entry[0].toLowerCase());
    uniqueWords.push(entry);
  }
}

// If we have less than 8000 after dedup, fill with word-list data
if (uniqueWords.length < 8000) {
  console.log(`Warning: only ${uniqueWords.length} unique words available, padding with generic words`);
  // Read word-list as fallback
  const wlPath = 'node_modules/word-list/words.txt';
  if (fs.existsSync(wlPath)) {
    const wlWords = fs.readFileSync(wlPath, 'utf-8').split('\n').filter(w => w.length > 2 && w.length < 12 && /^[a-zA-Z]+$/.test(w));
    for (const w of wlWords) {
      const lower = w.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        const info = wordMap.get(lower);
        uniqueWords.push([w, info ? info.meaningZh : w, info ? info.pos : guessPos(w)]);
        if (uniqueWords.length >= 8000) break;
      }
    }
  }
}

const finalWords = uniqueWords.slice(0, 8000);
console.log('Final unique words:', finalWords.length);

// ============================================================================
// 8. Generate TypeScript file
// ============================================================================
function escapeStr(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function formatTier(name, words, tierNum, offset) {
  const lines = [`const ${name}: Array<[string, string, string]> = [`];
  const chunks = chunkArray(words, 4);
  for (const chunk of chunks) {
    const items = chunk.map(([w, m, p]) => `['${escapeStr(w)}','${escapeStr(m)}','${escapeStr(p)}']`);
    lines.push('  ' + items.join(',') + ',');
  }
  lines.push('];');
  return lines.join('\n');
}

const T1_WORDS = finalWords.slice(0, 1000);
const T2_WORDS = finalWords.slice(1000, 2000);
const T3_WORDS = finalWords.slice(2000, 4000);
const T4_WORDS = finalWords.slice(4000, 6000);
const T5_WORDS = finalWords.slice(6000, 8000);

const tsContent = `// Auto-generated vocabulary database (~8000 words, 5 tiers)
// Tier 1: top 1000    Tier 2: 1001-2000    Tier 3: 2001-4000
// Tier 4: 4001-6000   Tier 5: 6001-8000

export interface WordEntry {
  word: string;
  wordId: string;
  meaning: string;
  meaningZh: string;
  tier: number;
  pos: string;
  wear: number;
}

function buildTier(data: Array<[string, string, string]>, tier: number, offset: number): WordEntry[] {
  return data.map(([word, meaningZh, pos], i) => ({
    word,
    wordId: \`w\${String(offset + i + 1).padStart(4, '0')}\`,
    meaning: meaningZh,
    meaningZh,
    tier,
    pos,
    wear: 0,
  }));
}

/* ============================================================
   Tier 1 — Top 1000 most frequent English words
   ============================================================ */

${formatTier('T1', T1_WORDS, 1, 0)}

/* ============================================================
   Tier 2 — 1001-2000 most frequent English words
   ============================================================ */

${formatTier('T2', T2_WORDS, 2, 1000)}

/* ============================================================
   Tier 3 — 2001-4000 most frequent English words
   ============================================================ */

${formatTier('T3', T3_WORDS, 3, 2000)}

/* ============================================================
   Tier 4 — 4001-6000 most frequent English words
   ============================================================ */

${formatTier('T4', T4_WORDS, 4, 4000)}

/* ============================================================
   Tier 5 — 6001-8000 most frequent English words
   ============================================================ */

${formatTier('T5', T5_WORDS, 5, 6000)}

/* ============================================================
   Build database
   ============================================================ */

const WORD_DATABASE: WordEntry[] = [
  ...buildTier(T1, 1, 0),
  ...buildTier(T2, 2, 1000),
  ...buildTier(T3, 3, 2000),
  ...buildTier(T4, 4, 4000),
  ...buildTier(T5, 5, 6000),
];

export { WORD_DATABASE };

export function getWordById(wordId: string): WordEntry | undefined {
  return WORD_DATABASE.find(w => w.wordId === wordId);
}

export function getWordBySpell(word: string): WordEntry | undefined {
  return WORD_DATABASE.find(w => w.word.toLowerCase() === word.toLowerCase());
}

export function getWordsByTier(tier: number): WordEntry[] {
  return WORD_DATABASE.filter(w => w.tier === tier);
}

export function getWordsByPos(pos: string): WordEntry[] {
  return WORD_DATABASE.filter(w => w.pos.includes(pos));
}

export function getTopWordsByWear(limit: number = 50): WordEntry[] {
  return [...WORD_DATABASE].sort((a, b) => b.wear - a.wear).slice(0, limit);
}

export function getTotalWear(): number {
  return WORD_DATABASE.reduce((sum, w) => sum + w.wear, 0);
}

// Defense words mapping by attack type
export const DEFENSE_WORDS_BY_TYPE: Record<string, string[]> = {
  physical: ['shield', 'block', 'armor', 'protect', 'guard', 'defend', 'parry', 'dodge', 'barrier', 'cover'],
  elemental: ['resist', 'absorb', 'water', 'ice', 'fire', 'earth', 'wind', 'storm', 'frost', 'flame'],
  mental: ['focus', 'will', 'calm', 'brave', 'peace', 'courage', 'mind', 'spirit', 'soul', 'heart'],
  shadow: ['light', 'torch', 'blessing', 'purify', 'visible', 'sun', 'day', 'dawn', 'radiant', 'holy'],
};

// Weakness defense mapping: attackType -> list of 'weakness defense words'
export const WEAKNESS_DEFENSE_BY_TYPE: Record<string, string[]> = {
  physical: ['shield', 'block', 'armor'],
  elemental: ['resist', 'absorb'],
  mental: ['focus', 'will', 'calm'],
  shadow: ['light', 'torch', 'blessing'],
};

// Get random word pool for a turn
export function getRandomWordPool(maxTier: number, poolSize: number, guaranteeWeakness: string[] = []): string[] {
  const available = WORD_DATABASE.filter(w => w.tier <= maxTier);
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const pool = shuffled.slice(0, poolSize);
  return pool.map(w => w.word);
}
`;

fs.writeFileSync('src/store/wordDatabase.ts', tsContent);
console.log('Generated src/store/wordDatabase.ts with', finalWords.length, 'words');
