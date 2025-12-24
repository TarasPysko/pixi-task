import * as PIXI from "pixi.js";
import type { ShapeObject, GameStats } from "./types";
import { ShapeFactory } from "./ShapeFactory";

export class GameEngine {
  public app: PIXI.Application | null = null;
  private shapes: ShapeObject[] = [];
  private container: HTMLElement;

  private gravity: number = 2;
  private shapesPerSec: number = 1;
  private timeSinceSpawn: number = 0;

  private isDestroyed: boolean = false;

  private onStatsUpdate: (stats: GameStats) => void;

  constructor(container: HTMLElement, onStatsUpdate: (s: GameStats) => void) {
    this.container = container;
    this.onStatsUpdate = onStatsUpdate;
  }

  public async init(width: number, height: number) {
    const app = new PIXI.Application();

    await app.init({
      width,
      height,
      backgroundColor: 0xffffff,
      resolution: window.devicePixelRatio || 1,
      antialias: true,
      autoDensity: true,
    });

    if (this.isDestroyed) {
      app.destroy();
      return;
    }

    this.app = app;

    if (this.container && this.app.canvas) {
      this.container.appendChild(this.app.canvas);
    }

    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on("pointerdown", (e) => {
      this.spawnShape(e.global.x, e.global.y);
    });

    this.app.ticker.add(this.update.bind(this));
  }

  private update(ticker: PIXI.Ticker) {
    if (!this.app || this.isDestroyed) return;

    const delta = ticker.deltaTime;

    const msPerFrame = 16.66;
    this.timeSinceSpawn += msPerFrame * delta;

    const interval = 1000 / this.shapesPerSec;
    if (this.timeSinceSpawn > interval) {
      const randomX = Math.random() * this.app.screen.width;
      this.spawnShape(randomX, -60);
      this.timeSinceSpawn = 0;
    }

    const shapesToRemove: number[] = [];

    this.shapes.forEach((shape) => {
      shape.graphics.y += this.gravity * delta;
      if (shape.graphics.y > this.app.screen.height + 100) {
        shapesToRemove.push(shape.id);
      }
    });

    shapesToRemove.forEach((id) => this.removeShape(id));
    this.broadcastStats();
  }

  public spawnShape(x: number, y: number) {
    if (!this.app || this.isDestroyed) return;

    const { graphics, area, type } = ShapeFactory.createRandomShape(x, y);
    const id = Date.now() + Math.random();

    graphics.on("pointerdown", (e) => {
      e.stopPropagation();
      this.removeShape(id);
    });

    this.app.stage.addChild(graphics);
    this.shapes.push({ id, graphics, area, type, dy: 0 });
    this.broadcastStats();
  }

  public removeShape(id: number) {
    if (!this.app || this.isDestroyed) return;

    const index = this.shapes.findIndex((s) => s.id === id);
    if (index !== -1) {
      const shape = this.shapes[index];
      if (!shape.graphics.destroyed) {
        this.app.stage.removeChild(shape.graphics);
        shape.graphics.destroy();
      }
      this.shapes.splice(index, 1);
      this.broadcastStats();
    }
  }

  public setGravity(val: number) {
    this.gravity = Math.max(0.5, val);
    this.broadcastStats();
  }
  public getGravity() {
    return this.gravity;
  }
  public setSpawnRate(val: number) {
    this.shapesPerSec = Math.max(0.5, val);
    this.broadcastStats();
  }
  public getSpawnRate() {
    return this.shapesPerSec;
  }

  public resize(w: number, h: number) {
    if (this.app && !this.isDestroyed) {
      this.app.renderer.resize(w, h);
      this.app.stage.hitArea = new PIXI.Rectangle(0, 0, w, h);
    }
  }

  public destroy() {
    this.isDestroyed = true;

    if (this.app) {
      if (this.app.canvas && this.app.canvas.parentNode) {
        this.app.canvas.parentNode.removeChild(this.app.canvas);
      }

      this.app.destroy({ removeView: true }, { children: true });
      this.app = null;
    }
  }

  private broadcastStats() {
    if (this.isDestroyed) return;

    const totalArea = this.shapes.reduce((acc, s) => acc + s.area, 0);
    this.onStatsUpdate({
      shapeCount: this.shapes.length,
      areaOccupied: Math.round(totalArea),
      gravity: this.gravity,
      shapesPerSec: this.shapesPerSec,
    });
  }
}
