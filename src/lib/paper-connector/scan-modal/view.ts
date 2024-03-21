import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { isValidType } from "~/components/qr-code/reader/utils";

// Function to create a video element for QR code scanning
function createVideoElement(
  stopReadingCallback: () => void,
  imageCallback: (src: string) => void
): {
  elements: {
    video: HTMLVideoElement;
    wrapper: HTMLDivElement;
    imageInput: HTMLInputElement;
  };
  cleanup: () => void;
} {
  const wrapperDiv = document.createElement("div");
  wrapperDiv.id = "paperscanner-wrapper";
  wrapperDiv.style.cssText =
    "position: fixed; top:0;left:0; height: 100vh; width:100vw; display:flex;z-index:2147483647;justify-content: center;align-items:center;backdrop-filter: blur(10px); flex-direction: column;";

  const videoElement = document.createElement("video");
  videoElement.id = "paperscanner";
  videoElement.width = 300;
  videoElement.height = 200;
  videoElement.style.borderRadius = "8px";

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "X";
  closeButton.style.cssText =
    "position: absolute; top: 20px; right: 20px; background: #fff; border: none; border-radius: 100%; font-size: 1.2em; cursor: pointer; width:1.2em;";
  closeButton.onclick = cleanup;

  function onEscKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      cleanup();
    }
  }
  // Add event listener for escape key
  document.addEventListener("keydown", onEscKeyDown);

  function cleanup() {
    document.removeEventListener("keydown", onEscKeyDown);
    videoElement.remove();
    wrapperDiv.remove();
    imageInput.remove();
    stopReadingCallback();
  }
  // Create a new style element
  const style = document.createElement("style");

  // Add CSS rules to the style element
  style.innerHTML = `
    #fileInput {
      display: none;
    }
    #imageInputLabel {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 2.5rem;
      border: none;
      pointer-events: auto;
      border-radius: calc(var(--radius) - 2px);
      cursor: pointer;
      color: white;
      margin-top: 16px;
      margin-bottom: 16px;
      font-size: 0.875rem;
      line-height: 1.25rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      padding-left: 1rem;
      padding-right: 1rem;
      background-color: hsl(var(--primary));
    }
    #imageInputLabel:hover {
      background-color: hsl(var(--primary) / 0.8);
    }
  `;

  // Append the style element to the head of the document
  document.head.appendChild(style);

  // Create image upload button
  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.id = "fileInput";
  imageInput.name = "fileInput";
  imageInput.accept = "image/*";
  imageInput.onchange = handleImageUpload;

  const imageInputLabel = document.createElement("label");
  imageInputLabel.id = "imageInputLabel";
  imageInputLabel.htmlFor = "fileInput";
  imageInputLabel.textContent = "Select Image";

  function handleImageUpload() {
    if (imageInput.files && imageInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          try {
            imageCallback(e.target.result as string);
          } catch (error) {
            console.error("Error in imageCallback:", error);
          }
        }
      };
      reader.readAsDataURL(imageInput.files[0]);
    }
  }

  wrapperDiv.append(videoElement, imageInput, imageInputLabel, closeButton);
  document.body.appendChild(wrapperDiv);

  return {
    elements: {
      video: videoElement,
      wrapper: wrapperDiv,
      imageInput: imageInput,
    },
    cleanup: cleanup,
  };
}

export function createAccountScannerModal(): Promise<string> {
  return new Promise((resolve, reject) => {
    const scanAttemptDelay = 300;
    const qrCodeReader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts: scanAttemptDelay,
    });

    let scannerControls: IScannerControls | null = null;
    const video = createVideoElement(
      () => {
        if (scannerControls) {
          scannerControls.stop();
        }
      },
      (imageSrc) => {
        qrCodeReader
          .decodeFromImageUrl(imageSrc)
          .then((result) => {
            cleanupVideoAndWrapper();
            resolve(result.getText());
          })
          .catch((error) => {
            console.error("Error reading QR code:", error);
            cleanupVideoAndWrapper();
            reject(error);
          });
      }
    );

    async function startScanning() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (
          isValidType(video.elements.video, "constraints", "object") &&
          video.elements.video
        ) {
          qrCodeReader
            .decodeFromStream(
              mediaStream,
              video.elements.video,
              (result, error, controls) => {
                scannerControls = controls;
                if (result) {
                  cleanupVideoAndWrapper();
                  resolve(result.getText());
                }
              }
            )
            .catch(handleError);
        }
      } catch (error) {
        if ((error as Error)?.name === "NotAllowedError") {
          // User denied camera access permission
          console.error("User denied camera access permission:", error);
        } else if (
          (error as Error)?.message.includes("Requested device not found")
        ) {
          // No camera found
          console.error("No camera found:", error);
        } else {
          handleError(error);
        }
      }
    }

    function handleError(error: unknown) {
      console.error("Error reading QR code:", error);
      cleanupVideoAndWrapper();
      reject(error);
    }

    function cleanupVideoAndWrapper() {
      scannerControls?.stop();
      video.cleanup();
    }
    startScanning().catch(handleError);
  });
}
