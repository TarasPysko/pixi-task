import * as PIXI from "pixi.js";
import type { ShapeObject, GameStats } from "./types";
import { ShapeFactory } from "./ShapeFactory";

export class GameEngine {
  public app: PIXI.Application;
  private shapes: ShapeObject[] = [];

  private gravity: number = 2;
  private shapesPerSec: number = 1;
  private timeSinceSpawn: number = 0;

  private onStatsUpdate: (stats: GameStats) => void;

  constructor(
    container: HTMLElement,
    width: number,
    height: number,
    onStatsUpdate: (s: GameStats) => void
  ) {
    this.onStatsUpdate = onStatsUpdate;

    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0xffffff,
      resolution: window.devicePixelRatio || 1,
      antialias: true,
      autoDensity: true,
    });

    container.appendChild(this.app.view as unknown as HTMLElement);

    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on("pointerdown", (e) => {
      this.spawnShape(e.global.x, e.global.y);
    });

    this.app.ticker.add((delta: number) => this.update(delta));
  }

  private update(delta: number) {
    if (!this.app || !this.app.stage) return;

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

      if (this.app && shape.graphics.y > this.app.screen.height + 100) {
        shapesToRemove.push(shape.id);
      }
    });

    shapesToRemove.forEach((id) => this.removeShape(id));
    this.broadcastStats();
  }

  public spawnShape(x: number, y: number) {
    if (!this.app) return;

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
    if (!this.app) return;

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
    if (this.app) {
      this.app.renderer.resize(w, h);
      this.app.stage.hitArea = new PIXI.Rectangle(0, 0, w, h);
    }
  }

  public destroy() {
    if (this.app) {
      this.app.destroy(true, { children: true });
    }
  }

  private broadcastStats() {
    const totalArea = this.shapes.reduce((acc, s) => acc + s.area, 0);
    this.onStatsUpdate({
      shapeCount: this.shapes.length,
      areaOccupied: Math.round(totalArea),
      gravity: this.gravity,
      shapesPerSec: this.shapesPerSec,
    });
  }
}
