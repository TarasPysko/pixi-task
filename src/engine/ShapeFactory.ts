import * as PIXI from "pixi.js";
import type { ShapeType } from "./types";
export class ShapeFactory {
  static createRandomShape(
    x: number,
    y: number
  ): { graphics: PIXI.Graphics; area: number; type: ShapeType } {
    const types: ShapeType[] = [
      "triangle",
      "rect",
      "pentagon",
      "hexagon",
      "circle",
      "ellipse",
      "random",
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    const color = Math.floor(Math.random() * 0xffffff);
    const radius = 25 + Math.random() * 25;

    const graphics = new PIXI.Graphics();
    graphics.beginFill(color);
    graphics.lineStyle(1, 0x000000, 0.5);

    let area = 0;

    switch (type) {
      case "circle":
        graphics.drawCircle(0, 0, radius);
        area = Math.PI * radius * radius;
        break;
      case "ellipse":
        const w = radius;
        const h = radius * 0.6;
        graphics.drawEllipse(0, 0, w, h);
        area = Math.PI * w * h;
        break;
      case "rect":
        graphics.drawRect(-radius, -radius, radius * 2, radius * 2);
        area = (radius * 2) ** 2;
        break;
      case "random":
        graphics.moveTo(0, -radius);
        graphics.bezierCurveTo(radius, -radius, radius, radius, 0, radius);
        graphics.bezierCurveTo(-radius, radius, -radius, -radius, 0, -radius);
        area = Math.PI * radius * radius * 0.8;
        break;
      default:
        const sides = type === "triangle" ? 3 : type === "pentagon" ? 5 : 6;
        const points = [];
        for (let i = 0; i < sides; i++) {
          const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
          points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        graphics.drawPolygon(points);
        area = (sides * radius * radius * Math.sin((2 * Math.PI) / sides)) / 2;
        break;
    }

    graphics.endFill();
    graphics.x = x;
    graphics.y = y;

    graphics.eventMode = "static";
    graphics.cursor = "pointer";

    return { graphics, area, type };
  }
}
