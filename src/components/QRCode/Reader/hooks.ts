import { BrowserQRCodeReader } from "@zxing/browser";
import { useEffect, useRef } from "react";

import { UseQrReaderHook } from "./types";

import { isMediaDevicesSupported, isValidType } from "./utils";

export const useQrReader: UseQrReaderHook = ({
  scanDelay: delayBetweenScanAttempts,
  constraints: video,
  onResult,
  videoId,
}) => {
  const streamRef = useRef<MediaStream>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const startStream = async () => {
    if (streamRef.current === undefined) {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
      });
    }
    const codeReader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts,
    });

    if (
      !isMediaDevicesSupported() &&
      isValidType(onResult, "onResult", "function")
    ) {
      const message =
        'MediaDevices API has no support for your browser. You can fix this by running "npm i webrtc-adapter"';
      onResult(null, new Error(message));
    }

    if (isValidType(video, "constraints", "object")) {
      try {
        const result = await codeReader.decodeOnceFromStream(
          streamRef.current,
          videoRef.current!
        );

        if (isValidType(onResult, "onResult", "function")) {
          onResult(result, null);
        }
      } catch (error) {
        if (isValidType(onResult, "onResult", "function")) {
          onResult(null, error as Error);
        }
      }
    }
  };

  useEffect(() => {
    startStream();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  return { videoRef };
};
