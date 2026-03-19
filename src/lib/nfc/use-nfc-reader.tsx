"use client";

import { useCallback, useEffect, useMemo } from "react";
import { nfcService } from "./nfc-service";

type UseNFCProps = {
  onReadingSuccess?: (data: string) => void;
  onReadingError?: (error: string) => void;
  onReadingMessage?: (message: string) => void;
};

export function useNFCReader({
  onReadingSuccess,
  onReadingError,
  onReadingMessage,
}: UseNFCProps = {}) {
  const stopReading = useCallback(() => {
    nfcService.stopReading();
  }, []);

  useEffect(() => {
    const isSupported = nfcService.isNFCSupported();
    if (!isSupported) return;
    void nfcService.startReading(
      (result) => {
        if (result.success && result.data) {
          if (result.data.trim() === "No readable text data found") {
            onReadingError?.("No readable text data found");
            return;
          }
          onReadingSuccess?.(result.data);
        } else {
          onReadingError?.(result.error || "Unknown error occurred");
        }
      },
      (errorMessage) => {
        onReadingError?.(errorMessage);
      },
      (message) => {
        onReadingMessage?.(message);
      }
    );
    return () => {
      stopReading();
    };
  }, [onReadingError, onReadingMessage, onReadingSuccess, stopReading]);

  const isSupported = useMemo(() => nfcService.isNFCSupported(), []);

  return {
    isSupported,
  };
}
