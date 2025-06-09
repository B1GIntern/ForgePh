// src/lib/winwheel.d.ts
declare module "winwheel" {
    export interface Segment {
      text?: string;
      fillStyle?: string;
      strokeStyle?: string;
      lineWidth?: number;
      imgData?: HTMLImageElement;
      size?: number;
    }
  
    export default class Winwheel {
      constructor(options: any);
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      numSegments: number;
      segments: Segment[];
      startAngle: number;
      endAngle: number;
      outerRadius: number;
      // Add methods and properties as needed
      draw(clear: boolean): void;
    }
  }