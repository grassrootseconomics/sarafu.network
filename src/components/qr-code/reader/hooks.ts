import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useEffect, useRef } from "react";

import { type UseQrReaderHook } from "./types";

import { NotFoundException } from "@zxing/library";
import { isMediaDevicesSupported, isValidType } from "./utils";

export const useQrReader: UseQrReaderHook = ({
  scanDelay: delayBetweenScanAttempts,
  constraints: video,
  onResult,
  videoId: _videoId,
}) => {
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  const stopStream = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    isInitializedRef.current = false;
  };

  const startStream = async () => {
    if (isInitializedRef.current) return;

    if (!isMediaDevicesSupported()) {
      const message = 'MediaDevices API has no support for your browser."';
      throw new Error(message);
    }

    try {
      // Clean up any existing streams
      stopStream();

      isInitializedRef.current = true;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: video || {
            facingMode: "environment",
          },
        });
      }

      if (!streamRef.current || !videoRef.current) return;

      const codeReader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts,
      });

      if (isValidType(video, "constraints", "object")) {
        controlsRef.current = await codeReader.decodeFromStream(
          streamRef.current,
          videoRef.current,
          (result, error, _controls) => {
            if (result) {
              stopStream();
              onResult(result, null);
              return;
            }

            if (error && !(error instanceof NotFoundException)) {
              console.error("QR Reader error:", error);
            }
          }
        );
      }
    } catch (error) {
      isInitializedRef.current = false;
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        if (mounted) {
          await startStream();
        }
      } catch (error) {
        if (mounted) {
          if (error instanceof Error) {
            onResult(null, error);
          } else {
            onResult(null, new Error(String(error)));
          }
        }
      }
    };

    void initialize();

    return () => {
      mounted = false;
      stopStream();
    };
  }, []);

  return { videoRef };
};
