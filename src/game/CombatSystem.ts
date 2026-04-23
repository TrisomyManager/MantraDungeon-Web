import { WordDB } from '../data/WordDB';
import { MonsterData } from '../data/MonsterDB';

export interface DamageResult {
  damage: number;
  multiplier: number;
  relationType?: string;
  isCombo: boolean;
  isKill: boolean;
  meaning: string;
}

export interface CombatState {
  playerHp: number;
  playerMaxHp: number;
  monster: MonsterData & { currentHp: number };
  isPlayerTurn: boolean;
  isEnded: boolean;
}

export type CombatEvent =
  | { type: 'damage'; result: DamageResult; source: 'player' | 'monster' }
  | { type: 'combo'; words: [string, string]; result: DamageResult }
  | { type: 'miss'; word: string }
  | { type: 'turn_change'; isPlayer: boolean }
  | { type: 'end'; won: boolean };

export class CombatSystem {
  state: CombatState;
  private listeners: ((evt: CombatEvent) => void)[] = [];
  private monsterTimer: ReturnType<typeof setTimeout> | null = null;
  private baseDamage = 8;

  constructor(monster: MonsterData & { currentHp: number }) {
    this.state = {
      playerHp: 100,
      playerMaxHp: 100,
      monster,
      isPlayerTurn: true,
      isEnded: false,
    };
  }

  onEvent(fn: (evt: CombatEvent) => void) {
    this.listeners.push(fn);
  }

  private emit(evt: CombatEvent) {
    for (const fn of this.listeners) fn(evt);
  }

  /** 玩家输入单词 */
  castWord(spelling: string): DamageResult | null {
    if (!this.state.isPlayerTurn || this.state.isEnded) return null;

    const word = WordDB.findBySpelling(spelling);
    if (!word) {
      this.emit({ type: 'miss', word: spelling });
      return null;
    }

    // 计算伤害
    const result = this.calculateDamage(word.wordId, word.meaning, false);
    this.applyDamage(result, 'player');
    return result;
  }

  /** 玩家双词 Combo */
  castCombo(spellA: string, spellB: string): DamageResult | null {
    if (!this.state.isPlayerTurn || this.state.isEnded) return null;

    const wordA = WordDB.findBySpelling(spellA);
    const wordB = WordDB.findBySpelling(spellB);
    if (!wordA || !wordB) {
      this.emit({ type: 'miss', word: `${spellA}+${spellB}` });
      return null;
    }

    // 查关系
    const rel = WordDB.findRelation(wordA.wordId, wordB.wordId);
    let mult = rel?.damageMult ?? 1;
    let type = rel?.relationType ?? 'none';

    // 检查弱点 Combo
    const comboKey = `${wordA.spelling}+${wordB.spelling}`;
    const comboKeyRev = `${wordB.spelling}+${wordA.spelling}`;
    if (comboKey === this.state.monster.weaknessCombo || comboKeyRev === this.state.monster.weaknessCombo) {
      mult = this.state.monster.weaknessMultiplier;
      type = 'weakness_kill';
    }

    const dmg = Math.round(this.baseDamage * mult);
    const result: DamageResult = {
      damage: dmg,
      multiplier: mult,
      relationType: type,
      isCombo: true,
      isKill: mult >= 99,
      meaning: `${wordA.meaning}+${wordB.meaning}`,
    };

    this.applyDamage(result, 'player');
    this.emit({ type: 'combo', words: [spellA, spellB], result });
    return result;
  }

  private calculateDamage(wordId: string, meaning: string, isCombo: boolean): DamageResult {
    const isTrueName = wordId === this.state.monster.wordId;
    const rel = WordDB.findRelation(wordId, this.state.monster.wordId);

    let mult = 1;
    let type = 'normal';

    if (isTrueName) {
      mult = 1;
      type = 'true_name';
    } else if (rel) {
      mult = rel.damageMult;
      type = rel.relationType;
    } else {
      mult = 0.8;
      type = 'weak';
    }

    const dmg = Math.round(this.baseDamage * mult);
    return {
      damage: dmg,
      multiplier: mult,
      relationType: type,
      isCombo,
      isKill: mult >= 99,
      meaning,
    };
  }

  private applyDamage(result: DamageResult, source: 'player' | 'monster') {
    if (source === 'player') {
      this.state.monster.currentHp = Math.max(0, this.state.monster.currentHp - result.damage);
    } else {
      this.state.playerHp = Math.max(0, this.state.playerHp - result.damage);
    }

    this.emit({ type: 'damage', result, source });

    // 检查战斗结束
    if (this.state.monster.currentHp <= 0) {
      this.endBattle(true);
      return;
    }
    if (this.state.playerHp <= 0) {
      this.endBattle(false);
      return;
    }

    // 切回合
    if (source === 'player') {
      this.state.isPlayerTurn = false;
      this.emit({ type: 'turn_change', isPlayer: false });
      this.scheduleMonsterTurn();
    }
  }

  private scheduleMonsterTurn() {
    if (this.monsterTimer) clearTimeout(this.monsterTimer);
    this.monsterTimer = setTimeout(() => {
      if (this.state.isEnded) return;
      const dmg = this.state.monster.attack;
      const result: DamageResult = {
        damage: dmg,
        multiplier: 1,
        isCombo: false,
        isKill: false,
        meaning: '',
      };
      this.applyDamage(result, 'monster');

      if (!this.state.isEnded) {
        this.state.isPlayerTurn = true;
        this.emit({ type: 'turn_change', isPlayer: true });
      }
    }, this.state.monster.actionInterval * 1000);
  }

  private endBattle(won: boolean) {
    this.state.isEnded = true;
    this.state.isPlayerTurn = false;
    if (this.monsterTimer) clearTimeout(this.monsterTimer);
    this.emit({ type: 'end', won });
  }

  destroy() {
    if (this.monsterTimer) clearTimeout(this.monsterTimer);
    this.listeners = [];
  }
}
