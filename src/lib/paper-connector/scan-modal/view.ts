import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

interface ScanModalOptions {
  onResult: (result: string) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

interface ScanModalElements {
  overlay: HTMLDivElement;
  modal: HTMLDivElement;
  video: HTMLVideoElement;
  cleanup: () => void;
}

class ScanModal {
  private elements: ScanModalElements | null = null;
  private scannerControls: IScannerControls | null = null;
  private qrCodeReader: BrowserQRCodeReader;
  private options: ScanModalOptions;

  constructor(options: ScanModalOptions) {
    this.options = options;
    this.qrCodeReader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts: 300,
    });
    try {
      // Improve robustness: focus on QR_CODE and enable TRY_HARDER
      this.qrCodeReader.hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE,
      ]);
      this.qrCodeReader.hints.set(DecodeHintType.TRY_HARDER, true);
    } catch {}
  }

  public show(): void {
    this.createModal();
    this.showInitialOptions();
  }

  private createModal(): void {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 z-[9999999999] bg-black/50 backdrop-blur-sm";

    // Create modal container
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-[9999999999] flex items-center justify-center p-3 sm:p-4 md:p-6";
    modal.innerHTML = this.getModalHTML();

    // Create video element (initially hidden)
    const video = document.createElement("video");
    video.className =
      "hidden w-full max-w-sm h-64 rounded-lg border-2 border-white/20";
    video.autoplay = true;
    video.playsInline = true;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    this.elements = {
      overlay,
      modal,
      video,
      cleanup: () => this.cleanup(),
    };

    this.attachEventListeners();
  }

  private getModalHTML(): string {
    return `
      <div class="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 sm:p-6 border-b bg-gray-50/50">
          <h2 class="text-base sm:text-lg font-semibold text-gray-900 pr-4">Connect Paper Wallet</h2>
          <button 
            id="close-btn" 
            class="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div id="modal-content" class="p-4 sm:p-6 overflow-y-auto">
          <!-- Initial Options -->
          <div id="initial-options" class="space-y-3 sm:space-y-4">
            <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Choose how you'd like to connect your paper wallet:
            </p>
            
            <button 
              id="camera-btn" 
              class="w-full flex items-center justify-start gap-3 sm:gap-4 p-4 sm:p-5 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all min-h-[60px] sm:min-h-[70px] active:scale-[0.98]"
            >
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="text-left flex-grow">
                <div class="font-medium text-gray-900 text-sm sm:text-base">Scan with Camera</div>
                <div class="text-xs sm:text-sm text-gray-500 mt-0.5">Use your device's camera to scan QR code</div>
              </div>
            </button>

            <button 
              id="upload-btn" 
              class="w-full flex items-center justify-start gap-3 sm:gap-4 p-4 sm:p-5 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all min-h-[60px] sm:min-h-[70px] active:scale-[0.98]"
            >
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 sm:w-7 sm:h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div class="text-left flex-grow">
                <div class="font-medium text-gray-900 text-sm sm:text-base">Upload Image</div>
                <div class="text-xs sm:text-sm text-gray-500 mt-0.5">Select an image containing the QR code</div>
              </div>
            </button>
          </div>

          <!-- Camera Scanner -->
          <div id="camera-scanner" class="hidden">
            <div class="space-y-3 sm:space-y-4">
              <div class="relative">
                <div id="video-container" class="w-full h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden aspect-[4/3] max-h-[50vh]">
                  <div id="camera-placeholder" class="text-center p-4">
                    <div class="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p class="text-sm sm:text-base text-gray-600">Starting camera...</p>
                  </div>
                </div>
                
                <!-- Camera Controls -->
                <div class="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <button 
                    id="torch-btn" 
                    class="hidden bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Toggle flashlight"
                  >
                    <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button 
                  id="back-to-options" 
                  class="flex-1 px-4 py-3 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base min-h-[44px]"
                >
                  Back
                </button>
                <button 
                  id="upload-fallback" 
                  class="flex-1 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base min-h-[44px]"
                >
                  Upload Instead
                </button>
              </div>
            </div>
          </div>

          <!-- Permission Denied -->
          <div id="permission-denied" class="hidden text-center space-y-4 sm:space-y-6">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="px-2">
              <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Camera Access Denied</h3>
              <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                We need camera access to scan your QR code. Please enable camera permissions in your browser settings and try again.
              </p>
              <div class="space-y-2 sm:space-y-3">
                <button 
                  id="retry-camera" 
                  class="w-full px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base min-h-[44px]"
                >
                  Try Again
                </button>
                <button 
                  id="use-upload" 
                  class="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base min-h-[44px]"
                >
                  Upload Image Instead
                </button>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div id="error-state" class="hidden text-center space-y-4 sm:space-y-6">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="px-2">
              <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Scan Failed</h3>
              <p id="error-message" class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed"></p>
              <button 
                id="retry-scan" 
                class="w-full px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base min-h-[44px]"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden file input -->
      <input 
        type="file" 
        id="file-input" 
        accept="image/*" 
        class="hidden"
      />
    `;
  }

  private attachEventListeners(): void {
    if (!this.elements) return;

    const { overlay, modal } = this.elements;

    // Close handlers
    overlay.addEventListener("click", () => this.handleCancel());
    modal
      .querySelector("#close-btn")
      ?.addEventListener("click", () => this.handleCancel());

    // Escape key handler
    document.addEventListener("keydown", this.handleKeydown);

    // Option handlers
    modal
      .querySelector("#camera-btn")
      ?.addEventListener("click", () => void this.handleCameraRequest());
    modal
      .querySelector("#upload-btn")
      ?.addEventListener("click", () => this.handleFileUpload());
    modal
      .querySelector("#upload-fallback")
      ?.addEventListener("click", () => this.handleFileUpload());
    modal
      .querySelector("#use-upload")
      ?.addEventListener("click", () => this.handleFileUpload());

    // Navigation handlers
    modal
      .querySelector("#back-to-options")
      ?.addEventListener("click", () => this.showInitialOptions());
    modal
      .querySelector("#retry-camera")
      ?.addEventListener("click", () => void this.handleCameraRequest());
    modal
      .querySelector("#retry-scan")
      ?.addEventListener("click", () => this.showInitialOptions());

    // File input handler
    modal
      .querySelector("#file-input")
      ?.addEventListener("change", this.handleFileSelect);

    // Torch handler
    modal
      .querySelector("#torch-btn")
      ?.addEventListener("click", () => void this.toggleTorch());
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      this.handleCancel();
    }
  };

  private showInitialOptions(): void {
    if (!this.elements) return;

    this.hideAllScreens();
    const initialOptions =
      this.elements.modal.querySelector("#initial-options");
    if (initialOptions) {
      initialOptions.classList.remove("hidden");
    }
  }

  private showCameraScanner(): void {
    if (!this.elements) return;

    this.hideAllScreens();
    const cameraScanner = this.elements.modal.querySelector("#camera-scanner");
    if (cameraScanner) {
      cameraScanner.classList.remove("hidden");
    }
  }

  private showPermissionDenied(): void {
    if (!this.elements) return;

    this.hideAllScreens();
    const permissionDenied =
      this.elements.modal.querySelector("#permission-denied");
    if (permissionDenied) {
      permissionDenied.classList.remove("hidden");
    }
  }

  private showError(message: string): void {
    if (!this.elements) return;

    this.hideAllScreens();
    const errorState = this.elements.modal.querySelector("#error-state");
    const errorMessage = this.elements.modal.querySelector("#error-message");

    if (errorState && errorMessage) {
      errorMessage.textContent = message;
      errorState.classList.remove("hidden");
    }
  }

  private hideAllScreens(): void {
    if (!this.elements) return;

    const screens = [
      "#initial-options",
      "#camera-scanner",
      "#permission-denied",
      "#error-state",
    ];

    screens.forEach((selector) => {
      const element = this.elements!.modal.querySelector(selector);
      if (element) {
        element.classList.add("hidden");
      }
    });
  }

  private async handleCameraRequest(): Promise<void> {
    if (!this.elements) return;

    this.showCameraScanner();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      await this.startCameraScanning(stream);
    } catch (error) {
      this.handleCameraError(error);
    }
  }

  private async startCameraScanning(stream: MediaStream): Promise<void> {
    if (!this.elements) return;

    const videoContainer =
      this.elements.modal.querySelector("#video-container");
    const placeholder = this.elements.modal.querySelector(
      "#camera-placeholder"
    );

    if (!videoContainer || !placeholder) return;

    // Setup video element
    this.elements.video.srcObject = stream;
    this.elements.video.className = "w-full h-full object-cover rounded-lg";

    // Replace placeholder with video
    (placeholder as HTMLElement).style.display = "none";
    videoContainer.appendChild(this.elements.video);

    // Setup torch button if available (disabled for type compatibility)
    // const torchBtn = this.elements.modal.querySelector("#torch-btn");
    // const videoTrack = stream.getVideoTracks()[0];
    // if (videoTrack && (videoTrack.getCapabilities() as any).torch && torchBtn) {
    //   torchBtn.classList.remove("hidden");
    // }

    // Start QR code scanning
    try {
      this.scannerControls = await this.qrCodeReader.decodeFromVideoDevice(
        undefined,
        this.elements.video,
        (result, _error) => {
          if (result) {
            this.handleScanResult(result.getText());
          }
        }
      );
    } catch (error) {
      console.error("Camera error:", error);
      // this.handleScanError(error);
    }
  }

  private handleCameraError(error: unknown): void {
    console.error("Camera error:", error);

    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        this.showPermissionDenied();
        return;
      } else if (error.name === "NotFoundError") {
        this.showError(
          "No camera found on this device. Please use the upload option instead."
        );
        return;
      } else if (error.name === "NotSupportedError") {
        this.showError(
          "Camera is not supported on this device. Please use the upload option instead."
        );
        return;
      }
    }

    this.showError(
      "Failed to access camera. Please try uploading an image instead."
    );
  }

  private handleScanError(error: unknown): void {
    console.error("Scan error:", error);
    this.showError(
      "Failed to scan QR code. Please make sure the QR code is clearly visible and try again."
    );
  }

  private handleFileUpload(): void {
    const fileInput = this.elements?.modal.querySelector(
      "#file-input"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  private handleFileSelect = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      if (imageSrc) {
        void this.scanImageFile(imageSrc);
      }
    };
    reader.readAsDataURL(file);
  };

  private async scanImageFile(imageSrc: string): Promise<void> {
    try {
      // Load and downscale large images to improve decoding reliability and avoid memory issues
      const image = await this.loadImage(imageSrc);
      const canvas = this.createDownscaledCanvas(image, 1000);

      // Primary attempt: ZXing on downscaled canvas
      try {
        const result = this.qrCodeReader.decodeFromCanvas(canvas);
        this.handleScanResult(result.getText());
        return;
      } catch (error) {
        console.error("Image file error:", error);
      }
      // Fallback: Native BarcodeDetector (often handles inverted/low-contrast better)
      try {
        if ("BarcodeDetector" in window) {
          const supported = await window.BarcodeDetector.getSupportedFormats();
          if (supported && supported.includes("qr_code")) {
            const detector = new window.BarcodeDetector({
              formats: ["qr_code"],
            });
            const results = await detector.detect(canvas);
            if (
              Array.isArray(results) &&
              results.length &&
              results[0]?.rawValue
            ) {
              this.handleScanResult(results[0].rawValue);
              return;
            }
          }
        }
      } catch {}
      // Final fallback: let ZXing try the original URL source
      const result = await this.qrCodeReader.decodeFromImageUrl(imageSrc);
      this.handleScanResult(result.getText());
    } catch (error) {
      console.error("Image file error:", error);
      this.showError(
        "No QR code found in the selected image. Please try a different image."
      );
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load error"));
      img.src = src;
    });
  }

  private createDownscaledCanvas(
    image: HTMLImageElement,
    maxDimension = 1000
  ): HTMLCanvasElement {
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const largestSide = Math.max(sourceWidth, sourceHeight);
    const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return canvas;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
  }

  private toggleTorch(): void {
    // Torch functionality disabled for type compatibility
    // Modern browsers support this but TypeScript definitions may not be up to date
    console.log("Torch functionality currently disabled");
  }

  private handleScanResult(result: string): void {
    this.cleanup();
    this.options.onResult(result);
  }

  private handleCancel(): void {
    this.cleanup();
    this.options.onCancel();
  }

  private cleanup(): void {
    // Stop scanner
    if (this.scannerControls) {
      this.scannerControls.stop();
      this.scannerControls = null;
    }

    // Stop video stream
    if (this.elements?.video.srcObject) {
      const stream = this.elements.video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    // Remove event listeners
    document.removeEventListener("keydown", this.handleKeydown);

    // Remove DOM elements
    if (this.elements) {
      this.elements.overlay.remove();
      this.elements.modal.remove();
      this.elements = null;
    }

    // Restore body scroll
    document.body.style.overflow = "";
  }
}

export function createAccountScannerModal(): Promise<string> {
  return new Promise((resolve, reject) => {
    const modal = new ScanModal({
      onResult: (result) => resolve(result),
      onError: (error) => reject(error),
      onCancel: () => reject(new Error("QR code scanning cancelled")),
    });

    modal.show();
  });
}
