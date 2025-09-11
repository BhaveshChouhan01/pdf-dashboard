// lib/polyfills.ts
if (typeof window === 'undefined') {
  // Polyfill DOMMatrix and other browser APIs for server-side rendering
  (global as any).DOMMatrix = class DOMMatrix {
    constructor() {}
  };

  (global as any).HTMLCanvasElement = class HTMLCanvasElement {};
  (global as any).CanvasRenderingContext2D = class CanvasRenderingContext2D {};
  (global as any).ImageData = class ImageData {};
  (global as any).Path2D = class Path2D {};
  (global as any).OffscreenCanvas = class OffscreenCanvas {};
  
  // Mock other PDF.js dependencies
  (global as any).fetch = require('node-fetch');
}

export {};