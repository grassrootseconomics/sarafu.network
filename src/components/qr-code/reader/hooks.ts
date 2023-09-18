import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useEffect, useRef } from "react";

import { type UseQrReaderHook } from "./types";

import { isMediaDevicesSupported, isValidType } from "./utils";

export const useQrReader: UseQrReaderHook = ({
  scanDelay: delayBetweenScanAttempts,
  constraints: video,
  onResult,
}) => {
  const streamRef = useRef<MediaStream>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls>();

  const startStream = async () => {
    if (!isMediaDevicesSupported()) {
      const message = 'MediaDevices API has no support for your browser."';
      throw new Error(message);
    }

    if (
      streamRef.current === undefined &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    ) {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });
    }

    const codeReader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts,
    });

    if (isValidType(video, "constraints", "object")) {
      controlsRef.current = await codeReader.decodeFromStream(
        streamRef.current!,
        videoRef.current!,
        (result, error, controls) => {
          if (result) {
            controls.stop();
            onResult(result, null);
          }
        }
      );
    }
  };

  useEffect(() => {
    startStream().catch((error) => {
      if (error instanceof Error) {
        onResult(null, error);
      } else {
        onResult(null, new Error(String(error)));
      }
    });
    return () => {
      controlsRef.current?.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { videoRef };
};
