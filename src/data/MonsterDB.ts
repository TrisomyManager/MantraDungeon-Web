export interface MonsterData {
  wordId: string;
  displayName: string;
  maxHp: number;
  attack: number;
  actionInterval: number; // 秒
  weaknessCombo: string; // "cut+head"
  weaknessMultiplier: number;
  themeColor: number; // 0xRRGGBB
  description: string;
}

export const MONSTERS: Record<string, MonsterData> = {
  snake: {
    wordId: 'word_snake',
    displayName: 'SNAKE',
    maxHp: 20,
    attack: 5,
    actionInterval: 3,
    weaknessCombo: 'cut+head',
    weaknessMultiplier: 99,
    themeColor: 0x4ade80,
    description: '一条盘踞在地牢中的毒蛇，弱点是斩首',
  },
  fire_elemental: {
    wordId: 'word_fire',
    displayName: 'FIRE ELEMENTAL',
    maxHp: 30,
    attack: 7,
    actionInterval: 2.5,
    weaknessCombo: 'ice+water',
    weaknessMultiplier: 99,
    themeColor: 0xf87171,
    description: '由烈焰构成的元素生物',
  },
};

export function createMonster(key: keyof typeof MONSTERS): MonsterData & { currentHp: number } {
  const base = MONSTERS[key];
  return { ...base, currentHp: base.maxHp };
}
