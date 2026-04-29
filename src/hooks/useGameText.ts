/* ============================================================
   useGameText — Language Gradient System
   ============================================================ */

import { useGameStore } from '@/store/gameStore';

export type LangLevel = 1 | 2 | 3 | 4;

export function getText(level: LangLevel, zh: string, en: string): string {
  switch (level) {
    case 1: return zh;
    case 2: return `${zh}  ${en}`;
    case 3: return `${en}  ${zh}`;
    case 4: return en;
  }
}

export function useLangLevel(): LangLevel {
  return useGameStore((s) => s.languageLevel as LangLevel);
}

export function useGameText(): (key: TextKey) => string {
  const level = useLangLevel();
  return (key: TextKey) => {
    const entry = TEXT_DICT[key];
    if (!entry) return key;
    return getText(level, entry.zh, entry.en);
  };
}

export function lookupText(level: LangLevel, key: TextKey): string {
  const entry = TEXT_DICT[key];
  if (!entry) return key;
  return getText(level, entry.zh, entry.en);
}

export type TextKey =
  | 'game_title' | 'game_subtitle' | 'enter_dungeon' | 'how_to_play' | 'flavor_quote'
  | 'rules_title' | 'spellcasting_title' | 'spellcasting_desc' | 'combo_title' | 'combo_desc'
  | 'weakness_title' | 'weakness_desc' | 'memory_title' | 'memory_desc' | 'tier_title' | 'tier_desc'
  | 'combo_mult_label' | 'synonym_label' | 'collocation_label' | 'antonym_label' | 'weakness_kill_label'
  | 'camp_title' | 'camp_subtitle' | 'word_altar' | 'word_altar_desc' | 'tier_portal' | 'tier_portal_desc'
  | 'bestiary' | 'bestiary_desc' | 'enter_dungeon_btn' | 'tier_select_title' | 'tier_confirm' | 'tier_cancel'
  | 'hp_label' | 'xp_label' | 'level_label' | 'words_known' | 'words_mastered' | 'combos_found' | 'current_tier'
  | 'words_discovered' | 'mastery_progress' | 'inscribed_label' | 'resonated_label'
  | 'floor_label' | 'rooms_label' | 'room_combat' | 'room_lore' | 'room_treasure' | 'room_boss' | 'room_exit'
  | 'room_locked' | 'room_cleared' | 'enter_room_btn' | 'return_to_camp' | 'progress_label'
  | 'abandon_confirm_title' | 'abandon_confirm_desc' | 'abandon_yes' | 'abandon_no'
  | 'your_turn' | 'monster_turn' | 'speak_word' | 'cast_btn' | 'press_space_combo' | 'press_esc_pause'
  | 'pause_title' | 'resume_btn' | 'settings_btn' | 'quit_to_camp' | 'victory_title' | 'defeat_title'
  | 'weakness_hint' | 'damage_label' | 'heal_label' | 'timer_label'
  | 'weakness_kill' | 'antonym_annihilation' | 'synonym_synergy' | 'collocation_kill'
  | 'altar_title' | 'altar_subtitle' | 'tab_encountered' | 'tab_resonated' | 'tab_inscribed'
  | 'inscribe_btn' | 'word_detail_title' | 'mastery_flow' | 'no_words_yet' | 'enter_dungeon_hint'
  | 'meaning_label' | 'pos_label' | 'combos_label' | 'kills_label'
  | 'bestiary_title' | 'bestiary_subtitle' | 'discovered_count' | 'filter_all' | 'filter_tier' | 'filter_type'
  | 'type_concrete' | 'type_abstract' | 'type_adjective' | 'type_boss' | 'undiscovered'
  | 'stats_hp' | 'stats_atk' | 'stats_speed' | 'lore_title' | 'strategy_title' | 'weakness_title2' | 'new_discovery'
  | 'victory_subtitle' | 'defeat_subtitle' | 'stat_damage_dealt' | 'stat_damage_taken' | 'stat_words_found'
  | 'stat_combos' | 'stat_rooms' | 'stat_hp_left' | 'best_combo' | 'new_words_title' | 'play_again' | 'back_to_camp' | 'try_again'
  | 'victory' | 'defeat' | 'dungeon_run' | 'floor_reached' | 'rooms_stat'
  // ── Language System ───────────────────────────────────────
  | 'lang_level' | 'lang_beginner' | 'lang_elementary' | 'lang_intermediate' | 'lang_advanced'
  | 'lang_upgrade_title' | 'lang_upgrade_desc'
  // ── Battle Weakness Hints ─────────────────────────────────
  | 'weakness_hint_unknown' | 'weakness_hint_known';

