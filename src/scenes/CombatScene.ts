import Phaser from 'phaser';
import { createMonster } from '../data/MonsterDB';
import { CombatSystem, DamageResult } from '../game/CombatSystem';

export class CombatScene extends Phaser.Scene {
  private combat!: CombatSystem;
  private monsterGraphics!: Phaser.GameObjects.Graphics;
  private monsterContainer!: Phaser.GameObjects.Container;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private shakeTween!: Phaser.Tweens.Tween | null = null;
  private torchFlicker!: Phaser.Tweens.Tween[] = [];

  // UI 回调（由 main.ts 注入）
  onDamageCallback!: (x: number, y: number, dmg: number, type: string) => void;
  onFeedbackCallback!: (text: string, type: string) => void;
  onHpUpdateCallback!: (playerHp: number, playerMax: number, monsterHp: number, monsterMax: number) => void;
  onEndCallback!: (won: boolean) => void;
  onTurnChangeCallback!: (isPlayer: boolean) => void;

  constructor() {
    super({ key: 'CombatScene' });
  }

  create() {
    this.drawDungeon();
    this.drawMonster();
    this.createParticles();
    this.startCombat('snake');
  }

  /** 绘制地牢场景 */
  private drawDungeon() {
    const W = this.scale.width;
    const H = this.scale.height;

    // 背景色
    this.cameras.main.setBackgroundColor('#0d0d1a');

    // 地板
    const floorY = H * 0.55;
    for (let x = 0; x < W; x += 128) {
      for (let y = floorY; y < H; y += 128) {
        this.add.image(x + 64, y + 64, 'floor').setAlpha(0.6);
      }
    }

    // 地面平台（怪物站立处）
    const platform = this.add.graphics();
    platform.fillStyle(0x1e1e3a, 1);
    platform.fillEllipse(W / 2, floorY + 20, 280, 60);
    platform.lineStyle(2, 0x3d3d6b, 0.5);
    platform.strokeEllipse(W / 2, floorY + 20, 280, 60);

    // 墙壁柱子
    const pillarLeft = this.add.image(60, H * 0.4, 'pillar').setOrigin(0.5, 0);
    const pillarRight = this.add.image(W - 60, H * 0.4, 'pillar').setOrigin(0.5, 0);

    // 火把 + 闪烁动画
    this.addTorch(W * 0.25, H * 0.45);
    this.addTorch(W * 0.75, H * 0.45);

    // 顶部拱顶（曲线装饰）
    const arch = this.add.graphics();
    arch.lineStyle(3, 0x2d2d44, 0.6);
    arch.beginPath();
    arch.moveTo(80, H * 0.25);
    arch.quadraticCurveTo(W / 2, -20, W - 80, H * 0.25);
    arch.strokePath();

    // 环境光晕
    const glow = this.add.graphics();
    glow.fillStyle(0x3d3d6b, 0.08);
    glow.fillCircle(W / 2, floorY - 40, 200);
  }

