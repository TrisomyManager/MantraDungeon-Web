import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CombatScene } from './scenes/CombatScene';
import './style.css';

// ===== DOM 元素 =====
const gameContainer = document.getElementById('game-container')!;
const startScreen = document.getElementById('start-screen')!;
const endScreen = document.getElementById('end-screen')!;
const startBtn = document.getElementById('start-btn')!;
const restartBtn = document.getElementById('restart-btn')!;
const wordInput = document.getElementById('word-input') as HTMLInputElement;
const inputPrefix = document.getElementById('input-prefix')!;
const comboIndicator = document.getElementById('combo-indicator')!;
const feedbackArea = document.getElementById('feedback-area')!;
const damageContainer = document.getElementById('damage-numbers')!;

// 血条元素
const monsterHpFill = document.querySelector('.monster-hp-fill') as HTMLElement;
const monsterHpText = document.querySelector('#monster-hud .hp-text')!;
const playerHpFill = document.querySelector('.player-hp-fill') as HTMLElement;
const playerHpText = document.querySelector('#player-hud .hp-text')!;

// ===== Phaser 游戏配置 =====
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#0d0d1a',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, CombatScene],
  render: {
    pixelArt: false,
    antialias: true,
  },
};

let game: Phaser.Game;
let combatScene: CombatScene;

// ===== 启动游戏 =====
function initGame() {
  if (game) game.destroy(true);
  game = new Phaser.Game(config);

  // 等待场景创建完成
  game.events.on('step', () => {
    const scene = game.scene.getScene('CombatScene') as CombatScene;
    if (scene && scene !== combatScene) {
      combatScene = scene;
      bindSceneCallbacks(scene);
    }
  });
}

// ===== 绑定场景回调 =====
function bindSceneCallbacks(scene: CombatScene) {
  // 伤害数字
  scene.onDamageCallback = (x, y, dmg, type) => {
    showDamageNumber(x, y, dmg, type);
  };

  // 反馈文字
  scene.onFeedbackCallback = (text, type) => {
    showFeedback(text, type);
  };

  // 血条更新
  scene.onHpUpdateCallback = (pHp, pMax, mHp, mMax) => {
    updateHpBars(pHp, pMax, mHp, mMax);
  };

  // 战斗结束
  scene.onEndCallback = (won) => {
    setTimeout(() => showEndScreen(won), 800);
  };

  // 回合切换
  scene.onTurnChangeCallback = (isPlayer) => {
    if (isPlayer) {
      wordInput.disabled = false;
      wordInput.focus();
      inputPrefix.textContent = '>';
      inputPrefix.style.color = '#4ade80';
    } else {
      wordInput.disabled = true;
      inputPrefix.textContent = '...';
      inputPrefix.style.color = '#f87171';
    }
  };
}

// ===== 输入系统 =====
let firstWord: string | null = null;
let comboTimer: ReturnType<typeof setTimeout> | null = null;

wordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = wordInput.value.trim().toLowerCase();
    if (!val) return;

    if (firstWord === null) {
      // 单字施法
      combatScene?.playerCast(val);
      wordInput.value = '';
    } else {
      // Combo 施法
      combatScene?.playerCombo(firstWord, val);
      clearComboState();
      wordInput.value = '';
    }
  }

  if (e.key === ' ') {
    e.preventDefault();
    const val = wordInput.value.trim().toLowerCase();
    if (!val || firstWord !== null) return;

    // 缓存第一个词，进入 Combo 等待
    firstWord = val;
    wordInput.value = '';
    inputPrefix.textContent = '+';
    inputPrefix.style.color = '#fbbf24';
    comboIndicator.textContent = `Combo: ${firstWord} + ... (5s)`;

    // 5秒倒计时
    let remaining = 5;
    comboTimer = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        comboIndicator.textContent = `Combo: ${firstWord} + ... (${remaining}s)`;
      } else {
        // 超时：只施放第一个词
        comboIndicator.textContent = '';
        combatScene?.playerCast(firstWord);
        clearComboState();
      }
    }, 1000);
  }

  if (e.key === 'Escape') {
    clearComboState();
    wordInput.value = '';
  }
});

function clearComboState() {
  firstWord = null;
  if (comboTimer) {
    clearInterval(comboTimer);
    comboTimer = null;
  }
  comboIndicator.textContent = '';
  inputPrefix.textContent = '>';
  inputPrefix.style.color = '#4ade80';
}

// ===== UI 函数 =====

function updateHpBars(pHp: number, pMax: number, mHp: number, mMax: number) {
  const mPct = (mHp / mMax) * 100;
  const pPct = (pHp / pMax) * 100;

  monsterHpFill.style.width = `${mPct}%`;
  monsterHpText.textContent = `${mHp} / ${mMax}`;

  playerHpFill.style.width = `${pPct}%`;
  playerHpText.textContent = `${pHp} / ${pMax}`;

  // 低血量变红
  if (mPct < 30) monsterHpFill.style.background = 'linear-gradient(90deg, #dc2626, #ef4444)';
  if (pPct < 30) playerHpFill.style.background = 'linear-gradient(90deg, #dc2626, #ef4444)';
}

function showFeedback(text: string, type: string) {
  const el = document.createElement('div');
  el.className = `feedback-line feedback-${type}`;
  el.textContent = text;
  feedbackArea.appendChild(el);

  // 自动清理
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1500);

  // 限制数量
  while (feedbackArea.children.length > 4) {
    feedbackArea.removeChild(feedbackArea.firstChild!);
  }
}

function showDamageNumber(x: number, y: number, dmg: number, type: string) {
  const el = document.createElement('div');
  el.className = `damage-number damage-${type}`;
  el.textContent = type === 'player' ? `-${dmg}` : `${dmg}`;

  // 转换为屏幕坐标（Phaser 坐标 → CSS 像素）
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  damageContainer.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1200);
}

function showEndScreen(won: boolean) {
  const title = document.getElementById('end-title')!;
  const desc = document.getElementById('end-desc')!;

  if (won) {
    title.textContent = '胜利！';
    title.style.color = '#4ade80';
    desc.textContent = '你成功击败了怪物，铭刻了新的真言。';
  } else {
    title.textContent = '战败...';
    title.style.color = '#ef4444';
    desc.textContent = '言灵师倒下了，但知识永存。';
  }

  endScreen.classList.remove('hidden');
  wordInput.disabled = true;
}

function hideEndScreen() {
  endScreen.classList.add('hidden');
}

// ===== 开始/重新开始 =====
startBtn.addEventListener('click', () => {
  startScreen.style.opacity = '0';
  setTimeout(() => {
    startScreen.style.display = 'none';
    initGame();
    setTimeout(() => wordInput.focus(), 500);
  }, 300);
});

restartBtn.addEventListener('click', () => {
  hideEndScreen();
  clearComboState();

  // 重置血条颜色
  monsterHpFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
  playerHpFill.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';

  // 重新开始战斗
  combatScene?.startCombat('snake');
  setTimeout(() => wordInput.focus(), 300);
});

// ===== 窗口大小调整 =====
window.addEventListener('resize', () => {
  if (game) {
    game.scale.resize(window.innerWidth, window.innerHeight);
  }
});

// 初始焦点
wordInput.focus();
