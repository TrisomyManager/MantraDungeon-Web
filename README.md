# MantraDungeon 真言地牢

> 一款**英语词汇学习 × Roguelike 地牢探险**的网页游戏原型

---

## 游戏特色

- **927 词库**：5 级难度（小学 → 大学 → 学术），覆盖常用英语词汇
- **回合制战斗**：每回合从随机 5 词池中选择单词攻击/防御
- **弱点系统**：怪物弱点词每回合随机变化，策略性应对
- **防御系统**：怪物攻击时输入防御词减少 40-70% 伤害
- **TTS 发音**：输入单词后自动朗读（浏览器语音合成）
- **语言梯度**：中文 → 中英双语 → 英文 → 全英文，渐进式学习
- **语义组合**：同义×2 / 反义×3 / 搭配×2.5 / 弱点×4 倍伤害

---

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Zustand 状态管理
- Framer Motion 动画
- Web Speech API（TTS）

---

## 安装与运行

```bash
npm install
npm run dev
```

---

## 部署

```bash
npm run build
```

产物在 `dist/` 目录，可直接部署到任何静态托管服务。

---

## 项目结构

```
src/
  pages/         — 游戏画面（Home, Camp, Dungeon, Battle, Altar, Bestiary, GameOver）
  store/         — Zustand 状态管理 + 927 词库
  components/    — 共享组件（Layout, MobileNav, FloatingDamage）
  hooks/         — useGameText（多语言 Hook）
```

---

## 在线体验

https://ha3bith6tamtq.ok.kimi.link
