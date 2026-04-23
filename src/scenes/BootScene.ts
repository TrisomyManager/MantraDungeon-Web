import Phaser from 'phaser';
import { WordDB } from '../data/WordDB';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 初始化内存词库
    WordDB.init();

    // 创建程序生成的纹理（无需外部图片资源）
    this.createTileTexture();
    this.createPillarTexture();
    this.createTorchTexture();
    this.createFloorTexture();
  }

  create() {
    this.scene.start('CombatScene');
  }

  private createTileTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 64, 64);

    this.textures.addCanvas('wall_tile', canvas);
  }

  private createPillarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;

    // 柱子主体
    const grad = ctx.createLinearGradient(0, 0, 40, 0);
    grad.addColorStop(0, '#2d2d44');
    grad.addColorStop(0.5, '#3d3d5c');
    grad.addColorStop(1, '#2d2d44');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 40, 200);

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(8, 0, 8, 200);

    // 顶部/底部装饰
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 40, 8);
    ctx.fillRect(0, 192, 40, 8);

    this.textures.addCanvas('pillar', canvas);
  }

  private createTorchTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;

    // 火把柄
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(12, 20, 8, 28);

    // 火焰（多层圆）
    ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
    ctx.beginPath();
    ctx.ellipse(16, 14, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
    ctx.beginPath();
    ctx.ellipse(16, 12, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas('torch', canvas);
  }

  private createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // 地面底色
    ctx.fillStyle = '#16162a';
    ctx.fillRect(0, 0, 128, 128);

    // 石砖纹理
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 128; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y);
      ctx.stroke();
    }
    for (let x = 0; x < 128; x += 64) {
      const offset = (x / 64) % 2 === 0 ? 0 : 16;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 128);
      ctx.stroke();
    }

    this.textures.addCanvas('floor', canvas);
  }
}