  private addTorch(x: number, y: number) {
    const torch = this.add.image(x, y, 'torch');

    // 光照效果（用发光圆模拟）
    const light = this.add.graphics();
    light.fillStyle(0xffaa00, 0.1);
    light.fillCircle(x, y - 10, 60);
    light.setBlendMode(Phaser.BlendModes.ADD);

    // 闪烁动画
    const tween = this.tweens.add({
      targets: light,
      alpha: { from: 0.8, to: 1.2 },
      duration: 200 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.torchFlicker.push(tween);
  }

  /** 用 Graphics 绘制怪物（蛇） */
  private drawMonster() {
    const W = this.scale.width;
    const H = this.scale.height;
    const floorY = H * 0.55;

    this.monsterContainer = this.add.container(W / 2, floorY - 40);
    this.monsterGraphics = this.add.graphics();
    this.monsterContainer.add(this.monsterGraphics);

    this.drawSnakeShape(0x4ade80);

    // 名字标签（Phaser 文字）
    const nameText = this.add.text(0, -70, 'SNAKE', {
      fontSize: '20px',
      fontFamily: 'Microsoft YaHei',
      color: '#4ade80',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.monsterContainer.add(nameText);
  }

  private drawSnakeShape(color: number) {
    const g = this.monsterGraphics;
    g.clear();

    // 身体（由几个椭圆组成，有蛇的弯曲感）
    const bodyColor = color;
    const bellyColor = 0x88cc88;

    // 尾巴
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(-50, 25, 30, 20);

    // 中段
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(-20, 15, 45, 35);
    g.fillEllipse(15, 10, 50, 40);

    // 头部（较大）
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(45, 0, 55, 45);

    // 腹部浅色
    g.fillStyle(bellyColor, 0.5);
    g.fillEllipse(-20, 22, 35, 12);
    g.fillEllipse(15, 20, 40, 15);
    g.fillEllipse(45, 18, 45, 15);

    // 眼睛
    g.fillStyle(0xffffff, 1);
    g.fillCircle(55, -10, 8);
    g.fillCircle(75, -10, 8);

    // 瞳孔
    g.fillStyle(0x000000, 1);
    g.fillCircle(57, -10, 4);
    g.fillCircle(77, -10, 4);

    // 瞳孔高光
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(58, -12, 1.5);
    g.fillCircle(78, -12, 1.5);

    // 舌头
    g.fillStyle(0xff4444, 1);
    g.fillTriangle(95, 5, 105, 0, 95, -5);
    g.lineStyle(1, 0xff4444, 1);
    g.lineBetween(90, 0, 95, 0);

    // 蛇信子分叉
    g.lineBetween(105, 0, 110, -3);
    g.lineBetween(105, 0, 110, 3);

    // 鳞片纹理（装饰线）
    g.lineStyle(1, 0x2d8a4e, 0.4);
    for (let i = 0; i < 3; i++) {
      const y = 5 + i * 10;
      g.beginPath();
      g.moveTo(-30, y);
      g.quadraticCurveTo(10, y - 5, 50, y);
      g.strokePath();
    }
  }

  /** 创建粒子系统 */
  private createParticles() {
    // 创建粒子纹理
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(4, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    this.textures.addCanvas('particle', canvas);

    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 200 },
      scale: { start: 0.5, end: 0 },
      lifespan: 600,
      gravityY: 300,
      quantity: 1,
      emitting: false,
    });
  }

  /** 开始战斗 */
  startCombat(monsterKey: string) {
    if (this.combat) this.combat.destroy();

    const monster = createMonster(monsterKey);
    this.combat = new CombatSystem(monster);

    this.combat.onEvent((evt) => {
      switch (evt.type) {
        case 'damage':
          this.handleDamage(evt.result, evt.source);
          break;
        case 'combo':
          this.handleCombo(evt.result);
          break;
        case 'miss':
          this.handleMiss(evt.word);
          break;
        case 'turn_change':
          this.onTurnChangeCallback?.(evt.isPlayer);
          break;
        case 'end':
          this.handleEnd(evt.won);
          break;
      }

      // 更新血条
      const s = this.combat.state;
      this.onHpUpdateCallback?.(s.playerHp, s.playerMaxHp, s.monster.currentHp, s.monster.maxHp);
    });

    // 初始血条
    const s = this.combat.state;
    this.onHpUpdateCallback?.(s.playerHp, s.playerMaxHp, s.monster.currentHp, s.monster.maxHp);
  }

  /** 玩家施法 */
  playerCast(word: string): boolean {
    if (!this.combat?.state.isPlayerTurn || this.combat.state.isEnded) return false;
    const result = this.combat.castWord(word);
    return result !== null;
  }

  /** 玩家 Combo */
  playerCombo(a: string, b: string): boolean {
    if (!this.combat?.state.isPlayerTurn || this.combat.state.isEnded) return false;
    const result = this.combat.castCombo(a, b);
    return result !== null;
  }

  private handleDamage(result: DamageResult, source: 'player' | 'monster') {
    const W = this.scale.width;
    const H = this.scale.height;
    const floorY = H * 0.55;

    if (source === 'player') {
      // 怪物受伤效果
      this.flashMonster();
      this.shakeMonster();

      // 伤害数字位置（怪物上方）
      const dmgX = W / 2 + (Math.random() - 0.5) * 40;
      const dmgY = floorY - 100;
      const type = result.isKill ? 'kill' : result.isCombo ? 'combo' : 'monster';
      this.onDamageCallback?.(dmgX, dmgY, result.damage, type);

      // 粒子爆发
      if (result.isCombo || result.multiplier >= 3) {
        this.explodeParticles(W / 2, floorY - 40, result.isKill ? 0xff0000 : 0xffaa00);
      }

      // 反馈文字
      const relName = this.getRelationName(result.relationType);
      const feedback = result.isKill
        ? `绝杀！${relName}`
        : result.isCombo
        ? `Combo ${relName}！造成 ${result.damage} 点伤害`
        : `${result.meaning} → ${result.damage} 点伤害`;
      this.onFeedbackCallback?.(feedback, result.isKill ? 'weakness' : result.isCombo ? 'combo' : 'normal');
    } else {
      // 玩家受伤：屏幕震动
      this.cameras.main.shake(200, 0.005);

      // 伤害数字位置（左下角玩家区域）
      this.onDamageCallback?.(80, H - 100, result.damage, 'player');
      this.onFeedbackCallback?.(`受到 ${result.damage} 点伤害！`, 'enemy');
    }
  }

  private handleCombo(result: DamageResult) {
    // Combo 已在 handleDamage 中处理，这里只做额外特效
    this.cameras.main.shake(300, 0.008);
  }

  private handleMiss(word: string) {
    this.onFeedbackCallback?.(`"${word}" — 未知真言，施法失败`, 'miss');
  }

  private handleEnd(won: boolean) {
    if (won) {
      this.monsterContainer.setAlpha(0.3);
      this.explodeParticles(this.scale.width / 2, this.scale.height * 0.55 - 40, 0x4ade80);
    }
    this.onEndCallback?.(won);
  }

  /** 怪物闪烁红色 */
  private flashMonster() {
    this.drawSnakeShape(0xff4444);
    this.time.delayedCall(150, () => {
      this.drawSnakeShape(0x4ade80);
    });
  }

  /** 怪物震动 */
  private shakeMonster() {
    if (this.shakeTween?.isPlaying()) return;
    this.shakeTween = this.tweens.add({
      targets: this.monsterContainer,
      x: { from: this.monsterContainer.x - 5, to: this.monsterContainer.x + 5 },
      duration: 50,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.monsterContainer.x = this.scale.width / 2;
      },
    });
  }

  /** 粒子爆发 */
  private explodeParticles(x: number, y: number, color: number) {
    this.particles.emitParticleAt(x, y, 20);
    // 改变粒子颜色
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d')!;
    const hex = '#' + color.toString(16).padStart(6, '0');
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(4, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    this.textures.addCanvas('particle_' + color, canvas);
    this.particles.setTexture('particle_' + color);
  }

  private getRelationName(type?: string): string {
    const map: Record<string, string> = {
      synonym: '同义共鸣',
      antonym: '反义湮灭',
      collocation: '搭配绝杀',
      weakness_kill: '弱点绝杀',
      true_name: '真名法则',
      normal: '',
      weak: '',
      none: '',
    };
    return map[type ?? ''] || type || '';
  }

  get isPlayerTurn(): boolean {
    return this.combat?.state.isPlayerTurn ?? false;
  }

  get isEnded(): boolean {
    return this.combat?.state.isEnded ?? true;
  }
}
