import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useCallback, useEffect, useRef } from "react";

import { type UseQrReaderHook } from "./types";

import { ChecksumException, NotFoundException } from "@zxing/library";
import { isMediaDevicesSupported } from "./utils";

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
      // Stop ZXing scanning first (it may detach listeners)
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    } catch (err) {
      console.error("Error stopping QR scanner controls:", err);
    }

    try {
      // Stop all media tracks
      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
        streamRef.current = null;
      }
    } catch (err) {
      console.error("Error stopping media stream:", err);
    }

    try {
      // Fully detach from the <video> element (prevents camera staying active)
      const v = videoRef.current;
      if (v) {
        v.pause();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        v.srcObject = null;
        v.removeAttribute("src"); // extra belt-and-suspenders for older browsers
        v.load?.();
      }
    } catch (err) {
      console.error("Error detaching video element:", err);
    }

    // Do NOT touch initializing flags here to avoid races with startStream()
    isInitializedRef.current = false;
  };

  const startStream = useCallback(async () => {
    // Prevent concurrent initialization attempts
    if (isInitializedRef.current || isInitializingRef.current) return;

    if (!isMediaDevicesSupported()) {
      throw new Error("MediaDevices API has no support for your browser.");
    }

    // Clean any leftovers BEFORE we mark initializing
    stopStream();

    isInitializingRef.current = true;

    const MEDIA_TIMEOUT = 15000;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let timedOut = false;

    try {
      let pending: Promise<MediaStream> | null = null;

      if (navigator.mediaDevices?.getUserMedia) {
        const constraints: MediaStreamConstraints = {
          video: video || { facingMode: { ideal: "environment" } },
          audio: false,
        };

        const mediaPromise = navigator.mediaDevices.getUserMedia(constraints);
        pending = mediaPromise;

        const timeoutId = setTimeout(() => {
          timedOut = true;
        }, MEDIA_TIMEOUT);
        try {
          const winner = await Promise.race([
            mediaPromise,
            new Promise<never>((_, reject) =>
              setTimeout(
                () =>
                  reject(
                    new Error(
                      `getUserMedia timeout after ${MEDIA_TIMEOUT / 1000}s`
                    )
                  ),
                MEDIA_TIMEOUT
              )
            ),
          ]);
          clearTimeout(timeoutId);
          streamRef.current = winner;
        } catch (e) {
          // If gUM eventually resolves after timeout, stop it immediately
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          if (pending) {
            pending
              .then((s) =>
                s.getTracks().forEach((t) => {
                  try {
                    t.stop();
                  } catch {}
                })
              )
              .catch(() => {});
          }
          throw e;
        }
      }

      if (!streamRef.current || !videoRef.current) {
        throw new Error("No stream or video element available.");
      }

      // Attach stream to video element for iOS autoplay quirks
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.playsInline = true;
      await videoRef.current.play().catch(() => {
        /* ignore */
      });

      const codeReader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts,
      });

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
          if (
            error &&
            !(error instanceof NotFoundException) &&
            !(error instanceof ChecksumException)
          ) {
            console.error("QR Reader decoding error:", error);
            onResult(null, error);
          }
        }
      );

      isInitializedRef.current = true;
    } catch (error) {
      stopStream(); // best-effort cleanup on failure
      throw error;
    } finally {
      isInitializingRef.current = false;
    }
  }, [delayBetweenScanAttempts, video, onResult]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        if (mounted) await startStream();
      } catch (error) {
        if (mounted) {
          console.error("QR Reader initialization error:", error);
          onResult(
            null,
            error instanceof Error ? error : new Error(String(error))
          );
        }
      }
    };

    void initialize();

    // Optional: pause when tab is hidden, resume when visible
    const onVis = () => {
      if (document.hidden) {
        stopStream();
      } else {
        void startStream();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", onVis);
      stopStream();
    };
  }, [startStream]);

  return { videoRef };
};
