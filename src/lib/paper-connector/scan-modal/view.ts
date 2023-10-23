import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { isValidType } from "~/components/qr-code/reader/utils";

// Function to create a video element for QR code scanning
function createVideoElement(
  stopReadingCallback: () => void,
  imageCallback: (src: string) => void
): [HTMLDivElement, HTMLVideoElement, HTMLInputElement] {
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
  closeButton.onclick = removeWrapperAndStopReading;

  // Add event listener for escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      removeWrapperAndStopReading();
    }
  });

  function removeWrapperAndStopReading() {
    document.body.removeChild(wrapperDiv);
    stopReadingCallback();
  }
  // Create a new style element
  const style = document.createElement("style");

  // Add CSS rules to the style element
  style.innerHTML = `
   
    #fileInput {
      display: none;
    }
    #fileInputLabel {
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
    #fileInputLabel:hover {
      background-color: hsl(var(--primary) / 0.8);
    }
  `;

  // Append the style element to the head of the document
  document.head.appendChild(style);

  // Create image upload button
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "fileInput";
  fileInput.name = "fileInput";
  fileInput.accept = "image/*";
  fileInput.onchange = handleImageUpload;

  const fileInputLabel = document.createElement("label");
  fileInputLabel.id = "fileInputLabel";
  fileInputLabel.htmlFor = "fileInput";
  fileInputLabel.textContent = "Select Image";

  function handleImageUpload() {
    if (fileInput.files && fileInput.files[0]) {
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
      reader.readAsDataURL(fileInput.files[0]);
    }
  }

  wrapperDiv.append(videoElement, fileInput, fileInputLabel, closeButton);
  document.body.appendChild(wrapperDiv);

  return [wrapperDiv, videoElement, fileInput];
}

export function createAccountScannerModal(): Promise<string> {
  return new Promise((resolve, reject) => {
    const scanAttemptDelay = 300;
    const qrCodeReader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts: scanAttemptDelay,
    });

    let scannerControls: IScannerControls | null = null;
    const [wrapper, video, imageUpload] = createVideoElement(
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

        if (isValidType(video, "constraints", "object") && video) {
          qrCodeReader
            .decodeFromStream(mediaStream, video, (result, error, controls) => {
              scannerControls = controls;
              if (result) {
                scannerControls.stop();
                resolve(result.getText());
              }
            })
            .catch(handleError);
        }
      } catch (error) {
        handleError(error);
      }
    }

    function handleError(error: unknown) {
      console.error("Error reading QR code:", error);
      cleanupVideoAndWrapper();
      reject(error);
    }

    function cleanupVideoAndWrapper() {
      scannerControls?.stop();
      video.remove();
      wrapper.remove();
      imageUpload.remove();
    }

    startScanning().catch(handleError);
  });
}
