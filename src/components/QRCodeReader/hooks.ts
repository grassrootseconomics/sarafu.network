import { BrowserQRCodeReader } from "@zxing/browser";
import { useEffect } from "react";

import { UseQrReaderHook } from "./types";

import { isMediaDevicesSupported, isValidType } from "./utils";

export const useQrReader: UseQrReaderHook = ({
  scanDelay: delayBetweenScanAttempts,
  constraints: video,
  onResult,
  videoId,
}) => {
  useEffect(() => {
    const codeReader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts,
    });

    if (
      !isMediaDevicesSupported() &&
      isValidType(onResult, "onResult", "function")
    ) {
      const message =
        'MediaDevices API has no support for your browser. You can fix this by running "npm i webrtc-adapter"';
      onResult(null, new Error(message), codeReader);
    }

    if (isValidType(video, "constraints", "object")) {
      codeReader
        .decodeOnceFromConstraints({ video }, videoId)
        .then((result) => {
          if (isValidType(onResult, "onResult", "function")) {
            onResult(result, null, codeReader);
          }
        })
        .catch((error: Error) => {
          if (isValidType(onResult, "onResult", "function")) {
            onResult(null, error, codeReader);
          }
        });
    }

    return () => {};
  }, [delayBetweenScanAttempts, onResult, video, videoId]);
};
