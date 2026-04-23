# 《真言地牢》(Dungeon of Lexicon) — 游戏设计需求文档 (GDD/PRD)

**文档版本**：v1.0  
**目标平台**：PC (Windows/Mac) / iOS / Android / WebGL  
**核心引擎**：Unity 2022 LTS (2D URP) 或 Cocos Creator 3.8  
**文档受众**：策划、程序、美术、后端（如有）  
**状态**：需求定稿，可直接进入原型开发

---

## 目录

1. [项目概述](#1-项目概述)
2. [核心体验与差异化](#2-核心体验与差异化)
3. [术语表](#3-术语表)
4. [系统架构总览](#4-系统架构总览)
5. [词汇与知识图谱系统（数据层）](#5-词汇与知识图谱系统数据层)
6. [动态地牢生成系统（PLG Engine）](#6-动态地牢生成系统plg-engine)
7. [真言编织控制系统（输入层）](#7-真言编织控制系统输入层)
8. [语音模块（Voice Incantation）](#8-语音模块voice-incantation)
9. [战斗系统](#9-战斗系统)
10. [实体映射与怪物图鉴](#10-实体映射与怪物图鉴)
11. [解谜与机关系统](#11-解谜与机关系统)
12. [营地枢纽与跨局成长](#12-营地枢纽与跨局成长)
13. [玩家成长与DDA](#13-玩家成长与动态难度调节dda)
14. [技术实现方案](#14-技术实现方案)
15. [美术与音频规范](#15-美术与音频规范)
16. [开发路线图](#16-开发路线图)
17. [验收标准](#17-验收标准)
18. [附录](#18-附录)

---

## 1. 项目概述

### 1.1 Elevator Pitch
《真言地牢》是一款基于**英语知识图谱**的 2D 探索解谜 RPG。玩家扮演言灵师，通过**输入英文单词**（键盘或语音）施法、战斗、解谜。地牢由 8000 个按词频分级的英语单词构成，每次进入地牢时，系统根据玩家当前挑战级别**实时随机生成**全新的房间拓扑、怪物组合与机关布局。单词即技能，语义关系即 Combo 逻辑，词频即难度曲线。

### 1.2 核心循环
```
营地准备 → 选择挑战级别(Tier) → 系统抽取语义主题 → 程序化生成地牢 
    → 探索/战斗/解谜/收集新词 → 击败Boss或主动退出/死亡 
    → 结算"铭刻"新词 → 返回营地（地牢重置，已掌握词汇永久保留）
```

### 1.3 设计目标
| 目标 | 具体指标 |
|------|---------|
| **词汇覆盖** | 完整覆盖 COCA 前 8000 高频词 |
| **学习闭环** | 每次地牢确保玩家可永久掌握 5-10 个新词 |
| **重玩价值** | 同一级别重复游玩 100+ 次不重复房间布局 |
| **输入延迟** | 键盘输入反馈 < 100ms；语音输入端到端 < 800ms |
| **离线可用** | 核心玩法（含语音识别）完全离线运行 |

---

## 2. 核心体验与差异化

### 2.1 核心体验矩阵

| 体验维度 | 传统背单词 App | 常规 Roguelike | 《真言地牢》 |
|---------|---------------|---------------|-------------|
| **输入方式** | 被动选择/拼写测试 | 键盘/手柄操作 | **主动输入英文单词作为技能指令** |
| **内容组织** | 按字母/课程列表 | 固定关卡设计 | **按词频分级 + 语义主题动态生成** |
| **失败反馈** | 显示错误答案 | 角色死亡 | **输入错误 = 施法失败，但触发谐音幽灵机制** |
| **成长感知** | 进度条 | 装备升级 | **词汇量即等级，语义关系即策略深度** |
| **重玩性** | 重复枯燥 | 固定池随机 | **每次地牢由当前级别词汇实时重构世界** |

### 2.2 关键差异化卖点
1. **真名法则**：怪物头顶就是其英文单词，玩家"念出"真名即可互动，将背单词转化为收集图鉴。
2. **语义即战斗**：利用 `calm` 克制 `anger` 的反义关系获胜，而非数值碾压。
3. **无限动态生成**：基于 8000 词库与知识图谱，每次地牢的房间、怪物、解法完全重新生成。
4. **多模态输入**：键盘"篆刻" + 语音"吟唱"，语音不仅是替代方案，更触发独有的"咏唱共鸣"增益。

---

## 3. 术语表

| 术语 | 定义 |
|------|------|
| **Tier** | 词频层级。Tier 1=1-1000词（起源），Tier 5=6001-8000词（深渊）。 |
| **真言 (Incantation)** | 玩家输入的单词，作为游戏指令。 |
| **铭刻 (Inscription)** | 新词从临时掌握转为永久掌握的第三层验证。 |
| **双词编织 (Weaving)** | 5秒内输入两个单词，系统检测语义关系触发 Combo。 |
| **三词禁咒 (Triad)** | 3秒内输入三个单词，触发终极效果（后期解锁）。 |
| **PLG Engine** | Procedural Lexical Generation，程序化词汇地牢生成引擎。 |
| **语义幽灵 (Homophone Spirit)** | 语音识别错误时生成的特殊实体，可纠正或利用。 |
| **词根共鸣 (Root Resonance)** | 收集同根词 3 个以上触发的套装增益。 |
| **DDA** | Dynamic Difficulty Adjustment，动态难度调节系统。 |

---

## 4. 系统架构总览

### 4.1 逻辑架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         表现层 (Presentation)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 2D渲染管线│ │ 输入框UI │ │ 语音波形 │ │ 营地界面 │            │
│  │ (URP/2D) │ │ (IMGUI)  │ │ 可视化  │ │ (常驻)   │            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │
└───────┼────────────┼────────────┼────────────┼─────────────────┘
        └────────────┴────────────┴────────────┘
                           │
┌──────────────────────────┴─────────────────────────────────────┐
│                      游戏逻辑层 (Game Logic)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ 真言解析器    │  │ 地牢生成器    │  │ 战斗裁决器    │          │
│  │ InputParser  │  │ PLG Engine   │  │ CombatJudge  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐          │
│  │ 语义关系查询  │  │ 房间拓扑算法  │  │ 语义相性表    │          │
│  │ GraphQuery   │  │ DAG Builder  │  │ AffinityMatrix│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────┬─────────────────────────────────────┘
                           │
┌──────────────────────────┴─────────────────────────────────────┐
│                      数据层 (Data Layer)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ 词汇主库      │  │ 知识图谱边    │  │ 玩家存档      │          │
│  │ SQLite       │  │ SQLite/JSON  │  │ JSON+加密    │          │
│  │ (8000词)     │  │ (语义关系)    │  │ (进度+设置)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ 词向量索引    │  │ 语音模型      │                            │
│  │ GloVe 50d    │  │ Whisper.cpp  │                            │
│  │ (预计算)     │  │ (本地ONNX)   │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 核心状态机

```
[营地] --选择Tier--> [地牢生成中] --生成完成--> [探索模式]
   ↑                      │                        │
   │                      │                        ↓
   │                      │                   [战斗模式]
   │                      │                        │
   │                      │                        ↓
   │                      │                   [解谜交互]
   │                      │                        │
   │                      │                        ↓
   └────结算铭刻──────────┴──────────────── [退出/死亡]
```

---

## 5. 词汇与知识图谱系统（数据层）

### 5.1 词汇主表 Schema (SQLite)

```sql
CREATE TABLE vocabulary (
    word_id         TEXT PRIMARY KEY,       -- 唯一ID，如 "word_go"
    spelling        TEXT NOT NULL,          -- 小写拼写
    phonetic        TEXT,                   -- 音标，如 "ɡoʊ"
    freq_rank       INTEGER NOT NULL,       -- COCA词频排名 1-8000
    tier            INTEGER NOT NULL,       -- 1-5
    pos             TEXT NOT NULL,          -- n./v./adj./adv./prep./conj.
    meanings        TEXT,                   -- JSON数组，多义项
    root            TEXT,                   -- 词根，如 "spect"
    themes          TEXT,                   -- JSON数组，如 ["kitchen","action"]
    difficulty      REAL DEFAULT 1.0,       -- 综合难度系数 0.5-3.0
    vector_blob     BLOB,                  -- 预计算50维词向量(float32[])
    game_type       TEXT,                   -- monster/gear/consumable/env/passive
    hp              INTEGER DEFAULT 0,        -- 怪物血量或道具耐久
    weakness_tags   TEXT,                   -- JSON数组，语义弱点标签
    combo_words     TEXT,                   -- JSON数组，可触发搭配绝杀的词
    polysemy_count  INTEGER DEFAULT 1       -- 多义项数量（用于Boss筛选）
);

CREATE INDEX idx_freq ON vocabulary(freq_rank);
CREATE INDEX idx_tier ON vocabulary(tier);
CREATE INDEX idx_root ON vocabulary(root);
CREATE INDEX idx_themes ON vocabulary(themes); -- FTS5全文索引更佳
```

### 5.2 知识图谱边表 Schema

```sql
CREATE TABLE semantic_edges (
    source_id       TEXT NOT NULL,
    target_id       TEXT NOT NULL,
    relation        TEXT NOT NULL,          -- synonym/antonym/collocation/hypernym/hyponym/root/context
    weight          REAL NOT NULL,          -- 0.0-1.0
    theme_lock      TEXT,                   -- 可选，限定主题
    PRIMARY KEY (source_id, target_id, relation)
);

CREATE INDEX idx_edge_source ON semantic_edges(source_id);
CREATE INDEX idx_edge_target ON semantic_edges(target_id);
CREATE INDEX idx_edge_relation ON semantic_edges(relation);
```

### 5.3 词频分层与游戏映射

| Tier | 词频范围 | 地牢层数 | 房间数范围 | 核心机制解锁 | 代表词示例 |
|------|---------|---------|-----------|-------------|-----------|
| **Tier 1** | 1-1000 | 起源营地 | 8-12 | 单字真言、基础移动 | `go`, `water`, `fire`, `big`, `eat`, `friend` |
| **Tier 2** | 1001-2000 | 日常平原 | 10-15 | 双词编织、装备系统 | `kitchen`, `journey`, `weather`, `furniture` |
| **Tier 3** | 2001-4000 | 知识森林 | 15-20 | 词根共鸣、三词禁咒 | `strategy`, `analyze`, `concept`, `evidence` |
| **Tier 4** | 4001-6000 | 专业高塔 | 20-25 | 多义Boss、语义迷雾 | `hypothesis`, `defendant`, `dividend`, `merger` |
| **Tier 5** | 6001-8000 | 深渊禁书库 | 25-35 | 抽象概念战、无尽模式 | `paradox`, `entropy`, `transcend`, `epiphany` |

---

## 6. 动态地牢生成系统（PLG Engine）

### 6.1 生成流程（伪代码）

```csharp
DungeonSeed GenerateDungeon(int challengeTier, PlayerProfile player) {
    // Step 1: 构建词汇池
    var pool = BuildVocabularyPool(challengeTier, player);

    // Step 2: 语义主题抽取
    var themes = ExtractThemes(pool, player.themeAffinity, 3); // 1主+2副

    // Step 3: 主题一致性验证
    ValidateThemeCoherence(themes, minSimilarity: 0.35f); // 基于词向量余弦相似度

    // Step 4: 生成房间拓扑 DAG
    var roomCount = Random.Range(tierRoomMin[challengeTier], tierRoomMax[challengeTier]);
    var topology = BuildDAG(roomCount, branchFactor: tierBranchFactor[challengeTier]);

    // Step 5: 房间实体填充
    foreach (var room in topology.rooms) {
        room.theme = AssignTheme(themes, room.depth); // 深度越大的房间越偏向副主题
        room.coreWord = PickCoreWord(pool, room.theme, player.masteredWords);
        room.satelliteWords = PickSatellites(pool, room.coreWord, 3);
        room.puzzleSolutions = PrecomputeSolutions(room.coreWord, room.satelliteWords, player.masteredWords);
        room.difficultyRatio = Mathf.Lerp(0.3f, 0.7f, room.depth / (float)roomCount); // 前易后难
    }

    // Step 6: 保底新词注入
    seed.guaranteedNewWords = SelectGuaranteedNewWords(pool, 5 + challengeTier * 2);
    InjectGuaranteedWords(topology, seed.guaranteedNewWords);

    // Step 7: Boss房绑定
    topology.endRoom.coreWord = SelectBossWord(pool, challengeTier, player.masteredWords);

    return seed;
}
```

### 6.2 词汇池构建规则

```
挑战级别 = N 时：
├── 已掌握词汇（复习层）：占生成池 60%
│   └── 优先选取该 Tier 已掌握词；不足时从 Tier N-1 已掌握词补充
├── 同层级未掌握词汇（挑战层）：占生成池 30%
│   └── 从 Tier N 中排除玩家已掌握词后随机抽取
└── 上层预告词汇（彩蛋层）：占生成池 10%
    └── 从 Tier N+1 中选取与当前主题语义关联度最高的词

保底机制：若 Tier N 已掌握比例 < 50%，强制用更低 Tier 词汇填充至 50%，
确保玩家始终有足够的"真言弹药"。
```

### 6.3 主题语义一致性算法

```csharp
float ThemeCoherence(string themeA, string themeB) {
    // 基于预计算的主题中心词向量
    var vecA = ThemeCentroid[themeA]; // 该主题下所有词向量的平均
    var vecB = ThemeCentroid[themeB];
    return CosineSimilarity(vecA, vecB);
}

// 主题中心词表示例（预计算）
ThemeCentroid["kitchen"] = AverageVectorOf(["cook","knife","food","water","fire","eat",...]);
ThemeCentroid["forest"]  = AverageVectorOf(["tree","animal","dark","walk","moss",...]);
```

### 6.4 房间拓扑 DAG 参数

| 参数 | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|------|--------|--------|--------|--------|--------|
| 房间总数 | 8-12 | 10-15 | 15-20 | 20-25 | 25-35 |
| 分支系数 | 1.2 | 1.4 | 1.6 | 1.8 | 2.0 |
| 环路数 | 0 | 0-1 | 1-2 | 2-3 | 3-5 |
| 隐藏房间 | 1 | 1-2 | 2-3 | 3-4 | 4-6 |
| 保底新词数 | 5 | 7 | 8 | 10 | 12 |

---

## 7. 真言编织控制系统（输入层）

### 7.1 输入架构

游戏底部常驻半透明输入框，支持键盘与语音双通道。

```
┌──────────────────────────────────────────────────────────────┐
│  [语音波形 ▓▓▓▓]  [输入框: attack________]  [执行 ▶]  [🎤]  │
│                                                              │
│  单字真言：输入 1 词 → 立即执行                               │
│  双词编织：5 秒内输入第 2 词 → 查询知识图谱 → 触发 Combo      │
│  三词禁咒：3 秒内输入第 3 词 → 终极奥义（Tier 3+ 解锁）       │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 词性即功能映射

| 词性 | 游戏功能 | 输入效果 | 示例 |
|------|---------|---------|------|
| **动词 (v.)** | 主动技能 | 角色执行动作 | `go` 移动, `attack` 攻击, `heal` 治疗, `jump` 跳跃 |
| **名词 (n.)** | 实体交互 | 与同名实体交互 | `sword` 装备, `door` 开门, `potion` 喝药 |
| **形容词 (adj.)** | 状态/环境 | 改变自身或环境 | `dark` 隐身降视野, `fast` 加速, `big` 体型变大 |
| **副词 (adv.)** | 强化修饰 | 强化下一动作 | `quickly` 加速施法, `heavily` 重击加成 |
| **介词/连词** | 特殊法则 | 触发机制效果 | `and` 允许一次输入两词, `without` 移除状态 |

### 7.3 双词编织 Combo 表

| 语义关系 | 判定条件 | 视觉特效 | 战斗/探索效果 | 示例 |
|---------|---------|---------|-------------|------|
| **同义 (Synonym)** | WordNet 同义集或词向量相似度 > 0.85 | 金色共鸣波纹 | 效果 ×1.5；同属性连续使用会免疫（强制换策略） | `fire` + `flame` = 烈焰风暴 |
| **反义 (Antonym)** | WordNet 反义关系或词向量负相关 | 黑白湮灭闪光 | 伤害 ×3.0，附加破防/即死 | `calm` + `anger` = 情绪湮灭 |
| **搭配 (Collocation)** | COCA 搭配频率 Top 50 | 符文锁链缠绕 | 对特定怪物秒杀（绝杀） | `extinguish` + `fire` = 灭火 |
| **上下位 (Hypernym)** | WordNet 上位关系 | 维度压制光环 | 眩晕目标 1 回合 | `animal` → `snake`（上位压制） |
| **下位 (Hyponym)** | WordNet 下位关系 | 精准穿刺特效 | 伤害 ×2.0，无视 50% 防御 | `snake` → `animal`（以小博大） |
| **词根 (Root)** | 共享同一词根 | 词根图腾显现 | 不消耗 MP，可无限连击 | `inspect` + `respect` = 真视之眼 |
| **语境共现 (Context)** | 同一例句中高频共现 | 环境共鸣震动 | 触发场景特殊事件 | `heavy` + `rain` = 召唤暴雨（Forest房） |

---

## 8. 语音模块（Voice Incantation）

### 8.1 功能开关

```
营地 → 语法工坊 → 感知模块
├── 语音模块开关：[开启 / 关闭]
├── 识别引擎：[Whisper.cpp(本地) / Azure(云端)]
├── 确认模式：[即时吟唱 / 二次确认]
├── 语音灵敏度：[低 / 中 / 高] （影响置信度阈值）
├── 识别语言：[英语(US) / 英语(UK)]
└── 音效反馈：[开启 / 关闭] （识别成功播放微弱共鸣音）
```

### 8.2 两种确认模式

| 模式 | 机制 | 延迟 | 适用场景 |
|------|------|------|---------|
| **即时吟唱** | 语音识别结果直接作为游戏输入 | < 300ms | 私密环境、熟练玩家、战斗高潮 |
| **二次确认** | 语音转文字后屏幕显示，需说"Yes"或点击确认 | 800ms-1.2s | 公共场合、新手、解谜环节 |

**自动切换规则**：默认探索模式即时吟唱，进入 Boss 战前 3 秒自动切换二次确认（可关闭）。

### 8.3 语音专属机制

#### A. 咏唱共鸣 (Chanting Resonance)
连续 3 次语音正确输入存在语义关联的单词时触发：

| 连续语音输入类型 | 增益效果 | 持续时间 |
|----------------|---------|---------|
| 同根词连读 | **词根圣歌**：同根词输入速度要求降低 50% | 30s |
| 反义词对读 | **阴阳咏叹**：反义 Combo 伤害 ×4（非 ×3） | 1 次 |
| 搭配词连读 | **流畅吟诵**：该搭配永久记入肌肉记忆库，以后键盘输入自动补全 | 永久 |
| 同一词重复 3 次 | **执念爆发**：该词本局伤害 +100%，消耗双倍 MP | 本局地牢 |

#### B. 谐音幽灵 (Homophone Spirit)
语音识别结果与目标词发音相近但拼写不同时，不判定为错误，而是生成谐音幽灵实体：

```csharp
// 触发条件：Levenshtein(识别结果, 目标词) <= 2 或 Metaphone编码相同
if (IsHomophone(recognized, intended)) {
    SpawnHomophoneSpirit(recognized);
    // 玩家选项：
    // 1. 输入 intended 真名 → 幽灵消散，转化为 MP +10
    // 2. 利用 recognized 词打出 Combo → 若 recognized 在当前房间主题中有语义关联，触发隐藏效果
}
```

#### C. 静默领域 (Zone of Silence)
特定怪物/房间禁用语音输入：

| 来源 | 效果 | 破解方式 |
|------|------|---------|
| **Silence 怪** | 半径 3 格内禁用语音 10s | 键盘输入 `shout` / `noise` 破除 |
| **Library 房间** | 全房间禁用语音，触发则引来增援 | 强制键盘潜行 |
| **Boss: Whisper** | 模仿玩家语音输入反向施法 | 仅能用键盘，或语音说反义词诱导其自伤 |

#### D. 混合输入 Combo
| 操作序列 | Combo 名称 | 效果 |
|---------|-----------|------|
| 键盘 `sword` → 语音 `attack` | **符文-咏唱连击** | 本次攻击无视 20% 防御 |
| 语音 `fire` → 键盘 `extinguish` | **吟唱-篆刻封印** | 灭火 Combo 范围扩大至全场 |
| 键盘 `big` → 语音 `small` | **静默悖论** | 在静默领域内完成则直接破除领域 |

### 8.4 技术集成方案

| 平台 | 引擎 | 集成方式 | 离线支持 | 备注 |
|------|------|---------|---------|------|
| PC/Mac | Whisper.cpp (ggml) | C++ DLL / C# P/Invoke | ✅ 完全离线 | 推荐 base.en 模型（74MB，准确率足够） |
| iOS | Whisper.cpp + CoreML | Unity Native Plugin | ✅ | 需处理麦克风权限 |
| Android | Whisper.cpp + NNAPI | JNI + Android Plugin | ✅ | 注意低端机性能 fallback |
| WebGL | Web Speech API | JavaScript 桥接 | ❌ | 降级方案，仅支持即时模式 |

**识别流程**：
```
麦克风采集 (16kHz, 16bit, 单声道) 
    → VAD 语音端点检测 ( webrtc-vad 或自研能量阈值 )
    → 音频缓存 (最长 5s 截断 )
    → Whisper.cpp 推理 ( beam_size=5, best_of=5 )
    → 文本输出 + 置信度分数
    → 游戏输入管道
```

---

## 9. 战斗系统

### 9.1 战斗模式切换
- **探索模式**：实时输入，即时响应
- **战斗模式**：进入 2D 战斗场景，采用**"输入速度决定先手"的半即时制**
  - 怪物 3 秒行动读条，玩家需在读条结束前完成输入
  - 输入越快，先手权越高；输入错误，该回合失效并可能触发反噬

### 9.2 语义相性伤害矩阵

```
玩家输入词 ──┬──→ 怪物真名 = 同词 → 基础伤害（某些怪物反弹同词）
             ├──→ 同义词 → 共鸣伤害 ×1.5（同属性怪物免疫，异属性增强）
             ├──→ 反义词 → 湮灭伤害 ×3.0（必中，无视防御）
             ├──→ 下位词 → 精准伤害 ×2.0（以小博大）
             ├──→ 上位词 → 压制伤害 ×1.2 + 眩晕 1 回合
             ├──→ 搭配词 → 绝杀判定（特定组合直接秒杀）
             ├──→ 语境共现 → 场景伤害 ×1.3（利用环境）
             └──→ 无关联 → 普通伤害 ×0.8（效率低下）
```

### 9.3 怪物类型与机制

#### 具象名词怪 (Concrete Nouns)

| 真名 | Tier | 外观 | 机制 | 弱点 Combo |
|------|------|------|------|-----------|
| **Snake** | 2 | 蛇形，喷毒 | 攻击附加 `poison`（输入速度 -50%） | `cut` + `head`（搭配绝杀）<br>`long` + `stick`（上位克制） |
| **Giant** | 2 | 巨型石人 | 高 HP，物理减伤 50% | `small` + `door`（反义悖论：缩小）<br>`stone` + `throw`（同义共鸣） |
| **Shadow** | 3 | 黑色人形，无实体 | 物理免疫，仅光属性有效 | `light`（基础）<br>`bright` + `shine`（同义连击） |

#### 抽象名词怪 (Abstract Nouns) — 机制型

| 真名 | 外观 | 特殊机制 | 破解策略 |
|------|------|---------|---------|
| **Fear** | 黑色雾气 | 输入框颤抖，字母随机偏移 | 输入 `brave` / `courage`（反义驱散） |
| **Time** | 沙漏骑士 | 每 10 秒攻防回合反转 | 输入 `stop` / `slow`（搭配控制） |
| **Silence** | 无嘴幽灵 | 禁用所有元音输入 (A,E,I,O,U) | 输入 `shout` / `noise`（真名破盾） |
| **Chaos** | 扭曲几何体 | 输入单词字母顺序被打乱 | 输入 `order`（反义净化全场） |

#### 形容词怪 (Adjective Monsters) — 环境型

| 真名 | 效果 | 应对 |
|------|------|------|
| **Invisible** | 怪物透明，无法瞄准 | 输入 `see` / `look` 显形 1 回合 |
| **Fast** | 怪物行动 2 次/回合 | 输入 `slow` / `trap` 限制行动 |
| **Dark** | 房间视野降至 1 格 | 输入 `light` / `torch` 恢复视野 |
| **Heavy** | 阻挡路径，无法绕行 | 输入 `lift` / `push` / `move` 推开 |

#### Boss 模板：多义枢纽 (Polysemy Guardian)

每个 Tier 末尾的 Boss 从该层未掌握的多义词中随机选取，拥有义项护盾：

**示例 Boss：RUN (Tier 2)**
- 护盾 1（移动义项）：`run fast` → 需输入 `stop` / `walk` 破盾
- 护盾 2（经营义项）：`run business` → 需输入 `close` / `fail` 破盾
- 护盾 3（流动义项）：`water runs` → 需输入 `dam` / `block` 破盾
- 真身暴露后，输入 `run` 造成基础伤害

**生成规则**：
```csharp
BossWord SelectBossWord(int tier, HashSet<string> mastered) {
    return vocabulary
        .Where(v => v.tier == tier && !mastered.Contains(v.word_id))
        .Where(v => v.polysemy_count >= 3)
        .OrderByDescending(v => v.semanticConnections.Count)
        .First();
}
```

---

## 10. 实体映射与怪物图鉴

### 10.1 8000 词分配策略

| 类别 | 数量 | 游戏角色 | 分布特点 |
|------|------|---------|---------|
| **怪物 (Monsters)** | 2500 | 房间敌人、Boss、精英怪 | 名词为主，抽象怪 20%，形容词怪 10% |
| **武器/装备 (Gear)** | 1200 | 可装备真言武器 | 名词为主，高频基础武器，低频神器 |
| **消耗品 (Consumables)** | 800 | 药水、卷轴、钥匙 | 名词 + 动词（`heal` 本身可作治疗术） |
| **环境实体 (Environment)** | 1500 | 门、陷阱、地形、NPC | 名词 + 形容词，构成房间主题 |
| **被动技能 (Passives)** | 1000 | 词根共鸣、语义光环 | 词根、抽象名词、高频动词 |
| **隐藏/彩蛋 (Secrets)** | 1000 | 隐藏房间、真结局线索 | 低频多义词、文化梗词汇 |

### 10.2 装备实体示例

| 单词 | 词性 | 实体类型 | 使用效果 | 词频 |
|------|------|---------|---------|------|
| **sword** | n. | 武器 | 输入 `sword` 装备，普攻附加物理伤害 | 1,800 |
| **shield** | n. | 防具 | 输入 `shield` 防御姿态，格挡 50% | 2,200 |
| **potion** | n. | 消耗品 | 输入 `potion` 恢复 30 HP | 3,500 |
| **torch** | n. | 工具 | 输入 `torch` 照亮黑暗，持续 3 分钟 | 2,800 |
| **map** | n. | 特殊 | 输入 `map` 显示未探索房间布局 | 1,500 |
| **key** | n. | 任务 | 输入 `key` + `door` 打开上锁门 | 1,200 |

### 10.3 词根套装 (Root Sets)

收集同一词根 3 词后自动解锁套装效果：

| 词根 | 套装词示例 | 套装效果 |
|------|-----------|---------|
| `-spect-` (看) | `inspect`, `respect`, `suspect` | 真视之眼：隐形怪物显形 |
| `-rupt-` (破) | `interrupt`, `bankrupt`, `erupt` | 破甲：无视 30% 防御 |
| `-dict-` (说) | `predict`, `contradict`, `dictate` | 言出法随：输入速度 +50% |
| `-port-` (运) | `transport`, `export`, `import` | 次元口袋：道具栏 +5 |

---

## 11. 解谜与机关系统

### 11.1 语言机关设计

| 机关名称 | 机制描述 | 涉及词汇 | 适用 Tier |
|---------|---------|---------|----------|
| **字母地砖** | 地面铺满字母砖，输入单词后只能安全行走在该词包含的字母上 | 任意单词 | 1-2 |
| **长度峡谷** | 峡谷宽度 = 目标单词字母数，输入足够长的单词生成词桥 | 长单词 (10+字母) | 3-4 |
| **回文门** | 大门只接受回文单词作为钥匙 | `level`, `radar`, `civic` | 2-3 |
| **押韵陷阱** | 地面有韵脚标记，输入押韵词解除 | 押韵词对 | 2-3 |
| **词根祭坛** | 祭坛显示词根（如 `-rupt-`），输入 3 个同根词激活 | `interrupt`, `bankrupt`, `corrupt` | 3-4 |
| **反义天平** | 天平两端需语义重量平衡，左端 `heavy`，右端需 `light` | 反义词对 | 1-3 |
| **搭配锁链** | 门上有动词，需输入正确宾语（如 `make ___` → `decision`） | 动宾搭配 | 2-4 |
| **首字母传送阵** | 多个传送阵标有字母，输入以该字母开头的单词激活 | 首字母分类 | 1-2 |
| **语境拼图** | 3-4 个例句片段，目标词被 `[_____]` 替代，选择正确词义 | 语境推断 | 1-5 |

### 11.2 机关-解法绑定规则
每个机关生成时，系统**同步预计算 2-3 种解法路径**，确保不存在"唯一解卡死"：

```csharp
class PuzzleTemplate {
    string puzzleType;
    string coreWord;              // 机关核心词
    string[] primarySolutions;    // 主解法（基于当前房间词库）
    string[] fallbackSolutions;   // 备用解法（基于玩家已掌握词库）
    string hintText;              // 低语幽灵提示文本
}
```

---

## 12. 营地枢纽与跨局成长

### 12.1 营地建筑功能

| 建筑 | 功能 | 与随机地牢的关系 |
|------|------|----------------|
| **词库祭坛** | 查看已掌握词汇，按 Tier/主题/词根分类 | 新词在此"点亮" |
| **语法工坊** | 消耗语义碎片升级真言能力 | 升级永久生效 |
| **记忆回廊** | 复习即将"褪色"的词汇（7天未用变灰） | 复习后地牢中重新激活 |
| **挑战之门** | 选择本次 Tier，查看主题预告，开始生成 | 唯一地牢入口 |
| **图鉴馆** | 查看已击败怪物的真名、弱点、最佳 Combo | 激励全收集 |
| **发音校准室** | 语音训练小游戏，提升特定词汇识别率 | 改善语音体验 |

### 12.2 跨局保留机制 (Meta-Progression)

**永久保留**：
- 本次达成"铭刻"的新词
- 收集的词根碎片、语义宝石
- 解锁的主题标签（影响生成概率）
- 语法工坊升级等级

**丢失重置**：
- 本次地牢中未带出的临时道具
- 本次地牢的地图布局（完全重新生成）

---

## 13. 玩家成长与动态难度调节 (DDA)

### 13.1 玩家等级体系

| 等级 | 掌握词数 | 解锁能力 |
|------|---------|---------|
| 学徒 | 0-100 | 单字真言，基础移动 |
| 破译者 | 100-500 | 双词编织，装备系统 |
| 联结者 | 500-1500 | 三词禁咒，词根共鸣 |
| 言灵师 | 1500-3000 | 跨层传送，语义迷雾驱散 |
| 词源宗师 | 3000-5000 | 自定义 Combo，Boss 挑战 |
| 语言守护者 | 5000+ | 无尽模式，自定义词库导入 |

### 13.2 新词掌握三层验证

```
第一层：遭遇 (Encounter)
    - 地牢中首次输入该词（无论对错）
    - 加入临时词库，本次地牢可用

第二层：共鸣 (Resonance)
    - 使用该词成功打出 1 次 Combo 或击败 1 怪
    - 退出后该词在祭坛闪烁

第三层：铭刻 (Inscription)
    - 在营地主动输入该词 1 次确认
    - 永久掌握，影响未来所有地牢生成
```

### 13.3 局内 DDA 参数

| 玩家行为 | 系统判断 | 后续调整 |
|---------|---------|---------|
| 连续 3 次输入错误 | 当前难度过高 | 增加提示房间，降低新词比例 -10% |
| 连续 5 次一击秒杀 | 过于简单 | 后续 30% 已掌握词替换为同 Tier 新词 |
| 频繁使用同一 Combo | 策略单一 | 生成该属性免疫怪物，强制换策略 |
| 隐藏房前徘徊 2min+ | 未理解谜题 | 生成低语幽灵 NPC 给出中文谐音/词根提示 |
| 语音连续识别错误 | 发音/环境噪音问题 | 临时降低语音置信度阈值，或提示切换键盘 |

### 13.4 偏好学习算法

```csharp
// 主题生成概率调整
foreach (var theme in allThemes) {
    float baseWeight = 1.0f;
    if (player.themePerformance[theme] > 0.8f) baseWeight *= 0.8f; // 擅长，降低
    if (player.themePerformance[theme] < 0.4f) baseWeight *= 1.3f; // 薄弱，提升
    themeWeights[theme] = baseWeight;
}
// 按调整后的权重随机抽取主题
```

---

## 14. 技术实现方案

### 14.1 技术栈矩阵

| 模块 | 方案 A (Unity) | 方案 B (Cocos) | 推荐 |
|------|---------------|---------------|------|
| **引擎** | Unity 2022 LTS + 2D URP | Cocos Creator 3.8 | Unity（复杂数据绑定更成熟） |
| **脚本语言** | C# | TypeScript | C# |
| **本地数据库** | SQLite-net | SQLite + JSB | SQLite-net |
| **图渲染** | 自定义力导向 + Shader Graph | 自定义渲染组件 | 无需复杂图渲染，房间为网格 |
| **词向量计算** | 预计算 JSON，运行时查表 | 同上 | 无需运行时计算 |
| **语音识别** | Whisper.cpp (C# P/Invoke) | Whisper.cpp + JSB | Whisper.cpp |
| **音频** | FMOD / Wwise | Cocos AudioEngine | FMOD（事件驱动更适合语音反馈） |
| **存档** | JSON + AES-128 | JSON + 本地存储 | JSON + AES |

### 14.2 核心数据结构

```csharp
// 词汇实体
[System.Serializable]
public class LexicalEntity {
    public string wordId;
    public string spelling;
    public string phonetic;
    public int freqRank;
    public int tier;
    public string pos;
    public string[] meanings;
    public string root;
    public string[] themes;
    public float[] vector;          // 50维预计算词向量
    public EntityType gameType;
    public int hp;
    public string[] weaknessTags;
    public string[] comboWords;
    public int polysemyCount;
}

// 语义边
public class SemanticEdge {
    public string sourceId;
    public string targetId;
    public RelationType relation;   // Synonym/Antonym/...
    public float weight;
}

// 玩家档案
public class PlayerProfile {
    public HashSet<string> masteredWords;     // 已铭刻词汇
    public HashSet<string> encounteredWords; // 临时遭遇词汇
    public Dictionary<string, int> rootFragments; // 词根碎片
    public Dictionary<string, float> themeAffinity; // 主题熟练度
    public int masteryLevel;                // 玩家等级
    public VoiceSettings voiceSettings;     // 语音配置
}

// 地牢种子
public class DungeonSeed {
    public int challengeTier;
    public string[] mainThemes;
    public int roomCount;
    public float branchFactor;
    public List<RoomTemplate> rooms;
    public List<string> guaranteedNewWords;
}

// 房间模板
public class RoomTemplate {
    public string roomId;
    public string theme;
    public string coreWord;
    public string[] satelliteWords;
    public string[] puzzleSolutions;
    public float difficultyRatio;
    public List<string> connectedRooms;
    public Vector2 gridPosition;    // 2D网格坐标
}
```

### 14.3 关键算法伪代码

**A. 地牢 DAG 生成**
```csharp
List<RoomTemplate> BuildDAG(int count, float branchFactor) {
    var rooms = new List<RoomTemplate>();
    rooms.Add(CreateStartRoom());

    for (int i = 1; i < count; i++) {
        var newRoom = CreateRoom(i);
        // 确定父节点：优先连接到最近 1-2 个节点，控制分支
        int parentCount = Random.Range(1, Mathf.CeilToInt(branchFactor));
        for (int p = 0; p < parentCount && i-p-1 >= 0; p++) {
            rooms[i-p-1].connectedRooms.Add(newRoom.roomId);
        }
        rooms.Add(newRoom);
    }
    // 添加 0-N 个环路（捷径）
    AddLoops(rooms, loopCount: Mathf.FloorToInt(count * 0.1f));
    return rooms;
}
```

**B. 语义关系查询（运行时）**
```csharp
ComboResult QueryCombo(string wordA, string wordB) {
    // 1. 直接查边表
    var edge = db.Query<SemanticEdge>(
        "SELECT * FROM semantic_edges WHERE source_id=? AND target_id=?", 
        wordA, wordB);

    if (edge != null) return new ComboResult(edge.relation, edge.weight);

    // 2. 无直接边时，计算词向量余弦相似度作为 fallback
    float sim = CosineSimilarity(wordA.vector, wordB.vector);
    if (sim > 0.85f) return new ComboResult(RelationType.Synonym, sim);
    if (sim < -0.3f) return new ComboResult(RelationType.Antonym, Mathf.Abs(sim));

    return ComboResult.None;
}
```

**C. 语音处理管线**
```csharp
IEnumerator VoiceIncantation() {
    StartRecording(maxDuration: 5.0f);
    yield return new WaitUntil(() => VAD.IsSpeechEnded || Input.GetKeyDown(KeyCode.Space));
    var audioClip = StopRecording();

    // 异步推理
    var task = Whisper.InferAsync(audioClip, language: "en");
    yield return new WaitUntil(() => task.IsCompleted);

    var result = task.Result;
    if (result.confidence < voiceSettings.threshold) {
        UIManager.Show("真言模糊，请重述");
        yield break;
    }

    // 谐音幽灵检测
    if (IsHomophone(result.text, predictedTarget)) {
        SpawnHomophoneSpirit(result.text);
    } else {
        InputPipeline.Submit(result.text, source: InputSource.Voice);
    }
}
```

---

## 15. 美术与音频规范

### 15.1 视觉风格
- **风格定位**：手绘风格 2D，极简符号美学，带有"语言/符文"元素
- **参考**：《Sable》的色彩平涂 + 《Journey》的氛围感 + 《Return of the Obra Dinn》的符号化
- **色调分区**：Tier 1 暖黄，Tier 2 翠绿，Tier 3 蓝绿，Tier 4 紫罗兰，Tier 5 深空蓝/黑

### 15.2 实体视觉规范

| 元素 | 未激活状态 | 激活状态 | 特效 |
|------|-----------|---------|------|
| **单词节点** | 灰色石碑，仅显示拼写 | 发光，显示词义与音标 | 激活时迸发对应主题色粒子 |
| **语义路径** | 迷雾（不可见） | 可见的"光桥" | 同义词=金光，反义词=黑白闪，搭配=锁链 |
| **怪物** | 半透明，真名悬浮头顶 | 受击时真名闪烁红光 | 死亡时真名碎裂化为光点汇入玩家 |
| **道具** | 静置，微弱呼吸光 | 拾取时旋转飞入 UI | 词根道具拾取时显示词根图腾 |

### 15.3 音频设计

| 事件 | 音频反馈 |
|------|---------|
| 输入正确真言 | 清脆的符文敲击声 + 微弱共鸣尾音 |
| 双词编织成功 | 两声和声叠加，形成和弦 |
| 反义湮灭 | 强烈的黑白噪声对冲后归于寂静 |
| 语音识别成功 | 空气震动感的低频"嗡"声 |
| 谐音幽灵生成 | 扭曲的回声音效，似原词但走调 |
| 铭刻新词 | 庄严的钟声 + 单词拼写的字母逐个响起 |

---

## 16. 开发路线图

### 里程碑 1：核心验证原型 (MVP) — 6 周
**目标**：验证"输入单词打怪"的核心爽感与动态生成的逻辑一致性。

| 周次 | 任务 | 交付物 |
|------|------|--------|
| 1-2 | 搭建 500 词测试数据库（Tier 1 全量 + Tier 2 部分），含主题标签、基础语义关系 | `vocabulary_test.db` |
| 2-3 | 实现输入框 + 基础解析器（单字真言 + 双词编织），集成 SQLite 查询 | 可运行的输入 Demo |
| 3-4 | 实现 PLG Engine v1：1 个主题（Kitchen）随机生成 5 房间地牢 | 生成器 CLI 工具 |
| 4-5 | 实现 3 种怪物（Snake, Fire, Knife）+ 基础战斗（HP + 语义相性伤害） | 战斗原型 |
| 5-6 | 集成测试：同一主题连续生成 10 次，验证房间差异性 + 语义一致性 | 测试报告 + 调整参数 |

### 里程碑 2：动态地牢与 Combo 系统 — 5 周
- 扩展至 2000 词（Tier 1-2）
- 实现 3 套主题（Kitchen, Forest, Battle）完整美术 + 房间预制体
- 导入 WordNet 关系，实现完整 Combo 表
- 实现营地枢纽（词库祭坛、挑战之门）
- 实现 DDA 监控器 v1

### 里程碑 3：语音与深层内容 — 5 周
- 集成 Whisper.cpp，实现语音输入 + 谐音幽灵
- 扩展至 4000 词（Tier 1-3）
- 实现 Boss 随机生成模板（多义枢纽、词根巨龙）
- 实现 5 种语言机关
- 实现三词禁咒系统

### 里程碑 4：完整版与无尽模式 — 4 周
- 8000 词全量导入
- Tier 4-5 主题（Office, Lab, Abstract）
- 无尽深渊模式（超过 Tier 5 后全词库无限生成）
- 移动端适配（虚拟键盘 + 触摸交互）
- 复习机制 + 数据埋点

---

## 17. 验收标准

### 17.1 功能验收

| 模块 | 验收标准 | 测试方法 |
|------|---------|---------|
| **词汇数据库** | 8000 词全部包含拼写、音标、词性、词频、主题标签 | 脚本全表扫描 |
| **动态生成** | 同一 Tier 连续生成 20 次，房间核心词重复率 < 15% | 自动化生成 + 比对 |
| **语义一致性** | 任意房间内所有实体与房间主题的 avg(词向量相似度) > 0.35 | 抽样 100 房间计算 |
| **Combo 系统** | WordNet 同义/反义/搭配查询延迟 < 50ms | 压力测试 1000 次查询 |
| **语音输入** | 端到端延迟 < 800ms，安静环境下准确率 > 85% | 10 人各测试 50 词 |
| **DDA 有效性** | 连续错误 3 次后，后续房间新词比例确实下降 | 模拟机器人测试 |
| **学习闭环** | 每次地牢平均可铭刻新词 5-10 个 | 10 名测试员各玩 5 局统计 |

### 17.2 性能验收

| 指标 | 目标值 |
|------|--------|
| 地牢生成时间（Tier 3） | < 2 秒 |
| 战斗输入响应延迟 | < 100ms |
| 内存占用（移动端） | < 500MB（含 Whisper 模型） |
| 包体大小（移动端） | < 200MB（含 base.en 模型 74MB + 资源） |
| 帧率 | 稳定 60 FPS |

---

## 18. 附录

### 18.1 数据来源与处理工具

| 数据 | 来源 | 处理工具 |
|------|------|---------|
| 8000 词表 + 词频 | COCA / wordfrequency.info | Python 清洗 |
| 释义/音标 | 有道 API / Merriam-Webster | Python 批量抓取 |
| 语义关系 | WordNet 3.1 | Python + NLTK |
| 搭配关系 | COCA 搭配数据 | 提取高频搭配对 |
| 词根词缀 | 开源词根表 (etymology.com) | 手动校验 + 批量匹配 |
| 词向量 | GloVe 50d / 自训练 | 预计算后嵌入 SQLite |

### 18.2 语义关系类型定义

| 关系 | 判定标准 | 游戏内权重 |
|------|---------|-----------|
| `synonym` | WordNet synset 相同 | 0.80 |
| `antonym` | WordNet antonym 指针 | 0.85 |
| `collocation` | COCA 搭配 MI > 3.0 | 0.90 |
| `hypernym` | WordNet hypernym 指针 | 0.60 |
| `hyponym` | WordNet hyponym 指针 | 0.60 |
| `root` | 共享同一词根（字符串匹配 + 人工校验） | 0.50 |
| `context` | 同一例句中共同出现（Tatoeba 共现） | 0.75 |

### 18.3 命名规范

- **代码命名**：`PascalCase` 类名，`camelCase` 变量/方法，`SCREAMING_SNAKE_CASE` 常量
- **数据库**：`snake_case` 表名/字段，`word_id` 格式为 `word_{spelling}`
- **资源路径**：`Assets/Resources/Tier{X}/{Theme}/{Type}/{word_id}.prefab`
- **配置表**：Google Sheets → 导出 CSV → Python 校验 → 生成 SQLite/JSON

---

**文档结束**

**下一步行动建议**：
1. **程序侧**：基于本文档第 14.3 节伪代码，搭建 `DungeonGenerator` 和 `InputParser` 两个核心类的空壳框架，定义接口。
2. **策划侧**：使用 Python 脚本清洗 COCA 前 500 词，标注 `theme` 和 `game_type`，生成首个 `vocabulary_test.db`。
3. **美术侧**：确定 Tier 1 "起源营地"的视觉基调，设计 `word_stone`（未激活单词石碑）和 `word_light`（激活状态）两个核心预制体。
