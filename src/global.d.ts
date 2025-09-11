// src/global.d.ts
export {}; // Make this a module

declare global {
  interface Window {
    BarcodeDetector: typeof BarcodeDetector;
  }

  class BarcodeDetector {
    constructor(options?: { formats: string[] });
    static getSupportedFormats(): Promise<string[]>;
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
  }

  interface DetectedBarcode {
    boundingBox: DOMRectReadOnly;
    rawValue: string;
    format: string;
    cornerPoints: Array<{ x: number; y: number }>;
  }
}
