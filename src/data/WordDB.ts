export interface WordData {
  wordId: string;
  spelling: string;
  meaning: string;
  tier: number;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb';
}

export interface WordRelation {
  wordA: string;
  wordB: string;
  relationType: 'synonym' | 'antonym' | 'collocation';
  damageMult: number;
}

/** 内存词库 - MVP 零配置版本 */
export class WordDB {
  private static words: Map<string, WordData> = new Map();
  private static relations: Map<string, WordRelation> = new Map();
  private static initialized = false;

  static init() {
    if (this.initialized) return;

    const list: WordData[] = [
      { wordId: 'word_snake', spelling: 'snake', meaning: '蛇', tier: 2, pos: 'noun' },
      { wordId: 'word_fire', spelling: 'fire', meaning: '火', tier: 1, pos: 'noun' },
      { wordId: 'word_water', spelling: 'water', meaning: '水', tier: 1, pos: 'noun' },
      { wordId: 'word_attack', spelling: 'attack', meaning: '攻击', tier: 1, pos: 'verb' },
      { wordId: 'word_calm', spelling: 'calm', meaning: '平静的', tier: 2, pos: 'adjective' },
      { wordId: 'word_anger', spelling: 'anger', meaning: '愤怒', tier: 2, pos: 'noun' },
      { wordId: 'word_cut', spelling: 'cut', meaning: '切割', tier: 1, pos: 'verb' },
      { wordId: 'word_head', spelling: 'head', meaning: '头', tier: 1, pos: 'noun' },
      { wordId: 'word_heal', spelling: 'heal', meaning: '治疗', tier: 1, pos: 'verb' },
      { wordId: 'word_ice', spelling: 'ice', meaning: '冰', tier: 1, pos: 'noun' },
      { wordId: 'word_light', spelling: 'light', meaning: '光', tier: 1, pos: 'noun' },
      { wordId: 'word_dark', spelling: 'dark', meaning: '黑暗', tier: 1, pos: 'adjective' },
      { wordId: 'word_big', spelling: 'big', meaning: '大的', tier: 1, pos: 'adjective' },
      { wordId: 'word_small', spelling: 'small', meaning: '小的', tier: 1, pos: 'adjective' },
    ];

    for (const w of list) {
      this.words.set(w.wordId, w);
    }

    this.addRelation('word_fire', 'word_water', 'antonym', 3);
    this.addRelation('word_calm', 'word_anger', 'antonym', 3);
    this.addRelation('word_cut', 'word_head', 'collocation', 99);
    this.addRelation('word_ice', 'word_fire', 'antonym', 3);
    this.addRelation('word_light', 'word_dark', 'antonym', 3);
    this.addRelation('word_big', 'word_small', 'antonym', 2);

    this.initialized = true;
  }

  private static addRelation(a: string, b: string, type: WordRelation['relationType'], mult: number) {
    const key1 = `${a}|${b}`;
    const key2 = `${b}|${a}`;
    this.relations.set(key1, { wordA: a, wordB: b, relationType: type, damageMult: mult });
    this.relations.set(key2, { wordA: b, wordB: a, relationType: type, damageMult: mult });
  }

  static findBySpelling(spelling: string): WordData | null {
    const s = spelling.toLowerCase().trim();
    for (const w of this.words.values()) {
      if (w.spelling === s) return w;
    }
    return null;
  }

  static findRelation(wordIdA: string, wordIdB: string): WordRelation | null {
    return this.relations.get(`${wordIdA}|${wordIdB}`) ?? null;
  }

  static getAllWords(): WordData[] {
    return Array.from(this.words.values());
  }
}