interface TextEntry { zh: string; en: string; }

const TEXT_DICT: Record<TextKey, TextEntry> = {
  game_title: { zh: '真言地牢', en: 'DUNGEON OF LEXICON' },
  game_subtitle: { zh: 'Dungeon of Lexicon', en: 'Dungeon of Lexicon' },
  enter_dungeon: { zh: '进入地牢', en: 'ENTER DUNGEON' },
  how_to_play: { zh: '玩法说明', en: 'HOW TO PLAY' },
  flavor_quote: { zh: '每个单词都是咒语，每个咒语都是钥匙', en: 'Every word is a spell. Every spell, a key.' },
  rules_title: { zh: '游戏规则', en: 'THE RULES OF THE LEXICON' },
  spellcasting_title: { zh: '施法战斗', en: 'SPELLCASTING' },
  spellcasting_desc: { zh: '输入英文单词来施放法术。单词越长、越复杂，造成的伤害越高。', en: 'Type any English word to cast a spell. The longer and more complex the word, the more damage it deals.' },
  combo_title: { zh: '组合编织', en: 'COMBO WEAVING' },
  combo_desc: { zh: '输入两个单词（用空格分隔）。如果它们有语义关联——同义、反义或常见搭配——就会触发强力组合技。', en: 'Type two words separated by a space. If they share a connection — synonym, antonym, or common collocation — a powerful Combo is triggered.' },
  weakness_title: { zh: '弱点绝杀', en: 'WEAKNESS STRIKE' },
  weakness_desc: { zh: '每个怪物都有一个秘密弱点——特定的双词组合。发现它，发动一击必杀。', en: 'Every monster has a secret weakness — a specific two-word Combo. Discover it to deliver a devastating instant-kill.' },
  memory_title: { zh: '记忆系统', en: 'MEMORY SYSTEM' },
  memory_desc: { zh: '你遇到的单词都会被记录。在组合技中使用或击败怪物后获得共鸣。回到词库祭坛将其永久铭刻。', en: 'Words you encounter are recorded. Words used in Combos or kills achieve Resonance. Return to the Word Altar to Inscribe them permanently.' },
  tier_title: { zh: '难度等级', en: 'TIER SYSTEM' },
  tier_desc: { zh: '五个难度等级，每个等级包含更难的词汇。更高等级意味着更强的怪物和更丰厚的奖励。', en: 'Five tiers of difficulty, each with harder vocabulary. Higher tiers mean stronger monsters and greater rewards.' },
  combo_mult_label: { zh: '伤害倍率', en: 'COMBO MULTIPLIERS' },
  synonym_label: { zh: '同义词', en: 'Synonym' },
  collocation_label: { zh: '搭配词', en: 'Collocation' },
  antonym_label: { zh: '反义词', en: 'Antonym' },
  weakness_kill_label: { zh: '弱点 = 一击必杀', en: 'Weakness = Kill' },

  camp_title: { zh: '营地', en: 'THE CAMP' },
  camp_subtitle: { zh: '起源营地 — 你的安全港湾', en: 'Origin Camp — Your safe haven' },
  word_altar: { zh: '词库祭坛', en: 'WORD ALTAR' },
  word_altar_desc: { zh: '查看和铭刻已掌握的词汇', en: 'View and inscribe mastered words' },
  tier_portal: { zh: '传送之门', en: 'TIER PORTAL' },
  tier_portal_desc: { zh: '选择挑战难度等级', en: 'Select challenge difficulty' },
  bestiary: { zh: '怪物图鉴', en: 'BESTIARY' },
  bestiary_desc: { zh: '查看已遭遇的怪物', en: 'View encountered monsters' },
  enter_dungeon_btn: { zh: '进入地牢', en: 'ENTER DUNGEON' },
  tier_select_title: { zh: '选择难度', en: 'SELECT TIER' },
  tier_confirm: { zh: '确认', en: 'CONFIRM' },
  tier_cancel: { zh: '取消', en: 'CANCEL' },
  hp_label: { zh: '生命值', en: 'HP' },
  xp_label: { zh: '经验', en: 'XP' },
  level_label: { zh: '等级', en: 'LV' },
  words_known: { zh: '已知词汇', en: 'Words Known' },
  words_mastered: { zh: '已掌握', en: 'Words Mastered' },
  combos_found: { zh: '组合发现', en: 'Combos Found' },
  current_tier: { zh: '当前等级', en: 'Current Tier' },
  words_discovered: { zh: '已发现词汇', en: 'WORDS DISCOVERED' },
  mastery_progress: { zh: '掌握进度', en: 'MASTERY PROGRESS' },
  inscribed_label: { zh: '已铭刻', en: 'Inscribed' },
  resonated_label: { zh: '已共鸣', en: 'Resonated' },

  floor_label: { zh: '层', en: 'FLOOR' },
  rooms_label: { zh: '房间', en: 'ROOMS' },
  room_combat: { zh: '战斗', en: 'Combat' },
  room_lore: { zh: '知识', en: 'Lore' },
  room_treasure: { zh: '宝藏', en: 'Treasure' },
  room_boss: { zh: '首领', en: 'Boss' },
  room_exit: { zh: '出口', en: 'Exit' },
  room_locked: { zh: '未解锁', en: 'Locked' },
  room_cleared: { zh: '已通关', en: 'Cleared' },
  enter_room_btn: { zh: '进入', en: 'ENTER' },
  return_to_camp: { zh: '返回营地', en: 'RETURN TO CAMP' },
  progress_label: { zh: '进度', en: 'PROGRESS' },
  abandon_confirm_title: { zh: '确认放弃？', en: 'Abandon Run?' },
  abandon_confirm_desc: { zh: '你将失去本次探险的所有进度。确定要返回营地吗？', en: 'You will lose all progress from this run. Return to camp?' },
  abandon_yes: { zh: '确定放弃', en: 'ABANDON' },
  abandon_no: { zh: '继续探险', en: 'CONTINUE' },

  your_turn: { zh: '你的回合', en: 'YOUR TURN' },
  monster_turn: { zh: '怪物回合', en: 'MONSTER TURN' },
  speak_word: { zh: '输入英文单词...', en: 'Speak the word...' },
  cast_btn: { zh: '施法', en: 'CAST' },
  press_space_combo: { zh: '按空格键组合', en: 'Press SPACE to combo' },
  press_esc_pause: { zh: '按ESC暂停', en: 'Press ESC to pause' },
  pause_title: { zh: '已暂停', en: 'PAUSED' },
  resume_btn: { zh: '继续', en: 'RESUME' },
  settings_btn: { zh: '设置', en: 'SETTINGS' },
  quit_to_camp: { zh: '返回营地', en: 'RETURN TO CAMP' },
  victory_title: { zh: '胜利！', en: 'VICTORY!' },
  defeat_title: { zh: '被击败了...', en: 'DEFEATED...' },
  weakness_hint: { zh: '弱点提示', en: 'Weakness hint' },
  damage_label: { zh: '伤害', en: 'DAMAGE' },
  heal_label: { zh: '治疗', en: 'HEAL' },
  timer_label: { zh: '时间', en: 'TIMER' },

  weakness_kill: { zh: '弱点一击必杀', en: 'WEAKNESS KILL' },
  antonym_annihilation: { zh: '反义湮灭', en: 'ANNIHILATION' },
  synonym_synergy: { zh: '同义共鸣', en: 'SYNERGY' },
  collocation_kill: { zh: '搭配绝杀', en: 'COLLOCATION' },

  altar_title: { zh: '词库祭坛', en: 'THE WORD ALTAR' },
  altar_subtitle: { zh: '掌握词汇，铭刻真言', en: 'Master words, inscribe truth' },
  tab_encountered: { zh: '遭遇', en: 'ENCOUNTERED' },
  tab_resonated: { zh: '共鸣', en: 'RESONATED' },
  tab_inscribed: { zh: '铭刻', en: 'INSCRIBED' },
  inscribe_btn: { zh: '铭刻词汇', en: 'INSCRIBE WORD' },
  word_detail_title: { zh: '词汇详情', en: 'WORD DETAIL' },
  mastery_flow: { zh: '掌握流程', en: 'Mastery Flow' },
  no_words_yet: { zh: '还没有词汇...', en: 'No words yet...' },
  enter_dungeon_hint: { zh: '进入地牢开始学习', en: 'Enter dungeon to begin learning' },
  meaning_label: { zh: '释义', en: 'Meaning' },
  pos_label: { zh: '词性', en: 'POS' },
  combos_label: { zh: '组合', en: 'Combos' },
  kills_label: { zh: '击败', en: 'Kills' },

  bestiary_title: { zh: '怪物图鉴', en: 'BESTIARY' },
  bestiary_subtitle: { zh: '了解你的敌人', en: 'Know your enemy' },
  discovered_count: { zh: '已发现', en: 'Discovered' },
  filter_all: { zh: '全部', en: 'All' },
  filter_tier: { zh: '等级', en: 'Tier' },
  filter_type: { zh: '类型', en: 'Type' },
  type_concrete: { zh: '具象', en: 'Concrete' },
  type_abstract: { zh: '抽象', en: 'Abstract' },
  type_adjective: { zh: '形容词', en: 'Adjective' },
  type_boss: { zh: '首领', en: 'Boss' },
  undiscovered: { zh: '未遭遇', en: 'Unknown' },
  stats_hp: { zh: '生命', en: 'HP' },
  stats_atk: { zh: '攻击', en: 'ATK' },
  stats_speed: { zh: '速度', en: 'SPD' },
  lore_title: { zh: '背景', en: 'Lore' },
  strategy_title: { zh: '攻略', en: 'Strategy' },
  weakness_title2: { zh: '弱点', en: 'Weakness' },
  new_discovery: { zh: '新发现！', en: 'NEW DISCOVERY!' },

  victory_subtitle: { zh: '探险成功！', en: 'Dungeon cleared!' },
  defeat_subtitle: { zh: '不要放弃，继续学习！', en: 'Keep learning, try again!' },
  stat_damage_dealt: { zh: '造成伤害', en: 'Damage Dealt' },
  stat_damage_taken: { zh: '承受伤害', en: 'Damage Taken' },
  stat_words_found: { zh: '发现词汇', en: 'Words Found' },
  stat_combos: { zh: '组合技', en: 'Combos' },
  stat_rooms: { zh: '通关房间', en: 'Rooms Cleared' },
  stat_hp_left: { zh: '剩余生命', en: 'HP Left' },
  best_combo: { zh: '最佳组合', en: 'Best Combo' },
  new_words_title: { zh: '新学词汇', en: 'New Words' },
  play_again: { zh: '再玩一次', en: 'PLAY AGAIN' },
  back_to_camp: { zh: '返回营地', en: 'BACK TO CAMP' },
  try_again: { zh: '重试', en: 'TRY AGAIN' },

  victory: { zh: '胜利', en: 'VICTORY' },
  defeat: { zh: '失败', en: 'DEFEAT' },
  dungeon_run: { zh: '地牢', en: 'Dungeon' },
  floor_reached: { zh: '到达层数', en: 'Floor Reached' },
  rooms_stat: { zh: '房间', en: 'Rooms' },

  lang_level: { zh: '语言等级', en: 'Language Level' },
  lang_beginner: { zh: '新手 - 中文引导', en: 'Beginner - Chinese Guide' },
  lang_elementary: { zh: '入门 - 中英双语', en: 'Elementary - Bilingual' },
  lang_intermediate: { zh: '进阶 - 英文为主', en: 'Intermediate - English First' },
  lang_advanced: { zh: '精通 - 全英文', en: 'Advanced - Full English' },
  lang_upgrade_title: { zh: '语言等级提升！', en: 'Language Level Up!' },
  lang_upgrade_desc: { zh: '你的英语水平提高了，界面语言已自动切换。', en: 'Your English has improved! Interface language updated.' },
  weakness_hint_unknown: { zh: '弱点：???', en: 'Weakness: ???' },
  weakness_hint_known: { zh: '弱点提示', en: 'Weakness hint' },
};
