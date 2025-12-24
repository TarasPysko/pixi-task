import * as PIXI from "pixi.js";

export type ShapeType =
  | "triangle"
  | "rect"
  | "pentagon"
  | "hexagon"
  | "circle"
  | "ellipse"
  | "random";

export interface ShapeObject {
  id: number;
  graphics: PIXI.Graphics;
  area: number;
  type: ShapeType;
  dy: number;
}

export interface GameStats {
  shapeCount: number;
  areaOccupied: number;
  gravity: number;
  shapesPerSec: number;
}
