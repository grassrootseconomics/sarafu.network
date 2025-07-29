import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useCallback, useEffect, useRef } from "react";

import { type UseQrReaderHook } from "./types";

import { ChecksumException, NotFoundException } from "@zxing/library";
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
  const isInitializingRef = useRef<boolean>(false);

  const stopStream = () => {
    try {
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    } catch (error) {
      console.error("Error stopping QR scanner controls:", error);
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    } catch (error) {
      console.error("Error stopping media stream:", error);
    }

    isInitializedRef.current = false;
    isInitializingRef.current = false;
  };

  const startStream = useCallback(async () => {
    // Prevent concurrent initialization attempts
    if (isInitializedRef.current || isInitializingRef.current) return;

    if (!isMediaDevicesSupported()) {
      const message = 'MediaDevices API has no support for your browser."';
      throw new Error(message);
    }

    try {
      // Set initialization lock immediately to prevent race conditions
      isInitializingRef.current = true;
      
      // Clean up any existing streams before starting new ones
      stopStream();

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Add configurable timeout to prevent hanging promises
        const MEDIA_TIMEOUT = 15000; // Increased to 15 seconds for better device compatibility
        
        const mediaPromise = navigator.mediaDevices.getUserMedia({
          video: video || {
            facingMode: "environment",
          },
        });
        
        const timeoutPromise = new Promise<MediaStream>((_, reject) => {
          setTimeout(() => reject(new Error(`getUserMedia timeout after ${MEDIA_TIMEOUT / 1000} seconds`)), MEDIA_TIMEOUT);
        });
        
        streamRef.current = await Promise.race([mediaPromise, timeoutPromise]);
      }

      // Set initialized flag only after successful stream acquisition
      isInitializedRef.current = true;

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
              _controls.stop();
              stopStream();
              onResult(result, null);
              return;
            }

            if (error && !(error instanceof NotFoundException) && !(error instanceof ChecksumException)) {
              console.error("QR Reader decoding error:", error);
              // Only report critical errors, not common decode failures
              onResult(null, error);
            }
          }
        );
      }
    } catch (error) {
      isInitializedRef.current = false;
      isInitializingRef.current = false;
      throw error;
    }
  }, [delayBetweenScanAttempts, video, onResult]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        if (mounted) {
          await startStream();
        }
      } catch (error) {
        if (mounted) {
          console.error("QR Reader initialization error:", error);
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
  }, [startStream]);

  return { videoRef };
};
