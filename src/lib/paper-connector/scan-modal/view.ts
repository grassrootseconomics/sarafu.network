import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { isValidType } from "~/components/qr-code/reader/utils";

// Function to create a video element for QR code scanning
function createVideoElement(
  stopReadingCallback: () => void
): [HTMLDivElement, HTMLVideoElement] {
  const wrapperDiv = document.createElement("div");
  wrapperDiv.id = "paperscanner-wrapper";
  wrapperDiv.style.cssText =
    "position: fixed; top:0;left:0; height: 100vh; width:100vw; display:flex;z-index:2147483647;justify-content: center;align-items:center;backdrop-filter: blur(10px);";

  const videoElement = document.createElement("video");
  videoElement.id = "paperscanner";
  videoElement.width = 300;
  videoElement.height = 200;
  videoElement.style.borderRadius = "8px";

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "X";
  closeButton.style.cssText =
    "position: absolute; top: 20px; right: 20px; background: #fff; border: none; border-radius: 50%; font-size: 1.2em; cursor: pointer;";
  closeButton.onclick = () => {
    document.body.removeChild(wrapperDiv);
    stopReadingCallback();
  };

  // Add event listener for escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.body.removeChild(wrapperDiv);
      stopReadingCallback();
    }
  });

  wrapperDiv.appendChild(videoElement);
  wrapperDiv.appendChild(closeButton);
  document.body.appendChild(wrapperDiv);

  return [wrapperDiv, videoElement];
}

export async function createAccountScannerModal() {
  const scanAttemptDelay = 300;
  const qrCodeReader = new BrowserQRCodeReader(undefined, {
    delayBetweenScanAttempts: scanAttemptDelay,
  });

  let scannerControls: IScannerControls | null = null;
  const [wrapper, video] = createVideoElement(() => {
    if (scannerControls) {
      scannerControls.stop();
    }
  });

  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });

    if (isValidType(video, "constraints", "object") && video) {
      const readingPromise = new Promise<string>((resolve) => {
        qrCodeReader
          .decodeFromStream(mediaStream, video, (result, error, controls) => {
            scannerControls = controls;
            if (result) {
              scannerControls.stop();
              resolve(result.getText());
            }
          })
          .catch((error) => {
            console.error("Error reading QR code:", error);
            cleanupVideoAndWrapper(video, wrapper);
          });
      });

      const qrCodeText = await readingPromise;
      cleanupVideoAndWrapper(video, wrapper);
      return qrCodeText;
    }
  } catch (error) {
    console.error("Error reading QR code:", error);
    cleanupVideoAndWrapper(video, wrapper);
  }
}

function cleanupVideoAndWrapper(
  video: HTMLVideoElement,
  wrapper: HTMLDivElement
) {
  video.remove();
  wrapper.remove();
}
